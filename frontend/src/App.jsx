import React, { useState } from "react";
import DisputeFilingWizard from "./components/DisputeFilingWizard";
import MediationCaseView from "./components/MediationCaseView";
import LeaseAgreementViewer from "./components/LeaseAgreementViewer";
import MoMoEscrowPayment from "./components/MoMoEscrowPayment";
import AgentPortal from "./components/AgentPortal";
import UtilityMeterSplitter from "./components/UtilityMeterSplitter";

// Mock contract for instant preview
const mockContract = {
  _id: "67530491823901",
  startDate: "2026-10-01",
  endDate: "2027-09-30",
  monthlyRent: 350000,
  depositAmount: 350000,
  currency: "RWF",
  landlordSigned: true,
  tenantSigned: false,
  property: {
    propertyName: "Kacyiru Heights Apartments - Unit 3B",
    location: "Kacyiru, Gasabo, Kigali",
    upiNumber: "1/02/08/04/1042",
  },
  landlord: {
    firstName: "Jean-Baptiste",
    lastName: "Habimana",
    phone_number: "0788123456",
    nationalId: "1198580029384910",
  },
  tenant: {
    firstName: "Marie-Claire",
    lastName: "Uwase",
    phone_number: "0783987654",
    nationalId: "1199370019283746",
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState("wizard");

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Platform Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-md">
              H
            </div>
            <div>
              <div className="font-bold text-base leading-none">HIRWA • RLTM</div>
              <div className="text-[10px] text-slate-400 font-medium">Rwanda Tenancy & Legal Intermediary</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex flex-wrap gap-1 bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab("wizard")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "wizard" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              1. File Dispute
            </button>
            <button
              onClick={() => setActiveTab("mediation")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "mediation" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              2. Mediation Room
            </button>
            <button
              onClick={() => setActiveTab("lease")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "lease" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              3. Digital Lease (E-Sign)
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "payment" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              4. MoMo Escrow
            </button>
            <button
              onClick={() => setActiveTab("agent")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "agent" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              5. Certified Brokers (Abakomisiyoneri)
            </button>
            <button
              onClick={() => setActiveTab("utility")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "utility" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              6. Compound Meter Splitter (EUCL/WASAC)
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "wizard" && (
          <div className="space-y-4">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                Tier 1 & 2 Intermediary Flow
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">Formal Tenancy Dispute Filing</h2>
              <p className="text-xs text-slate-500 mt-1">
                Evidence-based filing system for damages, rent arrears, and deposit withholding.
              </p>
            </div>
            <DisputeFilingWizard
              contractId={mockContract._id}
              counterpartyEmail="landlord@kacyiru.rw"
              onClaimSubmitted={(claim) => {
                console.log("Claim submitted:", claim);
              }}
            />
          </div>
        )}

        {activeTab === "mediation" && (
          <div className="space-y-4">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded">
                Supervised Dispute Room
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">Active Mediation & Abunzi Escalation</h2>
              <p className="text-xs text-slate-500 mt-1">
                Direct in-app negotiation, legal mediator intervention, and 1-click dossier export.
              </p>
            </div>
            <MediationCaseView claimId="mock-case" />
          </div>
        )}

        {activeTab === "lease" && (
          <div className="space-y-4">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
                Law N° 45/2011 Compliant
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">Bilingual Tenancy Agreement</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enforceable digital lease tied to Rwandan Land UPI and National ID with OTP signing.
              </p>
            </div>
            <LeaseAgreementViewer contract={mockContract} currentUserRole="tenant" />
          </div>
        )}

        {activeTab === "payment" && (
          <div className="space-y-4">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded">
                Escrow & FinTech Integration
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">MTN MoMo & Airtel Money Checkout</h2>
              <p className="text-xs text-slate-500 mt-1">
                Direct rent payments with neutral caution deposit protection.
              </p>
            </div>
            <MoMoEscrowPayment
              rentAmount={350000}
              depositAmount={350000}
              propertyName="Kacyiru Heights Apartments - Unit 3B"
            />
          </div>
        )}

        {activeTab === "agent" && (
          <div className="space-y-4">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                Standardized Commission Management
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">Certified Broker & Agent Network</h2>
              <p className="text-xs text-slate-500 mt-1">
                Formalize street brokers (*Abakomisiyoneri*) with regulated 10% fee caps and direct MoMo payouts.
              </p>
            </div>
            <AgentPortal />
          </div>
        )}

        {activeTab === "utility" && (
          <div className="space-y-4">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded">
                Shared Compound Billing
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">WASAC & EUCL CashPower Meter Splitter</h2>
              <p className="text-xs text-slate-500 mt-1">
                Fair, transparent utility billing per unit or headcount with photographic meter proof.
              </p>
            </div>
            <UtilityMeterSplitter />
          </div>
        )}
      </main>
    </div>
  );
}
