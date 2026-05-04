import React from 'react';
import { Flame, Plus, Zap, User } from 'lucide-react';
import './BottomNav.css';

const BottomNav = ({ currentTab, setCurrentTab }) => {
  const tabs = [
    { id: 'discover', label: 'Discover', icon: Flame },
    { id: 'create', label: 'Create', icon: Plus, isPrimary: true },
    { id: 'matches', label: 'Matches', icon: Zap },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        
        if (tab.isPrimary) {
          return (
            <button
              key={tab.id}
              className={`nav-item primary-nav-item`}
              onClick={() => setCurrentTab(tab.id)}
            >
              <div className="primary-nav-icon-wrapper">
                <Icon size={28} color="white" />
              </div>
              <span className={`nav-label ${isActive ? 'active-label' : ''}`}>{tab.label}</span>
            </button>
          )
        }

        return (
          <button
            key={tab.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setCurrentTab(tab.id)}
          >
            <Icon size={24} className="nav-icon" />
            <span className="nav-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
