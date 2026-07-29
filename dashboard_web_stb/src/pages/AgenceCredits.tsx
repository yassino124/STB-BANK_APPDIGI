import { useEffect, useState } from 'react';
import { TrendingUp, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Credit {
  _id: string;
  employeeId: { matricule: string; nom: string; prenom: string; poste: string };
  amount: number;
  score: number;
  status: string;
  createdAt: string;
}

const CreditsPage = () => {
  
  const navigate = useNavigate();
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/credits').catch(() => null);
        setCredits(res?.data?.data || []);
      } catch {
        toast.error('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDecision = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/credits/${id}/decision`, { decision });
      toast.success(`Demande ${decision === 'APPROVED' ? 'approuvée' : 'refusée'}`);
      setCredits(credits.map(c => c._id === id ? { ...c, status: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED' } : c));
    } catch {
      toast.error('Erreur lors du traitement');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
        Gestion des Crédits
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Validation des demandes de crédit</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {credits.map((credit, i) => (
          <motion.div key={credit._id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{ background: 'var(--card-bg)', borderRadius: '14px', padding: '1.25rem',
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px',
              background: credit.score > 70 ? 'rgba(16,185,129,0.12)' : credit.score > 40 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={20} color={credit.score > 70 ? '#10B981' : credit.score > 40 ? '#F59E0B' : '#EF4444'} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {credit.employeeId?.nom} {credit.employeeId?.prenom}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {credit.employeeId?.matricule} • {credit.employeeId?.poste}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {credit.amount?.toLocaleString('fr-FR')} TND
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Score: {credit.score ?? '—'}
                </span>
                <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 600,
                  background: credit.status === 'PENDING' ? 'rgba(245,158,11,0.15)' : credit.status === 'APPROVED' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  color: credit.status === 'PENDING' ? '#F59E0B' : credit.status === 'APPROVED' ? '#10B981' : '#EF4444' }}>
                  {credit.status}
                </span>
              </div>
            </div>
            {credit.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button onClick={() => handleDecision(credit._id, 'APPROVED')}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: 'none',
                    background: '#10B981', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  Approuver
                </button>
                <button onClick={() => handleDecision(credit._id, 'REJECTED')}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: 'none',
                    background: '#EF4444', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  Refuser
                </button>
              </div>
            )}
            {credit.status !== 'PENDING' && (
              <button onClick={() => navigate(`/agence/credits/${credit._id}`)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px' }}>
                Voir <ArrowRight size={12} />
              </button>
            )}
          </motion.div>
        ))}
        {credits.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Aucune demande de crédit en attente
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditsPage;