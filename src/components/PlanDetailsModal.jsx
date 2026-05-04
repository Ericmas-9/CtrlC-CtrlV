import React from 'react';
import { X, Calendar, MapPin, Users } from 'lucide-react';
import './PlanDetailsModal.css';

const PlanDetailsModal = ({ squad, onClose }) => {
  return (
    <div className="plan-details-overlay">
      <div className="plan-details-card">
        <button className="close-modal-btn" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="modal-header-img" style={{ backgroundImage: `url(${squad.image})` }}>
           <div className="modal-header-gradient"></div>
        </div>

        <div className="modal-content">
          <div className="modal-squad-info">
            <img src={squad.leaderAvatar} alt="Leader" className="modal-leader-avatar" />
            <div>
              <h2 className="modal-squad-name">{squad.squadName}</h2>
              <p className="modal-squad-meta">{squad.meta}</p>
            </div>
          </div>

          <h3 className="modal-plan-title">{squad.planTitle}</h3>
          
          <div className="modal-badges">
            <span className="badge"><Calendar size={14}/> Today</span>
            <span className="badge"><MapPin size={14}/> {squad.location}</span>
            <span className="badge"><Users size={14}/> {squad.membersCount} going</span>
          </div>

          <div className="modal-description">
            <h4>ABOUT THIS PLAN</h4>
            <p>{squad.description}</p>
          </div>

          <div className="modal-tags">
            {squad.tags.map(tag => (
              <span key={tag} className="tag tag-turquoise">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailsModal;
