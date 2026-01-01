import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    
    // Pour l'arabe, changer la direction du texte
    if (lng === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇹🇳' }
  ];

  return (
    <div className="dropdown" style={{ marginLeft: '10px' }}>
      <button
        className="btn btn-sm dropdown-toggle"
        type="button"
        id="languageDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={{
          backgroundColor: 'transparent',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'inherit',
          borderRadius: '8px',
          padding: '5px 15px'
        }}
      >
        {languages.find(lang => lang.code === i18n.language)?.flag || '🌐'}
      </button>
      <ul className="dropdown-menu" aria-labelledby="languageDropdown">
        {languages.map(lang => (
          <li key={lang.code}>
            <button
              className={`dropdown-item ${i18n.language === lang.code ? 'active' : ''}`}
              onClick={() => changeLanguage(lang.code)}
            >
              {lang.flag} {lang.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LanguageSelector;