import React, { useState } from 'react';
import './index.css';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import SquadFeed from './screens/SquadFeed';
import SquadChat from './screens/SquadChat';
import MatchOverlay from './components/MatchOverlay';
import CreatePlan from './screens/CreatePlan';
import Profile from './screens/Profile';
import Matches from './screens/Matches';
import Notifications from './screens/Notifications';
import PlanDetailsModal from './components/PlanDetailsModal';
import Settings from './screens/Settings';
import StatusBar from './components/StatusBar';
import { useLanguage } from './i18n/LanguageContext';
import Login from './screens/Login';
import Register from './screens/Register';
import { supabase } from './utils/supabaseClient';

function App() {
  const { t } = useLanguage();
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [currentTab, setCurrentTab] = useState('discover');
  const [showMatchOverlay, setShowMatchOverlay] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null); 

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- GLOBAL STATE ---
  const myPhoto = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80";

  const [userProfile, setUserProfile] = useState({
    name: 'Sofia Martinez',
    age: 26,
    bio: '',
    bioKey: 'user_bio',
    tags: ['Music', 'Fitness', 'Travel'],
    photo: myPhoto 
  });

  const [squads, setSquads] = useState([
    {
      id: 'squad-1',
      squadName: 'The Beach Boys',
      metaKey: 'sq1_meta',
      titleKey: 'sq1_title',
      location: 'Santa Monica, CA',
      lat: 34.0052, lng: -118.4975,
      distanceValue: '2.3',
      membersCount: 4,
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      tags: ['Outdoors', 'Sports', 'Cocktails'],
      descKey: 'sq1_desc'
    },
    {
      id: 'squad-2',
      squadName: 'Weekend Warriors',
      metaKey: 'sq2_meta',
      titleKey: 'sq2_title',
      location: 'Griffith Park',
      lat: 34.1184, lng: -118.3004,
      distanceValue: '5.1',
      membersCount: 3,
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      tags: ['Hiking', 'Outdoors', 'Coffee'],
      descKey: 'sq2_desc'
    },
    {
      id: 'squad-3',
      squadName: 'Padel Pros',
      metaKey: 'sq3_meta',
      titleKey: 'sq3_title',
      location: 'Venice Beach Courts',
      lat: 33.9850, lng: -118.4695,
      distanceValue: '1.2',
      membersCount: 2,
      image: "https://images.unsplash.com/photo-1622283084705-cb66fc4ba6e9?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      tags: ['Padel', 'Sports', 'Fitness'],
      descKey: 'sq3_desc'
    },
    {
      id: 'squad-4',
      squadName: 'Game Night Crew',
      metaKey: 'sq4_meta',
      titleKey: 'sq4_title',
      location: 'Downtown LA',
      lat: 34.0430, lng: -118.2673,
      distanceValue: '10.5',
      membersCount: 5,
      image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffaed?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
      tags: ['Gaming', 'Chill', 'Food'],
      descKey: 'sq4_desc'
    },
    {
      id: 'squad-5',
      squadName: 'Sunset Cruisers',
      metaKey: 'sq5_meta',
      titleKey: 'sq5_title',
      location: 'Hermosa Beach',
      lat: 33.8620, lng: -118.4000,
      distanceValue: '12.0',
      membersCount: 3,
      image: "https://images.unsplash.com/photo-1551024506-0cb9a475d40a?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
      tags: ['Sports', 'Beach', 'Outdoors'],
      descKey: 'sq5_desc'
    },
    {
      id: 'squad-6',
      squadName: 'The Foodies',
      metaKey: 'sq6_meta',
      titleKey: 'sq6_title',
      location: 'Arts District',
      lat: 34.0406, lng: -118.2357,
      distanceValue: '14.2',
      membersCount: 4,
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      tags: ['Food', 'Drinks', 'Chill'],
      descKey: 'sq6_desc'
    },
    {
      id: 'squad-7',
      squadName: 'Surf & Sand',
      metaKey: 'sq7_meta',
      titleKey: 'sq7_title',
      location: 'Malibu Surfrider',
      lat: 34.0360, lng: -118.6919,
      distanceValue: '18.4',
      membersCount: 2,
      image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      tags: ['Beach', 'Sports', 'Outdoors'],
      descKey: 'sq7_desc'
    },
    {
      id: 'squad-8',
      squadName: 'Creative Collective',
      metaKey: 'sq8_meta',
      titleKey: 'sq8_title',
      location: 'Silver Lake',
      lat: 34.0869, lng: -118.2737,
      distanceValue: '15.1',
      membersCount: 3,
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      tags: ['Art', 'Drinks', 'Chill'],
      descKey: 'sq8_desc'
    },
    {
      id: 'squad-9',
      squadName: 'Rave Fam',
      metaKey: 'sq9_meta',
      titleKey: 'sq9_title',
      location: 'Warehouse District',
      lat: 34.0422, lng: -118.2380,
      distanceValue: '11.8',
      membersCount: 6,
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
      tags: ['Music', 'Dancing', 'Drinks'],
      descKey: 'sq9_desc'
    },
    {
      id: 'squad-10',
      squadName: 'The Yogis',
      metaKey: 'sq10_meta',
      titleKey: 'sq10_title',
      location: 'Santa Monica Beach',
      lat: 34.0100, lng: -118.4965,
      distanceValue: '1.5',
      membersCount: 8,
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80", 
      leaderAvatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80',
      tags: ['Fitness', 'Beach', 'Chill'],
      descKey: 'sq10_desc'
    }
  ]);

  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      type: 'join',
      text: t('userJoined', { user: 'Marta', plan: t('sq1_title') || 'Sunset Volleyball' }),
      time: t('minsAgo'),
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    }
  ]);

  // --- HANDLERS ---
  const handleLike = (squad) => {
    // Add Notification
    const newNotif = {
      id: Date.now().toString(),
      type: 'like',
      text: t('youLiked', { squad: squad.squadName, plan: squad.titleKey ? t(squad.titleKey) : squad.planTitle }),
      time: t('justNow'),
      avatar: squad.leaderAvatar
    };
    setNotifications([newNotif, ...notifications]);

    // Simulate Match
    setShowMatchOverlay(squad);
  };

  const handleOpenChatFromMatch = (squad) => {
    const newMatch = {
      id: `match-${Date.now()}`,
      squad: squad,
      messages: [
        { id: 1, text: "Hey guys! We matched! Stoked for the plan.", sender: 'them', user: 'Mike', avatar: squad.leaderAvatar }
      ],
      lastActive: t('justNow')
    };
    setMatches([newMatch, ...matches]);
    setShowMatchOverlay(false);
    setActiveChatId(newMatch.id);
  };

  const handleCreatePlan = (newPlan) => {
    setSquads([newPlan, ...squads]);
    setCurrentTab('discover'); 
    
    setNotifications([{
      id: Date.now().toString(),
      type: 'create',
      text: t('postedPlan', { plan: newPlan.planTitle || newPlan.titleKey }),
      time: t('justNow'),
      avatar: userProfile.photo
    }, ...notifications]);
  };

  const handleOpenInfo = (squad) => {
    setSelectedPlanDetails(squad);
  };

  // --- RENDER LOGIC ---
  const renderScreen = () => {
    switch (currentTab) {
      case 'discover':
        return <SquadFeed squads={squads} onLike={handleLike} onInfo={handleOpenInfo} />;
      case 'create':
        return <CreatePlan onCreate={handleCreatePlan} userProfile={userProfile} />;
      case 'matches':
        return <Matches matches={matches} onOpenChat={(id) => setActiveChatId(id)} />;
      case 'profile':
        return <Profile userProfile={userProfile} setUserProfile={setUserProfile} />;
      case 'notifications':
        return <Notifications notifications={notifications} onClose={() => setCurrentTab('discover')} />;
      case 'settings':
        return <Settings 
          onBack={() => setCurrentTab('discover')} 
          onLogout={async () => {
            await supabase.auth.signOut();
            setCurrentTab('discover');
            setNotifications([]);
            setMatches([]);
          }}
        />;
      default:
        return <SquadFeed squads={squads} onLike={handleLike} onInfo={handleOpenInfo} />;
    }
  };

  const getTopBarTitle = () => {
    switch (currentTab) {
      case 'discover': return null; 
      case 'create': return t('createPlanTitle');
      case 'matches': return t('matchesTitle');
      case 'profile': return t('profileTitle');
      case 'notifications': return t('notificationsTitle');
      case 'settings': return t('settingsTitle');
      default: return null;
    }
  };
  
  const getTopBarSubtitle = () => {
    if (currentTab === 'create') return t('createPlanSubtitle');
    if (currentTab === 'matches') return t('matchesSubtitle');
    if (currentTab === 'profile') return t('profileSubtitle');
    return null;
  }

  const activeChatData = matches.find(m => m.id === activeChatId);
  const hideTopBar = activeChatId || currentTab === 'settings' || currentTab === 'notifications';
  const hideBottomNav = activeChatId;

  if (!session) {
    return (
      <div className="app-container" style={{ backgroundColor: '#ffffff' }}>
        <StatusBar />
        <main className="main-content-area" style={{ backgroundColor: '#ffffff' }}>
          {authView === 'login' ? (
            <Login onNavigateToRegister={() => setAuthView('register')} />
          ) : (
            <Register onNavigateToLogin={() => setAuthView('login')} />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <StatusBar />
      
      {/* Top Bar Area */}
      {!hideTopBar && (
        <TopBar 
          title={getTopBarTitle()} 
          subtitle={getTopBarSubtitle()}
          onOpenNotifications={() => setCurrentTab('notifications')}
          onOpenSettings={() => setCurrentTab('settings')}
          hasNotifications={notifications.length > 0}
        />
      )}
      
      {/* Main Content Area: Enforces Scrolling */}
      <main className="main-content-area">
        <div key={currentTab} className="fade-in">
          {renderScreen()}
        </div>
      </main>

      {/* Bottom Navigation Area */}
      {!hideBottomNav && (
        <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
      )}

      {/* Match Overlay (Full Screen Modal) */}
      {showMatchOverlay && (
        <MatchOverlay 
          squad={showMatchOverlay}
          onClose={() => setShowMatchOverlay(false)} 
          onOpenChat={() => handleOpenChatFromMatch(showMatchOverlay)}
          image1={showMatchOverlay.image}
          image2={userProfile.photo}
        />
      )}

      {/* Info Modal (Overlay) */}
      {selectedPlanDetails && (
        <PlanDetailsModal 
          squad={selectedPlanDetails} 
          onClose={() => setSelectedPlanDetails(null)}
          onJoin={() => {
            handleLike(selectedPlanDetails);
            setSelectedPlanDetails(null);
          }}
        />
      )}

      {/* Active Chat Screen (Full Screen Overlay) */}
      {activeChatId && activeChatData && (
        <SquadChat 
          matchData={activeChatData} 
          userProfile={userProfile}
          onBack={() => setActiveChatId(null)} 
          onUpdateMessages={(newMessages) => {
            const updatedMatches = matches.map(m => 
              m.id === activeChatId ? { ...m, messages: newMessages } : m
            );
            setMatches(updatedMatches);
          }}
        />
      )}
    </div>
  );
}

export default App;
