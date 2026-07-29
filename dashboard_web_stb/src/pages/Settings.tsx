import { useState } from 'react';
import { Settings as SettingsIcon, Save, User, Bell, Shield, Palette, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'language', label: 'Langue', icon: Globe },
  ];

  const handleSave = () => {
    setSaved(true);
    toast.success('Paramètres sauvegardés');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: '800px' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
          Paramètres
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gérez vos préférences et paramètres de compte</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--accent-gold)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          background: 'var(--card-bg)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '1.5rem',
        }}
      >
        {activeTab === 'profile' && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Informations du profil</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Matricule</label>
                <input value={user?.matricule || ''} disabled style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Nom</label>
                <input value={user?.nom || ''} disabled style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Prénom</label>
                <input value={user?.prenom || ''} disabled style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Email</label>
                <input value={`${user?.matricule ?? ''}@stb.com.tn`} disabled style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
              </div>
            </div>
            <button
              onClick={handleSave}
              style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none', background: '#2962FF', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={14} /> {saved ? 'Sauvegardé' : 'Sauvegarder'}
            </button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Préférences de notification</h3>
            {['Demandes de congé en attente', 'Avances approuvées', 'Alertes de fraude', 'Nouveaux documents', 'Rapports mensuels'].map((item) => (
              <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item}</span>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: '#ccc', borderRadius: '24px', transition: '0.3s',
                  }}>
                    <span style={{
                      position: 'absolute', content: '""', height: '18px', width: '18px',
                      left: '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '0.3s',
                    }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Paramètres de sécurité</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Mot de passe actuel</label>
                <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Nouveau mot de passe</label>
                <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
              </div>
              <button
                onClick={handleSave}
                style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none', background: '#2962FF', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}
              >
                Mettre à jour le mot de passe
              </button>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Apparence</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Thème</label>
                <select style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">Système</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'language' && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Langue</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <select style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Settings;