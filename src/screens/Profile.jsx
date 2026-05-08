import React, { useState } from 'react';
import { Camera, Star } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import './Profile.css';

const Profile = ({ userProfile, setUserProfile }) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    ...userProfile,
    bio: userProfile.bioKey ? t(userProfile.bioKey) : userProfile.bio
  });

  const handleSave = () => {
    setUserProfile({ ...editForm, bioKey: null });
    setIsEditing(false);
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
          <img src={userProfile.photo} alt={userProfile.name} className="profile-avatar-large" />
          <button className="camera-btn">
            <Camera size={16} color="white" />
          </button>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <h4>8</h4>
            <p>{t('plansHosted')}</p>
          </div>
          <div className="stat-item">
            <h4>23</h4>
            <p>{t('plansJoined')}</p>
          </div>
          <div className="stat-item">
            <h4>4.9 <Star size={12} fill="var(--color-amber)" color="var(--color-amber)" /></h4>
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
            <p className="detail-value">Santa Monica, CA</p>
          </div>
        </div>

        <div className="detail-row">
          <p className="detail-label">{t('bioLabel')}</p>
          {/* Bio uses translation key when default; shows raw text once user edits */}
          <p className="detail-value-text">
            {userProfile.bioKey ? t(userProfile.bioKey) : userProfile.bio}
          </p>
        </div>
      </div>

      <div className="profile-details-card">
        <div className="card-header-row">
          <h3 className="section-label">{t('myVibes')} ({userProfile.tags.length})</h3>
          <button className="edit-btn-ghost">{t('tapToEdit')}</button>
        </div>
        <div className="tags-container" style={{ marginTop: '10px' }}>
          {userProfile.tags.map(tag => (
            <span key={tag} className="tag tag-turquoise">{t(tag)}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
