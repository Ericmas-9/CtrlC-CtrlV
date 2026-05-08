import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, EyeOff, Eye } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import './Register.css';

function Register({ onNavigateToLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!agreedToTerms) {
      alert("Please agree to the Terms and Conditions");
      return;
    }

    setLoading(true);
    
    // Create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
      return;
    }

    // Insert into perfiles_usuario
    const { error: dbError } = await supabase
      .from('perfiles_usuario')
      .insert([
        { 
          full_name: fullName, 
          email: email 
          // If you have a column for the UUID, you can add it here, e.g., auth_id: data.user.id
        }
      ]);

    if (dbError) {
      console.error("Error inserting into perfiles_usuario:", dbError);
      // We don't necessarily block the user if the auth succeeded, 
      // but it's good to log or alert.
    }

    setLoading(false);
    // User might need to confirm email depending on Supabase settings. 
    // If auto-login is on, App.jsx will catch the session change.
  };

  return (
    <div className="auth-container">
      <div className="auth-top-nav">
        <button type="button" className="back-btn" onClick={onNavigateToLogin}>
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="auth-header left-align">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Fill in the details to get started</p>
      </div>

      <form className="auth-form" onSubmit={handleRegister}>
        <div className="input-group">
          <label>Full Name</label>
          <div className="input-wrapper">
            <User className="input-icon" size={20} />
            <input 
              type="text" 
              placeholder="John Doe" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Email Address</label>
          <div className="input-wrapper">
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
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Create a password" 
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

        <div className="input-group">
          <label>Confirm Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input 
              type={showConfirmPassword ? 'text' : 'password'} 
              placeholder="Re-enter your password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        <div className="terms-checkbox">
          <input 
            type="checkbox" 
            id="terms" 
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
          />
          <label htmlFor="terms">
            I agree to the <a href="#">Terms and Conditions</a>
          </label>
        </div>

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="auth-footer">
        <p>Already have an account? <button type="button" className="link-btn" onClick={onNavigateToLogin}>Log In</button></p>
      </div>
    </div>
  );
}

export default Register;
