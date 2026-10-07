import React, { useState } from "react";

const initialCompoundUnits = [
  { id: "u1", unitName: "Unit A (Main House)", tenantName: "Jean-Claude M.", headcount: 3, shareRwf: 15750, status: "paid_via_momo" },
  { id: "u2", unitName: "Unit B (Annex Studio)", tenantName: "Sarah K.", headcount: 1, shareRwf: 5250, status: "pending" },
  { id: "u3", unitName: "Unit C (Upstairs Flat)", tenantName: "Eric N.", headcount: 2, shareRwf: 10500, status: "pending" },
];

export default function UtilityMeterSplitter() {
  const [utilityType, setUtilityType] = useState("wasac_water"); // "wasac_water" or "eucl_cashpower"
  const [splitMethod, setSplitMethod] = useState("per_headcount"); // "per_headcount" or "equal_split"
  const [prevReading, setPrevReading] = useState(142);
  const [currentReading, setCurrentReading] = useState(232);
  const [tariff, setTariff] = useState(350); // RWF per m3
  const [units, setUnits] = useState(initialCompoundUnits);
  const [payingUnitId, setPayingUnitId] = useState(null);

  const unitsConsumed = Math.max(0, currentReading - prevReading);
  const totalBillAmount = unitsConsumed * tariff;

  // Recalculate shares when method or readings change
  const handleRecalculate = (method = splitMethod) => {
    setSplitMethod(method);
    if (method === "equal_split") {
      const share = Math.round(totalBillAmount / units.length);
      setUnits(units.map((u) => ({ ...u, shareRwf: share })));
    } else {
      const totalHeadcount = units.reduce((acc, curr) => acc + curr.headcount, 0) || 1;
      setUnits(
        units.map((u) => ({
          ...u,
          shareRwf: Math.round((totalBillAmount * u.headcount) / totalHeadcount),
        }))
      );
    }
  };

  const handleSimulateMoMoPay = (id) => {
    setPayingUnitId(id);
    setTimeout(() => {
      setUnits(
        units.map((u) => (u.id === id ? { ...u, status: "paid_via_momo" } : u))
      );
      setPayingUnitId(null);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-blue-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-600 flex items-center justify-center text-3xl font-bold shadow-md">
            💧
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold">Compound Utility & Sub-Meter Splitter</h1>
              <span className="bg-cyan-400/20 text-cyan-200 text-xs px-2.5 py-0.5 rounded-full border border-cyan-400/40 font-semibold">
                WASAC & EUCL CashPower
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Eliminate compound disputes over shared water and electricity bills with photographic meter proof and fair per-tenant billing.
            </p>
          </div>
        </div>

        {/* Toggle Utility Type */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => {
              setUtilityType("wasac_water");
              setTariff(350);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              utilityType === "wasac_water" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>💧</span>
            <span>WASAC Water</span>
          </button>
          <button
            onClick={() => {
              setUtilityType("eucl_cashpower");
              setTariff(212);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              utilityType === "eucl_cashpower" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>⚡</span>
            <span>EUCL CashPower</span>
          </button>
        </div>
      </div>

      {/* Meter Entry & Calculation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Readings Entry (2 cols) */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-900 text-sm">Monthly Meter Audit & Readings</h2>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
              Meter #{utilityType === "wasac_water" ? "WSC-00491820" : "EUCL-88219412"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Previous Reading ({utilityType === "wasac_water" ? "m³" : "kWh"})</label>
              <input
                type="number"
                value={prevReading}
                onChange={(e) => setPrevReading(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl outline-none font-mono text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Reading ({utilityType === "wasac_water" ? "m³" : "kWh"})</label>
              <input
                type="number"
                value={currentReading}
                onChange={(e) => setCurrentReading(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl outline-none font-mono text-sm text-cyan-700 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">RURA Tariff (RWF/unit)</label>
              <input
                type="number"
                value={tariff}
                onChange={(e) => setTariff(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl outline-none font-mono text-sm"
              />
            </div>
          </div>

          {/* Meter Photo Evidence Attachment */}
          <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📸</span>
              <div>
                <div className="font-bold text-slate-800">Physical Meter Proof Photo Attached</div>
                <div className="text-[11px] text-slate-500">Timestamp: 07-Oct-2026 • Verified by Compound Manager</div>
              </div>
            </div>
            <span className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">
              View Photo ↗
            </span>
          </div>

          {/* Split Strategy Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Split Calculation Formula</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRecalculate("per_headcount")}
                className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  splitMethod === "per_headcount"
                    ? "border-cyan-600 bg-cyan-50 text-cyan-900"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>👥</span>
                <span>Per Headcount (People in unit)</span>
              </button>
              <button
                type="button"
                onClick={() => handleRecalculate("equal_split")}
                className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  splitMethod === "equal_split"
                    ? "border-cyan-600 bg-cyan-50 text-cyan-900"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>⚖️</span>
                <span>Equal Split (Per House/Unit)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Total Bill Card (1 col) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-cyan-300 font-bold">
              Total Compound Invoice
            </span>
            <div className="text-3xl font-extrabold mt-2 text-white">
              {totalBillAmount.toLocaleString()} RWF
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Consumption: <strong className="text-cyan-300">{unitsConsumed} {utilityType === "wasac_water" ? "m³" : "kWh"}</strong>
            </div>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-1.5 my-4">
            <div className="flex justify-between text-slate-300">
              <span>Billing Cycle:</span>
              <span className="font-semibold text-white">October 2026</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Participating Units:</span>
              <span className="font-semibold text-white">{units.length} Units</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Payment Gateway:</span>
              <span className="font-semibold text-amber-400">MTN MoMo Push</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Tamper-proof record protected by Hirwa Tenancy Intermediary.
          </div>
        </div>
      </div>

      {/* Tenant Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Tenant Share Breakdown & Collection Status</h2>
            <p className="text-xs text-slate-500">Each tenant receives an in-app notice and SMS notification to pay their exact split.</p>
          </div>
          <span className="text-xs bg-cyan-50 text-cyan-800 font-semibold px-3 py-1 rounded-full border border-cyan-200">
            Formula: {splitMethod === "per_headcount" ? "By Headcount" : "Equal Shares"}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {units.map((unit) => (
            <div key={unit.id} className="p-5 flex flex-wrap justify-between items-center gap-4 hover:bg-slate-50/50 transition">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">{unit.unitName}</span>
                  <span className="text-xs text-slate-500">• {unit.tenantName}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Occupants: <strong>{unit.headcount} Person(s)</strong> • Calculated Utility Share:{" "}
                  <strong className="text-cyan-800 font-semibold">{unit.shareRwf.toLocaleString()} RWF</strong>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {unit.status === "paid_via_momo" ? (
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-bold">
                    ✓ Paid via MoMo
                  </span>
                ) : (
                  <button
                    disabled={payingUnitId === unit.id}
                    onClick={() => handleSimulateMoMoPay(unit.id)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold rounded-xl text-xs transition shadow-sm"
                  >
                    {payingUnitId === unit.id ? "Sending Prompt..." : `Pay ${unit.shareRwf.toLocaleString()} RWF via MoMo`}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
