import React, { useState, useEffect } from 'react';
import { Lock, X, ArrowLeft, CreditCard, Shield } from 'lucide-react';
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

const formatCardNumber = (val) =>
  val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
};

const validateCard = (card, expiry, cvv) => {
  if (card.replace(/\s/g, '').length !== 16) return false;
  const [mm, yy] = expiry.split('/');
  if (!mm || !yy || mm.length !== 2 || yy.length !== 2) return false;
  const month = parseInt(mm);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const exp = new Date(2000 + parseInt(yy), month - 1);
  if (exp <= now) return false;
  if (cvv.length < 3) return false;
  return true;
};

// view: 'main' | 'payment' | 'processing' | 'success'
const SwipeLimitModal = ({ onClose, onUnlock, onPay }) => {
  const { t } = useLanguage();
  const [view, setView] = useState('main');
  const [msLeft, setMsLeft] = useState(getMsUntilMidnight);

  // Code state
  const [code, setCode] = useState('');
  const [codeStatus, setCodeStatus] = useState('idle'); // 'idle' | 'error' | 'already_used'
  const [showCode, setShowCode] = useState(false);

  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardError, setCardError] = useState('');

  useEffect(() => {
    const id = setInterval(() => setMsLeft(getMsUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleActivateCode = () => {
    if (!code.trim()) return;
    const result = onUnlock(code);
    if (result === 'ok') {
      setView('success');
    } else if (result === 'already_used') {
      setCodeStatus('already_used');
    } else {
      setCodeStatus('error');
    }
  };

  const handlePay = () => {
    if (!validateCard(cardNumber, expiry, cvv)) {
      setCardError(t('paymentInvalidCard'));
      return;
    }
    setCardError('');
    setView('processing');
    setTimeout(() => {
      onPay();
      setView('success');
    }, 1800);
  };

  // ── PROCESSING VIEW ──
  if (view === 'processing') {
    return (
      <div className="swipe-limit-overlay">
        <div className="swipe-limit-modal" style={{ alignItems: 'center', gap: 16, paddingTop: 48 }}>
          <div className="payment-spinner" />
          <p className="payment-processing-text">{t('paymentProcessing')}</p>
        </div>
      </div>
    );
  }

  // ── SUCCESS VIEW ──
  if (view === 'success') {
    return (
      <div className="swipe-limit-overlay" onClick={onClose}>
        <div className="swipe-limit-modal" onClick={e => e.stopPropagation()}>
          <div className="swipe-limit-success">
            <p>{t('swipeUnlockSuccess')}</p>
            <button className="btn-primary swipe-limit-btn" onClick={onClose}>
              {t('swipeUnlockContinue')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PAYMENT FORM VIEW ──
  if (view === 'payment') {
    return (
      <div className="swipe-limit-overlay" onClick={onClose}>
        <div className="swipe-limit-modal" onClick={e => e.stopPropagation()}>
          <button className="swipe-limit-close" onClick={onClose}><X size={20} /></button>

          <button className="payment-back-btn" onClick={() => setView('main')}>
            <ArrowLeft size={16} /> {t('paymentBack')}
          </button>

          <div className="payment-form-header">
            <Shield size={22} color="var(--color-turquoise)" />
            <span>{t('paymentFormTitle')}</span>
          </div>

          <div className="payment-price-badge">{t('paymentPrice')}</div>

          <div className="payment-form">
            <div className="payment-field">
              <label>{t('paymentCardNumber')}</label>
              <div className="payment-input-wrapper">
                <CreditCard size={16} color="#94a3b8" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={t('paymentCardPlaceholder')}
                  value={cardNumber}
                  onChange={e => { setCardNumber(formatCardNumber(e.target.value)); setCardError(''); }}
                  maxLength={19}
                />
              </div>
            </div>

            <div className="payment-row">
              <div className="payment-field">
                <label>{t('paymentExpiry')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={t('paymentExpiryPlaceholder')}
                  value={expiry}
                  onChange={e => { setExpiry(formatExpiry(e.target.value)); setCardError(''); }}
                  maxLength={5}
                />
              </div>
              <div className="payment-field">
                <label>{t('paymentCvv')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="···"
                  value={cvv}
                  onChange={e => { setCvv(e.target.value.replace(/\D/g, '').slice(0, 3)); setCardError(''); }}
                  maxLength={3}
                />
              </div>
            </div>

            {cardError && <p className="swipe-limit-error">{cardError}</p>}
          </div>

          <button className="btn-primary swipe-limit-btn" onClick={handlePay}>
            {t('paymentSubmit')}
          </button>
          <p className="payment-disclaimer">{t('paymentDisclaimer')}</p>
        </div>
      </div>
    );
  }

  // ── MAIN VIEW ──
  return (
    <div className="swipe-limit-overlay" onClick={onClose}>
      <div className="swipe-limit-modal" onClick={e => e.stopPropagation()}>
        <button className="swipe-limit-close" onClick={onClose}><X size={20} /></button>

        <div className="swipe-limit-icon">
          <Lock size={32} color="var(--color-turquoise)" />
        </div>

        <h2 className="swipe-limit-title">{t('swipeLimitTitle')}</h2>

        <div className="swipe-limit-countdown">
          <span className="countdown-label">{t('swipeLimitResetIn')}</span>
          <span className="countdown-timer">{formatCountdown(msLeft)}</span>
        </div>

        {/* Premium payment card */}
        <div className="premium-card">
          <div className="premium-card-top">
            <div>
              <p className="premium-card-title">{t('paymentTitle')}</p>
              <p className="premium-card-desc">{t('paymentDescription')}</p>
            </div>
            <span className="premium-price">{t('paymentPrice')}</span>
          </div>
          <button className="premium-cta-btn" onClick={() => setView('payment')}>
            {t('paymentCta')}
          </button>
        </div>

        {/* Code section — collapsible */}
        <button
          className="swipe-limit-secondary"
          onClick={() => setShowCode(v => !v)}
        >
          {t('swipeLimitHaveCode')} {showCode ? '▲' : '▼'}
        </button>

        {showCode && (
          <div className="swipe-limit-code-section">
            <input
              className={`swipe-limit-input ${codeStatus === 'error' || codeStatus === 'already_used' ? 'input-error' : ''}`}
              type="text"
              placeholder={t('swipeCodePlaceholder')}
              value={code}
              onChange={e => { setCode(e.target.value); setCodeStatus('idle'); }}
              onKeyDown={e => { if (e.key === 'Enter') handleActivateCode(); }}
              autoCapitalize="characters"
              spellCheck={false}
            />
            {codeStatus === 'error' && <p className="swipe-limit-error">{t('swipeCodeInvalid')}</p>}
            {codeStatus === 'already_used' && <p className="swipe-limit-error">{t('swipeCodeAlreadyUsed')}</p>}
            <button
              className="btn-primary swipe-limit-btn"
              onClick={handleActivateCode}
              disabled={!code.trim()}
            >
              {t('swipeCodeActivate')}
            </button>
          </div>
        )}

        <button className="swipe-limit-secondary" onClick={onClose}>
          {t('swipeLimitTomorrow')}
        </button>
      </div>
    </div>
  );
};

export default SwipeLimitModal;
