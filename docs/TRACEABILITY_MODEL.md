# Material Traceability & Chain-of-Custody Model - Swarnandhra WasteLoop Platform

## Overview
The platform guarantees complete material traceability from the point of waste generation to ultimate recovery or recycling, issuing cryptographically verified Circular Economy Recovery Certificates.

---

## Chain-of-Custody Lifecycle Stages

```
 ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
 │  1. WASTE GENERATION │ ───► │  2. VERIFIED PICKUP  │ ───► │  3. TRANSIT & GATE   │
 │ • Household / Org    │      │ • Weight photo evidence│     │ • Weighbridge scale  │
 │ • Batch Code Assigned│      │ • Segregation score  │      │ • Facility intake    │
 └──────────────────────┘      └──────────────────────┘      └──────────────────────┘
                                                                        │
                                                                        ▼
 ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
 │  6. CERTIFICATE      │ ◄─── │  5. MARKETPLACE /    │ ◄─── │  4. COARSE RECOVERY  │
 │ • QR verification    │      │     RECYCLER SALE    │      │ • Organic composting │
 │ • Circularity Proof  │      │ • Escrow payment lock│      │ • Plastic shredding  │
 └──────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

---

## 1. Batch Code Standard

Every waste batch generates a unique 16-character alphanumeric tracking code upon creation:
- **Format**: `WL-2026-XXXXXX` (e.g. `WL-2026-000184`)
- **Marketplace Order Format**: `MKT-ORD-XXXXX` (e.g. `MKT-ORD-99201`)

---

## 2. Verification Checkpoints

1. **Pickup Verification**: Collector records photo evidence + scale weight (`weight_kg`). Segregation quality is rated (0-100%).
2. **Facility Scale Intake**: Gate weighbridge weighs truck net mass and cross-checks collector log. Variances > 5% trigger automated audit holds.
3. **Purity Grading**: Material batches are categorized by quality grade (`Grade A (95-100% Pure)`, `Grade B`, `Grade C`, `Grade D`).
4. **Marketplace Escrow Payout**: Buyers verify physical shipment against batch code before funds lock is released (`released_to_seller`).
5. **Certificate Issuance**: Digital Circular Economy Recovery Certificate generated with printable QR code verification payload.
