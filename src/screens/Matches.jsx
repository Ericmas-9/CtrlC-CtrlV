import React from 'react';
import { MessageSquare, Calendar, Users } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import './Matches.css';

const Matches = ({ matches, onOpenChat }) => {
  const { t } = useLanguage();
  return (
    <div className="matches-screen">
      <div className="matches-section">
        <h3 className="section-label">{t('activeSquadChats', { count: matches.length })}</h3>
        
        {matches.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} color="var(--color-gray-300)" />
            <p>{t('noActiveChats')}</p>
          </div>
        ) : (
          <div className="matches-list">
            {matches.map(match => {
              const latestMsg = match.messages[match.messages.length - 1];
              const isUs = latestMsg.sender === 'us';
              
              return (
                <div key={match.id} className="match-list-item" onClick={() => onOpenChat(match.id)}>
                  <div className="match-avatars-overlap">
                    <img src={match.squad.leaderAvatar} alt="Theirs" className="avatar-theirs" />
                    <div className="avatar-ours" style={{ backgroundImage: `url(${match.squad.image})` }}></div>
                  </div>
                  
                  <div className="match-item-content">
                    <div className="match-item-header">
                      <h4>{match.squad.planTitle}</h4>
                      <span className="match-time">{match.lastActive}</span>
                    </div>
                    <p className="match-latest-msg">
                      {isUs ? t('you') : ''}{latestMsg.text}
                    </p>
                    <div className="match-meta">
                      <span className="meta-badge"><Calendar size={12}/> {match.squad.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="matches-section" style={{ marginTop: '24px' }}>
        <h3 className="section-label">{t('pendingRequests')}</h3>
        <div className="empty-state">
           <p>{t('noPendingRequests')}</p>
        </div>
      </div>
    </div>
  );
};

export default Matches;
