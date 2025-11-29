/**
 * MongoDB Configuration
 * 
 * Replaces PostgreSQL/Redis setup with pure MongoDB Atlas
 */

const mongoose = require('mongoose');

class Database {
    constructor() {
        this.connection = null;
    }

    async connect() {
        try {
            const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xrpl-impact-map';

            console.log('[Database] Connecting to MongoDB...');

            this.connection = await mongoose.connect(MONGODB_URI, {
                // Options recommandées
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            console.log('✅ Connected to MongoDB');
            console.log(`   Database: ${this.connection.connection.name}`);
            console.log(`   Host: ${this.connection.connection.host}`);

            // Event listeners
            mongoose.connection.on('error', (err) => {
                console.error('❌ MongoDB error:', err);
            });

            mongoose.connection.on('disconnected', () => {
                console.warn('⚠️  MongoDB disconnected');
            });

            return this.connection;
        } catch (error) {
            console.error('❌ Failed to connect to MongoDB:', error.message);
            console.log('\n💡 Troubleshooting:');
            console.log('   1. Check your MONGODB_URI in .env file');
            console.log('   2. Ensure MongoDB Atlas IP whitelist allows your IP (0.0.0.0/0 for dev)');
            console.log('   3. Verify your username/password');
            console.log('   4. For local dev: mongodb://localhost:27017/xrpl-impact-map\n');
            throw error;
        }
    }

    async disconnect() {
        if (this.connection) {
            await mongoose.disconnect();
            console.log('👋 Disconnected from MongoDB');
        }
    }

    // Helper pour vérifier la connexion
    isConnected() {
        return mongoose.connection.readyState === 1;
    }

    // Nettoyer toutes les collections (dev only!)
    async clearAllCollections() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Cannot clear collections in production!');
        }

        const collections = Object.keys(mongoose.connection.collections);
        for (const collectionName of collections) {
            await mongoose.connection.collections[collectionName].deleteMany({});
        }
        console.log('🗑️  All collections cleared');
    }
}

module.exports = new Database();
