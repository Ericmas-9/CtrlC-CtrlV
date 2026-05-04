import React from 'react';
import './MatchOverlay.css';
import { Heart, MessageCircle, RefreshCcw, Zap } from 'lucide-react';

const MatchOverlay = ({ onClose, onOpenChat, image1, image2, squad }) => {
  return (
    <div className="match-overlay">
      <div className="match-content">
        <div className="match-header">
          <div className="happening-badge">
            <Zap size={14} fill="currentColor" /> IT'S HAPPENING!
          </div>
          <h1 className="match-title">
            It's a<br /><span className="match-highlight">SquadMatch!</span>
          </h1>
          <p className="match-subtitle">Both squads liked each other 🎉</p>
        </div>

        <div className="match-cards-container">
          <div className="match-card match-card-left" style={{ backgroundImage: `url(${image1})` }}>
            <div className="match-card-label">{squad?.squadName || 'The Beach Boys'}</div>
          </div>
          <div className="match-heart-circle">
            <Heart fill="var(--color-red)" color="var(--color-red)" size={24} />
          </div>
          <div className="match-card match-card-right" style={{ backgroundImage: `url(${image2})` }}>
            <div className="match-card-label">Your Squad</div>
          </div>
        </div>

        <div className="match-details">
          <span className="match-detail-pill">🏐 {squad?.planTitle || 'Sunset Volleyball'}</span>
          <span className="match-detail-pill">📍 {squad?.distance || '2.3 mi away'}</span>
        </div>

        <div className="match-actions">
          <button className="btn-primary" onClick={onOpenChat}>
            <MessageCircle size={20} /> Open SquadChat
          </button>
          <button className="btn-ghost" onClick={onClose}>
            <RefreshCcw size={18} /> Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchOverlay;
