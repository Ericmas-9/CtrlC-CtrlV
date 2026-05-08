import React, { useState } from 'react';
import { SlidersHorizontal, Bell, Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import './TopBar.css';

const TopBar = ({ title, subtitle, onOpenNotifications, onOpenSettings, hasNotifications }) => {
  const { language, changeLanguage } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const toggleLangMenu = () => {
    setShowLangMenu(!showLangMenu);
  };

  const handleLangChange = (lang) => {
    changeLanguage(lang);
    setShowLangMenu(false);
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        {title ? (
          <div className="top-bar-title-group">
            <h1 className="top-bar-title">{title}</h1>
            {subtitle && <p className="top-bar-subtitle">{subtitle}</p>}
          </div>
        ) : (
          <div className="logo-group">
            <div className="logo-icon">⚡</div>
            <h1 className="logo-text">Squad<span>Up</span></h1>
          </div>
        )}
      </div>
      <div className="top-bar-right">
        {!title && (
          <>
            <div className="lang-selector-container">
              <button className="icon-btn" onClick={toggleLangMenu}>
                <Globe size={20} />
              </button>
              {showLangMenu && (
                <div className="lang-dropdown">
                  <button className={`lang-option ${language === 'ca' ? 'active' : ''}`} onClick={() => handleLangChange('ca')}>Català</button>
                  <button className={`lang-option ${language === 'es' ? 'active' : ''}`} onClick={() => handleLangChange('es')}>Castellano</button>
                  <button className={`lang-option ${language === 'en' ? 'active' : ''}`} onClick={() => handleLangChange('en')}>English</button>
                </div>
              )}
            </div>
            <button className="icon-btn" onClick={onOpenSettings}>
              <SlidersHorizontal size={20} />
            </button>
            <button className="icon-btn" onClick={onOpenNotifications}>
              <Bell size={20} />
              {hasNotifications && <span className="notification-dot"></span>}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TopBar;
