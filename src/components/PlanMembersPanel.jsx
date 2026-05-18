import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import PublicProfileModal from './PublicProfileModal';
import './PlanMembersPanel.css';

const PlanMembersPanel = ({ planId, creatorId, onClose }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileUserId, setProfileUserId] = useState(null);

  useEffect(() => {
    if (!planId) return;

    const fetchMembers = async () => {
      setLoading(true);

      // Step 1: Get all user_ids that joined this plan
      const { data: memberData, error: memberError } = await supabase
        .from('plan_members')
        .select('user_id')
        .eq('plan_id', planId);

      if (memberError) {
        console.error('Error fetching plan members:', memberError);
        setLoading(false);
        return;
      }

      if (!memberData || memberData.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }

      // Step 2: Batch-fetch profiles for all member user_ids
      const userIds = memberData.map(m => m.user_id);

      // Also include the creator in case they aren't in plan_members
      if (creatorId && !userIds.includes(creatorId)) {
        userIds.unshift(creatorId);
      }

      const { data: profileData, error: profileError } = await supabase
        .from('perfiles_usuario')
        .select('id, full_name, photo_url')
        .in('id', userIds);

      if (profileError) {
        console.error('Error fetching member profiles:', profileError);
        setLoading(false);
        return;
      }

      // Step 3: Order — put creator first
      const sorted = (profileData || []).sort((a, b) => {
        if (a.id === creatorId) return -1;
        if (b.id === creatorId) return 1;
        return 0;
      });

      setMembers(sorted);
      setLoading(false);
    };

    fetchMembers();
  }, [planId, creatorId]);

  return (
    <>
      <div className="members-panel-overlay" onClick={onClose}>
        <div className="members-panel-card" onClick={(e) => e.stopPropagation()}>
          <div className="members-panel-header">
            <h3>
              <Users size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              Miembros
              <span className="mp-count">{loading ? '…' : members.length}</span>
            </h3>
            <button className="mp-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {loading ? (
            <div className="mp-loading">
              {[1, 2, 3].map(i => (
                <div key={i} className="mp-skeleton-row">
                  <div className="mp-skeleton-circle" />
                  <div className="mp-skeleton-text" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-gray-400)' }}>
              No hay miembros aún.
            </div>
          ) : (
            <div className="members-list">
              {members.map(member => (
                <button
                  key={member.id}
                  className="member-item"
                  onClick={() => setProfileUserId(member.id)}
                >
                  <img
                    className="member-avatar"
                    src={member.photo_url || 'https://via.placeholder.com/150'}
                    alt={member.full_name}
                  />
                  <span className="member-name">{member.full_name || 'Usuario'}</span>
                  {member.id === creatorId && (
                    <span className="member-badge-creator">Creador</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {profileUserId && (
        <PublicProfileModal
          userId={profileUserId}
          onClose={() => setProfileUserId(null)}
        />
      )}
    </>
  );
};

export default PlanMembersPanel;
