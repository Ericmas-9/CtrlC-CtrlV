import React, { useState } from 'react';
import { Star } from 'lucide-react';
import './RatingModal.css';
import { useLanguage } from '../i18n/LanguageContext';

const RatingModal = ({ plan, totalPending, onSubmit, onSkip }) => {
  const { t } = useLanguage();
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (stars === 0 || submitting) return;
    setSubmitting(true);
    await onSubmit(plan, stars, comment);
    setSubmitting(false);
  };

  const starLabels = ['', t('starBad'), t('starMeh'), t('starOk'), t('starGood'), t('starGreat')];
  const activeStars = hovered || stars;

  return (
    <div className="rating-overlay">
      <div className="rating-modal">

        {/* Plan image header */}
        <div
          className="rating-plan-image"
          style={{ backgroundImage: `url(${plan.image || ''})` }}
        >
          <div className="rating-plan-image-gradient" />
          <div className="rating-plan-info">
            <p className="rating-event-label">{t('howWasIt')}</p>
            <h3 className="rating-plan-title">{plan.planTitle}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="rating-body">
          {totalPending > 1 && (
            <span className="rating-pending-pill">
              {t('pendingRatingsCount', { count: totalPending })}
            </span>
          )}

          <p className="rating-subtitle">{t('rateYourExperience')}</p>

          {/* Stars */}
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                className="star-btn"
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setStars(star)}
                aria-label={`${star} stars`}
              >
                <Star
                  size={44}
                  fill={activeStars >= star ? '#FFB800' : 'none'}
                  color={activeStars >= star ? '#FFB800' : '#CBD5E1'}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>

          {activeStars > 0 && (
            <p className="rating-star-label">{starLabels[activeStars]}</p>
          )}

          {/* Optional comment (appears after picking stars) */}
          {stars > 0 && (
            <textarea
              className="rating-comment"
              placeholder={t('ratingCommentPlaceholder')}
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
            />
          )}

          <div className="rating-actions">
            <button
              className="rating-submit-btn"
              onClick={handleSubmit}
              disabled={stars === 0 || submitting}
            >
              {submitting ? t('ratingSubmitting') : t('sendRating')}
            </button>
            <button className="rating-skip-btn" onClick={() => onSkip(plan.id)}>
              {t('rateLater')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
