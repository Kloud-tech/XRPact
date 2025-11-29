-- ═══════════════════════════════════════════════════════════════════════════
-- ORACLE + XRPL INTEGRATION SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Tables supplémentaires pour l'intégration Oracle + XRPL

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: ngos_verified
-- ONGs avec vérification Oracle et stockage on-chain
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ngos_verified (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    wallet_address VARCHAR(35) NOT NULL UNIQUE,
    country VARCHAR(2),
    category VARCHAR(100),
    website VARCHAR(500),
    email VARCHAR(200),
    registration_number VARCHAR(100),

    -- Oracle data
    impact_score INTEGER NOT NULL CHECK (impact_score >= 0 AND impact_score <= 100),
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    verified BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMP,
    next_verification_due TIMESTAMP,
    warnings JSONB DEFAULT '[]',

    -- XRPL data
    tx_hash VARCHAR(64),

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_ngos_verified_wallet ON ngos_verified(wallet_address);
CREATE INDEX idx_ngos_verified_impact ON ngos_verified(impact_score DESC);
CREATE INDEX idx_ngos_verified_verified ON ngos_verified(verified);
CREATE INDEX idx_ngos_verified_country ON ngos_verified(country);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: donations_with_impact
-- Donations avec calcul d'impact basé sur le score Oracle
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS donations_with_impact (
    id SERIAL PRIMARY KEY,
    donor_address VARCHAR(35) NOT NULL,
    ngo_address VARCHAR(35) NOT NULL REFERENCES ngos_verified(wallet_address),
    amount DECIMAL(20, 6) NOT NULL CHECK (amount > 0),

    -- Impact calculation
    ngo_impact_score INTEGER NOT NULL,
    ngo_verified BOOLEAN NOT NULL,
    impact_multiplier DECIMAL(3, 2) NOT NULL,

    -- Gamification
    xp_gained INTEGER NOT NULL,
    level INTEGER NOT NULL,

    -- XRPL
    tx_hash VARCHAR(64),

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_donations_impact_donor ON donations_with_impact(donor_address);
CREATE INDEX idx_donations_impact_ngo ON donations_with_impact(ngo_address);
CREATE INDEX idx_donations_impact_created ON donations_with_impact(created_at DESC);
CREATE INDEX idx_donations_impact_xp ON donations_with_impact(xp_gained DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_ngos_verified_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ngos_verified_updated_at
    BEFORE UPDATE ON ngos_verified
    FOR EACH ROW
    EXECUTE FUNCTION update_ngos_verified_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- VIEWS
-- ═══════════════════════════════════════════════════════════════════════════

-- Top NGOs by total donations received
CREATE OR REPLACE VIEW top_ngos_by_donations AS
SELECT
    n.wallet_address,
    n.name,
    n.impact_score,
    n.verified,
    COUNT(d.id) as total_donations,
    SUM(d.amount) as total_amount_received,
    AVG(d.amount) as avg_donation_amount
FROM ngos_verified n
LEFT JOIN donations_with_impact d ON n.wallet_address = d.ngo_address
GROUP BY n.wallet_address, n.name, n.impact_score, n.verified
ORDER BY total_amount_received DESC;

-- Donor leaderboard
CREATE OR REPLACE VIEW donor_leaderboard AS
SELECT
    donor_address,
    COUNT(*) as total_donations,
    SUM(amount) as total_donated,
    SUM(xp_gained) as total_xp,
    MAX(level) as current_level,
    AVG(ngo_impact_score) as avg_ngo_impact_score
FROM donations_with_impact
GROUP BY donor_address
ORDER BY total_xp DESC;

-- Impact statistics
CREATE OR REPLACE VIEW impact_statistics AS
SELECT
    COUNT(DISTINCT donor_address) as total_donors,
    COUNT(DISTINCT ngo_address) as total_ngos,
    COUNT(*) as total_donations,
    SUM(amount) as total_volume,
    AVG(ngo_impact_score) as avg_ngo_impact_score,
    AVG(impact_multiplier) as avg_impact_multiplier,
    SUM(xp_gained) as total_xp_distributed
FROM donations_with_impact;

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Get donor stats
CREATE OR REPLACE FUNCTION get_donor_stats(p_donor_address VARCHAR)
RETURNS TABLE (
    total_xp BIGINT,
    current_level INTEGER,
    total_donations BIGINT,
    total_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        SUM(xp_gained)::BIGINT as total_xp,
        FLOOR(SQRT(SUM(xp_gained) / 100))::INTEGER + 1 as current_level,
        COUNT(*)::BIGINT as total_donations,
        SUM(amount) as total_amount
    FROM donations_with_impact
    WHERE donor_address = p_donor_address;
END;
$$ LANGUAGE plpgsql;

-- Get NGO stats
CREATE OR REPLACE FUNCTION get_ngo_stats(p_ngo_address VARCHAR)
RETURNS TABLE (
    total_donations BIGINT,
    total_received NUMERIC,
    avg_donation NUMERIC,
    unique_donors BIGINT,
    impact_score INTEGER,
    verified BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_donations,
        SUM(d.amount) as total_received,
        AVG(d.amount) as avg_donation,
        COUNT(DISTINCT d.donor_address)::BIGINT as unique_donors,
        n.impact_score,
        n.verified
    FROM donations_with_impact d
    JOIN ngos_verified n ON n.wallet_address = d.ngo_address
    WHERE d.ngo_address = p_ngo_address
    GROUP BY n.impact_score, n.verified;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════════════════════

-- Seed some verified NGOs
INSERT INTO ngos_verified (
    id, name, wallet_address, country, category,
    impact_score, risk_score, verified, verified_at, next_verification_due
) VALUES
(
    'ngo_1',
    'Climate Action Network',
    'rClimateAction123456789ABCDEF',
    'US',
    'Environmental Protection',
    95,
    5,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days'
),
(
    'ngo_2',
    'Water For All',
    'rWaterForAll123456789ABCDEFG',
    'GB',
    'Water & Sanitation',
    88,
    12,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days'
),
(
    'ngo_3',
    'Education First',
    'rEducationFirst123456789ABCDE',
    'CA',
    'Education',
    92,
    8,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days'
)
ON CONFLICT (wallet_address) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════

SELECT 'Oracle + XRPL Integration schema created successfully! ✅' as status;
