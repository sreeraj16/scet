-- Migration: 001_extensions.sql
-- Description: Enable postgis and uuid-ossp extensions for WasteLoop

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
