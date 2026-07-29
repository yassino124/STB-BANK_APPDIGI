import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Headphones, Send, CheckCircle, Clock, MessageCircle, User, X, RefreshCw, Zap, TrendingUp, Activity } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Ticket {
  _id: string;
  employeeId: { _id: string; nom: string; prenom: string; matricule: string; email?: string };
  type: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  assignedTo?: { _id: string; nom: string; prenom: string };
}

interface TicketMessage {
  _id: string;
  ticketId: string;
  senderId: { _id: string; nom: string; prenom: string };
  senderType: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  ASSISTANCE: { label: 'Assistance', color: '#2962FF', bg: 'rgba(41,98,255,0.1)', icon: '❓' },
  RECLAMATION: { label: 'Réclamation', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: '⚠️' },
  BUG: { label: 'Bug', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: '🐛' },
  FEEDBACK: { label: 'Feedback', color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: '💡' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  OPEN: { label: 'Ouvert', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={12} /> },
  IN_PROGRESS: { label: 'En cours', color: '#2962FF', bg: 'rgba(41,98,255,0.1)', icon: <RefreshCw size={12} /> },
  WAITING_RESPONSE: { label: 'Attente', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: <MessageCircle size={12} /> },
  RESOLVED: { label: 'Résolu', color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle size={12} /> },
  CLOSED: { label: 'Fermé', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', icon: <X size={12} /> },
};



const Tickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [rhUser, setRhUser] = useState<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Get current RH user
    const fetchRhUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setRhUser(res.data);
      } catch (err) {
        console.error('Failed to fetch RH user:', err);
      }
    };
    fetchRhUser();
  }, []);

  const fetchTickets = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/tickets');
      const data: Ticket[] = res.data.data || res.data;
      setTickets(data.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()));
    } catch (err) {
      if (!silent) toast.error('Erreur lors du chargement des tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (ticketId: string) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/tickets/${ticketId}/messages`);
      const data: TicketMessage[] = res.data.data || res.data;
      setMessages(data);
    } catch (err) {
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    fetchMessages(ticket._id);
    // Auto-assign and set to IN_PROGRESS if still OPEN
    if (ticket.status === 'OPEN' && rhUser) {
      api.patch(`/tickets/${ticket._id}/assign`).catch(() => {});
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedTicket) return;

    setSending(true);
    try {
      await api.post(`/tickets/${selectedTicket._id}/messages`, {
        message: messageText.trim(),
        senderType: 'RH',
      });
      setMessageText('');
      fetchMessages(selectedTicket._id);
      fetchTickets(true); // Refresh ticket list
      toast.success('Message envoyé');
    } catch (err) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!selectedTicket) return;
    try {
      await api.patch(`/tickets/${selectedTicket._id}/status`, { status });
      toast.success('Statut mis à jour');
      fetchTickets(true);
      setSelectedTicket({ ...selectedTicket, status });
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(() => fetchTickets(true), 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const filteredTickets = filter === 'ALL'
    ? tickets
    : tickets.filter(t => t.status === filter);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--stb-blue-500)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Support Tickets</h1>
          <p className="page-subtitle">Gestion intelligente des demandes d'assistance</p>
        </div>
        <button className="btn btn-primary" onClick={() => fetchTickets()}>
          <RefreshCw size={16} />
          Actualiser
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Tickets', value: tickets.length, icon: Activity, bgClass: 'si-blue' },
          { label: 'Ouverts', value: tickets.filter(t => t.status === 'OPEN').length, icon: Clock, bgClass: 'si-gold' },
          { label: 'En cours', value: tickets.filter(t => t.status === 'IN_PROGRESS').length, icon: Zap, bgClass: 'si-purple' },
          { label: 'Résolus', value: tickets.filter(t => t.status === 'RESOLVED').length, icon: TrendingUp, bgClass: 'si-green' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="glass-card stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className={`stat-icon ${stat.bgClass}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <div className="tab-bar">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'WAITING_RESPONSE', 'RESOLVED', 'CLOSED'].map((f) => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`tab-btn ${isActive ? 'active' : ''}`}
                style={{ whiteSpace: 'nowrap' }}
              >
                {f === 'ALL' ? 'Tous' : STATUS_CONFIG[f]?.label || f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem', height: '600px' }}>
        {/* Tickets List */}
        <div className="glass-card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageCircle size={18} color="var(--stb-blue-400)" />
              Tickets ({filteredTickets.length})
            </h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Headphones size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Aucun ticket trouvé.</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const typeConfig = TYPE_CONFIG[ticket.type] || TYPE_CONFIG.ASSISTANCE;
                const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
                const isSelected = selectedTicket?._id === ticket._id;

                return (
                  <div
                    key={ticket._id}
                    onClick={() => handleTicketClick(ticket)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--r-md)',
                      background: isSelected ? 'var(--stb-blue-100)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? 'var(--border-blue)' : 'var(--border)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <div style={{ fontSize: '1.5rem' }}>{typeConfig.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <span className="badge" style={{ background: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.color}40` }}>
                            {statusConfig.label}
                          </span>
                          {ticket.priority === 'URGENT' && (
                            <span className="badge badge-inactive">🔥 Urgent</span>
                          )}
                        </div>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ticket.subject}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <User size={12} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ticket.employeeId?.prenom} {ticket.employeeId?.nom}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MessageCircle size={12} /> {ticket.messageCount}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(ticket.lastMessageAt), { addSuffix: true, locale: fr })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="glass-card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          {!selectedTicket ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--stb-blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Headphones size={40} color="var(--stb-blue-400)" />
              </div>
              <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Sélectionnez un ticket</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>pour voir la conversation et répondre</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{selectedTicket.subject}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <User size={14} />
                    {selectedTicket.employeeId?.prenom} {selectedTicket.employeeId?.nom} • {selectedTicket.employeeId?.matricule}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {selectedTicket.status !== 'RESOLVED' && (
                    <button className="btn btn-sm btn-primary" style={{ background: 'var(--success)', border: 'none', boxShadow: 'none' }} onClick={() => updateStatus('RESOLVED')}>
                      <CheckCircle size={14} /> Résolu
                    </button>
                  )}
                  {selectedTicket.status !== 'CLOSED' && (
                    <button className="btn btn-sm btn-secondary" onClick={() => updateStatus('CLOSED')}>
                      <X size={14} /> Fermer
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loadingMessages ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--stb-blue-500)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, _idx) => {
                      const isRH = msg.senderType === 'RH';
                      const isSystem = msg.senderType === 'SYSTEM';

                      if (isSystem) {
                        return (
                          <div key={msg._id} style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                            <div style={{ padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {msg.message}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={msg._id} style={{ display: 'flex', justifyContent: isRH ? 'flex-end' : 'flex-start' }}>
                          <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isRH ? 'flex-end' : 'flex-start' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 'bold' }}>{isRH ? '🎧 Support STB' : `👤 ${msg.senderId?.prenom} ${msg.senderId?.nom}`}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: fr })}</span>
                            </div>
                            <div style={{
                              padding: '0.75rem 1rem',
                              borderRadius: 'var(--r-md)',
                              background: isRH ? 'linear-gradient(135deg, var(--stb-blue-600), var(--stb-electric))' : 'rgba(255,255,255,0.06)',
                              border: isRH ? 'none' : '1px solid var(--border)',
                              borderBottomRightRadius: isRH ? 0 : 'var(--r-md)',
                              borderBottomLeftRadius: isRH ? 'var(--r-md)' : 0,
                              color: 'var(--text-primary)',
                              fontSize: '0.9rem',
                              lineHeight: 1.5,
                              whiteSpace: 'pre-wrap',
                              boxShadow: isRH ? '0 4px 12px rgba(41, 98, 255, 0.2)' : 'none'
                            }}>
                              {msg.message}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Écrivez votre réponse..."
                    className="form-input"
                    disabled={sending}
                    style={{ flex: 1, margin: 0 }}
                  />
                  <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !messageText.trim()}>
                    <Send size={16} />
                    {sending ? '...' : 'Envoyer'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tickets;
