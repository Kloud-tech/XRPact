"use strict";
/**
 * Script de test simple pour SmartEscrowService
 *
 * Ce script va:
 * 1. Générer des wallets Testnet
 * 2. Les financer via le faucet
 * 3. Créer un escrow simple
 * 4. Le débloquer
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var SmartEscrowService_1 = require("./SmartEscrowService");
var xrpl_1 = require("xrpl");
var TESTNET_URL = 'wss://s.altnet.rippletest.net:51233';
function fundWallet(client) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('💰 Demande de financement au faucet Testnet...');
                    return [4 /*yield*/, client.fundWallet()];
                case 1:
                    response = _a.sent();
                    console.log("\u2705 Wallet financ\u00E9: ".concat(response.wallet.address));
                    console.log("   Balance: ".concat(response.balance, " XRP"));
                    return [2 /*return*/, response.wallet];
            }
        });
    });
}
function testSmartEscrow() {
    return __awaiter(this, void 0, void 0, function () {
        var client, donorWallet, beneficiaryWallet, oracleWallet, service, oracleSecret, escrowInfo, unlockTxHash, donorBalance, beneficiaryBalance, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n' + '='.repeat(80));
                    console.log('🧪 TEST SMART ESCROW SERVICE');
                    console.log('='.repeat(80) + '\n');
                    client = new xrpl_1.Client(TESTNET_URL);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 14, , 16]);
                    return [4 /*yield*/, client.connect()];
                case 2:
                    _a.sent();
                    console.log('✅ Connecté au XRPL Testnet\n');
                    // 1. Créer et financer les wallets
                    console.log('📝 Étape 1: Création des wallets de test\n');
                    return [4 /*yield*/, fundWallet(client)];
                case 3:
                    donorWallet = _a.sent();
                    return [4 /*yield*/, fundWallet(client)];
                case 4:
                    beneficiaryWallet = _a.sent();
                    return [4 /*yield*/, fundWallet(client)];
                case 5:
                    oracleWallet = _a.sent();
                    console.log('\n📋 Wallets créés:');
                    console.log("   Donateur: ".concat(donorWallet.address));
                    console.log("   B\u00E9n\u00E9ficiaire: ".concat(beneficiaryWallet.address));
                    console.log("   Oracle: ".concat(oracleWallet.address));
                    return [4 /*yield*/, client.disconnect()];
                case 6:
                    _a.sent();
                    // 2. Créer le service
                    console.log('\n📝 Étape 2: Création d\'un escrow conditionnel\n');
                    service = new SmartEscrowService_1.default(TESTNET_URL);
                    oracleSecret = service.generateRandomSecret();
                    console.log("\uD83D\uDD11 Secret Oracle g\u00E9n\u00E9r\u00E9: ".concat(oracleSecret.substring(0, 16), "...\n"));
                    return [4 /*yield*/, service.createSmartEscrow({
                            donorSeed: donorWallet.seed,
                            amount: '10', // 10 XRP
                            beneficiary: beneficiaryWallet.address,
                            oracleSecret: oracleSecret,
                            deadline: Math.floor(Date.now() / 1000) + 60 * 60, // 1 heure
                        })];
                case 7:
                    escrowInfo = _a.sent();
                    console.log('\n✅ Escrow créé avec succès!');
                    console.log("   Owner: ".concat(escrowInfo.owner));
                    console.log("   Sequence: ".concat(escrowInfo.sequence));
                    console.log("   TX Hash: ".concat(escrowInfo.txHash));
                    console.log("   Montant: ".concat(parseInt(escrowInfo.amount) / 1000000, " XRP"));
                    console.log("   B\u00E9n\u00E9ficiaire: ".concat(escrowInfo.destination));
                    console.log("\n   \uD83D\uDD17 Explorer: https://testnet.xrpl.org/transactions/".concat(escrowInfo.txHash));
                    // 3. Attendre un peu (pour que la transaction soit bien confirmée)
                    console.log('\n⏳ Attente de 5 secondes...\n');
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                case 8:
                    _a.sent();
                    // 4. Débloquer l'escrow
                    console.log('📝 Étape 3: Déblocage de l\'escrow\n');
                    return [4 /*yield*/, service.fulfillEscrow(oracleWallet, escrowInfo.owner, escrowInfo.sequence, oracleSecret)];
                case 9:
                    unlockTxHash = _a.sent();
                    console.log('\n🎉 SUCCÈS! Escrow débloqué!');
                    console.log("   TX Hash: ".concat(unlockTxHash));
                    console.log("   \uD83D\uDD17 Explorer: https://testnet.xrpl.org/transactions/".concat(unlockTxHash));
                    // 5. Vérifier les balances
                    console.log('\n📝 Étape 4: Vérification des balances finales\n');
                    return [4 /*yield*/, client.connect()];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, client.getXrpBalance(donorWallet.address)];
                case 11:
                    donorBalance = _a.sent();
                    return [4 /*yield*/, client.getXrpBalance(beneficiaryWallet.address)];
                case 12:
                    beneficiaryBalance = _a.sent();
                    console.log('💰 Balances finales:');
                    console.log("   Donateur: ".concat(donorBalance, " XRP"));
                    console.log("   B\u00E9n\u00E9ficiaire: ".concat(beneficiaryBalance, " XRP"));
                    return [4 /*yield*/, client.disconnect()];
                case 13:
                    _a.sent();
                    console.log('\n' + '='.repeat(80));
                    console.log('✅ TEST RÉUSSI! Toutes les fonctionnalités marchent!');
                    console.log('='.repeat(80) + '\n');
                    return [3 /*break*/, 16];
                case 14:
                    error_1 = _a.sent();
                    console.error('\n❌ ERREUR:', error_1);
                    if (error_1 instanceof Error) {
                        console.error('   Message:', error_1.message);
                        console.error('   Stack:', error_1.stack);
                    }
                    return [4 /*yield*/, client.disconnect()];
                case 15:
                    _a.sent();
                    process.exit(1);
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
            }
        });
    });
}
// Exécuter le test
console.log('🚀 Démarrage du test SmartEscrowService...\n');
testSmartEscrow().then(function () {
    console.log('✅ Test terminé avec succès!');
    process.exit(0);
}).catch(function (error) {
    console.error('❌ Test échoué:', error);
    process.exit(1);
});
