import { useEffect, useState } from 'react';
import { Search, CreditCard, Lock, Unlock, Eye, X, Mail, Briefcase, Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface Employee {
  matricule: string;
  nom: string;
  prenom: string;
  poste: string;
  email: string;
}

interface Card {
  _id: string;
  employeeId: Employee;
  cardType: string;
  cardNumber: string;
  status: string;
  issuedAt: string;
  expiresAt: string;
}

const AgenceCardsPage = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED' | 'PENDING'>('ALL');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cards/all');
      const data = res?.data?.data || res?.data || [];
      setCards(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error fetching cards:', err);
      toast.error('Erreur de chargement des cartes');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await api.patch(`/cards/${id}/activate`);
      toast.success('Carte activée avec succès');
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors de l\'activation');
    }
  };

  const handleBlock = async (id: string) => {
    try {
      await api.patch(`/cards/${id}/block`);
      toast.success('Carte bloquée avec succès');
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors du blocage');
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await api.patch(`/cards/${id}/unblock`);
      toast.success('Carte débloquée avec succès');
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors du déblocage');
    }
  };

  const filteredCards = cards.filter((card) => {
    const matchesFilter = filter === 'ALL' || card.status === filter;
    const matchesSearch = !searchTerm ||
      `${card.employeeId?.prenom} ${card.employeeId?.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.employeeId?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.cardNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: cards.length,
    active: cards.filter((c) => c.status === 'ACTIVE').length,
    blocked: cards.filter((c) => c.status === 'BLOCKED').length,
    pending: cards.filter((c) => c.status === 'PENDING').length,
  };

  const getCardStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return { bg: 'rgba(16,185,129,0.15)', color: '#10B981' };
      case 'BLOCKED': return { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' };
      case 'PENDING': return { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' };
      default: return { bg: 'rgba(107,114,128,0.15)', color: '#6B7280' };
    }
  };

  const getCardStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle size={20} />;
      case 'BLOCKED': return <XCircle size={20} />;
      case 'PENDING': return <Clock size={20} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '48px', height: '48px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Chargement des cartes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .stat-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.12); }
        .card-item { transition: all 0.3s ease; cursor: pointer; }
        .card-item:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
        .filter-btn { transition: all 0.2s ease; }
        .filter-btn:hover { transform: translateY(-1px); }
        .action-btn { transition: all 0.2s ease; }
        .action-btn:hover { transform: scale(1.05); }
        .modal-overlay { backdrop-filter: blur(4px); }
      `}</style>

      <div style={{ animation: 'fadeIn 0.5s ease' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Gestion des Cartes
            </h1>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Activation, désactivation et suivi des cartes bancaires</p>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Cartes', value: stats.total, color: '#F59E0B' },
            { label: 'Actives', value: stats.active, color: '#10B981' },
            { label: 'Bloquées', value: stats.blocked, color: '#EF4444' },
            { label: 'En Attente', value: stats.pending, color: '#2962FF' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              style={{
                background: `${stat.color}10`,
                border: `1px solid ${stat.color}30`,
                borderRadius: '12px',
                padding: '1rem 1.5rem',
                minWidth: '130px',
                flex: 1,
                boxShadow: `0 4px 14px ${stat.color}15`,
                cursor: 'pointer'
              }}
            >
              <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: stat.color }}>{stat.value}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          {/* Search */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher par nom, matricule ou numéro de carte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', fontSize: '0.95rem', transition: 'all 0.2s ease', background: 'rgba(255,255,255,0.02)',
                color: '#fff'
              }}
              onFocus={(e) => e.target.style.borderColor = '#F59E0B'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(['ALL', 'ACTIVE', 'BLOCKED', 'PENDING'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                  background: filter === f ? '#2962FF' : 'rgba(255,255,255,0.04)',
                  color: filter === f ? '#fff' : 'var(--text-muted)',
                  boxShadow: filter === f ? '0 4px 14px rgba(41,98,255,0.3)' : 'none',
                }}
              >
                {f === 'ALL' ? '📋 Toutes' : f === 'ACTIVE' ? '✅ Actives' : f === 'BLOCKED' ? '🔒 Bloquées' : '⏳ En attente'}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredCards.map((card, i) => {
            const statusColor = getCardStatusColor(card.status);
            return (
              <motion.div
                key={card._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedCard(card)}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  backdropFilter: 'blur(20px)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s ease'
                }}
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
              >
                {/* Glow accent top-right */}
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px',
                  background: `radial-gradient(circle, ${statusColor.color}20 0%, transparent 70%)`, pointerEvents: 'none' }} />

                {/* Status Badge */}
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', background: statusColor.bg, border: `1px solid ${statusColor.color}30`, color: statusColor.color }}>
                    {getCardStatusIcon(card.status)}
                    {card.status}
                  </div>
                </div>

                {/* Employee Info */}
                <div style={{ position: 'relative', zIndex: 1, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: `${statusColor.color}20`, border: `1px solid ${statusColor.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: statusColor.color, fontSize: '1rem', fontWeight: 800, flexShrink: 0
                  }}>
                    {card.employeeId?.prenom?.charAt(0)}{card.employeeId?.nom?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                      {card.employeeId?.prenom} {card.employeeId?.nom}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {card.employeeId?.matricule}
                    </div>
                  </div>
                </div>

                {/* Card Visual */}
                <div style={{
                  position: 'relative', zIndex: 1,
                  background: `linear-gradient(135deg, ${statusColor.color}25, ${statusColor.color}10)`,
                  border: `1px solid ${statusColor.color}30`,
                  borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1rem',
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {card.cardType}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '2px', fontFamily: 'monospace', color: '#fff', marginBottom: '0.75rem' }}>
                    {card.cardNumber || '•••• •••• •••• ••••'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>ÉMISE LE</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{card.issuedAt ? new Date(card.issuedAt).toLocaleDateString('fr-FR') : 'N/A'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>EXPIRE LE</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{card.expiresAt ? new Date(card.expiresAt).toLocaleDateString('fr-FR') : 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCard(card); }}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <Eye size={14} /> Détails
                  </button>

                  {card.status === 'PENDING' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleActivate(card._id); }}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', borderRadius: '10px',
                        border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <CheckCircle size={14} /> Activer
                    </button>
                  )}

                  {card.status === 'ACTIVE' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleBlock(card._id); }}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', borderRadius: '10px',
                        border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <Lock size={14} /> Bloquer
                    </button>
                  )}

                  {card.status === 'BLOCKED' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUnblock(card._id); }}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', borderRadius: '10px',
                        border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <Unlock size={14} /> Débloquer
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}

          {filteredCards.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={40} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Aucune carte trouvée</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {searchTerm ? 'Essayez avec d\'autres critères de recherche' : 'Aucune carte correspondant aux filtres sélectionnés'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedCard && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setSelectedCard(null)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'var(--card-bg)',
                  borderRadius: '20px',
                  padding: '2rem',
                  maxWidth: '600px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflow: 'auto',
                  border: '1px solid var(--border)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}
              >
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      Détails de la Carte
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Informations complètes</p>
                  </div>
                  <button
                    onClick={() => setSelectedCard(null)}
                    style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: 'var(--bg)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Employee Card */}
                <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
                      {selectedCard.employeeId?.prenom?.charAt(0)}{selectedCard.employeeId?.nom?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {selectedCard.employeeId?.nom} {selectedCard.employeeId?.prenom}
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        {selectedCard.employeeId?.poste}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.95 }}>
                      <Briefcase size={16} />
                      {selectedCard.employeeId?.matricule}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.95 }}>
                      <Mail size={16} />
                      {selectedCard.employeeId?.email}
                    </div>
                  </div>
                </div>

                {/* Card Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <CreditCard size={18} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Numéro Carte</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                      {selectedCard.cardNumber || '•••• •••• •••• ••••'}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <CreditCard size={18} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Type Carte</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {selectedCard.cardType}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Date Émission</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {selectedCard.issuedAt ? new Date(selectedCard.issuedAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Date Expiration</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {selectedCard.expiresAt ? new Date(selectedCard.expiresAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Status Card */}
                <div style={{ 
                  background: getCardStatusColor(selectedCard.status).bg, 
                  borderRadius: '16px', 
                  padding: '1.5rem', 
                  marginBottom: '1.5rem',
                  border: `2px solid ${getCardStatusColor(selectedCard.status).color}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: getCardStatusColor(selectedCard.status).color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      {getCardStatusIcon(selectedCard.status)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Statut de la Carte</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: getCardStatusColor(selectedCard.status).color }}>
                        {selectedCard.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: selectedCard.status === 'PENDING' ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                  {selectedCard.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        handleActivate(selectedCard._id);
                        setSelectedCard(null);
                      }}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <CheckCircle size={20} />
                      Activer la Carte
                    </button>
                  )}

                  {selectedCard.status === 'ACTIVE' && (
                    <button
                      onClick={() => {
                        handleBlock(selectedCard._id);
                        setSelectedCard(null);
                      }}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Lock size={20} />
                      Bloquer la Carte
                    </button>
                  )}

                  {selectedCard.status === 'BLOCKED' && (
                    <button
                      onClick={() => {
                        handleUnblock(selectedCard._id);
                        setSelectedCard(null);
                      }}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Unlock size={20} />
                      Débloquer la Carte
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AgenceCardsPage;
