require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../models/RecipeSchema');

const recipes = [
  // PLATS
  {
    title: 'Poulet rôti aux herbes',
    ingredients: ['1 poulet entier', 'Thym', 'Romarin', 'Ail', 'Huile d\'olive', 'Sel', 'Poivre'],
    instructions: 'Préchauffer le four à 200°C. Frotter le poulet avec les herbes, l\'ail et l\'huile. Cuire 1h30 jusqu\'à ce qu\'il soit doré.',
    category: 'plats',
    status: 'validated',
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    title: 'Risotto aux champignons',
    ingredients: ['300g riz arborio', '200g champignons', 'Bouillon de légumes', 'Parmesan', 'Oignon', 'Vin blanc'],
    instructions: 'Faire revenir l\'oignon, ajouter le riz. Verser le bouillon petit à petit en remuant. Ajouter les champignons et le parmesan.',
    category: 'plats',
    status: 'validated',
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    title: 'Saumon grillé et légumes',
    ingredients: ['4 filets de saumon', 'Courgettes', 'Poivrons', 'Citron', 'Huile d\'olive', 'Herbes de Provence'],
    instructions: 'Griller le saumon 4 min de chaque côté. Servir avec les légumes grillés et un filet de citron.',
    category: 'plats',
    status: 'validated',
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    title: 'Curry de légumes au lait de coco',
    ingredients: ['Pommes de terre', 'Carottes', 'Pois chiches', 'Lait de coco', 'Pâte de curry', 'Coriandre'],
    instructions: 'Faire revenir les légumes, ajouter la pâte de curry et le lait de coco. Mijoter 25 min.',
    category: 'plats',
    status: 'validated',
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    title: 'Omelette aux fines herbes',
    ingredients: ['6 oeufs', 'Ciboulette', 'Persil', 'Estragon', 'Beurre', 'Sel', 'Poivre'],
    instructions: 'Battre les oeufs avec les herbes. Cuire dans une poêle beurrée à feu moyen.',
    category: 'plats',
    status: 'validated',
    createdBy: new mongoose.Types.ObjectId()
  },
  // DESSERTS
  {
    title: 'Mousse au chocolat sans gluten',
    ingredients: ['200g chocolat noir', '6 oeufs', '50g sucre', 'Pincée de sel'],
    instructions: 'Faire fondre le chocolat. Séparer les blancs des jaunes. Monter les blancs en neige. Mélanger délicatement.',
    category: 'dessert',
    status: 'validated',
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    title: 'Crème brûlée',
    ingredients: ['500ml crème', '5 jaunes d\'oeufs', '100g sucre', 'Vanille'],
    instructions: 'Mélanger les jaunes et le sucre. Ajouter la crème chaude. Cuire au bain-marie 45 min à 150°C. Caraméliser.',
    category: 'dessert',
    status: 'validated',
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    title: 'Panna cotta aux fruits rouges',
    ingredients: ['400ml crème', '60g sucre', 'Gélatine', 'Vanille', 'Fruits rouges'],
    instructions: 'Chauffer la crème avec le sucre et la vanille. Ajouter la gélatine. Verser dans des moules. Réfrigérer 4h.',
    category: 'dessert',
    status: 'validated',
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    title: 'Fondant au chocolat sans gluten',
    ingredients: ['200g chocolat', '100g beurre', '150g sucre', '3 oeufs', '50g farine de riz'],
    instructions: 'Fondre chocolat et beurre. Ajouter sucre, oeufs et farine. Cuire 12 min à 180°C.',
    category: 'dessert',
    status: 'validated',
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    title: 'Tiramisu sans gluten',
    ingredients: ['Mascarpone', 'Oeufs', 'Sucre', 'Café', 'Biscuits sans gluten', 'Cacao'],
    instructions: 'Monter les jaunes avec le sucre, ajouter le mascarpone. Alterner biscuits imbibés de café et crème.',
    category: 'dessert',
    status: 'validated',
    createdBy: new mongoose.Types.ObjectId()
  }
];

async function seedRecipes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const result = await Recipe.insertMany(recipes);
    console.log(`✅ Added ${result.length} recipes`);
    
    const total = await Recipe.countDocuments();
    console.log(`📊 Total recipes in database: ${total}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedRecipes();
