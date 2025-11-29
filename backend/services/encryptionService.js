/**
 * Encryption Service
 * 
 * Service de chiffrement/déchiffrement pour les secrets Oracle
 * Utilise AES-256-CBC avec clé stockée dans les variables d'environnement
 */

import crypto from 'crypto';

class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-cbc';

        // Récupérer la clé depuis .env ou en générer une par défaut
        // ⚠️ EN PRODUCTION: Utilisez une clé générée de manière sécurisée!
        this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateDefaultKey();

        if (!process.env.ENCRYPTION_KEY) {
            console.warn('⚠️  ATTENTION: Aucune ENCRYPTION_KEY dans .env! Utilisation d\'une clé par défaut.');
            console.warn('   Générez une clé avec: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"');
        }
    }

    /**
     * Génère une clé par défaut (NON SÉCURISÉ pour production!)
     */
    generateDefaultKey() {
        // Clé dérivée d'un texte (pour dev uniquement)
        return crypto.createHash('sha256').update('xrpl-impact-map-dev-key').digest();
    }

    /**
     * Chiffre un texte
     * @param {string} text - Texte à chiffrer
     * @returns {string} - Texte chiffré au format "iv:encrypted"
     */
    encrypt(text) {
        try {
            // Générer un IV (Initialization Vector) aléatoire
            const iv = crypto.randomBytes(16);

            // Créer le cipher
            const cipher = crypto.createCipheriv(
                this.algorithm,
                Buffer.isBuffer(this.encryptionKey) ? this.encryptionKey : Buffer.from(this.encryptionKey, 'hex'),
                iv
            );

            // Chiffrer
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            // Retourner IV + encrypted (séparés par :)
            return iv.toString('hex') + ':' + encrypted;
        } catch (error) {
            throw new Error(`Erreur de chiffrement: ${error.message}`);
        }
    }

    /**
     * Déchiffre un texte
     * @param {string} encryptedText - Texte chiffré au format "iv:encrypted"
     * @returns {string} - Texte original
     */
    decrypt(encryptedText) {
        try {
            // Séparer IV et encrypted
            const parts = encryptedText.split(':');
            if (parts.length !== 2) {
                throw new Error('Format de texte chiffré invalide');
            }

            const iv = Buffer.from(parts[0], 'hex');
            const encrypted = parts[1];

            // Créer le decipher
            const decipher = crypto.createDecipheriv(
                this.algorithm,
                Buffer.isBuffer(this.encryptionKey) ? this.encryptionKey : Buffer.from(this.encryptionKey, 'hex'),
                iv
            );

            // Déchiffrer
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            throw new Error(`Erreur de déchiffrement: ${error.message}`);
        }
    }

    /**
     * Génère une nouvelle clé de chiffrement
     * @returns {string} - Clé hexadécimale de 32 bytes
     */
    static generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }
}

export default new EncryptionService();
