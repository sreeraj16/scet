# Security Model & Access Controls - Swarnandhra WasteLoop Platform

## Overview
The Swarnandhra WasteLoop Platform implements defense-in-depth security across authentication, authorization, multi-tenant isolation, data validation, and location privacy.

---

## 1. Authentication & Session Security

- **Multi-Factor Authentication (MFA)**: Supports 6-digit Time-based One-Time Password (TOTP) verification for administrative actions.
- **Session Expiry**: Client sessions maintain an idle timeout window (15 minutes).
- **Password Policies**: Enforces minimum 8-character complexity with uppercase, symbol, and numeric constraints.

---

## 2. 9-Role Permission Matrix

| Role | Operational Queue | Live GIS | Route Planning | Marketplace | ESG Reports | Tenant Config | System Health |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `platform_admin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `admin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `organization_admin` | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `supervisor` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `collector` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `driver` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `recycler` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `citizen` | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `vendor` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

---

## 3. Multi-Tenant Data Isolation

- **Tenant Schema Guard**: Every database record contains an `organization_id` property.
- **Assertion Isolation (`assertTenantAccess`)**: Data query wrappers enforce that users cannot query or mutate records outside their active organization schema (`org-swarnandhra`, `org-eco-restaurant`, `org-metro-office`, etc.).

---

## 4. Location Privacy Protection

- **Coordinate Masking (`maskLocation`)**: GPS latitude and longitude values are obfuscated to ~500m precision for non-operational roles (citizens, recyclers, vendors) to protect collector & resident privacy.
- **Role-Gated Route Visibility**: Live GPS vehicle coordinates are only accessible to active drivers, supervisors, and platform administrators.

---

## 5. API Protection & Rate Limiting

- **Token Bucket Rate Limiter**: Client requests are throttled using a token bucket algorithm (60 requests / minute) to prevent Denial of Service (DoS) attacks.
- **Input Sanitization**: Text input fields pass through `sanitizeInput` to strip `<script>`, `SELECT`, `DROP`, and HTML tag injections.
