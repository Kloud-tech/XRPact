#!/usr/bin/env node

/**
 * Script de vérification de l'installation
 * Lance ce script pour vérifier que tout est bien configuré
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(60));
console.log('🔍 XRPL Impact Fund - Vérification de l\'installation');
console.log('='.repeat(60) + '\n');

const checks = [];

// Check 1: Node.js version
try {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  if (majorVersion >= 18) {
    checks.push({ name: 'Node.js version', status: '✅', detail: nodeVersion });
  } else {
    checks.push({ name: 'Node.js version', status: '❌', detail: `${nodeVersion} (besoin de 18+)` });
  }
} catch (e) {
  checks.push({ name: 'Node.js version', status: '❌', detail: e.message });
}

// Check 2: npm
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  checks.push({ name: 'npm', status: '✅', detail: `v${npmVersion}` });
} catch (e) {
  checks.push({ name: 'npm', status: '❌', detail: 'Non installé' });
}

// Check 3: Docker
try {
  const dockerVersion = execSync('docker --version', { encoding: 'utf8' }).trim();
  checks.push({ name: 'Docker', status: '✅', detail: dockerVersion });
} catch (e) {
  checks.push({ name: 'Docker', status: '⚠️', detail: 'Non installé (optionnel)' });
}

// Check 4: Docker running
try {
  execSync('docker ps', { encoding: 'utf8', stdio: 'pipe' });
  checks.push({ name: 'Docker actif', status: '✅', detail: 'Containers actifs' });
} catch (e) {
  checks.push({ name: 'Docker actif', status: '⚠️', detail: 'Docker Desktop non démarré' });
}

// Check 5: Frontend dependencies
const frontendNodeModules = path.join(__dirname, 'frontend', 'node_modules');
if (fs.existsSync(frontendNodeModules)) {
  checks.push({ name: 'Frontend dependencies', status: '✅', detail: 'Installées' });
} else {
  checks.push({ name: 'Frontend dependencies', status: '❌', detail: 'Manquantes (lancer: cd frontend && npm install)' });
}

// Check 6: Backend dependencies
const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
if (fs.existsSync(backendNodeModules)) {
  checks.push({ name: 'Backend dependencies', status: '✅', detail: 'Installées' });
} else {
  checks.push({ name: 'Backend dependencies', status: '❌', detail: 'Manquantes (lancer: cd backend && npm install)' });
}

// Check 7: .env file
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  checks.push({ name: 'Fichier .env', status: '✅', detail: 'Présent' });
} else {
  checks.push({ name: 'Fichier .env', status: '⚠️', detail: 'Manquant (optionnel, copier .env.example)' });
}

// Check 8: Project structure
const requiredDirs = ['frontend', 'backend', 'docs', 'scripts'];
const missingDirs = requiredDirs.filter(dir => !fs.existsSync(path.join(__dirname, dir)));
if (missingDirs.length === 0) {
  checks.push({ name: 'Structure projet', status: '✅', detail: 'Complète' });
} else {
  checks.push({ name: 'Structure projet', status: '❌', detail: `Manquant: ${missingDirs.join(', ')}` });
}

// Display results
checks.forEach(check => {
  console.log(`${check.status} ${check.name.padEnd(25)} ${check.detail}`);
});

console.log('\n' + '='.repeat(60));

// Summary
const allGood = checks.every(c => c.status === '✅');
const hasErrors = checks.some(c => c.status === '❌');

if (allGood) {
  console.log('🎉 Tout est prêt! Vous pouvez lancer le projet.');
  console.log('\nCommandes pour démarrer:');
  console.log('  npm run dev:all          # Lancer frontend + backend');
  console.log('  npm run dev:frontend     # Lancer frontend seul');
  console.log('  npm run dev:backend      # Lancer backend seul');
} else if (hasErrors) {
  console.log('❌ Il y a des erreurs à corriger avant de continuer.');
  console.log('\nActions recommandées:');

  if (checks.find(c => c.name === 'Frontend dependencies' && c.status === '❌')) {
    console.log('  cd frontend && npm install');
  }
  if (checks.find(c => c.name === 'Backend dependencies' && c.status === '❌')) {
    console.log('  cd backend && npm install');
  }
} else {
  console.log('⚠️ Certains éléments optionnels sont manquants, mais vous pouvez continuer.');
  console.log('\nVous pouvez lancer le projet avec: npm run dev:all');
}

console.log('='.repeat(60) + '\n');

// Exit code
process.exit(hasErrors ? 1 : 0);
