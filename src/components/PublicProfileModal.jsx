import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';
import './PublicProfileModal.css';

const PublicProfileModal = ({ userId, onClose }) => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('perfiles_usuario')
        .select('full_name, photo_url, age, city, bio, plans_hosted, plans_joined')
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
                {profile.age && <span>{profile.age} {t('years')}</span>}
                {profile.age && profile.city && <span>·</span>}
                {profile.city && (
                  <>
                    <MapPin size={13} />
                    <span>{profile.city}</span>
                  </>
                )}
              </p>
            </div>

            <div className="pp-stats-row">
              <div className="pp-stat">
                <span className="pp-stat-value">{profile.plans_hosted ?? 0}</span>
                <span className="pp-stat-label">{t('plansCreated')}</span>
              </div>
              <div className="pp-stat">
                <span className="pp-stat-value">{profile.plans_joined ?? 0}</span>
                <span className="pp-stat-label">{t('plansJoinedShort')}</span>
              </div>
            </div>

            {profile.bio && (
              <div className="pp-body">
                <p className="pp-bio-label">{t('aboutMe')}</p>
                <p className="pp-bio-text">{profile.bio}</p>
              </div>
            )}
          </>
        ) : (
          <div className="pp-loading" style={{ padding: '48px 24px' }}>
            <p style={{ color: 'var(--color-gray-400)' }}>{t('couldNotLoadProfile')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfileModal;
