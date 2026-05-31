import React, { useState, useCallback } from 'react';
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
import RatingModal from './components/RatingModal';
import EventGalleryModal from './components/EventGalleryModal';
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
  const [activeChatData, setActiveChatData] = useState(null); // BUG FIX: dedicated state to avoid race condition
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null); 

  const [userProfile, setUserProfile] = useState(null);
  const [, setProfileLoading] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState(null);
  const [usersInCity, setUsersInCity] = useState(0);

  const fetchUsersInCity = async (city, excludeUserId) => {
    if (!city) return;
    let query = supabase
      .from('perfiles_usuario')
      .select('id', { count: 'exact', head: true })
      .ilike('city', `%${city}%`);
    if (excludeUserId) query = query.neq('id', excludeUserId);
    const { count, error } = await query;
    if (!error) setUsersInCity(count || 0);
  };

  // Helper: map a perfiles_usuario row to our local profile shape
  const mapProfileRow = (data, userId) => ({
    id: data.id || userId,
    name: data.full_name || 'User',
    age: data.age || '',
    city: data.city || '',
    bio: data.bio || '',
    photo: data.photo_url || null,
    plansHosted: data.plans_hosted ?? 0,
    plansJoined: data.plans_joined ?? 0,
    rating: data.rating ?? 0
  });

  const clearSupabaseStorage = () => {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.error('Could not clear local storage', e);
    }
  };

  const fetchUserProfile = useCallback(async (userId, userEmail) => {
    setProfileLoading(true);
    setProfileLoadError(null);

    try {
      // Step 1: Try to fetch the existing profile
      const { data, error } = await supabase
        .from('perfiles_usuario')
        .select('*')
        .eq('id', userId)
        .maybeSingle();  // returns null instead of error when no rows

      if (error) {
        // Real Supabase error (network, RLS, etc.) — surface it
        throw new Error(error.message || 'Error al cargar el perfil.');
      }

      if (data) {
        // Existing profile found — use it
        const profile = mapProfileRow(data, userId);
        setUserProfile(profile);
        if (data.city) fetchUsersInCity(data.city, userId);
      } else {
        // No profile row exists → brand-new user. Auto-insert one.
        console.info('No profile found for user, auto-creating...');
        const newRow = {
          id: userId,
          full_name: userEmail?.split('@')[0] || 'Nuevo Usuario',
          photo_url: null,
          age: null,
          city: '',
          bio: '',
          rating: 0,
          plans_hosted: 0,
          plans_joined: 0
        };

        const { data: inserted, error: insertError } = await supabase
          .from('perfiles_usuario')
          .insert([newRow])
          .select()
          .single();

        if (insertError) {
          throw new Error('No se pudo crear el perfil: ' + insertError.message);
        }

        setUserProfile(mapProfileRow(inserted, userId));
      }
    } catch (err) {
      console.error('fetchUserProfile failed:', err);
      setProfileLoadError(err.message || 'Error desconocido al cargar el perfil.');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Forcefully clear everything so the user MUST log in every time they enter the app
    setSession(null);
    setUserProfile(null);
    clearSupabaseStorage();
    supabase.auth.signOut().catch(e => console.error("SignOut error:", e));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Ignore INITIAL_SESSION because we want to force a fresh login
      if (event === 'INITIAL_SESSION') {
        return;
      }
      
      setSession(session);
      if (session) {
        try {
          const savedNotifs = localStorage.getItem(`squadup_notifs_${session.user.id}`);
          if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
          const lastSeen = localStorage.getItem(`squadup_lastseen_${session.user.id}`);
          if (lastSeen) setLastSeenNotifTime(lastSeen);
          const savedPassed = localStorage.getItem(`squadup_passed_${session.user.id}`);
          if (savedPassed) setPassedPlanIds(new Set(JSON.parse(savedPassed)));
        } catch (e) { /* ignore corrupt data */ }
        fetchUserProfile(session.user.id, session.user.email);
        const fetchedSquads = await fetchPlans();
        if (fetchedSquads) {
          const joinedIds = await fetchJoinedPlans(session.user.id, fetchedSquads);
          fetchPendingRatings(session.user.id);
          if (joinedIds) checkEventReminders(session.user.id, fetchedSquads, joinedIds);
        }
      }
      if (event === 'PASSWORD_RECOVERY') {
        setAuthView('update_password');
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserProfile]);

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
      creatorId: p.creator_id,
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
      maxMembers: p.max_members,
      tags: p.tags || [],
      image: p.image || 'https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=500&q=80',
      leaderAvatar: p.leader_avatar,
      eventDate: p.event_date,
      distanceValue: null
    }));

    setSquads(mapped);
    return mapped;
  };

  const fetchJoinedPlans = async (userId, allSquads) => {
    const { data, error } = await supabase
      .from('plan_members')
      .select('plan_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching joined plans:', error);
      return;
    }

    const joinedIds = new Set(data.map(d => d.plan_id));
    setJoinedPlanIds(joinedIds);

    // Rebuild the matches array from the joined plan IDs.
    // STRICT SEPARATION: exclude plans the user CREATED — those belong in
    // "Mis Planes" (userPlans), NOT in "Otros Planes" (matches).
    const userMatches = data.map(d => {
      const squad = allSquads.find(s => s.id === d.plan_id);
      if (!squad) return null;
      // Skip plans where this user is the creator
      if (squad.creatorId === userId) return null;
      return {
        id: `match-${squad.id}`,
        squad: squad,
        messages: [], // We will fetch messages directly in SquadChat now
        lastActive: 'Active'
      };
    }).filter(Boolean);

    setMatches(userMatches);
    return joinedIds;
  };

  // --- GLOBAL STATE ---


  const [squads, setSquads] = useState([]);
  const [matches, setMatches] = useState([]);
  const [joinedPlanIds, setJoinedPlanIds] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [lastSeenNotifTime, setLastSeenNotifTime] = useState(null);
  // feedKey forces SquadFeed to remount (resetting its internal currentIndex)
  // every time the user hits Recargar, so new cards are visible immediately.
  const [feedKey, setFeedKey] = useState(0);

  // --- SWIPE HISTORY STATE ---
  const [passedPlanIds, setPassedPlanIds] = useState(new Set());

  // --- GALLERY STATE ---
  const [galleryPlan, setGalleryPlan] = useState(null);

  // --- RATING STATE ---
  const [pendingRatings, setPendingRatings] = useState([]); // plans to rate (modal queue)
  const [ratedPlanIds, setRatedPlanIds] = useState(new Set()); // already rated this session

  // --- RATING HANDLERS ---
  const fetchPendingRatings = async (userId) => {
    // 1. Plans the user has joined
    const { data: memberships } = await supabase
      .from('plan_members')
      .select('plan_id')
      .eq('user_id', userId);

    if (!memberships?.length) return;
    const joinedIds = memberships.map(m => m.plan_id);

    // 2. Past plans (event already happened), not created by this user
    const { data: pastPlans } = await supabase
      .from('planes')
      .select('*')
      .in('id', joinedIds)
      .neq('creator_id', userId)
      .lt('event_date', new Date().toISOString())
      .not('event_date', 'is', null);

    if (!pastPlans?.length) return;

    // 3. Already rated by this user
    const { data: existingRatings } = await supabase
      .from('plan_ratings')
      .select('plan_id')
      .eq('user_id', userId);

    const ratedIds = new Set(existingRatings?.map(r => r.plan_id) || []);
    setRatedPlanIds(ratedIds);

    // 4. Map to local shape and filter unrated
    const pending = pastPlans
      .filter(p => !ratedIds.has(p.id))
      .map(p => ({
        id: p.id,
        planTitle: p.plan_title,
        image: p.image,
        creatorId: p.creator_id,
      }));

    if (pending.length > 0) setPendingRatings(pending);
  };

  const handleSubmitRating = async (plan, stars, comment) => {
    const { error } = await supabase
      .from('plan_ratings')
      .insert([{ plan_id: plan.id, user_id: session.user.id, stars, comment: comment || null }]);

    if (error) {
      console.error('Error saving rating:', error);
      return;
    }

    setRatedPlanIds(prev => new Set([...prev, plan.id]));
    setPendingRatings(prev => prev.filter(p => p.id !== plan.id));
  };

  const handleSkipRating = (planId) => {
    // Remove from auto-modal queue; the button in Matches tab stays available
    setPendingRatings(prev => prev.filter(p => p.id !== planId));
  };

  const handleRatePlanFromMatches = (squad) => {
    // Triggered when user clicks "Rate" button in the Matches tab
    const planForRating = {
      id: squad.id,
      planTitle: squad.planTitle,
      image: squad.image,
      creatorId: squad.creatorId,
    };
    setPendingRatings(prev => [planForRating, ...prev.filter(p => p.id !== squad.id)]);
  };

  // --- SWIPE HISTORY HANDLERS ---
  const handlePass = (squad) => {
    if (!squad?.id || !session?.user?.id) return;
    setPassedPlanIds(prev => {
      const next = new Set([...prev, squad.id]);
      try {
        localStorage.setItem(`squadup_passed_${session.user.id}`, JSON.stringify([...next]));
      } catch (e) { /* ignore */ }
      return next;
    });
  };

  const handleUndoPass = (planId) => {
    setPassedPlanIds(prev => {
      const next = new Set(prev);
      next.delete(planId);
      try {
        localStorage.setItem(`squadup_passed_${session.user.id}`, JSON.stringify([...next]));
      } catch (e) { /* ignore */ }
      return next;
    });
  };

  // --- EVENT REMINDERS ---
  const checkEventReminders = (userId, plans, joinedIds) => {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    let reminded = [];
    try {
      reminded = JSON.parse(localStorage.getItem(`squadup_reminded_${userId}`) || '[]');
    } catch (e) { /* ignore */ }
    const remindedSet = new Set(reminded);

    const toRemind = plans.filter(p => {
      if (!p.eventDate || !joinedIds.has(p.id)) return false;
      const d = new Date(p.eventDate);
      return d > now && d <= in24h && !remindedSet.has(p.id);
    });

    if (toRemind.length === 0) return;

    const newNotifs = toRemind.map(p => {
      const hoursLeft = Math.max(1, Math.round((new Date(p.eventDate) - now) / 3600000));
      return {
        id: `reminder-${p.id}`,
        type: 'reminder',
        text: t('eventReminder', { plan: p.planTitle, hours: hoursLeft }),
        time: new Date().toISOString(),
        avatar: p.image
      };
    });

    setNotifications(prev => [...newNotifs, ...prev].slice(0, 50));
    try {
      localStorage.setItem(
        `squadup_reminded_${userId}`,
        JSON.stringify([...remindedSet, ...toRemind.map(p => p.id)])
      );
    } catch (e) { /* ignore */ }
  };

  // --- HANDLERS ---
  const handleLike = async (squad) => {
    // Mark plan as joined immediately so it never reappears in the feed
    setJoinedPlanIds(prev => new Set([...prev, squad.id]));

    // Add Notification
    const newNotif = {
      id: Date.now().toString(),
      type: 'like',
      text: t('youLiked', { squad: squad.squadName, plan: squad.titleKey ? t(squad.titleKey) : squad.planTitle }),
      time: new Date().toISOString(),
      avatar: squad.leaderAvatar
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));

    // Build the optimistic match entry.
    // STRICT SEPARATION: never add a match for a plan the current user created —
    // those live exclusively in "Mis Planes" (userPlans), not "Otros Planes" (matches).
    const newMatch = {
      id: `match-${squad.id}`,
      squad: squad,
      messages: [],
      lastActive: t('justNow')
    };
    if (squad.creatorId !== session?.user?.id) {
      setMatches(prev => [newMatch, ...prev]);
    }

    // Optimistically bump membersCount so badge updates instantly
    setSquads(prev => prev.map(s => s.id === squad.id ? { ...s, membersCount: (s.membersCount || 0) + 1 } : s));

    // Save the join to Supabase
    if (session?.user?.id) {
      const { error } = await supabase
        .from('plan_members')
        .insert([{ plan_id: squad.id, user_id: session.user.id }]);
      if (error) console.error('Error joining plan in DB:', error);
    }

    // Increment members_count atomically via RPC (SECURITY DEFINER bypasses RLS)
    if (squad.id) {
      const { error: rpcError } = await supabase.rpc('increment_members_count', { plan_id: squad.id });
      if (rpcError) {
        console.error('Error incrementing members_count via rpc:', rpcError);
      } else {
        // Refresh plans AND joined-plans so both lists stay consistent
        const refreshed = await fetchPlans();
        if (refreshed && session?.user?.id) {
          await fetchJoinedPlans(session.user.id, refreshed);
        }
      }
    }

    // Increment plansJoined counter on the user profile
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

    // Show the SquadMatch overlay
    setShowMatchOverlay({ squad, matchId: newMatch.id });
  };

  const handleOpenChatFromMatch = (matchData) => {
    const matchId = matchData.matchId || matches[0]?.id;
    // BUG FIX: find the actual match object and set activeChatData atomically
    const foundMatch = matches.find(m => m.id === matchId) || matches[0];
    setShowMatchOverlay(false);
    setActiveChatId(matchId);
    setActiveChatData(foundMatch);
  };

  const handleCreatePlan = async (newPlan) => {
    // Save plan to Supabase
    const { data: createdPlan, error } = await supabase
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
        max_members: newPlan.maxGroupSize,
        members_count: 1,
        tags: newPlan.tags,
        image: newPlan.image,
        leader_avatar: newPlan.leaderAvatar,
        event_date: newPlan.eventDate || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving plan:', error);
      alert('Error al guardar el plan: ' + error.message);
      return;
    }

    // Insert creator into plan_members so RLS allows them to send chat messages
    if (createdPlan?.id) {
      await supabase
        .from('plan_members')
        .insert([{ plan_id: createdPlan.id, user_id: userProfile.id }]);
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
      time: new Date().toISOString(),
      avatar: userProfile.photo
    }, ...prev].slice(0, 50));
  };

  const handleOpenInfo = (squad) => {
    setSelectedPlanDetails(squad);
  };

  const handleUpdatePlan = async (planId, updates) => {
    const dbUpdates = {};
    if (updates.eventDate !== undefined) dbUpdates.event_date = updates.eventDate;
    if (updates.maxMembers !== undefined) dbUpdates.max_members = updates.maxMembers;
    if (updates.minAge !== undefined) dbUpdates.min_age = updates.minAge;
    if (updates.maxAge !== undefined) dbUpdates.max_age = updates.maxAge;

    const { error } = await supabase
      .from('planes')
      .update(dbUpdates)
      .eq('id', planId);

    if (error) {
      console.error('Error updating plan:', error);
      alert('Error al actualizar el plan: ' + error.message);
      return;
    }
    await fetchPlans();
  };

  const handleDeletePlan = async (planId) => {
    const { error } = await supabase
      .from('planes')
      .delete()
      .eq('id', planId);

    if (error) {
      console.error('Error deleting plan:', error);
      alert('Error al eliminar el plan: ' + error.message);
      return;
    }
    await fetchPlans();
  };

  // ── Refs per evitar closures obsoletes a la subscripció de missatges ──
  const joinedPlanIdsRef = React.useRef(joinedPlanIds);
  React.useEffect(() => { joinedPlanIdsRef.current = joinedPlanIds; }, [joinedPlanIds]);
  const squadsRef = React.useRef(squads);
  React.useEffect(() => { squadsRef.current = squads; }, [squads]);
  const activeChatDataRef = React.useRef(activeChatData);
  React.useEffect(() => { activeChatDataRef.current = activeChatData; }, [activeChatData]);
  const sessionRef = React.useRef(session);
  React.useEffect(() => { sessionRef.current = session; }, [session]);

  // ── Persistir notificacions a localStorage ──
  React.useEffect(() => {
    if (!session?.user?.id || notifications.length === 0) return;
    try {
      localStorage.setItem(`squadup_notifs_${session.user.id}`, JSON.stringify(notifications.slice(0, 50)));
    } catch (e) { /* ignore */ }
  }, [notifications, session?.user?.id]);

  // ── Subscripció a nous missatges de xat → notificació ──
  React.useEffect(() => {
    if (!session?.user?.id) return;
    const channel = supabase
      .channel('message-notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes_chat' },
        async (payload) => {
          const msg = payload.new;
          const s = sessionRef.current;
          if (!s?.user?.id || msg.sender_id === s.user.id) return;
          const currentSquads = squadsRef.current;
          const currentJoined = joinedPlanIdsRef.current;
          const isJoined = currentJoined.has(msg.plan_id);
          const isCreator = currentSquads.some(sq => sq.id === msg.plan_id && sq.creatorId === s.user.id);
          if (!isJoined && !isCreator) return;
          if (activeChatDataRef.current?.squad?.id === msg.plan_id) return;

          const { data: sender } = await supabase
            .from('perfiles_usuario').select('full_name, photo_url').eq('id', msg.sender_id).single();
          const plan = currentSquads.find(sq => sq.id === msg.plan_id);
          const msgPreview = msg.text.length > 40 ? msg.text.slice(0, 40) + '…' : msg.text;

          setNotifications(prev => [{
            id: `msg-${msg.id}`,
            type: 'message',
            text: `${sender?.full_name || '?'} · ${plan?.planTitle || '?'}: "${msgPreview}"`,
            time: new Date().toISOString(),
            avatar: sender?.photo_url || 'https://via.placeholder.com/150',
          }, ...prev].slice(0, 50));
        })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [session?.user?.id]);

  // ── Obrir notificacions i netejar el badge ──
  const handleOpenNotifications = () => {
    setCurrentTab('notifications');
    const now = new Date().toISOString();
    setLastSeenNotifTime(now);
    if (session?.user?.id) {
      localStorage.setItem(`squadup_lastseen_${session.user.id}`, now);
    }
  };

  // ── Nombre de notificacions no llegides (per al badge) ──
  const unreadCount = React.useMemo(() => {
    if (!lastSeenNotifTime) return notifications.length;
    return notifications.filter(n =>
      !n.time?.includes?.('T') || n.time > lastSeenNotifTime
    ).length;
  }, [notifications, lastSeenNotifTime]);

  // --- RENDER LOGIC ---
  const renderScreen = () => {
    switch (currentTab) {
      case 'discover': {
        const filteredSquads = squads.filter(s => {
          // Don't show the user's own plans
          if (s.creatorId === userProfile.id) return false;
          // Don't show plans the user has already joined
          if (joinedPlanIds.has(s.id)) return false;
          // Don't show plans the user passed (swiped left)
          if (passedPlanIds.has(s.id)) return false;
          // Don't show full plans
          if (s.maxMembers && s.membersCount >= s.maxMembers) return false;
          // Don't show plans outside the user's age range
          const userAge = parseInt(userProfile.age);
          if (userAge && s.minAge && s.maxAge) {
            if (userAge < s.minAge || userAge > s.maxAge) return false;
          }
          return true;
        });
        const likedTags = new Set(matches.flatMap(m => m.squad?.tags || []));
        return <SquadFeed
          key={feedKey}
          squads={filteredSquads}
          onLike={handleLike}
          onPass={handlePass}
          onInfo={handleOpenInfo}
          usersInCity={usersInCity}
          userCity={userProfile.city}
          likedTags={likedTags}
          onReload={async () => {
            // Increment feedKey so SquadFeed remounts completely,
            // resetting its internal currentIndex to 0 and showing fresh cards.
            setFeedKey(prev => prev + 1);
            // Re-fetch ALL plans from Supabase so rows created by other users appear.
            const refreshed = await fetchPlans();
            if (refreshed && session?.user?.id) {
               await fetchJoinedPlans(session.user.id, refreshed);
            }
          }}
        />;
      }
      case 'create':
        return <CreatePlan onCreate={handleCreatePlan} userProfile={userProfile} />;
      case 'matches': {
        const allUserPlans = squads.filter(s => s.creatorId === userProfile.id);
        const otherMatches = matches.filter(m => m.squad?.creatorId !== userProfile.id);
        const passedSquads = squads.filter(s => passedPlanIds.has(s.id));
        return <Matches
          matches={otherMatches}
          onOpenChat={(id) => {
            const found = otherMatches.find(m => m.id === id);
            setActiveChatId(id);
            setActiveChatData(found);
          }}
          userPlans={allUserPlans}
          onInfo={handleOpenInfo}
          onUpdatePlan={handleUpdatePlan}
          onDeletePlan={handleDeletePlan}
          ratedPlanIds={ratedPlanIds}
          onRatePlan={handleRatePlanFromMatches}
          passedSquads={passedSquads}
          onUndoPass={handleUndoPass}
          onOpenGallery={setGalleryPlan}
        />;
      }
      case 'profile': {
        const now = new Date();
        const pastHosted = squads
          .filter(s => s.creatorId === userProfile.id && s.eventDate && new Date(s.eventDate) < now)
          .map(s => ({ ...s, role: 'organizer' }));
        const pastJoined = matches
          .filter(m => m.squad?.creatorId !== userProfile.id && m.squad?.eventDate && new Date(m.squad.eventDate) < now)
          .map(m => ({ ...m.squad, role: 'participant' }));
        const planHistory = [...pastHosted, ...pastJoined]
          .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
          .slice(0, 5);
        return <Profile
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          planHistory={planHistory}
        />;
      }
      case 'notifications':
        return <Notifications notifications={notifications} onClose={() => setCurrentTab('discover')} />;
      case 'settings': {
        const now2 = new Date();
        const settingsHistory = [
          ...squads.filter(s => s.creatorId === userProfile.id && s.eventDate && new Date(s.eventDate) < now2)
                   .map(s => ({ ...s, role: 'organizer' })),
          ...matches.filter(m => m.squad?.creatorId !== userProfile.id && m.squad?.eventDate && new Date(m.squad.eventDate) < now2)
                    .map(m => ({ ...m.squad, role: 'participant' })),
        ].sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
        return <Settings
          userProfile={userProfile}
          planHistory={settingsHistory}
          onBack={() => setCurrentTab('discover')}
          onLogout={async () => {
            // BUG FIX: Clear local state FIRST so the login screen renders immediately
            // without waiting for the Supabase auth event to propagate.
            setSession(null);
            setUserProfile(null);
            setProfileLoadError(null);
            setMatches([]);
            setJoinedPlanIds(new Set());
            setNotifications([]);
            setCurrentTab('discover');
            clearSupabaseStorage();
            await supabase.auth.signOut();
          }}
        />;
      }
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
      <div className="app-container" style={{ backgroundColor: '#ffffff' }}>
        <StatusBar />
        <main className="main-content-area" style={{
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          padding: '32px'
        }}>
          {profileLoadError ? (
            // ── Error State with Retry ──
            <div style={{
              width: '100%',
              maxWidth: '340px',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(16px)',
              borderRadius: '24px',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
              border: '1px solid var(--color-gray-100)',
              animation: 'fadeContent 0.3s ease-out'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(255,75,75,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '24px'
              }}>⚠️</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--color-gray-900)',
                marginBottom: '8px'
              }}>{t('errorLoadingProfileTitle')}</h3>
              <p style={{
                fontSize: '14px',
                color: 'var(--color-gray-500)',
                lineHeight: 1.5,
                marginBottom: '24px'
              }}>{profileLoadError}</p>
              <button
                className="btn-primary"
                onClick={() => fetchUserProfile(session.user.id, session.user.email)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                🔄 {t('retry')}
              </button>
            </div>
          ) : (
            // ── Loading Spinner ──
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid var(--color-gray-200)',
                borderTopColor: 'var(--color-turquoise)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px'
              }} />
              <p style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--color-gray-500)'
              }}>{t('loadingProfile')}</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
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
          onOpenNotifications={handleOpenNotifications}
          onOpenSettings={() => setCurrentTab('settings')}
          hasNotifications={unreadCount > 0}
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
      {showMatchOverlay && (() => {
        const overlaySquad = showMatchOverlay.squad || showMatchOverlay;
        return (
          <MatchOverlay 
            squad={overlaySquad}
            onClose={() => setShowMatchOverlay(false)} 
            onOpenChat={() => handleOpenChatFromMatch(showMatchOverlay)}
            image1={overlaySquad.image}
            image2={userProfile.photo}
          />
        );
      })()}
      {/* Info Modal (Overlay) */}
      {selectedPlanDetails && (() => {
        const isCreator = selectedPlanDetails.creatorId === userProfile.id;
        const joinedMatch = matches.find(m => m.squad.id === selectedPlanDetails.id);
        const isJoined = isCreator || !!joinedMatch;
        // If it's the creator's plan, we just use the plan's id as the chat id
        const matchIdToOpen = joinedMatch ? joinedMatch.id : `chat-${selectedPlanDetails.id}`;

        return (
          <PlanDetailsModal 
            squad={selectedPlanDetails} 
            onClose={() => setSelectedPlanDetails(null)}
            onJoin={() => {
              handleLike(selectedPlanDetails);
              setSelectedPlanDetails(null);
            }}
            isJoined={isJoined}
            onOpenChat={() => {
              setSelectedPlanDetails(null);
              // BUG FIX: Build the match object and set activeChatData atomically with activeChatId
              // so the chat panel always mounts, regardless of React's batch-update order.
              let matchToOpen = joinedMatch;
              if (!matchToOpen) {
                // Creator or edge case: synthesize a transient match object for the chat
                matchToOpen = {
                  id: matchIdToOpen,
                  squad: selectedPlanDetails,
                  messages: [],
                  lastActive: 'Ahora'
                };
                // Also add it to matches so the Matches tab reflects it
                if (!matches.find(m => m.id === matchIdToOpen)) {
                  setMatches(prev => [matchToOpen, ...prev]);
                }
              }
              setActiveChatId(matchIdToOpen);
              setActiveChatData(matchToOpen);
            }}
          />
        );
      })()}

      {/* Rating Modal: appears when there are past unrated plans */}
      {pendingRatings.length > 0 && !activeChatId && !showMatchOverlay && (
        <RatingModal
          plan={pendingRatings[0]}
          totalPending={pendingRatings.length}
          onSubmit={handleSubmitRating}
          onSkip={handleSkipRating}
        />
      )}

      {/* Event Gallery Modal */}
      {galleryPlan && (
        <EventGalleryModal
          plan={galleryPlan}
          userProfile={userProfile}
          onClose={() => setGalleryPlan(null)}
        />
      )}

      {/* Active Chat Screen (Full Screen Overlay) */}
      {activeChatId && activeChatData && (
        <SquadChat 
          matchData={activeChatData} 
          userProfile={userProfile}
          onBack={() => { setActiveChatId(null); setActiveChatData(null); }} 
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
