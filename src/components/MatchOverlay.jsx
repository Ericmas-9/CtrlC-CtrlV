import React from 'react';
import './MatchOverlay.css';
import { Heart, MessageCircle, RefreshCcw, Zap } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const MatchOverlay = ({ onClose, onOpenChat, image1, image2, squad }) => {
  const { t } = useLanguage();
  return (
    <div className="match-overlay">
      <div className="match-content">
        <div className="match-header">
          <div className="happening-badge">
            <Zap size={14} fill="currentColor" /> IT&apos;S HAPPENING!
          </div>
          <h1 className="match-title">
            {t('itsA')}<br /><span className="match-highlight">{t('squadMatch')}</span>
          </h1>
          <p className="match-subtitle">{t('bothLiked')}</p>
        </div>

        <div className="match-cards-container">
          <div className="match-card match-card-left" style={{ backgroundImage: `url(${image1})` }}>
            <div className="match-card-label">{squad?.squadName || 'The Beach Boys'}</div>
          </div>
          <div className="match-heart-circle">
            <Heart fill="var(--color-red)" color="var(--color-red)" size={24} />
          </div>
          <div className="match-card match-card-right" style={{ backgroundImage: `url(${image2})` }}>
            <div className="match-card-label">{t('yourSquad')}</div>
          </div>
        </div>

        <div className="match-details">
          <span className="match-detail-pill">🏐 {squad?.planTitle || 'Sunset Volleyball'}</span>
          <span className="match-detail-pill">📍 {squad?.distance || '2.3 mi away'}</span>
        </div>

        <div className="match-actions">
          <button className="btn-primary" onClick={onOpenChat}>
            <MessageCircle size={20} /> {t('openSquadChat')}
          </button>
          <button className="btn-ghost" onClick={onClose}>
            <RefreshCcw size={18} /> {t('keepSwiping')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchOverlay;
