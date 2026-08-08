import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Building2, Shield, Wallet, Users } from 'lucide-react';

const Login = () => {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(matricule, password);
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur de connexion';
      setError(msg);
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

      <div style={{ position: 'absolute', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(41,98,255,0.1) 0%, transparent 70%)', top: '-20%', left: '-10%', zIndex: 0 }} />
      <div style={{ position: 'absolute', width: '900px', height: '900px', background: 'radial-gradient(circle, rgba(13,71,161,0.15) 0%, transparent 70%)', bottom: '-20%', right: '-10%', zIndex: 0 }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '440px', padding: '3.5rem 3rem', position: 'relative', zIndex: 1, border: '1px solid var(--border-blue)', boxShadow: '0 16px 64px rgba(0,0,0,0.6)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '100px', height: '100px', margin: '0 auto 1.5rem', borderRadius: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(41,98,255,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
          }}>
            <img src="/stb_logo.png" alt="STB" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px' }}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                const parent = img.parentElement;
                if (parent && !parent.querySelector('span')) {
                  parent.style.background = 'linear-gradient(135deg, #0d266b, #2962FF)';
                  const span = document.createElement('span');
                  span.style.cssText = 'font-size:1.4rem;font-weight:900;color:#fff;letter-spacing:-0.5px';
                  span.textContent = 'STB';
                  parent.appendChild(span);
                }
              }} />
          </div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800 }}>STB Omni-Roles</h1>
          <p style={{ color: 'var(--stb-blue-400)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Authentification Entreprise</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--r-md)', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#EF4444', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Identifiant ou Matricule</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1.1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <User size={18} />
              </div>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '3rem', height: '52px' }}
                placeholder="Ex: RH001"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Mot de passe</label>
              <a href="#" style={{ fontSize: '0.8rem', color: 'var(--stb-blue-400)', fontWeight: 600 }}>Oublié ?</a>
            </div>
            <div style={{ position: 'relative', marginTop: '0.5rem' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1.1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </div>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '3rem', height: '52px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '1.1rem', fontSize: '1.05rem', borderRadius: 'var(--r-md)' }}
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rôles disponibles</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              { icon: Shield, label: 'RH', color: '#3B82F6' },
              { icon: Wallet, label: 'Finance', color: '#10B981' },
              { icon: Building2, label: 'Agence', color: '#F59E0B' },
              { icon: Users, label: 'Direction', color: '#EF4444' },
            ].map((role) => (
              <div key={role.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                <role.icon size={14} style={{ color: role.color }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{role.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
