import React, { useState } from 'react';
import { X, Heart, PlusCircle, MessageSquare } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import './Notifications.css';

const Notifications = ({ notifications, onClose }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // ISO timestamp → format relatiu
    if (timeStr.includes('T') && timeStr.includes(':')) {
      const diffMs = new Date() - new Date(timeStr);
      if (isNaN(diffMs)) return timeStr;
      const mins  = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMs / 3600000);
      const days  = Math.floor(diffMs / 86400000);
      if (mins  <  1) return t('justNow');
      if (mins  < 60) return `${mins}m`;
      if (hours < 24) return `${hours}h`;
      if (days  <  7) return `${days}d`;
      return new Date(timeStr).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    }
    return timeStr; // format antic, mostra tal qual
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.type === filter;
  });

  const NotifIcon = ({ type }) => {
    if (type === 'like')     return <Heart         size={10} fill="white" />;
    if (type === 'message')  return <MessageSquare size={10} color="white" />;
    if (type === 'reminder') return <span style={{ fontSize: '10px', lineHeight: 1 }}>⏰</span>;
    return <PlusCircle size={10} color="white" />;
  };

  return (
    <div className="notifications-screen">
      <div className="notifications-header">
        <div style={{ width: '24px' }}></div>
        <h3>{t('notificationsTitle')}</h3>
        <button onClick={onClose} className="close-btn-ghost">
          <X size={24} />
        </button>
      </div>

      <div className="notifications-filters">
        <button className={`filter-btn ${filter === 'all'     ? 'active' : ''}`} onClick={() => setFilter('all')}>
          {t('all')}
        </button>
        <button className={`filter-btn ${filter === 'like'    ? 'active' : ''}`} onClick={() => setFilter('like')}>
          {t('likes')}
        </button>
        <button className={`filter-btn ${filter === 'join'    ? 'active' : ''}`} onClick={() => setFilter('join')}>
          {t('joins')}
        </button>
        <button className={`filter-btn ${filter === 'message' ? 'active' : ''}`} onClick={() => setFilter('message')}>
          {t('messages')}
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
                  <NotifIcon type={notif.type} />
                </div>
              </div>
              <div className="notif-content">
                <p className="notif-text">{notif.text}</p>
                <p className="notif-time">{formatTime(notif.time)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
