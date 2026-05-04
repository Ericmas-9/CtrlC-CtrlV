import React, { useState } from 'react';
import './SquadChat.css';
import { Send, Image as ImageIcon, ChevronLeft, MoreVertical } from 'lucide-react';

const SquadChat = ({ matchData, userProfile, onBack, onUpdateMessages }) => {
  const [message, setMessage] = useState('');
  
  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMsg = {
      id: Date.now(),
      text: message,
      sender: 'us',
      user: 'You', // Since it's you sending the message
      avatar: userProfile.photo
    };

    onUpdateMessages([...matchData.messages, newMsg]);
    setMessage('');
  };

  return (
    <div className="squad-chat">
      <div className="chat-header">
        <button className="icon-btn-ghost" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <div className="chat-header-info">
          <h2 className="chat-title">{matchData.squad.squadName} + Your Squad</h2>
          <p className="chat-subtitle">{matchData.squad.membersCount + 1} members · Active now</p>
        </div>
        <button className="icon-btn-ghost">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="chat-messages">
        <div className="chat-date-separator">Today</div>
        
        {matchData.messages.map((msg, idx) => {
          const isUs = msg.sender === 'us';
          const showAvatar = idx === 0 || matchData.messages[idx-1].sender !== msg.sender;
          
          return (
            <div key={msg.id} className={`message-row ${isUs ? 'message-us' : 'message-them'}`}>
              {!isUs && (
                <div className="message-avatar">
                  {showAvatar && <img src={msg.avatar} alt={msg.user} />}
                </div>
              )}
              
              <div className="message-content">
                {showAvatar && <span className="message-sender-name">{msg.user}</span>}
                <div className={`message-bubble ${isUs ? 'bubble-us' : 'bubble-them'}`}>
                  {msg.text}
                </div>
              </div>
              
              {isUs && (
                <div className="message-avatar">
                  {showAvatar && <img src={msg.avatar} alt={msg.user} />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <button type="button" className="attach-btn">
          <ImageIcon size={20} color="var(--color-gray-500)" />
        </button>
        <input 
          type="text" 
          className="chat-input" 
          placeholder="Message the squads..." 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className={`send-btn ${message.trim() ? 'active' : ''}`}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default SquadChat;
