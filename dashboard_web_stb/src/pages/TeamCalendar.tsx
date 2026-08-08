import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface LeaveEvent {
  _id: string;
  employeeId: {
    _id: string;
    prenom: string;
    nom: string;
    poste?: string;
  };
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  days: number;
  reason?: string;
}

const TeamCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaves, setLeaves] = useState<LeaveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<LeaveEvent | null>(null);
  const [draggedLeave, setDraggedLeave] = useState<LeaveEvent | null>(null);

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  useEffect(() => {
    fetchLeaves();
  }, [currentDate]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const res = await api.get(`/leave/my-team`);
      setLeaves(res.data?.data || res.data || []);
    } catch (err: any) {
      console.error('Error fetching leaves:', err);
      toast.error('Erreur lors du chargement des congés');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getLeavesForDay = (date: Date | null) => {
    if (!date) return [];
    
    return leaves.filter((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      date.setHours(12, 0, 0, 0);
      
      return date >= start && date <= end;
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDragStart = (leave: LeaveEvent, e: React.DragEvent) => {
    if (leave.status !== 'PENDING' && leave.status !== 'PENDING_MANAGER') {
      e.preventDefault();
      toast.error('Impossible de déplacer un congé déjà validé');
      return;
    }
    setDraggedLeave(leave);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (date: Date | null, e: React.DragEvent) => {
    e.preventDefault();
    
    if (!date || !draggedLeave) return;

    try {
      const originalStart = new Date(draggedLeave.startDate);
      const daysDiff = Math.floor((date.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24));
      
      const newStartDate = new Date(originalStart);
      newStartDate.setDate(originalStart.getDate() + daysDiff);
      
      const newEndDate = new Date(draggedLeave.endDate);
      newEndDate.setDate(newEndDate.getDate() + daysDiff);

      await api.patch(`/leave/${draggedLeave._id}`, {
        startDate: newStartDate.toISOString(),
        endDate: newEndDate.toISOString(),
      });

      toast.success('Congé déplacé avec succès');
      fetchLeaves();
    } catch (err: any) {
      toast.error('Erreur lors du déplacement du congé');
    } finally {
      setDraggedLeave(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { bg: 'rgba(16,185,129,0.15)', border: '#10B981', text: '#10B981' };
      case 'REJECTED':
        return { bg: 'rgba(239,68,68,0.15)', border: '#EF4444', text: '#EF4444' };
      case 'PENDING':
      case 'PENDING_MANAGER':
      case 'PENDING_RH':
        return { bg: 'rgba(245,158,11,0.15)', border: '#F59E0B', text: '#F59E0B' };
      default:
        return { bg: 'rgba(100,116,139,0.15)', border: '#64748B', text: '#64748B' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle size={12} />;
      case 'REJECTED':
        return <XCircle size={12} />;
      default:
        return <AlertCircle size={12} />;
    }
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = {
    total: leaves.length,
    approved: leaves.filter(l => l.status === 'APPROVED').length,
    pending: leaves.filter(l => l.status?.includes('PENDING')).length,
    rejected: leaves.filter(l => l.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .calendar-day:hover { background: rgba(0,0,0,0.02); }
        .leave-badge { cursor: grab; transition: transform 0.2s, box-shadow 0.2s; }
        .leave-badge:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .leave-badge:active { cursor: grabbing; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
            📅 Calendrier d'Équipe
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Vue calendrier des congés • Glissez pour déplacer les congés en attente
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, rgba(41,98,255,0.1) 0%, rgba(41,98,255,0.05) 100%)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(41,98,255,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CalendarIcon size={20} color="#2962FF" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2962FF' }}>{stats.total}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Congés</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle size={20} color="#10B981" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>{stats.approved}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approuvés</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.05) 100%)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} color="#F59E0B" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B' }}>{stats.pending}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>En Attente</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <XCircle size={20} color="#EF4444" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EF4444' }}>{stats.rejected}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Refusés</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Calendar Navigation */}
      <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button
            onClick={goToPreviousMonth}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}
          >
            <ChevronLeft size={16} /> Précédent
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={goToToday}
              style={{ marginTop: '0.5rem', padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none', background: 'rgba(41,98,255,0.1)', color: '#2962FF', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
            >
              Aujourd'hui
            </button>
          </div>
          
          <button
            onClick={goToNextMonth}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}
          >
            Suivant <ChevronRight size={16} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div>
          {/* Day Names Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
            {dayNames.map((day) => (
              <div key={day} style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {days.map((day, index) => {
              const dayLeaves = getLeavesForDay(day);
              const isToday = day && day.getTime() === today.getTime();
              const isCurrentMonth = day && day.getMonth() === currentDate.getMonth();

              return (
                <div
                  key={index}
                  className="calendar-day"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(day, e)}
                  style={{
                    minHeight: '100px',
                    padding: '0.5rem',
                    borderRadius: '10px',
                    border: isToday ? '2px solid #2962FF' : '1px solid var(--border)',
                    background: day ? (isCurrentMonth ? 'var(--card-bg)' : 'rgba(0,0,0,0.02)') : 'transparent',
                    position: 'relative',
                    cursor: draggedLeave ? 'copy' : 'default',
                  }}
                >
                  {day && (
                    <>
                      <div style={{ fontSize: '0.85rem', fontWeight: isToday ? 800 : 600, color: isToday ? '#2962FF' : isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        {day.getDate()}
                      </div>
                      
                      {/* Leave Badges */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {dayLeaves.slice(0, 3).map((leave) => {
                          const colors = getStatusColor(leave.status);
                          const isDraggable = leave.status === 'PENDING' || leave.status === 'PENDING_MANAGER';
                          
                          return (
                            <div
                              key={leave._id}
                              className="leave-badge"
                              draggable={isDraggable}
                              onDragStart={(e) => handleDragStart(leave, e)}
                              onClick={() => setSelectedLeave(leave)}
                              style={{
                                padding: '4px 6px',
                                borderRadius: '4px',
                                background: colors.bg,
                                border: `1px solid ${colors.border}`,
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                color: colors.text,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: isDraggable ? 'grab' : 'pointer',
                              }}
                              title={`${leave.employeeId.prenom} ${leave.employeeId.nom} - ${leave.type}`}
                            >
                              {getStatusIcon(leave.status)}
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {leave.employeeId.prenom[0]}. {leave.employeeId.nom}
                              </span>
                            </div>
                          );
                        })}
                        {dayLeaves.length > 3 && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', padding: '2px' }}>
                            +{dayLeaves.length - 3} autres
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leave Detail Modal */}
      <AnimatePresence>
        {selectedLeave && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLeave(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--card-bg)',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: getStatusColor(selectedLeave.status).bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${getStatusColor(selectedLeave.status).border}` }}>
                  <Users size={22} color={getStatusColor(selectedLeave.status).text} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {selectedLeave.employeeId.prenom} {selectedLeave.employeeId.nom}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selectedLeave.employeeId.poste || 'Aucun poste renseigné'}
                  </div>
                </div>
                <div style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: getStatusColor(selectedLeave.status).bg,
                  border: `1px solid ${getStatusColor(selectedLeave.status).border}`,
                  color: getStatusColor(selectedLeave.status).text,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  {getStatusIcon(selectedLeave.status)}
                  {selectedLeave.status}
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase' }}>Type de congé</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>{selectedLeave.type}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase' }}>Début</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {new Date(selectedLeave.startDate).toLocaleDateString('fr-TN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase' }}>Fin</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {new Date(selectedLeave.endDate).toLocaleDateString('fr-TN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase' }}>Durée</div>
                    <div style={{ fontSize: '0.95rem', color: '#2962FF', fontWeight: 800 }}>{selectedLeave.days} jours</div>
                  </div>
                </div>

                {selectedLeave.reason && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase' }}>Motif</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selectedLeave.reason}</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedLeave(null)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2962FF 0%, #1E3A8A 100%)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Box */}
      <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(41,98,255,0.05)', border: '1px solid rgba(41,98,255,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={18} color="#2962FF" />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong>Astuce:</strong> Glissez-déposez les congés en attente (jaune) pour les déplacer. Les congés approuvés (vert) ne peuvent pas être déplacés.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCalendar;
