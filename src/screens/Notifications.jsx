import React, { useState } from 'react';
import { X, Heart, PlusCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import './Notifications.css';

const Notifications = ({ notifications, onClose }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all'); // 'all', 'like', 'join'

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.type === filter;
  });

  return (
    <div className="notifications-screen">
      <div className="notifications-header">
        <div style={{ width: '24px' }}></div> {/* Spacer */}
        <h3>{t('notificationsTitle')}</h3>
        <button onClick={onClose} className="close-btn-ghost">
          <X size={24} />
        </button>
      </div>

      <div className="notifications-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t('all')}
        </button>
        <button 
          className={`filter-btn ${filter === 'like' ? 'active' : ''}`}
          onClick={() => setFilter('like')}
        >
          {t('likes')}
        </button>
        <button 
          className={`filter-btn ${filter === 'join' ? 'active' : ''}`}
          onClick={() => setFilter('join')}
        >
          {t('joins')}
        </button>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <p>{t('noNewNotifs')}</p>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div key={notif.id} className="notification-item">
              <div className="notif-avatar-wrapper">
                <img src={notif.avatar} alt="avatar" className="notif-avatar" />
                <div className={`notif-icon-badge ${notif.type}`}>
                  {notif.type === 'like' ? <Heart size={10} fill="white" /> : <PlusCircle size={10} color="white" />}
                </div>
              </div>
              <div className="notif-content">
                <p className="notif-text">{notif.text}</p>
                <p className="notif-time">{notif.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
