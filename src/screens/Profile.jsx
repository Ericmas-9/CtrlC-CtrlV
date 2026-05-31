import React, { useState, useRef } from 'react';
import { Camera, User as UserIcon, Loader, MapPin, Navigation } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase } from '../utils/supabaseClient';
import { useUserLocation } from '../contexts/UserLocationContext';
import './Profile.css';

const BUCKET = 'squad-images';


const Profile = ({ userProfile, setUserProfile, planHistory = [] }) => {
  const { t } = useLanguage();
  const { requestLocation } = useUserLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [isDetectingCity, setIsDetectingCity] = useState(false);
  const [editForm, setEditForm] = useState({
    ...userProfile,
    bio: userProfile.bio || ''
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const fileInputRef = useRef(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  // ── Detecta la ciutat per GPS ────────────────────────────────────────────────
  const handleDetectCity = async () => {
    setIsDetectingCity(true);
    try {
      const loc = await requestLocation();
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}`
      );
      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county || '';
      if (city) setEditForm(prev => ({ ...prev, city }));
    } catch (e) {
      console.warn('GPS city detect failed', e);
    } finally {
      setIsDetectingCity(false);
    }
  };

  // ── Avatar Upload ────────────────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile.id) return;

    setIsUploadingAvatar(true);
    try {
      // Unique filename to avoid overwriting
      const ext = file.name.split('.').pop();
      const fileName = `avatars/${userProfile.id}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Persist to DB
      const { error: dbError } = await supabase
        .from('perfiles_usuario')
        .update({ photo_url: publicUrl })
        .eq('id', userProfile.id);

      if (dbError) throw dbError;

      // Update local state immediately
      setUserProfile(prev => ({ ...prev, photo: publicUrl }));
      setEditForm(prev => ({ ...prev, photo: publicUrl }));
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setAvatarError(t('avatarUploadFailed'));
    } finally {
      setIsUploadingAvatar(false);
      // Reset input so re-selecting the same file triggers onChange again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Profile text save ────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    // Optimistic UI update
    setUserProfile({ ...editForm });
    setIsEditing(false);

    if (userProfile.id) {
      const { error } = await supabase
        .from('perfiles_usuario')
        .update({
          full_name: editForm.name,
          age: editForm.age,
          city: editForm.city,
          bio: editForm.bio,
        })
        .eq('id', userProfile.id);

      if (error) {
        console.error('Error updating profile:', error);
        setSaveError(t('profileUpdateFailed'));
      }
    }
    setIsSaving(false);
  };

  // ── Avatar widget (shared between view & edit mode) ──────────────────────────
  const AvatarWidget = () => (
    <div className="profile-avatar-container">
      {isUploadingAvatar ? (
        <div className="profile-avatar-uploading">
          <Loader size={32} className="avatar-spinner" />
        </div>
      ) : editForm.photo || userProfile.photo ? (
        <img
          src={editForm.photo || userProfile.photo}
          alt={userProfile.name}
          className="profile-avatar-large"
        />
      ) : (
        <div className="profile-avatar-placeholder">
          <UserIcon size={48} color="#94a3b8" />
        </div>
      )}

      {/* Hidden real file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarChange}
        id="avatar-file-input"
      />

      <label
        htmlFor="avatar-file-input"
        className={`camera-btn ${isUploadingAvatar ? 'camera-btn--disabled' : ''}`}
      >
        <Camera size={16} color="white" />
      </label>
      {avatarError && <p className="form-error-msg" style={{ marginTop: '8px', textAlign: 'center' }}>{avatarError}</p>}
    </div>
  );

  // ── Edit view ────────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="profile-screen">
        <div className="profile-edit-header">
          <button onClick={() => setIsEditing(false)} className="cancel-btn">{t('cancel')}</button>
          <h3>{t('editProfile')}</h3>
          <button onClick={handleSave} className="save-btn" disabled={isSaving}>
            {isSaving ? <Loader size={14} className="btn-spinner" /> : t('save')}
          </button>
        </div>

        {saveError && <p className="form-error-msg" style={{ margin: '8px 16px 0' }}>{saveError}</p>}

        {/* Avatar uploader inside edit mode too */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '8px' }}>
          <AvatarWidget />
        </div>

        <div className="profile-form">
          <div className="input-group">
            <label>{t('nameLabel')}</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label>{t('ageLabel')}</label>
            <input
              type="number"
              value={editForm.age}
              onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) || '' })}
            />
          </div>
          <div className="input-group">
            <label>{t('locationLabel')}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={editForm.city || ''}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="gps-city-btn"
                onClick={handleDetectCity}
                disabled={isDetectingCity}
                title={t('locateMe')}
              >
                {isDetectingCity ? <Loader size={15} className="btn-spinner" /> : <Navigation size={15} />}
              </button>
            </div>
          </div>
          <div className="input-group">
            <label>{t('bioLabel')}</label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>
    );
  }

  // ── View mode ────────────────────────────────────────────────────────────────
  return (
    <div className="profile-screen">
      <div className="profile-header-card">
        <AvatarWidget />

        <div className="profile-stats">
          <div className="stat-item">
            <h4>{userProfile.plansHosted ?? 0}</h4>
            <p>{t('plansHosted')}</p>
          </div>
          <div className="stat-item">
            <h4>{userProfile.plansJoined ?? 0}</h4>
            <p>{t('plansJoined')}</p>
          </div>
        </div>
      </div>

      <div className="profile-details-card">
        <div className="card-header-row">
          <h3 className="section-label">{t('identity')}</h3>
          <button className="edit-btn-ghost" onClick={() => setIsEditing(true)}>{t('editProfile')}</button>
        </div>

        <div className="detail-row">
          <p className="detail-label">{t('nameLabel')}</p>
          <p className="detail-value">{userProfile.name}</p>
        </div>

        <div className="detail-row-split">
          <div className="detail-col">
            <p className="detail-label">{t('ageLabel')}</p>
            <p className="detail-value">{userProfile.age}</p>
          </div>
          <div className="detail-col">
            <p className="detail-label">{t('locationLabel')}</p>
            <p className="detail-value">{userProfile.city}</p>
          </div>
        </div>

        <div className="detail-row">
          <p className="detail-label">{t('bioLabel')}</p>
          <p className="detail-value-text">{userProfile.bio}</p>
        </div>
      </div>

      <div className="profile-history-card">
        <h3 className="section-label" style={{ marginBottom: '16px' }}>{t('recentActivity')}</h3>
        {planHistory.length === 0 ? (
          <p className="profile-history-empty">{t('noRecentActivity')}</p>
        ) : (
          <div className="profile-history-list">
            {planHistory.map((plan, idx) => (
              <div key={`${plan.id}-${idx}`} className="profile-history-item">
                <div className="profile-history-thumb" style={{ backgroundImage: `url(${plan.image})` }} />
                <div className="profile-history-info">
                  <p className="profile-history-title">{plan.planTitle}</p>
                  <p className="profile-history-date">
                    <MapPin size={11} /> {plan.location}
                  </p>
                  <p className="profile-history-date">📅 {formatDate(plan.eventDate)}</p>
                </div>
                <span className={`role-badge role-badge--${plan.role}`}>
                  {t(plan.role)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
