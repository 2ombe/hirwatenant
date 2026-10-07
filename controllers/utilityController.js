const UtilityBill = require("../models/UtilityBill");
const Property = require("../models/Property");

// 1. Record Monthly Compound Meter Reading & Compute Split
const recordUtilityBill = async (req, res) => {
  try {
    const {
      propertyId,
      utilityType, // "wasac_water", "eucl_cashpower", "compound_security", "cleaning_sanitation"
      billingMonthYear, // e.g. "10-2026"
      meterNumber,
      previousMeterReading = 0,
      currentMeterReading = 0,
      unitTariffRwf = 350, // default RWF per m3 or kWh
      totalBillAmountRwf,
      meterPhotoUrl,
      splitMethod = "equal_split", // "equal_split", "per_headcount", "sub_meter_units"
      tenantUnits = [], // [{ tenantId, contractId, unitIdentifier, headcount, subMeterPrevious, subMeterCurrent }]
    } = req.body;

    const landlordId = req.user.id;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found." });

    const unitsConsumed = Math.max(0, Number(currentMeterReading) - Number(previousMeterReading));
    const calculatedTotalBill =
      totalBillAmountRwf !== undefined
        ? Number(totalBillAmountRwf)
        : unitsConsumed * Number(unitTariffRwf);

    // Compute splits across tenants
    let tenantShares = [];
    const unitCount = tenantUnits.length || 1;

    if (splitMethod === "equal_split") {
      const sharePerUnit = Math.round(calculatedTotalBill / unitCount);
      tenantShares = tenantUnits.map((u) => ({
        tenant: u.tenantId,
        contract: u.contractId || undefined,
        unitIdentifier: u.unitIdentifier || "Main Unit",
        headcount: u.headcount || 1,
        calculatedShareRwf: sharePerUnit,
        paymentStatus: "pending",
      }));
    } else if (splitMethod === "per_headcount") {
      const totalHeadcount = tenantUnits.reduce((acc, curr) => acc + (curr.headcount || 1), 0) || 1;
      tenantShares = tenantUnits.map((u) => {
        const hc = u.headcount || 1;
        const share = Math.round((calculatedTotalBill * hc) / totalHeadcount);
        return {
          tenant: u.tenantId,
          contract: u.contractId || undefined,
          unitIdentifier: u.unitIdentifier,
          headcount: hc,
          calculatedShareRwf: share,
          paymentStatus: "pending",
        };
      });
    } else if (splitMethod === "sub_meter_units") {
      const totalSubUnits = tenantUnits.reduce((acc, curr) => {
        const consumed = Math.max(0, (curr.subMeterCurrent || 0) - (curr.subMeterPrevious || 0));
        return acc + consumed;
      }, 0) || 1;

      tenantShares = tenantUnits.map((u) => {
        const subConsumed = Math.max(0, (u.subMeterCurrent || 0) - (u.subMeterPrevious || 0));
        const share = Math.round((calculatedTotalBill * subConsumed) / totalSubUnits);
        return {
          tenant: u.tenantId,
          contract: u.contractId || undefined,
          unitIdentifier: u.unitIdentifier,
          headcount: u.headcount || 1,
          subMeterReadingPrevious: u.subMeterPrevious || 0,
          subMeterReadingCurrent: u.subMeterCurrent || 0,
          consumptionUnits: subConsumed,
          calculatedShareRwf: share,
          paymentStatus: "pending",
        };
      });
    }

    const bill = new UtilityBill({
      property: propertyId,
      landlord: landlordId,
      utilityType,
      billingMonthYear,
      meterNumber: meterNumber || (utilityType === "wasac_water" ? property.wasacWaterMeterNumber : property.cashPowerMeterNumber),
      previousMeterReading,
      currentMeterReading,
      totalUnitsConsumed: unitsConsumed,
      unitTariffRwf,
      totalBillAmountRwf: calculatedTotalBill,
      meterPhotoUrl: meterPhotoUrl || "",
      splitMethod,
      tenantShares,
      billStatus: "issued_to_tenants",
    });

    await bill.save();

    res.status(201).json({
      message: `Utility bill for ${billingMonthYear} registered and split among ${tenantShares.length} unit(s).`,
      bill,
    });
  } catch (error) {
    console.error("Error creating utility bill:", error);
    res.status(500).json({ message: "Server error creating utility bill." });
  }
};

// 2. Fetch Utility Bills for a Property
const getPropertyUtilityBills = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const bills = await UtilityBill.find({ property: propertyId })
      .populate("property", "propertyName upiNumber location")
      .populate("tenantShares.tenant", "firstName lastName email phone_number")
      .sort({ createdAt: -1 });

    res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching property utility bills:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// 3. Fetch Tenant Specific Utility Invoices
const getTenantUtilityInvoices = async (req, res) => {
  try {
    const tenantId = req.user.id;

    const bills = await UtilityBill.find({ "tenantShares.tenant": tenantId })
      .populate("property", "propertyName location upiNumber district sector")
      .populate("landlord", "firstName lastName phone_number email")
      .sort({ createdAt: -1 });

    // Format output specifically tailored to the requesting tenant
    const formatted = bills.map((b) => {
      const myShare = b.tenantShares.find(
        (s) => s.tenant && s.tenant.toString() === tenantId.toString()
      );
      return {
        billId: b._id,
        reference: b.billReference,
        property: b.property,
        landlord: b.landlord,
        utilityType: b.utilityType,
        billingMonthYear: b.billingMonthYear,
        meterNumber: b.meterNumber,
        meterPhotoUrl: b.meterPhotoUrl,
        totalCompoundBillRwf: b.totalBillAmountRwf,
        splitMethod: b.splitMethod,
        myShareDetails: myShare || {},
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching tenant utility invoices:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// 4. Pay Tenant Utility Share via MoMo
const payUtilityShare = async (req, res) => {
  try {
    const { billId } = req.params;
    const tenantId = req.user.id;
    const { momoTransactionId } = req.body;

    const bill = await UtilityBill.findById(billId);
    if (!bill) return res.status(404).json({ message: "Utility bill not found." });

    const shareIndex = bill.tenantShares.findIndex(
      (s) => s.tenant && s.tenant.toString() === tenantId.toString()
    );

    if (shareIndex === -1) {
      return res.status(404).json({ message: "No utility share found for this tenant." });
    }

    bill.tenantShares[shareIndex].paymentStatus = "paid_via_momo";
    bill.tenantShares[shareIndex].paidAt = new Date();
    bill.tenantShares[shareIndex].momoTransactionId =
      momoTransactionId || `MOMO-UT-${Date.now().toString().slice(-8)}`;

    // Check if all shares are paid
    const allPaid = bill.tenantShares.every((s) => s.paymentStatus === "paid_via_momo");
    if (allPaid) {
      bill.billStatus = "settled_in_full";
    } else {
      bill.billStatus = "partially_paid";
    }

    await bill.save();

    res.status(200).json({
      message: "Utility bill payment recorded successfully.",
      bill,
    });
  } catch (error) {
    console.error("Error paying utility share:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  recordUtilityBill,
  getPropertyUtilityBills,
  getTenantUtilityInvoices,
  payUtilityShare,
};
