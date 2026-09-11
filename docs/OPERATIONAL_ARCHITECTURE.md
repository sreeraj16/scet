# System Operational Architecture - Swarnandhra WasteLoop Platform

## Overview
The **Swarnandhra WasteLoop Platform** is an enterprise multi-tenant waste management and circular economy recovery platform. It integrates municipal collection operations, IoT bin telemetry, AI waste classification, real-time route optimization, material recycling traceability, and a B2B material marketplace.

---

## System Core Modules

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                         REACT CLIENT SINGLE PAGE APP                   │
 ├────────────────────────────────────────────────────────────────────────┤
 │ Citizen Portal │ Collector App │ Supervisor Console │ Admin Operations │
 │ Marketplace    │ Recycler Hub  │ System Health      │ Sustainability   │
 └───────┬────────────────────────────────────────────────────────┬───────┘
         │                                                        │
         ▼                                                        ▼
 ┌───────────────────────────┐                            ┌───────────────┐
 │ SECURITY & AUTHORIZATION  │                            │ BACKEND AI    │
 │ • Token Rate Limiting     │                            │ • ResNet50 ML │
 │ • Multi-Tenant Isolation  │                            │ • Prophet MFI │
 │ • 9-Role Permission Engine│                            │ • PyTorch     │
 └─────────────┬─────────────┘                            └───────┬───────┘
               │                                                  │
               ▼                                                  ▼
 ┌───────────────────────────┐                            ┌───────────────┐
 │ EVENT QUEUE & BUS BROKER  │                            │ EMAIL ENGINE  │
 │ • Topic Publish/Subscribe │                            │ • Nodemailer  │
 │ • Retry & Exponential     │                            │ • Gmail SMTP  │
 │ • Dead-Letter Queue (DLQ) │                            │ • HTML Templ. │
 └─────────────┬─────────────┘                            └───────────────┘
               │
               ▼
 ┌───────────────────────────┐
 │ SUPABASE PERSISTENCE      │
 │ • PostgreSQL DB Schemas   │
 │ • Row Level Security      │
 │ • Realtime Change Filters │
 └───────────────────────────┘
```

### Module Responsibilities

1. **Security & Authorization (`securityService.ts`)**:
   - Enforces 9 distinct user roles (`platform_admin`, `admin`, `organization_admin`, `supervisor`, `collector`, `driver`, `recycler`, `citizen`, `vendor`).
   - Restricts data visibility strictly by Organization Tenant ID (`organization_id`).
   - Provides client-side rate limiting and input sanitization to prevent XSS and SQL injection.

2. **Event Queue Broker (`eventQueue.ts`)**:
   - In-memory event broker delivering asynchronous event topics (`PICKUP_CREATED`, `COLLECTION_COMPLETED`, `SENSOR_PING`, `ROUTE_FAILED`, `MARKETPLACE_TRANSACTION`, `RECOVERY_CERTIFICATE_ISSUED`).
   - Supports exponential backoff retries and Dead-Letter Queue (DLQ) exception management.

3. **Reliability Engine (`reliabilityEngine.ts`)**:
   - Automated SLA failure watchdog detecting missed pickups (> 2h SLA), vehicle mechanical faults, IoT sensor ping timeouts (> 12h), weighbridge discrepancies (> 5%), and duplicate request attempts.

4. **Circular Economy Marketplace (`MarketplaceModule.tsx`)**:
   - Multi-tab exchange hub supporting material browsing, 3-step listing creation, direct buy offers, live competitive auctions, escrow payment locks, and verification audits.

5. **AI Vision & Forecasting Microservice (`backend_ai/`)**:
   - Python FastAPI server hosting trained ResNet50 waste classifier (88.33% accuracy) and Prophet generation forecaster (98.69% R² score).

6. **Email Server (`server/emailServer.js`)**:
   - Node.js Nodemailer daemon executing Gmail SMTP notification delivery for pickup assignments, schedule confirmations, and completion evidence alerts.
