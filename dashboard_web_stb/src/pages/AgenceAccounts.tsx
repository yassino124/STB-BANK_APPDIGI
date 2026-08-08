import { useEffect, useState } from 'react';
import { Search, Lock, Unlock, Eye, DollarSign, Users, Wallet, TrendingUp, X, CreditCard, Mail, Briefcase, Calendar, ArrowUpRight } from 'lucide-react';
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

interface Account {
  _id: string;
  employeeId: Employee;
  accountType: string;
  status: string;
  solde: number;
  accountNumber: string;
  createdAt: string;
}

const AgenceAccountsPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'FROZEN'>('ALL');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounts/all');
      const data = res?.data?.data || res?.data || [];
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error fetching accounts:', err);
      toast.error('Erreur de chargement des comptes');
    } finally {
      setLoading(false);
    }
  };

  const handleFreeze = async (id: string) => {
    try {
      await api.patch(`/accounts/${id}/freeze`);
      toast.success('Compte bloqué avec succès');
      fetchData();
    } catch (err) {
      toast.error('Erreur lors du blocage');
    }
  };

  const handleUnfreeze = async (id: string) => {
    try {
      await api.patch(`/accounts/${id}/unfreeze`);
      toast.success('Compte débloqué avec succès');
      fetchData();
    } catch (err) {
      toast.error('Erreur lors du déblocage');
    }
  };

  const handleDeposit = async () => {
    if (!selectedAccount || !depositAmount || Number(depositAmount) <= 0) {
      toast.error('Montant invalide');
      return;
    }
    try {
      setDepositLoading(true);
      await api.post(`/accounts/${selectedAccount._id}/deposit`, {
        amount: Number(depositAmount)
      });
      toast.success(`${depositAmount} TND ajoutés au compte avec succès`);
      setShowDepositModal(false);
      setDepositAmount('');
      setSelectedAccount(null);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors du dépôt');
    } finally {
      setDepositLoading(false);
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchesFilter = filter === 'ALL' || acc.status === filter;
    const matchesSearch = !searchTerm ||
      `${acc.employeeId?.prenom} ${acc.employeeId?.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.employeeId?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: accounts.length,
    active: accounts.filter((a) => a.status === 'ACTIVE').length,
    frozen: accounts.filter((a) => a.status === 'FROZEN').length,
    totalBalance: accounts.reduce((sum, a) => sum + (a.solde || 0), 0),
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '48px', height: '48px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Chargement des comptes...</p>
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
        .account-card { transition: all 0.3s ease; cursor: pointer; }
        .account-card:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
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
              Comptes Bancaires
            </h1>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestion complète des comptes employés</p>
          </div>
        </div>

        {/* Stats Cards */}
        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Comptes', value: stats.total, color: '#8B5CF6' },
            { label: 'Actifs', value: stats.active, color: '#10B981' },
            { label: 'Bloqués', value: stats.frozen, color: '#EF4444' },
            { label: 'Solde Total', value: `${(stats.totalBalance / 1000).toFixed(1)}K`, color: '#2962FF' },
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
              placeholder="Rechercher par nom, matricule ou numéro de compte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', fontSize: '0.95rem', transition: 'all 0.2s ease', background: 'rgba(255,255,255,0.02)',
                color: '#fff'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2962FF'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['ALL', 'ACTIVE', 'FROZEN'] as const).map((f) => (
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
                {f === 'ALL' ? 'Tous' : f === 'ACTIVE' ? '✅ Actifs' : '🔒 Bloqués'}
              </button>
            ))}
          </div>
        </div>

        {/* Accounts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem' }}>
          {filteredAccounts.map((acc, i) => (
            <motion.div
              key={acc._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="account-card"
              onClick={() => setSelectedAccount(acc)}
              style={{
                background: 'var(--card-bg)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid var(--border)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Status Badge */}
              <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                <span style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: acc.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                  color: acc.status === 'ACTIVE' ? '#10B981' : '#F59E0B',
                }}>
                  {acc.status}
                </span>
              </div>

              {/* Employee Info */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>
                    {acc.employeeId?.prenom?.charAt(0)}{acc.employeeId?.nom?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {acc.employeeId?.nom} {acc.employeeId?.prenom}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {acc.employeeId?.matricule}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Type Compte</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{acc.accountType}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Numéro Compte</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{acc.accountNumber}</div>
                </div>
              </div>

              {/* Balance */}
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Solde Disponible</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  {(acc.solde || 0).toLocaleString('fr-FR')}
                  <span style={{ fontSize: '1rem', opacity: 0.9 }}>TND</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAccount(acc);
                  }}
                  className="action-btn"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.7rem', borderRadius: '10px', border: 'none', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Eye size={16} />
                  Détails
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAccount(acc);
                    setShowDepositModal(true);
                  }}
                  className="action-btn"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.7rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  <DollarSign size={16} />
                  Dépôt
                </button>
                {acc.status === 'ACTIVE' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFreeze(acc._id);
                    }}
                    className="action-btn"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.7rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <Lock size={16} />
                    Bloquer
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnfreeze(acc._id);
                    }}
                    className="action-btn"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.7rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <Unlock size={16} />
                    Débloquer
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {filteredAccounts.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={40} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Aucun compte trouvé</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {searchTerm ? 'Essayez avec d\'autres critères de recherche' : 'Aucun compte correspondant aux filtres sélectionnés'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedAccount && !showDepositModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setSelectedAccount(null)}
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
                      Détails du Compte
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Informations complètes du compte</p>
                  </div>
                  <button
                    onClick={() => setSelectedAccount(null)}
                    style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: 'var(--bg)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Employee Card */}
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
                      {selectedAccount.employeeId?.prenom?.charAt(0)}{selectedAccount.employeeId?.nom?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {selectedAccount.employeeId?.nom} {selectedAccount.employeeId?.prenom}
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        {selectedAccount.employeeId?.poste}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.95 }}>
                      <Briefcase size={16} />
                      {selectedAccount.employeeId?.matricule}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.95 }}>
                      <Mail size={16} />
                      {selectedAccount.employeeId?.email}
                    </div>
                  </div>
                </div>

                {/* Account Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <CreditCard size={18} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Numéro Compte</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                      {selectedAccount.accountNumber}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Wallet size={18} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Type Compte</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {selectedAccount.accountType}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <TrendingUp size={18} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Statut</span>
                    </div>
                    <div>
                      <span style={{
                        padding: '0.4rem 0.9rem',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: selectedAccount.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: selectedAccount.status === 'ACTIVE' ? '#10B981' : '#F59E0B',
                      }}>
                        {selectedAccount.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Date Création</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {new Date(selectedAccount.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>

                {/* Balance Card */}
                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Solde Disponible
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                    {(selectedAccount.solde || 0).toLocaleString('fr-FR')}
                    <span style={{ fontSize: '1.25rem', opacity: 0.9 }}>TND</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <button
                    onClick={() => {
                      setShowDepositModal(true);
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
                    <DollarSign size={20} />
                    Effectuer un Dépôt
                  </button>

                  {selectedAccount.status === 'ACTIVE' ? (
                    <button
                      onClick={() => {
                        handleFreeze(selectedAccount._id);
                        setSelectedAccount(null);
                      }}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
                      Bloquer le Compte
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleUnfreeze(selectedAccount._id);
                        setSelectedAccount(null);
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
                      Débloquer le Compte
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && selectedAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => {
              setShowDepositModal(false);
              setDepositAmount('');
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1001,
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
                maxWidth: '500px',
                width: '100%',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Effectuer un Dépôt
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Ajouter des fonds au compte de {selectedAccount.employeeId?.prenom}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositAmount('');
                  }}
                  style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: 'var(--bg)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Current Balance */}
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', color: 'white' }}>
                <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Solde Actuel
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  {(selectedAccount.solde || 0).toLocaleString('fr-FR')}
                  <span style={{ fontSize: '1rem', opacity: 0.9 }}>TND</span>
                </div>
              </div>

              {/* Amount Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Montant à Déposer (TND)
                </label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      border: '2px solid var(--border)',
                      borderRadius: '12px',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                      background: 'var(--bg)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                {depositAmount && Number(depositAmount) > 0 && (
                  <div style={{ marginTop: '0.75rem', padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Nouveau Solde</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>
                      {((selectedAccount.solde || 0) + Number(depositAmount)).toLocaleString('fr-FR')} TND
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositAmount('');
                  }}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '2px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={!depositAmount || Number(depositAmount) <= 0 || depositLoading}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: (!depositAmount || Number(depositAmount) <= 0 || depositLoading) 
                      ? 'var(--border)' 
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: (!depositAmount || Number(depositAmount) <= 0 || depositLoading) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!(!depositAmount || Number(depositAmount) <= 0 || depositLoading)) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {depositLoading ? (
                    <>
                      <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight size={20} />
                      Confirmer le Dépôt
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AgenceAccountsPage;
