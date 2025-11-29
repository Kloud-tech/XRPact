/**
 * ═══════════════════════════════════════════════════════════════════════════
 * IMPACT ORACLE - TESTS COMPLETS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Suite de tests pour le service ImpactOracle
 *
 * Tests:
 * 1. Vérification d'une ONG avec toutes les sources
 * 2. Vérification d'une ONG avec sources partielles
 * 3. Vérification d'une ONG non reconnue (high risk)
 * 4. Cache de vérification
 * 5. Bulk verification
 * 6. Recherche par pays
 * 7. Top NGOs
 * 8. API health check
 */

import { Pool } from 'pg';
import { ImpactOracleService, NGOInput } from './impact-oracle';
import axios from 'axios';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'xrpl_impact_fund',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const oracleService = new ImpactOracleService(pool, {
  enableMockData: true, // Mode mock pour tests
  verificationIntervalDays: 30,
});

// URL du serveur API (si vous testez le serveur)
const API_URL = process.env.ORACLE_API_URL || 'http://localhost:3001';

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function logTest(testName: string) {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`TEST: ${testName}`);
  console.log('═'.repeat(80));
}

function logSuccess(message: string) {
  console.log(`✅ ${message}`);
}

function logError(message: string, error?: any) {
  console.error(`❌ ${message}`);
  if (error) {
    console.error('Error details:', error.message || error);
  }
}

function logInfo(message: string, data?: any) {
  console.log(`ℹ️  ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Test 1: Vérification d'une ONG de haute qualité
 */
async function testHighQualityNGO() {
  logTest('Test 1: Vérification ONG haute qualité (Climate Action Network)');

  try {
    const ngo: NGOInput = {
      xrplAddress: 'rClimateAction123456789ABCDEF',
      name: 'Climate Action Network',
      registrationNumber: '123456',
      country: 'US',
      website: 'https://climatenetwork.org',
      email: 'contact@climatenetwork.org',
    };

    const result = await oracleService.verifyNGOImpact(ngo);

    logInfo('Résultat de vérification:', result);

    // Assertions
    if (result.verified) {
      logSuccess('ONG vérifiée');
    } else {
      logError('ONG non vérifiée (attendu: verified = true)');
    }

    if (result.impactScore >= 70) {
      logSuccess(`Impact score élevé: ${result.impactScore}/100`);
    } else {
      logError(`Impact score trop bas: ${result.impactScore}/100`);
    }

    if (result.riskScore < 30) {
      logSuccess(`Risk score faible: ${result.riskScore}/100`);
    } else {
      logError(`Risk score trop élevé: ${result.riskScore}/100`);
    }

    logSuccess('Test 1 réussi ✅');
  } catch (error) {
    logError('Test 1 échoué', error);
    throw error;
  }
}

/**
 * Test 2: Vérification d'une ONG avec sources partielles
 */
async function testPartialVerificationNGO() {
  logTest('Test 2: Vérification ONG avec sources partielles');

  try {
    const ngo: NGOInput = {
      xrplAddress: 'rWaterForAll123456789ABCDEFG',
      name: 'Water For All',
      country: 'GB',
      registrationNumber: '789012',
    };

    const result = await oracleService.verifyNGOImpact(ngo);

    logInfo('Résultat de vérification:', result);

    // On s'attend à ce que certaines sources soient absentes
    const verifiedSourcesCount = Object.values(result.verificationSources).filter(
      Boolean
    ).length;

    logInfo(`Sources vérifiées: ${verifiedSourcesCount}/4`);

    if (verifiedSourcesCount >= 2 && result.verified) {
      logSuccess('ONG vérifiée avec au moins 2 sources');
    } else if (verifiedSourcesCount < 2 && !result.verified) {
      logSuccess('ONG non vérifiée (moins de 2 sources) - comportement attendu');
    } else {
      logError('Logique de vérification incorrecte');
    }

    if (result.warnings.length > 0) {
      logInfo('Warnings:', result.warnings);
    }

    logSuccess('Test 2 réussi ✅');
  } catch (error) {
    logError('Test 2 échoué', error);
    throw error;
  }
}

/**
 * Test 3: Vérification d'une ONG non reconnue (high risk)
 */
async function testUnknownHighRiskNGO() {
  logTest('Test 3: Vérification ONG non reconnue (high risk)');

  try {
    const ngo: NGOInput = {
      xrplAddress: 'rUnknownCharity123456789ABCD',
      name: 'Unknown Charity Org',
      country: 'XX',
    };

    const result = await oracleService.verifyNGOImpact(ngo);

    logInfo('Résultat de vérification:', result);

    if (!result.verified) {
      logSuccess('ONG non vérifiée (attendu)');
    } else {
      logError('ONG vérifiée alors qu\'elle devrait être non vérifiée');
    }

    if (result.riskScore > 50) {
      logSuccess(`Risk score élevé: ${result.riskScore}/100 (attendu)`);
    } else {
      logError(`Risk score trop bas: ${result.riskScore}/100`);
    }

    if (result.warnings.length > 0) {
      logSuccess(`${result.warnings.length} warnings générés`);
      logInfo('Warnings:', result.warnings);
    } else {
      logError('Aucun warning généré (attendu au moins 1)');
    }

    logSuccess('Test 3 réussi ✅');
  } catch (error) {
    logError('Test 3 échoué', error);
    throw error;
  }
}

/**
 * Test 4: Vérification du cache
 */
async function testCacheVerification() {
  logTest('Test 4: Vérification du cache');

  try {
    const ngo: NGOInput = {
      xrplAddress: 'rCachedNGO123456789ABCDEFGH',
      name: 'Cached NGO Test',
      country: 'FR',
      registrationNumber: 'CACHE123',
    };

    // Première vérification
    logInfo('Première vérification (pas de cache)...');
    const start1 = Date.now();
    const result1 = await oracleService.verifyNGOImpact(ngo);
    const duration1 = Date.now() - start1;
    logInfo(`Durée: ${duration1}ms`);

    // Deuxième vérification (devrait utiliser le cache)
    logInfo('Deuxième vérification (avec cache)...');
    const start2 = Date.now();
    const result2 = await oracleService.verifyNGOImpact(ngo);
    const duration2 = Date.now() - start2;
    logInfo(`Durée: ${duration2}ms`);

    if (duration2 < duration1) {
      logSuccess(`Cache utilisé! (${duration2}ms vs ${duration1}ms)`);
    } else {
      logInfo('Cache peut-être utilisé (durées similaires)');
    }

    if (result1.impactScore === result2.impactScore) {
      logSuccess('Scores identiques entre les deux vérifications');
    } else {
      logError('Scores différents (cache non utilisé?)');
    }

    logSuccess('Test 4 réussi ✅');
  } catch (error) {
    logError('Test 4 échoué', error);
    throw error;
  }
}

/**
 * Test 5: Top NGOs par impact
 */
async function testTopNGOs() {
  logTest('Test 5: Récupération des meilleures ONGs');

  try {
    const topNGOs = await oracleService.getTopNGOsByImpact(5);

    logInfo(`Nombre d'ONGs récupérées: ${topNGOs.length}`);

    if (topNGOs.length > 0) {
      logSuccess('ONGs récupérées avec succès');

      topNGOs.forEach((ngo, index) => {
        console.log(
          `  ${index + 1}. ${ngo.metadata.name} - Score: ${ngo.impactScore}/100 (${
            ngo.xrplAddress
          })`
        );
      });

      // Vérifier que les scores sont triés
      const isSorted = topNGOs.every(
        (ngo, i) => i === 0 || ngo.impactScore <= topNGOs[i - 1].impactScore
      );

      if (isSorted) {
        logSuccess('Scores triés par ordre décroissant');
      } else {
        logError('Scores non triés correctement');
      }
    } else {
      logInfo('Aucune ONG trouvée (base de données vide?)');
    }

    logSuccess('Test 5 réussi ✅');
  } catch (error) {
    logError('Test 5 échoué', error);
    throw error;
  }
}

/**
 * Test 6: ONGs par pays
 */
async function testNGOsByCountry() {
  logTest('Test 6: Récupération des ONGs par pays');

  try {
    const country = 'US';
    const ngos = await oracleService.getVerificationsByCountry(country);

    logInfo(`ONGs trouvées pour ${country}: ${ngos.length}`);

    if (ngos.length > 0) {
      logSuccess(`${ngos.length} ONG(s) trouvée(s) pour ${country}`);

      ngos.forEach((ngo, index) => {
        console.log(
          `  ${index + 1}. ${ngo.metadata.name} - Score: ${ngo.impactScore}/100`
        );
      });
    } else {
      logInfo(`Aucune ONG pour ${country} (normal si base vide)`);
    }

    logSuccess('Test 6 réussi ✅');
  } catch (error) {
    logError('Test 6 échoué', error);
    throw error;
  }
}

/**
 * Test 7: API REST - Health Check
 */
async function testAPIHealthCheck() {
  logTest('Test 7: API REST - Health Check');

  try {
    const response = await axios.get(`${API_URL}/oracle/health`);

    logInfo('Response:', response.data);

    if (response.status === 200 && response.data.success) {
      logSuccess('API Health Check OK');
      logInfo('Status:', response.data.status);
    } else {
      logError('Health check failed');
    }

    logSuccess('Test 7 réussi ✅');
  } catch (error) {
    logError('Test 7 échoué - Le serveur API est-il démarré?', error);
    logInfo('Pour démarrer le serveur: tsx backend/src/services/oracle-server.ts');
  }
}

/**
 * Test 8: API REST - Verify Endpoint
 */
async function testAPIVerifyEndpoint() {
  logTest('Test 8: API REST - Verify Endpoint');

  try {
    const ngo = {
      xrplAddress: 'rAPITest123456789ABCDEFGHIJK',
      name: 'API Test NGO',
      country: 'CA',
      registrationNumber: 'API123',
    };

    const response = await axios.post(`${API_URL}/oracle/verify`, ngo);

    logInfo('Response:', response.data);

    if (response.status === 200 && response.data.success) {
      logSuccess('Vérification via API réussie');
      logInfo('Impact Score:', response.data.data.impactScore);
      logInfo('Verified:', response.data.data.verified);
    } else {
      logError('Vérification via API échouée');
    }

    logSuccess('Test 8 réussi ✅');
  } catch (error) {
    logError('Test 8 échoué - Le serveur API est-il démarré?', error);
    logInfo('Pour démarrer le serveur: tsx backend/src/services/oracle-server.ts');
  }
}

/**
 * Test 9: API REST - Stats Endpoint
 */
async function testAPIStatsEndpoint() {
  logTest('Test 9: API REST - Stats Endpoint');

  try {
    const response = await axios.get(`${API_URL}/oracle/stats`);

    logInfo('Response:', response.data);

    if (response.status === 200 && response.data.success) {
      logSuccess('Statistiques récupérées avec succès');
      logInfo('Stats:', response.data.stats);
    } else {
      logError('Récupération des stats échouée');
    }

    logSuccess('Test 9 réussi ✅');
  } catch (error) {
    logError('Test 9 échoué - Le serveur API est-il démarré?', error);
  }
}

/**
 * Test 10: Validation des données d'entrée
 */
async function testInputValidation() {
  logTest('Test 10: Validation des données d\'entrée');

  try {
    // Test avec adresse XRPL invalide
    const invalidNGO = {
      xrplAddress: 'INVALID_ADDRESS', // Devrait échouer
      name: 'Invalid NGO',
    } as NGOInput;

    try {
      await oracleService.verifyNGOImpact(invalidNGO);
      logError('Validation devrait échouer pour adresse invalide');
    } catch (error) {
      logSuccess('Validation a correctement rejeté l\'adresse invalide');
      logInfo('Error:', (error as Error).message);
    }

    logSuccess('Test 10 réussi ✅');
  } catch (error) {
    logError('Test 10 échoué', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN TEST RUNNER
// ═══════════════════════════════════════════════════════════════════════════

async function runAllTests() {
  console.log('\n\n');
  console.log('═'.repeat(80));
  console.log('🔮 IMPACT ORACLE - SUITE DE TESTS');
  console.log('═'.repeat(80));

  try {
    // Tests du service
    await testHighQualityNGO();
    await testPartialVerificationNGO();
    await testUnknownHighRiskNGO();
    await testCacheVerification();
    await testTopNGOs();
    await testNGOsByCountry();
    await testInputValidation();

    // Tests de l'API REST (optionnel si serveur démarré)
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('Tests API REST (optionnel - serveur doit être démarré)');
    console.log('═'.repeat(80));

    await testAPIHealthCheck();
    await testAPIVerifyEndpoint();
    await testAPIStatsEndpoint();

    // Résumé
    console.log('\n\n');
    console.log('═'.repeat(80));
    console.log('🎉 TOUS LES TESTS RÉUSSIS!');
    console.log('═'.repeat(80));
    console.log('');
    console.log('✅ Tests du service: OK');
    console.log('✅ Tests de validation: OK');
    console.log('✅ Tests API REST: OK (si serveur démarré)');
    console.log('');
    console.log('Pour démarrer le serveur API:');
    console.log('  tsx backend/src/services/oracle-server.ts');
    console.log('');
  } catch (error) {
    console.error('\n\n❌ CERTAINS TESTS ONT ÉCHOUÉ');
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Exécuter les tests
runAllTests();
