import React, { useState } from 'react';
import './SquadFeed.css';
import { X, Heart, Info, Star, Users, MapPin, Calendar, RefreshCw } from 'lucide-react';

const SquadFeed = ({ squads, onLike, onInfo }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);

  // If we run out of squads
  if (currentIndex >= squads.length) {
    return (
      <div className="squad-feed empty-feed">
        <div className="empty-state-content">
          <Heart size={56} color="var(--color-gray-300)" style={{ marginBottom: '24px' }} />
          <h3>You're all caught up!</h3>
          <p>You've seen all the squads near Santa Monica.</p>
          <button className="btn-primary" onClick={() => setCurrentIndex(0)} style={{ marginTop: '32px', width: 'auto', padding: '16px 32px' }}>
            <RefreshCw size={18} /> Shuffle & Restart
          </button>
        </div>
      </div>
    );
  }

  const currentSquad = squads[currentIndex];

  const handlePass = () => {
    setSwipeDirection('left');
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300); // Wait for animation to finish
  };

  const handleLike = () => {
    onLike(currentSquad);
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="squad-feed">
      <div className="feed-header">
        <p>{squads.length - currentIndex} squads near <strong>Santa Monica</strong></p>
      </div>

      <div className="card-stack">
        <div className={`squad-card ${swipeDirection === 'left' ? 'swipe-out-left' : ''}`}>
          <div className="card-image-section" style={{ backgroundImage: `url(${currentSquad.image})` }}>
            <div className="card-badges">
              <span className="badge"><Users size={14} /> {currentSquad.membersCount} members</span>
              <span className="badge"><MapPin size={14} /> {currentSquad.distance}</span>
            </div>
            
            <div className="card-image-content">
              <div className="squad-info-main">
                <h2 className="squad-name">{currentSquad.squadName}</h2>
                <p className="squad-meta">{currentSquad.meta}</p>
              </div>
              <div className="leader-avatar">
                <img src={currentSquad.leaderAvatar} alt="Leader" />
                <div className="star-badge"><Star size={10} fill="white" color="var(--color-amber)" /></div>
              </div>
            </div>
          </div>

          <div className="card-details-section">
            <h3 className="plan-title"><Calendar size={16} /> {currentSquad.planTitle}</h3>
            <p className="plan-location"><MapPin size={14} /> {currentSquad.location}</p>
            
            <div className="tags-container">
              {currentSquad.tags.map(tag => (
                <span key={tag} className="tag tag-turquoise">{tag}</span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Visual stack effect behind main card */}
        {currentIndex + 1 < squads.length && <div className="card-shadow-1"></div>}
        {currentIndex + 2 < squads.length && <div className="card-shadow-2"></div>}
      </div>

      <div className="action-buttons">
        <button className="action-btn btn-pass" onClick={handlePass}><X size={32} color="var(--color-red)" /></button>
        <button className="action-btn btn-info" onClick={() => onInfo(currentSquad)}><Info size={24} color="var(--color-amber)" /></button>
        <button className="action-btn btn-like" onClick={handleLike}><Heart size={36} fill="white" color="white" /></button>
        <button className="action-btn btn-star"><Star size={24} color="#a855f7" /></button>
      </div>
    </div>
  );
};

export default SquadFeed;
