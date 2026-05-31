import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';
import './EventGalleryModal.css';

const EventGalleryModal = ({ plan, userProfile, onClose }) => {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fullscreenPhoto, setFullscreenPhoto] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    fetchPhotos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.id]);

  const fetchPhotos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('plan_photos')
      .select('id, photo_url, user_id, created_at')
      .eq('plan_id', plan.id)
      .order('created_at', { ascending: false });

    if (!error) setPhotos(data || []);
    setLoading(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const ext = file.name.split('.').pop();
    const path = `event-photos/${plan.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('squad-images')
      .upload(path, file, { upsert: false });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('squad-images')
      .getPublicUrl(path);

    const { error: insertError } = await supabase
      .from('plan_photos')
      .insert([{ plan_id: plan.id, user_id: userProfile.id, photo_url: publicUrl }]);

    if (!insertError) await fetchPhotos();
    setUploading(false);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  const handleDelete = async (photo, e) => {
    e.stopPropagation();
    if (photo.user_id !== userProfile.id) return;
    const { error } = await supabase
      .from('plan_photos')
      .delete()
      .eq('id', photo.id);
    if (!error) setPhotos(prev => prev.filter(p => p.id !== photo.id));
  };

  return (
    <div className="gallery-overlay" onClick={onClose}>
      <div className="gallery-modal" onClick={e => e.stopPropagation()}>

        <div className="gallery-header">
          <div className="gallery-header-info">
            <h3>{t('eventGallery')}</h3>
            <p className="gallery-plan-name">{plan.planTitle}</p>
          </div>
          <div className="gallery-header-actions">
            <button
              className="gallery-add-btn"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading
                ? <span className="gallery-uploading-dot" />
                : <><Plus size={15} /> {t('addPhoto')}</>
              }
            </button>
            <button className="gallery-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
        </div>

        <div className="gallery-body">
          {loading ? (
            <div className="gallery-loading">
              <div className="gallery-spinner" />
            </div>
          ) : photos.length === 0 ? (
            <div className="gallery-empty">
              <Camera size={44} color="var(--color-gray-300)" />
              <p>{t('galleryEmpty')}</p>
              <button
                className="gallery-upload-cta"
                onClick={() => fileRef.current?.click()}
              >
                <Plus size={15} /> {t('addPhoto')}
              </button>
            </div>
          ) : (
            <>
              <p className="gallery-count">{photos.length} {t('photos')}</p>
              <div className="gallery-grid">
                {photos.map(photo => (
                  <div
                    key={photo.id}
                    className="gallery-photo-item"
                    onClick={() => setFullscreenPhoto(photo)}
                  >
                    <img src={photo.photo_url} alt="" />
                    {photo.user_id === userProfile.id && (
                      <button
                        className="gallery-delete-btn"
                        onClick={(e) => handleDelete(photo, e)}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen photo viewer */}
      {fullscreenPhoto && (
        <div className="gallery-fullscreen" onClick={() => setFullscreenPhoto(null)}>
          <img src={fullscreenPhoto.photo_url} alt="" />
          <button className="gallery-fullscreen-close" onClick={() => setFullscreenPhoto(null)}>
            <X size={22} />
          </button>
        </div>
      )}
    </div>
  );
};

export default EventGalleryModal;
