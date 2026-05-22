import React, { useState } from 'react';
import { ChevronLeft, Lock, Shield, Link, Star, Ban, History, Eye, LogOut, ExternalLink, Instagram, Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import './Settings.css';

const Settings = ({ onLogout }) => {
  const { t, language, changeLanguage } = useLanguage();
  const [activeSubView, setActiveSubView] = useState(null); 
  const [visibility, setVisibility] = useState('public');

  const handleBack = () => setActiveSubView(null);

  // --- SUB-VIEWS ---


  const renderLogoutModal = () => (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <h3>{t('logOut')}</h3>
        <p>{t('logoutConfirm')}</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={handleBack}>{t('cancel')}</button>
          <button className="btn-danger" onClick={onLogout}>{t('yesLogout')}</button>
        </div>
      </div>
    </div>
  );

  const renderPrivacyView = () => (
    <div className="sub-view-container">
      <div className="sub-view-header">
        <button className="icon-btn-ghost" onClick={handleBack}><ChevronLeft size={24} /></button>
        <h2>{t('privacy')}</h2>
        <div style={{ width: '40px' }}></div>
      </div>
      <div className="sub-view-content">
        <div className="settings-section">
          <div className="settings-item toggle-row">
            <div className="settings-item-text">
              <h4>{t('showMyAge')}</h4>
              <p>{t('showMyAgeDesc')}</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="settings-item toggle-row">
            <div className="settings-item-text">
              <h4>{t('lastSeen')}</h4>
              <p>{t('lastSeenDesc')}</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="settings-item toggle-row">
            <div className="settings-item-text">
              <h4>{t('readReceipts')}</h4>
              <p>{t('readReceiptsDesc')}</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSafetyView = () => (
    <div className="sub-view-container">
      <div className="sub-view-header">
        <button className="icon-btn-ghost" onClick={handleBack}><ChevronLeft size={24} /></button>
        <h2>{t('safetyCenter')}</h2>
        <div style={{ width: '40px' }}></div>
      </div>
      <div className="sub-view-content">
        <div className="settings-section">
          <div className="settings-item">
            <div className="settings-item-text">
              <h4>{t('communityGuidelines')}</h4>
            </div>
            <ExternalLink size={18} color="var(--color-gray-400)" />
          </div>
          <div className="settings-item">
            <div className="settings-item-text">
              <h4>{t('safetyTips')}</h4>
            </div>
            <ExternalLink size={18} color="var(--color-gray-400)" />
          </div>
          <div className="settings-item">
            <div className="settings-item-text">
              <h4 style={{ color: 'var(--color-red)' }}>{t('reportProblem')}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLinkedAccountsView = () => (
    <div className="sub-view-container">
      <div className="sub-view-header">
        <button className="icon-btn-ghost" onClick={handleBack}><ChevronLeft size={24} /></button>
        <h2>{t('linkedAccounts')}</h2>
        <div style={{ width: '40px' }}></div>
      </div>
      <div className="sub-view-content">
        <div className="settings-section">
          <div className="settings-item">
            <div className="settings-item-icon"><Instagram size={24} color="#E1306C" /></div>
            <div className="settings-item-text"><h4>Instagram</h4></div>
            <button className="ghost-action-btn">{t('disconnect')}</button>
          </div>
          <div className="settings-item">
            <div className="settings-item-icon">
              <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#1DB954', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>S</span>
              </div>
            </div>
            <div className="settings-item-text"><h4>Spotify</h4></div>
            <button className="ghost-action-btn connected">{t('connect')}</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFavoritesView = () => (
    <div className="sub-view-container">
      <div className="sub-view-header">
        <button className="icon-btn-ghost" onClick={handleBack}><ChevronLeft size={24} /></button>
        <h2>{t('favoriteMatches')}</h2>
        <div style={{ width: '40px' }}></div>
      </div>
      <div className="sub-view-content">
        <div className="mock-list">
          <div className="mock-list-item">
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=150&q=80" alt="squad" />
            <div className="mock-list-info">
              <h4>The Beach Boys</h4>
              <p>Sunset Volleyball</p>
            </div>
            <Star size={18} fill="var(--color-amber)" color="var(--color-amber)" />
          </div>
          <div className="mock-list-item">
            <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=150&q=80" alt="squad" />
            <div className="mock-list-info">
              <h4>The Foodies</h4>
              <p>Night Market Crawl</p>
            </div>
            <Star size={18} fill="var(--color-amber)" color="var(--color-amber)" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBlockedView = () => (
    <div className="sub-view-container">
      <div className="sub-view-header">
        <button className="icon-btn-ghost" onClick={handleBack}><ChevronLeft size={24} /></button>
        <h2>{t('blockedAccounts')}</h2>
        <div style={{ width: '40px' }}></div>
      </div>
      <div className="sub-view-content">
        <div className="settings-section">
          <div className="settings-item">
            <div className="settings-item-text"><h4>User 123</h4></div>
            <button className="ghost-action-btn">{t('unblock')}</button>
          </div>
          <div className="settings-item">
            <div className="settings-item-text"><h4>Secret Squad</h4></div>
            <button className="ghost-action-btn">{t('unblock')}</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistoryView = () => (
    <div className="sub-view-container">
      <div className="sub-view-header">
        <button className="icon-btn-ghost" onClick={handleBack}><ChevronLeft size={24} /></button>
        <h2>{t('planHistory')}</h2>
        <div style={{ width: '40px' }}></div>
      </div>
      <div className="sub-view-content">
        <div className="timeline-container">
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>Padel Match</h4>
              <p>April 20th, 2026</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>Beach Bonfire</h4>
              <p>April 12th, 2026</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>Taco Tuesday</h4>
              <p>March 30th, 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVisibilityView = () => (
    <div className="sub-view-container">
      <div className="sub-view-header">
        <button className="icon-btn-ghost" onClick={handleBack}><ChevronLeft size={24} /></button>
        <h2>{t('accountVisibility')}</h2>
        <div style={{ width: '40px' }}></div>
      </div>
      <div className="sub-view-content">
        <div className="settings-section">
          <div className="settings-item radio-row" onClick={() => setVisibility('public')}>
            <div className="settings-item-text">
              <h4>{t('public')}</h4>
              <p>{t('publicDesc')}</p>
            </div>
            <div className={`radio-circle ${visibility === 'public' ? 'active' : ''}`}></div>
          </div>
          <div className="settings-item radio-row" onClick={() => setVisibility('private')}>
            <div className="settings-item-text">
              <h4>{t('private')}</h4>
              <p>{t('privateDesc')}</p>
            </div>
            <div className={`radio-circle ${visibility === 'private' ? 'active' : ''}`}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLanguageView = () => (
    <div className="sub-view-container">
      <div className="sub-view-header">
        <button className="icon-btn-ghost" onClick={handleBack}><ChevronLeft size={24} /></button>
        <h2>{t('language')}</h2>
        <div style={{ width: '40px' }}></div>
      </div>
      <div className="sub-view-content">
        <div className="settings-section">
          <div className="settings-item radio-row" onClick={() => changeLanguage('ca')}>
            <div className="settings-item-text"><h4>Català</h4></div>
            <div className={`radio-circle ${language === 'ca' ? 'active' : ''}`}></div>
          </div>
          <div className="settings-item radio-row" onClick={() => changeLanguage('es')}>
            <div className="settings-item-text"><h4>Castellano</h4></div>
            <div className={`radio-circle ${language === 'es' ? 'active' : ''}`}></div>
          </div>
          <div className="settings-item radio-row" onClick={() => changeLanguage('en')}>
            <div className="settings-item-text"><h4>English</h4></div>
            <div className={`radio-circle ${language === 'en' ? 'active' : ''}`}></div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- MAIN RENDER ---
  
  if (activeSubView && activeSubView !== 'logout') {
    switch (activeSubView) {
      case 'privacy': return renderPrivacyView();
      case 'safety': return renderSafetyView();
      case 'linked': return renderLinkedAccountsView();
      case 'favorites': return renderFavoritesView();
      case 'blocked': return renderBlockedView();
      case 'history': return renderHistoryView();
      case 'visibility': return renderVisibilityView();
      case 'lang': return renderLanguageView();
      default: break;
    }
  }

  return (
    <div className="settings-screen">
      <div className="settings-header">
        {/* TopBar handles this in App.jsx */}
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3 className="section-label">{t('account')}</h3>
          
          <div className="settings-item" onClick={() => setActiveSubView('lang')}>
            <div className="settings-item-icon">
              <Globe size={20} color="var(--color-turquoise)" />
            </div>
            <div className="settings-item-text">
              <h4>{t('language')}</h4>
              <p>{language === 'ca' ? 'Català' : language === 'es' ? 'Castellano' : 'English'}</p>
            </div>
            <ChevronLeft size={20} className="chevron-right" />
          </div>


          <div className="settings-item" onClick={() => setActiveSubView('privacy')}>
            <div className="settings-item-icon">
              <Lock size={20} color="var(--color-turquoise)" />
            </div>
            <div className="settings-item-text">
              <h4>{t('privacy')}</h4>
            </div>
            <ChevronLeft size={20} className="chevron-right" />
          </div>

          <div className="settings-item" onClick={() => setActiveSubView('safety')}>
            <div className="settings-item-icon">
              <Shield size={20} color="var(--color-turquoise)" />
            </div>
            <div className="settings-item-text">
              <h4>{t('safetyCenter')}</h4>
            </div>
            <ChevronLeft size={20} className="chevron-right" />
          </div>

          <div className="settings-item" onClick={() => setActiveSubView('linked')}>
            <div className="settings-item-icon">
              <Link size={20} color="var(--color-turquoise)" />
            </div>
            <div className="settings-item-text">
              <h4>{t('linkedAccounts')}</h4>
              <p>Instagram</p>
            </div>
            <ChevronLeft size={20} className="chevron-right" />
          </div>

          <div className="settings-item" onClick={() => setActiveSubView('favorites')}>
            <div className="settings-item-icon">
              <Star size={20} color="var(--color-turquoise)" />
            </div>
            <div className="settings-item-text">
              <h4>{t('favoriteMatches')}</h4>
            </div>
            <ChevronLeft size={20} className="chevron-right" />
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-label">{t('safetyActivity')}</h3>
          
          <div className="settings-item" onClick={() => setActiveSubView('blocked')}>
            <div className="settings-item-icon">
              <Ban size={20} color="var(--color-red)" />
            </div>
            <div className="settings-item-text">
              <h4>{t('blockedAccounts')}</h4>
            </div>
            <ChevronLeft size={20} className="chevron-right" />
          </div>

          <div className="settings-item" onClick={() => setActiveSubView('history')}>
            <div className="settings-item-icon">
              <History size={20} color="var(--color-turquoise)" />
            </div>
            <div className="settings-item-text">
              <h4>{t('planHistory')}</h4>
            </div>
            <ChevronLeft size={20} className="chevron-right" />
          </div>

          <div className="settings-item" onClick={() => setActiveSubView('visibility')}>
            <div className="settings-item-icon">
              <Eye size={20} color="var(--color-turquoise)" />
            </div>
            <div className="settings-item-text">
              <h4>{t('accountVisibility')}</h4>
            </div>
            <ChevronLeft size={20} className="chevron-right" />
          </div>
        </div>

        <div className="settings-actions">
          <button className="logout-btn" onClick={() => setActiveSubView('logout')}>
            <LogOut size={20} /> {t('logOut')}
          </button>
        </div>
      </div>

      {activeSubView === 'logout' && renderLogoutModal()}

    </div>
  );
};

export default Settings;
