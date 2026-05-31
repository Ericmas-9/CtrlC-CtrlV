import React, { useState, useEffect } from 'react';
import { MessageSquare, MapPin, Users, ClipboardList, Settings, Trash2, Check, X, Calendar, Star, History, RotateCcw, GalleryHorizontal, MessageCircle } from 'lucide-react';
import './Matches.css';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase } from '../utils/supabaseClient';

const Matches = ({ matches, userPlans = [], onInfo, onUpdatePlan, onDeletePlan, ratedPlanIds = new Set(), onRatePlan, passedSquads = [], onUndoPass, onOpenGallery, onOpenChat }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('active');
  const [planAvgRatings, setPlanAvgRatings] = useState({});
  const [editingPlan, setEditingPlan] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editMaxMembers, setEditMaxMembers] = useState('');
  const [editMinAge, setEditMinAge] = useState('');
  const [editMaxAge, setEditMaxAge] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch avg rating per plan quan s'obre l'historial
  useEffect(() => {
    if (activeTab !== 'history') return;
    const historyIds = [
      ...userPlans.filter(p => p.eventDate && new Date(p.eventDate) < new Date()).map(p => p.id),
      ...matches.filter(m => m.squad?.eventDate && new Date(m.squad.eventDate) < new Date()).map(m => m.squad.id),
    ];
    if (historyIds.length === 0) return;

    supabase
      .from('plan_ratings')
      .select('plan_id, stars')
      .in('plan_id', historyIds)
      .then(({ data }) => {
        if (!data) return;
        const grouped = {};
        data.forEach(r => {
          if (!grouped[r.plan_id]) grouped[r.plan_id] = [];
          grouped[r.plan_id].push(r.stars);
        });
        const avgs = {};
        Object.entries(grouped).forEach(([planId, stars]) => {
          avgs[planId] = {
            avg: (stars.reduce((a, b) => a + b, 0) / stars.length).toFixed(1),
            count: stars.length,
          };
        });
        setPlanAvgRatings(avgs);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userPlans, matches]);

  const now = new Date();
  const isActive = (p) => !p.eventDate || new Date(p.eventDate) >= now;
  const isPast  = (p) =>  p.eventDate && new Date(p.eventDate) <  now;

  const myActivePlans = userPlans.filter(isActive);
  const myPastPlans   = userPlans.filter(isPast);
  const activeMatches = matches.filter(m => isActive(m.squad));
  const pastMatches   = matches.filter(m => isPast(m.squad));

  // Historial: plans passats (propis + units), ordenats per data desc
  const history = [
    ...myPastPlans.map(p => ({ ...p, _role: 'organizer' })),
    ...pastMatches.map(m => ({ ...m.squad, _role: 'participant' }))
  ].sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString(undefined, {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const toLocalInputValue = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const openSettings = (plan, e) => {
    e.stopPropagation();
    setEditingPlan(plan);
    setEditDate(toLocalInputValue(plan.eventDate));
    setEditMaxMembers(plan.maxMembers ?? '');
    setEditMinAge(plan.minAge ?? 18);
    setEditMaxAge(plan.maxAge ?? 99);
  };

  const closeSettings = () => setEditingPlan(null);

  const handleSave = async () => {
    setSaving(true);
    await onUpdatePlan(editingPlan.id, {
      eventDate: editDate ? new Date(editDate).toISOString() : null,
      maxMembers: editMaxMembers !== '' ? (parseInt(editMaxMembers) || null) : null,
      minAge: parseInt(editMinAge) || 18,
      maxAge: parseInt(editMaxAge) || 99,
    });
    setSaving(false);
    setEditingPlan(null);
  };

  const handleDelete = async (planId, e) => {
    e.stopPropagation();
    if (!window.confirm(t('deletePlanConfirm'))) return;
    await onDeletePlan(planId);
  };

  return (
    <div className="matches-screen">

      {/* ── PESTANYES ── */}
      <div className="matches-tabs">
        <button
          className={`matches-tab ${activeTab === 'active' ? 'matches-tab--active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          {t('activePlans')}
          {(myActivePlans.length + activeMatches.length) > 0 && (
            <span className="skipped-count-badge">{myActivePlans.length + activeMatches.length}</span>
          )}
        </button>
        <button
          className={`matches-tab ${activeTab === 'history' ? 'matches-tab--active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          {t('planHistory')}
        </button>
        <button
          className={`matches-tab ${activeTab === 'skipped' ? 'matches-tab--active' : ''}`}
          onClick={() => setActiveTab('skipped')}
        >
          {t('skippedPlans')}
          {passedSquads.length > 0 && (
            <span className="skipped-count-badge">{passedSquads.length}</span>
          )}
        </button>
      </div>

      {/* ── PLANS ACTIUS ── */}
      {activeTab === 'active' && (
        <>
          {/* Els meus plans */}
          <div className="matches-section">
            <h3 className="section-label">{t('myPlans')} ({myActivePlans.length})</h3>
            {myActivePlans.length === 0 ? (
              <div className="empty-state">
                <ClipboardList size={40} color="var(--color-gray-300)" />
                <p>{t('noActivePlans')}</p>
              </div>
            ) : (
              <div className="matches-list">
                {myActivePlans.map(plan => (
                  <div key={plan.id} className="my-plan-card" onClick={() => onInfo && onInfo(plan)}>
                    <div className="my-plan-card-header">
                      <div className="my-plan-thumb" style={{ backgroundImage: `url(${plan.image})` }} />
                      <div className="match-item-content">
                        <div className="match-item-header">
                          <h4>{plan.planTitle}</h4>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="meta-badge">
                              <Users size={11} /> {plan.membersCount}/{plan.maxMembers ?? '?'}
                            </span>
                            <button className="plan-settings-btn" onClick={(e) => openSettings(plan, e)}>
                              <Settings size={15} />
                            </button>
                            <button className="plan-delete-btn" onClick={(e) => handleDelete(plan.id, e)}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        <p className="match-latest-msg">📅 {formatDate(plan.eventDate)}</p>
                        <div className="match-meta">
                          <span className="meta-badge"><MapPin size={12} /> {plan.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plans units */}
          <div className="matches-section" style={{ marginTop: '24px' }}>
            <h3 className="section-label">{t('plansJoined')} ({activeMatches.length})</h3>
            {activeMatches.length === 0 ? (
              <div className="empty-state">
                <MessageSquare size={40} color="var(--color-gray-300)" />
                <p>{t('noJoinedActivePlans')}</p>
              </div>
            ) : (
              <div className="matches-list">
                {activeMatches.map(match => {
                  const squad = match.squad;
                  return (
                    <div key={match.id} className="match-list-item" onClick={() => onInfo && onInfo(squad)}>
                      <div className="my-plan-thumb" style={{ backgroundImage: `url(${squad.image})` }} />
                      <div className="match-item-content">
                        <div className="match-item-header">
                          <h4>{squad.planTitle || squad.squadName}</h4>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                            <span className="meta-badge">
                              <Users size={11} /> {squad.membersCount}/{squad.maxMembers ?? '?'}
                            </span>
                            <button
                              className="chat-direct-btn"
                              onClick={e => { e.stopPropagation(); onOpenChat && onOpenChat(match.id); }}
                              title={t('openChat')}
                            >
                              <MessageCircle size={15} />
                            </button>
                          </div>
                        </div>
                        <p className="match-latest-msg">📅 {formatDate(squad.eventDate)}</p>
                        <div className="match-meta">
                          <span className="meta-badge"><MapPin size={12} /> {squad.location}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── HISTORIAL ── */}
      {activeTab === 'history' && (
        <div className="matches-section">
          {history.length === 0 ? (
            <div className="empty-state">
              <History size={40} color="var(--color-gray-300)" />
              <p>{t('historyEmpty')}</p>
            </div>
          ) : (
            <div className="matches-list">
              {history.map((plan, idx) => {
                const isRated = ratedPlanIds.has(plan.id);
                const avgData = planAvgRatings[plan.id];
                return (
                  <div key={`${plan.id}-${idx}`} className="history-plan-card" onClick={() => onInfo && onInfo(plan)}>
                    <div className="my-plan-thumb" style={{ backgroundImage: `url(${plan.image})` }} />
                    <div className="match-item-content">
                      <div className="match-item-header">
                        <h4>{plan.planTitle || plan.squadName}</h4>
                        <span className={`role-badge role-badge--${plan._role}`}>
                          {t(plan._role)}
                        </span>
                      </div>
                      <p className="match-latest-msg">📅 {formatDate(plan.eventDate)}</p>

                      {/* Mitjana del grup */}
                      {avgData ? (
                        <div className="plan-avg-rating">
                          {[1,2,3,4,5].map(i => (
                            <Star
                              key={i}
                              size={12}
                              fill={i <= Math.round(parseFloat(avgData.avg)) ? 'var(--color-amber)' : 'none'}
                              color={i <= Math.round(parseFloat(avgData.avg)) ? 'var(--color-amber)' : 'var(--color-gray-300)'}
                            />
                          ))}
                          <span className="plan-avg-value">{avgData.avg}</span>
                          <span className="plan-avg-count">({avgData.count})</span>
                        </div>
                      ) : (
                        <div className="plan-avg-rating plan-avg-rating--empty">
                          <Star size={12} color="var(--color-gray-300)" />
                          <span className="plan-avg-count">{t('noRating')}</span>
                        </div>
                      )}

                      <div className="match-meta" style={{ justifyContent: 'space-between' }}>
                        <span className="meta-badge"><MapPin size={12} /> {plan.location}</span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            className="gallery-plan-btn"
                            onClick={e => { e.stopPropagation(); onOpenGallery && onOpenGallery(plan); }}
                            title={t('viewGallery')}
                          >
                            <GalleryHorizontal size={12} /> {t('photos')}
                          </button>
                          {plan._role === 'participant' && (
                            isRated ? (
                              <span className="rated-badge">
                                <Star size={12} fill="currentColor" /> {t('ratingSubmitted')}
                              </span>
                            ) : (
                              <button
                                className="rate-plan-btn"
                                onClick={e => { e.stopPropagation(); onRatePlan && onRatePlan(plan); }}
                              >
                                <Star size={13} /> {t('ratePlan')}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── PLANS REBUTJATS / RECHAZADOS ── */}
      {activeTab === 'skipped' && (
        <div className="matches-section">
          {passedSquads.length === 0 ? (
            <div className="empty-state">
              <RotateCcw size={40} color="var(--color-gray-300)" />
              <p>{t('skippedEmpty')}</p>
            </div>
          ) : (
            <div className="matches-list">
              {passedSquads.map(plan => (
                <div key={plan.id} className="history-plan-card" onClick={() => onInfo && onInfo(plan)}>
                  <div className="my-plan-thumb" style={{ backgroundImage: `url(${plan.image})` }} />
                  <div className="match-item-content">
                    <div className="match-item-header">
                      <h4>{plan.planTitle || plan.squadName}</h4>
                    </div>
                    <p className="match-latest-msg">📅 {formatDate(plan.eventDate)}</p>
                    <div className="match-meta" style={{ justifyContent: 'space-between' }}>
                      <span className="meta-badge"><MapPin size={12} /> {plan.location}</span>
                      <button
                        className="recover-plan-btn"
                        onClick={e => { e.stopPropagation(); onUndoPass && onUndoPass(plan.id); }}
                      >
                        <RotateCcw size={12} /> {t('recoverPlan')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL AJUSTOS DEL PLA ── */}
      {editingPlan && (
        <div className="plan-settings-overlay" onClick={closeSettings}>
          <div className="plan-settings-modal" onClick={e => e.stopPropagation()}>
            <div className="plan-settings-modal-header">
              <h4>{t('planSettings')}</h4>
              <button className="plan-settings-close" onClick={closeSettings}><X size={20} /></button>
            </div>
            <p className="plan-settings-name">{editingPlan.planTitle}</p>

            <div className="plan-settings-field">
              <label><Calendar size={14} /> {t('eventDate')}</label>
              <input
                type="datetime-local"
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
              />
            </div>

            <div className="plan-settings-field">
              <label><Users size={14} /> {t('maxGroupSize')}</label>
              <input
                type="number"
                min={editingPlan.membersCount || 1}
                max={50}
                value={editMaxMembers}
                onChange={e => setEditMaxMembers(e.target.value)}
              />
              <span className="plan-settings-hint">
                {editingPlan.membersCount} {t('members')} — {t('min')} {editingPlan.membersCount}
              </span>
            </div>

            <div className="plan-settings-field">
              <label>{t('targetAgeRange')}</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  min={18} max={editMaxAge || 99}
                  value={editMinAge}
                  onChange={e => setEditMinAge(e.target.value)}
                  style={{ width: '70px' }}
                />
                <span style={{ color: 'var(--color-gray-400)', fontSize: '13px' }}>—</span>
                <input
                  type="number"
                  min={editMinAge || 18} max={99}
                  value={editMaxAge}
                  onChange={e => setEditMaxAge(e.target.value)}
                  style={{ width: '70px' }}
                />
              </div>
            </div>

            <div className="plan-settings-actions">
              <button className="plan-settings-save" onClick={handleSave} disabled={saving}>
                <Check size={16} /> {saving ? t('ratingSubmitting') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;
