-- ═══════════════════════════════════════════════════════════════════════════
-- IMPACT ORACLE DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Tables pour stocker les vérifications d'impact des ONGs
--
-- Tables:
-- 1. oracle_verifications - Résultats de vérification
-- 2. oracle_api_logs - Logs des appels API
-- 3. oracle_verification_history - Historique complet

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: oracle_verifications
-- Stocke les résultats de vérification des ONGs
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS oracle_verifications (
    id SERIAL PRIMARY KEY,
    xrpl_address VARCHAR(35) NOT NULL UNIQUE,
    verified BOOLEAN NOT NULL DEFAULT false,
    impact_score INTEGER NOT NULL CHECK (impact_score >= 0 AND impact_score <= 100),
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),

    -- Sources de vérification (JSON)
    -- Format: { "unData": true, "oecd": false, "charityBase": true, "openCharities": true }
    verification_sources JSONB NOT NULL DEFAULT '{}',

    -- Métadonnées de l'ONG (JSON)
    -- Format: { "name": "...", "country": "US", "category": "...", "sdgAlignment": [...] }
    metadata JSONB NOT NULL DEFAULT '{}',

    -- Warnings
    warnings JSONB DEFAULT '[]',

    -- Timestamps
    verified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    next_verification_due TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index pour recherche rapide
CREATE INDEX idx_oracle_xrpl_address ON oracle_verifications(xrpl_address);
CREATE INDEX idx_oracle_verified ON oracle_verifications(verified);
CREATE INDEX idx_oracle_impact_score ON oracle_verifications(impact_score DESC);
CREATE INDEX idx_oracle_country ON oracle_verifications((metadata->>'country'));
CREATE INDEX idx_oracle_next_verification ON oracle_verifications(next_verification_due);

-- Index GIN pour recherche JSON
CREATE INDEX idx_oracle_metadata ON oracle_verifications USING GIN (metadata);
CREATE INDEX idx_oracle_sources ON oracle_verifications USING GIN (verification_sources);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: oracle_api_logs
-- Logs des appels aux APIs externes (UNData, OECD, CharityBase, etc.)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS oracle_api_logs (
    id SERIAL PRIMARY KEY,
    verification_id INTEGER REFERENCES oracle_verifications(id) ON DELETE CASCADE,
    api_name VARCHAR(50) NOT NULL, -- 'unData', 'oecd', 'charityBase', 'openCharities', 'xrpl'
    endpoint VARCHAR(500),
    request_payload JSONB,
    response_status INTEGER,
    response_data JSONB,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    duration_ms INTEGER, -- Durée de l'appel en millisecondes
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index pour analytics
CREATE INDEX idx_api_logs_verification ON oracle_api_logs(verification_id);
CREATE INDEX idx_api_logs_api_name ON oracle_api_logs(api_name);
CREATE INDEX idx_api_logs_success ON oracle_api_logs(success);
CREATE INDEX idx_api_logs_created_at ON oracle_api_logs(created_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: oracle_verification_history
-- Historique complet de toutes les vérifications (pour audit trail)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS oracle_verification_history (
    id SERIAL PRIMARY KEY,
    xrpl_address VARCHAR(35) NOT NULL,
    verification_data JSONB NOT NULL, -- Snapshot complet de la vérification
    impact_score INTEGER NOT NULL,
    risk_score INTEGER NOT NULL,
    verified BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index pour historique
CREATE INDEX idx_history_xrpl_address ON oracle_verification_history(xrpl_address);
CREATE INDEX idx_history_created_at ON oracle_verification_history(created_at DESC);
CREATE INDEX idx_history_impact_score ON oracle_verification_history(impact_score DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Trigger: Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_oracle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_oracle_updated_at
    BEFORE UPDATE ON oracle_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_oracle_updated_at();

-- Trigger: Archivage automatique dans l'historique
CREATE OR REPLACE FUNCTION archive_verification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO oracle_verification_history (
        xrpl_address,
        verification_data,
        impact_score,
        risk_score,
        verified
    ) VALUES (
        NEW.xrpl_address,
        jsonb_build_object(
            'verificationSources', NEW.verification_sources,
            'metadata', NEW.metadata,
            'warnings', NEW.warnings,
            'verifiedAt', NEW.verified_at,
            'nextVerificationDue', NEW.next_verification_due
        ),
        NEW.impact_score,
        NEW.risk_score,
        NEW.verified
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_archive_verification
    AFTER INSERT OR UPDATE ON oracle_verifications
    FOR EACH ROW
    EXECUTE FUNCTION archive_verification();

-- ═══════════════════════════════════════════════════════════════════════════
-- VIEWS
-- ═══════════════════════════════════════════════════════════════════════════

-- View: ONGs vérifiées avec score élevé
CREATE OR REPLACE VIEW verified_high_impact_ngos AS
SELECT
    xrpl_address,
    metadata->>'name' as name,
    metadata->>'country' as country,
    impact_score,
    risk_score,
    verification_sources,
    verified_at,
    next_verification_due
FROM oracle_verifications
WHERE verified = true AND impact_score >= 70
ORDER BY impact_score DESC;

-- View: ONGs à risque
CREATE OR REPLACE VIEW high_risk_ngos AS
SELECT
    xrpl_address,
    metadata->>'name' as name,
    impact_score,
    risk_score,
    warnings,
    verified_at
FROM oracle_verifications
WHERE risk_score > 70
ORDER BY risk_score DESC;

-- View: Statistiques par pays
CREATE OR REPLACE VIEW stats_by_country AS
SELECT
    metadata->>'country' as country,
    COUNT(*) as total_ngos,
    COUNT(*) FILTER (WHERE verified = true) as verified_ngos,
    AVG(impact_score) as avg_impact_score,
    AVG(risk_score) as avg_risk_score
FROM oracle_verifications
WHERE metadata->>'country' IS NOT NULL
GROUP BY metadata->>'country'
ORDER BY total_ngos DESC;

-- View: Statistiques API
CREATE OR REPLACE VIEW api_performance_stats AS
SELECT
    api_name,
    COUNT(*) as total_calls,
    COUNT(*) FILTER (WHERE success = true) as successful_calls,
    AVG(duration_ms) as avg_duration_ms,
    MAX(duration_ms) as max_duration_ms,
    MIN(duration_ms) as min_duration_ms
FROM oracle_api_logs
GROUP BY api_name
ORDER BY total_calls DESC;

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Function: Récupérer les ONGs nécessitant une re-vérification
CREATE OR REPLACE FUNCTION get_ngos_due_for_verification()
RETURNS TABLE (
    xrpl_address VARCHAR,
    name TEXT,
    last_verified TIMESTAMP,
    next_verification_due TIMESTAMP,
    days_overdue INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ov.xrpl_address,
        ov.metadata->>'name' as name,
        ov.verified_at as last_verified,
        ov.next_verification_due,
        EXTRACT(DAY FROM (CURRENT_TIMESTAMP - ov.next_verification_due))::INTEGER as days_overdue
    FROM oracle_verifications ov
    WHERE ov.next_verification_due < CURRENT_TIMESTAMP
    ORDER BY ov.next_verification_due ASC;
END;
$$ LANGUAGE plpgsql;

-- Function: Statistiques globales
CREATE OR REPLACE FUNCTION get_oracle_stats()
RETURNS TABLE (
    total_verifications BIGINT,
    verified_ngos BIGINT,
    avg_impact_score NUMERIC,
    avg_risk_score NUMERIC,
    high_impact_ngos BIGINT,
    high_risk_ngos BIGINT,
    countries_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_verifications,
        COUNT(*) FILTER (WHERE verified = true) as verified_ngos,
        AVG(impact_score) as avg_impact_score,
        AVG(risk_score) as avg_risk_score,
        COUNT(*) FILTER (WHERE impact_score >= 70) as high_impact_ngos,
        COUNT(*) FILTER (WHERE risk_score > 70) as high_risk_ngos,
        COUNT(DISTINCT metadata->>'country') as countries_count
    FROM oracle_verifications;
END;
$$ LANGUAGE plpgsql;

-- Function: Recherche full-text dans les métadonnées
CREATE OR REPLACE FUNCTION search_ngos(search_term TEXT)
RETURNS TABLE (
    xrpl_address VARCHAR,
    name TEXT,
    country TEXT,
    impact_score INTEGER,
    verified BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ov.xrpl_address,
        ov.metadata->>'name' as name,
        ov.metadata->>'country' as country,
        ov.impact_score,
        ov.verified
    FROM oracle_verifications ov
    WHERE
        ov.metadata->>'name' ILIKE '%' || search_term || '%'
        OR ov.metadata->>'category' ILIKE '%' || search_term || '%'
        OR ov.xrpl_address ILIKE '%' || search_term || '%'
    ORDER BY ov.impact_score DESC;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA (Exemples pour tests)
-- ═══════════════════════════════════════════════════════════════════════════

-- Exemple 1: Climate Action Network (haute qualité)
INSERT INTO oracle_verifications (
    xrpl_address,
    verified,
    impact_score,
    risk_score,
    verification_sources,
    metadata,
    next_verification_due,
    warnings
) VALUES (
    'rClimateAction123456789ABCDEF',
    true,
    95,
    5,
    '{"unData": true, "oecd": true, "charityBase": true, "openCharities": true}',
    '{
        "name": "Climate Action Network",
        "country": "US",
        "category": "Environmental Protection",
        "registrationNumber": "123456",
        "foundedYear": 2005,
        "sdgAlignment": [13, 7, 11]
    }',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    '[]'
) ON CONFLICT (xrpl_address) DO NOTHING;

-- Exemple 2: Water For All (bonne qualité)
INSERT INTO oracle_verifications (
    xrpl_address,
    verified,
    impact_score,
    risk_score,
    verification_sources,
    metadata,
    next_verification_due,
    warnings
) VALUES (
    'rWaterForAll123456789ABCDEFG',
    true,
    88,
    12,
    '{"unData": true, "oecd": false, "charityBase": true, "openCharities": true}',
    '{
        "name": "Water For All",
        "country": "GB",
        "category": "Water & Sanitation",
        "registrationNumber": "789012",
        "foundedYear": 2010,
        "sdgAlignment": [6, 3]
    }',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    '["⚠️ OECD verification not found"]'
) ON CONFLICT (xrpl_address) DO NOTHING;

-- Exemple 3: Unknown Charity (risque élevé)
INSERT INTO oracle_verifications (
    xrpl_address,
    verified,
    impact_score,
    risk_score,
    verification_sources,
    metadata,
    next_verification_due,
    warnings
) VALUES (
    'rUnknownCharity123456789ABCD',
    false,
    25,
    85,
    '{"unData": false, "oecd": false, "charityBase": false, "openCharities": true}',
    '{
        "name": "Unknown Charity Org",
        "country": "XX",
        "category": "General"
    }',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    '["⚠️ No verification sources found - HIGH RISK", "⚠️ High risk score - additional verification recommended", "⚠️ No charity registry verification found"]'
) ON CONFLICT (xrpl_address) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- PERMISSIONS (Optionnel - à adapter selon vos besoins)
-- ═══════════════════════════════════════════════════════════════════════════

-- Créer un utilisateur oracle (optionnel)
-- CREATE USER oracle_user WITH PASSWORD 'secure_password';
-- GRANT SELECT, INSERT, UPDATE ON oracle_verifications TO oracle_user;
-- GRANT SELECT, INSERT ON oracle_api_logs TO oracle_user;
-- GRANT SELECT, INSERT ON oracle_verification_history TO oracle_user;
-- GRANT SELECT ON verified_high_impact_ngos TO oracle_user;
-- GRANT SELECT ON high_risk_ngos TO oracle_user;
-- GRANT SELECT ON stats_by_country TO oracle_user;

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMENTS (Documentation)
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE oracle_verifications IS 'Stocke les résultats de vérification des ONGs via APIs publiques';
COMMENT ON TABLE oracle_api_logs IS 'Logs des appels aux APIs externes (UNData, OECD, CharityBase, OpenCharities)';
COMMENT ON TABLE oracle_verification_history IS 'Historique complet de toutes les vérifications pour audit trail';

COMMENT ON COLUMN oracle_verifications.impact_score IS 'Score d''impact de 0 à 100 (100 = impact maximal)';
COMMENT ON COLUMN oracle_verifications.risk_score IS 'Score de risque de 0 à 100 (100 = risque maximal)';
COMMENT ON COLUMN oracle_verifications.verification_sources IS 'JSON des sources de vérification utilisées';
COMMENT ON COLUMN oracle_verifications.metadata IS 'Métadonnées de l''ONG (nom, pays, catégorie, SDG alignment, etc.)';

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DU SCHÉMA
-- ═══════════════════════════════════════════════════════════════════════════

-- Vérification
SELECT 'Oracle schema created successfully! ✅' as status;
SELECT * FROM get_oracle_stats();
