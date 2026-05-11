import React, { useState } from 'react';
import { Camera, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase } from '../utils/supabaseClient';
import './Profile.css';

const Profile = ({ userProfile, setUserProfile }) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    ...userProfile,
    bio: userProfile.bio || ''
  });

  const handleSave = async () => {
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
          bio: editForm.bio
          // Note: we can add interests edit support here if you add a UI for it
        })
        .eq('id', userProfile.id);
        
      if (error) {
        console.error("Error updating profile:", error);
        alert("Hubo un problema actualizando tu perfil.");
      }
    }
  };

  if (isEditing) {
    return (
      <div className="profile-screen">
        <div className="profile-edit-header">
          <button onClick={() => setIsEditing(false)} className="cancel-btn">{t('cancel')}</button>
          <h3>{t('editProfile')}</h3>
          <button onClick={handleSave} className="save-btn">{t('save')}</button>
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

  return (
    <div className="profile-screen">
      <div className="profile-header-card">
        <div className="profile-avatar-container">
          {userProfile.photo ? (
            <img src={userProfile.photo} alt={userProfile.name} className="profile-avatar-large" />
          ) : (
            <div className="profile-avatar-placeholder">
              <UserIcon size={48} color="#94a3b8" />
            </div>
          )}
          <button className="camera-btn">
            <Camera size={16} color="white" />
          </button>
        </div>

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
          <p className="detail-value-text">
            {userProfile.bio}
          </p>
        </div>
      </div>

    </div>
  );
};

export default Profile;
