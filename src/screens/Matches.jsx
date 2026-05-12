import React, { useState } from 'react';
import { MessageSquare, MapPin, Users, ClipboardList, Settings, Trash2, Check, X, Calendar } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import './Matches.css';

const Matches = ({ matches, onOpenChat, userPlans = [], onInfo, onUpdatePlan, onDeletePlan }) => {
  const { t } = useLanguage();

  // State for the settings modal
  const [editingPlan, setEditingPlan] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editMaxMembers, setEditMaxMembers] = useState('');
  const [saving, setSaving] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Sin fecha';
    return new Date(dateStr).toLocaleString('es-ES', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Convert ISO date to datetime-local format
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
  };

  const closeSettings = () => {
    setEditingPlan(null);
  };

  const handleSave = async () => {
    setSaving(true);
    await onUpdatePlan(editingPlan.id, {
      eventDate: editDate ? new Date(editDate).toISOString() : null,
      maxMembers: parseInt(editMaxMembers) || null,
    });
    setSaving(false);
    setEditingPlan(null);
  };

  const handleDelete = async (planId, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Seguro que quieres eliminar este plan? Esta acción no se puede deshacer.')) return;
    await onDeletePlan(planId);
  };

  return (
    <div className="matches-screen">

      {/* ── MIS PLANES ── */}
      <div className="matches-section">
        <h3 className="section-label">Mis Planes ({userPlans.length})</h3>

        {userPlans.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={48} color="var(--color-gray-300)" />
            <p>Aún no has creado ningún plan activo</p>
          </div>
        ) : (
          <div className="matches-list">
            {userPlans.map(plan => (
              <div key={plan.id} className="my-plan-card" onClick={() => onInfo && onInfo(plan)}>
                {/* Top row: image + title + settings */}
                <div className="my-plan-card-header">
                  <div className="my-plan-thumb" style={{ backgroundImage: `url(${plan.image})` }} />
                  <div className="match-item-content">
                    <div className="match-item-header">
                      <h4>{plan.planTitle}</h4>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="meta-badge">
                          <Users size={11} /> {plan.membersCount}/{plan.maxMembers ?? '?'}
                        </span>
                        <button
                          className="plan-settings-btn"
                          onClick={(e) => openSettings(plan, e)}
                          title="Ajustes del plan"
                        >
                          <Settings size={15} />
                        </button>
                        <button
                          className="plan-delete-btn"
                          onClick={(e) => handleDelete(plan.id, e)}
                          title="Eliminar plan"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <p className="match-latest-msg">
                      📅 {formatDate(plan.eventDate)}
                    </p>
                    <div className="match-meta">
                      <span className="meta-badge"><MapPin size={12} /> {plan.location}</span>
                      <span className="meta-badge">Edades {plan.minAge}-{plan.maxAge}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── OTROS PLANES (matches joined) ── */}
      <div className="matches-section" style={{ marginTop: '24px' }}>
        <h3 className="section-label">Otros Planes ({matches.length})</h3>

        {matches.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} color="var(--color-gray-300)" />
            <p>Aún no te has unido a ningún plan</p>
          </div>
        ) : (
          <div className="matches-list">
            {matches.map(match => {
              const squad = match.squad;
              const latestMsg = match.messages?.[match.messages.length - 1];
              return (
                <div key={match.id} className="match-list-item" onClick={() => onInfo && onInfo(squad)}>
                  <div className="my-plan-thumb" style={{ backgroundImage: `url(${squad.image})` }} />
                  <div className="match-item-content">
                    <div className="match-item-header">
                      <h4>{squad.planTitle || squad.squadName}</h4>
                      <span className="meta-badge" style={{ fontSize: '11px' }}>
                        <Users size={11} /> {squad.membersCount}/{squad.maxMembers ?? '?'}
                      </span>
                    </div>
                    {latestMsg && (
                      <p className="match-latest-msg">
                        {latestMsg.sender === 'us' ? 'Tú: ' : ''}{latestMsg.text}
                      </p>
                    )}
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

      {/* ── SETTINGS MODAL ── */}
      {editingPlan && (
        <div className="plan-settings-overlay" onClick={closeSettings}>
          <div className="plan-settings-modal" onClick={e => e.stopPropagation()}>
            <div className="plan-settings-modal-header">
              <h4>Ajustes del plan</h4>
              <button className="plan-settings-close" onClick={closeSettings}><X size={20} /></button>
            </div>
            <p className="plan-settings-name">{editingPlan.planTitle}</p>

            <div className="plan-settings-field">
              <label><Calendar size={14} /> Fecha y hora</label>
              <input
                type="datetime-local"
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
              />
            </div>

            <div className="plan-settings-field">
              <label><Users size={14} /> Máximo de miembros</label>
              <input
                type="number"
                min={editingPlan.membersCount || 1}
                max={50}
                value={editMaxMembers}
                onChange={e => setEditMaxMembers(e.target.value)}
              />
              <span className="plan-settings-hint">
                Ya hay {editingPlan.membersCount} persona(s) unidas — el mínimo es {editingPlan.membersCount}.
              </span>
            </div>

            <div className="plan-settings-actions">
              <button className="plan-settings-save" onClick={handleSave} disabled={saving}>
                <Check size={16} /> {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;
