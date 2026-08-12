import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, LayoutTemplate, Box, Sparkles, Wrench, GitMerge, Webhook, Users, Building, ShieldCheck, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, title: 'Dashboard', subtitle: 'Platform overview', path: '/' },
  { id: 'employees', icon: Users, title: 'Collaborateurs', subtitle: 'Annuaire et gestion RH', path: '/employees' },
  { id: 'marketplace', icon: LayoutTemplate, title: 'Marketplace', subtitle: 'Browse 200+ templates', path: '/' },
  { id: 'app_builder', icon: Box, title: 'App Builder', subtitle: 'Visual application builder', path: '/' },
  { id: 'forge_ai', icon: Sparkles, title: 'Forge AI', subtitle: 'AI banking copilot', path: '/' },
  { id: 'rule_builder', icon: Wrench, title: 'Rule Builder', subtitle: 'Visual business rules', path: '/rules' },
  { id: 'workflow_builder', icon: GitMerge, title: 'Workflow Builder', subtitle: 'Approval workflows', path: '/requests' },
  { id: 'api_center', icon: Webhook, title: 'API Center', subtitle: 'Manage integrations', path: '/' },
  { id: 'finance', icon: Banknote, title: 'Finance & Paie', subtitle: 'Masse salariale et avances', path: '/finance' },
  { id: 'security', icon: ShieldCheck, title: 'Sécurité', subtitle: 'Alertes et centre de sécurité', path: '/security' },
  { id: 'agences', icon: Building, title: 'Agences', subtitle: 'Gestion des agences STB', path: '/branches' },
];

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleOpenEvent = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleOpenEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredItems = navItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        navigate(filteredItems[selectedIndex].path);
        setIsOpen(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(5, 9, 20, 0.7)',
              backdropFilter: 'blur(8px)',
              zIndex: 99999
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '15%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '650px',
              background: '#0B1120',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              zIndex: 100000,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Search Input Area */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Search size={22} color="rgba(255,255,255,0.4)" style={{ marginRight: '1rem' }} />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, apps, APIs, employees..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.1rem',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <div 
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                onClick={() => setIsOpen(false)}
              >
                ESC
              </div>
            </div>

            {/* Results Area */}
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '1rem' }}>
              {filteredItems.length > 0 && <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: '0 0.5rem 0.5rem', letterSpacing: '1px' }}>JUMP TO</div>}
              
              {filteredItems.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                  Aucun résultat trouvé pour "{searchQuery}"
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {filteredItems.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => {
                          navigate(item.path);
                          setIsOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          background: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: isSelected ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid transparent'
                        }}
                      >
                        <div style={{ 
                          width: '40px', height: '40px', 
                          borderRadius: '10px', 
                          background: 'rgba(255,255,255,0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginRight: '1rem'
                        }}>
                          <Icon size={18} color={isSelected ? '#3B82F6' : 'rgba(255,255,255,0.6)'} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 500, marginBottom: '2px' }}>{item.title}</div>
                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{item.subtitle}</div>
                        </div>
                        {isSelected && (
                          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' }}>
                            →
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0.75rem 1.5rem', 
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 800 }}>↑↓</span> Navigate
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 800 }}>↵</span> Open
                </span>
              </div>
              <div style={{ color: '#3B82F6', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>
                STB OS ⌘K
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
