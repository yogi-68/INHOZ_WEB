import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useLanguage } from '../context/LanguageContext';

const Layout = ({ isDarkMode, toggleDarkMode, children }) => {
  const { translate } = useLanguage();

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="sticky top-0 z-50 md:relative">
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </div>
      
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 transition-all duration-300 p-3 md:p-6">
          <div className="max-w-7xl mx-auto w-full">
            {children || <Outlet />}
          </div>
        </main>
        
        <footer className={`p-4 text-xs sm:text-sm text-center border-t ${
          isDarkMode 
            ? 'text-gray-400 border-gray-700 bg-gray-800' 
            : 'text-gray-600 border-gray-200 bg-white'
        }`}>
          © {new Date().getFullYear()} Smart Hospital
        </footer>
      </div>
    </div>
  );
};

export default Layout; 