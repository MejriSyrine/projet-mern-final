// Configuration de l'application
// En développement: http://localhost:5000
// En production: remplacer par l'URL de ton backend déployé (ex: https://glutenfree-api.onrender.com)

const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
};

export default config;
