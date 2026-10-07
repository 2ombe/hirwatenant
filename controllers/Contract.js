const Contract = require("../models/Contract");
const Property = require("../models/Property");
const moment = require("moment");
const fs = require("fs");
const pdf = require("html-pdf");
const photo = "./photo/logo1.jpeg";
const photoMineType = "image/jpeg";

const createContract = async (req, res) => {
  try {
    const { propertyId, durationMonths = 12 } = req.body;

    const property = await Property.findById(propertyId);

    if (!property)
      return res.status(404).json({ message: "Property not found." });

    const startDate = new Date();
    const months = Number(durationMonths) || 12;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    const newContract = new Contract({
      property: propertyId,
      landlord: property.createdBy,
      tenant: property.isTakenBy || req.user.id,
      startDate: startDate,
      endDate: endDate,
      monthlyRent: property.monthlyRent,
      depositAmount: property.depositAmount || property.monthlyRent,
      currency: property.currency || "RWF",
      status: "pending",
    });

    await newContract.save();

    res.status(201).json({
      message: "Tenancy contract generated successfully.",
      contract: newContract,
    });
  } catch (error) {
    console.error("Error creating contract:", error);
    res.status(500).json({ message: "Server error creating contract." });
  }
};

const signContract = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const contract = await Contract.findById(id);
    if (!contract) return res.status(404).json({ message: "Contract not found." });

    let updated = false;

    if (contract.tenant.toString() === userId.toString()) {
      contract.tenantSigned = true;
      contract.tenantSignedAt = new Date();
      contract.digitalSignatureLog = contract.digitalSignatureLog || {};
      contract.digitalSignatureLog.tenantSignedIp = clientIp;
      updated = true;
    } else if (contract.landlord.toString() === userId.toString()) {
      contract.landlordSigned = true;
      contract.landlordSignedAt = new Date();
      contract.digitalSignatureLog = contract.digitalSignatureLog || {};
      contract.digitalSignatureLog.landlordSignedIp = clientIp;
      updated = true;
    } else if (req.user.isAdmin) {
      // Admin can sign on behalf if authorized
      contract.landlordSigned = true;
      contract.tenantSigned = true;
      contract.landlordSignedAt = new Date();
      contract.tenantSignedAt = new Date();
      updated = true;
    }

    if (!updated) {
      return res.status(403).json({ message: "You are not a signatory to this contract." });
    }

    // If both parties signed, activate the contract and mark property as taken
    if (contract.tenantSigned && contract.landlordSigned) {
      contract.status = "active";
      await Property.findByIdAndUpdate(contract.property, {
        isTaken: true,
        isTakenBy: contract.tenant,
        availability: "unavailable",
      });
    }

    await contract.save();

    res.status(200).json({
      message: "Contract signed successfully.",
      contract,
    });
  } catch (error) {
    console.error("Error signing contract:", error);
    res.status(500).json({ message: "Server error signing contract." });
  }
};

const getContractsByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const contracts = await Contract.find({ property: propertyId })
      .populate("landlord", "firstName lastName email")
      .populate("tenant", "firstName lastName email")
      .populate("property", "propertyName location");

    res.status(200).json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const terminateContract = async (req, res) => {
  try {
    const { contractId } = req.params;

    const contract = await Contract.findById(contractId);
    if (!contract)
      return res.status(404).json({ message: "Contract not found." });

    contract.status = "terminated";

    const property = await Property.findById(contract.property);
    property.isTaken = false;
    await property.save();

    await contract.save();
    res
      .status(200)
      .json({ message: "Contract terminated successfully.", contract });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};
const getLandlordContracts = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const contracts = await Contract.find({ landlord: landlordId }).populate(
      "property tenant landlord"
    );
    res.status(200).json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch landlord contracts." });
  }
};
const getTenantContracts = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const contracts = await Contract.find({ tenant: tenantId }).populate(
      "property tenant landlord"
    );
    res.status(200).json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tenant contracts." });
  }
};

const getContractsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["pending", "active", "terminated"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const contracts = await Contract.find({ status }).populate(
      "property tenant landlord"
    );
    res.status(200).json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch contracts by status." });
  }
};
const getPendingContractsByLandlord = async (req, res) => {
  try {
    const landlordId = req.user.id;

    const contracts = await Contract.find({
      landlord: landlordId,
      status: "pending",
    }).populate("property tenant landlord");

    res.status(200).json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pending contracts." });
  }
};
const getPendingContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({
      status: "pending",
    }).populate("property tenant landlord");

    res.status(200).json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pending contracts." });
  }
};

const getPendingContractsByTenant = async (req, res) => {
  try {
    const tenant = req.user.id;

    const contracts = await Contract.find({
      tenant: tenant,
      status: "pending",
    }).populate("property tenant landlord");

    res.status(200).json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pending contracts." });
  }
};
const getActiveContractsByLandlord = async (req, res) => {
  try {
    const landlordId = req.user.id;

    const contracts = await Contract.find({
      landlord: landlordId,
      status: "active",
    }).populate("property tenant landlord");

    res.status(200).json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch active contracts." });
  }
};
const getTenantContractsByActive = async (req, res) => {
  try {
    const tenant = req.user.id;

    const contracts = await Contract.find({
      tenant: tenant,
      status: "active",
    }).populate("property tenant landlord");

    res.status(200).json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch active contracts." });
  }
};
const getActiveContract = async (req, res) => {
  try {
    const contracts = await Contract.find({
      status: "active",
    }).populate("property tenant landlord");

    res.status(200).json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch active contracts." });
  }
};
const getTerminatedContractsByLandlord = async (req, res) => {
  try {
    const landlordId = req.user.id;

    const contracts = await Contract.find({
      landlord: landlordId,
      status: "terminated",
    }).populate("property tenant landlord");

    res.status(200).json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch terminated contracts." });
  }
};

const downloadContract = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findById(id)
      .populate("property")
      .populate("landlord")
      .populate("tenant");

    if (!contract) {
      return res.status(404).send("Contract not found");
    }

    const { property, landlord, tenant, startDate, endDate, securityDeposit } =
      contract;

    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              color: #333;
            }
            .container {
              width: 90%;
              margin: 20px auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .content {
              margin-top: 20px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .info-table th, .info-table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            .info-table th {
              background-color: #f2f2f2;
            }
            .terms-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .terms-table th, .terms-table td {
              border: 1px solid #000;
              padding: 8px;
              vertical-align: top;
              width: 50%;
            }
            .terms-table th {
              background-color: #f2f2f2;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 14px;
            }
            .divider {
              border-top: 1px solid #000;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>REVISED CONTRACT FOR RLTM</h1>
            </div>
            
            <div class="content">
              <div class="section-title">1. LANDLORD AND TENANT INFORMATION</div>
              <table class="info-table">
                <thead>
                  <tr>
                    <th>Landlord names:</th>
                    <th>Tenant names:</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${landlord.firstName} ${landlord.lastName}</td>
                    <td>${tenant.firstName} ${tenant.lastName}</td>
                  </tr>
                </tbody>
                <thead>
                  <tr>
                    <th>Landlord address:</th>
                    <th>Tenant address:</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${landlord.address || "N/A"}</td>
                    <td>${tenant.address || "N/A"}</td>
                  </tr>
                </tbody>
                <thead>
                  <tr>
                    <th>Landlord city, State, Zip code:</th>
                    <th>Tenant city, State, Zip code:</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${landlord.city || "N/A"}</td>
                    <td>${tenant.city || "N/A"}</td>
                  </tr>
                </tbody>
                <thead>
                  <tr>
                    <th>Landlord phone:</th>
                    <th>Tenant phone:</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${landlord.phone_number}</td>
                    <td>${tenant.phone_number}</td>
                  </tr>
                </tbody>
                <thead>
                  <tr>
                    <th>Landlord email:</th>
                    <th>Tenant email:</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${landlord.email}</td>
                    <td>${tenant.email}</td>
                  </tr>
                </tbody>
                <thead>
                  <tr>
                    <th>Landlord national id:</th>
                    <th>Tenant national id:</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${landlord.nationalId || "N/A"}</td>
                    <td>${tenant.nationalId || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="content">
              <div class="section-title">2. PROPERTY INFORMATION</div>
              <table class="info-table">
                <thead>
                  <tr>
                    <th>Property name:</th>
                    <th>Address of the property:</th>
                    <th>Type of rent:</th>
                    <th>Amount/Month:</th>
                    <th>Currency:</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${property.propertyName}</td>
                    <td>${property.location}</td>
                    <td>${property.propertyType}</td>
                    <td>${property.price}</td>
                    <td>${property.currency || "Rwf"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="content">
              <div class="section-title">3. CONTRACT DURATION / LEASE TERM</div>
              <table class="info-table">
                <thead>
                  <tr>
                    <th>Lent start date:</th>
                    <th>Lent end date:</th>
                    <th>Payment due date:</th>
                    <th>Termination notification:</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${new Date(startDate).toLocaleDateString()}</td>
                    <td>${new Date(endDate).toLocaleDateString()}</td>
                    <td>End of each month</td>
                    <td>1 month</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="content">
              <div class="section-title">4. BANK INFORMATION FOR THE LANDLORD</div>
              <table class="info-table">
                <thead>
                  <tr>
                    <th>Bank name:</th>
                    <th>Account number:</th>
                    <th>Names as per account:</th>
                    <th>Account currency:</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Bank of Kigali</td>
                    <td>1230986233321</td>
                    <td>${landlord.firstName} ${landlord.lastName}</td>
                    <td>Rwf</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="content">
              <div class="section-title">5. SECURITY DEPOSIT</div>
              <table class="info-table">
                <thead>
                  <tr>
                    <th>Security</th>
                    <th>Security Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      Upon execution of this Agreement, Lessee shall deposit with Lessor the same amount as a security 
                      deposit for the performance of Lessee's obligations under this Agreement. The security deposit is not 
                      an advance payment of rent and shall be returned to Lessee, without interest, after the end of the 
                      lease term, less any deductions for damages or unpaid rent.
                    </td>
                    <td>${securityDeposit || "50,000 Rwf"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="content">
              <div class="section-title">6. TERMS AND CONDITIONS</div>
              <table class="terms-table">
                <tr>
                  <th>6.1 UTILITIES</th>
                  <th>6.2 MAINTENANCE AND REPAIRS</th>
                </tr>
                <tr>
                  <td>
                    Lessee shall be responsible for arranging for and paying for all utility services required 
                    on the Premises, including but not limited to electricity, gas, water, sewage, garbage disposal.
                  </td>
                  <td>
                    Lessee shall, at Lessee's expense, keep and maintain the Premises and appurtenances in 
                    good and sanitary condition.
                  </td>
                </tr>
                <tr>
                  <th>6.3 ALTERATIONS AND IMPROVEMENTS</th>
                  <th>6.4 INSPECTION OF PREMISES AND USE OF PREMISES</th>
                </tr>
                <tr>
                  <td>
                    Lessee shall make no alterations to the Premises or construct any building or make other 
                    improvements without the prior written consent of Lessor. All alterations, changes, and/or 
                    improvements built, constructed, or placed on the Premises by Lessee shall, unless otherwise 
                    provided by written agreement between Lessor and Lessee, be and become the property of 
                    Lessor and remain on the Premises at the expiration or earlier termination of this Agreement.
                  </td>
                  <td>
                    Lessor and Lessor's agents shall have the right at all reasonable times during the term of 
                    this Agreement and any renewal thereof to enter the Premises for the purpose of inspecting 
                    the Premises and all buildings and improvements thereon. The House or Building shall be 
                    used and occupied by Lessee during the term of this Agreement as agreed.
                  </td>
                </tr>
                <tr>
                  <th>6.5 INSURANCE</th>
                  <th>6.6 DEFAULT</th>
                </tr>
                <tr>
                  <td>
                    Lessor shall maintain renter's insurance for the duration of the lease term to cover her/his 
                    house. Lessor shall not be liable for any loss or damage to Lessee's personal property or for 
                    any injury or damage to persons or property occurring on the Premises, except as caused by 
                    Lessor's negligence.
                  </td>
                  <td>
                    If Lessee fails to pay the rent or any additional charges when due or fails to perform any 
                    other provision of this Agreement, Lessor may give Lessee written notice of such default. If 
                    Lessee does not cure such default within 15 days after receipt of such notice, Lessor may 
                    terminate this Agreement.
                  </td>
                </tr>
                <tr>
                  <th>6.7 TERMINATION</th>
                  <th>6.8 DISPUTE RESOLUTION</th>
                </tr>
                <tr>
                  <td>
                    Either party may terminate this Agreement by providing written notice to the other party at 
                    least 30 days in advance of the desired termination date. Upon termination, Lessee shall 
                    vacate the Premises, remove all personal belongings, and return the keys to Lessor. The 
                    security deposit, less any allowable deductions, shall be returned to Lessee within 30 days 
                    after the termination date.
                  </td>
                  <td>
                    In the event of any dispute arising out of or in connection with this Agreement, the parties 
                    agree to first attempt to resolve the dispute amicably through good-faith negotiations. If not 
                    solved, the dispute will be raised to Rwanda Landlord and Tenant Management. If the dispute 
                    cannot be resolved through negotiations within 30 days, either party may pursue any available 
                    legal remedies.
                  </td>
                </tr>
                <tr>
                  <th>6.9 GOVERNING LAW</th>
                  <th>6.10 ENTIRE AGREEMENT</th>
                </tr>
                <tr>
                  <td>
                    This Agreement shall be governed, construed, and interpreted by, though, and under the laws 
                    of the State of RWANDA.
                  </td>
                  <td>
                    This Agreement constitutes the entire agreement between the parties and supersedes any 
                    prior understanding or representation of any kind preceding the date of this Agreement. 
                    There are no other promises, conditions, understandings, or other agreements, whether oral 
                    or written, relating to the subject matter of this Agreement.
                  </td>
                </tr>
                <tr>
                  <th colspan="2">6.11 DIGITAL CONTRACT CLAUSE</th>
                </tr>
                <tr>
                  <td colspan="2">
                    Upon agreement and completion of the contract process through the System, both parties agree 
                    that this digital document represents our mutual intentions and will be considered final and 
                    binding. This contract is signed by both parties, Landlord and Tenant, with the management 
                    of RLTM as witness and shall be upheld by law.
                  </td>
                </tr>
              </table>
            </div>

            <div class="footer">
              <div class="divider"></div>
              <p>END</p>
            </div>
          </div>
        </body>
      </html>
    `;

    pdf.create(html, { format: "A4" }).toStream((err, stream) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Failed to generate PDF");
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=contract_${id}.pdf`
      );
      stream.pipe(res);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};
module.exports = { downloadContract };

module.exports = {
  getLandlordContracts,
  getTenantContracts,
  getContractsByStatus,
  createContract,
  getContractsByProperty,
  terminateContract,
  getPendingContractsByLandlord,
  getActiveContractsByLandlord,
  getTerminatedContractsByLandlord,
  downloadContract,
  getPendingContractsByTenant,
  getTenantContractsByActive,
  getPendingContracts,
  getActiveContract,
  signContract,
};
