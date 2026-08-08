import { useEffect, useState } from 'react';
import { Plus, Building2, Users, Search, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  managerId?: { nom: string; prenom: string };
  isActive: boolean;
  employeeCount: number;
}

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/departments', form);
      setShowModal(false);
      setForm({ name: '', code: '', description: '' });
      fetchDepartments();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce département ?')) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ── Header ── */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(10,17,33,0.9) 100%)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Départements</h1>
          <p className="page-subtitle">Gérez la structure organisationnelle</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Nouveau Département
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
              <div className="stat-icon si-blue"><Building2 size={24} /></div>
              <div>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px', fontSize: '0.9rem' }}>Total Départements</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{departments.length}</h3>
              </div>
            </div>
            
            <div className="glass-card-sm" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="stat-icon si-green"><Users size={24} /></div>
              <div>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px', fontSize: '0.9rem' }}>Départements Actifs</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{departments.filter(d => d.isActive).length}</h3>
              </div>
            </div>

            <div className="glass-card-sm" style={{ display: 'flex', alignItems: 'center', gridColumn: '1 / -1' }}>
              <Search size={20} style={{ color: 'var(--text-muted)', marginRight: '1rem' }} />
              <input
                type="text"
                placeholder="Rechercher un département..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', color: '#fff', 
                  width: '100%', fontSize: '1rem', outline: 'none'
                }}
              />
            </div>
          </div>

          {/* ── Table ── */}
          <div className="table-container">
            <table className="stb-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Département</th>
                  <th>Description</th>
                  <th>Manager</th>
                  <th>Employés</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((dept) => (
                  <tr key={dept._id}>
                    <td>
                      <span className="badge" style={{ background: 'var(--stb-blue-100)', color: 'var(--stb-blue-400)' }}>
                        {dept.code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{dept.name}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dept.description || '-'}
                    </td>
                    <td>{dept.managerId ? `${dept.managerId.prenom} ${dept.managerId.nom}` : '-'}</td>
                    <td>{dept.employeeCount}</td>
                    <td>
                      {dept.isActive ? (
                        <span className="badge" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>Actif</span>
                      ) : (
                        <span className="badge" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>Inactif</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(dept._id)} style={{ padding: '0.4rem', color: 'var(--danger)' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      Aucun département trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
              style={{ width: '100%', maxWidth: 500, padding: '2rem' }}
            >
              <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem' }}>Nouveau Département</h2>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>Code</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: '#fff' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>Nom</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: '#fff' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: '#fff', minHeight: 100 }}
                  />
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

export default Departments;
