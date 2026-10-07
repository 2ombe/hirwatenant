# HIRWA / RLTM - Frontend Architecture & Implementation Plan

---

## 1. Recommended Frontend Stack

* **Core Framework**: **Next.js (App Router, React 19, TypeScript)**
* **Styling**: **Tailwind CSS** + **shadcn/ui** (Accessible, polished, accessible UI primitives)
* **Icons**: **Lucide React**
* **Forms & Validation**: **React Hook Form** + **Zod**
* **Data Fetching & Cache**: **@tanstack/react-query** (optimistic updates, live dispute refetching)
* **Global State**: **Zustand** (auth state, active contract session, notification counts)
* **Internationalization**: **next-intl** (English, Kinyarwanda, French)
* **PDF Viewing & Signatures**: `react-pdf` / HTML5 Canvas signature pad

---

## 2. Information Architecture & Sitemap

```
├── (public)
│   ├── /                          # High-conversion landing page (Value proposition for Rwanda)
│   ├── /properties                # Browse available verified apartments/houses
│   ├── /properties/[id]           # Property details, UPI verification badge, Apply to Rent
│   ├── /know-your-rights          # Rwandan tenancy law simplified (Law N° 45/2011 guide)
│   └── /pricing                   # Mediation fee transparency (for non-dispute vs escalated)
│
├── (auth)
│   ├── /login                     # Phone / Email + Google OAuth
│   ├── /register                  # Select Role (Tenant / Landlord / Property Manager)
│   └── /verify-id                 # NIDA 16-digit ID / Passport verification
│
├── (tenant)/dashboard
│   ├── /overview                  # Active lease summary, Rent countdown, Quick Actions
│   ├── /my-lease                  # Bilingual contract viewer, Digital E-signing (OTP)
│   ├── /pay-rent                  # MTN MoMo / Airtel Money instant payment drawer
│   ├── /inspection                # Move-in & Move-out photo inventory checklist
│   ├── /claims                    # Claims list (Active, Under Review, Settled)
│   ├── /claims/new                # 4-Step Legal Claim & Evidence Submission Wizard
│   ├── /claims/[id]               # Live Dispute Room (Chat thread, Mediator notes, Evidence)
│   └── /deposit-tracker           # Caution escrow guarantee status & refund request
│
├── (landlord)/dashboard
│   ├── /overview                  # Monthly rental income, occupancy rate, pending disputes
│   ├── /properties                # Property roster (Add new property with UPI & meter numbers)
│   ├── /tenants                   # Active tenants, lease end dates, payment history
│   ├── /contracts                 # Generate new lease, review draft, counter-sign
│   ├── /claims                    # Incoming tenant claims, counter-offers, repair vendor dispatch
│   └── /payouts                   # MoMo/Bank settlement logs & tax receipt exporter
│
└── (mediator-admin)/dashboard
    ├── /disputes                  # Live dispute queue (Filter by District, Priority, Type)
    ├── /disputes/[id]             # Case Hearing Room: Evidence side-by-side comparison
    ├── /disputes/[id]/settle      # Draft Legally Binding Settlement Agreement
    └── /disputes/[id]/abunzi      # 1-Click Export: Official Abunzi / Primary Court Dossier PDF
```

---

## 3. Key UX Flows & Wireframe Specifications

### Flow A: The 4-Step Dispute Filing Wizard (`/claims/new`)
```
[ Step 1: Claim Classification ]
  Select Category:
  ( ) Unpaid Rent / Arrears
  ( ) Property Damage / Wear & Tear
  (o) Urgent Repair Neglect (Water/Plumbing, Roof leak, CashPower fault)
  ( ) Unlawful Eviction Notice
  ( ) Caution Deposit Withholding
  ( ) Breach of Lease Clause

[ Step 2: Particulars of Claim ]
  - Select Leased Property & Linked Contract
  - Amount in dispute (RWF) [Optional/Mandatory depending on type]
  - Chronological description of what occurred

[ Step 3: Evidence Submission Vault ]
  - Drag & drop high-resolution photos (with automatic EXIF date capture)
  - Upload WhatsApp screenshot / Technician quote / Payment SMS
  - Add description for each item (e.g., "Burst pipe beneath kitchen sink on Oct 2nd")

[ Step 4: Proposed Amicable Remedy ]
  - What outcome do you seek? (e.g. "Landlord repairs within 48h", "Deduct 50,000 RWF from rent")
  - Confirmation of truthfulness under Rwandan law
  - [ Submit Claim & Notify Counterparty ]
```

---

### Flow B: Live Dispute Room (`/claims/[id]`)
```
+---------------------------------------------------------------------------------+
| Case #CLM-824190-RW | URGENT: Plumbing Repair Neglect | Status: HIRWA MEDIATION  |
+---------------------------------------------------------------------------------+
| [ Left Column: Case Facts & Evidence ]  | [ Right Column: 3-Way Dialogue Room ] |
| - Leased Unit: Kimironko Apt 4B         |                                       |
| - Landlord: Jean-Paul M. (0788...)      | [Tenant]: Water is still leaking since|
| - Tenant: Aline K. (0783...)            | Wednesday. See photo #1 attached.     |
| - Contract Deposit: 300,000 RWF         |                                       |
|                                         | [Landlord]: I sent a plumber on Friday|
| [ Evidence Files (3) ]                  | but tenant was not at home.           |
| [Photo: Burst Pipe] [Receipt: Plumber]  |                                       |
|                                         | [Hirwa Mediator]: Under Rwandan Lease |
| [ Actions ]                             | Clause 4.2, structural plumbing is the|
| [ Propose Settlement ]                  | Landlord's duty. Landlord will send   |
| [ Escalate to Abunzi Committee ]        | certified plumber tomorrow at 10 AM.  |
|                                         | [ Both Accept Settlement ] [ Reject ] |
+---------------------------------------------------------------------------------+
```

---

### Flow C: Digital Tenancy Agreement Viewer & E-Signing (`/my-lease`)
1. **Interactive Legal Reader**: Split view showing English and Kinyarwanda side-by-side or tabbed.
2. **Key Rwanda Clauses Highlighted**:
   - UPI Number and exact parcel boundaries.
   - Monthly rent, due date (e.g., 5th of every month), and grace period (5 days).
   - Deposit caution terms (held safely in Hirwa Escrow).
   - Exit notice duration (30 days minimum).
   - Dispute arbitration clause designating Hirwa & Komite y'Abunzi.
3. **Signing Block**:
   - Shows Landlord verification badge and Tenant verification badge.
   - Click "Sign Lease" -> Sends 6-digit SMS OTP to registered MTN/Airtel number -> Confirms and records timestamp + cryptographic IP hash.

---

### Flow D: MTN MoMo / Airtel Money Escrow Drawer (`/pay-rent`)
1. Automatically computes:
   - Base Rent: `250,000 RWF`
   - Caution Deposit (if 1st month): `250,000 RWF`
   - Platform Intermediary & Legal Protection Fee: `5,000 RWF`
   - **Total Payable**: `505,000 RWF`
2. Tenant confirms MTN MoMo number (`078XXXXXXX`).
3. App triggers USSD prompt directly on the tenant's phone ("Enter Mobile Money PIN to approve").
4. Instant real-time webhook updates the ledger and auto-generates official PDF rent receipt.
