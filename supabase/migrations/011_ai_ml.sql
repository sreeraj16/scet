-- Migration: 011_ai_ml.sql
-- Description: Create ai_ml_predictions and anomalies tables

CREATE TABLE IF NOT EXISTS ai_ml_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    model_type TEXT NOT NULL, -- Waste Generation Forecast, Overflow Prediction, Unnecessary Collection
    target_entity_type TEXT NOT NULL, -- Zone, Bin, Household, Route
    target_entity_id UUID,
    prediction_value JSONB NOT NULL,
    confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 85.0,
    explanation TEXT,
    evaluation_metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anomalies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    anomaly_type TEXT NOT NULL, -- Weight Discrepancy, Duplicate Evidence, GPS Boundary Jump, Unusual Collection Frequency
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    severity TEXT NOT NULL DEFAULT 'Medium', -- Low, Medium, High, Critical
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Flagged', -- Flagged, Under Review, Resolved, Dismissed
    flagged_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_predictions_org ON ai_ml_predictions(organization_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_status ON anomalies(status);
