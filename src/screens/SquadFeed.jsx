import React, { useState } from 'react';
import './SquadFeed.css';
import { X, Heart, Info, Users, MapPin, Calendar, RefreshCw, List, Map, Zap } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useUserLocation } from '../contexts/UserLocationContext';
import { getDistance } from '../utils/distance';
import MapView from '../components/MapView';
import { useSwipeLimit } from '../hooks/useSwipeLimit';
import SwipeLimitModal from '../components/SwipeLimitModal';

const computeCompatibility = (planTags, likedTags) => {
  if (!planTags?.length || !likedTags?.size) return null;
  const matched = planTags.filter(tag => likedTags.has(tag)).length;
  return Math.round((matched / planTags.length) * 100);
};

const SquadFeed = ({ squads, onLike, onPass, onInfo, usersInCity = 0, userCity = '', onReload, likedTags = new Set() }) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { userLocation } = useUserLocation();
  const { swipesRemaining, canSwipe, isUnlocked, registerSwipe, unlockWithCode } = useSwipeLimit();

  const handlePass = () => {
    if (!canSwipe) { setShowLimitModal(true); return; }
    registerSwipe();
    onPass?.(squads[currentIndex]);
    setSwipeDirection('left');
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const handleLike = () => {
    if (!canSwipe) { setShowLimitModal(true); return; }
    registerSwipe();
    onLike(squads[currentIndex]);
    setCurrentIndex(prev => prev + 1);
  };

  const handleUnlock = (code) => {
    const result = unlockWithCode(code);
    if (result === 'ok') setShowLimitModal(false);
    return result;
  };

  // SwipeCounter chip shown in the feed header
  const SwipeCounter = () => {
    if (isUnlocked) return (
      <span className="swipe-counter-chip chip-unlimited">✨ {t('swipeUnlimited')}</span>
    );
    const warning = swipesRemaining <= 3;
    return (
      <span className={`swipe-counter-chip ${warning ? 'chip-warning' : ''}`}>
        {t('swipesLeft', { count: swipesRemaining })}
      </span>
    );
  };

  // ── Shared view toggle pill ──
  const ViewToggle = () => (
    <div className="view-toggle-pill">
      <button
        className={`toggle-btn ${viewMode === 'list' ? 'toggle-active' : ''}`}
        onClick={() => setViewMode('list')}
      >
        <List size={15} /> {t('listView')}
      </button>
      <button
        className={`toggle-btn ${viewMode === 'map' ? 'toggle-active' : ''}`}
        onClick={() => setViewMode('map')}
      >
        <Map size={15} /> {t('mapView')}
      </button>
      {onReload && (
        <button
          className="toggle-btn"
          onClick={async () => { await onReload?.(); setCurrentIndex(0); }}
          style={{ gap: '4px' }}
        >
          <RefreshCw size={14} /> {t('reloadPlans')}
        </button>
      )}
    </div>
  );

  // ── MAP VIEW ──
  if (viewMode === 'map') {
    return (
      <div key="map-view" className="squad-feed fade-in" style={{ padding: 0 }}>
        <div className="feed-header" style={{ padding: '12px 16px' }}>
          <p>{usersInCity} {usersInCity === 1 ? t('userSingular') : t('userPlural')} a <strong>{userCity}</strong></p>
          <ViewToggle />
        </div>
        <div style={{ width: '100%', height: '480px' }}>
          <MapView
            squads={squads}
            onViewDetails={onInfo}
            labels={{
              members: t('members'),
              viewDetails: t('viewDetails'),
              // Pre-resolve all squad title keys so MapView never needs t()
              squadTitles: Object.fromEntries(
                squads
                  .filter(s => s.titleKey)
                  .map(s => [s.titleKey, t(s.titleKey)])
              ),
            }}
          />
        </div>
      </div>
    );
  }

  // ── LIST / SWIPE VIEW ──
  if (currentIndex >= squads.length) {
    return (
      <div key="empty-view" className="squad-feed empty-feed fade-in">
        <div className="feed-header">
          <p>{usersInCity} {usersInCity === 1 ? t('userSingular') : t('userPlural')} a <strong>{userCity}</strong></p>
          <ViewToggle />
        </div>
        <div className="empty-state-content">
          <Heart size={56} color="var(--color-gray-300)" style={{ marginBottom: '24px' }} />
          <h3>{t('youAreCaughtUp')}</h3>
          <p>{t('seenAllSquads')}</p>
          <button
            className="btn-primary"
            onClick={async () => {
              // Real reload: re-fetch from Supabase, then restart the card stack
              await onReload?.();
              setCurrentIndex(0);
            }}
            style={{ marginTop: '32px', width: 'auto', padding: '16px 32px' }}
          >
            <RefreshCw size={18} /> {t('shuffleRestart')}
          </button>
        </div>
      </div>
    );
  }

  const currentSquad = squads[currentIndex];
  const compatibility = computeCompatibility(currentSquad.tags, likedTags);
  const compatLevel = compatibility === null ? null
    : compatibility >= 70 ? 'high'
    : compatibility >= 40 ? 'mid'
    : 'low';

  let displayDistance = currentSquad.distanceValue || '0';
  let distanceUnit = t('miles');

  if (userLocation && currentSquad.lat && currentSquad.lng) {
    const distKm = getDistance(userLocation.lat, userLocation.lng, currentSquad.lat, currentSquad.lng);
    displayDistance = distKm.toFixed(1);
    distanceUnit = 'km';
  }

  return (
    <div key="list-view" className="squad-feed fade-in">
      <div className="feed-header">
        <p>{usersInCity} {usersInCity === 1 ? t('userSingular') : t('userPlural')} a <strong>{userCity}</strong></p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SwipeCounter />
          <ViewToggle />
        </div>
      </div>

      <div className="card-stack">
        <div className={`squad-card ${swipeDirection === 'left' ? 'swipe-out-left' : ''}`}>
          <div className="card-image-section" style={{ backgroundImage: `url(${currentSquad.image})` }}>
            <div className="card-badges">
              <span className="badge"><Users size={14} /> {currentSquad.membersCount} {t('members')}</span>
              <span className="badge"><MapPin size={14} /> {displayDistance} {distanceUnit}</span>
            </div>
            <div className="card-image-content">
              <div className="squad-info-main">
                <h2 className="squad-name">{currentSquad.squadName}</h2>
                <p className="squad-meta">{currentSquad.metaKey ? t(currentSquad.metaKey) : currentSquad.meta}</p>
              </div>
              <div className="leader-avatar">
                <img src={currentSquad.leaderAvatar} alt="Leader" />
              </div>
            </div>
          </div>

          <div className="card-details-section">
            {compatLevel && (
              <div className={`compat-banner compat-${compatLevel}`}>
                <Zap size={13} />
                <span>{compatibility}% compatible</span>
              </div>
            )}
            <h3 className="plan-title">
              <Calendar size={16} />
              {currentSquad.titleKey ? t(currentSquad.titleKey) : currentSquad.planTitle}
            </h3>
            {currentSquad.eventDate && (
              <p className="plan-date">
                📅 {new Date(currentSquad.eventDate).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            <p className="plan-location"><MapPin size={14} /> {currentSquad.location}</p>
            <div className="tags-container" style={{ marginTop: '8px' }}>
              {currentSquad.tags.map(tag => (
                <span key={tag} className="tag tag-turquoise">{t(tag)}</span>
              ))}
            </div>
          </div>
        </div>

        {currentIndex + 1 < squads.length && <div className="card-shadow-1"></div>}
        {currentIndex + 2 < squads.length && <div className="card-shadow-2"></div>}
      </div>

      <div className="action-buttons">
        <button className="action-btn btn-pass" onClick={handlePass}><X size={32} color="var(--color-red)" /></button>
        <button className="action-btn btn-info" onClick={() => onInfo(currentSquad)}><Info size={24} color="var(--color-amber)" /></button>
        <button className="action-btn btn-like" onClick={handleLike}><Heart size={36} fill="white" color="white" /></button>
      </div>

      {showLimitModal && (
        <SwipeLimitModal
          onClose={() => setShowLimitModal(false)}
          onUnlock={handleUnlock}
        />
      )}
    </div>
  );
};

export default SquadFeed;
