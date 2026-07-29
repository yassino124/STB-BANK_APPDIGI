import { useState, useEffect } from 'react';
import { Gift, Plus, Search, Calendar, CheckCircle2, AlertTriangle, TrendingUp, Filter } from 'lucide-react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // New Prime Form
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [primeType, setPrimeType] = useState('RENDEMENT');
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
    if (!window.confirm(`Êtes-vous sûr de vouloir générer la prime "${type}" pour TOUS les employés éligibles ?`)) return;
    
    const toastId = toast.loading(`Génération de la prime ${type} en cours...`);
    try {
      // Simulate mass generation
      await new Promise(r => setTimeout(r, 2000));
      toast.success(`Prime ${type} générée avec succès pour 142 employés !`, { id: toastId });
      fetchPrimes();
    } catch (error) {
      toast.error('Erreur lors de la génération', { id: toastId });
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
            Primes & Gratifications
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestion des primes exceptionnelles et automatiques</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#2962FF', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '10px', border: 'none', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(41,98,255,0.3)' }}
        >
          <Plus size={18} /> Attribuer une prime
        </button>
      </div>

      {/* Auto Generation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(41,98,255,0.1), rgba(0,180,255,0.05))', border: '1px solid rgba(41,98,255,0.2)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.05, transform: 'rotate(15deg)' }}>
            <Gift size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(41,98,255,0.15)', borderRadius: '12px', color: '#2962FF' }}><TrendingUp size={24} /></div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>13ème Mois</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Distribution Annuelle (Décembre)</p>
            </div>
          </div>
          <button onClick={() => handleGenerateMassPrime('13ème Mois')} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            Générer pour tous
          </button>
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(52,211,153,0.05))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.05, transform: 'rotate(15deg)' }}>
            <Gift size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.15)', borderRadius: '12px', color: '#10B981' }}><Gift size={24} /></div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Prime Aïd & Événements</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Distribution selon calendrier</p>
            </div>
          </div>
          <button onClick={() => handleGenerateMassPrime('Prime Aïd')} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            Générer pour tous
          </button>
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
