import { useEffect, useState } from 'react';
import { Plus, Search, MoreVertical, ShieldBan, ShieldCheck, Monitor, UserCheck, Filter, Download, Wallet } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Employee {
  _id: string;
  matricule: string;
  cin: string;
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  status: string;
  roles: string[];
  poste: string | null;
  departement: string | null;
  agence: string | null;
  isActivated: boolean;
  avatar?: string | null;
}

const getStatusBadge = (status: string) => {
  const map: Record<string, React.ReactNode> = {
    ACTIVE: <span className="badge badge-active">Actif</span>,
    INACTIVE: <span className="badge badge-inactive">Inactif</span>,
    PENDING_ACTIVATION: <span className="badge badge-pending">En attente</span>,
    SUSPENDED: <span className="badge badge-inactive">Suspendu</span>,
  };
  return map[status] || <span className="badge">{status}</span>;
};

const getRoleBadge = (role: string) => {
  const map: Record<string, string> = {
    EMPLOYEE: 'blue', RH: 'teal', MANAGER: 'purple',
    FINANCE: 'gold', ADMIN: 'red', SUPER_ADMIN: 'red',
  };
  const colorCls = map[role] || 'blue';
  return (
    <span key={role} className={`badge badge-${colorCls}`} style={{ padding: '0.15rem 0.5rem', fontSize: '0.68rem', fontWeight: 800 }}>
      {role}
    </span>
  );
};

const Employees = () => {
  const navigate = useNavigate();
  const { isRH, isIT, isFinance } = useAuth();
  const canManage = isRH || isIT;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchEmployees = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/employees?limit=100&search=${q}`);
      console.log('📊 API Response:', res.data);
      
      // Handle different response formats
      const employeesList = res.data?.data || res.data || [];
      console.log('👥 Employees:', employeesList);
      
      setEmployees(Array.isArray(employeesList) ? employeesList : []);
    } catch (err: any) {
      console.error('❌ Fetch Error:', err);
      console.error('❌ Error Response:', err.response?.data);
      console.error('❌ Error Status:', err.response?.status);
      
      if (err.response?.status === 403) {
        toast.error('Accès refusé: Vous n\'avez pas les permissions RH');
      } else if (err.response?.status === 401) {
        toast.error('Session expirée, reconnexion...');
      } else {
        toast.error(`Erreur de chargement: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const toggleStatus = async (id: string, cur: string) => {
    const next = cur === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.patch(`/employees/${id}/status`, { status: next });
      toast.success(`Statut modifié avec succès`);
      fetchEmployees(search);
    } catch { toast.error('Erreur lors de la modification du statut'); }
  };

  const promoteToRH = async (id: string, prenom: string, nom: string) => {
    const confirmed = window.confirm(
      `Promouvoir ${prenom} ${nom} en Ressources Humaines?\n\n` +
      `Cette personne aura accès au dashboard RH et pourra gérer les collaborateurs.`
    );
    
    if (!confirmed) return;

    try {
      const emp = employees.find(e => e._id === id);
      const currentRoles = emp?.roles || ['EMPLOYEE'];
      const newRoles = currentRoles.includes('RH') ? currentRoles : [...currentRoles, 'RH'];
      
      await api.patch(`/employees/${id}/roles`, { roles: newRoles });
      toast.success(`${prenom} ${nom} est maintenant RH !`);
      fetchEmployees(search);
    } catch (err: any) {
      console.error('❌ Promote Error:', err);
      toast.error(`Erreur: ${err.response?.data?.message || err.message}`);
    }
  };

  const filtered = employees.filter(e =>
    (filterStatus === 'ALL' || e.status === filterStatus)
  );

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error('Aucune donnée à exporter');
      return;
    }
    
    // Create CSV content
    const headers = ['Matricule', 'CIN', 'Nom', 'Prenom', 'Email', 'Telephone', 'Poste', 'Departement', 'Statut', 'Roles'];
    const rows = filtered.map(e => [
      e.matricule, 
      e.cin, 
      e.nom, 
      e.prenom, 
      e.email, 
      e.phone || '', 
      e.poste || '', 
      e.departement || '', 
      e.status, 
      (e.roles || []).join(';')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(v => `"${v}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rapport_Collaborateurs_STB_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Rapport exporté avec succès !');
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="page-title">
            {isIT && !isRH ? '🖥️ Gestion des Comptes' : isFinance ? 'Annuaire Collaborateurs' : 'Annuaire RH'}
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="page-subtitle">
            Gestion des collaborateurs STB ({filtered.length} affichés)
          </motion.p>
        </div>
        
        {isRH && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleExport} className="btn btn-secondary">
              <Download size={16} />
              Exporter
            </button>
            <Link to="/employees/new" className="btn btn-primary">
              <Plus size={18} />
              Nouveau Collaborateur
            </Link>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
            <form onSubmit={e => { e.preventDefault(); fetchEmployees(search); }} className="search-box" style={{ maxWidth: '350px', background: 'rgba(0,0,0,0.4)' }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Matricule, nom, département..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </form>
            <button className="btn-icon">
              <Filter size={16} />
            </button>
          </div>

          <div className="tab-bar" style={{ position: 'relative', display: 'flex', gap: '0.2rem' }}>
            {['ALL', 'ACTIVE', 'PENDING_ACTIVATION', 'SUSPENDED'].map(s => (
              <button 
                key={s} 
                onClick={() => setFilterStatus(s)} 
                style={{ 
                  position: 'relative', 
                  padding: '0.65rem 1.25rem', 
                  borderRadius: 'var(--r-lg)', 
                  border: 'none', 
                  background: 'transparent',
                  color: filterStatus === s ? '#fff' : 'var(--text-muted)',
                  fontWeight: filterStatus === s ? 700 : 600,
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer',
                  zIndex: 1,
                  transition: 'color 0.3s'
                }}
              >
                {filterStatus === s && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, var(--stb-blue-500), var(--stb-electric))',
                      borderRadius: 'var(--r-lg)',
                      boxShadow: '0 4px 16px rgba(41, 98, 255, 0.3), inset 0 1px 1px rgba(255,255,255,0.3)',
                      zIndex: -1
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {s === 'ALL' ? 'Tous' : s === 'ACTIVE' ? 'Actifs' : s === 'PENDING_ACTIVATION' ? 'En attente' : 'Suspendus'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table className="stb-table">
            <thead>
              <tr>
                <th>Collaborateur</th>
                <th>Identité (Matricule / CIN)</th>
                <th>Coordonnées</th>
                <th>Affectation</th>
                <th>Profil / Rôles</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontWeight: 600 }}>Chargement de l'annuaire...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontWeight: 600 }}>Aucun collaborateur trouvé.</td></tr>
              ) : (
                filtered.map((emp, idx) => (
                  <motion.tr 
                    key={emp._id} 
                    initial={{ opacity: 0, x: -20, scale: 0.98 }} 
                    animate={{ opacity: 1, x: 0, scale: 1 }} 
                    transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                    style={{ originX: 0 }}
                  >
                    <td>
                      <Link to={`/employees/${emp._id}/360`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="avatar avatar-md" style={{ border: '2px solid rgba(41, 98, 255, 0.2)', overflow: 'hidden' }}>
                          {emp.avatar ? (
                            <img 
                              src={emp.avatar.startsWith('data:') ? emp.avatar : `/api/v1/employees/${emp._id}/avatar`} 
                              alt={`${emp.prenom} ${emp.nom}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                // Fallback to initials if image fails
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = `${emp.prenom?.[0] || ''}${emp.nom?.[0] || ''}`;
                              }}
                            />
                          ) : (
                            `${emp.prenom?.[0] || ''}${emp.nom?.[0] || ''}`
                          )}
                        </motion.div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{emp.prenom} {emp.nom}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem', fontWeight: 600 }}>
                            {emp.isActivated ? <><UserCheck size={12} color="var(--success)" /> Connecté</> : <><Monitor size={12} color="var(--warning)" /> Jamais connecté</>}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: 'var(--stb-blue-300)' }}>{emp.matricule}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 600 }}>CIN: {emp.cin}</p>
                    </td>
                    <td>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500 }}>{emp.email}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{emp.phone || '—'}</p>
                    </td>
                    <td>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>{emp.poste || <span style={{ color: 'var(--text-muted)' }}>—</span>}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{emp.departement || '—'}</p>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {(emp.roles || []).map(r => getRoleBadge(r))}
                      </div>
                    </td>
                    <td>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        {getStatusBadge(emp.status)}
                      </motion.div>
                    </td>
                    <td className="actions-cell">
                      <div className="action-menu">
                        <button className="btn-icon">
                          <MoreVertical size={16} />
                        </button>
                        <div className="action-menu-content">
                          <Link to={`/employees/${emp._id}/360`} className="action-menu-item">
                            <UserCheck size={14} style={{ color: 'var(--stb-blue-400)' }} /> Profil 360 Complet
                          </Link>
                          <Link to={`/employees/${emp._id}/financials`} className="action-menu-item">
                            <Wallet size={14} style={{ color: 'var(--stb-electric)' }} /> Consulter Profil Financier
                          </Link>
                          {isRH && (
                            <>
                              <button onClick={() => toggleStatus(emp._id, emp.status)} className="action-menu-item">
                                {emp.status === 'ACTIVE' ? <><ShieldBan size={14} style={{ color: 'var(--danger)' }} /> Suspendre compte</> : <><ShieldCheck size={14} style={{ color: 'var(--success)' }} /> Activer compte</>}
                              </button>
                              {!emp.roles?.includes('RH') && (
                                <button onClick={() => promoteToRH(emp._id, emp.prenom, emp.nom)} className="action-menu-item">
                                  <UserCheck size={14} style={{ color: 'var(--stb-blue-400)' }} /> Promouvoir en RH
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Employees;
