import { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Topbar = () => {
  const { user, primaryRole } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <motion.header
      initial={{ y: -70 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="topbar"
    >
      <motion.div 
        className="search-box"
        animate={{ width: isSearchFocused ? 320 : 250 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ overflow: 'hidden' }}
      >
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Rechercher par nom, matricule..."
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
          readOnly
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '4px',
          padding: '2px 6px',
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          fontFamily: 'monospace',
          fontWeight: 700
        }}>
          ⌘K
        </div>
      </motion.div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <motion.div whileHover={{ scale: 1.1, rotate: 10 }} whileTap={{ scale: 0.9 }}>
          <Link to="/notifications" className="btn-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={18} />
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{
                position: 'absolute', top: '-2px', right: '-2px',
                width: '10px', height: '10px',
                background: 'var(--danger)',
                borderRadius: '50%',
                border: '2px solid rgba(6, 13, 26, 0.85)'
              }}
            />
          </Link>
        </motion.div>

        <div style={{ height: '30px', width: '1px', background: 'var(--border)', margin: '0 0.5rem' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.matricule || 'Admin'}</p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--stb-blue-400)', fontWeight: 600 }}>{primaryRole || 'Utilisateur'}</p>
          </div>
          <div className="avatar avatar-md" style={{ border: '2px solid var(--border-blue)', overflow: 'hidden', position: 'relative' }}>
            {user?._id ? (
              <img
                src={`/api/v1/employees/${user._id}/avatar`}
                alt={user?.matricule || 'User'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('span')) {
                    const span = document.createElement('span');
                    span.style.cssText = 'font-size:0.85rem;font-weight:800;color:#fff';
                    const mat = user?.matricule || 'AD';
                    span.textContent = mat.slice(0, 2).toUpperCase();
                    parent.appendChild(span);
                  }
                }}
              />
            ) : (
              <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                {(user?.matricule || 'AD').slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Topbar;
