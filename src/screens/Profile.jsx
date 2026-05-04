import React, { useState } from 'react';
import { Camera, Star, Settings } from 'lucide-react';
import './Profile.css';

const Profile = ({ userProfile, setUserProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...userProfile });

  const handleSave = () => {
    setUserProfile({ ...editForm });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="profile-screen">
        <div className="profile-edit-header">
          <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
          <h3>Edit Profile</h3>
          <button onClick={handleSave} className="save-btn">Save</button>
        </div>

        <div className="profile-form">
          <div className="input-group">
            <label>NAME</label>
            <input 
              type="text" 
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>AGE</label>
            <input 
              type="number" 
              value={editForm.age}
              onChange={(e) => setEditForm({...editForm, age: parseInt(e.target.value) || ''})}
            />
          </div>
          <div className="input-group">
            <label>BIO</label>
            <textarea 
              value={editForm.bio}
              onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
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
            <p>Plans Hosted</p>
          </div>
          <div className="stat-item">
            <h4>23</h4>
            <p>Plans Joined</p>
          </div>
          <div className="stat-item">
            <h4>4.9 <Star size={12} fill="var(--color-amber)" color="var(--color-amber)" /></h4>
            <p>Rating</p>
          </div>
        </div>
      </div>

      <div className="profile-details-card">
        <div className="card-header-row">
          <h3 className="section-label">IDENTITY</h3>
          <button className="edit-btn-ghost" onClick={() => setIsEditing(true)}>Edit</button>
        </div>

        <div className="detail-row">
          <p className="detail-label">NAME</p>
          <p className="detail-value">{userProfile.name}</p>
        </div>
        
        <div className="detail-row-split">
          <div className="detail-col">
            <p className="detail-label">AGE</p>
            <p className="detail-value">{userProfile.age}</p>
          </div>
          <div className="detail-col">
            <p className="detail-label">LOCATION</p>
            <p className="detail-value">Santa Monica, CA</p>
          </div>
        </div>

        <div className="detail-row">
          <p className="detail-label">BIO</p>
          <p className="detail-value-text">{userProfile.bio}</p>
        </div>
      </div>

      <div className="profile-details-card">
        <div className="card-header-row">
          <h3 className="section-label">MY VIBES ({userProfile.tags.length})</h3>
          <button className="edit-btn-ghost">Tap to edit</button>
        </div>
        <div className="tags-container" style={{ marginTop: '10px' }}>
          {userProfile.tags.map(tag => (
            <span key={tag} className="tag tag-turquoise">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
