// Configuration de l'application
const isProd = window.location.hostname !== 'localhost';

const config = {
  API_URL: isProd 
    ? 'https://glutenfree-api.onrender.com' 
    : 'http://localhost:5000'
};

export default config;
