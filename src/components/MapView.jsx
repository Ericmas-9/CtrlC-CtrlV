// ── leaflet CSS must be first ──
import 'leaflet/dist/leaflet.css';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
import { useUserLocation } from '../contexts/UserLocationContext';
import './MapView.css';

// ── Fix Leaflet icon URLs broken by Vite's asset hashing ──
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});



const MAP_CENTER = [34.0195, -118.4912];
const MAP_ZOOM   = 12;

/**
 * MapView — Pure Leaflet map (no react-leaflet).
 * Using useRef + useEffect to initialize Leaflet directly on a DOM node
 * avoids any React Context conflict entirely.
 *
 * Props:
 *   squads        — array of squad objects from App.jsx
 *   onViewDetails — callback(squad) that opens PlanDetailsModal
 *   labels        — pre-translated strings from SquadFeed (members, viewDetails, squadTitles)
 */
const MapView = ({ squads, onViewDetails, labels }) => {
  const containerRef  = useRef(null);  // DOM node for the map
  const mapRef        = useRef(null);  // Leaflet map instance
  const markersRef    = useRef([]);    // Track markers for cleanup
  const userMarkerRef = useRef(null);  // Track user location marker

  const { userLocation, locationStatus, requestLocation } = useUserLocation();
  const [toastMessage, setToastMessage] = useState('');

  // Keep onViewDetails in a ref so marker click closures always call the latest version
  const onViewDetailsRef = useRef(onViewDetails);
  useEffect(() => { onViewDetailsRef.current = onViewDetails; }, [onViewDetails]);

  // ── Init map once ──
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Cleanup on unmount
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // ← empty: runs once only

  // ── Sync markers whenever squads or labels change ──
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    squads.forEach((squad) => {
      const position = (squad.lat && squad.lng) ? [squad.lat, squad.lng] : null;
      if (!position) return;

      const title = squad.titleKey
        ? (labels.squadTitles?.[squad.titleKey] || squad.planTitle || '')
        : (squad.planTitle || '');

      // Custom turquoise DivIcon — no asset URLs needed
      const icon = L.divIcon({
        className: '',
        html: `<div class="map-squad-pin"></div>`,
        iconSize:   [28, 28],
        iconAnchor: [14, 14],
        popupAnchor:[0, -18],
      });

      const marker = L.marker(position, { icon }).addTo(mapRef.current);

      // Build popup DOM so we can attach a real click handler
      const popup = L.popup({ className: 'squad-popup', maxWidth: 240 });
      const el    = document.createElement('div');
      el.className = 'popup-inner';
      el.innerHTML = `
        <img src="${squad.leaderAvatar}" alt="${squad.squadName}" class="popup-avatar" />
        <div class="popup-body">
          <p class="popup-squad-name">${squad.squadName}</p>
          <p class="popup-plan-title">${title}</p>
          <p class="popup-meta">👥 ${squad.membersCount} ${labels.members} &nbsp;·&nbsp; 📍 ${squad.location}</p>
          <button class="popup-details-btn" data-squad-id="${squad.id}">${labels.viewDetails}</button>
        </div>
      `;

      // Attach click handler to the button inside popup
      el.querySelector('.popup-details-btn').addEventListener('click', () => {
        onViewDetailsRef.current(squad);
      });

      popup.setContent(el);
      marker.bindPopup(popup);
      markersRef.current.push(marker);
    });
  }, [squads, labels]); // ← re-runs when language changes or new squads added

  // ── Handle User Location Dot ──
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const blueDotIcon = L.divIcon({
      className: '',
      html: `<div class="user-location-dot"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: blueDotIcon, zIndexOffset: 1000 }).addTo(mapRef.current);
  }, [userLocation]);

  const handleLocateMe = async () => {
    const loc = await requestLocation();
    if (loc && mapRef.current) {
      mapRef.current.flyTo([loc.lat, loc.lng], 14, { animate: true, duration: 1 });
      if (loc.lat === 41.3851) { // Fallback coordinates
        setToastMessage(labels.locUnavailableFallback || 'Location unavailable. Using default location (Barcelona)');
        setTimeout(() => setToastMessage(''), 3000);
      }
    }
  };

  return (
    <div className="map-view-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '480px' }}
      />
      <button 
        className={`locate-me-btn ${locationStatus === 'loading' ? 'loading' : ''}`}
        onClick={handleLocateMe}
        disabled={locationStatus === 'loading'}
        title={labels.locateMe}
      >
        <Navigation size={20} className={locationStatus === 'loading' ? 'spinning' : ''} />
      </button>
      {toastMessage && (
        <div className="map-toast">{toastMessage}</div>
      )}
    </div>
  );
};

export default MapView;
