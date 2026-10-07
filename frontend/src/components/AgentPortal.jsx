import React, { useState } from "react";

const mockCommissions = [
  {
    _id: "com-1",
    commissionCode: "COM-829104-RW",
    property: {
      propertyName: "Kimironko Modern Apartments - 2B",
      upiNumber: "1/02/03/05/2011",
      location: "Kimironko, Gasabo",
    },
    landlord: {
      firstName: "Alexis",
      lastName: "Kagame",
      phone_number: "0788223344",
    },
    monthlyRentRwf: 300000,
    agreedCommissionRatePercent: 10,
    agreedCommissionAmountRwf: 30000,
    agentMomoPhone: "0785112233",
    payoutStatus: "paid_via_momo",
    momoTransactionRef: "MOMO-RW-99482104",
    createdAt: "2026-10-02",
  },
  {
    _id: "com-2",
    commissionCode: "COM-829105-RW",
    property: {
      propertyName: "Kicukiro Villa (4 Bedrooms)",
      upiNumber: "1/03/07/01/1044",
      location: "Niboye, Kicukiro",
    },
    landlord: {
      firstName: "Beata",
      lastName: "Mukamana",
      phone_number: "0788334455",
    },
    monthlyRentRwf: 650000,
    agreedCommissionRatePercent: 10,
    agreedCommissionAmountRwf: 65000,
    agentMomoPhone: "0785112233",
    payoutStatus: "pending_lease_activation",
    createdAt: "2026-10-06",
  },
];

export default function AgentPortal() {
  const [commissions, setCommissions] = useState(mockCommissions);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [newAgreement, setNewAgreement] = useState({
    propertyName: "Remera Heights - Flat 12",
    monthlyRent: 400000,
    ratePercent: 10,
    agentPhone: "0785112233",
  });

  const totalEarned = commissions
    .filter((c) => c.payoutStatus === "paid_via_momo")
    .reduce((sum, c) => sum + c.agreedCommissionAmountRwf, 0);

  const pendingEarned = commissions
    .filter((c) => c.payoutStatus === "pending_lease_activation")
    .reduce((sum, c) => sum + c.agreedCommissionAmountRwf, 0);

  const handleCreateAgreement = (e) => {
    e.preventDefault();
    const amount = Math.round((Number(newAgreement.monthlyRent) * Number(newAgreement.ratePercent)) / 100);
    const item = {
      _id: `com-${Date.now()}`,
      commissionCode: `COM-${Date.now().toString().slice(-6)}-RW`,
      property: {
        propertyName: newAgreement.propertyName,
        upiNumber: "1/02/04/09/3021",
        location: "Remera, Gasabo",
      },
      landlord: {
        firstName: "Landlord Partner",
        lastName: "",
        phone_number: "0788998877",
      },
      monthlyRentRwf: Number(newAgreement.monthlyRent),
      agreedCommissionRatePercent: Number(newAgreement.ratePercent),
      agreedCommissionAmountRwf: amount,
      agentMomoPhone: newAgreement.agentPhone,
      payoutStatus: "pending_lease_activation",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setCommissions([item, ...commissions]);
    setShowAgreementModal(false);
  };

  const handleSimulatePayout = (id) => {
    setCommissions(
      commissions.map((c) =>
        c._id === id
          ? {
              ...c,
              payoutStatus: "paid_via_momo",
              momoTransactionRef: `MOMO-RW-${Date.now().toString().slice(-8)}`,
            }
          : c
      )
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner: Formalized Rwandan Agent Profile */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-bold shadow-md">
            🤝
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold">Hirwa Certified Agent Network</h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-semibold flex items-center gap-1">
                ✓ Umukomisiyoneri w'Umwuga
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Standardized broker commissions (Rwandan Tenancy Standard capped at 10%), transparent contracts, & direct MoMo payouts.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAgreementModal(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-xs transition shadow-md"
        >
          + Register New Commission Agreement
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 uppercase font-semibold">Total Paid to MoMo</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {totalEarned.toLocaleString()} RWF
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Instant disbursements upon lease activation</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 uppercase font-semibold">Pending Escrow Payouts</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {pendingEarned.toLocaleString()} RWF
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Releases automatically when tenant pays rent</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 uppercase font-semibold">Regulated Fee Cap</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">10% Standard</div>
          <div className="text-[11px] text-slate-400 mt-1">Protects tenants from arbitrary extortion</div>
        </div>
      </div>

      {/* Commissions Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Commission Deals & Listings</h2>
            <p className="text-xs text-slate-500">Official log of brokered rental contracts</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-mono">
            {commissions.length} Agreements Registered
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {commissions.map((item) => (
            <div key={item._id} className="p-5 flex flex-wrap justify-between items-center gap-4 hover:bg-slate-50/50 transition">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">{item.property.propertyName}</span>
                  <span className="text-xs text-slate-400 font-mono">({item.commissionCode})</span>
                </div>
                <div className="text-xs text-slate-600">
                  Landlord: <strong>{item.landlord.firstName} {item.landlord.lastName}</strong> • UPI: <span className="font-mono text-[11px]">{item.property.upiNumber}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Monthly Rent: {item.monthlyRentRwf.toLocaleString()} RWF • Commission:{" "}
                  <strong className="text-indigo-700 font-semibold">{item.agreedCommissionAmountRwf.toLocaleString()} RWF ({item.agreedCommissionRatePercent}%)</strong>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {item.payoutStatus === "paid_via_momo" ? (
                  <div className="text-right">
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold">
                      ✓ Paid via MoMo
                    </span>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {item.momoTransactionRef}
                    </div>
                  </div>
                ) : (
                  <div className="text-right space-y-1">
                    <span className="inline-block bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-semibold">
                      ⏳ Pending Move-In
                    </span>
                    <div>
                      <button
                        onClick={() => handleSimulatePayout(item._id)}
                        className="text-[11px] text-blue-600 font-bold hover:underline"
                      >
                        Authorize MoMo Payout →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: CREATE AGREEMENT */}
      {showAgreementModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">New Broker Commission Agreement</h3>
            <p className="text-xs text-slate-500">
              Formally link an authorized agent (*Umu-komisiyoneri*) to a property listing with an agreed fee cap.
            </p>

            <form onSubmit={handleCreateAgreement} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Property Listing Name</label>
                <input
                  type="text"
                  value={newAgreement.propertyName}
                  onChange={(e) => setNewAgreement({ ...newAgreement, propertyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Rent (RWF)</label>
                  <input
                    type="number"
                    value={newAgreement.monthlyRent}
                    onChange={(e) => setNewAgreement({ ...newAgreement, monthlyRent: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    value={newAgreement.ratePercent}
                    onChange={(e) => setNewAgreement({ ...newAgreement, ratePercent: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agent MTN MoMo Phone</label>
                <input
                  type="tel"
                  value={newAgreement.agentPhone}
                  onChange={(e) => setNewAgreement({ ...newAgreement, agentPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                  required
                />
              </div>

              <div className="p-3 bg-blue-50 text-blue-900 rounded-lg">
                Calculated Payout:{" "}
                <strong>
                  {Math.round(
                    (Number(newAgreement.monthlyRent) * Number(newAgreement.ratePercent)) / 100
                  ).toLocaleString()}{" "}
                  RWF
                </strong>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAgreementModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800"
                >
                  Confirm Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
