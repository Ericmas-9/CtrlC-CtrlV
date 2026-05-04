import React, { useState } from 'react';
import { ChevronLeft, Lock, Shield, Link, Star, Ban, History, Eye, LogOut, ExternalLink, Instagram } from 'lucide-react';
import './Settings.css';

const Settings = ({ onBack, onLogout }) => {
  const [activeSubView, setActiveSubView] = useState(null); // 'phone', 'privacy', 'safety', 'linked', 'favorites', 'blocked', 'history', 'visibility', 'logout'
  const [phoneInput, setPhoneInput] = useState('+1 (555) 123-4567');
  const [visibility, setVisibility] = useState('public');

  const handleBack = () => setActiveSubView(null);

  // --- SUB-VIEWS ---

  const renderPhoneModal = () => (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <h3>Update Phone Number</h3>
        <p>A verification code will be sent to this number.</p>
        <input 
          type="text" 
          className="settings-input" 
          value={phoneInput} 
          onChange={(e) => setPhoneInput(e.target.value)} 
        />
        <div className="modal-actions">
          <button className="btn-cancel" onClick={handleBack}>Cancel</button>
          <button className="btn-save" onClick={handleBack}>Save</button>
        </div>
      </div>
    </div>
  );

  const renderLogoutModal = () => (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <h3>Log Out</h3>
        <p>Are you sure you want to log out? You will need to verify your phone number to log back in.</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={handleBack}>Cancel</button>
          <button className="btn-danger" onClick={onLogout}>Yes, Log Out</button>
        </div>
      </div>
    </div>
  );

  const renderPrivacyView = () => (
    <div className="sub-view-container">
      <div className="sub-view-header">
        <button className="icon-btn-ghost" onClick={handleBack}><ChevronLeft size={24} /></button>
        <h2>Privacy</h2>
        <div style={{ width: '40px' }}></div>
      </div>
      <div className="sub-view-content">
        <div className="settings-section">
          <div className="settings-item toggle-row">
            <div className="settings-item-text">
              <h4>Show my age</h4>
              <p>Allow others to see your age on your profile</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="settings-item toggle-row">
            <div className="settings-item-text">
              <h4>Last seen</h4>
              <p>Show when you were last active</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="settings-item toggle-row">
            <div className="settings-item-text">
              <h4>Read receipts</h4>
              <p>Show when you've read a message</p>
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
        <h2>Safety Center</h2>
        <div style={{ width: '40px' }}></div>
      </div>
      <div className="sub-view-content">
        <div className="settings-section">
          <div className="settings-item">
            <div className="settings-item-text">
              <h4>Community Guidelines</h4>
            </div>
            <ExternalLink size={18} color="var(--color-gray-400)" />
          </div>
          <div className="settings-item">
            <div className="settings-item-text">
              <h4>Safety Tips</h4>
            </div>
            <ExternalLink size={18} color="var(--color-gray-400)" />
          </div>
          <div className="settings-item">
            <div className="settings-item-text">
              <h4 style={{ color: 'var(--color-red)' }}>Report a Problem</h4>
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
        <h2>Linked Accounts</h2>
        <div style={{ width: '40px' }}></div>
      </div>
      <div className="sub-view-content">
        <div className="settings-section">
          <div className="settings-item">
            <div className="settings-item-icon"><Instagram size={24} color="#E1306C" /></div>
            <div className="settings-item-text"><h4>Instagram</h4></div>
            <button className="ghost-action-btn">Disconnect</button>
          </div>
          <div className="settings-item">
            <div className="settings-item-icon">
              <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#1DB954', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>S</span>
              </div>
            </div>
            <div className="settings-item-text"><h4>Spotify</h4></div>
            <button className="ghost-action-btn connected">Connect</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFavoritesView = () => (
    <div className="sub-view-container">
      <div className="sub-view-header">
        <button className="icon-btn-ghost" onClick={handleBack}><ChevronLeft size={24} /></button>
        <h2>Favorite Matches</h2>
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
        <h2>Blocked Accounts</h2>
        <div style={{ width: '40px' }}></div>
      </div>
      <div className="sub-view-content">
        <div className="settings-section">
          <div className="settings-item">
            <div className="settings-item-text"><h4>User 123</h4></div>
            <button className="ghost-action-btn">Unblock</button>
          </div>
          <div className="settings-item">
            <div className="settings-item-text"><h4>Secret Squad</h4></div>
            <button className="ghost-action-btn">Unblock</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistoryView = () => (
    <div className="sub-view-container">
      <div className="sub-view-header">
        <button className="icon-btn-ghost" onClick={handleBack}><ChevronLeft size={24} /></button>
        <h2>Plan History</h2>
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
        <h2>Account Visibility</h2>
        <div style={{ width: '40px' }}></div>
      </div>
      <div className="sub-view-content">
        <div className="settings-section">
          <div className="settings-item radio-row" onClick={() => setVisibility('public')}>
            <div className="settings-item-text">
              <h4>Public</h4>
              <p>Everyone can see your plans in the Discover feed</p>
            </div>
            <div className={`radio-circle ${visibility === 'public' ? 'active' : ''}`}></div>
          </div>
          <div className="settings-item radio-row" onClick={() => setVisibility('private')}>
            <div className="settings-item-text">
              <h4>Private</h4>
              <p>Only your matches can see your plans</p>
            </div>
            <div className={`radio-circle ${visibility === 'private' ? 'active' : ''}`}></div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- MAIN RENDER ---
  
  if (activeSubView && activeSubView !== 'phone' && activeSubView !== 'logout') {
    switch (activeSubView) {
      case 'privacy': return renderPrivacyView();
      case 'safety': return renderSafetyView();
      case 'linked': return renderLinkedAccountsView();
      case 'favorites': return renderFavoritesView();
      case 'blocked': return renderBlockedView();
      case 'history': return renderHistoryView();
      case 'visibility': return renderVisibilityView();
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
          <h3 className="section-label">ACCOUNT</h3>
          
          <div className="settings-item" onClick={() => setActiveSubView('phone')}>
            <div className="settings-item-icon">
              <span style={{ fontSize: '18px' }}>📞</span>
            </div>
            <div className="settings-item-text">
              <h4>Phone Number</h4>
              <p>{phoneInput}</p>
            </div>
            <ChevronLeft size={20} className="chevron-right" />
          </div>

          <div className="settings-item" onClick={() => setActiveSubView('privacy')}>
            <div className="settings-item-icon">
              <Lock size={20} color="var(--color-turquoise)" />
            </div>
            <div className="settings-item-text">
              <h4>Privacy</h4>
            </div>
            <ChevronLeft size={20} className="chevron-right" />
          </div>

          <div className="settings-item" onClick={() => setActiveSubView('safety')}>
            <div className="settings-item-icon">
              <Shield size={20} color="var(--color-turquoise)" />
            </div>
            <div className="settings-item-text">
              <h4>Safety Center</h4>
            </div>
            <ChevronLeft size={20} className="chevron-right" />
          </div>

          <div className="settings-item" onClick={() => setActiveSubView('linked')}>
            <div className="settings-item-icon">
              <Link size={20} color="var(--color-turquoise)" />
            </div>
            <div className="settings-item-text">
              <h4>Linked Accounts</h4>
              <p>Instagram</p>
            </div>
            <ChevronLeft size={20} className="chevron-right" />
          </div>

          <div className="settings-item" onClick={() => setActiveSubView('favorites')}>
            <div className="settings-item-icon">
              <Star size={20} color="var(--color-turquoise)" />
            </div>
            <div className="settings-item-text">
              <h4>Favorite Matches</h4>
            </div>
            <ChevronLeft size={20} className="chevron-right" />
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-label">SAFETY & ACTIVITY</h3>
          
          <div className="settings-item" onClick={() => setActiveSubView('blocked')}>
            <div className="settings-item-icon">
              <Ban size={20} color="var(--color-red)" />
            </div>
            <div className="settings-item-text">
              <h4>Blocked Accounts</h4>
            </div>
            <ChevronLeft size={20} className="chevron-right" />
          </div>

          <div className="settings-item" onClick={() => setActiveSubView('history')}>
            <div className="settings-item-icon">
              <History size={20} color="var(--color-turquoise)" />
            </div>
            <div className="settings-item-text">
              <h4>Plan History</h4>
            </div>
            <ChevronLeft size={20} className="chevron-right" />
          </div>

          <div className="settings-item" onClick={() => setActiveSubView('visibility')}>
            <div className="settings-item-icon">
              <Eye size={20} color="var(--color-turquoise)" />
            </div>
            <div className="settings-item-text">
              <h4>Account Visibility</h4>
            </div>
            <ChevronLeft size={20} className="chevron-right" />
          </div>
        </div>

        <div className="settings-actions">
          <button className="logout-btn" onClick={() => setActiveSubView('logout')}>
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </div>

      {activeSubView === 'phone' && renderPhoneModal()}
      {activeSubView === 'logout' && renderLogoutModal()}

    </div>
  );
};

export default Settings;
