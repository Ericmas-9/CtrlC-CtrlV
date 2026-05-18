import React, { useState, useEffect } from 'react';
import './SquadChat.css';
import { Send, Image as ImageIcon, ChevronLeft, MoreVertical } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const SquadChat = ({ matchData, userProfile, onBack }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!matchData?.squad?.id) return;

      // Step 1: Fetch raw messages (no join — sender_id FK points to auth.users, not perfiles_usuario)
      const { data: msgData, error: msgError } = await supabase
        .from('mensajes_chat')
        .select('id, text, created_at, sender_id')
        .eq('plan_id', matchData.squad.id)
        .order('created_at', { ascending: true });

      if (msgError) {
        console.error('Error fetching messages:', msgError);
        return;
      }
      if (!msgData || msgData.length === 0) {
        setMessages([]);
        return;
      }

      // Step 2: Collect unique sender IDs and batch-fetch their profiles
      const senderIds = [...new Set(msgData.map(m => m.sender_id))];
      const { data: profileData } = await supabase
        .from('perfiles_usuario')
        .select('id, full_name, photo_url')
        .in('id', senderIds);

      // Step 3: Build a lookup map id → profile
      const profileMap = {};
      (profileData || []).forEach(p => { profileMap[p.id] = p; });

      // Step 4: Map profiles onto messages for the UI
      const formatted = msgData.map(msg => {
        const profile = profileMap[msg.sender_id];
        return {
          id: msg.id,
          text: msg.text,
          sender: msg.sender_id === userProfile.id ? 'us' : 'them',
          user: profile?.full_name || 'User',
          avatar: profile?.photo_url || 'https://via.placeholder.com/150'
        };
      });
      setMessages(formatted);
    };

    fetchMessages();

    // Subscribe to real-time inserts
    const channel = supabase
      .channel(`chat_${matchData.squad.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_chat',
          filter: `plan_id=eq.${matchData.squad.id}`
        },
        async (payload) => {
          // Fetch the sender's profile using correct column names
          const { data: senderProfile } = await supabase
            .from('perfiles_usuario')
            .select('full_name, photo_url')
            .eq('id', payload.new.sender_id)
            .single();

          const newMsg = {
            id: payload.new.id,
            text: payload.new.text,
            sender: payload.new.sender_id === userProfile.id ? 'us' : 'them',
            user: senderProfile?.full_name || 'User',
            avatar: senderProfile?.photo_url || 'https://via.placeholder.com/150'
          };
          
          setMessages(prev => {
            // Avoid duplicates if we already added it optimistically
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchData.squad.id, userProfile.id]);
  
  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newMsg = {
      id: tempId,
      text: message,
      sender: 'us',
      user: userProfile.name || 'You',
      avatar: userProfile.photo
    };

    // Optimistic update
    setMessages(prev => [...prev, newMsg]);
    setMessage('');

    const { error, data } = await supabase
      .from('mensajes_chat')
      .insert([{
        plan_id: matchData.squad.id,
        sender_id: userProfile.id,
        text: newMsg.text
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Error sending message:', error);
      // Revert optimistic update
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } else {
      // Replace temp ID with real DB ID
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: data.id } : m));
    }
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
        
        {messages.length === 0 ? (
          <div className="empty-chat-state" style={{ textAlign: 'center', marginTop: '40px', color: 'var(--color-gray-400)' }}>
            <p>No hay mensajes aún.</p>
            <p>¡Sé el primero en saludar!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUs = msg.sender === 'us';
            const showAvatar = idx === 0 || messages[idx-1].sender !== msg.sender;
            
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
          })
        )}
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
