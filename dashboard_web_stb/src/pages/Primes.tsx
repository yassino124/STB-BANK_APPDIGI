import { useState, useEffect } from 'react';
import { Gift, Plus, Search, Calendar, CheckCircle2, AlertTriangle, TrendingUp, Filter, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Employee {
  _id: string;
  matricule: string;
  nom: string;
  prenom: string;
  poste: string;
  departement: string;
}

interface Prime {
  _id: string;
  employeeId: Employee;
  type: string;
  montant: number;
  status: string;
  createdAt: string;
}

const Primes = () => {
  const [primes, setPrimes] = useState<Prime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [distributing, setDistributing] = useState(false);
  
  // Distribution amounts (configurable by Finance)
  const [massAmounts, setMassAmounts] = useState<Record<string, number>>({
    'PERFORMANCE': 1000,
    'AID':         500,
    'RAMADAN':     300,
    'VACANCES':    400,
    'ANCIENNETE':  700,
    'EXCEPTIONNELLE': 500,
  });

  const stats = {
    total: primes.length,
    pending: primes.filter(p => p.status === 'PENDING' || p.status === 'EN_ATTENTE').length,
    approved: primes.filter(p => p.status === 'APPROVED' || p.status === 'APPROUVE' || p.status === 'PAID').length,
    totalAmount: primes.filter(p => p.status === 'APPROVED' || p.status === 'APPROUVE' || p.status === 'PAID').reduce((sum, p) => sum + (p.montant || 0), 0)
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // New Prime Form
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [primeType, setPrimeType] = useState('PERFORMANCE');
  const [montant, setMontant] = useState('');
  const [motif, setMotif] = useState('');

  useEffect(() => {
    fetchPrimes();
    fetchEmployees();
  }, []);

  const fetchPrimes = async () => {
    try {
      // In a real scenario, this would be a dedicated endpoint like /rh/primes
      // Here we simulate it or fetch from a generic endpoint
      const res = await api.get('/primes/all').catch(() => ({ data: { data: [] } }));
      setPrimes(res.data?.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des primes');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreatePrime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !montant) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const toastId = toast.loading('Attribution de la prime...');
    try {
      await api.post('/primes/admin-create', {
        employeeId: selectedEmpId,
        type: primeType,
        montant: Number(montant),
        description: motif || `Prime de ${primeType}`,
      });
      toast.success('Prime attribuée avec succès !', { id: toastId });
      setIsModalOpen(false);
      fetchPrimes();
    } catch (error) {
      toast.error('Erreur lors de l\'attribution', { id: toastId });
    }
  };

  const handleGenerateMassPrime = async (type: string) => {
    const amount = massAmounts[type] || 500;
    if (!window.confirm(`🎁 Distribuer la prime "${type}" (${amount} TND) à TOUS les employés actifs maintenant ?\n\nCette opération créditera les comptes immédiatement.`)) return;
    
    setDistributing(true);
    const toastId = toast.loading(`Distribution prime ${type} en cours...`);
    try {
      const res = await api.post('/primes/distribute', {
        type,
        montant: amount,
        description: `Prime ${type} — Distribution Finance STB`,
      });
      const result = res.data;
      toast.success(
        `✅ Prime ${type} distribuée ! ${result.credited}/${result.total} employés crédités — ${result.montantTotal?.toLocaleString('fr-TN')} TND`,
        { id: toastId, duration: 6000 }
      );
      fetchPrimes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la distribution', { id: toastId });
    } finally {
      setDistributing(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 900, 
            color: 'var(--text-primary)', 
            marginBottom: '0.25rem',
            background: 'linear-gradient(135deg, #2962FF 0%, #00BCD4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Primes & Gratifications
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Gestion des primes exceptionnelles et automatiques</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#2962FF', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '10px', border: 'none', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(41,98,255,0.3)' }}
        >
          <Plus size={18} /> Attribuer une prime
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.25rem', 
        marginBottom: '2rem'
      }}>
        {/* Total */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '1.5rem', color: '#fff', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <Gift size={28} style={{ opacity: 0.9 }} />
            <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 600 }}>TOTAL</span>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.25rem' }}>{stats.total}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Primes accordées</div>
        </motion.div>

        {/* En Attente */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)', borderRadius: '16px', padding: '1.5rem', color: '#fff', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <Clock size={28} style={{ opacity: 0.9 }} />
            <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 600 }}>EN ATTENTE</span>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.25rem' }}>{stats.pending}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>À valider</div>
        </motion.div>

        {/* Approuvées */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', borderRadius: '16px', padding: '1.5rem', color: '#fff', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <CheckCircle2 size={28} style={{ opacity: 0.9 }} />
            <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 600 }}>APPROUVÉES</span>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.25rem' }}>{stats.approved}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Validées</div>
        </motion.div>

        {/* Montant Total */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', borderRadius: '16px', padding: '1.5rem', color: '#fff', boxShadow: '0 8px 24px rgba(14, 165, 233, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, opacity: 0.9 }}>$</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 600 }}>MONTANT TOTAL</span>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.25rem' }}>
            {stats.totalAmount >= 1000 ? `${(stats.totalAmount / 1000).toFixed(1)}K` : stats.totalAmount}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>TND distribués</div>
        </motion.div>
      </div>

      {/* Auto Distribution Cards */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(41,98,255,0.12)', borderRadius: '10px' }}>
            <TrendingUp size={20} color="#2962FF" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Distribution Automatique</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Les cron jobs versent automatiquement à la date prévue. Vous pouvez aussi déclencher manuellement.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {[
            { type: 'PERFORMANCE', label: 'Prime Annuelle', icon: '🎁', desc: 'Cron: 1er Décembre', color: '#2962FF', bg: 'rgba(41,98,255,0.08)' },
            { type: 'AID',         label: 'Prime Aïd',      icon: '🌙', desc: 'Cron: 25 Mars + 15 Juin', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
            { type: 'RAMADAN',     label: 'Prime Ramadan',  icon: '✨', desc: 'Cron: 1er Mars', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
            { type: 'VACANCES',    label: 'Prime Vacances', icon: '☀️', desc: 'Cron: 1er Juillet', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
            { type: 'ANCIENNETE',  label: 'Prime Ancienneté', icon: '🏆', desc: 'Cron: 1er Janvier (par tranches)', color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
            { type: 'EXCEPTIONNELLE', label: 'Prime Exceptionnelle', icon: '⭐', desc: 'Déclenchement manuel uniquement', color: '#06B6D4', bg: 'rgba(6,182,212,0.08)' },
          ].map(card => (
            <div key={card.type} style={{ background: card.bg, border: `1px solid ${card.color}25`, borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{card.icon}</span>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{card.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{card.desc}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <input
                  type="number"
                  value={massAmounts[card.type] || 500}
                  onChange={e => setMassAmounts(prev => ({ ...prev, [card.type]: Number(e.target.value) }))}
                  min={50}
                  style={{
                    flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px',
                    border: `1px solid ${card.color}40`, background: 'var(--bg-primary)',
                    color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700,
                  }}
                />
                <span style={{ fontSize: '0.8rem', color: card.color, fontWeight: 600 }}>TND</span>
              </div>
              <button
                onClick={() => handleGenerateMassPrime(card.type)}
                disabled={distributing}
                style={{
                  width: '100%', padding: '0.6rem', borderRadius: '10px', border: 'none',
                  background: card.color, color: '#fff', fontWeight: 700, cursor: distributing ? 'wait' : 'pointer',
                  fontSize: '0.85rem', opacity: distributing ? 0.6 : 1,
                  boxShadow: `0 4px 12px ${card.color}30`,
                }}
              >
                {distributing ? '⏳ En cours...' : '▶ Distribuer maintenant'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Historique des attributions</h2>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collaborateur</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type de Prime</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Montant</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</td></tr>
              ) : primes.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune prime trouvée. Le système génèrera les primes automatiques ici.</td></tr>
              ) : (
                primes.map((prime) => (
                  <tr key={prime._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2962FF, #00B4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
                          {prime.employeeId?.prenom?.charAt(0)}{prime.employeeId?.nom?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{prime.employeeId?.prenom} {prime.employeeId?.nom}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prime.employeeId?.matricule}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Gift size={14} color="var(--accent-gold)" />
                        {prime.type}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                      {prime.montant.toLocaleString('fr-TN')} TND
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {format(new Date(prime.createdAt || new Date()), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                        Versée
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '20px', width: '100%', maxWidth: '450px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Attribuer une Prime</h2>
            <form onSubmit={handleCreatePrime}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Collaborateur *</label>
                <select value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                  <option value="">Sélectionner un collaborateur...</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.matricule} - {emp.prenom} {emp.nom}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Type de Prime *</label>
                <select value={primeType} onChange={(e) => setPrimeType(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                  <option value="RENDEMENT">Prime de Rendement</option>
                  <option value="OBJECTIF">Prime sur Objectif</option>
                  <option value="BILAN">Prime de Bilan</option>
                  <option value="EXCEPTIONNELLE">Prime Exceptionnelle</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Montant (TND) *</label>
                <input type="number" value={montant} onChange={(e) => setMontant(e.target.value)} required min="1" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
                  Annuler
                </button>
                <button type="submit" style={{ flex: 1, padding: '0.85rem', borderRadius: '10px', border: 'none', background: '#2962FF', color: '#fff', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(41,98,255,0.3)' }}>
                  Attribuer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Primes;
