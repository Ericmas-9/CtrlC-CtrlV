import React from 'react';
import { Compass, PlusCircle, MessageSquare, User } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import './BottomNav.css';

const BottomNav = ({ currentTab, setCurrentTab, unreadChatCount = 0 }) => {
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
        <div className="nav-icon-wrapper">
          <MessageSquare size={24} className="nav-icon" />
          {unreadChatCount > 0 && (
            <span className="unread-chat-badge">{unreadChatCount > 9 ? '9+' : unreadChatCount}</span>
          )}
        </div>
        <span className={`nav-label ${currentTab === 'matches' ? 'active-label' : ''}`}>{t('Chats')}</span>
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
