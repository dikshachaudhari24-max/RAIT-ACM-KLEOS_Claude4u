# RAIT-ACM-KLEOS_Claude4u
# PRODUCT REQUIREMENTS DOCUMENT

# Hisably

### India's First WhatsApp-Native, Voice-First GST Compliance Assistant for MSMEs

**Tagline:** "Your AI GST Compliance Assistant for Small Businesses"

**Hackathon Problem Statement:** D4-PS1 — Unstructured Data & Language Barrier in GST Compliance
**Domain:** FinTech / GovTech
**Version:** 2.0 (Expanded Implementation-Ready Edition)
**Date:** June 2026

---

## Version History

| Version | Date | Author | Change Summary |
|---|---|---|---|
| 1.0 | June 2026 | Founding Team | Initial PRD submitted under product name PocketCA. Covered core OCR, HSN correction, GSTR-2B reconciliation, ITC engine, payment ledger, compliance score, and voice RAG chatbot. |
| 2.0 | June 2026 | Founding Team | Renamed product to **Hisably**. Expanded every section for implementation readiness. Added Supplier Reliability Indicator, Supplier Correction Recommendation Engine, Auto Message Generator, Root Cause Analysis Engine, Multilingual GST Reasoning Engine, full frontend screen specifications, expanded database schema, expanded API contracts, and detailed security architecture. Reorganized system architecture into six layers. Document expanded to implementation-ready depth for both human developers and AI coding agents. |

---

## Table of Contents

1. Executive Summary
2. Problem Statement
3. Product Vision, Mission & Differentiation
4. User Personas
5. User Journeys
6. Solution Overview
   - 6.1 OCR + Vision LLM Intelligence Layer
   - 6.2 GSTIN Validation & Correction Engine
   - 6.3 HSN Code Validation & Auto-Correction Engine
   - 6.4 Invoice vs GSTR-2B Reconciliation Engine
   - 6.5 ITC Recovery & Loss Tracking Engine
   - 6.6 Multilingual GST Reasoning Engine
   - 6.7 Root Cause Analysis Engine
   - 6.8 Supplier Reliability Indicator
   - 6.9 Supplier Correction Recommendation Engine
   - 6.10 Auto Message Generator
   - 6.11 Fake Invoice / Anomaly Detection Engine
   - 6.12 Compliance Risk Indicator
   - 6.13 Vernacular Voice RAG Chatbot
   - 6.14 GST Knowledge RAG Pipeline
   - 6.15 Payment Task Manager & Proof-Based Ledger
7. Functional Requirements
8. Non-Functional Requirements
9. Frontend Product Specification
   - App Screens 1–10
10. Backend Architecture Specification
11. System Architecture (Six Layers)
12. Required Data Flows
13. Database Design (PostgreSQL Schema)
14. Vector Database Structure (Pinecone)
15. API Design
16. Security & Data Protection
17. WhatsApp Integration Specification
18. Tech Stack
19. MVP Scope (Must Build / Nice to Have / Future Scope)
20. Hackathon Build Plan
21. Business Model
22. Competitive Differentiation & Innovation Summary
23. PS D4-PS1 Compliance Checklist
24. Demo Script
25. Appendix

---

# 1. Executive Summary

## 1.1 Industry Context

India's Goods and Services Tax (GST) regime, introduced in 2017, unified a fragmented indirect tax system into a single national framework. Today it governs the compliance obligations of over **1.4 crore registered MSMEs** — kirana stores, distributors, small traders, manufacturers, and service providers spread across metros and, increasingly, Tier 2 and Tier 3 towns. The GST portal (gst.gov.in) is the sole official interface for return filing, Input Tax Credit (ITC) reconciliation, and compliance status checks.

The portal was built for scale and standardization, not for usability by a Hindi-speaking shopkeeper running a 200-square-foot store with a single Android phone. It is English-only, form-heavy, and assumes the user already understands concepts like GSTR-2B, HSN classification, and reverse charge mechanisms. It tells a user *that* an invoice is mismatched but never *why* it matters in rupee terms or *what* to do next.

This gap has created an entire shadow industry: practicing Chartered Accountants (CAs) who exist primarily to translate the portal's outputs into plain instructions for small business owners. For India's MSME segment — which contributes roughly **30% of GDP** and **45% of exports** — this translation layer is not a value-add service; it is a tax on doing business that the formal compliance system implicitly requires but does not formally charge.

## 1.2 MSME Compliance Challenges

Three structural challenges define the MSME compliance experience in India:

1. **Volume without infrastructure.** A mid-sized kirana or distribution business processes 500–2,000 supplier invoices a month. Almost none of this arrives as structured data — it arrives as WhatsApp photos, torn paper receipts, scanned PDFs, and handwritten chits.
2. **Asymmetric technical literacy.** The owner is commercially sophisticated — they know their margins, their suppliers, and their customers intimately — but they are not trained in tax law, HSN classification schedules, or reconciliation logic. Government-issued tools assume the opposite.
3. **No safety net for self-filing.** A wrong HSN code or a mismatched GSTIN can silently block thousands of rupees in legitimately earned ITC. Because the portal does not explain *consequences*, owners cannot self-correct — they need an intermediary who already knows what the error means.

## 1.3 Dependence on Chartered Accountants

The default solution to all three challenges has been outsourcing to a CA, at a typical cost of **₹15,000 to ₹40,000 per month** per trader. Crucially, the CA's billed work is rarely sophisticated tax advisory — it is largely manual data entry, invoice matching, and translating system outputs into a phone call or WhatsApp message: *"Sharma's invoice has the wrong HSN code, you're losing ₹2,400 this month, ask him to resend it."*

This is a process that can be automated with current OCR, LLM, and rules-engine technology. The CA's actual differentiated value — judgment on ambiguous cases, signing authority on filings, and statutory liability — is a small fraction of what is being paid for. Hisably is built to automate the 80% that is mechanical and leave the 20% that genuinely requires professional judgment to the CA, who remains in the loop for final filing sign-off.

## 1.4 Existing Challenges

- **Manual invoice management:** Invoices are scattered across WhatsApp chats, physical files, and email, with no single structured record per supplier or month.
- **Unstructured financial data:** Photos and scans must be manually re-typed into spreadsheets or portal forms before any reconciliation can occur.
- **GST complexity:** HSN codes, GST slabs, reverse charge rules, and the GSTR-1/2A/2B/3B return cycle are genuinely complex even for trained professionals.
- **Language barriers:** The GST portal, and most third-party GST software, operate in English only, excluding a large share of Tier 2/3 business owners who are more comfortable in Hindi or Hinglish.

## 1.5 Product Vision

Hisably aims to become the **default compliance companion for every GST-registered small trader in India** — a product that sits quietly inside the channel traders already use (WhatsApp), watches their invoices arrive, and proactively tells them, in their own language, exactly how much money is at stake and exactly what to do about it. The long-term vision is a trader who has never opened the GST portal directly but who never misses a legitimate rupee of ITC and never misses a filing deadline.

## 1.6 Product Mission

To eliminate the dependency of India's smallest businesses on expensive, opaque, English-only compliance intermediaries by giving them a transparent, AI-powered, vernacular-first tool that explains GST in terms they already understand: money, suppliers, and deadlines.

## 1.7 Value Proposition

| For the Trader | Value Delivered |
|---|---|
| Ramesh, a kirana owner | Loses zero ITC silently; gets exact rupee-impact alerts in Hindi; never opens the English GST portal |
| A small distributor | Tracks supplier reliability over time and knows which suppliers to flag, follow up with, or replace |
| A Tier 2/3 retailer with limited English | Operates the entire compliance workflow by voice in Hindi/Hinglish |
| A price-sensitive MSME | Replaces a ₹15,000–₹40,000/month CA retainer with a ₹0–₹999/month subscription |

## 1.8 Competitive Differentiation

Existing accounting and GST software (Tally, Zoho Books, ClearTax, GST portal itself) are built for accountants, not for the shop owner directly. They assume English fluency, manual structured data entry, and a baseline familiarity with accounting terms like "ledger," "debit note," or "outward supply." None of them:

- Ingest invoices passively through a channel the user already uses daily (WhatsApp).
- Explain *why* an error matters in plain Hindi with an exact rupee figure.
- Track supplier-level reliability over time to flag chronic offenders.
- Generate ready-to-send correction messages on the user's behalf.
- Offer a voice-first interface for querying personal financial data.

Hisably's differentiation is not "better accounting software" — it is **removing the need for the user to think like an accountant at all.**

---

# 2. Problem Statement

## 2.1 Current User Journey (As-Is)

A typical small trader's current GST workflow looks like this:

1. **Invoice Receipt:** Supplier delivers goods along with a paper invoice, or sends a photo/PDF of the invoice via WhatsApp.
2. **Physical/Digital Storage:** The trader stuffs paper invoices into a drawer or folder, and WhatsApp images simply remain in the chat thread, unsorted by supplier or month.
3. **Monthly Handover to CA:** Once a month, the trader hands over a bundle of paper invoices and forwards WhatsApp images to their CA, often physically visiting the CA's office.
4. **Manual Data Entry:** The CA's staff manually types invoice details into accounting software or directly into GST return templates — a slow, error-prone, and entirely manual process.
5. **GSTR-2B Download & Reconciliation:** The CA downloads the GSTR-2B (auto-drafted ITC statement) from the GST portal and manually cross-checks it against the trader's purchase invoices, looking for mismatches.
6. **Filing:** The CA files GSTR-1 (outward supplies) and GSTR-3B (summary return with tax payment) on the trader's behalf, often close to the deadline.
7. **Verbal Feedback Loop:** If there are issues — a wrong GSTIN, a missing invoice — the CA may mention it to the trader verbally or via a WhatsApp text, often without urgency or a clear rupee figure attached.

## 2.2 Pain Points

| Pain Point | Description |
|---|---|
| Invoice management | No single structured repository; invoices are scattered, often lost, and never indexed by supplier or HSN code |
| GST filing complexity | The trader has no visibility into the filing process and cannot verify correctness independently |
| ITC loss | Mismatches, wrong HSN codes, and unfiled supplier invoices silently block ITC the trader is legally entitled to |
| Supplier dependency | The trader has no leverage or data to push suppliers toward timely, accurate invoicing |
| Language barriers | English-only portal and most CA communication assumes a level of English/technical fluency many traders don't have |
| Lack of transparency | The trader rarely knows the *exact* rupee amount at stake until the CA mentions it, often after the window to act has narrowed |

## 2.3 Root Causes

- **No real-time bridge** between the physical commercial transaction (a paper or photo invoice) and the digital compliance system (GSTR-2B, the portal).
- **No incentive alignment** for CAs to build self-service tooling — the manual process is the basis of their billing.
- **No vernacular-first compliance software** exists at the scale of mainstream consumer apps like WhatsApp.
- **HSN and GST rate complexity** make even well-intentioned manual entry error-prone, and errors are only caught — if at all — during the monthly reconciliation cycle, by which point recovery options narrow.

## 2.4 Economic Impact

- A trader processing 500–2,000 invoices a month who pays a CA ₹15,000–₹40,000/month spends, conservatively, **₹1.8 lakh to ₹4.8 lakh annually** on compliance overhead alone.
- Industry estimates suggest a meaningful share of MSME ITC claims are partially or fully blocked each filing cycle due to GSTIN mismatches, HSN errors, or supplier non-filing — translating into real cash-flow loss that businesses absorb silently because they have no tool to make the loss visible in time to act.
- Time cost: hours per month spent physically handing over documents, following up with CAs, and chasing suppliers for corrected invoices — time that is not separately billed but is a real opportunity cost for an owner-operator.

## 2.5 Why Existing Solutions Fail

- **Complexity:** Tools like Tally and Zoho Books are built for trained bookkeepers, not owner-operators with no accounting background.
- **English-only interfaces:** Nearly every GST-adjacent software product, including the GST portal itself, defaults to English with no true vernacular-first design.
- **Lack of guidance:** Existing tools surface errors (e.g., "GSTIN mismatch") without explaining business impact or the next action.
- **Lack of actionable recommendations:** None auto-generate the actual corrective artifact (a corrected invoice PDF, a supplier message) — they leave the "what do I do now" question entirely to the user or their CA.

---
# 3. Product Vision, Mission & Differentiation

This section consolidates and operationalizes the vision stated in the Executive Summary into concrete product principles that govern every feature decision in this document.

## 3.1 Product Principles

1. **Zero behavior change.** The user should not need to learn a new workflow. If they already send invoice photos to a number on WhatsApp, that is the entire "data entry" step.
2. **Money, not jargon.** Every output is expressed in rupees and plain action verbs ("call supplier," "resend invoice"), never in raw compliance terminology like "ITC reversal under Rule 37."
3. **Vernacular by default, not as an afterthought.** Hindi is a first-class language throughout the product, not a translated layer bolted onto an English core.
4. **Fairness in blame.** The system never assumes the supplier is at fault by default — it reasons about whether the error originated with the supplier, the trader, or both, before recommending an action.
5. **Proof over promises.** Every payment, every correction, every claim of "fixed" is backed by a stored artifact (a screenshot, a transaction ID, a corrected PDF).
6. **CA-augmenting, not CA-replacing (in MVP framing for compliance-sensitive output).** Hisably automates the mechanical 80% and clearly signals where professional judgment may still be advisable, particularly for first-time users.

## 3.2 Competitive Differentiation Matrix

| Capability | GST Portal | Tally / Zoho Books | Typical CA Service | Hisably |
|---|---|---|---|---|
| Vernacular (Hindi) UI | No | Partial | Verbal only | Yes, full UI + voice |
| Passive invoice capture via WhatsApp | No | No | No | Yes |
| Rupee-impact explanation per error | No | No | Sometimes, verbally | Yes, always |
| Supplier-level reliability tracking | No | No | Rarely formalized | Yes |
| Auto-generated correction messages | No | No | No | Yes |
| Voice query over personal financial data | No | No | No | Yes |
| Cost to user | Free (but unusable alone) | License fee + accountant | ₹15,000–₹40,000/mo | ₹0–₹999/mo |

---

# 4. User Personas

## Persona 1: Ramesh — The Kirana Store Owner (Primary Persona)

- **Age:** 42
- **Location:** Lucknow, Uttar Pradesh (Tier 2 city)
- **Business:** General store, GST-registered, ~₹40 lakh annual turnover
- **Tech comfort:** Owns an Android smartphone, uses WhatsApp daily for business and personal communication, uncomfortable navigating English-language web forms
- **Pain points:** Pays a CA ₹25,000/month; has no visibility into why ITC sometimes seems lower than expected; occasionally receives invoices with wrong GSTINs from suppliers and doesn't know it until told
- **Goals:** Reduce CA dependency and cost; never lose ITC silently; get instructions in Hindi he can act on immediately

## Persona 2: Sunita — The Distributor / Wholesaler

- **Age:** 35
- **Location:** Indore, Madhya Pradesh
- **Business:** FMCG distribution to 40+ retail outlets; processes 1,500+ invoices/month, both inbound (from manufacturers) and outbound (to retailers)
- **Tech comfort:** Comfortable with basic apps, prefers Hinglish, delegates some bookkeeping to a part-time assistant
- **Pain points:** Needs to track which manufacturers consistently file late or send incorrect invoices; juggles many supplier relationships and struggles to prioritize which to follow up with first
- **Goals:** A prioritized, data-backed view of which suppliers are reliable and which need a phone call this week

## Persona 3: Anil — The Small Manufacturer / Trader with Multiple GSTINs (Secondary, Pro-tier)

- **Age:** 50
- **Location:** Surat, Gujarat
- **Business:** Textile trading across 2–3 registered entities
- **Tech comfort:** Delegates compliance heavily to staff and a CA but wants an at-a-glance dashboard
- **Goals:** Multi-GSTIN visibility, CA-shareable reports, and confidence that nothing is being missed across entities

## Persona 4: Priya — The CA Serving Multiple MSME Clients (Indirect / Future Persona)

- **Role:** Practicing Chartered Accountant with 30+ small business clients
- **Relationship to Hisably:** In the MVP, Priya is not a primary user, but Hisably's outputs (corrected invoices, reconciliation reports, ITC summaries) are designed to be CA-shareable, reducing her own manual reconciliation load and positioning a future "CA Dashboard" tier as a natural roadmap extension.

---

# 5. User Journeys

## 5.1 Journey: First-Time Onboarding

1. Ramesh hears about Hisably from another shop owner and downloads the app (or is invited to message a WhatsApp number).
2. He signs up with his phone number, verifies via OTP, and enters his GSTIN.
3. The app validates the GSTIN format and confirms his business name back to him in Hindi.
4. He is shown a short, visual (not text-heavy) walkthrough: "Invoice WhatsApp pe bhejo, hum baaki sambhal lenge" ("Send invoices on WhatsApp, we'll handle the rest").
5. He is prompted to forward 2–3 recent invoice photos as a guided first action, and immediately sees structured data appear — building trust in the product within the first five minutes.

## 5.2 Journey: Daily Invoice Processing (Steady State)

1. A supplier sends an invoice photo to Ramesh's WhatsApp, as always.
2. Ramesh forwards it (or it is auto-ingested via the connected WhatsApp Business number) to Hisably.
3. Within seconds, Hisably extracts structured fields and runs validation checks.
4. If an error is found, Ramesh receives a WhatsApp notification in Hindi: *"Sharma ki invoice mein HSN code galat hai. ₹2,400 ITC block ho sakta hai."*
5. Ramesh opens the app, reviews the suggested correction, and taps "Supplier ko bhejo" (Send to supplier) to dispatch an auto-drafted correction request.

## 5.3 Journey: Monthly GSTR-2B Reconciliation

1. Ramesh downloads his GSTR-2B from the GST portal (a step that remains manual because Hisably has no portal API access) and uploads it to the app.
2. Hisably reconciles every invoice in its database against the GSTR-2B in under a minute.
3. A dashboard shows: total eligible ITC, blocked ITC, and a prioritized list of fixable mismatches sorted by rupee value.
4. Ramesh works through the top three items, each with a one-tap action (message supplier, mark resolved, or escalate).

## 5.4 Journey: Voice Query

1. Ramesh wants to know how much ITC he's missed this month but doesn't want to navigate the dashboard.
2. He opens the app, taps the microphone icon, and asks in Hindi: *"Is mahine kitna ITC miss hua?"*
3. The system transcribes, retrieves his personal data, and responds both as text and as spoken Hindi audio: *"Is mahine ₹4,200 ITC miss hua hai, teen invoices ki wajah se."*

---

# 6. Solution Overview

Hisably is composed of fifteen interlocking engines, organized into intelligence layers. Each is described below with inputs, processing logic, outputs, and business rationale.

## 6.1 OCR + Vision LLM Intelligence Layer

### Purpose

Convert any physical or digital invoice artifact into clean, structured, validated data without requiring the user to type anything.

### Inputs

- Invoice images (camera capture)
- PDF invoices (digital or scanned)
- WhatsApp-forwarded images
- Receipts (printed or handwritten)
- Scanned bills

### Processing Flow

1. **Preprocessing (OpenCV):** Convert to grayscale, normalize contrast, denoise, and sharpen. For digital PDFs, this step is skipped in favor of direct text extraction.
2. **OCR (Google Vision API):** Extract raw Hindi + English text from the preprocessed image. Vision API is chosen over self-hosted Tesseract because it handles handwriting, low-light photos, and mixed Hindi/English text natively, which is essential given the input quality realities of WhatsApp-forwarded images.
3. **LLM Structuring (Groq / Llama 3.1 70B):** The raw OCR text is passed to the LLM with a strict JSON-extraction prompt to produce clean structured fields.
4. **Persistence:** Structured JSON is stored in PostgreSQL; the raw image is stored in Supabase Storage with a signed-URL access pattern.

### Structured Fields Extracted

| Field | Description |
|---|---|
| Supplier Name | Business name as printed on invoice |
| GSTIN | Supplier's 15-character GST identification number |
| Invoice Number | Unique invoice identifier from supplier |
| Invoice Date | Date of issue |
| Invoice Amount | Total invoice value, including tax |
| Taxable Value | Pre-tax value of goods/services |
| GST Amount | Total tax charged (CGST + SGST or IGST) |
| HSN Code | Harmonized System of Nomenclature classification |
| Product Description | Free-text description of goods/services |

### Confidence Scoring

Each extracted field is assigned a confidence score (0–100%) derived from two signals: (a) the OCR engine's native character-level confidence for the source text region, and (b) the LLM's self-reported certainty when the source text is ambiguous (e.g., a smudged digit in a GSTIN). Fields below a configurable threshold (default 70%) are flagged for manual user confirmation before being used in downstream reconciliation or ITC calculations, preventing silent propagation of bad data.

### Validation Process

Immediately after extraction, every invoice passes through a validation chain: GSTIN format check, HSN existence check, mandatory-field completeness check, and date sanity check (e.g., invoice date not in the future). Invoices failing validation are routed to the Structured Data Viewer screen with inline flags rather than being silently accepted.

| Input Type | Preprocessing Applied | Expected Accuracy |
|---|---|---|
| Clear printed invoice | Grayscale + denoise | ~95% |
| Blurry WhatsApp photo | Sharpen + contrast boost + denoise | ~75–80% |
| Torn/partial receipt | Edge detection + perspective correction | ~65–70% |
| Scanned PDF | Direct text extraction (PyMuPDF), no OCR needed | ~98% |

---

## 6.2 GSTIN Validation & Correction Engine

### Purpose

Catch GSTIN-related errors before they propagate into reconciliation, since a wrong GSTIN is one of the most common causes of fully blocked ITC.

### Validation Checks

| Check | Logic |
|---|---|
| Format validation | Regex match against the 15-character GSTIN pattern (2-digit state code + 10-character PAN + entity code + check digit) |
| Length validation | Exactly 15 characters, no more, no less |
| State code validation | First two digits must correspond to a valid Indian state/UT code |
| Checksum validation | Final character validated against the GSTIN check-digit algorithm |
| Duplicate detection | Flags if the same invoice number + GSTIN combination already exists for this user (possible double-entry or duplicate billing) |
| Missing GSTIN detection | Flags invoices where no GSTIN was extracted or printed at all |

### Output Structure

For every GSTIN issue detected, the engine produces:

- **Error identified:** Plain description of what's wrong (e.g., "GSTIN is 14 characters, one digit appears missing")
- **Suggested correction:** Where derivable (e.g., from a previously seen, verified GSTIN for the same supplier name), the engine proposes the likely correct value
- **Business impact:** Whether this blocks ITC fully, partially, or merely creates a filing inconsistency
- **ITC impact in rupees:** The exact amount at risk, calculated against the invoice's GST amount

---

## 6.3 HSN Code Validation & Auto-Correction Engine

### Purpose

HSN (Harmonized System of Nomenclature) codes determine the applicable GST rate for a product. An incorrect HSN code can result in the wrong tax rate being applied, mismatches against supplier filings, and blocked ITC during reconciliation — and is one of the most common, hardest-to-self-diagnose error types for a non-expert.

### HSN Verification

Every extracted HSN code is checked against a locally embedded HSN master database (sourced from the public CBIC-GST HSN/SAC code list, loaded into SQLite at build time). The check confirms the code exists and is correctly formatted (4, 6, or 8 digits depending on turnover-based reporting requirements).

### Category Matching

The product description extracted from the invoice is semantically compared (via LLM reasoning) against the official category description tied to the invoice's stated HSN code. A mismatch here — e.g., an invoice for "cooking oil" tagged with an HSN code belonging to "industrial lubricants" — is flagged even if the code itself is technically valid.

### GST Slab Validation

The GST rate printed on the invoice is checked against the official rate associated with the HSN code in the master database. A mismatch (e.g., 18% charged on an item whose HSN code is officially taxed at 5%) is flagged as a slab error.

### Product Description Matching

Combines OCR-extracted free text with LLM semantic similarity scoring against CBIC category definitions to catch cases where the HSN code is plausible-looking but inconsistent with what was actually sold.

### Auto-Correction Logic

When an error is detected, the engine:

1. Looks up the most probable correct HSN code based on product description matching against the master database.
2. Passes the candidate correction to Groq for a final plausibility check and Hindi-language explanation generation.
3. Triggers ReportLab to generate a corrected invoice PDF reflecting the suggested HSN code and recalculated GST amount, ready for the user to reference or forward to the supplier.

### Business Impact

Incorrect HSN codes cause three compounding problems: (1) the wrong tax rate may be paid, creating either an overpayment or an underpayment liability; (2) GSTR-2B reconciliation will flag a mismatch against the supplier's filed return, since the supplier's own filing will reflect their version of the HSN/rate; and (3) the ITC claimed against the invoice may be partially or fully disallowed on audit. Each of these is translated into a single rupee figure shown to the user, since "wrong tax rate" alone is meaningless to a non-expert.

---

## 6.4 Invoice vs GSTR-2B Reconciliation Engine

### Purpose

GSTR-2B is the government's auto-drafted statement of ITC available to a business based on what its suppliers have filed. Reconciling a trader's own invoice records against GSTR-2B is the single most important — and most manually tedious — step in ensuring no legitimate ITC is missed and no ineligible ITC is wrongly claimed.

### Matching Logic

The user uploads their GSTR-2B (downloaded from the GST portal, or a realistic mock file for demo purposes per the hackathon's simulation clause). The file is parsed with Pandas into a structured DataFrame and matched against the user's invoice database on a composite key of supplier GSTIN + invoice number, with a fallback fuzzy match on supplier name + invoice amount + date proximity for cases with minor data entry variance.

### Missing Invoice Detection

An invoice exists in Hisably's database (because the user received and processed it) but does not appear in GSTR-2B — meaning the supplier has not yet filed their corresponding GSTR-1. This is flagged as **Missing Invoice**, and ITC against it is treated as **pending**, not yet claimable.

### GSTIN Mismatch Detection

The supplier filed using a different GSTIN than the one printed on the invoice the trader received. This is flagged as **GSTIN Mismatch** and treated as **fully blocked** until resolved, since the portal will not match ITC across different GSTINs.

### Amount Mismatch Detection

The ITC amount reflected in GSTR-2B for a given invoice is lower than what the invoice itself states. This is flagged as **Amount Mismatch**, with the difference treated as **partially blocked**.

### Supplier Filing Issues

Patterns across multiple invoices from the same supplier (e.g., consistently late filing, consistently understated amounts) are aggregated and surfaced to the Supplier Reliability Indicator (Section 6.8) rather than treated as one-off invoice issues.

### Reconciliation Workflow

1. User uploads GSTR-2B file.
2. Pandas parses and normalizes the file into a common schema.
3. Engine performs supplier-wise, invoice-wise matching against the invoices table.
4. Each unmatched or partially matched record generates a `mismatches` row with type, amount delta, and resolution status.
5. Groq generates a Hindi explanation and recommended action for every mismatch.
6. Results populate the GSTR-2B Reconciliation Dashboard (Screen 7) and feed the ITC Recovery Engine (Section 6.5).

---

## 6.5 ITC Recovery & Loss Tracking Engine

### Purpose

Aggregate every signal from the validation, reconciliation, and anomaly-detection engines into a single, always-current view of the trader's ITC position — answering the only question that actually matters to the user: *"How much money is at stake, and what do I do about it?"*

### Eligible ITC

The sum of GST amounts across all invoices that are validated, matched in GSTR-2B, and not flagged by the anomaly detector. This is ITC the trader can confidently claim.

### Blocked ITC

ITC currently unavailable due to an unresolved HSN error, GSTR-2B mismatch (GSTIN mismatch, amount mismatch, missing invoice), or an uncleared anomaly flag. Blocked ITC is broken down by cause so the user understands *why*, not just *how much*.

### Recoverable ITC

A subset of Blocked ITC where the engine has identified a concrete corrective action (e.g., "ask supplier to refile with correct GSTIN") that would unlock the amount. Recoverable ITC is distinguished from ITC that is blocked for reasons outside the trader's near-term control (e.g., waiting on a supplier's filing cycle).

### Recovery Prioritization

Recoverable ITC items are ranked by rupee value, descending, and surfaced as a prioritized action list: *"Fix these 3 invoices to recover ₹4,200 this month."* Each item deep-links to either the corrected-invoice draft or the supplier messaging flow.

### Business Impact Analysis

Monthly and cumulative views show ITC actually recovered as a direct result of using Hisably, framed against the cost of a CA retainer — directly supporting the product's core value narrative ("CA cost saved").

---
## 6.6 Multilingual GST Reasoning Engine

### Purpose

This is the single most important trust-building component of Hisably. The user must never receive raw, technical GST language. Every output — regardless of which engine generated the underlying finding — passes through this reasoning layer before reaching the user, ensuring a consistent four-part structure and a consistent tone in both Hindi and English.

### Required Output Structure

Every user-facing explanation generated by the Multilingual GST Reasoning Engine follows this fixed structure:

1. **Problem:** What specifically is wrong, stated in plain language.
2. **Cause:** Why it happened (supplier error, data entry issue, filing delay, etc.) — informed by the Root Cause Analysis Engine (Section 6.7).
3. **Business Impact:** The exact rupee amount at stake, and whether it is fully blocked, partially blocked, or merely a filing inconsistency.
4. **Recommended Action:** A single, concrete next step the user can take, with a one-tap path to execute it inside the app.

### Worked Examples

**Example 1 — HSN Error (Hindi)**

> **Samasya:** Sharma Traders ki invoice (#INV-2231) mein HSN code galat hai.
> **Karan:** Invoice mein "khaane ka tel" (cooking oil) ke liye aisa HSN code use hua hai jo industrial lubricants ke liye hota hai.
> **Asar:** Isse ₹2,400 ka ITC block ho sakta hai jab tak yeh sahi nahi hota.
> **Karwaayi:** Hum aapke liye corrected invoice draft kar dete hain — supplier ko bhejne ke liye tap karein.

**Example 2 — Same Finding (English)**

> **Problem:** Invoice #INV-2231 from Sharma Traders has an incorrect HSN code.
> **Cause:** The invoice uses an HSN code meant for industrial lubricants on a line item described as cooking oil.
> **Impact:** This may block ₹2,400 in ITC until corrected.
> **Action:** We've drafted a corrected invoice — tap to send it to your supplier for confirmation.

**Example 3 — GSTR-2B Missing Invoice (Hindi)**

> **Samasya:** Gupta Distributors ki invoice (#INV-4410) GSTR-2B mein nahi dikh rahi.
> **Karan:** Aisa lagta hai ki supplier ne abhi tak apna GSTR-1 file nahi kiya hai.
> **Asar:** ₹1,850 ka ITC abhi claim nahi ho sakta, jab tak supplier file nahi karte.
> **Karwaayi:** Hum supplier ko reminder bhej sakte hain — tap karein "Supplier ko yaad dilaayein."

The same JSON schema (problem, cause, impact_rupees, action_label, action_deeplink) is used internally regardless of output language, ensuring frontend rendering logic does not need language-specific branching.

---

## 6.7 Root Cause Analysis Engine

### Purpose

A naive system would always blame the supplier, since supplier-side filing and invoicing errors are the most common source of mismatches. Hisably explicitly avoids this, both because it is often inaccurate and because it would damage supplier relationships the trader depends on. The Root Cause Analysis Engine reasons about *who* most plausibly caused an issue before any blame-implying language or message is generated.

### Classification Categories

| Category | Typical Signal Pattern |
|---|---|
| Possible Supplier Error | The error pattern (wrong GSTIN, wrong HSN, late filing) recurs across multiple invoices from the same supplier but not across other suppliers, suggesting a systemic issue on the supplier's end |
| Possible Store Owner Error | The discrepancy correlates with manual edits made by the user after OCR extraction, or with a low OCR confidence score on the original field, suggesting the error originated in capture or correction, not the source document |
| Shared Responsibility | E.g., the original invoice was correct, but a low-confidence OCR extraction combined with the user not reviewing a flagged field led to bad data entering the system |

### Confidence Score

Each root-cause classification carries a confidence score (0–100%) derived from: (a) how many other invoices from the same supplier show the same error pattern, (b) the OCR/extraction confidence score for the specific field in question, and (c) whether the user manually edited the field after extraction.

### Reasoning Output

The engine produces a short internal reasoning trace (not necessarily shown to the user, but available for transparency/debugging and for CA-facing reports), e.g.: *"This supplier has had 3 of their last 5 invoices flagged for GSTIN mismatch; this pattern is highly supplier-side. Confidence: 85%."*

### Recommended Next Step

The root cause classification directly determines what the Supplier Correction Recommendation Engine and Auto Message Generator produce — a high-confidence supplier-side error generates a corrective message to the supplier, while a high-confidence store-owner-side error instead prompts the user to review and re-edit the field themselves, with no message sent to the supplier at all.

---

# FEATURE: SUPPLIER RELIABILITY INDICATOR

## 6.8 Supplier Reliability Indicator

### Purpose

Identify, over time, which suppliers are consistently causing ITC losses for the trader — turning a scattered series of one-off error notifications into a structured, actionable view of supplier-level risk.

### Scoring Categories

| Category | Color | Meaning |
|---|---|---|
| Reliable Supplier | Green | Consistently accurate invoices, on-time filing, no recurring issues |
| Moderate Risk Supplier | Yellow | Occasional errors or delays; worth monitoring but not yet a serious concern |
| High Risk Supplier | Red | Frequent, recurring errors causing repeated ITC blockage; needs direct intervention |

### Scoring Factors

| Factor | Weight Rationale |
|---|---|
| Missing invoices (not filed in GSTR-2B) | Directly blocks ITC; weighted heavily |
| GSTIN errors | Fully blocks ITC; weighted heavily |
| HSN mismatches | Partially blocks ITC and creates compliance risk; moderate weight |
| Delayed filings | Indicates systemic supplier-side process issues; moderate weight |
| Blocked ITC caused (cumulative ₹) | Direct rupee impact attributable to this supplier; heavily weighted |
| Frequency of corrections needed | Indicates the supplier's data quality trend over time; moderate weight |

The composite score is computed on a rolling 90-day window per supplier, recalculated whenever a new invoice from that supplier is processed or a GSTR-2B reconciliation completes, and stored in the `suppliers` table's health-score fields (see Section 13).

### Outputs

- **Supplier Health Dashboard:** A ranked list of all suppliers with their current color status, total ITC blocked attributable to them (lifetime and trailing 90 days), and trend direction (improving/worsening).
- **Supplier Risk Report:** A detailed, exportable breakdown per supplier showing every invoice-level issue that contributed to their score — useful both for the trader's own reference and as a CA-shareable artifact.
- **Suggested Actions:** Context-aware recommendations such as: "Contact supplier," "Request revised invoice," "Monitor closely," or, for chronic Red-status suppliers, "Consider alternate supplier."

### Full Workflow

1. Every processed invoice updates the originating supplier's rolling error counters.
2. Every GSTR-2B reconciliation cycle updates filing-timeliness and amount-accuracy counters per supplier.
3. The scoring function recomputes the composite 0–100 health score and maps it to Green/Yellow/Red.
4. If a supplier crosses from Green/Yellow into Red, an immediate notification is generated for the trader.
5. The Supplier Health Dashboard (accessible from the main navigation) reflects updated scores in near real time.
6. The trader can drill into any supplier to see the full Supplier Risk Report and trigger a suggested action directly.

---

# FEATURE: SUPPLIER CORRECTION RECOMMENDATION ENGINE

## 6.9 Supplier Correction Recommendation Engine

### Purpose

When the Root Cause Analysis Engine determines that a supplier is responsible (or jointly responsible) for an issue, this engine converts that finding into a structured, ready-to-act-on recommendation — bridging the gap between "we found a problem" and "here is exactly what you should ask the supplier to do."

### Output Structure

For every supplier-attributable issue, the engine generates:

- **Problem summary:** A one-line plain-language statement of the issue.
- **Cause analysis:** The Root Cause Engine's reasoning, simplified for the user.
- **Suggested correction:** The specific fix needed (e.g., "reissue invoice with GSTIN 27ABCDE1234F1Z5 instead of the one currently printed").
- **Supplier instructions:** A ready-to-send instruction written as if speaking directly to the supplier, suitable for forwarding verbatim.

### Worked Example

> **Issue:** Wrong GSTIN on invoice #INV-2231.
> **Cause:** GSTIN printed on invoice does not match GSTIN under which Sharma Traders has filed their GSTR-1 for this period.
> **Recommendation:** Please revise and resend the invoice with GSTIN 09AAACH7409R1ZZ.
> **Supplier Instructions (ready to send):** "Sharma ji, namaste. Aapki invoice #INV-2231 mein GSTIN thoda alag hai jo aapne GST portal pe file kiya hai. Kripya sahi GSTIN ke saath invoice phir se bhejiye. Dhanyavaad."

### Workflow

1. Root Cause Analysis Engine flags an issue as supplier-attributable with confidence above a configurable threshold (default 60%).
2. Supplier Correction Recommendation Engine generates the four-part output above via Groq, using the invoice's extracted fields and the supplier's historical record as context.
3. The recommendation is surfaced in the Invoice Validation Center (Screen 6) and the Supplier Health Dashboard.
4. The user reviews and either accepts the recommendation as-is (triggering the Auto Message Generator) or edits it before sending.

---

# FEATURE: AUTO MESSAGE GENERATOR

## 6.10 Auto Message Generator

### Purpose

Expands the supplier messaging capability into a full ready-to-send communication layer, removing the last manual step between "we know what's wrong" and "the supplier has been told."

### Supported Channels

- WhatsApp messages (primary, via Twilio WhatsApp API)
- SMS messages (fallback for suppliers without WhatsApp, via Twilio SMS)
- Email drafts (for suppliers who prefer email; rendered as a draft the user reviews and sends via their own email client, since email sending is out of scope for MVP infrastructure)

### Generation Logic

When a supplier is determined to be responsible for an issue (per Section 6.9), the Auto Message Generator:

1. Takes the Supplier Correction Recommendation Engine's output as input.
2. Renders it into a polished, respectful Hindi (or English, per user preference) message using a fixed template plus Groq-generated specifics.
3. Presents the drafted message to the user for review before sending — messages are never sent automatically without explicit user confirmation, to preserve trust in supplier relationships.

### Worked Example

> Dear Supplier,
>
> Invoice #INV-2231 contains a GSTIN mismatch. Please issue a corrected invoice at the earliest so we can process payment and claim the applicable tax credit.
>
> Thank you,
> [Trader Business Name]

### Workflow

1. User taps "Send to Supplier" from any flagged invoice or from the Supplier Health Dashboard.
2. Auto Message Generator renders a draft in the user's preferred channel and language.
3. User reviews, optionally edits, and confirms send.
4. Message is dispatched via Twilio (WhatsApp/SMS) or copied to clipboard for email use.
5. A `tasks` record is created with type `supplier_correction_followup`, allowing the user to track whether the supplier responded and resent a corrected invoice.

---
## 6.11 Fake Invoice / Anomaly Detection Engine

### Purpose

Protect the trader from fraudulent, duplicated, or erroneous invoices before ITC is claimed against them — a layer of protection the GST portal does not provide for small traders today.

### Model & Features

An Isolation Forest model (scikit-learn) is trained on each user's own invoice history. Feature vector per invoice: amount, supplier identifier, GST rate, item category, and frequency of invoices from that supplier in the trailing period. Each new invoice receives an anomaly score at ingestion time.

### Flag Conditions

| Flag | Trigger |
|---|---|
| Duplicate invoice number | Same invoice number reused by the same supplier |
| Abnormal amount | Invoice amount is 3x or more above that supplier's rolling average |
| GST rate inconsistency | Charged rate doesn't match the expected rate for the item category (e.g., 18% on an item type that should be 5%) |
| Unusually large first invoice | A brand-new supplier's very first invoice is disproportionately large relative to typical first-invoice patterns |
| GSTIN format failure | Regex validation against the 15-character format fails |

### User-Facing Behavior

Flagged invoices display a warning in Hindi: *"Yeh invoice suspicious lagti hai — verify karo pehle ITC claim karne se."* Crucially, ITC from a flagged invoice is **excluded from the Eligible/Recoverable ITC totals** in the ITC Recovery Engine until the user manually reviews and clears the flag, preventing the dashboard from ever overstating real, claimable ITC.

---

## 6.12 Compliance Risk Indicator

### Purpose

Distill the trader's overall compliance health into a single 0–100 score with a clear color tier, so the user always has a one-glance answer to "am I in trouble?"

### Scoring Formula

| Component | Weight |
|---|---|
| Number of unresolved GSTR-2B mismatches | 40% |
| Unresolved HSN errors | 25% |
| Days remaining until next filing deadline | 20% |
| Uncleared anomaly flags | 15% |

### Score Tiers

| Score Range | Risk Level | UI Color | Auto-Action |
|---|---|---|---|
| 0–30 | Low | Green | None |
| 31–60 | Medium | Yellow | Reminder notification in 3 days |
| 61–85 | High | Orange | Daily reminders + WhatsApp alert |
| 86–100 | Critical | Red | Immediate WhatsApp alert + task auto-created |

The score is recalculated whenever any contributing input changes (new mismatch detected, deadline approaches, flag cleared) and is cached in Redis for fast dashboard rendering, with PostgreSQL as the source of truth.

---

## 6.13 Vernacular Voice RAG Chatbot

### Purpose

Allow the trader to ask natural-language questions about their own financial situation — in Hindi, English, or Hinglish — without navigating any menu structure, and receive a personalized, data-grounded answer.

### Voice Flow

1. User presses the microphone button in the app; audio is recorded locally.
2. Audio is sent to the backend and transcribed via the OpenAI Whisper API (Hindi/Hinglish-capable).
3. Transcribed text is embedded using Sentence Transformers (`paraphrase-multilingual-MiniLM-L12-v2`).
4. The embedding is used to query Pinecone for the top-5 most relevant chunks from the user's own personal namespace.
5. Retrieved context plus the original query is sent to Groq (Llama 3.1 70B) with a Hindi-default system prompt.
6. The generated answer is displayed as text and converted to spoken Hindi audio via gTTS, then auto-played.

### Example Queries Supported

| Query (Hindi/Hinglish) | What Is Retrieved |
|---|---|
| "Is mahine kitna ITC miss hua?" | ITC Recovery Engine's current-month summary; exact rupee amount and contributing invoices |
| "Sharma ka kitna baki hai?" | Sharma's outstanding payment tasks and balance from the Payment Task Manager |
| "Sabse zyada kharcha kahan gaya?" | Invoice data aggregated by category/supplier for the relevant period |
| "Filing mein kitna time baki hai?" | Compliance Risk Indicator's deadline component and current readiness score |

---

## 6.14 GST Knowledge RAG Pipeline

### Purpose

The Voice RAG Chatbot (Section 6.13) answers questions about the user's *own* data. But when a user asks a procedural GST question — "GSTR-3B ki deadline kya hai?" or "Kya mujhe reverse charge apply karna hai?" — the system must not hallucinate an answer, since incorrect GST guidance carries real penalty risk for the user. This pipeline grounds all procedural answers in authoritative government sources.

### Knowledge Sources (Pre-Indexed at Build Time)

- CBIC GST circulars and notifications (public domain, cbic.gov.in/resources)
- CGST Rules 2017 (consolidated PDF, public domain)
- GST FAQs published by CBIC (sector-wise, plain language)
- CBIC HSN classification handbook (also used to cross-validate the HSN Corrector in Section 6.3)

### Pipeline

1. CBIC source documents are chunked (500 tokens, 50-token overlap) and embedded at build time using Sentence Transformers (`paraphrase-multilingual-MiniLM-L12-v2`).
2. Embeddings are stored in a dedicated Pinecone namespace, `gst_knowledge`, kept entirely separate from any user's personal financial namespace.
3. At query time, the chatbot retrieves in parallel from both `gst_knowledge` (for procedural grounding) and the user's `user_{id}_*` namespaces (for personal data), merging both result sets into a single context window sent to Groq.
4. The Groq system prompt explicitly instructs: *"Answer only from the provided context. If the answer is not in context, say so in Hindi."* This is a hard constraint designed to prevent hallucinated GST guidance.

This pipeline is treated as a non-negotiable trust feature: an MSME owner acting on incorrect GST advice could face real financial penalties, so grounding in CBIC source material is mandatory, not optional.

---

## 6.15 Payment Task Manager & Proof-Based Ledger

### Purpose

Track every supplier payment obligation and every correction task to completion, with documented proof attached to each — closing the loop between "we found an issue" and "it is actually resolved."

### Payment Task Manager

Auto-generates payment tasks from two sources: GSTR-2B analysis (suppliers owed payment, inferred from invoice data) and manual user entries. Each task carries: supplier name, amount due, due date, payment details (UPI/bank, stored on first entry for reuse), and status (`open`, `in_progress`, `done`).

- **Pay Now (Phase 2 roadmap):** A Razorpay integration is planned for Phase 2 but is explicitly out of scope for the hackathon MVP, and is not demonstrated in the demo to avoid misrepresenting live payment capability to judges. In the MVP, the task manager only captures *proof* of payments made externally.
- **Payment success (external):** When proof is uploaded confirming a payment was made, the task is auto-marked `done`, the transaction reference is saved, and the supplier receives an automated WhatsApp confirmation via the Auto Message Generator.
- **Cash payment entry:** The user can type a natural Hindi phrase such as *"cash diye Sharma ko 500"*; Groq parses the party name and amount, creates a cash ledger entry, and marks the corresponding task `done`.

### Proof-Based Ledger

| Payment Method | Proof Type | How Captured |
|---|---|---|
| Razorpay (Pay Now) | Transaction ID + amount + timestamp | Planned for Phase 2; not demonstrated in hackathon MVP |
| GPay / UPI screenshot | Screenshot image with extracted amount/receiver | Google Vision API OCR on the uploaded screenshot; extracted fields saved alongside the image |
| Cash | Natural language entry | Groq parses free text into a structured cash ledger entry with timestamp |

A monthly summary is auto-generated showing: total online payments, total cash payments, outstanding balance across all open tasks, and ITC saved versus the equivalent CA cost for the period — directly supporting the product's core value narrative.

---

# 7. Functional Requirements

This section consolidates the engines above into discrete, testable functional requirements, grouped by capability area. Each requirement is written so that it can be directly mapped to an acceptance test.

## 7.1 Invoice Ingestion

| ID | Requirement |
|---|---|
| FR-1.1 | The system shall accept invoice images via camera capture, gallery upload, and WhatsApp-forwarded photos. |
| FR-1.2 | The system shall accept PDF invoices, both digitally generated and scanned. |
| FR-1.3 | The system shall extract supplier name, GSTIN, invoice number, date, invoice amount, taxable value, GST amount, HSN code, and product description from every ingested invoice. |
| FR-1.4 | The system shall assign and display a confidence score for each extracted field. |
| FR-1.5 | The system shall flag any field below a 70% confidence threshold for manual user review before it is used in any downstream calculation. |
| FR-1.6 | The system shall allow the user to manually edit any extracted field. |
| FR-1.7 | The system shall allow the user to export the structured invoice data as JSON or as a corrected PDF. |

## 7.2 Validation Engines

| ID | Requirement |
|---|---|
| FR-2.1 | The system shall validate GSTIN format, length, state code, and checksum on every invoice. |
| FR-2.2 | The system shall detect duplicate invoice numbers per supplier. |
| FR-2.3 | The system shall validate HSN codes against a CBIC-sourced master database. |
| FR-2.4 | The system shall flag GST rate mismatches between the invoice and the official rate for the matched HSN code. |
| FR-2.5 | The system shall flag semantic mismatches between product description and HSN category. |
| FR-2.6 | The system shall generate a corrected invoice PDF when an HSN or GSTIN correction is identified. |

## 7.3 Reconciliation & ITC

| ID | Requirement |
|---|---|
| FR-3.1 | The system shall allow the user to upload a GSTR-2B file (Excel/CSV/PDF). |
| FR-3.2 | The system shall reconcile uploaded GSTR-2B data against the user's invoice database and classify each discrepancy as Missing Invoice, GSTIN Mismatch, or Amount Mismatch. |
| FR-3.3 | The system shall calculate and display Eligible ITC, Blocked ITC, and Recoverable ITC at all times. |
| FR-3.4 | The system shall generate a prioritized, rupee-sorted action list of recoverable ITC items. |
| FR-3.5 | The system shall exclude anomaly-flagged invoices from Eligible/Recoverable ITC totals until the flag is manually cleared. |

## 7.4 Root Cause, Supplier, and Messaging

| ID | Requirement |
|---|---|
| FR-4.1 | The system shall classify each detected issue's likely root cause as Supplier Error, Store Owner Error, or Shared Responsibility, with an associated confidence score. |
| FR-4.2 | The system shall maintain a rolling supplier reliability score (Green/Yellow/Red) per supplier, recalculated on every new invoice or reconciliation event. |
| FR-4.3 | The system shall generate a supplier-specific recommendation (problem, cause, suggested correction, supplier instructions) for every supplier-attributable issue above a confidence threshold. |
| FR-4.4 | The system shall generate ready-to-send WhatsApp, SMS, or email draft messages for supplier-attributable issues, requiring explicit user confirmation before sending. |

## 7.5 Anomaly Detection & Compliance Risk

| ID | Requirement |
|---|---|
| FR-5.1 | The system shall score every new invoice for anomalies using a per-user Isolation Forest model. |
| FR-5.2 | The system shall flag duplicate invoice numbers, abnormal amounts, GST rate inconsistencies, unusually large first invoices, and GSTIN format failures. |
| FR-5.3 | The system shall compute a 0–100 Compliance Risk score from unresolved mismatches, unresolved HSN errors, days to deadline, and uncleared anomaly flags. |
| FR-5.4 | The system shall trigger tiered notifications (none/reminder/daily/immediate) based on the Compliance Risk score band. |

## 7.6 Conversational & Voice

| ID | Requirement |
|---|---|
| FR-6.1 | The system shall accept voice input in Hindi/Hinglish and transcribe it via Whisper API. |
| FR-6.2 | The system shall retrieve relevant personal financial context from Pinecone using semantic search scoped to the authenticated user only. |
| FR-6.3 | The system shall retrieve procedural GST knowledge from a separate, shared `gst_knowledge` namespace when the query is procedural rather than personal. |
| FR-6.4 | The system shall refuse to answer procedural GST questions not grounded in retrieved context, explicitly stating so in Hindi. |
| FR-6.5 | The system shall return chatbot responses as both text and synthesized Hindi audio. |

## 7.7 Payments & Tasks

| ID | Requirement |
|---|---|
| FR-7.1 | The system shall auto-generate payment and correction tasks from reconciliation and validation outputs. |
| FR-7.2 | The system shall accept proof of payment via screenshot upload (with OCR extraction) or natural-language cash entry. |
| FR-7.3 | The system shall mark tasks `done` only when valid proof is attached. |
| FR-7.4 | The system shall send an automated supplier payment confirmation upon task completion. |
| FR-7.5 | The system shall NOT initiate or process live payments in the MVP; "Pay Now" functionality is explicitly deferred to Phase 2 and shall not appear as a functioning control in the MVP build. |

---

# 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Invoice OCR-to-structured-JSON pipeline shall complete in under 10 seconds for a clear printed invoice and under 20 seconds for a low-quality WhatsApp photo, under normal load. |
| Performance | GSTR-2B reconciliation for up to 2,000 invoices shall complete in under 60 seconds. |
| Availability | Core API endpoints shall target 99% uptime during the demo and pilot phase, acknowledging free-tier infrastructure constraints. |
| Scalability | The system shall support at least 100 concurrent users on free-tier infrastructure without functional degradation, with a clear scaling path (paid tiers of Supabase/Pinecone/Upstash) documented for growth beyond MVP. |
| Usability | All user-facing text shall default to Hindi, with an explicit toggle to English; no screen shall require English reading comprehension to operate. |
| Accessibility | All primary touch targets shall be a minimum of 44x44 px; font sizes shall default to a minimum of 16px for body text to support older users. |
| Data Integrity | No invoice field with a confidence score below the configured threshold shall be used in ITC, reconciliation, or compliance-score calculations without explicit user confirmation. |
| Security | All requirements in Section 16 (Security & Data Protection) are treated as baseline, non-negotiable NFRs, not optional hardening. |
| Maintainability | All AI-generated outputs (Hindi explanations, corrected PDFs, supplier messages) shall be logged with the prompt/response pair for debugging and quality auditing, excluding raw PII per Section 16.3. |
| Localization | The system architecture shall allow additional languages (Marathi, Gujarati, Tamil) to be added in Phase 3 by extending the embedding model and prompt templates, without requiring a rearchitecture of the reasoning engines. |

---
# 9. Frontend Product Specification

## 9.1 Design Philosophy

The Hisably interface is built around one constraint above all others: the primary user is a busy, non-technical, possibly Hindi-first, possibly older small business owner using a mid-range Android phone — not a tech-savvy early adopter. Every design decision is filtered through this lens.

**The UI must be:**

- Simple — one primary action per screen wherever possible
- Minimal — no decorative elements that don't carry information
- Business-first — money and action items are always the most visually prominent elements
- Hindi-friendly — Devanagari script rendering is tested and prioritized, not an afterthought
- Senior-citizen friendly — large text, large touch targets, high contrast
- Low cognitive load — no screen requires the user to hold more than 2–3 pieces of information in mind at once
- Easy to learn — first-time use should require no tutorial beyond a single guided onboarding flow

**The UI must avoid:**

- Heavy gradients
- Fancy animations that delay perceived responsiveness
- Visual clutter — no more than one card-based metric grouping per screen fold

**Color Palette**

| Color | Usage |
|---|---|
| White | Primary background |
| Light Blue | Primary actions, navigation highlights |
| Soft Green | Positive states (Eligible ITC, Reliable Supplier, Low Risk) |
| Light Gray | Secondary backgrounds, disabled states, dividers |
| Soft Orange/Red | Reserved strictly for risk and alert states (Blocked ITC, High Risk Supplier, Critical Compliance Score) — never used decoratively |

**Typography & Touch Targets**

- Minimum body text size: 16px (scalable to 20px via an in-app accessibility setting)
- Minimum touch target: 44x44 px for all primary buttons
- Font: a Devanagari-compatible system font (e.g., Noto Sans) to ensure consistent Hindi rendering across Android device manufacturers

---

# 10. App Screens

## Screen 1: Landing Page

**Purpose:** First impression for new users arriving via referral link, app store, or shared WhatsApp message; establishes trust and the core value proposition before requesting any sign-up commitment.

**Contents:**

- Product introduction: Hisably name, tagline ("Your AI GST Compliance Assistant for Small Businesses"), and a single hero visual showing an invoice transforming into a rupee-amount insight
- Problem solved: A short, plain-language statement — "GST ka jhanjhat khatam, WhatsApp pe invoice bhejo aur paisa bachao" ("End the GST hassle — send invoices on WhatsApp and save money")
- Key benefits: Three short benefit cards — "No CA needed for daily tracking," "Hindi mein samjho," "Apna paisa wapas paayein" (recover your money)
- About Us: A brief, two-sentence statement of the team's mission and the D4-PS1 problem being solved
- CTA buttons: Primary — "Shuru Karein" (Get Started); Secondary — "Already have an account? Login"

**State Behavior:** No authentication required; this screen is publicly accessible and optimized for fast load on low-bandwidth connections (compressed hero asset, no heavy JS bundles before interaction).

---

## Screen 2: Login / Signup

**Purpose:** Lowest-friction possible authentication, since requiring an email/password combination would immediately exclude a large share of the target user base.

**Contents:**

- Phone number input field (10-digit Indian mobile number, with +91 prefixed automatically)
- "OTP Bhejen" (Send OTP) button
- OTP verification screen: 6-digit input, auto-read from SMS where Android permissions allow, with a manual fallback
- Registration flow (first-time users only, triggered after OTP verification): business name, GSTIN entry with real-time format validation, preferred language (Hindi/English toggle, defaulting to Hindi)

**State Behavior:** Returning users (recognized phone number) skip directly to the Dashboard after OTP verification. First-time users proceed through the short registration flow described above before reaching the Dashboard.

---

## Screen 3: User Dashboard

**Purpose:** The single most-visited screen; must answer "where do things stand right now" within one glance, with all other screens reachable from here.

**Contents:**

- **Eligible ITC** — large, green-tinted card showing the current month's confirmed claimable ITC
- **Recoverable ITC** — orange-tinted card showing the rupee amount currently blocked but fixable, with a tap-through to the prioritized action list
- **Blocked ITC** — a smaller supporting figure showing total currently blocked ITC (superset of Recoverable), broken down by cause on tap
- **Open Tasks** — a count badge with the top 1–2 most urgent tasks previewed inline
- **Recent Alerts** — a short, reverse-chronological feed of the latest notifications (HSN errors found, supplier flagged, deadline approaching), each tappable to the relevant detail screen

**Navigation:** Bottom tab bar with five destinations — Dashboard, Invoices (Screen 4/5/6), GSTR-2B (Screen 7), Tasks (Screen 9), and a floating action button for the Voice Assistant (Screen 10), reachable from any screen.

---

## Screen 4: Invoice Upload Center

**Purpose:** The primary data-entry surface, designed to make adding an invoice take under 10 seconds of user effort.

**Methods Offered:**

- **Camera** — direct in-app capture with an on-screen guide frame to help align the invoice
- **Gallery** — select an existing photo (commonly a WhatsApp-saved image)
- **PDF Upload** — file picker scoped to PDF, supporting both scanned and digitally generated PDFs
- **Manual Entry** — a structured form fallback for the rare case where OCR is not viable (e.g., a verbal/phone-order invoice with no physical document)

**State Behavior:** Upon selecting any method, the user is taken immediately to a processing state (Section "Structured Data Viewer" below) showing a short, friendly loading message rather than a generic spinner, e.g., "Invoice padh rahe hain..." (Reading your invoice...).

---

## Screen 5: Structured Data Viewer

**Purpose:** Show the user exactly what was extracted from their invoice, build trust through transparency, and allow correction before the data is used downstream.

**Contents:**

- All extracted fields (supplier name, GSTIN, invoice number, date, amount, taxable value, GST amount, HSN code, product description), each displayed alongside its confidence score as a small inline indicator (green/yellow/red dot)
- Validation results inline beneath any flagged field (e.g., a red dot next to GSTIN with the text "Format galat lagta hai")
- **Edit** — tap any field to open an inline edit control; edits are saved immediately and re-trigger validation
- **Download JSON** — exports the structured record for external use (e.g., sharing with a CA)
- **Download PDF** — generates a clean, formatted PDF version of the structured data, useful as a personal record independent of the original photo

---

## Screen 6: Invoice Validation Center

**Purpose:** A focused, action-oriented view of every check performed on an invoice and what to do about any failures — the bridge between "we found a problem" and "it's resolved."

**Contents:**

- **GSTIN check** result with explanation (Section 6.2) and, if applicable, a suggested correction
- **HSN check** result with explanation (Section 6.3) and a "View Corrected Invoice" action if a correction was generated
- **Mandatory fields** completeness check (any missing required field, e.g., invoice date)
- **Auto-correction suggestions** displayed as a single, prominent card per issue, each with a "Supplier ko bhejein" (Send to supplier) action wired to the Auto Message Generator
- **GSTR-2B upload section** — a persistent entry point reminding the user this invoice's true ITC status will only be confirmed after their next GSTR-2B upload, with a direct link to Screen 7

---

## Screen 7: GSTR-2B Reconciliation Dashboard

**Purpose:** Surface the results of the reconciliation engine (Section 6.4) in a way that turns a dense spreadsheet comparison into an immediately actionable view.

**Contents:**

- Summary row: **Total Invoices**, **Matched Invoices**, **Mismatched Invoices**, **Missing Invoices** — four large counters at the top
- **Charts:** A simple donut chart showing the proportion of matched vs. mismatched vs. missing invoices; a bar chart showing blocked ITC by mismatch type (GSTIN mismatch, amount mismatch, missing invoice)
- **Tables:** A sortable, filterable table of all mismatched/missing records, each row showing supplier name, invoice number, mismatch type, rupee impact, and a one-tap resolution action
- **Filters:** By supplier, by mismatch type, by date range, and by resolution status (open/resolved)

---

## Screen 8: ITC Dashboard

**Purpose:** A deeper, dedicated view of ITC position than the Dashboard's summary cards — the screen a user opens specifically when thinking "how much money am I owed/losing."

**Contents:**

- **Eligible ITC** — current and historical trend (last 6 months, simple line chart)
- **Recoverable ITC** — prioritized list (highest rupee value first), each item showing the underlying cause and a direct action link
- **Blocked ITC** — breakdown by cause (HSN error / GSTIN mismatch / amount mismatch / missing invoice / anomaly flag), shown as a simple horizontal bar breakdown
- **Recovery recommendations** — the same prioritized action list surfaced on the main Dashboard, but with full detail and the ability to mark items as "in progress" or "resolved" manually if resolved outside the app

---

## Screen 9: Task Manager

**Purpose:** A single, unified to-do list spanning every actionable item the system has generated, regardless of which engine produced it.

**Contents:**

- **Contact supplier tasks** — generated from Sections 6.9/6.10, each showing the drafted message and send status
- **Filing reminders** — generated from the Compliance Risk Indicator (Section 6.12) as deadlines approach
- **Invoice correction tasks** — generated from HSN/GSTIN validation failures
- **Follow-up tasks** — generated when a supplier has been messaged but has not yet responded with a corrected invoice, auto-created with a configurable follow-up delay (default 3 days)
- **Status tracking** — each task shows status (`open`, `in_progress`, `done`), with `done` requiring attached proof per Section 6.15 for payment-type tasks

**Filters:** By status, by task type, by supplier.

---

## Screen 10: Voice Assistant

**Purpose:** A voice-first entry point to the entire product's data, designed for users who find typing or navigating menus slower or less comfortable than simply asking a question out loud, as described in Sections 6.13–6.14.

**Contents:**

- Large, centered microphone button as the primary control
- Live transcription preview as the user speaks (Hindi/English/Hinglish auto-detected)
- Response displayed as text, with simultaneous auto-played Hindi audio (toggleable off for users in shared/quiet spaces)
- A short history of recent queries for quick re-asking or follow-up

**Supported Modes:** Hindi, English, and Hinglish (mixed) input are all supported without requiring the user to select a language first — language is detected per-query.

**Complete Workflow:**

1. User taps the microphone button; recording begins with a visible waveform indicator.
2. User speaks their question; recording stops automatically on a brief silence or via a manual stop tap.
3. Audio is sent to the backend (`/chatbot/voice`), transcribed via Whisper, embedded, and matched against both the user's personal Pinecone namespace and the shared `gst_knowledge` namespace as appropriate.
4. The merged context is sent to Groq, which generates a grounded Hindi-default response following the four-part reasoning structure from Section 6.6 where applicable.
5. The response is displayed as text and converted to audio via gTTS, then auto-played.
6. The query and response are appended to the in-screen history and stored in the `voice_conversations` table (Section 13) for future context and audit purposes.

---
# 11. Backend Architecture Specification

## 11.1 Service Responsibilities

The backend is a single FastAPI application supported by Celery workers for asynchronous processing, deliberately avoiding a microservices split — appropriate for hackathon scope and for the actual load profile of an MVP serving early adopters. Responsibilities are organized into clear internal modules (not separate deployable services) to keep the codebase navigable for both human developers and AI coding agents.

| Module | Responsibility |
|---|---|
| `api/` | FastAPI route handlers — request validation, authentication checks, response shaping |
| `workers/` | Celery task definitions — OCR pipeline, GSTR-2B analysis, anomaly scoring, embedding generation |
| `engines/` | Pure business logic for each engine in Section 6 (GSTIN validator, HSN corrector, reconciliation engine, ITC calculator, root cause classifier, supplier scorer) — kept independent of FastAPI/Celery so they are independently testable |
| `integrations/` | Thin wrapper clients for external services — Groq, Google Vision, Whisper, Twilio, Pinecone, gTTS |
| `models/` | SQLAlchemy models mirroring the PostgreSQL schema in Section 13 |
| `schemas/` | Pydantic request/response schemas for the API layer |

## 11.2 API Layer

The API layer is responsible for authentication (Supabase Auth JWT verification), request validation via Pydantic schemas, rate limiting (per Section 16.4), and translating internal engine outputs into the response shapes documented in Section 15. The API layer never performs OCR, LLM calls, or heavy computation directly within a request-response cycle for any operation expected to take more than ~2 seconds — those are always offloaded to Celery.

## 11.3 Processing Layer

The processing layer consists of Celery tasks triggered either by API requests (e.g., invoice upload) or by webhook events (e.g., incoming WhatsApp message). Key tasks:

- `process_invoice_ocr(invoice_id)` — runs the full OCR + LLM extraction pipeline (Section 6.1)
- `validate_invoice(invoice_id)` — runs GSTIN and HSN validation (Sections 6.2, 6.3)
- `score_anomaly(invoice_id)` — runs the Isolation Forest scoring (Section 6.11)
- `analyze_gstr2b(upload_id)` — runs the reconciliation engine (Section 6.4)
- `recompute_supplier_score(supplier_id)` — runs the Supplier Reliability Indicator scoring (Section 6.8)
- `embed_and_upsert(record_type, record_id)` — generates embeddings and writes to the appropriate Pinecone namespace

## 11.4 AI Layer

All calls to Groq, Whisper, and Google Vision are routed through the `integrations/` module, never called directly from API route handlers or Celery tasks, so that prompt templates, retry logic, and timeout handling live in exactly one place. The AI layer is also responsible for enforcing the data-minimization rule in Section 16.3 — only extracted text fields are ever sent to Groq, never raw images.

## 11.5 Storage Layer

Three storage systems are used, each for a distinct purpose: PostgreSQL (Supabase) for all structured, relational data; Supabase Storage for raw files (invoice images, GSTR-2B uploads, payment screenshots); and Pinecone for vector embeddings supporting the RAG chatbot. Redis (Upstash) serves as both the Celery message broker and a short-lived cache for expensive, frequently-read computations (e.g., the current Compliance Risk score).

## 11.6 Workflow Layer

N8N (self-hosted) orchestrates all multi-step, trigger-based automations that span more than one internal module — for example, "on GSTR-2B upload completion, run the analyzer, then generate Hindi explanations, then push a notification." Keeping these workflows in N8N rather than hard-coded into the FastAPI app makes the trigger logic visible and editable without a code deployment, and is detailed fully in Section 12.4.

---

# 12. System Architecture

This is the most important section of this document for implementation purposes. The architecture is intentionally organized into six layers, each with a narrow, well-defined responsibility, to keep the hackathon-scope build simple while remaining clearly extensible.

## Layer 1: Client Layer

| Component | Role |
|---|---|
| React Native App (Expo) | Primary interface for all ten screens in Section 10; single codebase for Android and iOS |
| React + Tailwind Web Dashboard | Secondary, optional interface exposing the same API for desktop/CA access |
| Voice Interface | In-app microphone capture and audio playback, backed by Whisper/gTTS on the backend |

## Layer 2: API Gateway Layer

| Component | Role |
|---|---|
| FastAPI | Single entry point for all client requests and the WhatsApp webhook |
| Authentication | Supabase Auth-issued JWT verification on every protected route |
| Authorization | Row-Level Security enforced at the database layer (Section 16.2), with an additional application-layer ownership check on sensitive mutations |
| Rate Limiting | Per-user request throttling (Section 16.4) to protect free-tier external API budgets (Groq, Vision, Whisper) |

## Layer 3: Document Intelligence Layer

| Component | Role |
|---|---|
| OCR (Google Vision API) | Raw text extraction from images and scanned PDFs |
| Vision LLM / Extraction (Groq) | Converts raw OCR text into structured JSON fields |
| Field Extraction | The combined OCR + LLM pipeline described in Section 6.1 |
| Validation | GSTIN and HSN validation engines (Sections 6.2, 6.3) applied immediately after extraction |

## Layer 4: GST Intelligence Layer

| Component | Role |
|---|---|
| GSTIN Validation | Section 6.2 |
| HSN Validation | Section 6.3 |
| Reconciliation | Section 6.4 |
| ITC Engine | Section 6.5 |
| Supplier Health Engine | Section 6.8 |
| Root Cause Analysis | Section 6.7 |

## Layer 5: AI Reasoning Layer

| Component | Role |
|---|---|
| Multilingual LLM (Groq) | Powers the Multilingual GST Reasoning Engine (Section 6.6), Supplier Correction Recommendation Engine (Section 6.9), and Auto Messaging Engine (Section 6.10) |
| Voice Assistant (Whisper + gTTS) | Powers Section 6.13 |
| Recommendation Engine | Generates prioritized, rupee-sorted recovery and supplier actions |
| Auto Messaging Engine | Section 6.10 |

## Layer 6: Storage Layer

| Component | Role |
|---|---|
| PostgreSQL (Supabase) | All structured relational data — Section 13 |
| Pinecone | Vector embeddings for RAG — Section 14 |
| Redis (Upstash) | Celery broker + cache |
| Supabase Storage | Raw files — invoice images, GSTR-2B uploads, payment proof screenshots, corrected invoice PDFs |

### Layer Interaction Diagram (Text Format)

```
[React Native App] [WhatsApp via Twilio] [Web Dashboard]
            \              |               /
             \             |              /
              v            v             v
                  [ FastAPI API Gateway ]
                  (Auth, Validation, Rate Limit)
                              |
                              v
                  [ Celery Task Queue (Redis) ]
                              |
        -----------------------------------------------
        |                     |                        |
        v                     v                        v
[Document Intelligence] [GST Intelligence]   [AI Reasoning Layer]
  OCR -> LLM Extract      GSTIN/HSN Validate    Groq Multilingual
  Field Structuring       Reconciliation         Voice (Whisper/gTTS)
                          ITC Engine             Recommendations
                          Supplier Health        Auto Messaging
                          Root Cause Analysis
        |                     |                        |
        -----------------------------------------------
                              |
                              v
                  [ Storage Layer ]
        PostgreSQL | Pinecone | Redis | Supabase Storage
                              |
                              v
                  [ N8N Workflow Layer ]
        Notifications -> WhatsApp (Twilio) -> User / Supplier
```

---

# 13. Required Data Flows

## 13.1 End-to-End Invoice Flow

| Step | Action | Component |
|---|---|---|
| 1 | Supplier sends invoice photo to the trader on WhatsApp | WhatsApp (user's phone) |
| 2 | Twilio webhook fires to FastAPI `/webhook/whatsapp` | Twilio + FastAPI |
| 3 | File downloaded and saved to Supabase Storage | FastAPI + Supabase Storage |
| 4 | Celery task `process_invoice_ocr` is queued | FastAPI + Redis broker |
| 5 | Worker runs OpenCV preprocessing + Google Vision OCR | Celery + Google Vision API + OpenCV |
| 6 | Raw text sent to Groq for structured JSON extraction | Groq API |
| 7 | Extracted JSON saved to the `invoices` table | PostgreSQL (Supabase) |
| 8 | GSTIN and HSN validation engines run against the new record | Engines layer |
| 9 | If an error is found, Groq generates the four-part Hindi/English explanation; ReportLab generates a corrected PDF if applicable | Groq + ReportLab |
| 10 | Isolation Forest scores the invoice for anomalies | Scikit-learn |
| 11 | ITC engine recalculates running totals for the user | Python + PostgreSQL |
| 12 | Supplier reliability score is recalculated for the originating supplier | Engines layer |
| 13 | Invoice summary is embedded and upserted into the user's Pinecone namespace | Sentence Transformers + Pinecone |
| 14 | N8N workflow sends a Hindi WhatsApp summary/alert to the trader | N8N + Twilio |

## 13.2 End-to-End GSTR Flow

| Step | Action | Component |
|---|---|---|
| 1 | User uploads GSTR-2B file via the app | React Native + FastAPI |
| 2 | File saved to Supabase Storage; Celery task `analyze_gstr2b` queued | FastAPI + Redis |
| 3 | Pandas parses the file into a normalized DataFrame | Celery worker |
| 4 | Reconciliation engine matches against the `invoices` table, generating `mismatches` records | Engines layer + PostgreSQL |
| 5 | Groq generates a Hindi explanation and recommended action per mismatch | Groq API |
| 6 | ITC engine recalculates Eligible/Blocked/Recoverable totals incorporating the new reconciliation results | Engines layer |
| 7 | Supplier reliability scores are recalculated for every supplier with new mismatch data | Engines layer |
| 8 | Reconciliation summary is embedded and upserted into Pinecone | Sentence Transformers + Pinecone |
| 9 | N8N workflow pushes a notification summarizing total mismatches and rupee impact | N8N + Twilio |

## 13.3 End-to-End Voice Query Flow

| Step | Action | Component |
|---|---|---|
| 1 | User presses mic in the app; audio recorded | React Native |
| 2 | Audio sent to `/chatbot/voice` | FastAPI |
| 3 | Whisper API transcribes audio to Hindi/Hinglish text | OpenAI Whisper API |
| 4 | Text embedded to a 384-dim vector | Sentence Transformers |
| 5 | Pinecone queried in parallel against the user's personal namespace and `gst_knowledge` | Pinecone |
| 6 | Merged context + query sent to Groq with the grounding system prompt | Groq Llama 3.1 70B |
| 7 | Hindi response generated | Groq |
| 8 | gTTS converts the response to audio | gTTS |
| 9 | Text + audio returned to the app and auto-played | FastAPI + React Native |

## 13.4 End-to-End Supplier Alert Flow

| Step | Action | Component |
|---|---|---|
| 1 | Root Cause Analysis Engine classifies an issue as supplier-attributable above the confidence threshold | Engines layer |
| 2 | Supplier Correction Recommendation Engine generates the structured recommendation | Groq API |
| 3 | Auto Message Generator drafts a WhatsApp/SMS/email message from the recommendation | Groq API |
| 4 | Draft is surfaced to the user in the Invoice Validation Center or Supplier Health Dashboard for review | FastAPI + React Native |
| 5 | User confirms send | React Native |
| 6 | Message dispatched via Twilio (WhatsApp/SMS) | Twilio |
| 7 | A `tasks` record of type `supplier_correction_followup` is created with a default 3-day follow-up reminder | PostgreSQL |
| 8 | If no corrected invoice is received within the follow-up window, N8N escalates with a reminder to the user | N8N + Twilio |

---
# 14. Database Design (PostgreSQL Schema)

All tables below live in Supabase-managed PostgreSQL. Row-Level Security (RLS) is enabled on every table containing user-scoped data, filtering every query by the authenticated `user_id` at the database level (Section 16.2).

## 14.1 `users`

**Purpose:** Trader profile, authentication linkage, and subscription state.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | Matches Supabase Auth user ID |
| `gstin` | VARCHAR(15) | Validated on entry |
| `name` | TEXT | Business or owner name |
| `phone_number` | VARCHAR(15), unique | Used for OTP login and WhatsApp linkage |
| `preferred_language` | VARCHAR(10) | `hi` or `en`, default `hi` |
| `subscription_tier` | VARCHAR(10) | `free`, `premium`, `pro` |
| `created_at` | TIMESTAMP | |

**Relationships:** One-to-many with `invoices`, `suppliers`, `tasks`, `gstr2b_records`, `itc_summary`, `voice_conversations`, `notifications`.
**Indexes:** Unique index on `phone_number`; index on `gstin`.

## 14.2 `invoices`

**Purpose:** Every processed invoice, structured and validated.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | |
| `user_id` | UUID, FK → `users.id` | |
| `supplier_id` | UUID, FK → `suppliers.id` | Nullable until supplier is resolved/matched |
| `invoice_number` | TEXT | |
| `date` | DATE | |
| `amount` | NUMERIC(12,2) | |
| `taxable_value` | NUMERIC(12,2) | |
| `gst_amount` | NUMERIC(12,2) | |
| `hsn_code` | VARCHAR(8) | |
| `gst_percent` | NUMERIC(5,2) | |
| `product_description` | TEXT | |
| `status` | VARCHAR(20) | `processing`, `validated`, `flagged`, `corrected` |
| `confidence_scores` | JSONB | Per-field confidence map |
| `anomaly_score` | NUMERIC(5,4) | Isolation Forest output |
| `image_url` | TEXT | Signed Supabase Storage reference |
| `corrected_pdf_url` | TEXT | Nullable; populated if a correction was generated |
| `created_at` | TIMESTAMP | |

**Relationships:** Many-to-one with `users` and `suppliers`; one-to-many with `mismatches`.
**Indexes:** Index on `(user_id, status)`; index on `(supplier_id)`; index on `(user_id, date)` for time-range queries.

## 14.3 `suppliers`

**Purpose:** Supplier master record and rolling reliability score.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | |
| `user_id` | UUID, FK → `users.id` | Suppliers are scoped per trader, not shared globally |
| `gstin` | VARCHAR(15) | |
| `name` | TEXT | |
| `upi_id` | TEXT | Nullable |
| `bank_details` | JSONB | Nullable |
| `invoice_count` | INTEGER | Rolling counter |
| `error_count` | INTEGER | Rolling counter |
| `reliability_score` | NUMERIC(5,2) | 0–100, per Section 6.8 |
| `reliability_tier` | VARCHAR(10) | `green`, `yellow`, `red` |
| `total_itc_blocked` | NUMERIC(12,2) | Lifetime attribution |
| `score_updated_at` | TIMESTAMP | |

**Relationships:** One-to-many with `invoices`, `tasks`, `notifications` (where supplier-attributed).
**Indexes:** Index on `(user_id, reliability_tier)`; unique constraint on `(user_id, gstin)`.

## 14.4 `gstr2b_records`

**Purpose:** Parsed GSTR-2B data per upload, used as the comparison set for reconciliation.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | |
| `user_id` | UUID, FK → `users.id` | |
| `upload_id` | UUID | Groups records from the same upload event |
| `supplier_gstin` | VARCHAR(15) | |
| `invoice_number` | TEXT | |
| `itc_amount` | NUMERIC(12,2) | |
| `upload_date` | DATE | |
| `status` | VARCHAR(20) | `matched`, `mismatched`, `missing` |

**Relationships:** Referenced by `mismatches.gstr2b_id`.
**Indexes:** Index on `(user_id, upload_id)`; index on `(supplier_gstin, invoice_number)` for matching performance.

## 14.5 `mismatches`

**Purpose:** Discrepancies found between `invoices` and `gstr2b_records`.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | |
| `user_id` | UUID, FK → `users.id` | |
| `invoice_id` | UUID, FK → `invoices.id` | |
| `gstr2b_id` | UUID, FK → `gstr2b_records.id`, nullable | Null for `missing_invoice` type where no GSTR-2B row exists at all |
| `mismatch_type` | VARCHAR(20) | `gstin_mismatch`, `amount_mismatch`, `missing_invoice` |
| `amount_difference` | NUMERIC(12,2) | |
| `root_cause_category` | VARCHAR(20) | `supplier_error`, `store_owner_error`, `shared`, per Section 6.7 |
| `root_cause_confidence` | NUMERIC(5,2) | |
| `resolved` | BOOLEAN | Default false |
| `resolution_action` | TEXT | Nullable; logged once resolved |
| `created_at` | TIMESTAMP | |

**Relationships:** Many-to-one with `invoices`, `gstr2b_records`, `users`.
**Indexes:** Index on `(user_id, resolved)`; index on `(invoice_id)`.

## 14.6 `tasks`

**Purpose:** All actionable items — payment tasks, correction tasks, follow-ups, filing reminders.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | |
| `user_id` | UUID, FK → `users.id` | |
| `task_type` | VARCHAR(30) | `payment`, `supplier_correction_followup`, `filing_reminder`, `invoice_review` |
| `supplier_id` | UUID, FK → `suppliers.id`, nullable | |
| `related_invoice_id` | UUID, FK → `invoices.id`, nullable | |
| `amount` | NUMERIC(12,2) | Nullable for non-payment tasks |
| `due_date` | DATE | Nullable |
| `status` | VARCHAR(15) | `open`, `in_progress`, `done` |
| `proof_type` | VARCHAR(15) | `razorpay`, `screenshot`, `cash_note`, nullable until done |
| `proof_url` | TEXT | Nullable |
| `transaction_id` | TEXT | Nullable |
| `created_at` | TIMESTAMP | |
| `completed_at` | TIMESTAMP | Nullable |

**Relationships:** Many-to-one with `users`, `suppliers`, `invoices`; one-to-one with `payments` where applicable.
**Indexes:** Index on `(user_id, status)`; index on `(user_id, task_type)`.

## 14.7 `payments`

**Purpose:** Proof-based ledger entry for every completed payment.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | |
| `task_id` | UUID, FK → `tasks.id` | |
| `user_id` | UUID, FK → `users.id` | |
| `amount` | NUMERIC(12,2) | |
| `method` | VARCHAR(15) | `razorpay` (Phase 2), `gpay_screenshot`, `cash` |
| `proof_url` | TEXT | Nullable for cash entries |
| `transaction_id` | TEXT | Nullable |
| `cash_note` | TEXT | Original natural-language text for cash entries, retained for audit |
| `completed_at` | TIMESTAMP | |

**Relationships:** One-to-one with `tasks`.
**Indexes:** Index on `(user_id, completed_at)` for monthly summary queries.

## 14.8 `itc_summary`

**Purpose:** Precomputed monthly ITC totals for fast dashboard rendering.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | |
| `user_id` | UUID, FK → `users.id` | |
| `month` | DATE | First day of the month, used as a period key |
| `total_eligible` | NUMERIC(12,2) | |
| `total_blocked` | NUMERIC(12,2) | |
| `total_recoverable` | NUMERIC(12,2) | |
| `updated_at` | TIMESTAMP | |

**Relationships:** Many-to-one with `users`.
**Indexes:** Unique constraint on `(user_id, month)`.

## 14.9 `hsn_codes`

**Purpose:** HSN master database, loaded once at build time from the public CBIC CSV. Embedded as SQLite for fast local lookup, mirrored here for any joined reporting needs.

| Column | Type | Notes |
|---|---|---|
| `code` | VARCHAR(8), PK | |
| `description` | TEXT | |
| `gst_rate` | NUMERIC(5,2) | |
| `category` | TEXT | |

**Indexes:** Primary key lookup is sufficient given static, build-time-only writes.

## 14.10 `supplier_health_scores` *(historical log, supplementing the live score on `suppliers`)*

**Purpose:** Time-series record of supplier reliability scores, enabling trend display ("improving"/"worsening") on the Supplier Health Dashboard.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | |
| `supplier_id` | UUID, FK → `suppliers.id` | |
| `score` | NUMERIC(5,2) | |
| `tier` | VARCHAR(10) | |
| `computed_at` | TIMESTAMP | |

**Indexes:** Index on `(supplier_id, computed_at)`.

## 14.11 `ai_recommendations`

**Purpose:** Stores every generated recommendation (root cause explanation, supplier correction, auto-message draft) for audit, re-display, and quality review.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | |
| `user_id` | UUID, FK → `users.id` | |
| `related_invoice_id` | UUID, FK → `invoices.id`, nullable | |
| `related_supplier_id` | UUID, FK → `suppliers.id`, nullable | |
| `recommendation_type` | VARCHAR(30) | `root_cause`, `supplier_correction`, `auto_message` |
| `content_hi` | TEXT | |
| `content_en` | TEXT | |
| `action_label` | TEXT | |
| `action_deeplink` | TEXT | |
| `created_at` | TIMESTAMP | |

**Indexes:** Index on `(user_id, recommendation_type)`.

## 14.12 `notifications`

**Purpose:** All push/WhatsApp notifications sent to a user, for in-app feed display and delivery auditing.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | |
| `user_id` | UUID, FK → `users.id` | |
| `channel` | VARCHAR(15) | `whatsapp`, `sms`, `in_app` |
| `notification_type` | VARCHAR(30) | `hsn_error`, `mismatch_found`, `supplier_flagged`, `deadline_reminder`, `compliance_critical` |
| `content` | TEXT | |
| `related_entity_id` | UUID | Nullable; points to the originating invoice/task/supplier |
| `sent_at` | TIMESTAMP | |
| `read_at` | TIMESTAMP | Nullable |

**Indexes:** Index on `(user_id, sent_at)`.

## 14.13 `voice_conversations`

**Purpose:** History of voice/text chatbot queries and responses, supporting the in-screen history on Screen 10 and providing conversational context for follow-up queries.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | |
| `user_id` | UUID, FK → `users.id` | |
| `query_text` | TEXT | Transcribed or typed query |
| `query_language` | VARCHAR(10) | `hi`, `en`, `hinglish` |
| `response_text` | TEXT | |
| `retrieved_namespaces` | JSONB | Which Pinecone namespaces were queried |
| `audio_url` | TEXT | Nullable, generated response audio |
| `created_at` | TIMESTAMP | |

**Indexes:** Index on `(user_id, created_at)`.

## 14.14 `chat_history` *(text-based chatbot interactions, distinct from voice)*

**Purpose:** Mirrors `voice_conversations` for text-only chatbot interactions where no audio is generated, kept as a separate table to avoid forcing nullable audio fields onto a primarily text-based row type.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | |
| `user_id` | UUID, FK → `users.id` | |
| `query_text` | TEXT | |
| `response_text` | TEXT | |
| `retrieved_namespaces` | JSONB | |
| `created_at` | TIMESTAMP | |

**Indexes:** Index on `(user_id, created_at)`.

## 14.15 `user_preferences`

**Purpose:** Lightweight, extensible key-value store for user-level settings beyond the core fields on `users` (e.g., notification toggles, audio auto-play preference, font size).

| Column | Type | Notes |
|---|---|---|
| `user_id` | UUID, FK → `users.id`, PK part | |
| `preference_key` | VARCHAR(50), PK part | |
| `preference_value` | JSONB | |
| `updated_at` | TIMESTAMP | |

**Indexes:** Composite primary key on `(user_id, preference_key)` doubles as the lookup index.

---

# 15. Vector Database Structure (Pinecone)

A single Pinecone index is used, with 384-dimensional vectors matching the output of `paraphrase-multilingual-MiniLM-L12-v2`. All user records are namespaced by `user_id` to guarantee complete data isolation between traders at the retrieval layer, not merely at the application layer.

| Namespace | What Is Embedded | Metadata Stored |
|---|---|---|
| `user_{id}_invoices` | Invoice summary text: supplier, amount, date, HSN, status, mismatch details | `invoice_id`, `date`, `supplier_id`, `amount`, `itc_status` |
| `user_{id}_gstr` | GSTR-2B analysis results, mismatch summaries per supplier | `gstr_upload_id`, `month`, `supplier_gstin`, `mismatch_count` |
| `user_{id}_itc` | Monthly ITC summaries, recovery engine outputs | `month`, `total_eligible`, `blocked`, `recoverable` |
| `user_{id}_payments` | Payment history summaries per supplier | `task_id`, `supplier_id`, `amount`, `date`, `method` |
| `user_{id}_tasks` | Task history and resolution notes | `task_id`, `type`, `resolved_at`, `amount` |
| `gst_knowledge` | CBIC circulars, CGST Rules 2017, GST FAQs, HSN handbook (shared, not user-scoped) | `source_document`, `chunk_index`, `topic` |

**Retrieval strategy:** For every chatbot query (voice or text), the top-5 chunks are retrieved by cosine similarity from the user's personal namespaces (`user_{id}_*`) for financial questions, and from `gst_knowledge` for procedural GST questions. The query router (a lightweight intent classification step inside the Groq prompt chain) determines which namespace(s) to query — personal-only, knowledge-only, or both, merged into a single context window — ensuring personalized answers are always available while procedural answers remain strictly grounded in authoritative CBIC material.

---
# 16. API Design

All endpoints are served from a single FastAPI application. All protected endpoints require a valid Supabase Auth JWT in the `Authorization: Bearer` header. All request/response bodies are JSON unless explicitly noted (file uploads use `multipart/form-data`).

## 16.1 `POST /webhook/whatsapp`

**Purpose:** Receives incoming WhatsApp messages (invoice images, PDFs) via the Twilio webhook and queues OCR processing.

**Request:** Twilio-formatted webhook payload (form-encoded), including `From`, `MediaUrl0`, `MediaContentType0`.

**Response:** `200 OK` with an empty body (Twilio requires fast acknowledgment; processing is fully asynchronous).

**Validation:** Verifies the request originates from Twilio (signature validation header); confirms the sender's phone number maps to a registered user, otherwise logs and discards with no user-facing error (since the sender is not the app user themselves).

**Error Cases:** Invalid Twilio signature → `403 Forbidden`, logged as a security event. Unrecognized phone number → `200 OK` (to prevent Twilio retry storms) with internal logging only.

## 16.2 `POST /invoice/upload`

**Purpose:** Direct in-app upload of an invoice image or PDF, queuing the same OCR pipeline used for WhatsApp ingestion.

**Request:** `multipart/form-data` with a single `file` field (image or PDF, max 10MB).

**Response:**
```json
{
  "invoice_id": "uuid",
  "status": "processing"
}
```

**Validation:** File type restricted to JPEG, PNG, PDF; size capped at 10MB; user must be authenticated.

**Error Cases:** Unsupported file type → `415 Unsupported Media Type`. File too large → `413 Payload Too Large`.

## 16.3 `GET /invoice/list`

**Purpose:** List all processed invoices for the authenticated user, with status and anomaly scores.

**Request:** Query params: `status` (optional filter), `supplier_id` (optional filter), `page`, `page_size`.

**Response:**
```json
{
  "invoices": [
    {
      "id": "uuid",
      "supplier_name": "Sharma Traders",
      "invoice_number": "INV-2231",
      "date": "2026-06-01",
      "amount": 14160.00,
      "status": "flagged",
      "anomaly_score": 0.12,
      "confidence_scores": { "gstin": 0.92, "hsn_code": 0.65 }
    }
  ],
  "total": 47,
  "page": 1
}
```

**Validation:** Results are always scoped to `user_id` from the authenticated session (enforced both at the application layer and via RLS).

**Error Cases:** Invalid pagination parameters → `400 Bad Request`.

## 16.4 `POST /gstr2b/upload`

**Purpose:** Upload a GSTR-2B file (Excel, CSV, or PDF) to trigger the reconciliation engine.

**Request:** `multipart/form-data` with `file`.

**Response:**
```json
{
  "upload_id": "uuid",
  "status": "processing"
}
```

**Validation:** File type restricted to `.xlsx`, `.csv`, `.pdf`; max 15MB.

**Error Cases:** Unparseable file structure → `422 Unprocessable Entity` with a Hindi-translated error message suitable for direct display to the user.

## 16.5 `GET /gstr2b/mismatches`

**Purpose:** Returns the mismatch list for a given (or most recent) GSTR-2B upload, with Hindi explanations and rupee impact.

**Request:** Query params: `upload_id` (optional, defaults to most recent), `resolved` (optional boolean filter).

**Response:**
```json
{
  "mismatches": [
    {
      "id": "uuid",
      "invoice_id": "uuid",
      "supplier_name": "Gupta Distributors",
      "mismatch_type": "missing_invoice",
      "amount_difference": 1850.00,
      "explanation_hi": "Gupta Distributors ki invoice GSTR-2B mein nahi dikh rahi...",
      "explanation_en": "Gupta Distributors' invoice is not showing in GSTR-2B...",
      "recommended_action": "remind_supplier",
      "resolved": false
    }
  ]
}
```

**Error Cases:** No GSTR-2B uploads exist yet for the user → `404 Not Found` with a friendly message prompting upload.

## 16.6 `GET /itc/summary`

**Purpose:** Returns the current ITC Recovery Engine output — eligible, blocked, recoverable totals and the prioritized action list.

**Response:**
```json
{
  "total_eligible": 42500.00,
  "total_blocked": 6800.00,
  "total_recoverable": 4200.00,
  "priority_actions": [
    { "invoice_id": "uuid", "amount": 2400.00, "issue": "hsn_error", "action_label": "Corrected invoice bhejein" }
  ]
}
```

## 16.7 `GET /risk/score`

**Purpose:** Returns the Compliance Risk Indicator score (0–100) with its component breakdown.

**Response:**
```json
{
  "score": 78,
  "tier": "high",
  "breakdown": {
    "unresolved_mismatches": 32,
    "unresolved_hsn_errors": 18,
    "days_to_deadline": 18,
    "uncleared_anomalies": 10
  },
  "next_deadline": "2026-07-20"
}
```

## 16.8 `GET /tasks/list`

**Purpose:** Returns all payment and correction tasks with status, supporting the Task Manager (Screen 9).

**Request:** Query params: `status`, `task_type`, `supplier_id` (all optional filters).

**Response:**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "task_type": "supplier_correction_followup",
      "supplier_name": "Sharma Traders",
      "amount": null,
      "due_date": null,
      "status": "open"
    }
  ]
}
```

## 16.9 `POST /tasks/done`

**Purpose:** Marks a task as done, accepting the relevant proof type.

**Request:**
```json
{
  "task_id": "uuid",
  "proof_type": "screenshot",
  "proof_file": "(multipart file field if proof_type is screenshot)",
  "cash_note": "(string, required if proof_type is cash_note)"
}
```

**Validation:** `proof_type` must be one of `razorpay` (Phase 2 only — rejected in MVP build), `screenshot`, `cash_note`. A task cannot be marked done without a valid proof payload matching its declared `proof_type`.

**Error Cases:** Missing required proof field for the declared type → `400 Bad Request`. Attempt to use `razorpay` proof type in MVP build → `400 Bad Request` with message indicating this feature is not yet available.

## 16.10 `POST /chatbot/query`

**Purpose:** Text-based chatbot query — RAG retrieval plus Groq-generated response in the user's preferred language.

**Request:**
```json
{ "query": "Is mahine kitna ITC miss hua?" }
```

**Response:**
```json
{
  "response_text": "Is mahine ₹4,200 ITC miss hua hai, teen invoices ki wajah se.",
  "retrieved_namespaces": ["user_abc123_itc"],
  "grounded": true
}
```

## 16.11 `POST /chatbot/voice`

**Purpose:** Audio-based chatbot query — Whisper transcription, RAG retrieval, Groq response, gTTS audio synthesis.

**Request:** `multipart/form-data` with an audio file field (`.wav`/`.m4a`, max 60 seconds).

**Response:**
```json
{
  "transcribed_text": "is mahine kitna itc miss hua",
  "response_text": "Is mahine ₹4,200 ITC miss hua hai...",
  "audio_url": "https://...signed-url.mp3",
  "retrieved_namespaces": ["user_abc123_itc"]
}
```

**Error Cases:** Audio exceeds duration/size limit → `413 Payload Too Large`. Transcription confidence too low to process → `422 Unprocessable Entity` with a prompt to retry speaking more clearly.

## 16.12 `GET /supplier/list`

**Purpose:** Returns all suppliers with their reliability tier and invoice history summary, for the Supplier Health Dashboard.

**Response:**
```json
{
  "suppliers": [
    {
      "id": "uuid",
      "name": "Sharma Traders",
      "reliability_score": 42.0,
      "reliability_tier": "yellow",
      "total_itc_blocked": 3200.00,
      "invoice_count": 18,
      "suggested_action": "contact_supplier"
    }
  ]
}
```

## 16.13 `POST /supplier/message`

**Purpose:** Generates and sends an auto-drafted message to a supplier via the Auto Message Generator and Twilio.

**Request:**
```json
{
  "supplier_id": "uuid",
  "related_invoice_id": "uuid",
  "channel": "whatsapp",
  "edited_message": "(optional, overrides the auto-generated draft if the user edited it)"
}
```

**Response:**
```json
{
  "task_id": "uuid",
  "message_sent": true,
  "channel": "whatsapp"
}
```

**Error Cases:** Supplier has no phone number on file for WhatsApp/SMS channel → `400 Bad Request` prompting the user to add one, or falls back to generating an email draft only.

## 16.14 `GET /analytics/monthly`

**Purpose:** Returns the monthly summary — cash vs. online payment split, ITC saved, CA cost saved comparison.

**Response:**
```json
{
  "month": "2026-06",
  "cash_total": 1200.00,
  "online_total": 8400.00,
  "itc_recovered": 6800.00,
  "estimated_ca_cost_saved": 25000.00
}
```

---

# 17. Security & Data Protection

Hisably handles sensitive financial data — GSTINs, invoice amounts, payment details, and supplier relationships — for small business owners who have limited ability to detect or recover from a data breach. Security controls below are treated as MVP baseline requirements, not post-launch hardening.

## 17.1 Authentication

- All user authentication is handled by Supabase Auth via phone number + OTP, eliminating password-related attack surface entirely for the primary user flow.
- JWTs issued by Supabase Auth are short-lived (1 hour); refresh tokens are stored only in the device's secure storage (Android Keystore-backed via Expo SecureStore), never in plain local storage.

## 17.2 Authorization & Data Isolation

- **Row-Level Security (RLS)** is enabled on every user-scoped PostgreSQL table. Every query is filtered by the authenticated `user_id` at the database level, so that even an application-layer bug cannot let User A access User B's data.
- **Pinecone namespace isolation:** every personal-data namespace is scoped per user (`user_{id}_*`). RAG queries are filtered by namespace at query time — a user can never retrieve another user's invoice or financial embeddings, even via a crafted query.
- **Supabase Storage buckets are private.** Signed URLs with a 15-minute expiry are generated per request; invoice images, GSTR-2B files, and payment screenshots are never publicly accessible by guessable or persistent URL.

## 17.3 Encryption

- All data in transit is encrypted via HTTPS/TLS 1.2+; no plaintext API calls are permitted anywhere in the stack, including internal service-to-service calls where the hosting platform supports TLS termination.
- Supabase PostgreSQL encrypts data at rest by default (AES-256). Supabase Storage objects are similarly encrypted at rest.

## 17.4 No Raw Financial Data in Logs

- FastAPI request/response logging is explicitly configured to exclude invoice content, GSTIN numbers, amounts, and payment details. Only request metadata (endpoint, status code, latency, hashed `user_id`) is logged.
- Celery task payloads contain only task IDs and file storage paths, never raw extracted text or financial figures — the actual sensitive data is fetched from the database inside the worker process itself, not passed through the message queue.
- N8N workflow variables containing supplier phone numbers or rupee amounts are explicitly marked sensitive and excluded from N8N's own execution logs.
- Groq API calls send only the minimum context required to answer a given query — raw invoice images are never sent to Groq; only extracted text fields, post-OCR, are included in any LLM prompt.

## 17.5 API Security

- Rate limiting is applied per authenticated user on compute-expensive endpoints (`/invoice/upload`, `/gstr2b/upload`, `/chatbot/voice`) to protect both system stability and the cost ceiling of free-tier external APIs (Groq, Google Vision, Whisper).
- All Twilio webhook requests are validated against Twilio's signature header before any processing occurs, preventing spoofed webhook calls from injecting fake invoices into a user's account.
- Input validation via Pydantic schemas is enforced on every endpoint; no raw, unvalidated user input reaches any database query or LLM prompt template directly.

## 17.6 Secure File Handling

- Uploaded files are scanned for type/size conformance before being written to storage; executable or script file types are rejected outright regardless of declared MIME type.
- Corrected invoice PDFs and exported JSON are generated server-side from validated structured data only — never by directly modifying or re-serving an uploaded file, preventing any injection of malicious content into user-facing exports.

---

# 18. WhatsApp Integration Specification

## 18.1 Two-Directional Model

WhatsApp functions strictly as a connected peripheral channel, not as the system of record. All storage, processing, and intelligence happen inside the Hisably app and backend; WhatsApp is used only for the two flows below.

| Direction | What Flows | Technical Mechanism |
|---|---|---|
| Incoming | Invoice photos, receipts, PDFs from suppliers (forwarded by or sent directly to the trader) | Twilio WhatsApp webhook triggers the FastAPI `/webhook/whatsapp` endpoint; the file is saved to Supabase Storage; the OCR pipeline is triggered via Celery |
| Outgoing | Auto-generated supplier payment confirmations, dispute/correction drafts, ITC alerts | Groq generates the Hindi message text; Twilio sends it via the WhatsApp Business API (or Sandbox, for demo purposes) |

## 18.2 Demo vs. Production Constraint

The hackathon demo uses the **Twilio WhatsApp Sandbox** exclusively. Production deployment on the full WhatsApp Business API requires Meta Business approval, which typically takes four to six weeks and is explicitly **not guaranteed within the hackathon timeline.** This constraint is called out clearly to judges and stakeholders rather than glossed over, consistent with the product's broader commitment to transparency over impressive-sounding but unverified claims.

## 18.3 Scope Boundary

Everything other than invoice ingestion and outbound notifications/messages — GSTR-2B upload, the Task Manager, payment proof capture, the ITC Dashboard, and the Voice Assistant — lives entirely inside the Hisably app and is never exposed as a WhatsApp-native flow in the MVP. This keeps the WhatsApp integration surface small, reliable, and demoable within sandbox constraints.

---
# 19. Complete Tech Stack

## 19.1 Backend

| Technology | Purpose | Version/Tier | Cost |
|---|---|---|---|
| FastAPI (Python) | Main API server — async, REST endpoints, webhook handler | Latest stable | Free |
| Celery | Async task queue for OCR, ML, and reconciliation processing (prevents API blocking) | 5.x | Free |
| Redis (Upstash) | Celery message broker + API response cache + session store | Free tier (10K cmds/day) | Free |
| N8N (self-hosted) | Workflow automation — all triggers, scheduling, multi-step flows | Self-hosted on Railway | Free |
| ReportLab | Corrected invoice PDF generation | Latest | Free |
| PyMuPDF (fitz) | PDF text extraction (no OCR needed for digital PDFs) | Latest | Free |
| Pandas | GSTR-2B Excel/CSV parsing and data manipulation | 2.x | Free |

## 19.2 AI / ML Stack

| Technology | Purpose | Model/Config | Cost |
|---|---|---|---|
| Groq API | LLM backbone — extraction, HSN correction, Hindi reasoning output, RAG answers, supplier message drafting, NLP parsing | Llama 3.1 70B | Free tier |
| Google Vision API | Invoice image to text — Hindi + English, handles blurry/handwritten invoices | Vision API (paid per call, ~$1.50/1,000 images) | Pay-per-use |
| OpenCV | Image preprocessing before OCR — sharpen, denoise, contrast | 4.x | Free |
| Whisper (OpenAI) | Voice to text — Hindi/Hinglish support, accent-robust | `whisper-1` via API (paid per minute, ~$0.006/min) | Pay-per-use |
| gTTS | Text to speech — Hindi audio responses for the voice chatbot | Latest | Free |
| Sentence Transformers | Text embeddings for RAG vector search | `paraphrase-multilingual-MiniLM-L12-v2` | Free |
| Scikit-learn | Isolation Forest for anomaly/fake invoice detection | Latest | Free |

## 19.3 Databases

| Database | Type | What Is Stored | Platform | Cost |
|---|---|---|---|---|
| PostgreSQL | Relational SQL | Users, invoices, mismatches, tasks, payments, suppliers, HSN reference, ITC summaries | Supabase (free tier) | Free |
| Pinecone | Vector DB | Embeddings of invoices, GSTR data, ITC history, payment history (per-user namespaced) + shared GST knowledge | Pinecone free tier (100K vectors) | Free |
| Redis | Key-Value Cache | HSN lookup cache, ITC calculation cache, session tokens, Celery queue | Upstash free tier (10K cmds/day) | Free |
| SQLite | Embedded SQL | HSN code master database (static — loaded once from CBIC CSV) | Embedded in backend | Free |
| Supabase Storage | Object/File Storage | Invoice images, GSTR-2B files, GPay screenshots, corrected invoice PDFs | Supabase free tier (1GB) | Free |

## 19.4 Frontend

| Technology | Purpose | Notes |
|---|---|---|
| React Native | Mobile app (Android + iOS from a single codebase) | Primary interface; all ten screens live here |
| React + Tailwind | Web dashboard (optional, same API) | For CA/power-user access; responsive design |
| Expo | React Native build and dev tooling | Fast setup; OTA updates; used for demo via Expo Go |

## 19.5 External Integrations

| Service | Purpose | Tier |
|---|---|---|
| Twilio WhatsApp API | Receive invoice photos from WhatsApp; send auto-generated messages to users and suppliers | Sandbox only for demo — production Business API requires Meta approval (not guaranteed within hackathon timeline) |
| Razorpay | Phase 2 roadmap — payment gateway integration (explicitly not in MVP) | Not used in MVP |
| Supabase | Managed PostgreSQL + Storage + Auth (Row-Level Security for multi-user isolation) | Free tier |
| Pinecone | Managed vector database with per-user namespace isolation | Free tier (1 index, 100K vectors) |
| Upstash | Serverless Redis — Celery broker + cache | Free tier |

## 19.6 Deployment

| Component | Platform | Notes |
|---|---|---|
| FastAPI Backend | Railway or Render | Free tier; auto-deploy from GitHub |
| Celery Workers | Railway (separate service) | Shares Redis instance with main app |
| N8N | Railway (self-hosted) | Free; persistent workflows |
| OpenAI Whisper API | No deployment needed | API call only; pay-per-use via OpenAI |
| React Native App | Expo Go for demo; APK for production | No app store submission needed for hackathon |

---

# 20. MVP Scope

## 20.1 Must Build (Hackathon MVP)

| Feature | Section Reference |
|---|---|
| Multimodal invoice ingestion (OCR pipeline) | 6.1 |
| GSTIN validation engine | 6.2 |
| HSN code validation + auto-correction + corrected PDF | 6.3 |
| GSTR-2B reconciliation engine | 6.4 |
| ITC Recovery & Loss Tracking Engine | 6.5 |
| Multilingual GST Reasoning Engine (Hindi/English four-part explanations) | 6.6 |
| Root Cause Analysis Engine | 6.7 |
| Supplier Reliability Indicator | 6.8 |
| Supplier Correction Recommendation Engine | 6.9 |
| Auto Message Generator (WhatsApp/SMS/email draft) | 6.10 |
| Fake invoice / anomaly detection (Isolation Forest) | 6.11 |
| Compliance Risk Indicator | 6.12 |
| Vernacular Voice RAG Chatbot | 6.13 |
| GST Knowledge RAG Pipeline (grounded procedural answers) | 6.14 |
| Payment Task Manager + Proof-Based Ledger (excluding live "Pay Now") | 6.15 |
| WhatsApp incoming webhook (Twilio Sandbox) | 18 |
| All ten frontend screens | 10 |

## 20.2 Nice to Have

| Feature | Rationale for Deferral |
|---|---|
| Web dashboard (React + Tailwind) for CA-facing access | Useful but not required to demonstrate the core trader-facing value proposition |
| Multi-channel auto-messaging beyond WhatsApp/SMS (e.g., automated email send rather than draft-only) | Email sending infrastructure adds setup complexity disproportionate to hackathon-stage value |
| Supplier-facing self-correction portal | Would require a second authentication surface; not essential to demonstrate the trader-side workflow |
| Configurable confidence thresholds (currently fixed defaults) | A static default is sufficient for MVP; configurability is a refinement, not a core capability |

## 20.3 Future Scope (Post-Hackathon Roadmap)

| Feature | Phase |
|---|---|
| GSTR-1 auto-generator | Phase 2 |
| GSTR-3B calculator | Phase 2 |
| Razorpay "Pay Now" live payment integration | Phase 2 (sandbox-only demonstration permissible once available) |
| WhatsApp Business API production approval (replacing Sandbox) | Phase 2, contingent on Meta approval timeline |
| Multilingual support beyond Hindi (Marathi, Gujarati, Tamil) | Phase 3 |
| Predictive ITC forecasting | Phase 3 |
| Multi-GSTIN support (Pro tier, multiple registered entities per user) | Phase 3 |
| Freemium subscription billing infrastructure | Phase 3 |
| CA partner dashboard (per Persona 4) | Phase 3 |

The MVP scope above is deliberately bounded to what is achievable within a 3-day hackathon timeline with AI-assisted development and a small team, consistent with the constraint set out at the start of this document: when in doubt, simpler architecture wins over impressive-sounding complexity that cannot be reliably demonstrated.

---

# 21. Hackathon Build Plan (24-Hour Core Build, within a 3-Day Window)

| Hours | Feature | Owner | Output |
|---|---|---|---|
| 0–2 | Environment setup + mock data | All | FastAPI skeleton, Groq key, Twilio sandbox configured, mock GSTR-2B Excel (50 rows), 10 mock invoice images covering all input-quality tiers |
| 2–7 | Feature: OCR pipeline | Backend Dev | OpenCV + Google Vision API + Groq extraction working end-to-end on 5 invoice types |
| 7–10 | Feature: HSN corrector + corrected PDF | Backend Dev | HSN SQLite loaded, lookup working, Groq correction generation, ReportLab PDF output |
| 10–13 | Feature: GSTR-2B analyzer | Backend Dev | Pandas parser, mismatch detection across all three types, Groq Hindi explanations |
| 13–15 | Feature: Anomaly detection | ML Dev | Isolation Forest trained on mock data, all anomaly types correctly flagged on test set |
| 15–16 | Feature: ITC engine | Backend Dev | Running totals, priority list, recoverable calculation |
| 16–17 | Feature: Root Cause Analysis + Supplier Reliability Indicator | Backend Dev | Classification logic working; supplier scores computed and tiered |
| 17–18 | Feature: Supplier Correction Recommendation + Auto Message Generator | Backend Dev | End-to-end draft generation for at least 2 issue types, review-and-send flow working |
| 18–19 | Feature: Tasks + Proof Ledger | Full Stack | Task list, cash entry NLP parsing, GPay screenshot OCR, proof storage ("Pay Now" intentionally excluded from MVP) |
| 19–20 | Feature: Compliance risk indicator | Backend Dev | Score formula implemented, 4 tiers, color coding wired to UI |
| 20–21 | WhatsApp webhook | Backend Dev | Twilio webhook live, invoice photo triggers full pipeline end-to-end |
| 21–23 | Feature: Voice RAG chatbot + GST Knowledge Pipeline | ML Dev | Whisper + Sentence Transformers + Pinecone (dual-namespace) + Groq + gTTS working for example queries from both Section 6.13 and 6.14 |
| 23–25 | Frontend — all 10 screens | Frontend Dev | React Native: dashboard, upload center, structured viewer, validation center, GSTR-2B dashboard, ITC dashboard, task manager, voice assistant UI |
| 25–27 | Integration pass | All | All engines wired end-to-end through the frontend; mock data flows validated across the full Section 13 data flows |
| 27–30 | Demo dry run + fixes | All | End-to-end demo flow rehearsed against the script in Section 24; edge cases patched |

---
# 22. Business Model

| Tier | Price | Limits | Target User |
|---|---|---|---|
| Free | ₹0/month | 50 invoices/month, basic ITC finder, GSTR-2B analyzer, Hindi output, 10 tasks, 5 WhatsApp alerts/month | First-time users, very small traders evaluating the product |
| Premium | ₹299/month | Unlimited invoices, all core engines, GSTR-1 generator (Phase 2), corrected invoice auto-draft, deadline calendar, monthly ITC report, Pay Now gateway (Phase 2) | Regular kirana store owners and small distributors |
| Pro | ₹999/month | Everything in Premium + multiple GSTIN support (up to 5 businesses), CA dashboard access, bulk invoice processing (2,000+/month), advanced supplier analytics, receivables tracker | Larger MSMEs and multi-shop owners |

**Revenue Potential:** Against a total addressable market of 1.4 crore GST-registered MSMEs, even a 1% conversion to the ₹299/month Premium tier represents approximately **₹42 crore in monthly recurring revenue.** The underlying value proposition is straightforward: these are users currently paying ₹15,000–₹40,000/month to a CA for a largely mechanical service that Hisably automates at a fraction of the cost.

---

# 23. Competitive Differentiation & Innovation Summary

| Innovation | What Makes It Different | Competitive Advantage |
|---|---|---|
| WhatsApp-Native Workflow | Zero behavior change for the user — invoices arrive on WhatsApp exactly as they always have, and are processed automatically | All competing GST tools require a new app or web portal as the primary data-entry surface. The trader already uses WhatsApp daily. |
| Proof-Based Payment Ledger | Every payment — GPay, cash, or bank — has documented proof attached with a timestamp | No existing GST or accounting tool tracks payment proof this systematically; even CAs rarely maintain this level of documentation |
| ITC Recovery & Loss Tracking Engine | A real-time rupee meter showing exactly how much ITC is blocked and recoverable, sorted by priority | Competing tools surface *errors*. Hisably surfaces *money*. "₹4,200 recover karo" is a fundamentally more motivating frame than "3 mismatches found." |
| Fake Invoice Detection | ML-based anomaly scoring flags suspicious invoices before ITC is claimed against them | The GST portal has no fraud detection layer for small traders; this protects users from fraudulent or erroneous supplier invoices |
| Supplier Reliability Indicator | A persistent, scored view of which suppliers are chronically causing ITC loss, rather than one-off error notifications | Transforms scattered alerts into an actionable supplier management tool — something no GST-adjacent product currently offers |
| Root Cause Analysis Engine | Explicitly reasons about whether an error is supplier-side, store-owner-side, or shared, rather than defaulting to blame | Protects supplier relationships and increases trust in the system's recommendations by avoiding unwarranted accusations |
| Vernacular Voice RAG | Ask financial questions in Hindi/Hinglish and get personalized answers grounded in your own data | Brings a business-intelligence-grade capability, previously available only to large enterprises with BI teams, to a single kirana store owner |
| Compliance Risk Indicator | A derived score computed entirely from existing mismatch, anomaly, and deadline data — no separate model required | Converts a reactive compliance tool into a proactive financial early-warning system |

## 23.1 One-Line Pitch

*"Ramesh's CA charged ₹40,000 a month. Hisably does everything for ₹299 — and keeps the receipts."*

---

# 24. PS D4-PS1 Compliance Checklist

| PS Requirement | Status | How Hisably Covers It |
|---|---|---|
| Process unstructured invoices (photos, PDFs, receipts) | Covered | Multimodal OCR pipeline (Section 6.1) — Google Vision API + OpenCV preprocessing handles all formats, including blurry WhatsApp photos and torn receipts |
| Identify ITC mismatches with explanation | Covered | GSTR-2B Reconciliation Engine (Section 6.4) detects three mismatch types; the Multilingual GST Reasoning Engine (Section 6.6) generates a Hindi/English explanation with exact rupee impact for each |
| Plain-language output — no professional interpretation needed | Covered | All output follows the four-part Problem/Cause/Impact/Action structure in Hindi by default; corrected documents are generated directly; no CA interpretation is required at any step |
| No GST portal API access | Covered | Hisably never interacts with the GST portal directly; GSTR-2B is downloaded by the user and uploaded to the app; corrected invoices are generated for the user to upload themselves |
| Smartphone + limited English comfort | Covered | WhatsApp-native ingestion, Hindi-first UI throughout, voice input/output support — no step in the core workflow requires English |
| Simulation clause — dummy GSTR-2B allowed | Covered | A realistic mock GSTR-2B file with deliberate, representative errors across all three mismatch types is used for demonstration, clearly framed as such to judges |

---

# 25. Demo Script (3 Minutes)

| Time | Action | What Judges See |
|---|---|---|
| 0:00–0:30 | Show a blurry invoice photo being "received on WhatsApp" | Invoice auto-appears in the Hisably app; OCR extracts all fields in roughly 3 seconds |
| 0:30–1:00 | HSN error detected | Hindi alert displayed: *"Sharma ki invoice mein HSN galat hai. ₹2,400 ITC block hai. Corrected invoice ready hai."* |
| 1:00–1:20 | Supplier Reliability Indicator shown | Sharma Traders shown at Yellow tier with a "Contact supplier" suggested action; one-tap drafted message ready to send |
| 1:20–1:45 | Upload mock GSTR-2B | Mismatch report generated: 3 mismatches found, ₹6,800 total ITC at risk — prioritized list shown |
| 1:45–2:00 | Anomaly flag shown | Invoice #5 flagged: *"Yeh invoice suspicious hai — amount is supplier ke average se 5x zyada hai"* |
| 2:00–2:10 | Compliance risk score | Score: 78 — High Risk (orange) — *"4 din mein filing deadline, 3 issues unresolved"* |
| 2:10–2:25 | Cash payment entry | User types *"cash diye Sharma ko 500"* — task auto-marked Done, cash ledger entry created |
| 2:25–2:45 | Voice chatbot demo | User asks *"Is mahine kitna ITC miss hua?"* — Whisper transcribes, Groq answers in Hindi grounded in the user's own data, gTTS plays the audio response |
| 2:45–3:00 | Closing stats | ITC recoverable: ₹6,800. Estimated CA cost saved this month: ₹25,000. Net benefit shown clearly on screen. |

---

# 26. Appendix

## 26.1 Glossary

| Term | Definition |
|---|---|
| GST | Goods and Services Tax — India's unified indirect tax |
| ITC | Input Tax Credit — tax paid on purchases that a business can offset against tax owed on sales |
| GSTIN | GST Identification Number — a unique 15-character registration identifier |
| HSN | Harmonized System of Nomenclature — the coding system used to classify goods for tax-rate purposes |
| GSTR-1 | Monthly/quarterly return for outward supplies (sales) |
| GSTR-2B | Auto-drafted statement of ITC available, based on suppliers' filed GSTR-1 returns |
| GSTR-3B | Summary return used to declare tax liability and pay tax due |
| CBIC | Central Board of Indirect Taxes and Customs — the government body issuing GST rules, circulars, and the HSN classification handbook |
| RAG | Retrieval-Augmented Generation — an AI pattern that grounds LLM responses in retrieved, relevant source data rather than relying solely on the model's trained knowledge |
| RLS | Row-Level Security — a database-level access control mechanism filtering query results by the requesting user's identity |

## 26.2 Document Conventions Used in This PRD

- All rupee figures are illustrative examples used for demonstration and explanation; actual figures are computed dynamically per user from their real or mock invoice/GSTR-2B data.
- Hindi text examples are written in a Hinglish-transliterated form for readability in this document; the actual product renders native Devanagari script in-app.
- "MVP" throughout this document refers specifically to the hackathon build scope defined in Section 20.1, distinct from a post-hackathon production launch scope.

— End of PRD —
