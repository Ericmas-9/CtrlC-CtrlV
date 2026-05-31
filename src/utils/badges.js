export const BADGES = [
  { id: 'first_join',  icon: '🎉', category: 'join', threshold: 1  },
  { id: 'social',      icon: '🤝', category: 'join', threshold: 5  },
  { id: 'regular',     icon: '⭐', category: 'join', threshold: 10 },
  { id: 'veteran',     icon: '🏆', category: 'join', threshold: 25 },
  { id: 'first_host',  icon: '📋', category: 'host', threshold: 1  },
  { id: 'leader',      icon: '👑', category: 'host', threshold: 3  },
  { id: 'mastermind',  icon: '🧠', category: 'host', threshold: 10 },
];

export const getEarnedBadges = (profile) =>
  BADGES.filter(b => {
    const count = b.category === 'join'
      ? (profile.plansJoined ?? 0)
      : (profile.plansHosted ?? 0);
    return count >= b.threshold;
  });

export const getNewBadges = (oldProfile, newProfile) =>
  BADGES.filter(b => {
    const field = b.category === 'join' ? 'plansJoined' : 'plansHosted';
    return (oldProfile[field] ?? 0) < b.threshold && (newProfile[field] ?? 0) >= b.threshold;
  });
