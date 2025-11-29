-- ═══════════════════════════════════════════════════════════════════════════
-- XRPL IMPACT FUND - DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Schéma PostgreSQL complet pour le module XRPL Service Enhanced
--
-- Tables:
-- 1. donations          - Historique des donations
-- 2. donors             - Profils des donateurs
-- 3. ngos               - Organisations non-gouvernementales
-- 4. distributions      - Historique des redistributions
-- 5. emergency_funds    - Fonds d'urgence activés
-- 6. operation_logs     - Logs d'opérations (audit trail)
-- 7. pool_state         - État du pool (snapshot quotidien)
--
-- Author: XRPact Hack For Good Team
-- Version: 1.0.0
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop tables if exists (en ordre inverse des dépendances)
DROP TABLE IF EXISTS operation_logs CASCADE;
DROP TABLE IF EXISTS emergency_funds CASCADE;
DROP TABLE IF EXISTS distributions CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS donors CASCADE;
DROP TABLE IF EXISTS ngos CASCADE;
DROP TABLE IF EXISTS pool_state CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. TABLE: donors
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE donors (
  id VARCHAR(255) PRIMARY KEY,
  address VARCHAR(64) UNIQUE NOT NULL,

  -- Gamification
  total_donated DECIMAL(20, 6) DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,

  -- Tokens
  nft_token_id VARCHAR(128),
  dit_token_id VARCHAR(128),

  -- Statistiques
  donation_count INTEGER DEFAULT 0,
  first_donation_date TIMESTAMP,
  last_donation_date TIMESTAMP,

  -- Métadonnées
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_donors_address ON donors(address);
CREATE INDEX idx_donors_level ON donors(level DESC);
CREATE INDEX idx_donors_xp ON donors(xp DESC);
CREATE INDEX idx_donors_total_donated ON donors(total_donated DESC);

COMMENT ON TABLE donors IS 'Profils des donateurs avec XP et gamification';

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. TABLE: ngos
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE ngos (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(64) UNIQUE NOT NULL,

  -- Catégorie
  category VARCHAR(50) NOT NULL,
  -- climate, health, education, water, other

  -- Validation Oracle
  verified BOOLEAN DEFAULT FALSE,
  impact_score INTEGER DEFAULT 0, -- 0-100
  weight DECIMAL(3, 2) DEFAULT 0.1, -- 0-1 pour distribution

  -- Certifications
  certifications TEXT[], -- Array de certifications

  -- Informations
  website VARCHAR(255),
  description TEXT,
  country VARCHAR(100),
  registration_number VARCHAR(100),

  -- Financier
  total_received DECIMAL(20, 6) DEFAULT 0,
  last_distribution_date TIMESTAMP,

  -- Métadonnées
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ngos_verified ON ngos(verified);
CREATE INDEX idx_ngos_category ON ngos(category);
CREATE INDEX idx_ngos_impact_score ON ngos(impact_score DESC);
CREATE INDEX idx_ngos_wallet_address ON ngos(wallet_address);

COMMENT ON TABLE ngos IS 'Organisations non-gouvernementales validées';

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. TABLE: donations
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE donations (
  id VARCHAR(255) PRIMARY KEY,
  donor_address VARCHAR(64) NOT NULL,

  -- Transaction XRPL
  amount DECIMAL(20, 6) NOT NULL,
  tx_hash VARCHAR(128) UNIQUE NOT NULL,
  validated BOOLEAN DEFAULT FALSE,
  ledger_index INTEGER,

  -- Gamification
  xp_gained INTEGER NOT NULL,
  level INTEGER NOT NULL,
  level_up BOOLEAN DEFAULT FALSE,

  -- NFT & Tokens
  nft_minted BOOLEAN DEFAULT FALSE,
  nft_token_id VARCHAR(128),
  dit_token_id VARCHAR(128),

  -- Pool state
  pool_balance_after DECIMAL(20, 6),

  -- Métadonnées
  created_at TIMESTAMP DEFAULT NOW(),

  -- Foreign Keys
  FOREIGN KEY (donor_address) REFERENCES donors(address) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_donations_donor_address ON donations(donor_address);
CREATE INDEX idx_donations_tx_hash ON donations(tx_hash);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX idx_donations_amount ON donations(amount DESC);
CREATE INDEX idx_donations_validated ON donations(validated);

COMMENT ON TABLE donations IS 'Historique de toutes les donations XRPL';

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. TABLE: distributions
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE distributions (
  id VARCHAR(255) PRIMARY KEY,
  ngo_id VARCHAR(255) NOT NULL,

  -- Distribution
  amount DECIMAL(20, 6) NOT NULL,
  percentage DECIMAL(5, 2), -- % du total distribué
  tx_hash VARCHAR(128) UNIQUE NOT NULL,
  validated BOOLEAN DEFAULT FALSE,

  -- Context
  distribution_type VARCHAR(50) DEFAULT 'regular',
  -- regular, emergency, manual
  emergency_id VARCHAR(255),

  -- Métadonnées
  created_at TIMESTAMP DEFAULT NOW(),

  -- Foreign Keys
  FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_distributions_ngo_id ON distributions(ngo_id);
CREATE INDEX idx_distributions_created_at ON distributions(created_at DESC);
CREATE INDEX idx_distributions_type ON distributions(distribution_type);
CREATE INDEX idx_distributions_emergency_id ON distributions(emergency_id);

COMMENT ON TABLE distributions IS 'Historique des redistributions aux ONG';

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. TABLE: emergency_funds
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE emergency_funds (
  id VARCHAR(255) PRIMARY KEY,
  triggered_by VARCHAR(64) NOT NULL,

  -- Emergency details
  reason TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL,
  -- low, medium, high, critical
  amount_requested DECIMAL(20, 6) NOT NULL,
  amount_distributed DECIMAL(20, 6) DEFAULT 0,

  -- Gouvernance
  approval_votes INTEGER DEFAULT 0,
  rejection_votes INTEGER DEFAULT 0,
  required_votes INTEGER NOT NULL,
  quorum_reached BOOLEAN DEFAULT FALSE,
  approved BOOLEAN DEFAULT FALSE,

  -- ONG affectées
  affected_ngos TEXT[], -- Array de ngo_ids

  -- Statut
  status VARCHAR(50) DEFAULT 'pending',
  -- pending, voting, approved, rejected, executed

  -- Métadonnées
  created_at TIMESTAMP DEFAULT NOW(),
  executed_at TIMESTAMP,

  -- Vérification
  CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  CHECK (status IN ('pending', 'voting', 'approved', 'rejected', 'executed'))
);

-- Indexes
CREATE INDEX idx_emergency_funds_severity ON emergency_funds(severity);
CREATE INDEX idx_emergency_funds_status ON emergency_funds(status);
CREATE INDEX idx_emergency_funds_created_at ON emergency_funds(created_at DESC);

COMMENT ON TABLE emergency_funds IS 'Fonds d''urgence avec gouvernance';

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. TABLE: operation_logs
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE operation_logs (
  id SERIAL PRIMARY KEY,

  -- Opération
  operation VARCHAR(100) NOT NULL,
  success BOOLEAN NOT NULL,
  duration INTEGER, -- en millisecondes

  -- Détails
  details JSONB,
  error_message TEXT,

  -- Context
  user_address VARCHAR(64),
  ip_address INET,

  -- Métadonnées
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_operation_logs_operation ON operation_logs(operation);
CREATE INDEX idx_operation_logs_success ON operation_logs(success);
CREATE INDEX idx_operation_logs_created_at ON operation_logs(created_at DESC);
CREATE INDEX idx_operation_logs_details ON operation_logs USING GIN (details);

COMMENT ON TABLE operation_logs IS 'Logs d''audit de toutes les opérations';

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. TABLE: pool_state
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE pool_state (
  id SERIAL PRIMARY KEY,

  -- Balances
  total_balance DECIMAL(20, 6) NOT NULL,
  total_donations DECIMAL(20, 6) DEFAULT 0,
  total_profits_generated DECIMAL(20, 6) DEFAULT 0,
  total_distributed DECIMAL(20, 6) DEFAULT 0,

  -- Compteurs
  donor_count INTEGER DEFAULT 0,
  ngo_count INTEGER DEFAULT 0,
  donation_count INTEGER DEFAULT 0,
  distribution_count INTEGER DEFAULT 0,

  -- Trading
  last_trading_run TIMESTAMP,
  last_profit_percentage DECIMAL(5, 2),

  -- Snapshot
  snapshot_date DATE UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pool_state_snapshot_date ON pool_state(snapshot_date DESC);

COMMENT ON TABLE pool_state IS 'Snapshots quotidiens de l''état du pool';

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Trigger: Auto-update donors.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_donors_updated_at
  BEFORE UPDATE ON donors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_ngos_updated_at
  BEFORE UPDATE ON ngos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Incrémenter donation_count dans donors
CREATE OR REPLACE FUNCTION increment_donor_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE donors
  SET
    donation_count = donation_count + 1,
    total_donated = total_donated + NEW.amount,
    last_donation_date = NEW.created_at
  WHERE address = NEW.donor_address;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_donor_stats
  AFTER INSERT ON donations
  FOR EACH ROW
  EXECUTE FUNCTION increment_donor_stats();

-- Trigger: Incrémenter total_received dans ngos
CREATE OR REPLACE FUNCTION increment_ngo_received()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ngos
  SET
    total_received = total_received + NEW.amount,
    last_distribution_date = NEW.created_at
  WHERE id = NEW.ngo_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_ngo_received
  AFTER INSERT ON distributions
  FOR EACH ROW
  EXECUTE FUNCTION increment_ngo_received();

-- ═══════════════════════════════════════════════════════════════════════════
-- VUES UTILES
-- ═══════════════════════════════════════════════════════════════════════════

-- Vue: Leaderboard des donateurs
CREATE OR REPLACE VIEW donor_leaderboard AS
SELECT
  id,
  address,
  total_donated,
  xp,
  level,
  donation_count,
  RANK() OVER (ORDER BY total_donated DESC) as rank,
  RANK() OVER (ORDER BY xp DESC) as xp_rank
FROM donors
ORDER BY total_donated DESC;

COMMENT ON VIEW donor_leaderboard IS 'Classement des donateurs';

-- Vue: Statistiques des ONG
CREATE OR REPLACE VIEW ngo_statistics AS
SELECT
  id,
  name,
  category,
  verified,
  impact_score,
  total_received,
  (SELECT COUNT(*) FROM distributions WHERE ngo_id = ngos.id) as distribution_count,
  last_distribution_date
FROM ngos
ORDER BY total_received DESC;

COMMENT ON VIEW ngo_statistics IS 'Statistiques complètes des ONG';

-- Vue: Donations récentes (7 derniers jours)
CREATE OR REPLACE VIEW recent_donations AS
SELECT
  d.id,
  d.donor_address,
  don.level as donor_level,
  d.amount,
  d.tx_hash,
  d.xp_gained,
  d.created_at
FROM donations d
LEFT JOIN donors don ON d.donor_address = don.address
WHERE d.created_at >= NOW() - INTERVAL '7 days'
ORDER BY d.created_at DESC;

COMMENT ON VIEW recent_donations IS 'Donations des 7 derniers jours';

-- Vue: Résumé du pool actuel
CREATE OR REPLACE VIEW pool_summary AS
SELECT
  (SELECT COALESCE(SUM(amount), 0) FROM donations) as total_donations,
  (SELECT COALESCE(SUM(amount), 0) FROM distributions) as total_distributed,
  (SELECT COUNT(*) FROM donors) as donor_count,
  (SELECT COUNT(*) FROM ngos WHERE verified = true) as verified_ngo_count,
  (SELECT COUNT(*) FROM donations) as donation_count,
  (SELECT COUNT(*) FROM distributions) as distribution_count,
  (SELECT COUNT(*) FROM emergency_funds WHERE status = 'executed') as emergency_count;

COMMENT ON VIEW pool_summary IS 'Résumé en temps réel du pool';

-- ═══════════════════════════════════════════════════════════════════════════
-- FONCTIONS UTILES
-- ═══════════════════════════════════════════════════════════════════════════

-- Fonction: Calculer le niveau d'un donateur
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(SQRT(xp::DECIMAL / 100)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_level IS 'Calcule le niveau basé sur l''XP';

-- Fonction: Calculer XP gagné pour un montant
CREATE OR REPLACE FUNCTION calculate_xp(amount DECIMAL)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(amount * 10);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_xp IS 'Calcule l''XP pour un montant donné';

-- ═══════════════════════════════════════════════════════════════════════════
-- DONNÉES DE TEST
-- ═══════════════════════════════════════════════════════════════════════════

-- Insérer des ONG de test
INSERT INTO ngos (id, name, wallet_address, category, verified, impact_score, weight, certifications, website, description, country) VALUES
('ngo_1', 'Climate Action Network', 'rClimateAction123456789ABCDEF', 'climate', TRUE, 95, 0.25, ARRAY['UN_VERIFIED', 'ISO_14001'], 'https://climate-action.org', 'Leading climate action organization', 'Global'),
('ngo_2', 'Water For All', 'rWaterForAll123456789ABCDEFG', 'water', TRUE, 92, 0.20, ARRAY['UN_VERIFIED', 'CHARITY_NAVIGATOR_4STAR'], 'https://waterforall.org', 'Clean water access worldwide', 'Global'),
('ngo_3', 'Education First', 'rEducationFirst123456789ABCDE', 'education', TRUE, 88, 0.20, ARRAY['UN_VERIFIED'], 'https://educationfirst.org', 'Quality education for all children', 'Global'),
('ngo_4', 'Health For Life', 'rHealthForLife123456789ABCDEF', 'health', TRUE, 90, 0.20, ARRAY['WHO_CERTIFIED', 'UN_VERIFIED'], 'https://healthforlife.org', 'Medical care in developing countries', 'Global'),
('ngo_5', 'Community Support', 'rCommunitySupport123456789ABCD', 'other', TRUE, 85, 0.15, ARRAY['LOCAL_CERT'], 'https://communitysupport.org', 'Local community development', 'Regional');

-- Insérer un donateur de test
INSERT INTO donors (id, address, total_donated, xp, level, donation_count, first_donation_date, last_donation_date) VALUES
('donor_1', 'rTestDonor123456789ABCDEFGHIJ', 1000.00, 10000, 11, 5, NOW() - INTERVAL '30 days', NOW());

-- Insérer un snapshot du pool
INSERT INTO pool_state (total_balance, total_donations, donor_count, ngo_count, snapshot_date) VALUES
(10000.00, 8000.00, 10, 5, CURRENT_DATE);

-- ═══════════════════════════════════════════════════════════════════════════
-- PERMISSIONS (Optionnel)
-- ═══════════════════════════════════════════════════════════════════════════

-- Créer un rôle pour l'application
-- CREATE ROLE xrpl_app_user WITH LOGIN PASSWORD 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO xrpl_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO xrpl_app_user;

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DU SCHÉMA
-- ═══════════════════════════════════════════════════════════════════════════

-- Afficher un résumé
SELECT 'Schema created successfully!' as status;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';
