import React from 'react';
import { SlidersHorizontal, Bell } from 'lucide-react';
import './TopBar.css';

const TopBar = ({ title, subtitle, onOpenNotifications, onOpenSettings, hasNotifications }) => {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        {title ? (
          <div className="top-bar-title-group">
            <h1 className="top-bar-title">{title}</h1>
            {subtitle && <p className="top-bar-subtitle">{subtitle}</p>}
          </div>
        ) : (
          <div className="logo-group">
            <div className="logo-icon">⚡</div>
            <h1 className="logo-text">Squad<span>Up</span></h1>
          </div>
        )}
      </div>
      <div className="top-bar-right">
        {!title && (
          <>
            <button className="icon-btn" onClick={onOpenSettings}>
              <SlidersHorizontal size={20} />
            </button>
            <button className="icon-btn" onClick={onOpenNotifications}>
              <Bell size={20} />
              {hasNotifications && <span className="notification-dot"></span>}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TopBar;
