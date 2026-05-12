import React from 'react';
import { Compass, PlusCircle, MessageSquare, User } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import './BottomNav.css';

const BottomNav = ({ currentTab, setCurrentTab }) => {
  const { t } = useLanguage();
  
  return (
    <div className="bottom-nav">
      <button 
        className={`nav-item ${currentTab === 'discover' ? 'active' : ''}`}
        onClick={() => setCurrentTab('discover')}
      >
        <Compass size={24} className="nav-icon" />
        <span className={`nav-label ${currentTab === 'discover' ? 'active-label' : ''}`}>{t('discover')}</span>
      </button>

      <button className="nav-item primary-nav-item" onClick={() => setCurrentTab('create')}>
        <div className="primary-nav-icon-wrapper">
          <PlusCircle size={28} color="white" strokeWidth={2.5} className="nav-icon" />
        </div>
        <span className={`nav-label ${currentTab === 'create' ? 'active-label' : ''}`}>{t('create')}</span>
      </button>

      <button 
        className={`nav-item ${currentTab === 'matches' ? 'active' : ''}`}
        onClick={() => setCurrentTab('matches')}
      >
        <MessageSquare size={24} className="nav-icon" />
        <span className={`nav-label ${currentTab === 'matches' ? 'active-label' : ''}`}>Chats</span>
      </button>

      <button 
        className={`nav-item ${currentTab === 'profile' ? 'active' : ''}`}
        onClick={() => setCurrentTab('profile')}
      >
        <User size={24} className="nav-icon" />
        <span className={`nav-label ${currentTab === 'profile' ? 'active-label' : ''}`}>{t('profile')}</span>
      </button>
    </div>
  );
};

export default BottomNav;
