import React, { useState, useEffect, useRef } from 'react';
import './CreatePlan.css';
import { MapPin, Map, Search } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useUserLocation } from '../contexts/UserLocationContext';
import LocationPickerMap from '../components/LocationPickerMap';

const CreatePlan = ({ onCreate, userProfile }) => {
  const { t } = useLanguage();
  const { requestLocation } = useUserLocation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxGroupSize, setMaxGroupSize] = useState(8);
  const [minAge, setMinAge] = useState(21);
  const [maxAge, setMaxAge] = useState(35);
  
  // Location state
  const [locationObj, setLocationObj] = useState({ address: '', lat: null, lng: null });
  const [addressInput, setAddressInput] = useState('');
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Map Modal state
  const [showMapModal, setShowMapModal] = useState(false);

  const [selectedTags, setSelectedTags] = useState([]);

  const availableTags = ['Sports ⚽', 'Drinking 🍺', 'Music 🎵', 'Outdoors 🌲', 'Chill ☕', 'Beach 🌊', 'Hiking 🥾', 'Padel 🎾', 'Gaming 🎮'];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Debounced search for Nominatim
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (addressInput.length > 2 && addressInput !== locationObj.address) {
        setIsSearching(true);
        try {
          // viewbox for Los Angeles/Santa Monica area to bias results
          const viewbox = '-118.6682,34.1206,-118.1553,33.7037';
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressInput)}&format=json&addressdetails=1&limit=5&viewbox=${viewbox}`);
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (e) {
          console.error("Nominatim search failed", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [addressInput, locationObj.address]);

  const handleSelectSuggestion = (suggestion) => {
    const parts = suggestion.display_name.split(', ');
    const simplified = parts.slice(0, 3).join(', ');
    
    setAddressInput(simplified);
    setLocationObj({
      address: simplified,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    });
    setShowSuggestions(false);
  };

  const handleMapConfirm = (loc) => {
    setAddressInput(loc.address);
    setLocationObj(loc);
    setShowMapModal(false);
  };

  const handleUseLocation = async () => {
    setAddressInput(t('searching'));
    const loc = await requestLocation();
    if (loc) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(', ');
          const simplified = parts.slice(0, 3).join(', ');
          setAddressInput(simplified);
          setLocationObj({ address: simplified, lat: loc.lat, lng: loc.lng });
        } else {
          setAddressInput(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
          setLocationObj({ address: `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`, lat: loc.lat, lng: loc.lng });
        }
      } catch (e) {
        console.error("Nominatim reverse geocode failed", e);
        setAddressInput(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
        setLocationObj({ address: `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`, lat: loc.lat, lng: loc.lng });
      }
    } else {
      setAddressInput('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    const newSquad = {
      id: `squad-${Date.now()}`,
      squadName: `${userProfile.name}'s Squad`,
      meta: `Ages ${minAge}-${maxAge} · Just created`,
      planTitle: title,
      // Save location string and coordinates
      location: locationObj.address || 'Santa Monica, CA',
      lat: locationObj.lat,
      lng: locationObj.lng,
      distance: '0.0 mi',
      membersCount: 1, 
      image: 'https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=500&q=80', 
      leaderAvatar: userProfile.photo,
      tags: selectedTags.map(t => t.split(' ')[0]), 
      description: description || 'Looking to form a squad for this plan!'
    };

    onCreate(newSquad);
    
    // Cleanup
    setTitle('');
    setDescription('');
    setMaxGroupSize(8);
    setMinAge(21);
    setMaxAge(35);
    setAddressInput('');
    setLocationObj({ address: '', lat: null, lng: null });
    setSelectedTags([]);
  };

  return (
    <div className="create-plan">
      {showMapModal && (
        <LocationPickerMap 
          initialLocation={locationObj.lat ? locationObj : null}
          onConfirm={handleMapConfirm}
          onClose={() => setShowMapModal(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-section">
          <h3 className="section-label">{t('planDetails')}</h3>
          
          <div className="input-group">
            <label>{t('activityName')}</label>
            <input 
              type="text" 
              placeholder={t('activityPlaceholder')} 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>{t('description')}</label>
            <textarea 
              placeholder={t('descPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            ></textarea>
          </div>

          <div className="input-group">
            <label>{t('location')}</label>
            <div className="location-input-wrapper">
              <div className="location-input-container">
                <Search size={14} className="search-icon" color="var(--color-gray-400)" />
                <input 
                  type="text" 
                  placeholder={t('locPlaceholder')} 
                  value={addressInput}
                  onChange={(e) => {
                    setAddressInput(e.target.value);
                    if (locationObj.address !== e.target.value) {
                      setLocationObj({ address: '', lat: null, lng: null }); // Clear exact coords if they type manually
                    }
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  style={{ paddingLeft: '32px', paddingRight: '120px' }}
                />
                
                <div className="location-actions">
                  <button type="button" className="use-mine-btn" onClick={handleUseLocation}>
                    <MapPin size={12} style={{marginRight: '4px'}}/> {t('useMine')}
                  </button>
                  <button type="button" className="open-map-btn" onClick={() => setShowMapModal(true)}>
                    <Map size={16} color="white" />
                  </button>
                </div>
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && (
                <ul className="suggestions-dropdown">
                  {isSearching ? (
                    <li className="suggestion-item searching">{t('searching')}</li>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((s, idx) => (
                      <li key={idx} className="suggestion-item" onClick={() => handleSelectSuggestion(s)}>
                        <MapPin size={14} color="var(--color-gray-400)" />
                        <span>{s.display_name.split(', ').slice(0,3).join(', ')}</span>
                      </li>
                    ))
                  ) : addressInput.length > 2 ? (
                    <li className="suggestion-item no-results">{t('noResults')}</li>
                  ) : null}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-label">{t('configuration')}</h3>
          
          <div className="input-group">
            <div className="slider-header">
              <label>{t('maxGroupSize')}</label>
              <span className="slider-value">{maxGroupSize}</span>
            </div>
            <input 
              type="range" 
              min="2" 
              max="20" 
              value={maxGroupSize}
              onChange={(e) => setMaxGroupSize(e.target.value)}
              className="range-slider"
            />
          </div>

          <div className="input-group">
            <div className="slider-header">
              <label>{t('targetAgeRange')}</label>
              <span className="slider-value" style={{color: 'var(--color-amber)'}}>{minAge}-{maxAge}</span>
            </div>
            <div className="age-range-inputs">
              <div className="age-input-box">
                <span>{t('min')}</span>
                <input type="number" value={minAge} onChange={(e)=>setMinAge(e.target.value)} min="18" max="100"/>
              </div>
              <span style={{color: 'var(--color-gray-400)'}}>{t('to')}</span>
              <div className="age-input-box">
                <span>{t('max')}</span>
                <input type="number" value={maxAge} onChange={(e)=>setMaxAge(e.target.value)} min="18" max="100"/>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>{t('activityTags', { count: selectedTags.length })}</label>
            <div className="tags-selector">
              {availableTags.map(tag => (
                <button 
                  key={tag} 
                  type="button"
                  className={`tag-select-btn ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {t(tag)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-plan-btn" disabled={!title || !locationObj.lat}>
            {t('postSquadPlan')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlan;
