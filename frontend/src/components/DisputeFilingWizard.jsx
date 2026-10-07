import React, { useState } from "react";
import { claimsApi } from "../api/apiService";

const CLAIM_CATEGORIES = [
  {
    id: "repair_neglect",
    label: "Emergency Repairs & Maintenance Neglect",
    kinyarwanda: "Gusana ibyangiritse byihutirwa",
    desc: "Plumbing leaks, electrical hazards, broken locks, or roof damages.",
    icon: "🔧",
  },
  {
    id: "unpaid_rent",
    label: "Rent Arrears / Unpaid Rent",
    kinyarwanda: "Ubukode butarishyuwe",
    desc: "Overdue monthly rent, non-payment, or disputed utility splits.",
    icon: "💳",
  },
  {
    id: "property_damage",
    label: "Tenant Property Damage",
    kinyarwanda: "Kwangiza inzu cyangwa ibikoresho",
    desc: "Damage beyond ordinary wear and tear caused by the tenant.",
    icon: "🏚️",
  },
  {
    id: "deposit_withholding",
    label: "Caution / Security Deposit Withholding",
    kinyarwanda: "Kugumana ingwate (Caution) bidakwiye",
    desc: "Unjustified deductions or failure to refund the move-in caution.",
    icon: "🛡️",
  },
  {
    id: "illegal_eviction",
    label: "Unlawful Eviction Notice",
    kinyarwanda: "Kwirukanwa mu nzu mu buryo bunyuranyije n'amategeko",
    desc: "Eviction without the statutory 30-day notice or legal cause.",
    icon: "⚠️",
  },
  {
    id: "breach_of_terms",
    label: "Breach of Tenancy Lease Agreement",
    kinyarwanda: "Kurenga ku masezerano y'ubukode",
    desc: "Subletting, unauthorized alterations, or failure to respect clauses.",
    icon: "📜",
  },
];

export default function DisputeFilingWizard({ contractId, propertyId, counterpartyEmail, onClaimSubmitted }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    claimType: "repair_neglect",
    priority: "medium",
    amountClaimed: "",
    subject: "",
    message: "",
    desiredResolution: "",
    evidenceUrls: [],
  });

  const [evidenceInput, setEvidenceInput] = useState("");

  const handleAddEvidence = () => {
    if (!evidenceInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      evidenceUrls: [
        ...prev.evidenceUrls,
        {
          url: evidenceInput.trim(),
          fileType: "image",
          title: `Evidence #${prev.evidenceUrls.length + 1}`,
          uploadedAt: new Date(),
        },
      ],
    }));
    setEvidenceInput("");
  };

  const handleRemoveEvidence = (index) => {
    setFormData((prev) => ({
      ...prev,
      evidenceUrls: prev.evidenceUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitClaim = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        contractId,
        propertyId,
        recipientEmail: counterpartyEmail || "legal@hirwa.rw",
        claimType: formData.claimType,
        priority: formData.priority,
        amountClaimed: formData.amountClaimed ? Number(formData.amountClaimed) : 0,
        subject: formData.subject,
        message: formData.message,
        desiredResolution: formData.desiredResolution,
        evidence: formData.evidenceUrls,
      };

      const res = await claimsApi.raiseClaim(payload);
      setSuccess(res.claim);
      if (onClaimSubmitted) onClaimSubmitted(res.claim);
    } catch (err) {
      setError(err.message || "Failed to file claim. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-emerald-100 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Formal Claim Successfully Registered</h2>
        <p className="text-slate-600 mb-4">
          Case Reference: <span className="font-mono font-semibold text-emerald-700">{success.claimReference}</span>
        </p>
        <p className="text-sm text-slate-500 mb-6">
          The counterparty has been formally notified via email and in-app alert. Under Hirwa rules, both parties have 7 days for direct settlement before a licensed mediator steps in.
        </p>
        <div className="bg-slate-50 p-4 rounded-xl text-left text-sm text-slate-700 mb-6 border border-slate-200">
          <div className="font-semibold text-slate-900 mb-1">Summary of Case:</div>
          <div><strong>Subject:</strong> {success.subject}</div>
          <div><strong>Category:</strong> {success.claimType}</div>
          <div><strong>Status:</strong> {success.status}</div>
        </div>
        <button
          onClick={() => {
            setSuccess(null);
            setStep(1);
          }}
          className="px-6 py-2.5 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition"
        >
          File Another Claim
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header & Step Indicator */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Hirwa Tenancy Legal Dispute Center</h2>
          <span className="text-xs bg-blue-800 text-blue-200 px-3 py-1 rounded-full font-semibold">
            Law N° 45/2011 Compliant
          </span>
        </div>
        <div className="flex items-center space-x-3 text-sm">
          {[
            { num: 1, label: "Category" },
            { num: 2, label: "Details" },
            { num: 3, label: "Evidence" },
            { num: 4, label: "Review & File" },
          ].map((s) => (
            <div key={s.num} className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === s.num
                    ? "bg-amber-400 text-slate-900"
                    : step > s.num
                    ? "bg-emerald-500 text-white"
                    : "bg-blue-800 text-blue-300"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span className={step === s.num ? "font-bold text-white" : "text-blue-300 hidden sm:inline"}>
                {s.label}
              </span>
              {s.num < 4 && <span className="text-blue-700">›</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Select Dispute Category</h3>
            <p className="text-sm text-slate-500 mb-5">
              Hitamo icyiciro cy'ikibazo (Choose the nature of the dispute under Rwandan tenancy guidelines):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CLAIM_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setFormData({ ...formData, claimType: cat.id })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    formData.claimType === cat.id
                      ? "border-blue-600 bg-blue-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div>
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div className="font-bold text-slate-900 text-sm">{cat.label}</div>
                    <div className="text-xs text-blue-700 font-medium italic mb-1.5">{cat.kinyarwanda}</div>
                    <div className="text-xs text-slate-500">{cat.desc}</div>
                  </div>
                  <div className="mt-3 flex items-center text-xs font-semibold text-blue-600">
                    {formData.claimType === cat.id ? "✓ Selected" : "Select this category"}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm transition"
              >
                Continue to Case Details →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CASE DETAILS */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Particulars of the Claim</h3>
              <p className="text-sm text-slate-500">Provide clear facts and the financial value claimed in Rwandan Francs (RWF).</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Subject Title *</label>
              <input
                type="text"
                placeholder="e.g. Broken water pipe leaking in kitchen for 6 days"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  Amount in Dispute (RWF)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 75000"
                  value={formData.amountClaimed}
                  onChange={(e) => setFormData({ ...formData, amountClaimed: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Urgency Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="low">Low (General inquiry / Minor)</option>
                  <option value="medium">Medium (Standard 5-day resolution)</option>
                  <option value="high">High (Affects living condition)</option>
                  <option value="urgent">Urgent (Immediate safety or lock out)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Statement of Facts *</label>
              <textarea
                rows={4}
                placeholder="Describe exactly what occurred, dates, and previous verbal or SMS communications..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Desired Resolution / Umwanzuro wifuzwa
              </label>
              <input
                type="text"
                placeholder="e.g. Landlord sends a plumber within 48h and reimburses 20,000 RWF for water damage"
                value={formData.desiredResolution}
                onChange={(e) => setFormData({ ...formData, desiredResolution: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 transition"
              >
                ← Back
              </button>
              <button
                disabled={!formData.subject.trim() || !formData.message.trim()}
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition"
              >
                Upload Evidence →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: EVIDENCE VAULT */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Evidence Submission Vault</h3>
              <p className="text-sm text-slate-500">
                Hirwa mediators and Rwandan Abunzi require solid proof (photos, repair estimates, MoMo transaction screenshots).
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-2">
                Add Image / Document URL or Cloud Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://example.com/photos/damage-photo-1.jpg"
                  value={evidenceInput}
                  onChange={(e) => setEvidenceInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  onClick={handleAddEvidence}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg text-sm transition"
                >
                  + Add File
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Tip: You can paste photo links or upload photos to secure storage.
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase text-slate-600 mb-2">
                Attached Evidence Files ({formData.evidenceUrls.length})
              </div>
              {formData.evidenceUrls.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
                  No evidence files attached yet. (Evidence significantly speeds up mediation).
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.evidenceUrls.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg text-sm"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <span className="text-lg">📎</span>
                        <span className="font-mono text-xs text-blue-700 truncate">{item.url}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveEvidence(idx)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm transition"
              >
                Review & File Claim →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & SUBMIT */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Confirm and Submit Formal Claim</h3>
              <p className="text-sm text-slate-500">
                Review your filing. Once submitted, a legal claim ticket is opened on the Hirwa ledger.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Dispute Type:</span>
                <span className="font-semibold text-slate-900">{formData.claimType}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Subject:</span>
                <span className="font-semibold text-slate-900">{formData.subject}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Amount in Dispute:</span>
                <span className="font-semibold text-emerald-700">
                  {formData.amountClaimed ? `${Number(formData.amountClaimed).toLocaleString()} RWF` : "Non-monetary"}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Priority:</span>
                <span className="font-semibold uppercase text-amber-700">{formData.priority}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Statement:</span>
                <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200 text-xs leading-relaxed">
                  {formData.message}
                </p>
              </div>
              {formData.desiredResolution && (
                <div>
                  <span className="text-slate-500 block mb-1">Desired Settlement:</span>
                  <p className="text-slate-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200 text-xs">
                    {formData.desiredResolution}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
              <strong>Legal Attestation:</strong> By clicking submit, I certify that all facts stated are truthful and agree to participate in good faith in Hirwa informal mediation before escalating to local Rwandan administrative authorities or Komite y'Abunzi.
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 transition"
              >
                ← Back
              </button>
              <button
                disabled={loading}
                onClick={handleSubmitClaim}
                className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-md transition disabled:opacity-50"
              >
                {loading ? "Filing Case..." : "Confirm & File Claim"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
