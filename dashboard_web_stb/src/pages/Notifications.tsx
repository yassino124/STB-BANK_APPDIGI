import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications/my');
      if (res.data) {
        setNotifications(Array.isArray(res.data) ? res.data : (res.data.data || []));
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      toast.error('Erreur');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Tout a été marqué comme lu');
    } catch (e) {
      // Just visually update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ minHeight: '100%', padding: '1rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Notifications RH
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Restez à jour sur les dernières activités et demandes
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem', background: 'rgba(41,98,255,0.1)',
                border: '1px solid rgba(41,98,255,0.2)', borderRadius: '10px',
                color: '#2962FF', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              <Check size={14} /> Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        padding: '1.5rem',
        backdropFilter: 'blur(20px)'
      }}>
        {loading && notifications.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem' }}>
             <div style={{ width: 36, height: 36, border: '3px solid rgba(41,98,255,0.3)', borderTop: '3px solid #2962FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : notifications.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
             <Bell size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
             <p style={{ fontWeight: 600 }}>Aucune notification</p>
             <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Vous êtes à jour !</p>
           </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AnimatePresence>
              {notifications.map((n, i) => (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                  style={{
                    display: 'flex', gap: '1rem', padding: '1.25rem',
                    background: n.isRead ? 'rgba(255,255,255,0.01)' : 'rgba(41,98,255,0.05)',
                    border: `1px solid ${n.isRead ? 'rgba(255,255,255,0.05)' : 'rgba(41,98,255,0.2)'}`,
                    borderRadius: '16px',
                    cursor: n.isRead ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    alignItems: 'center'
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '12px',
                    background: n.isRead ? 'rgba(255,255,255,0.05)' : '#2962FF',
                    color: n.isRead ? 'var(--text-muted)' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {n.type === 'NEW_REQUEST' ? <Bell size={20} /> : <CheckCircle size={20} />}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: n.isRead ? 600 : 800, color: 'var(--text-primary)' }}>
                        {n.title}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(n.createdAt), { locale: fr, addSuffix: true })}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: n.isRead ? 'var(--text-muted)' : 'rgba(255,255,255,0.8)' }}>
                      {n.body}
                    </p>
                  </div>
                  
                  {!n.isRead && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2962FF', flexShrink: 0 }} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Notifications;
