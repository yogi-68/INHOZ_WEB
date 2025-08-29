import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'english';
  });

  const translate = (key) => {
    if (!translations[language] || !translations[language][key]) {
      // Fallback to English if translation not found
      return translations.english[key] || key;
    }
    return translations[language][key];
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, translate, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}; 