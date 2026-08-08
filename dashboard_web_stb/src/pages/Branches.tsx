import { useEffect, useState } from 'react';
import { Plus, MapPin, Search, Trash2, Building } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

interface Branch {
  _id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  managerId?: { nom: string; prenom: string };
  isActive: boolean;
}

const Branches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', address: '', city: '', country: '', phone: '', email: '' });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/branches', form);
      setShowModal(false);
      setForm({ name: '', code: '', address: '', city: '', country: '', phone: '', email: '' });
      fetchBranches();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette agence ?')) return;
    try {
      await api.delete(`/branches/${id}`);
      fetchBranches();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = branches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.city.toLowerCase().includes(search.toLowerCase()) ||
    b.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ── Header ── */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(10,17,33,0.9) 100%)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Agences</h1>
          <p className="page-subtitle">Gérez les succursales et points de vente</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Nouvelle Agence
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="glass-card-sm" style={{ height: 100, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div className="glass-card-sm" style={{ height: 100, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
          <div className="glass-card" style={{ height: 400, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      ) : (
        <>
          {/* ── Stats & Search ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div className="glass-card-sm" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="stat-icon si-green"><Building size={24} /></div>
              <div>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px', fontSize: '0.9rem' }}>Total Agences</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{branches.length}</h3>
              </div>
            </div>

            <div className="glass-card-sm" style={{ display: 'flex', alignItems: 'center', gridColumn: '1 / -1' }}>
              <Search size={20} style={{ color: 'var(--text-muted)', marginRight: '1rem' }} />
              <input
                type="text"
                placeholder="Rechercher une agence par nom, code ou ville..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', color: '#fff', 
                  width: '100%', fontSize: '1rem', outline: 'none'
                }}
              />
            </div>
          </div>

          {/* ── Cards Grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((branch) => (
              <div key={branch._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {branch.name}
                    </h3>
                    <span className="badge" style={{ background: 'var(--stb-blue-100)', color: 'var(--stb-blue-400)' }}>
                      Code: {branch.code}
                    </span>
                  </div>
                  {branch.isActive ? (
                    <span className="badge" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>Active</span>
                  ) : (
                    <span className="badge" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>Inactive</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <MapPin size={16} style={{ marginTop: 2, color: 'var(--text-muted)' }} />
                    <span>{branch.address}<br/>{branch.city}, {branch.country}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Téléphone</span>
                      <span>{branch.phone || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</span>
                      <span>{branch.email || '-'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '1rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(branch._id)} style={{ color: 'var(--danger)', padding: '0.4rem 0.8rem' }}>
                    <Trash2 size={16} style={{ marginRight: '0.5rem' }} /> Supprimer
                  </button>
                </div>
              </div>
            ))}
            
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed var(--border)' }}>
                <Building size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ color: 'var(--text-secondary)' }}>Aucune agence trouvée</h3>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Modal Creation ── */}
      <AnimatePresence>
        {showModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card" 
              style={{ width: '100%', maxWidth: 600, padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem' }}>Nouvelle Agence</h2>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>Code</label>
                    <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: '#fff' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>Nom</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: '#fff' }} required />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>Adresse complète</label>
                  <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: '#fff' }} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>Ville</label>
                    <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: '#fff' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>Pays</label>
                    <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: '#fff' }} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>Téléphone</label>
                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: '#fff' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: '#fff' }} required />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary">Créer</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Branches;
