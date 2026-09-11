# WasteLoop — Security & Compliance Architecture

WasteLoop enforces enterprise-grade security across user authentication, role-based authorization, multi-tenant row-level security (RLS), location privacy protection, malicious file upload validation, and audit logging.

---

## 1. 9-Role Permission Matrix

Authorization is enforced server-side / state-level via [`securityService.ts`](file:///c:/Users/SREERAJ%20GANTIMALL/OneDrive/Desktop/Swarnandhra/src/lib/securityService.ts):

| Role | Key Allowed Capabilities |
| :--- | :--- |
| **Platform Admin** | Platform tenant management, global SaaS configurator, system health, all operational modules |
| **Admin** | Organization user management, collection schedules, fleet management, analytics, recyclers |
| **Org Admin** | Organization tenant management, ESG reports, user roster, circular marketplace |
| **Municipal Admin** | Municipal collection schedules, GIS route planning, complaints, fleet oversight |
| **Supervisor** | Collection queue management, task reassignment, coarse separation oversight, anomaly review |
| **Collector** | Assigned collection queue execution, location verification, AI waste identification |
| **Driver** | Fleet vehicle navigation, route execution |
| **Recycler** | Circular material marketplace, batch intake verification, processing completion |
| **Citizen** | Schedule request, household waste tracking, complaint submission, ESG impact dashboard |

Privileged actions (`reassignTask`, `processCoarseSeparation`, `completeRecyclerPickup`, `approveRecycler`) check `assertRolePermission(role, permission, actionName)` to block unauthorized frontend calls.

---

## 2. Multi-Tenant Row Level Security (RLS)

All PostgreSQL tables enforce tenant isolation via `organization_id`:

```sql
ALTER TABLE public.waste_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_waste_batches_policy ON public.waste_batches
    FOR ALL
    USING (organization_id = public.get_auth_user_org_id());
```

Cross-tenant data leakage is prevented at database engine level.

---

## 3. Malicious Upload Protection

File uploads (e.g. collection evidence photos or complaint images) pass through `validateFileUpload`:
- **MIME Type Whitelist**: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- **File Extension Check**: `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`
- **Size Limit**: Maximum 10MB
- **Safe Generated Key**: Filenames are replaced with UUIDs (`evidence_1726036000_8472.jpg`) to prevent path traversal and script execution.

---

## 4. Location Privacy Protection

GPS coordinates are filtered based on user role (`maskLocation`):
- **Operational Roles** (`collector`, `driver`, `supervisor`, `admin`): Precise lat/lng coordinates for operational route execution.
- **Non-Operational / Public Roles**: Coordinates obfuscated to ~500m precision to protect citizen household privacy.

---

## 5. Security Audit Trail (`security_audit_logs`)

All sensitive administrative and operational actions generate structured audit entries:
- Actor ID, Name, Role
- Organization ID
- Action & Target Entity
- Previous vs New State JSON
- Anomaly Flag (`FLAGGED_FOR_REVIEW`) & Notes
