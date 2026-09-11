# WasteLoop — Geospatial & Mapping Intelligence Architecture

WasteLoop integrates real-time GIS mapping, GPS distance verification, geofencing, priority-aware route optimization, spatial heatmaps, and composite risk mapping into a unified operational layer.

---

## 1. Spatial Engine (`geospatialEngine.ts`)

Spatial queries and calculations are powered by [`geospatialEngine.ts`](file:///c:/Users/SREERAJ%20GANTIMALL/OneDrive/Desktop/Swarnandhra/src/lib/geospatialEngine.ts):

### Haversine Distance & Verification
- `calculateDistanceMeters(lat1, lon1, lat2, lon2)` calculates exact distance in meters across Earth's curvature.
- `verifyCollectionLocation(expectedLat, expectedLng, actualLat, actualLng, toleranceMeters)` compares collector GPS against expected curb location.
  - Within 100m tolerance → `✓ VERIFIED_LOCATION`
  - Beyond tolerance → `⚠ LOCATION_MISMATCH_FLAGGED` (Flagged for review without blocking operation).

---

## 2. Geofencing Validation

- `checkGeofenceBoundary(lat, lng, centerLat, centerLng, radiusMeters)` validates whether a collector or vehicle is inside `INSIDE_COLLECTION_GEOFENCE` or `OUTSIDE_COLLECTION_GEOFENCE`.

---

## 3. Priority-Aware Routing Integrator

- `rankRouteWaypointsByPriority(stops)` combines `priorityEngine` risk scores (overflow probability, waste category, SLA overdue time) with OSRM waypoint routing to ensure urgent stops are prioritized along the collection route.

---

## 4. Spatial Density Heatmaps

- `generateSpatialHeatmap(collections, complaints)` calculates spatial clustering and intensity levels (`0.0` - `1.0`) for real DB collection points, missed pickups, and illegal dumping complaints.
- Rendered on Leaflet maps via dynamic `CircleMarker` layers with color-coded intensity.

---

## 5. Composite Geospatial Risk Layer

- `calculateCompositeGeospatialRisk(zone, collections, complaints)` computes a composite risk score (0-100%) and assigns risk levels:
  - `LOW` (< 30%)
  - `MEDIUM` (30 - 49%)
  - `HIGH` (50 - 74%)
  - `CRITICAL` (≥ 75%)
- Factors contributing to risk include missed pickup count, urgent SLA requests, and unresolved complaints.

---

## 6. Unified Live Operational Map ([`UnifiedLiveMap.tsx`](file:///c:/Users/SREERAJ%20GANTIMALL/OneDrive/Desktop/Swarnandhra/src/components/monitoring/UnifiedLiveMap.tsx))

The unified Leaflet map combines:
- Real Collection Points
- Active Vehicle Positions
- MRF Sorting Facilities & Circular Recyclers
- Spatial Density Heatmaps
- Zone Risk Overlay Cards
- Clean Emerald Green & White design palette
