# WasteLoop — Complete System Documentation

## 1. Executive Summary & Product Philosophy

**WasteLoop** is an AI-powered, multi-tenant, end-to-end Smart Waste Management and Circular Economy Platform.

### Core Mission: ZERO-EFFORT WASTE MANAGEMENT
Unlike conventional municipal applications that require citizens to constantly log daily garbage weight or manually photograph every trash bag, WasteLoop operates on a **zero-effort, set-and-forget architecture**:
- **Citizens** configure their collection schedule once (location, frequency, time window, waste types). Standard pickups happen automatically according to municipal/institutional routes.
- **Field Collectors** operate touch-optimized mobile interfaces with real-time GPS navigation, automated route optimization, and minimum-typing collection verification.
- **Zone Supervisors** monitor real-time SLA countdowns, operational exceptions, vehicle load thresholds, and issue reassignments.
- **Municipal Administrators** operate a Smart City Command Center with Leaflet GIS maps, XGBoost ML generation forecasting, IoT overflow prediction, and circular economy traceability.
- **Recycling Partners** view coarsely separated material streams, accept batches, schedule pickups, and record verified material recovery metrics.

---

## 2. Platform User Roles & Capabilities Matrix

| Role | Primary Interface | Key Capabilities | RLS & Security Scope |
| :--- | :--- | :--- | :--- |
| **Citizen Generator** | Zero-Effort Eco Portal | Setup recurring collection, view next pickup, report issues with photo evidence, request special waste concierge, search AI waste guide, view waste journey. | Own profile, own schedules, own complaints, own evidence records. |
| **Field Collector** | Touch Mobile Interface | View daily route stops, Start Navigation, mark Arrived / Collected, enter verified pickup weights, report issues, skip stops, operate offline queue. | Assigned route stops, assigned vehicle, operational tasks. |
| **Zone Supervisor** | Operations Console | Monitor SLA breaches, overdue collections, vehicle capacity alerts, reassign tasks to collector roster, escalate citizen complaints. | Authorized zone & organization operations, complaints, evidence inspection. |
| **Municipal Admin** | Smart City Command Center | Situation Hub, Leaflet GIS command map, Waste Analytics Workspace (15 Recharts graphics), AI Operations Assistant, SaaS configuration. | All municipal organization data, evidence inspection, RLS isolation across tenants. |
| **Recycler Partner** | B2B Circular Marketplace | View coarsely separated dry recyclables, accept materials, schedule recycler pickups, record valuation ($) and recovered weights. | Own profile, accepted material batches, transactions, recovery logs. |
| **Organization Admin** | Campus / Facility Operations | Log coarse separation (organic, dry, special, residual), calculate recovery efficiency %, route recoverable materials to recyclers. | Own campus/facility organization operations & material batches. |
| **Platform Admin** | SaaS System Console | Manage multi-tenant organizations (15 Org types), system user roster, immutable audit logs. | Platform-wide authorized tenant management. |

---

## 3. Technology Stack & Core Integrations

1. **Frontend Core**: React 18 + TypeScript 5 + Vite 5 + Tailwind CSS
2. **Icons & Styling**: Lucide React + HSL Tailored Eco-Friendly Dark/Light Mode Design Tokens
3. **Interactive Maps & GIS**: Leaflet + OpenStreetMap + OSRM Road Routing Engine
4. **Data Visualization**: Recharts (15 Graphical Analytics Monitors)
5. **Local Verification**: `qrcode.react` (Zero External API Keys Required) + Native Browser Printing / PDF Generation
6. **Database & Auth**: Supabase PostgreSQL 15 + Row Level Security (RLS) + Supabase Realtime + Google OAuth Client ID (`900706800189-1pp62hhm6fbi0sog67q8msprecfjq8m6.apps.googleusercontent.com`)
7. **ML Intelligence Microservice**: Python FastAPI + NumPy + scikit-learn + XGBoost (`backend_ai/main.py`)
8. **Offline Engine**: LocalStorage Sync Queue with automatic conflict resolution upon network reconnection
