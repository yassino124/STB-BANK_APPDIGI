import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Briefcase, Settings, CheckCircle, Copy, Key, TrendingUp, Wallet } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const NewEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [successData, setSuccessData] = useState<{ matricule: string, defaultPassword: string } | null>(null);
  const [allEmployees, setAllEmployees] = useState<Array<{ _id: string, prenom: string, nom: string, matricule: string, roles: string[], poste?: string }>>([]);
  const [departmentsList, setDepartmentsList] = useState<Array<{ _id: string, name: string }>>([]);
  const [branchesList, setBranchesList] = useState<Array<{ _id: string, name: string }>>([]);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [empRes, deptRes, branchRes] = await Promise.all([
          api.get('/employees/directory?search='),
          api.get('/departments'),
          api.get('/branches')
        ]);
        setAllEmployees(empRes.data || []);
        setDepartmentsList(deptRes.data || []);
        setBranchesList(branchRes.data || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);
  
  // All employees can be assigned as N+1, N+2, N+3 — RH knows who is who
  const managers = allEmployees;
  const directors = allEmployees;
  const allForChain = allEmployees;
  
  const [formData, setFormData] = useState({
    cin: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    email: '',
    phone: '',
    poste: '',
    departement: '',
    service: '',
    direction: '',
    agence: '',
    roles: ['EMPLOYEE'],
    managerId: '',      // Chef de Service / N+1 direct
    directorId: '',     // Directeur de Département
    centralDirectorId: '', // Directeur Central / DG
    soldeConges: 30,
    creditsEnCours: 0,
    prime: 0,
    salaireBase: '', // Changed from 1200 to empty string for proper validation
    compteSolde: 0,
    avatar: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, roles: selectedOptions }));
  };

  const nextStep = () => {
    if (step === 1 && (!formData.nom || !formData.prenom || !formData.cin || !formData.dateNaissance)) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (step === 2 && (!formData.email || !formData.phone)) {
      toast.error("L'email et le téléphone sont obligatoires.");
      return;
    }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!formData.salaireBase || Number(formData.salaireBase) <= 0) {
      toast.error("Veuillez saisir un salaire de base valide.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/employees', {
        ...formData,
        managerId: formData.managerId || null,
        directorId: formData.directorId || null,
        centralDirectorId: formData.centralDirectorId || null,
        soldeConges: Number(formData.soldeConges),
        creditsEnCours: Number(formData.creditsEnCours),
        prime: Number(formData.prime),
        salaireBase: Number(formData.salaireBase),
        compteSolde: Number(formData.compteSolde),
        avatar: formData.avatar,
      });
      toast.success('Collaborateur créé et activé avec succès.');
      setSuccessData({
        matricule: res.data.matricule,
        defaultPassword: res.data.defaultPassword,
      });
      setStep(4);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié dans le presse-papier !`);
  };

  const renderStepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', gap: '1rem' }}>
      {[
        { num: 1, label: 'Identité', icon: <User size={18} /> },
        { num: 2, label: 'Contact', icon: <Briefcase size={18} /> },
        { num: 3, label: 'Paramètres', icon: <Settings size={18} /> },
      ].map(s => (
        <React.Fragment key={s.num}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            opacity: step >= s.num ? 1 : 0.4,
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              backgroundColor: step >= s.num ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: step >= s.num ? 'white' : 'var(--text-muted)',
              border: `2px solid ${step >= s.num ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
              boxShadow: step === s.num ? '0 0 20px rgba(0, 112, 243, 0.3)' : 'none',
            }}>
              {step > s.num ? <CheckCircle size={20} /> : s.icon}
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: step >= s.num ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</span>
          </div>
          {s.num < 3 && (
            <div style={{
              height: 3, width: 60, borderRadius: 2,
              backgroundColor: step > s.num ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              marginBottom: '1.5rem', transition: 'all 0.3s ease'
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/employees')} className="btn-icon" style={{ borderRadius: '50%' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Nouveau Collaborateur</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Création de profil et génération automatique des accès.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', maxWidth: '1200px', margin: '0 auto', alignItems: 'flex-start' }}>
        
        {/* Left Side: Form Wizard */}
        <div className="glass-card" style={{ flex: '1 1 60%', minHeight: '550px' }}>
        {step < 4 && renderStepIndicator()}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="section-header">
                <div className="section-accent"></div>
                <h3>Informations Personnelles</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Le matricule sera généré automatiquement par le système lors de la création.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Nom <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input type="text" name="nom" className="form-input" value={formData.nom} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Prénom <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input type="text" name="prenom" className="form-input" value={formData.prenom} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">CIN <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input type="text" name="cin" className="form-input" value={formData.cin} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date de Naissance <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input type="date" name="dateNaissance" className="form-input" value={formData.dateNaissance} onChange={handleChange} required />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
                <button type="button" onClick={nextStep} className="btn btn-primary">
                  Continuer
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="section-header">
                <div className="section-accent"></div>
                <h3>Contact & Structure</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Email professionnel *</label>
                  <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Numéro de téléphone *</label>
                  <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={14} /> Avatar (Upload PC)
                </label>
                <input type="file" accept="image/*" className="form-input" style={{ padding: '8px' }} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Check file size
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('Image trop grande (max 5MB)');
                      return;
                    }
                    
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      let base64 = reader.result as string;
                      
                      // Compress if needed
                      if (base64.length > 500000) {
                        try {
                          // Simple compression helper inline
                          const img = new Image();
                          img.src = base64;
                          await new Promise((resolve) => { img.onload = resolve; });
                          
                          const canvas = document.createElement('canvas');
                          let width = img.width;
                          let height = img.height;
                          const maxSize = 800;
                          
                          if (width > maxSize || height > maxSize) {
                            if (width > height) {
                              height = (height / width) * maxSize;
                              width = maxSize;
                            } else {
                              width = (width / height) * maxSize;
                              height = maxSize;
                            }
                          }
                          
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          ctx?.drawImage(img, 0, 0, width, height);
                          base64 = canvas.toDataURL('image/jpeg', 0.7);
                          
                          toast.success('Image compressée automatiquement');
                        } catch (err) {
                          console.error('Compression error:', err);
                        }
                      }
                      
                      setFormData({...formData, avatar: base64});
                    };
                    reader.readAsDataURL(file);
                  }
                }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max 5MB. Grande images seront compressées automatiquement.</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Direction / Département</label>
                  <select name="direction" className="form-input" value={formData.direction} onChange={handleChange}>
                    <option value="">Sélectionner un département</option>
                    {departmentsList.map(dept => (
                      <option key={dept._id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Service</label>
                  <input type="text" name="service" className="form-input" placeholder="Ex: Développement, Support..." value={formData.service} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Poste</label>
                  <input type="text" name="poste" className="form-input" value={formData.poste} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Agence</label>
                  <select name="agence" className="form-input" value={formData.agence} onChange={handleChange}>
                    <option value="">Sélectionner une agence (Optionnel)</option>
                    {branchesList.map(branch => (
                      <option key={branch._id} value={branch.name}>{branch.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Profil d'accès (Rôles)</label>
                  <select name="roles" multiple className="form-input" style={{ height: '140px' }} value={formData.roles} onChange={handleRoleChange}>
                    <option value="EMPLOYEE">👤 Employé (Défaut)</option>
                    <option value="MANAGER">👔 Manager / Chef de Service</option>
                    <option value="DIRECTOR">🏛️ Directeur de Département</option>
                    <option value="RH">🏢 Ressources Humaines</option>
                    <option value="AGENCE">🏦 Agence (Finance & Banque)</option>
                    <option value="FINANCE">💰 Finance</option>
                    <option value="ADMIN">⚙️ Administrateur Système</option>
                  </select>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Maintenez Ctrl/Cmd pour sélection multiple.</span>
                </div>
              </div>

              {/* Hiérarchie - N+X Workflow */}
              <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(139,92,246,0.08))', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '16px', padding: '1.5rem', marginTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏗️ Hiérarchie d'Approbation — Workflow N+X
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.2rem', lineHeight: 1.5 }}>
                  Choisissez parmi les <strong style={{ color: '#60A5FA' }}>{allEmployees.length} collaborateurs</strong> existants. Chaque demande de congé remontera automatiquement les niveaux définis ici, jusqu'aux RH.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#60A5FA' }}>👔 Chef de Service (N+1)</label>
                    <select name="managerId" className="form-input" value={formData.managerId} onChange={handleChange} style={{ fontSize: '0.85rem' }}>
                      <option value="">— Aucun (direct RH) —</option>
                      {allEmployees
                        .filter(e => e._id !== formData.directorId && e._id !== formData.centralDirectorId)
                        .map(mgr => (
                          <option key={mgr._id} value={mgr._id}>
                            {mgr.prenom} {mgr.nom}{mgr.poste ? ` — ${mgr.poste}` : ''} [{mgr.matricule}]
                          </option>
                        ))}
                    </select>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>1er validateur de congés</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#8B5CF6' }}>🏛️ Directeur (N+2)</label>
                    <select name="directorId" className="form-input" value={formData.directorId} onChange={handleChange} style={{ fontSize: '0.85rem' }}>
                      <option value="">— Aucun —</option>
                      {allEmployees
                        .filter(e => e._id !== formData.managerId && e._id !== formData.centralDirectorId)
                        .map(d => (
                          <option key={d._id} value={d._id}>
                            {d.prenom} {d.nom}{d.poste ? ` — ${d.poste}` : ''} [{d.matricule}]
                          </option>
                        ))}
                    </select>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>2ème validateur (après N+1)</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#EC4899' }}>🏢 Directeur Central (N+3)</label>
                    <select name="centralDirectorId" className="form-input" value={formData.centralDirectorId} onChange={handleChange} style={{ fontSize: '0.85rem' }}>
                      <option value="">— Aucun —</option>
                      {allEmployees
                        .filter(e => e._id !== formData.managerId && e._id !== formData.directorId)
                        .map(d => (
                          <option key={d._id} value={d._id}>
                            {d.prenom} {d.nom}{d.poste ? ` — ${d.poste}` : ''} [{d.matricule}]
                          </option>
                        ))}
                    </select>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Dernier validateur avant RH</span>
                  </div>
                </div>

                {/* Live Workflow Preview */}
                <div style={{ marginTop: '1.2rem', padding: '1rem', background: 'rgba(15,23,42,0.6)', borderRadius: '12px', border: '1px solid rgba(96,165,250,0.15)' }}>
                  <p style={{ fontSize: '0.72rem', color: '#94A3B8', margin: '0 0 0.6rem 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📊 Aperçu du Workflow</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                    <span style={{ padding: '0.3rem 0.7rem', background: 'rgba(59,130,246,0.2)', borderRadius: '20px', color: '#93C5FD', fontWeight: 600 }}>
                      👤 Employé
                    </span>
                    {formData.managerId && (() => {
                      const m = allEmployees.find(e => e._id === formData.managerId);
                      return m ? <>
                        <span style={{ color: '#475569' }}>→</span>
                        <span style={{ padding: '0.3rem 0.7rem', background: 'rgba(37,99,235,0.2)', borderRadius: '20px', color: '#60A5FA', fontWeight: 600 }}>
                          👔 {m.prenom} {m.nom}
                        </span>
                      </> : null;
                    })()}
                    {formData.directorId && (() => {
                      const d = allEmployees.find(e => e._id === formData.directorId);
                      return d ? <>
                        <span style={{ color: '#475569' }}>→</span>
                        <span style={{ padding: '0.3rem 0.7rem', background: 'rgba(139,92,246,0.2)', borderRadius: '20px', color: '#A78BFA', fontWeight: 600 }}>
                          🏛️ {d.prenom} {d.nom}
                        </span>
                      </> : null;
                    })()}
                    {formData.centralDirectorId && (() => {
                      const c = allEmployees.find(e => e._id === formData.centralDirectorId);
                      return c ? <>
                        <span style={{ color: '#475569' }}>→</span>
                        <span style={{ padding: '0.3rem 0.7rem', background: 'rgba(236,72,153,0.2)', borderRadius: '20px', color: '#F472B6', fontWeight: 600 }}>
                          🏢 {c.prenom} {c.nom}
                        </span>
                      </> : null;
                    })()}
                    <span style={{ color: '#475569' }}>→</span>
                    <span style={{ padding: '0.3rem 0.7rem', background: 'rgba(16,185,129,0.2)', borderRadius: '20px', color: '#34D399', fontWeight: 600 }}>
                      🏢 RH
                    </span>
                    <span style={{ color: '#475569' }}>→</span>
                    <span style={{ padding: '0.3rem 0.7rem', background: 'rgba(16,185,129,0.3)', borderRadius: '20px', color: '#6EE7B7', fontWeight: 700 }}>
                      ✅ Approuvé
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                <button type="button" onClick={prevStep} className="btn btn-secondary">Retour</button>
                <button type="button" onClick={nextStep} className="btn btn-primary">Continuer</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="section-header">
                <div className="section-accent"></div>
                <h3>Paramètres Avancés (RH)</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Initialisez le salaire, solde compte et avantages RH qui apparaîtront sur l'application STB Mobile de l'employé.
              </p>
              
              {/* Salaire */}
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={14} /> Rémunération
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <TrendingUp size={14} /> Salaire de Base (TND) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input type="number" name="salaireBase" className="form-input" value={formData.salaireBase} onChange={handleChange} min="0" step="50" required />
                  <span style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.3rem', display: 'block' }}>
                    → Net après charges: {Math.round(Number(formData.salaireBase) * (1 - 0.0918 - 0.15))} TND/mois
                  </span>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Wallet size={14} /> Solde Initial du Compte (TND)
                  </label>
                  <input type="number" name="compteSolde" className="form-input" value={formData.compteSolde} onChange={handleChange} min="0" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                    Solde de départ. Le salaire s'ajoute automatiquement chaque mois.
                  </span>
                </div>
              </div>

              {/* RH Avantages */}
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Key size={14} /> Avantages RH
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Solde de congés (Jours)</label>
                  <input type="number" name="soldeConges" className="form-input" value={formData.soldeConges} onChange={handleChange} min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Montant crédits en cours (TND)</span>
                    <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>⚠️ Se créent après validation</span>
                  </label>
                  <input type="number" name="creditsEnCours" className="form-input" value={formData.creditsEnCours} onChange={handleChange} min="0" disabled style={{ backgroundColor: 'rgba(255,255,255,0.02)', cursor: 'not-allowed' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                    💡 Lecture seule — Créez les crédits via le profil employé après validation
                  </span>
                </div>
                <div className="form-group">
                  <label className="form-label">Prime / Bonus initial (TND)</label>
                  <input type="number" name="prime" className="form-input" value={formData.prime} onChange={handleChange} min="0" />
                </div>
              </div>
              
              <div style={{ padding: '1.5rem', backgroundColor: 'rgba(0, 112, 243, 0.05)', borderRadius: '16px', border: '1px solid rgba(0, 112, 243, 0.2)', marginTop: '2rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Key size={18} /> Génération Automatique
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  En validant, le système va générer un <strong>Matricule unique</strong> et un <strong>Mot de passe par défaut</strong>. Le compte sera immédiatement activé pour une connexion via l'application mobile.
                </p>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                <button type="button" onClick={prevStep} className="btn btn-secondary">Retour</button>
                <button type="button" onClick={handleSubmit} className="btn btn-primary" disabled={loading} style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}>
                  {loading ? 'Création...' : <><Save size={18} /> Créer le compte</>}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && successData && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="success-container">
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
                  <div style={{ width: 80, height: 80, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <CheckCircle size={40} color="#10B981" />
                  </div>
                </motion.div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Compte Créé !</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Le collaborateur a été ajouté et activé avec succès.</p>
                
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '1.5rem', maxWidth: '400px', margin: '0 auto 2.5rem', textAlign: 'left' }}>
                  <div style={{ marginBottom: '1.2rem' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700 }}>Matricule</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{successData.matricule}</span>
                      <button onClick={() => copyToClipboard(successData.matricule, 'Matricule')} className="btn-icon" title="Copier"><Copy size={16}/></button>
                    </div>
                  </div>
                  
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700 }}>Mot de passe temporaire</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '2px' }}>{successData.defaultPassword}</span>
                      <button onClick={() => copyToClipboard(successData.defaultPassword, 'Mot de passe')} className="btn-icon" title="Copier"><Copy size={16}/></button>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1.2rem', backgroundColor: 'rgba(2, 132, 199, 0.08)', borderRadius: '16px', border: '1px solid rgba(2, 132, 199, 0.25)', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                    🏦 Créer un Crédit
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Pour créer un crédit pour cet employé, rendez-vous sur son profil → <strong>Finance & Avantages</strong> et cliquez sur <strong>"Créer crédit"</strong>.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button onClick={() => navigate('/employees')} className="btn btn-secondary">Annuaire RH</button>
                  <button 
                    onClick={() => navigate(`/employees/${formData.nom.toLowerCase().replace(/\s+/g, '-')}`)} 
                    className="btn btn-primary"
                    style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', boxShadow: '0 4px 14px rgba(2,132,199,0.3)' }}
                  >
                    🏦 Gérer Finance & Crédits
                  </button>
                  <button onClick={() => { setStep(1); setFormData({...formData, nom: '', prenom: '', cin: '', email: '', phone: ''}); }} className="btn btn-primary">Ajouter un autre</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Right Side: WOW STB Mobile Preview */}
        {step < 4 && (
          <div style={{ flex: '1 1 40%', position: 'sticky', top: '2rem' }}>
            <div style={{
              background: '#0B101E',
              borderRadius: '38px',
              border: '6px solid #1E293B',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.05)',
              padding: '16px',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '600px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Dynamic Island / Notch */}
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120px', height: '24px', background: '#000', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', zIndex: 10 }}></div>
              
              {/* STB Top Section */}
              <div style={{ padding: '24px 16px', background: 'linear-gradient(135deg, #1e3a8a, #0f172a)', borderRadius: '24px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                
                <h4 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: 800, letterSpacing: '1px', marginBottom: '12px' }}>STB COLLABORATEUR</h4>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>
                      {formData.prenom && formData.nom ? `${formData.prenom[0]}${formData.nom[0]}`.toUpperCase() : '?'}
                    </span>
                  )}
                </div>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, margin: 0 }}>
                      {formData.nom || formData.prenom ? `${formData.nom} ${formData.prenom}` : 'Nouvel Employé'}
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', margin: '2px 0 0 0' }}>
                      {formData.poste || 'Poste non défini'} • {formData.departement || 'Département'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Balances Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '20px' }}>
                  <span style={{ color: '#10B981', fontSize: '10px', fontWeight: 800 }}>CONGÉS</span>
                  <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: '4px 0' }}>{formData.soldeConges}</h2>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>Jours restants</span>
                </div>
                
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: '20px' }}>
                  <span style={{ color: '#3B82F6', fontSize: '10px', fontWeight: 800 }}>CRÉDITS</span>
                  <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: '4px 0' }}>{formData.creditsEnCours}</h2>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>Dossiers actifs</span>
                </div>
              </div>

              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', padding: '14px', borderRadius: '18px', marginBottom: '10px' }}>
                <span style={{ color: '#10B981', fontSize: '9px', fontWeight: 800, letterSpacing: '1px' }}>SOLDE COMPTE</span>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginTop: '4px' }}>
                  <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{Number(formData.compteSolde).toLocaleString('fr-TN')}</h2>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', paddingBottom: '2px' }}>TND</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9px', margin: '4px 0 0 0' }}>+{Math.round(Number(formData.salaireBase)*(1-0.0918-0.15))} TND le 1er du mois</p>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '14px', borderRadius: '18px', marginBottom: '10px' }}>
                <span style={{ color: '#F59E0B', fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px' }}>PRIME EN ATTENTE</span>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginTop: '4px' }}>
                  <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{formData.prime || 0}</h2>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', paddingBottom: '2px' }}>TND</span>
                </div>
              </div>

              {/* Bottom Nav Placeholder */}
              <div style={{ marginTop: 'auto', background: '#1E293B', borderRadius: '20px', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div>
                <div style={{ width: 32, height: 4, borderRadius: '2px', background: 'var(--primary)' }}></div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewEmployee;
