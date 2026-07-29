import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface Card {
  _id: string;
  employeeId: { matricule: string; nom: string; prenom: string; poste: string };
  cardType: string;
  status: string;
  issuedAt: string;
}

const CardsPage = () => {
  
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/cards').catch(() => null);
        setCards(res?.data?.data || []);
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
        Gestion des Cartes
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Activation, désactivation et suivi des cartes bancaires</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {cards.map((card, i) => (
          <motion.div key={card._id || i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{ background: 'var(--card-bg)', borderRadius: '14px', padding: '1.25rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {card.employeeId?.nom} {card.employeeId?.prenom}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {card.employeeId?.matricule} • {card.cardType}
                </div>
              </div>
              {card.status === 'ACTIVE'
                ? <CheckCircle size={20} color="#10B981" />
                : card.status === 'BLOCKED'
                  ? <XCircle size={20} color="#EF4444" />
                  : <AlertTriangle size={20} color="#F59E0B" />}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600,
                background: card.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: card.status === 'ACTIVE' ? '#10B981' : '#EF4444' }}>
                {card.status}
              </span>
              <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600,
                background: 'rgba(41,98,255,0.1)', color: '#2962FF' }}>
                {card.cardType}
              </span>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              {card.status !== 'ACTIVE' && (
                <button style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                  background: '#10B981', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  Activer
                </button>
              )}
              {card.status === 'ACTIVE' && (
                <button style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                  background: '#EF4444', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  Bloquer
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {cards.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Aucune carte trouvée
          </div>
        )}
      </div>
    </div>
  );
};

export default CardsPage;