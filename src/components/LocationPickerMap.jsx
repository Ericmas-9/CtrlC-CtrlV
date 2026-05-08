import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { X, MapPin } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import './LocationPickerMap.css';

const DEFAULT_CENTER = [34.0195, -118.4912]; // Santa Monica
const MAP_ZOOM = 13;

const LocationPickerMap = ({ initialLocation, onConfirm, onClose }) => {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  
  const [currentAddress, setCurrentAddress] = useState(initialLocation?.address || '');
  const [currentCoords, setCurrentCoords] = useState(
    initialLocation?.lat && initialLocation?.lng 
      ? { lat: initialLocation.lat, lng: initialLocation.lng } 
      : { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] }
  );
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  const fetchAddress = async (lat, lng) => {
    setIsFetchingAddress(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        // simplify address slightly
        const parts = data.display_name.split(', ');
        const simplified = parts.slice(0, 3).join(', ');
        setCurrentAddress(simplified);
      } else {
        setCurrentAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (e) {
      setCurrentAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setIsFetchingAddress(false);
    }
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [currentCoords.lat, currentCoords.lng],
      zoom: MAP_ZOOM,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);
    mapRef.current = map;

    const icon = L.divIcon({
      className: '',
      html: `<div class="location-picker-pin"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const marker = L.marker([currentCoords.lat, currentCoords.lng], { 
      icon, 
      draggable: true 
    }).addTo(map);

    markerRef.current = marker;

    // Handle map click
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setCurrentCoords({ lat, lng });
      fetchAddress(lat, lng);
    });

    // Handle marker drag
    marker.on('dragend', (e) => {
      const { lat, lng } = marker.getLatLng();
      setCurrentCoords({ lat, lng });
      fetchAddress(lat, lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // Run once

  const handleConfirm = () => {
    onConfirm({
      address: currentAddress,
      lat: currentCoords.lat,
      lng: currentCoords.lng
    });
  };

  return (
    <div className="location-picker-overlay">
      <div className="location-picker-modal">
        <div className="location-picker-header">
          <h3>{t('location')}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="location-picker-map-container" ref={containerRef}></div>
        
        <div className="location-picker-footer">
          <div className="selected-address-box">
            <MapPin size={18} color="var(--color-turquoise)" />
            <span className="address-text">
              {isFetchingAddress ? t('searching') : (currentAddress || t('searchLocation'))}
            </span>
          </div>
          <button 
            className="btn-primary confirm-location-btn" 
            onClick={handleConfirm}
            disabled={!currentAddress || isFetchingAddress}
          >
            {t('confirmLocation')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerMap;
