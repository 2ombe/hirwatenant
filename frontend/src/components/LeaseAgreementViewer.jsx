import React, { useState } from "react";
import { contractApi } from "../api/apiService";

export default function LeaseAgreementViewer({ contract, currentUserRole = "tenant", onSigned }) {
  const [lang, setLang] = useState("en"); // "en" or "rw" (Kinyarwanda)
  const [signing, setSigning] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);

  if (!contract) {
    return <div className="p-8 text-center text-slate-500">No contract selected.</div>;
  }

  const handleTriggerSign = () => {
    setShowOtpModal(true);
  };

  const handleConfirmSignature = async () => {
    try {
      setSigning(true);
      const res = await contractApi.signContract(contract._id);
      setSignedSuccess(true);
      setShowOtpModal(false);
      if (onSigned) onSigned(res.contract);
    } catch (err) {
      alert("Signing failed: " + err.message);
    } finally {
      setSigning(false);
    }
  };

  const isUserSigned =
    currentUserRole === "tenant" ? contract.tenantSigned : contract.landlordSigned;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-amber-400 text-slate-900 font-bold px-2.5 py-0.5 rounded">
              RWANDA RESIDENTIAL LEASE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Amasezerano y'ubukode
            </span>
          </div>
          <h1 className="text-xl font-bold mt-1">
            {contract.property?.propertyName || "Residential Tenancy Agreement"}
          </h1>
          <p className="text-xs text-slate-400">
            Conforming to Law N° 45/2011 of 25/11/2011 on the Law of Contracts
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              lang === "en" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang("rw")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              lang === "rw" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Kinyarwanda
          </button>
        </div>
      </div>

      {/* Contract Body */}
      <div className="p-8 space-y-6 text-sm text-slate-700 leading-relaxed max-h-[600px] overflow-y-auto">
        {/* Parties Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <div className="font-bold text-slate-900 text-xs uppercase mb-1">
              {lang === "en" ? "1. THE LANDLORD (Nyir'inzu)" : "1. NYIR'INZU (Landlord)"}
            </div>
            <div>{contract.landlord?.firstName} {contract.landlord?.lastName}</div>
            <div className="text-xs text-slate-500 font-mono">NID: {contract.landlord?.nationalId || "Verified by Hirwa"}</div>
            <div className="text-xs text-slate-500">Phone: {contract.landlord?.phone_number || "N/A"}</div>
          </div>
          <div>
            <div className="font-bold text-slate-900 text-xs uppercase mb-1">
              {lang === "en" ? "2. THE TENANT (Umukode)" : "2. UMUKODE (Tenant)"}
            </div>
            <div>{contract.tenant?.firstName} {contract.tenant?.lastName}</div>
            <div className="text-xs text-slate-500 font-mono">NID: {contract.tenant?.nationalId || "Verified by Hirwa"}</div>
            <div className="text-xs text-slate-500">Phone: {contract.tenant?.phone_number || "N/A"}</div>
          </div>
        </div>

        {/* Leased Premises & Parcel UPI */}
        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200">
          <div className="font-bold text-blue-900 text-xs uppercase mb-1">
            {lang === "en" ? "Property Cadastral Details (UPI)" : "Amakuru y'ikibanza n'inzu (UPI)"}
          </div>
          <div>Location: {contract.property?.location || "Kigali, Rwanda"}</div>
          <div className="font-mono text-xs text-blue-800 font-semibold">
            Unique Parcel Identifier (UPI): {contract.property?.upiNumber || "1/02/03/04/..."}
          </div>
        </div>

        {/* Clauses Section */}
        {lang === "en" ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-950 mb-1">Clause 1: Term of Lease</h3>
              <p>
                The lease shall commence on{" "}
                <strong>{new Date(contract.startDate).toLocaleDateString()}</strong> and terminate on{" "}
                <strong>{new Date(contract.endDate).toLocaleDateString()}</strong>.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-950 mb-1">Clause 2: Monthly Rent & Payment Terms</h3>
              <p>
                The agreed rent is{" "}
                <strong className="text-slate-950">
                  {Number(contract.monthlyRent || 0).toLocaleString()} {contract.currency || "RWF"}
                </strong>{" "}
                payable monthly in advance by the 5th day of every calendar month through the Hirwa platform.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-950 mb-1">Clause 3: Security Deposit (Caution Escrow)</h3>
              <p>
                A security deposit of{" "}
                <strong className="text-emerald-700">
                  {Number(contract.depositAmount || 0).toLocaleString()} {contract.currency || "RWF"}
                </strong>{" "}
                shall be held in neutral escrow by Hirwa. Deductions may only be made upon mutual agreement or following an approved inspection report.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-950 mb-1">Clause 4: Dispute Resolution & Legal Jurisdiction</h3>
              <p>
                Any dispute arising from this agreement shall first undergo informal mediation via Hirwa. If unresolved within 14 days, the parties consent to formal submission to the competent Community Mediation Committee (<em>Komite y'Abunzi</em>) or the Rwandan Primary Courts.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-950 mb-1">Ingingo ya 1: Igihe cy'amasezerano</h3>
              <p>
                Aya masezerano atangira ku ya{" "}
                <strong>{new Date(contract.startDate).toLocaleDateString()}</strong> akageza ku ya{" "}
                <strong>{new Date(contract.endDate).toLocaleDateString()}</strong>.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-950 mb-1">Ingingo ya 2: Ubukode n'uburyo bwo kwishyura</h3>
              <p>
                Ubukode bumvikanyweho buri kwezi ni{" "}
                <strong className="text-slate-950">
                  {Number(contract.monthlyRent || 0).toLocaleString()} {contract.currency || "RWF"}
                </strong>{" "}
                yishyurwa bitarenze itariki ya 5 ya buri kwezi binyuze kuri Hirwa.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-950 mb-1">Ingingo ya 3: Ingwate y'inzu (Caution)</h3>
              <p>
                Ingwate ingana na{" "}
                <strong className="text-emerald-700">
                  {Number(contract.depositAmount || 0).toLocaleString()} {contract.currency || "RWF"}
                </strong>{" "}
                izabikwa mu buryo bwizewe na Hirwa (Escrow) kugeza amasezerano arangiye no gusuzuma uko inzu imeze.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-950 mb-1">Ingingo ya 4: Gukemura impaka</h3>
              <p>
                Impaka zose zivutse zizakemurirwa binyuze mu bwunzi bwa Hirwa. Zidacyemutse mu minsi 14, zizashyikirizwa Komite y'Abunzi y'Akagari/Umurenge cyangwa Inkiko z'Ibanze z'u Rwanda.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Signature Status & Sign Button */}
      <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-6 text-xs">
          <div>
            <span className="text-slate-500 block">Landlord Signature:</span>
            <span className={contract.landlordSigned ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"}>
              {contract.landlordSigned ? "✓ Signed & Verified" : "⏳ Pending Signature"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Tenant Signature:</span>
            <span className={contract.tenantSigned ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"}>
              {contract.tenantSigned ? "✓ Signed & Verified" : "⏳ Pending Signature"}
            </span>
          </div>
        </div>

        <div>
          {isUserSigned || signedSuccess ? (
            <div className="px-5 py-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300">
              ✓ You have digitally signed this agreement
            </div>
          ) : (
            <button
              onClick={handleTriggerSign}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow"
            >
              Digitally Sign Lease (OTP) →
            </button>
          )}
        </div>
      </div>

      {/* OTP SMS SIGNING MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Sign Rwandan Tenancy Agreement</h3>
            <p className="text-xs text-slate-500">
              An SMS verification code has been dispatched to your registered phone number to confirm your identity under Rwandan electronic signature rules.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Enter 6-Digit SMS Code</label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-mono py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowOtpModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={signing || otpCode.length < 4}
                onClick={handleConfirmSignature}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg transition"
              >
                {signing ? "Signing..." : "Confirm & Sign Lease"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
