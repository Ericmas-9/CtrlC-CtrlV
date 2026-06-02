import React, { useState, useEffect } from 'react';
import { Lock, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import './SwipeLimitModal.css';

const getMsUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight - now;
};

const formatCountdown = (ms) => {
  if (ms <= 0) return '00:00:00';
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
};

const SwipeLimitModal = ({ onClose, onUnlock }) => {
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'success' | 'error' | 'already_used'
  const [msLeft, setMsLeft] = useState(getMsUntilMidnight);

  useEffect(() => {
    const id = setInterval(() => setMsLeft(getMsUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleActivate = () => {
    if (!code.trim()) return;
    const result = onUnlock(code);
    if (result === 'ok') {
      setStatus('success');
    } else if (result === 'already_used') {
      setStatus('already_used');
    } else {
      setStatus('error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleActivate();
  };

  return (
    <div className="swipe-limit-overlay" onClick={onClose}>
      <div className="swipe-limit-modal" onClick={e => e.stopPropagation()}>
        <button className="swipe-limit-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="swipe-limit-icon">
          <Lock size={32} color="var(--color-turquoise)" />
        </div>

        <h2 className="swipe-limit-title">{t('swipeLimitTitle')}</h2>
        <p className="swipe-limit-subtitle">{t('swipeLimitSubtitle')}</p>

        <div className="swipe-limit-countdown">
          <span className="countdown-label">{t('swipeLimitResetIn')}</span>
          <span className="countdown-timer">{formatCountdown(msLeft)}</span>
        </div>

        {status === 'success' ? (
          <div className="swipe-limit-success">
            <p>{t('swipeUnlockSuccess')}</p>
            <button className="btn-primary swipe-limit-btn" onClick={onClose}>
              {t('swipeUnlockContinue')}
            </button>
          </div>
        ) : (
          <>
            <div className="swipe-limit-divider">
              <span>{t('swipeLimitOrUnlock')}</span>
            </div>

            <div className="swipe-limit-code-section">
              <input
                className={`swipe-limit-input ${status === 'error' || status === 'already_used' ? 'input-error' : ''}`}
                type="text"
                placeholder={t('swipeCodePlaceholder')}
                value={code}
                onChange={e => { setCode(e.target.value); setStatus('idle'); }}
                onKeyDown={handleKeyDown}
                autoCapitalize="characters"
                spellCheck={false}
              />
              {(status === 'error') && (
                <p className="swipe-limit-error">{t('swipeCodeInvalid')}</p>
              )}
              {(status === 'already_used') && (
                <p className="swipe-limit-error">{t('swipeCodeAlreadyUsed')}</p>
              )}
              <button
                className="btn-primary swipe-limit-btn"
                onClick={handleActivate}
                disabled={!code.trim()}
              >
                {t('swipeCodeActivate')}
              </button>
            </div>

            <button className="swipe-limit-secondary" onClick={onClose}>
              {t('swipeLimitTomorrow')}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SwipeLimitModal;
