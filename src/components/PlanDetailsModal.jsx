import React, { useEffect, useRef } from 'react';
import { X, Calendar, MapPin, Users, HeartHandshake } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useUserLocation } from '../contexts/UserLocationContext';
import { getDistance } from '../utils/distance';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PlanDetailsModal.css';

// Removed SQUAD_COORDS from here since it's now inside squad data
const PlanDetailsModal = ({ squad, onClose, onJoin }) => {
  const { t } = useLanguage();
  const { userLocation } = useUserLocation();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const position = (squad.lat && squad.lng) ? [squad.lat, squad.lng] : null;

  let distanceText = null;
  if (userLocation && position) {
    const dist = getDistance(userLocation.lat, userLocation.lng, position[0], position[1]);
    distanceText = t('distanceAway', { dist: dist.toFixed(1) });
  }

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !position) return;

    const map = L.map(mapContainerRef.current, {
      center: position,
      zoom: 14,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false, // make it static for the modal
      touchZoom: false,
      doubleClickZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      className: '',
      html: `<div class="map-squad-pin" style="transform: scale(0.8);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    L.marker(position, { icon }).addTo(map);

    mapRef.current = map;

    // VERY IMPORTANT: wait for the modal animation to finish, then invalidate size
    // so Leaflet correctly calculates dimensions and doesn't render grey tiles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 350); // Modal slideUp animation takes 300ms

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, [squad, position]);

  return (
    <div className="plan-details-overlay">
      <div className="plan-details-card">
        <button className="close-modal-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-header-img" style={{ backgroundImage: `url(${squad.image})` }}>
          <div className="modal-header-gradient"></div>
        </div>

        <div className="modal-content">
          <div className="modal-squad-info">
            <img src={squad.leaderAvatar} alt="Leader" className="modal-leader-avatar" />
            <div>
              <h2 className="modal-squad-name">{squad.squadName}</h2>
              <p className="modal-squad-meta">{squad.metaKey ? t(squad.metaKey) : squad.meta}</p>
            </div>
          </div>

          {/* Plan title and description: shown as-is (original language) */}
          <h3 className="modal-plan-title">
            {squad.titleKey ? t(squad.titleKey) : squad.planTitle}
          </h3>

          <div className="modal-badges">
            <span className="badge"><Calendar size={14} /> {t('today')}</span>
            <span className="badge"><MapPin size={14} /> {squad.location}</span>
            {distanceText && <span className="badge"><MapPin size={14} /> {distanceText}</span>}
            <span className="badge"><Users size={14} /> {squad.membersCount} {t('going')}</span>
          </div>

          {position && (
            <div className="modal-map-container" ref={mapContainerRef}></div>
          )}

          <div className="modal-description">
            <h4>{t('aboutThisPlan')}</h4>
            <p>{squad.descKey ? t(squad.descKey) : squad.description}</p>
          </div>

          <div className="modal-tags">
            {squad.tags.map(tag => (
              <span key={tag} className="tag tag-turquoise">{t(tag)}</span>
            ))}
          </div>

          <div className="modal-actions" style={{ marginTop: '24px' }}>
            <button
              className="btn-primary"
              onClick={onJoin}
              style={{ width: '100%', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              <HeartHandshake size={20} />
              {t('joinSquad')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailsModal;
