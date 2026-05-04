import React, { useState } from 'react';
import './CreatePlan.css';
import { MapPin } from 'lucide-react';

const CreatePlan = ({ onCreate, userProfile }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxGroupSize, setMaxGroupSize] = useState(8);
  const [minAge, setMinAge] = useState(21);
  const [maxAge, setMaxAge] = useState(35);
  const [location, setLocation] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const availableTags = ['Sports ⚽', 'Drinking 🍺', 'Music 🎵', 'Outdoors 🌲', 'Chill ☕', 'Beach 🌊', 'Hiking 🥾', 'Padel 🎾', 'Gaming 🎮'];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleUseLocation = () => {
    setLocation('Santa Monica, CA');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    const newSquad = {
      id: `squad-${Date.now()}`,
      squadName: `${userProfile.name}'s Squad`,
      meta: `Ages ${minAge}-${maxAge} · Just created`,
      planTitle: title,
      location: location || 'Santa Monica, CA',
      distance: '0.0 mi',
      membersCount: 1, 
      image: 'https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=500&q=80', 
      leaderAvatar: userProfile.photo,
      tags: selectedTags.map(t => t.split(' ')[0]), 
      description: description || 'Looking to form a squad for this plan!'
    };

    onCreate(newSquad);
    
    // Input cleanup after posting
    setTitle('');
    setDescription('');
    setMaxGroupSize(8);
    setMinAge(21);
    setMaxAge(35);
    setLocation('');
    setSelectedTags([]);
  };

  return (
    <div className="create-plan">
      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-section">
          <h3 className="section-label">PLAN DETAILS</h3>
          
          <div className="input-group">
            <label>ACTIVITY NAME *</label>
            <input 
              type="text" 
              placeholder="e.g. Padel & Beers 🎾" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>DESCRIPTION</label>
            <textarea 
              placeholder="Describe your plan — what's happening, where to meet, what to bring..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            ></textarea>
          </div>

          <div className="input-group">
            <label>LOCATION</label>
            <div className="location-input-container">
              <input 
                type="text" 
                placeholder="Search location..." 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ paddingRight: '100px' }}
              />
              <button type="button" className="use-mine-btn" onClick={handleUseLocation}>
                <MapPin size={12} style={{marginRight: '4px'}}/> Use Mine
              </button>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-label">CONFIGURATION</h3>
          
          <div className="input-group">
            <div className="slider-header">
              <label>Max Group Size</label>
              <span className="slider-value">{maxGroupSize}</span>
            </div>
            <input 
              type="range" 
              min="2" 
              max="20" 
              value={maxGroupSize}
              onChange={(e) => setMaxGroupSize(e.target.value)}
              className="range-slider"
            />
          </div>

          <div className="input-group">
            <div className="slider-header">
              <label>Target Age Range</label>
              <span className="slider-value" style={{color: 'var(--color-amber)'}}>{minAge}-{maxAge}</span>
            </div>
            <div className="age-range-inputs">
              <div className="age-input-box">
                <span>Min:</span>
                <input type="number" value={minAge} onChange={(e)=>setMinAge(e.target.value)} min="18" max="100"/>
              </div>
              <span style={{color: 'var(--color-gray-400)'}}>to</span>
              <div className="age-input-box">
                <span>Max:</span>
                <input type="number" value={maxAge} onChange={(e)=>setMaxAge(e.target.value)} min="18" max="100"/>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>ACTIVITY TAGS ({selectedTags.length})</label>
            <div className="tags-selector">
              {availableTags.map(tag => (
                <button 
                  key={tag} 
                  type="button"
                  className={`tag-select-btn ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-plan-btn" disabled={!title}>
            Post SquadPlan
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlan;
