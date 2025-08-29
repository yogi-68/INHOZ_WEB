import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo1.png';
import '../styles/LogoSplash.css';
import { useLanguage } from '../context/LanguageContext';

const LogoSplash = ({ onFinished }) => {
  const { translate } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onFinished();
    }, 5000); // 5 seconds duration

    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <motion.div
      className="logo-splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 1 }}
    >
      <div className="logo-content">
        <motion.div
          className="logo-container"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring", stiffness: 260, damping: 20 }}
        >
          <img src={logo} alt={translate('companyLogo')} className="logo-image" />
        </motion.div>
        <motion.p
          className="logo-subtext"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {translate('intelligentHospitalization')}
        </motion.p>
        <motion.div
          className="quote-container"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <p className="quote">
            {translate('splashQuote')}
          </p>
          <p className="quote-author">{translate('splashQuoteAuthor')}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LogoSplash;
