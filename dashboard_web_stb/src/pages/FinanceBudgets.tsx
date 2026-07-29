import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, AlertTriangle, Plus, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const FinanceBudgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', department: '', amount: '', commentaire: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/finance/budgets').catch(() => null);
        setBudgets(res?.data?.data || []);
      } catch (err: any) {
        setError(err?.message || 'Erreur de chargement');
        toast.error('Erreur lors du chargement des budgets');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await api.post('/finance/budgets', {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setBudgets([res.data.data || res.data, ...budgets]);
      setShowForm(false);
      setFormData({ name: '', department: '', amount: '', commentaire: '' });
      toast.success('Budget créé avec succès');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/finance/budgets/${id}/status`, { status });
      setBudgets(budgets.map((b) => (b._id === id ? { ...b, status } : b)));
      toast.success(`Budget mis à jour: ${status}`);
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: '#6B7280',
    APPROVED: '#2962FF',
    ACTIVE: '#10B981',
    COMPLETED: '#8B5CF6',
    CANCELLED: '#EF4444',
  };

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
            Gestion des Budgets
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Suivi des budgets par département</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: '#2962FF',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Plus size={14} /> Nouveau Budget
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--card-bg)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            marginBottom: '1rem',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Nouveau Budget</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input
              placeholder="Nom du budget"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
            />
            <input
              placeholder="Département"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
            />
            <input
              placeholder="Montant (TND)"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
            />
            <input
              placeholder="Commentaire (optionnel)"
              value={formData.commentaire}
              onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              onClick={handleCreate}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#10B981', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Créer
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Annuler
            </button>
          </div>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {budgets.map((b: any, i: number) => (
          <motion.div
            key={b._id || i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: 'var(--card-bg)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{b.name}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.department}</p>
              </div>
              <span style={{
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.7rem',
                fontWeight: 600,
                background: `${statusColors[b.status] || '#6B7280'}15`,
                color: statusColors[b.status] || '#6B7280',
              }}>
                {b.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Montant: </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {b.amount?.toLocaleString('fr-FR')} TND
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {b.status === 'DRAFT' && (
                  <button
                    onClick={() => handleUpdateStatus(b._id, 'APPROVED')}
                    style={{ padding: '2px 8px', borderRadius: '6px', border: 'none', background: '#2962FF', color: '#fff', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Approuver
                  </button>
                )}
                {b.status === 'APPROVED' && (
                  <button
                    onClick={() => handleUpdateStatus(b._id, 'ACTIVE')}
                    style={{ padding: '2px 8px', borderRadius: '6px', border: 'none', background: '#10B981', color: '#fff', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Activer
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {budgets.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Aucun budget créé
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceBudgets;