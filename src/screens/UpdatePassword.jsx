import React, { useState } from 'react';
import { Lock, EyeOff, Eye, Zap } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';
import './UpdatePassword.css';

function UpdatePassword({ onPasswordUpdated }) {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (password !== confirmPassword) {
      setFormError(t('passwordMismatch'));
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setFormError(error.message);
      setLoading(false);
    } else {
      setSuccessMessage(t('passwordUpdatedSuccess'));
      setLoading(false);
      setTimeout(() => onPasswordUpdated(), 1500);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="logo-box">
          <Zap size={28} color="#fff" fill="#ffb703" strokeWidth={1} />
        </div>
        <h1 className="auth-title">{t('updatePasswordTitle')}</h1>
        <p className="auth-subtitle">{t('updatePasswordSubtitle')}</p>
      </div>

      <form className="auth-form" onSubmit={handleUpdatePassword}>
        <div className="input-group">
          <label>{t('newPasswordLabel')}</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        <div className="input-group">
          <label>{t('confirmNewPasswordLabel')}</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        {formError && <p className="form-error-msg">{formError}</p>}
        {successMessage && <p className="form-success-msg">{successMessage}</p>}

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? t('updating') : t('updatePasswordTitle')}
        </button>
      </form>
    </div>
  );
}

export default UpdatePassword;
