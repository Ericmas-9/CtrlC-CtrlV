import React, { useState } from 'react';
import { Mail, Lock, EyeOff, Eye, Zap } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import './Login.css';

function Login({ onNavigateToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorState(false);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorState(true);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email first to recover the password.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Password recovery email sent!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="logo-box">
          <Zap size={28} color="#fff" fill="#ffb703" strokeWidth={1} />
        </div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Log in to continue</p>
      </div>

      <form className="auth-form" onSubmit={handleLogin}>
        <div className="input-group">
          <label>Email Address</label>
          <div className={`input-wrapper ${errorState ? 'error' : ''}`}>
            <Mail className="input-icon" size={20} />
            <input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className={`input-wrapper ${errorState ? 'error' : ''}`}>
            <Lock className="input-icon" size={20} />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Enter your password" 
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

        <div className="forgot-password-link">
          <button type="button" onClick={handleForgotPassword}>Forgot Password?</button>
        </div>

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>

      <div className="divider">
        <span>OR</span>
      </div>

      <button type="button" className="google-btn" onClick={handleGoogleLogin}>
        <img 
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
          alt="Google logo" 
          className="google-icon"
        />
        Continue with Google
      </button>

      <div className="auth-footer">
        <p>Don't have an account? <button type="button" className="link-btn" onClick={onNavigateToRegister}>Sign Up</button></p>
      </div>
    </div>
  );
}

export default Login;
