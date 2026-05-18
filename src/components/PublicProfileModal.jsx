import React, { useState, useEffect } from 'react';
import { X, MapPin, Star } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import './PublicProfileModal.css';

const PublicProfileModal = ({ userId, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('perfiles_usuario')
        .select('full_name, photo_url, age, city, bio, rating, plans_hosted, plans_joined')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching public profile:', error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const renderStars = (rating) => {
    const stars = [];
    const rounded = Math.round(rating * 2) / 2; // round to nearest 0.5
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`pp-star ${i <= rounded ? '' : 'empty'}`}>★</span>
      );
    }
    return stars;
  };

  return (
    <div className="public-profile-overlay" onClick={onClose}>
      <div className="public-profile-card" onClick={(e) => e.stopPropagation()}>
        <button className="pp-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {loading ? (
          <div className="pp-loading">
            <div className="pp-skeleton pp-skeleton-avatar" />
            <div className="pp-skeleton pp-skeleton-line" />
            <div className="pp-skeleton pp-skeleton-line-short" />
            <div className="pp-skeleton pp-skeleton-line" />
          </div>
        ) : profile ? (
          <>
            <div className="pp-avatar-section">
              <div className="pp-avatar-ring">
                <img
                  src={profile.photo_url || 'https://via.placeholder.com/150'}
                  alt={profile.full_name}
                />
              </div>
              <h2 className="pp-name">{profile.full_name}</h2>
              <p className="pp-headline">
                {profile.age && <span>{profile.age} años</span>}
                {profile.age && profile.city && <span>·</span>}
                {profile.city && (
                  <>
                    <MapPin size={13} />
                    <span>{profile.city}</span>
                  </>
                )}
              </p>
              {profile.rating > 0 && (
                <div className="pp-rating">
                  {renderStars(profile.rating)}
                  <span className="pp-rating-value">{profile.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="pp-stats-row">
              <div className="pp-stat">
                <span className="pp-stat-value">{profile.plans_hosted ?? 0}</span>
                <span className="pp-stat-label">Creados</span>
              </div>
              <div className="pp-stat">
                <span className="pp-stat-value">{profile.plans_joined ?? 0}</span>
                <span className="pp-stat-label">Unidos</span>
              </div>
            </div>

            {profile.bio && (
              <div className="pp-body">
                <p className="pp-bio-label">Sobre mí</p>
                <p className="pp-bio-text">{profile.bio}</p>
              </div>
            )}
          </>
        ) : (
          <div className="pp-loading" style={{ padding: '48px 24px' }}>
            <p style={{ color: 'var(--color-gray-400)' }}>No se pudo cargar el perfil.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfileModal;
