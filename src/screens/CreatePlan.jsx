import React, { useState, useEffect, useRef } from 'react';
import './CreatePlan.css';
import { MapPin, Map, Search, ImagePlus, Loader, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useUserLocation } from '../contexts/UserLocationContext';
import LocationPickerMap from '../components/LocationPickerMap';
import { supabase } from '../utils/supabaseClient';

const BUCKET = 'squad-images';
const DEFAULT_PLAN_IMAGE =
  'https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=500&q=80';

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
  const [customTags, setCustomTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [customTagError, setCustomTagError] = useState('');
  const [eventDate, setEventDate] = useState('');

  // ── Plan Image Upload state ──────────────────────────────────────────────────
  const [planImageFile, setPlanImageFile] = useState(null);      // raw File object
  const [planImagePreview, setPlanImagePreview] = useState(null); // local blob URL for preview
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const planImageInputRef = useRef(null);

  const availableTags = ['Sports ⚽', 'Drinking 🍺', 'Music 🎵', 'Outdoors 🌲', 'Chill ☕', 'Beach 🌊', 'Hiking 🥾', 'Padel 🎾', 'Gaming 🎮', 'Food 🍕', 'Dancing 💃', 'Art 🎨', 'Fitness 💪', 'Cinema 🎬', 'Cycling 🚴'];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (trimmed.length > 20) { setCustomTagError(t('customTagMaxLength')); return; }
    if (customTags.length >= 5) { setCustomTagError(t('customTagMaxCount')); return; }
    const allTags = [...availableTags.map(t => t.split(' ')[0].toLowerCase()), ...customTags.map(t => t.toLowerCase())];
    if (allTags.includes(trimmed.toLowerCase())) { setCustomTagError(t('customTagDuplicate')); return; }
    setCustomTags(prev => [...prev, trimmed]);
    setCustomTagInput('');
    setCustomTagError('');
  };

  const handleRemoveCustomTag = (tag) => {
    setCustomTags(prev => prev.filter(t => t !== tag));
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
          console.error('Nominatim search failed', e);
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
        console.error('Nominatim reverse geocode failed', e);
        setAddressInput(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
        setLocationObj({ address: `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`, lat: loc.lat, lng: loc.lng });
      }
    } else {
      setAddressInput('');
    }
  };

  // ── Plan image picker ────────────────────────────────────────────────────────
  const handlePlanImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPlanImageFile(file);
    // Create a local blob URL for immediate preview
    setPlanImagePreview(URL.createObjectURL(file));
    // Reset input so re-selecting same file works
    if (planImageInputRef.current) planImageInputRef.current.value = '';
  };

  const clearPlanImage = () => {
    setPlanImageFile(null);
    if (planImagePreview) URL.revokeObjectURL(planImagePreview);
    setPlanImagePreview(null);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || isSubmitting) return;

    // Validate creator age against plan range
    const creatorAge = parseInt(userProfile.age);
    if (creatorAge && (creatorAge < parseInt(minAge) || creatorAge > parseInt(maxAge))) {
      setFormError(t('ageValidationError', { age: creatorAge, min: minAge, max: maxAge }));
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      // Upload plan image if one was chosen
      let finalImageUrl = DEFAULT_PLAN_IMAGE;
      if (planImageFile) {
        setIsUploadingImage(true);
        try {
          const ext = planImageFile.name.split('.').pop();
          const fileName = `plans/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(fileName, planImageFile, { upsert: false });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(fileName);

          finalImageUrl = urlData.publicUrl;
        } catch (err) {
          console.error('Plan image upload failed:', err);
          setFormError(t('imageUploadFailed'));
          finalImageUrl = DEFAULT_PLAN_IMAGE;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const newSquad = {
        id: `squad-${Date.now()}`,
        squadName: `${userProfile.name}'s Squad`,
        meta: `Ages ${minAge}-${maxAge} · Just created`,
        planTitle: title,
        location: locationObj.address || 'Santa Monica, CA',
        lat: locationObj.lat,
        lng: locationObj.lng,
        minAge: parseInt(minAge),
        maxAge: parseInt(maxAge),
        maxGroupSize: parseInt(maxGroupSize),
        distance: '0.0 mi',
        membersCount: 1,
        image: finalImageUrl,
        leaderAvatar: userProfile.photo,
        tags: [...selectedTags.map(tag => tag.split(' ')[0]), ...customTags],
        description: description || 'Looking to form a squad for this plan!',
        eventDate: eventDate || null
      };

      await onCreate(newSquad);

      // Cleanup form
      setTitle('');
      setDescription('');
      setMaxGroupSize(8);
      setMinAge(21);
      setMaxAge(35);
      setAddressInput('');
      setLocationObj({ address: '', lat: null, lng: null });
      setSelectedTags([]);
      setCustomTags([]);
      setCustomTagInput('');
      setCustomTagError('');
      setEventDate('');
      clearPlanImage();
      setFormError(null);
    } catch (err) {
      console.error('Error creating plan:', err);
      setFormError(err.message || t('errorCreatingPlan'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isUploadingImage || isSubmitting;

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
            <label>{t('eventDate')}</label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              style={{ fontSize: '15px', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', width: '100%', fontFamily: 'inherit' }}
            />
          </div>

          {/* ── Plan Image Uploader ── */}
          <div className="input-group">
            <label>{t('planImageLabel')}</label>
            <input
              ref={planImageInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePlanImageChange}
              id="plan-image-input"
            />

            {planImagePreview ? (
              <div className="plan-image-preview-container">
                <img
                  src={planImagePreview}
                  alt="Plan preview"
                  className="plan-image-preview"
                />
                <button
                  type="button"
                  className="plan-image-remove-btn"
                  onClick={clearPlanImage}
                  title="Remove image"
                >
                  <X size={14} />
                </button>
                <label htmlFor="plan-image-input" className="plan-image-change-btn">
                  {t('changePlanImage')}
                </label>
              </div>
            ) : (
              <label htmlFor="plan-image-input" className="plan-image-upload-btn">
                <ImagePlus size={20} />
                <span>{t('uploadPlanPhoto')}</span>
                <span className="plan-image-hint">{t('photoOptionalHint')}</span>
              </label>
            )}
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
                      setLocationObj({ address: '', lat: null, lng: null });
                    }
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  style={{ paddingLeft: '32px', paddingRight: '120px' }}
                />

                <div className="location-actions">
                  <button type="button" className="use-mine-btn" onClick={handleUseLocation}>
                    <MapPin size={12} style={{ marginRight: '4px' }} /> {t('useMine')}
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
                        <span>{s.display_name.split(', ').slice(0, 3).join(', ')}</span>
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
              <span className="slider-value" style={{ color: 'var(--color-amber)' }}>{minAge}-{maxAge}</span>
            </div>
            <div className="age-range-inputs">
              <div className="age-input-box">
                <span>{t('min')}</span>
                <input type="number" value={minAge} onChange={(e) => { setMinAge(e.target.value); setFormError(null); }} min="18" max="100" />
              </div>
              <span style={{ color: 'var(--color-gray-400)' }}>{t('to')}</span>
              <div className="age-input-box">
                <span>{t('max')}</span>
                <input type="number" value={maxAge} onChange={(e) => { setMaxAge(e.target.value); setFormError(null); }} min="18" max="100" />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>{t('activityTags', { count: selectedTags.length + customTags.length })}</label>
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
              {customTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className="tag-select-btn tag-custom selected"
                  onClick={() => handleRemoveCustomTag(tag)}
                >
                  {tag} <X size={12} style={{ marginLeft: 4 }} />
                </button>
              ))}
            </div>

            <div className="custom-tag-row">
              <input
                type="text"
                className="custom-tag-input"
                placeholder={t('customTagPlaceholder')}
                value={customTagInput}
                maxLength={20}
                onChange={e => { setCustomTagInput(e.target.value); setCustomTagError(''); }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTag(); } }}
              />
              <button
                type="button"
                className="custom-tag-add-btn"
                onClick={handleAddCustomTag}
                disabled={!customTagInput.trim()}
              >
                +
              </button>
            </div>
            {customTagError && <p className="custom-tag-error">{customTagError}</p>}
          </div>
        </div>

        <div className="form-actions">
          {formError && (
            <p className="form-error-msg">{formError}</p>
          )}
          <button
            type="submit"
            className="submit-plan-btn"
            disabled={!title || !locationObj.lat || isLoading}
          >
            {isLoading ? (
              <span className="submit-loading">
                <Loader size={18} className="btn-spinner" />
                {isUploadingImage ? t('uploadingImage') : t('publishing')}
              </span>
            ) : (
              t('postSquadPlan')
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlan;
