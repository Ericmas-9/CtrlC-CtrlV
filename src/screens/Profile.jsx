import React, { useState, useRef } from 'react';
import { Camera, User as UserIcon, Loader } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase } from '../utils/supabaseClient';
import './Profile.css';

const BUCKET = 'squad-images';


const Profile = ({ userProfile, setUserProfile }) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    ...userProfile,
    bio: userProfile.bio || ''
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

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
      alert('No se pudo subir la foto. Inténtalo de nuevo.');
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
        alert('Hubo un problema actualizando tu perfil.');
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

      {/* Visible camera button triggers the hidden input */}
      <label
        htmlFor="avatar-file-input"
        className={`camera-btn ${isUploadingAvatar ? 'camera-btn--disabled' : ''}`}
        title="Change photo"
      >
        <Camera size={16} color="white" />
      </label>
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
          <div className="stat-item">
            <h4 className="stat-rating">
              {userProfile.rating > 0
                ? <>&#9733; {Number(userProfile.rating).toFixed(1)}</>
                : '—'}
            </h4>
            <p>{t('rating')}</p>
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
    </div>
  );
};

export default Profile;
