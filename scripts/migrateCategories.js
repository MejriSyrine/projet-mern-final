/**
 * Migration script to convert recipe categories:
 * - sweet -> dessert
 * - sour -> plats
 * - salty -> plats
 * - spicy -> plats
 * 
 * Run with: node scripts/migrateCategories.js
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import Recipe model
const Recipe = require('../models/RecipeSchema');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/recipeapp';

async function migrateCategories() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get current category counts
        const beforeStats = await Recipe.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        console.log('\n📊 Categories BEFORE migration:');
        beforeStats.forEach(stat => {
            console.log(`   ${stat._id || 'null'}: ${stat.count} recipes`);
        });

        // Migrate sweet -> dessert
        const sweetResult = await Recipe.updateMany(
            { category: 'sweet' },
            { $set: { category: 'dessert' } }
        );
        console.log(`\n🍰 Converted ${sweetResult.modifiedCount} recipes from 'sweet' to 'dessert'`);

        // Migrate sour -> plats
        const sourResult = await Recipe.updateMany(
            { category: 'sour' },
            { $set: { category: 'plats' } }
        );
        console.log(`🍽️ Converted ${sourResult.modifiedCount} recipes from 'sour' to 'plats'`);

        // Migrate salty -> plats
        const saltyResult = await Recipe.updateMany(
            { category: 'salty' },
            { $set: { category: 'plats' } }
        );
        console.log(`🍽️ Converted ${saltyResult.modifiedCount} recipes from 'salty' to 'plats'`);

        // Migrate spicy -> plats
        const spicyResult = await Recipe.updateMany(
            { category: 'spicy' },
            { $set: { category: 'plats' } }
        );
        console.log(`🍽️ Converted ${spicyResult.modifiedCount} recipes from 'spicy' to 'plats'`);

        // Get updated category counts
        const afterStats = await Recipe.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        console.log('\n📊 Categories AFTER migration:');
        afterStats.forEach(stat => {
            console.log(`   ${stat._id || 'null'}: ${stat.count} recipes`);
        });

        const totalMigrated = sweetResult.modifiedCount + sourResult.modifiedCount + 
                              saltyResult.modifiedCount + spicyResult.modifiedCount;
        console.log(`\n✅ Migration complete! Total recipes updated: ${totalMigrated}`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the migration
migrateCategories();
