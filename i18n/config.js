const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const path = require('path');

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, './locales/{{lng}}.json')
    },
    fallbackLng: 'en',
    preload: ['en', 'fr'],
    detection: {
      order: ['header', 'querystring'],
      lookupHeader: 'accept-language',
      caches: false
    }
  });

module.exports = i18next;