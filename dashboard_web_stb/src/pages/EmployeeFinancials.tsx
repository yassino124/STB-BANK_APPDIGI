import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Umbrella, Gift, Save, Wallet, TrendingUp, DollarSign, RefreshCcw, Camera, Plus } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const EmployeeFinancials = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creditingSalary, setCreditingSalary] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [creatingCard, setCreatingCard] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditForm, setCreditForm] = useState({
    title: '',
    type: 'PERSONNEL',
    montantInitial: 0,
    tauxInteret: 10,
    nombreMois: 12,
    dateDebut: new Date().toISOString().split('T')[0]
  });

  const [formData, setFormData] = useState({
    soldeConges: 0,
    creditsEnCours: 0,
    avancesEnCours: 0,
    prime: 0,
    salaireBase: 0,
    compteSolde: 0,
  });

  useEffect(() => {
    fetchEmployee();
    // eslint-disable-next-line
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const { data } = await api.get(`/employees/${id}`);
      setEmployee(data);
      setFormData({
        soldeConges: data.soldeConges || 0,
        creditsEnCours: data.creditsEnCours || 0,
        avancesEnCours: data.avancesEnCours || 0,
        prime: data.prime || 0,
        salaireBase: data.salaireBase || 1200,
        compteSolde: data.compteSolde || 0,
      });
    } catch (err: any) {
      toast.error('Erreur de chargement du profil.');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleCreditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreditForm(prev => ({ ...prev, [name]: name === 'title' || name === 'type' || name === 'dateDebut' ? value : Number(value) }));
  };

  const handleCreateCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/credits/employee/${id}`, creditForm);
      toast.success('✅ Crédit créé avec succès!');
      setShowCreditModal(false);
      setCreditForm({
        title: '',
        type: 'PERSONNEL',
        montantInitial: 0,
        tauxInteret: 10,
        nombreMois: 12,
        dateDebut: new Date().toISOString().split('T')[0]
      });
      fetchEmployee();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du crédit');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/employees/${id}/financials`, formData);
      toast.success('Données financières mises à jour avec succès !');
      fetchEmployee();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleCreditSalaryNow = async () => {
    if (!confirm(`Créditer le salaire NET (après déduction crédits) maintenant sur le compte de ${employee?.prenom} ${employee?.nom} ?`)) return;
    setCreditingSalary(true);
    try {
      // Call payroll credit-salaries endpoint (credits ALL employees)
      const response = await api.post('/payroll/credit-salaries');
      
      toast.success(`✅ Salaires versés avec succès! ${response.data?.length || 0} employés crédités.`, {
        duration: 5000,
      });
      
      // Refresh employee data
      await fetchEmployee();
      
      // Show breakdown if available
      const employeeResult = response.data?.find((r: any) => r.matricule === employee?.matricule);
      if (employeeResult) {
        const details = `
          Salaire Brut: ${employeeResult.salaireBrut} TND
          Déductions sociales: -${employeeResult.deductionsSociales} TND
          Crédits débités: -${employeeResult.creditsDebites} TND
          Salaire NET versé: ${employeeResult.salaireNet} TND
          Nouveau solde: ${employeeResult.newBalance} TND
        `;
        console.log('💰 Détails virement:', details);
        
        toast.success(`Détails: Salaire NET ${employeeResult.salaireNet} TND versé (après ${employeeResult.creditsDebites} TND crédit)`, {
          duration: 8000,
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Erreur lors du virement du salaire.';
      toast.error(errorMsg);
      console.error('Payroll error:', err.response?.data);
    } finally {
      setCreditingSalary(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!confirm(`Générer un RIB/IBAN (Compte Courant) pour ${employee?.prenom} ?`)) return;
    setCreatingAccount(true);
    try {
      await api.post(`/accounts/employee/${id}`, { type: 'COURANT' });
      toast.success('Compte bancaire réel créé avec succès !');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du compte');
    } finally {
      setCreatingAccount(false);
    }
  };

  const handleCreateCard = async () => {
    if (!confirm(`Générer une carte bancaire (Visa) pour ${employee?.prenom} ?`)) return;
    setCreatingCard(true);
    try {
      await api.post(`/cards/employee/${id}`, { type: 'VISA' });
      toast.success('Carte bancaire Visa créée avec succès !');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création de la carte');
    } finally {
      setCreatingCard(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop grande (max 5MB). Veuillez choisir une image plus petite.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      
      // Compress image if needed
      let compressedBase64 = base64;
      if (base64.length > 500000) { // If > 500KB, compress
        try {
          compressedBase64 = await compressImage(base64, 0.7); // 70% quality
        } catch (err) {
          console.error('Compression error:', err);
          // Continue with original if compression fails
        }
      }
      
      setUploadingAvatar(true);
      try {
        await api.patch(`/employees/${id}/avatar`, { avatar: compressedBase64 });
        toast.success('✅ Avatar mis à jour avec succès !');
        fetchEmployee();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour de l\'avatar');
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper function to compress image
  const compressImage = (base64: string, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize if too large (max 800px)
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
        
        // Convert to base64 with compression
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = reject;
      img.src = base64;
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Chargement du profil financier...</p>
      </div>
    );
  }

  const salaireNet = Math.round(formData.salaireBase * (1 - 0.0918 - 0.15) * 100) / 100;

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/employees')} className="btn-icon" style={{ borderRadius: '50%' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Finance & Avantages</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>
              Gestion complète du profil financier de <strong>{employee?.prenom} {employee?.nom}</strong> — {employee?.matricule}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', maxWidth: '1200px', margin: '0 auto', alignItems: 'flex-start' }}>
        
        {/* Left Side: Form */}
        <div style={{ flex: '1 1 60%' }}>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Umbrella size={20} color="#38bdf8" />
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Congés</p>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{formData.soldeConges} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>j</span></h2>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'rgba(217, 70, 239, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Gift size={20} color="#d946ef" />
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prime</p>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{formData.prime} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TND</span></h2>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TrendingUp size={20} color="#10b981" />
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Salaire net</p>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{salaireNet} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TND</span></h2>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Wallet size={20} color="#f59e0b" />
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Solde compte</p>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{formData.compteSolde.toLocaleString('fr-TN')} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TND</span></h2>
              </div>
            </motion.div>

            {formData.avancesEnCours > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CreditCard size={20} color="#ef4444" />
                </div>
                <div>
                  <p style={{ margin: 0, color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚠️ Avance à déduire</p>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>{formData.avancesEnCours.toLocaleString('fr-TN')} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TND</span></h2>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Déduit automatiquement sur la prochaine fiche de paie</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Salary Info Banner */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <DollarSign size={20} color="#10b981" />
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>Virement Salaires Mensuels (Tous Employés)</p>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Crédite les salaires NET de TOUS les employés après déduction automatique des crédits.
                  Le cron automatique s'exécute le 1er de chaque mois.
                </p>
              </div>
            </div>
            <button
              onClick={handleCreditSalaryNow}
              disabled={creditingSalary}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCcw size={16} style={{ animation: creditingSalary ? 'spin 1s linear infinite' : 'none' }} />
              {creditingSalary ? 'Virement...' : 'Virer maintenant'}
            </button>
          </motion.div>

          {/* Core Banking Action */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(14, 165, 233, 0.04))',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CreditCard size={20} color="#38bdf8" />
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>Génération de Compte Core Banking</p>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Génère un véritable RIB / IBAN rattaché à ce collaborateur pour permettre les virements P2P et l'affichage des comptes dans l'application mobile.
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateAccount}
              disabled={creatingAccount}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', boxShadow: '0 4px 14px rgba(2,132,199,0.3)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCcw size={16} style={{ animation: creatingAccount ? 'spin 1s linear infinite' : 'none' }} />
              {creatingAccount ? 'Création...' : 'Générer RIB'}
            </button>
          </motion.div>

          {/* Card Generation Action */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(124, 58, 237, 0.04))',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CreditCard size={20} color="#8B5CF6" />
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#8B5CF6' }}>Génération de Carte Bancaire Visa</p>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Crée et attribue une carte Visa à ce collaborateur (nécessite un compte bancaire existant).
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateCard}
              disabled={creatingCard}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCcw size={16} style={{ animation: creatingCard ? 'spin 1s linear infinite' : 'none' }} />
              {creatingCard ? 'Création...' : 'Générer Carte'}
            </button>
          </motion.div>

          {/* Main Form */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card">
            <form onSubmit={handleSubmit}>
              <div className="section-header">
                <div className="section-accent"></div>
                <h3>Mise à jour du profil financier</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Ces modifications sont immédiatement reflétées sur l'application mobile du collaborateur ({employee?.matricule}).
              </p>
              
              {/* Salary Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={14} /> Rémunération
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingUp size={16} /> Salaire de Base (TND)
                    </label>
                    <input type="number" name="salaireBase" className="form-input" value={formData.salaireBase} onChange={handleChange} min="0" step="50" />
                    <span style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.3rem', display: 'block' }}>
                      → Salaire net après CNSS (9.18%) + Impôt (15%) : <strong>{salaireNet} TND</strong>
                    </span>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Wallet size={16} /> Solde Actuel du Compte (TND)
                    </label>
                    <input type="number" name="compteSolde" className="form-input" value={formData.compteSolde} onChange={handleChange} min="0" step="0.01" />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                      Solde affiché sur l'app mobile dans "Mon Compte"
                    </span>
                  </div>
                </div>
              </div>

              {/* HR Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Umbrella size={14} /> Avantages RH
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Umbrella size={16} /> Solde de Congés (Jours)
                    </label>
                    <input type="number" name="soldeConges" className="form-input" value={formData.soldeConges} onChange={handleChange} min="0" max="90" required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CreditCard size={16} /> Crédits en cours (TND)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCreditModal(true)}
                        className="btn btn-primary"
                        style={{ 
                          padding: '0.4rem 0.8rem', 
                          fontSize: '0.75rem', 
                          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <Plus size={14} /> Créer crédit
                      </button>
                    </label>
                    <input type="number" name="creditsEnCours" className="form-input" value={formData.creditsEnCours} onChange={handleChange} min="0" required disabled />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                      ⚠️ Lecture seule - Calculé automatiquement depuis les crédits créés via le bouton ci-dessus
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: formData.avancesEnCours > 0 ? '#ef4444' : undefined }}>
                      <Wallet size={16} /> ⚠️ Avance en cours (TND)
                    </label>
                    <input type="number" name="avancesEnCours" className="form-input" value={formData.avancesEnCours} onChange={handleChange} min="0"
                      style={{ borderColor: formData.avancesEnCours > 0 ? 'rgba(239,68,68,0.5)' : undefined }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.3rem', display: 'block' }}>Déduit sur la prochaine fiche de paie puis remis à 0</span>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Gift size={16} /> Prime Exceptionnelle (TND)
                    </label>
                    <input type="number" name="prime" className="form-input" value={formData.prime} onChange={handleChange} min="0" required />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button type="button" onClick={() => navigate('/employees')} className="btn btn-secondary">Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ background: 'linear-gradient(135deg, #0070F3 0%, #0050C0 100%)', boxShadow: '0 4px 14px rgba(0, 112, 243, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={18} />
                  {saving ? 'Enregistrement...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Right Side: STB Mobile Preview */}
        <div style={{ flex: '1 1 40%', position: 'sticky', top: '2rem' }}>
          <div style={{
            background: '#0B101E', borderRadius: '38px', border: '6px solid #1E293B',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.05)',
            padding: '16px', position: 'relative', overflow: 'hidden', minHeight: '650px', display: 'flex', flexDirection: 'column'
          }}>
            {/* Dynamic Island */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120px', height: '24px', background: '#000', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', zIndex: 10 }}></div>
            
            {/* Header Card */}
            <div style={{ padding: '28px 16px 20px', background: 'linear-gradient(135deg, #1e3a8a, #0f172a)', borderRadius: '24px', marginBottom: '12px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
              <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '10px' }}>STB COLLABORATEUR</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '12px', background: employee?.avatar ? 'transparent' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '14px', overflow: 'hidden' }}>
                    {employee?.avatar ? (
                      <img src={employee.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      employee?.nom ? employee.nom[0].toUpperCase() : '?'
                    )}
                  </div>
                  <label style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,112,243,0.4)' }}>
                    <Camera size={10} color="#fff" style={{ animation: uploadingAvatar ? 'spin 1s linear infinite' : 'none' }} />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} disabled={uploadingAvatar} />
                  </label>
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: 0 }}>{employee?.prenom} {employee?.nom}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', margin: '2px 0 0 0' }}>{employee?.matricule}</p>
                </div>
              </div>
            </div>

            {/* Account Balance */}
            <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))', border: '1px solid rgba(16,185,129,0.25)', padding: '16px', borderRadius: '18px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: '#10B981', fontSize: '9px', fontWeight: 800, letterSpacing: '1px' }}>SOLDE COMPTE</span>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginTop: '4px' }}>
                    <h2 style={{ color: '#fff', fontSize: '26px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{formData.compteSolde.toLocaleString('fr-TN')}</h2>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', paddingBottom: '3px' }}>TND</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>Prochain virement</span>
                  <p style={{ color: '#10B981', fontSize: '11px', fontWeight: 700, margin: '2px 0 0 0' }}>+{salaireNet} TND</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', margin: '1px 0 0 0' }}>le 1er du mois</p>
                </div>
              </div>
            </div>

            {/* Grid: Congés + Crédits */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '14px', borderRadius: '16px' }}>
                <span style={{ color: '#38bdf8', fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px' }}>CONGÉS</span>
                <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, margin: '4px 0' }}>{formData.soldeConges}</h2>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>Jours restants</span>
              </div>
              
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '14px', borderRadius: '16px' }}>
                <span style={{ color: '#3B82F6', fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px' }}>CRÉDITS</span>
                <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, margin: '4px 0' }}>{formData.creditsEnCours.toLocaleString('fr-TN')}</h2>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>TND en cours</span>
              </div>
            </div>

            {/* Prime */}
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '14px', borderRadius: '16px', marginBottom: '10px' }}>
              <span style={{ color: '#F59E0B', fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px' }}>PRIME EN ATTENTE</span>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginTop: '4px' }}>
                <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{formData.prime || 0}</h2>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', paddingBottom: '2px' }}>TND</span>
              </div>
            </div>

            {/* Salary detail */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '12px 14px', borderRadius: '14px', marginBottom: '10px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px' }}>FICHE SALAIRE</span>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>Salaire Brut</span>
                  <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>{formData.salaireBase} TND</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>CNSS (9.18%)</span>
                  <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: 700 }}>-{Math.round(formData.salaireBase * 0.0918)} TND</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>Impôt (15%)</span>
                  <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: 700 }}>-{Math.round(formData.salaireBase * 0.15)} TND</span>
                </div>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 700 }}>Salaire Net</span>
                  <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 800 }}>{salaireNet} TND</span>
                </div>
              </div>
            </div>

            {/* Bottom Nav */}
            <div style={{ marginTop: 'auto', background: '#1E293B', borderRadius: '16px', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div>
              <div style={{ width: 32, height: 4, borderRadius: '2px', background: 'var(--primary)' }}></div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            Aperçu en temps réel de l'app mobile
          </p>
        </div>
        
      </div>

      {/* Credit Creation Modal */}
      <AnimatePresence>
        {showCreditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreditModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '2rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card"
              style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div className="section-header">
                <div className="section-accent"></div>
                <h3>🏦 Créer un Crédit</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Créer un nouveau crédit pour <strong>{employee?.prenom} {employee?.nom}</strong>. 
                Ce crédit sera enregistré dans la collection MongoDB et apparaîtra dans l'app mobile.
              </p>

              <form onSubmit={handleCreateCredit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Titre du crédit</label>
                    <input
                      type="text"
                      name="title"
                      className="form-input"
                      value={creditForm.title}
                      onChange={handleCreditFormChange}
                      placeholder="Ex: Crédit Personnel 2026"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Type de crédit</label>
                    <select
                      name="type"
                      className="form-input"
                      value={creditForm.type}
                      onChange={handleCreditFormChange}
                      required
                    >
                      <option value="PERSONNEL">Personnel</option>
                      <option value="IMMOBILIER">Immobilier</option>
                      <option value="AUTO">Automobile</option>
                      <option value="MOYEN_TERME">Moyen Terme</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Montant Initial (TND)</label>
                      <input
                        type="number"
                        name="montantInitial"
                        className="form-input"
                        value={creditForm.montantInitial}
                        onChange={handleCreditFormChange}
                        min="100"
                        step="100"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Taux Intérêt (%)</label>
                      <input
                        type="number"
                        name="tauxInteret"
                        className="form-input"
                        value={creditForm.tauxInteret}
                        onChange={handleCreditFormChange}
                        min="0"
                        max="30"
                        step="0.5"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Durée (mois)</label>
                      <input
                        type="number"
                        name="nombreMois"
                        className="form-input"
                        value={creditForm.nombreMois}
                        onChange={handleCreditFormChange}
                        min="1"
                        max="360"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Date début</label>
                      <input
                        type="date"
                        name="dateDebut"
                        className="form-input"
                        value={creditForm.dateDebut}
                        onChange={handleCreditFormChange}
                        required
                      />
                    </div>
                  </div>

                  {creditForm.montantInitial > 0 && creditForm.nombreMois > 0 && (
                    <div style={{ 
                      background: 'rgba(16,185,129,0.1)', 
                      border: '1px solid rgba(16,185,129,0.2)', 
                      padding: '1rem', 
                      borderRadius: '12px' 
                    }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>
                        💰 Mensualité estimée: {' '}
                        {(() => {
                          const r = creditForm.tauxInteret / 100 / 12;
                          const mensualite = r === 0 
                            ? creditForm.montantInitial / creditForm.nombreMois
                            : Math.round(creditForm.montantInitial * r * Math.pow(1 + r, creditForm.nombreMois) / (Math.pow(1 + r, creditForm.nombreMois) - 1) * 100) / 100;
                          return mensualite.toFixed(2);
                        })()}{' '}
                        TND / mois
                      </p>
                      <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Cette mensualité sera déduite automatiquement sur la fiche de paie
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '2rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowCreditModal(false)} 
                    className="btn btn-secondary"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={saving}
                    style={{ 
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                      boxShadow: '0 4px 14px rgba(2,132,199,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Save size={18} />
                    {saving ? 'Création...' : 'Créer le crédit'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeFinancials;
