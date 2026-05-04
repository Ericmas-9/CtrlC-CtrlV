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

function App() {
  const [currentTab, setCurrentTab] = useState('discover');
  const [showMatchOverlay, setShowMatchOverlay] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null); 

  // --- GLOBAL STATE ---
  const myPhoto = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80";

  const [userProfile, setUserProfile] = useState({
    name: 'Sofia Martinez',
    age: 26,
    bio: 'Beach lover, padel obsessive, and always down for a spontaneous adventure.',
    tags: ['Music', 'Fitness', 'Travel'],
    photo: myPhoto 
  });

  const [squads, setSquads] = useState([
    {
      id: 'squad-1',
      squadName: 'The Beach Boys',
      meta: 'Ages 22-28 · Active & Social',
      planTitle: 'Sunset Beach Volleyball & Drinks',
      location: 'Santa Monica, CA',
      distance: '2.3 mi',
      membersCount: 4,
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      tags: ['Outdoors', 'Sports', 'Cocktails'],
      description: 'We are setting up a net near Tower 24 at 5 PM. Bringing a cooler with some beers, everyone is welcome to join for some casual 2v2s or 4v4s. Post-game drinks at the pier!'
    },
    {
      id: 'squad-2',
      squadName: 'Weekend Warriors',
      meta: 'Ages 24-32 · Chill Vibes',
      planTitle: 'Sunday Morning Hike & Coffee',
      location: 'Griffith Park',
      distance: '5.1 mi',
      membersCount: 3,
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      tags: ['Hiking', 'Outdoors', 'Coffee'],
      description: 'Doing the main trail up to the observatory. Easy pace, good vibes, grabbing iced lattes at the cafe afterwards. Dogs welcome!'
    },
    {
      id: 'squad-3',
      squadName: 'Padel Pros',
      meta: 'Ages 21-30 · Competitive',
      planTitle: 'Padel Tournament Prep',
      location: 'Venice Beach Courts',
      distance: '1.2 mi',
      membersCount: 2,
      image: "https://images.unsplash.com/photo-1622283084705-cb66fc4ba6e9?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      tags: ['Padel', 'Sports', 'Fitness'],
      description: 'Looking for another duo to practice matches with before the weekend tournament. Intermediate to advanced level preferred.'
    },
    {
      id: 'squad-4',
      squadName: 'Game Night Crew',
      meta: 'Ages 25-35 · Geeks & Gamers',
      planTitle: 'Board Games & Pizza',
      location: 'Downtown LA',
      distance: '10.5 mi',
      membersCount: 5,
      image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffaed?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
      tags: ['Gaming', 'Chill', 'Food'],
      description: 'Hosting a massive game night. We have Catan, Secret Hitler, and Mario Kart. Ordering pizzas around 8 PM. Bring your own drinks!'
    },
    {
      id: 'squad-5',
      squadName: 'Sunset Cruisers',
      meta: 'Ages 20-29 · Adventurous',
      planTitle: 'Rollerblading the Strand',
      location: 'Hermosa Beach',
      distance: '12.0 mi',
      membersCount: 3,
      image: "https://images.unsplash.com/photo-1551024506-0cb9a475d40a?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
      tags: ['Sports', 'Beach', 'Outdoors'],
      description: 'Cruising down to Manhattan beach and back. Will probably stop for tacos along the way. All skill levels welcome, we go at a chill pace.'
    },
    {
      id: 'squad-6',
      squadName: 'The Foodies',
      meta: 'Ages 26-38 · Food & Culture',
      planTitle: 'Night Market Crawl',
      location: 'Arts District',
      distance: '14.2 mi',
      membersCount: 4,
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      tags: ['Food', 'Drinks', 'Chill'],
      description: 'Going to hit up 3-4 different food stands. Goal is to share everything so we can try as much as possible!'
    },
    {
      id: 'squad-7',
      squadName: 'Surf & Sand',
      meta: 'Ages 22-30 · Early Birds',
      planTitle: 'Dawn Patrol Surf Session',
      location: 'Malibu Surfrider',
      distance: '18.4 mi',
      membersCount: 2,
      image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      tags: ['Beach', 'Sports', 'Outdoors'],
      description: 'Swipes up if you like waking up at 5:30 AM. Waves should be 3-4ft. Hitting the breakfast burrito spot after.'
    },
    {
      id: 'squad-8',
      squadName: 'Creative Collective',
      meta: 'Ages 24-34 · Artsy',
      planTitle: 'Pottery & Wine Night',
      location: 'Silver Lake',
      distance: '15.1 mi',
      membersCount: 3,
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      tags: ['Art', 'Drinks', 'Chill'],
      description: 'Booked a private table at the clay studio. Bring your favorite bottle of wine. Let’s get messy and make some weird mugs.'
    },
    {
      id: 'squad-9',
      squadName: 'Rave Fam',
      meta: 'Ages 21-29 · Night Owls',
      planTitle: 'Underground Techno Showcase',
      location: 'Warehouse District',
      distance: '11.8 mi',
      membersCount: 6,
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
      leaderAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
      tags: ['Music', 'Dancing', 'Drinks'],
      description: 'Got tickets to the secret location drop. Pre-game at our spot at 10 PM. Looking for fun energy to join the crew.'
    },
    {
      id: 'squad-10',
      squadName: 'The Yogis',
      meta: 'Ages 23-35 · Wellness',
      planTitle: 'Sunset Beach Yoga Flow',
      location: 'Santa Monica Beach',
      distance: '1.5 mi',
      membersCount: 8,
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80", // reused beach pic
      leaderAvatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80',
      tags: ['Fitness', 'Beach', 'Chill'],
      description: 'Leading a gentle 60-minute Vinyasa flow right as the sun goes down. Bring a mat or towel. Donations appreciated but not required!'
    }
  ]);

  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      type: 'join',
      text: 'Marta joined your plan: Sunset Volleyball',
      time: '2m ago',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    }
  ]);

  // --- HANDLERS ---
  const handleLike = (squad) => {
    // Add Notification
    const newNotif = {
      id: Date.now().toString(),
      type: 'like',
      text: `You liked ${squad.squadName}'s plan: ${squad.planTitle}`,
      time: 'Just now',
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
      lastActive: 'Just now'
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
      text: `You successfully posted a new plan: ${newPlan.planTitle}`,
      time: 'Just now',
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
          onLogout={() => {
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
      case 'create': return 'Create a Plan';
      case 'matches': return 'My Plans & Matches';
      case 'profile': return 'My Profile';
      case 'notifications': return 'Notifications';
      case 'settings': return 'Settings & Preferences';
      default: return null;
    }
  };
  
  const getTopBarSubtitle = () => {
    if (currentTab === 'create') return "Tell others what you're planning";
    if (currentTab === 'matches') return 'Active chats & pending requests';
    if (currentTab === 'profile') return 'Individual identity & vibes';
    return null;
  }

  const activeChatData = matches.find(m => m.id === activeChatId);
  const hideTopBar = activeChatId || currentTab === 'settings' || currentTab === 'notifications';
  const hideBottomNav = activeChatId;

  return (
    <div className="app-container">
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
        {renderScreen()}
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
