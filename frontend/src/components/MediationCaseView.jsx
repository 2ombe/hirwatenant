import React, { useState, useEffect } from "react";
import { claimsApi } from "../api/apiService";

export default function MediationCaseView({ claimId }) {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [dossierResult, setDossierResult] = useState(null);
  const [escalating, setEscalating] = useState(false);

  const fetchClaimData = async () => {
    try {
      setLoading(true);
      const data = await claimsApi.getClaimById(claimId);
      setClaim(data);
    } catch (err) {
      setError(err.message || "Could not load dispute case.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (claimId) {
      fetchClaimData();
    }
  }, [claimId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSendingReply(true);
      await claimsApi.addMessage(claimId, { message: replyText.trim() });
      setReplyText("");
      await fetchClaimData();
    } catch (err) {
      alert("Failed to send message: " + err.message);
    } finally {
      setSendingReply(false);
    }
  };

  const handleEscalateToAbunzi = async () => {
    const confirmEscalate = window.confirm(
      "Are you sure you want to escalate this case to Komite y'Abunzi? Hirwa will compile and seal the official legal dispute dossier."
    );
    if (!confirmEscalate) return;

    try {
      setEscalating(true);
      const res = await claimsApi.escalateToAbunzi(claimId, {
        district: claim?.property?.district || "Gasabo",
        sector: claim?.property?.sector || "Kimironko",
      });
      setDossierResult(res.dossier);
      await fetchClaimData();
    } catch (err) {
      alert("Failed to compile Abunzi dossier: " + err.message);
    } finally {
      setEscalating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
        <div>Loading dispute mediation file...</div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl max-w-xl mx-auto my-8">
        <strong>Error:</strong> {error || "Case file not found."}
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "filed":
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">New Case Filed</span>;
      case "in_discussion":
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">In Direct Negotiation</span>;
      case "mediation_requested":
      case "mediator_assigned":
        return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">Hirwa Mediation Active</span>;
      case "settled":
        return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">Amicably Settled</span>;
      case "escalated_to_abunzi":
        return <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-semibold">Escalated to Abunzi / Court</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* CASE TOP BAR */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-xl font-bold text-slate-900">{claim.subject}</h1>
            {getStatusBadge(claim.status)}
          </div>
          <div className="text-xs text-slate-500 space-x-3">
            <span>Case Ref: <strong className="text-slate-700 font-mono">{claim.claimReference}</strong></span>
            <span>•</span>
            <span>Category: <strong className="text-slate-700">{claim.claimType}</strong></span>
            <span>•</span>
            <span>Disputed Amount: <strong className="text-emerald-700">{claim.amountClaimed ? `${claim.amountClaimed.toLocaleString()} RWF` : "Non-monetary"}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {claim.status !== "escalated_to_abunzi" && claim.status !== "settled" && (
            <button
              onClick={handleEscalateToAbunzi}
              disabled={escalating}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
            >
              {escalating ? "Compiling..." : "Escalate to Abunzi Dossier"}
            </button>
          )}
        </div>
      </div>

      {/* MODAL: ABUNZI DOSSIER PREVIEW */}
      {dossierResult && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 text-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-amber-900 text-base">
              📄 Official Abunzi Mediation Dossier Generated
            </h3>
            <button
              onClick={() => setDossierResult(null)}
              className="text-xs font-bold text-amber-800 hover:text-amber-950"
            >
              ✕ Close Preview
            </button>
          </div>
          <p className="text-xs text-amber-800">
            This sealed file has been formatted for the local Sector Executive Secretary and the Village/Cell Mediation Committee (*Komite y'Abunzi*).
          </p>
          <div className="bg-white p-4 rounded-xl border border-amber-200 text-xs font-mono space-y-1.5">
            <div><strong>Dossier Ref:</strong> {dossierResult.dossierReference}</div>
            <div><strong>Jurisdiction:</strong> District {dossierResult.jurisdiction.district}, Sector {dossierResult.jurisdiction.sector}</div>
            <div><strong>Claimant:</strong> {dossierResult.claimant.fullName} (NID: {dossierResult.claimant.nationalId})</div>
            <div><strong>Respondent:</strong> {dossierResult.respondent.fullName} (Phone: {dossierResult.respondent.phone})</div>
            <div><strong>Property UPI:</strong> {dossierResult.property.upiNumber} ({dossierResult.property.name})</div>
            <div><strong>Dispute Amount:</strong> {dossierResult.claimDetails.amountInDisputeRwf} RWF</div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
            >
              🖨️ Print / Download Dossier for Sector
            </button>
          </div>
        </div>
      )}

      {/* TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: EVIDENCE & PARTIES (1 col) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Parties Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Parties to Dispute
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-900 block">Claimant / Umurezi</span>
                <div className="text-slate-700 font-semibold">{claim.raisedBy?.firstName} {claim.raisedBy?.lastName}</div>
                <div className="text-slate-500">{claim.raisedBy?.phone_number || "N/A"}</div>
                <div className="text-slate-500 font-mono text-[10px]">NID: {claim.raisedBy?.nationalId || "Not Registered"}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">Respondent / Uregwa</span>
                <div className="text-slate-700 font-semibold">{claim.recipient?.firstName || "Landlord/Tenant"} {claim.recipient?.lastName || ""}</div>
                <div className="text-slate-500">{claim.recipientEmail}</div>
                <div className="text-slate-500 font-mono text-[10px]">NID: {claim.recipient?.nationalId || "Not Registered"}</div>
              </div>
            </div>

            {/* Property Card */}
            {claim.property && (
              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-2">
                  Leased Property
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-900">{claim.property.propertyName}</div>
                  <div className="text-slate-600 font-mono text-[11px]">UPI: {claim.property.upiNumber || "Pending"}</div>
                  <div className="text-slate-500">{claim.property.district}, {claim.property.sector}</div>
                </div>
              </div>
            )}
          </div>

          {/* Evidence Vault */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Evidence Vault ({claim.evidence?.length || 0})
            </h3>
            {(!claim.evidence || claim.evidence.length === 0) ? (
              <p className="text-xs text-slate-400">No documentary or photographic evidence attached.</p>
            ) : (
              <div className="space-y-2">
                {claim.evidence.map((ev, i) => (
                  <a
                    key={i}
                    href={ev.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 text-xs transition group"
                  >
                    <span className="truncate text-slate-700 group-hover:text-blue-600 font-medium">
                      📁 {ev.title || `Exhibit #${i + 1}`}
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold ml-2">Open ↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: MEDIATION CHAT & TIMELINE (2 cols) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col h-[650px]">
          <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Mediation & Negotiation Log</h2>
              <p className="text-xs text-slate-500">Official log supervised by Hirwa Legal Intermediary</p>
            </div>
            <div className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded font-medium border border-emerald-200">
              ● Tamper-Proof Audit Trail
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
            {/* Original Claim Statement */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs space-y-1">
              <div className="flex justify-between font-bold text-blue-900">
                <span>Original Statement of Claim</span>
                <span className="text-[10px] text-blue-600 font-normal">{new Date(claim.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{claim.message}</p>
              {claim.desiredResolution && (
                <div className="mt-2 pt-2 border-t border-blue-200 font-semibold text-emerald-800">
                  Requested Outcome: {claim.desiredResolution}
                </div>
              )}
            </div>

            {/* In-Thread Messages */}
            {claim.mediationThread?.map((msg, index) => {
              const isMediator = msg.senderRole === "mediator" || msg.senderRole === "admin";
              return (
                <div
                  key={index}
                  className={`p-3.5 rounded-xl text-xs space-y-1 ${
                    isMediator
                      ? "bg-purple-50 border border-purple-200 text-purple-900"
                      : "bg-slate-50 border border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex justify-between font-semibold">
                    <span className={isMediator ? "text-purple-800 uppercase text-[10px] tracking-wider" : "text-slate-700"}>
                      {isMediator ? "⚖️ Hirwa Legal Mediator" : `${msg.sender?.firstName || "Party"} (${msg.senderRole})`}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="leading-relaxed">{msg.message}</p>
                </div>
              );
            })}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Post a formal reply or propose settlement terms..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                disabled={sendingReply || !replyText.trim()}
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                {sendingReply ? "Sending..." : "Submit Reply"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
