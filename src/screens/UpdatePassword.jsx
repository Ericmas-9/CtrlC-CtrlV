import React, { useState } from 'react';
import { Lock, EyeOff, Eye, Zap } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import './UpdatePassword.css';

function UpdatePassword({ onPasswordUpdated }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
    } else {
      alert("Password updated successfully!");
      setLoading(false);
      onPasswordUpdated();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="logo-box">
          <Zap size={28} color="#fff" fill="#ffb703" strokeWidth={1} />
        </div>
        <h1 className="auth-title">Update Password</h1>
        <p className="auth-subtitle">Enter your new password</p>
      </div>

      <form className="auth-form" onSubmit={handleUpdatePassword}>
        <div className="input-group">
          <label>New Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Enter new password" 
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
          <label>Confirm New Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input 
              type={showConfirmPassword ? 'text' : 'password'} 
              placeholder="Confirm new password" 
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

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

export default UpdatePassword;
