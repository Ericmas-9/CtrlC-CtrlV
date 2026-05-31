import React, { useState } from 'react';
import { Mail, Lock, EyeOff, Eye, Zap } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';
import './Login.css';

function Login({ onNavigateToRegister }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [formMessage, setFormMessage] = useState(null);
  const [formMessageType, setFormMessageType] = useState('error');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorState(false);
    setFormMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorState(true);
      setFormMessage(t('loginError'));
      setFormMessageType('error');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    const emailToRecover = window.prompt(t('forgotPassword'), email);
    if (!emailToRecover) return;

    const { error } = await supabase.auth.resetPasswordForEmail(emailToRecover);
    if (error) {
      setFormMessage(t('passwordRecoveryError'));
      setFormMessageType('error');
    } else {
      setFormMessage(t('recoveryEmailSent'));
      setFormMessageType('success');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="logo-box">
          <Zap size={28} color="#fff" fill="#ffb703" strokeWidth={1} />
        </div>
        <h1 className="auth-title">{t('welcomeBack')}</h1>
        <p className="auth-subtitle">{t('loginSubtitle')}</p>
      </div>

      <form className="auth-form" onSubmit={handleLogin}>
        <div className="input-group">
          <label>{t('emailLabel')}</label>
          <div className={`input-wrapper ${errorState ? 'error' : ''}`}>
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              placeholder="tu@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>{t('passwordLabel')}</label>
          <div className={`input-wrapper ${errorState ? 'error' : ''}`}>
            <Lock className="input-icon" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        {formMessage && (
          <p className={`form-${formMessageType}-msg`}>{formMessage}</p>
        )}

        <div className="forgot-password-link">
          <button type="button" onClick={handleForgotPassword}>{t('forgotPassword')}</button>
        </div>

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? t('loggingIn') : t('logIn')}
        </button>
      </form>

      <div className="auth-footer">
        <p>{t('noAccount')} <button type="button" className="link-btn" onClick={onNavigateToRegister}>{t('signUp')}</button></p>
      </div>
    </div>
  );
}

export default Login;
