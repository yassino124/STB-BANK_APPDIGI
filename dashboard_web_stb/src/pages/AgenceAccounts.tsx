import { useEffect, useState } from 'react';
import { CreditCard, Clock, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface CardAccount {
  _id: string;
  employeeId: { matricule: string; nom: string; prenom: string; poste: string };
  cardType: string;
  status: string;
  cardNumber: string;
  issuedAt: string;
}

const AccountsPage = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/accounts').catch(() => null);
        setAccounts(res?.data?.data || []);
      } catch {
        toast.error('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
        Comptes Bancaires
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Gestion des comptes employés</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
        {accounts.map((acc: any, i: number) => (
          <motion.div key={acc._id || i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{ background: 'var(--card-bg)', borderRadius: '14px', padding: '1.25rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {acc.employeeId?.nom} {acc.employeeId?.prenom}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {acc.employeeId?.matricule} • {acc.employeeId?.poste}
                </div>
              </div>
              <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600,
                background: acc.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                color: acc.status === 'ACTIVE' ? '#10B981' : '#F59E0B' }}>
                {acc.status}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Type</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{acc.accountType}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Solde</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {(acc.balance ?? 0).toLocaleString('fr-FR')} TND
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {accounts.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Aucun compte trouvé
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsPage;