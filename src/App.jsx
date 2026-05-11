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
import UpdatePassword from './screens/UpdatePassword';
import { supabase } from './utils/supabaseClient';

function App() {
  const { t } = useLanguage();
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [currentTab, setCurrentTab] = useState('discover');
  const [showMatchOverlay, setShowMatchOverlay] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null); 

  const [userProfile, setUserProfile] = useState(null);

  const fetchUserProfile = async (userId, retryCount = 0) => {
    const { data, error } = await supabase
      .from('perfiles_usuario')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && retryCount < 3) {
      // It might take a moment for the profile to be created after signup
      setTimeout(() => fetchUserProfile(userId, retryCount + 1), 1000);
      return;
    }

    if (data && !error) {
      setUserProfile({
        id: data.id,
        name: data.full_name || 'User',
        age: data.age || '',
        city: data.city || '',
        phone: data.phone || '',
        bio: data.bio || '',
        photo: data.photo_url || null,
        plansHosted: data.plans_hosted ?? 0,
        plansJoined: data.plans_joined ?? 0,
        rating: data.rating ?? 0
      });
    } else {
      // Fallback profile if there is a persistent error
      setUserProfile({
        name: 'User',
        age: '',
        city: '',
        phone: '',
        bio: '',
        photo: null,
        plansHosted: 0,
        plansJoined: 0,
        rating: 0
      });
    }
  };

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
        fetchPlans();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
        fetchPlans();
      }
      if (event === 'PASSWORD_RECOVERY') {
        setAuthView('update_password');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('planes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching plans:', error);
      return;
    }

    // Map DB columns to the local squad object shape
    const mapped = data.map(p => ({
      id: p.id,
      squadName: p.squad_name,
      planTitle: p.plan_title,
      description: p.description,
      location: p.location,
      lat: p.lat,
      lng: p.lng,
      minAge: p.min_age,
      maxAge: p.max_age,
      meta: `Ages ${p.min_age}-${p.max_age}`,
      membersCount: p.members_count,
      tags: p.tags || [],
      image: p.image || 'https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=500&q=80',
      leaderAvatar: p.leader_avatar,
      distanceValue: null
    }));

    setSquads(mapped);
  };

  // --- GLOBAL STATE ---


  const [squads, setSquads] = useState([]);

  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);

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
    // Increment plansJoined counter locally and persist to Supabase
    setUserProfile(prev => {
      const updated = { ...prev, plansJoined: (prev.plansJoined ?? 0) + 1 };
      if (prev.id) {
        supabase
          .from('perfiles_usuario')
          .update({ plans_joined: updated.plansJoined })
          .eq('id', prev.id)
          .then(({ error }) => { if (error) console.error('Error updating plans_joined:', error); });
      }
      return updated;
    });
  };

  const handleCreatePlan = async (newPlan) => {
    // Save plan to Supabase
    const { data: inserted, error } = await supabase
      .from('planes')
      .insert([{
        creator_id: userProfile.id,
        squad_name: newPlan.squadName,
        plan_title: newPlan.planTitle,
        description: newPlan.description,
        location: newPlan.location,
        lat: newPlan.lat,
        lng: newPlan.lng,
        min_age: newPlan.minAge || 18,
        max_age: newPlan.maxAge || 99,
        members_count: 1,
        tags: newPlan.tags,
        image: newPlan.image,
        leader_avatar: newPlan.leaderAvatar
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving plan:', error);
      alert('Error al guardar el plan: ' + error.message);
      return;
    }

    // Refresh plans from DB
    await fetchPlans();
    setCurrentTab('discover');

    // Increment plansHosted counter locally and persist to Supabase
    setUserProfile(prev => {
      const updated = { ...prev, plansHosted: (prev.plansHosted ?? 0) + 1 };
      if (prev.id) {
        supabase
          .from('perfiles_usuario')
          .update({ plans_hosted: updated.plansHosted })
          .eq('id', prev.id)
          .then(({ error }) => { if (error) console.error('Error updating plans_hosted:', error); });
      }
      return updated;
    });

    setNotifications(prev => [{
      id: Date.now().toString(),
      type: 'create',
      text: t('postedPlan', { plan: newPlan.planTitle }),
      time: t('justNow'),
      avatar: userProfile.photo
    }, ...prev]);
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
          userProfile={userProfile}
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

  if (!session || authView === 'update_password') {
    return (
      <div className="app-container" style={{ backgroundColor: '#ffffff' }}>
        <StatusBar />
        <main className="main-content-area" style={{ backgroundColor: '#ffffff' }}>
          {authView === 'login' ? (
            <Login onNavigateToRegister={() => setAuthView('register')} />
          ) : authView === 'update_password' ? (
            <UpdatePassword onPasswordUpdated={() => setAuthView('login')} />
          ) : (
            <Register onNavigateToLogin={() => setAuthView('login')} />
          )}
        </main>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="app-container" style={{ backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading profile...</p>
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
