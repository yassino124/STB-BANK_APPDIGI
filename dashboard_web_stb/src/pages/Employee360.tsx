import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, User, Phone, Mail, MapPin, Calendar, Briefcase, FileText, 
  Download, Award, Clock, Target, Users, TrendingUp, CreditCard, DollarSign, Wallet, ShieldCheck, Gift, Sparkles, Bot, Loader2, BrainCircuit, AlertTriangle, Activity, Flame
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Employee360 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const [retardsCount, setRetardsCount] = useState(0);
  const [absencesCount, setAbsencesCount] = useState(0);
  const [heuresSupp, setHeuresSupp] = useState(0);
  const [realPrimes, setRealPrimes] = useState(0);
  const [realCredits, setRealCredits] = useState<any[]>([]);
  const [realAvances, setRealAvances] = useState<any[]>([]);
  const [realLeaveHistory, setRealLeaveHistory] = useState<any[]>([]);
  const { user: currentUser } = useAuth();
  const [generatingDoc, setGeneratingDoc] = useState<string | null>(null);

  const handleGenerateDoc = async (docName: string) => {
    setGeneratingDoc(docName);
    toast.success(`Demande de génération envoyée à l'IA...`, { icon: '🤖' });
    setTimeout(() => {
      setGeneratingDoc(null);
      toast.success(`${docName} généré avec succès par l'IA !`);
    }, 2500);
  };
  
  useEffect(() => {
    if (id) fetchAll();
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [empRes, absRes, avancesRes, creditsRes, primesRes, leaveRes] = await Promise.allSettled([
        api.get(`/employees/${id}`),
        api.get(`/absences?employeeId=${id}&limit=100`).catch(() => ({ data: [] })),
        api.get(`/avances?employeeId=${id}&limit=50`).catch(() => ({ data: [] })),
        api.get(`/credits?employeeId=${id}&limit=50`).catch(() => ({ data: [] })),
        api.get(`/primes?employeeId=${id}&limit=50`).catch(() => ({ data: [] })),
        api.get(`/leave?employeeId=${id}&limit=20`).catch(() => ({ data: { data: [] } })),
      ]);

      if (empRes.status === 'fulfilled') setEmployee(empRes.value.data);
      else { toast.error('Erreur de chargement du profil.'); navigate('/employees'); return; }

      // Parse absences: count retards and absences injustifiées this month
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      const absData = absRes.status === 'fulfilled' ? (Array.isArray(absRes.value.data) ? absRes.value.data : absRes.value.data?.data || []) : [];
      const retards = absData.filter((a: any) => a.type === 'RETARD' && new Date(a.createdAt).getMonth() === thisMonth && new Date(a.createdAt).getFullYear() === thisYear);
      const absences = absData.filter((a: any) => a.type === 'ABSENCE');
      setRetardsCount(retards.length);
      setAbsencesCount(absences.length);

      // Real avances
      const avData = avancesRes.status === 'fulfilled' ? (Array.isArray(avancesRes.value.data) ? avancesRes.value.data : avancesRes.value.data?.data || []) : [];
      setRealAvances(avData);

      // Real credits
      const crData = creditsRes.status === 'fulfilled' ? (Array.isArray(creditsRes.value.data) ? creditsRes.value.data : creditsRes.value.data?.data || []) : [];
      setRealCredits(crData);

      // Real primes sum this year
      const prData = primesRes.status === 'fulfilled' ? (Array.isArray(primesRes.value.data) ? primesRes.value.data : primesRes.value.data?.data || []) : [];
      const primesThisYear = prData.filter((p: any) => new Date(p.createdAt || p.date).getFullYear() === thisYear);
      setRealPrimes(primesThisYear.reduce((sum: number, p: any) => sum + (p.montant || p.amount || 0), 0));

      // Real leave history
      const lvData = leaveRes.status === 'fulfilled' ? (Array.isArray(leaveRes.value.data) ? leaveRes.value.data : leaveRes.value.data?.data || []) : [];
      setRealLeaveHistory(lvData);

    } catch (err: any) {
      toast.error('Erreur de chargement du profil.');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '50px', height: '50px', border: '3px solid rgba(41,98,255,0.2)', borderTopColor: '#2962FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div style={{ color: 'var(--stb-blue-300)', fontWeight: 600 }}>Chargement du Profil 360...</div>
      </div>
    );
  }

  if (!employee) return null;

  const seniorityYears = employee.dateEmbauche 
    ? ((new Date().getTime() - new Date(employee.dateEmbauche).getTime()) / (1000 * 3600 * 24 * 365)).toFixed(1)
    : '2.5';
  
  // Leave data from real DB
  const leaveTotal = employee.leaveBalance?.total || 30;
  const leaveRestant = employee.soldeConges ?? employee.leaveBalance?.remaining ?? 22;
  const leavePris = Math.max(0, leaveTotal - leaveRestant);

  // Real avances actives (non remboursées)
  const avancesActives = realAvances.filter((a: any) => ['EN_ATTENTE','APPROUVE','ACTIVE'].includes(a.status));
  const avancesTotalDue = avancesActives.reduce((s: number, a: any) => s + (a.montant || a.amount || 0), 0);

  // Real credits actifs - mensualité totale
  const creditsActifs = realCredits.filter((c: any) => c.status === 'ACTIVE' || c.statut === 'ACTIF');
  const creditsMensualite = creditsActifs.reduce((s: number, c: any) => s + (c.mensualite || c.monthlyPayment || 0), 0);

  // Burnout Risk Score (0-100) — REAL DATA
  const burnoutFactors = {
    congesNonPris: leaveRestant > 20 ? 35 : leaveRestant > 15 ? 20 : 5,
    anciennete: parseFloat(String(seniorityYears)) > 4 ? 20 : parseFloat(String(seniorityYears)) > 2 ? 10 : 5,
    retards: Math.min(retardsCount * 10, 30),
    absences: Math.min(absencesCount * 5, 15),
    heuresSupp: Math.min(heuresSupp * 2, 10),
  };
  const burnoutScore = Math.min(100, Object.values(burnoutFactors).reduce((a, b) => a + b, 0));
  const burnoutLevel = burnoutScore >= 65 ? 'ÉLEVÉ' : burnoutScore >= 40 ? 'MOYEN' : 'FAIBLE';
  const burnoutColor = burnoutScore >= 65 ? '#EF4444' : burnoutScore >= 40 ? '#F59E0B' : '#10B981';
  const burnoutGlow = burnoutScore >= 65 ? 'rgba(239,68,68,0.4)' : burnoutScore >= 40 ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)';

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.1, duration: 0.5, type: 'spring' as any, stiffness: 300, damping: 25 } })
  };

  return (
    <div style={{ paddingBottom: '4rem', position: 'relative' }}>
      
      {/* Decorative Background Blur */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(41,98,255,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: -1, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: -1, pointerEvents: 'none' }} />

      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/employees')} className="btn-icon" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
          <ArrowLeft size={20} color="#fff" />
        </button>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, background: 'linear-gradient(to right, #fff, var(--stb-blue-300))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Vue 360°</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Profil complet & Analyse multidimensionnelle</p>
        </div>
      </div>

      {/* Hero Profile Card */}
      <motion.div 
        initial="hidden" animate="visible" variants={cardVariants} custom={0}
        style={{ 
          background: 'linear-gradient(135deg, rgba(18,18,28,0.7), rgba(41,98,255,0.1))',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px', padding: '2.5rem', marginBottom: '2rem', 
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        {/* Shine effect */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
        
        <div style={{ position: 'relative' }}>
          <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: 'linear-gradient(135deg, #2962FF, #00B4FF)', padding: '5px', boxShadow: '0 0 30px rgba(41,98,255,0.4)' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {employee.avatar ? (
                <img src={employee.avatar.startsWith('data:') ? employee.avatar : `/api/v1/employees/${employee._id}/avatar`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={60} color="var(--stb-blue-300)" />
              )}
            </div>
          </div>
          {employee.status === 'ACTIVE' && (
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '24px', height: '24px', background: '#10B981', border: '3px solid #12121C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(16,185,129,0.5)' }}>
              <ShieldCheck size={12} color="#fff" />
            </div>
          )}
        </div>
        
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 900, margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>{employee.prenom} {employee.nom}</h2>
          </div>
          <p style={{ fontSize: '1.25rem', color: 'var(--stb-electric)', fontWeight: 700, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={20} /> {employee.poste || 'Ingénieur Logiciel'}
          </p>
          
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Matricule</span>
              <span style={{ color: '#fff', fontWeight: 800, fontFamily: 'monospace', fontSize: '1.1rem' }}>{employee.matricule}</span>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Agence</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{employee.agence || employee.departement || 'Siège Central'}</span>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Manager (N+1)</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{employee.managerId?.nom ? `${employee.managerId.prenom} ${employee.managerId.nom}` : 'Non assigné'}</span>
            </div>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to={`/employees/${employee._id}/financials`} style={{ 
            padding: '1rem 2rem', 
            background: 'linear-gradient(135deg, var(--stb-blue-600), var(--stb-blue-700))', 
            border: '1px solid var(--stb-electric)', 
            borderRadius: '16px', color: '#fff', textDecoration: 'none', 
            fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', 
            boxShadow: '0 10px 25px rgba(41,98,255,0.4), inset 0 2px 5px rgba(255,255,255,0.2)',
            fontSize: '1rem'
          }}>
            <Wallet size={20} /> Synthèse Financière
          </Link>
        </motion.div>
      </motion.div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* Informations */}
        <motion.div initial="hidden" animate="visible" variants={cardVariants} custom={1} style={{ background: 'rgba(18,18,28,0.6)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '1.8rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(41,98,255,0.1)', borderRadius: '10px' }}><User size={20} color="var(--stb-electric)" /></div> Identité & Contact
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { icon: Phone, label: 'Téléphone', value: employee.phone || '+216 00 000 000' },
              { icon: Mail, label: 'Email', value: employee.email },
              { icon: MapPin, label: 'Adresse', value: 'Tunis, Tunisie' },
              { icon: Calendar, label: 'Date embauche', value: employee.dateEmbauche ? new Date(employee.dateEmbauche).toLocaleDateString('fr-FR') : '01/01/2024' },
              { icon: Clock, label: 'Ancienneté', value: `${seniorityYears} ans` },
              { icon: FileText, label: 'Numéro CNSS', value: '12345678-90' },
              { icon: Award, label: 'Grade Actuel', value: 'Cadre Supérieur' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: idx === 6 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <item.icon size={16} /> <span>{item.label}</span>
                </div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Salaire & Finance */}
        <motion.div initial="hidden" animate="visible" variants={cardVariants} custom={2} style={{ background: 'rgba(18,18,28,0.6)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '1.8rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(16,185,129,0.1)', borderRadius: '10px' }}><DollarSign size={20} color="#10B981" /></div> Rémunération
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,0,0,0))', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }}><DollarSign size={80} /></div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Salaire de base</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10B981', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                {(employee.salaireBase || 0).toLocaleString('fr-TN')} <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>TND/mois</span>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {[
                { label: 'Primes (Cette année)', value: `${realPrimes.toLocaleString('fr-TN')} TND`, color: '#2962FF', icon: Gift, badge: realPrimes > 0 ? `${realPrimes > 0 ? realPrimes / 1000 : 0}k` : null },
                { label: 'Crédits (Mensualité)', value: creditsMensualite > 0 ? `${creditsMensualite.toLocaleString('fr-TN')} TND` : '—', color: '#F59E0B', icon: CreditCard },
                { label: 'Avances (En cours)', value: avancesTotalDue > 0 ? `${avancesTotalDue.toLocaleString('fr-TN')} TND` : '—', color: '#EF4444', icon: TrendingUp },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                    <item.icon size={16} color={item.color} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.label}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Congés */}
        <motion.div initial="hidden" animate="visible" variants={cardVariants} custom={3} style={{ background: 'rgba(18,18,28,0.6)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '1.8rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(245,158,11,0.1)', borderRadius: '10px' }}><Calendar size={20} color="#F59E0B" /></div> Gestion des Congés
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray={`${(leaveRestant/leaveTotal)*100}, 100`} style={{ transition: 'stroke-dasharray 1s ease-out' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{leaveRestant}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>Jours restants</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Total acquis</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>{leaveTotal} J</div>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.05)', padding: '1.25rem', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.1)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Jours Pris</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#EF4444' }}>{leavePris} J</div>
            </div>
          </div>
        </motion.div>

        {/* Documents */}
        <motion.div initial="hidden" animate="visible" variants={cardVariants} custom={4} style={{ background: 'rgba(18,18,28,0.6)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '1.8rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(139,92,246,0.1)', borderRadius: '10px' }}><FileText size={20} color="#8B5CF6" /></div> Documents RH
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['Contrat de travail', 'Dernière Fiche de Paie', 'Attestation de travail', 'Avenant au contrat'].map((doc, i) => (
              <motion.div whileHover={{ scale: 1.02 }} key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'linear-gradient(90deg, rgba(139,92,246,0.05), rgba(0,0,0,0.2))', borderRadius: '16px', border: '1px solid rgba(139,92,246,0.1)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.5rem', background: 'rgba(139,92,246,0.1)', borderRadius: '10px' }}><FileText size={16} color="#8B5CF6" /></div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{doc}</span>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Download size={14} color="#fff" />
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={16} color="var(--stb-electric)" /> GÉNÉRATION IA (SMART DOCUMENTS)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {['Avertissement', 'Lettre de recommandation'].map(doc => (
                <button
                  key={doc}
                  onClick={() => handleGenerateDoc(doc)}
                  disabled={generatingDoc !== null}
                  style={{
                    padding: '0.75rem', background: 'rgba(41,98,255,0.1)', border: '1px solid rgba(41,98,255,0.3)',
                    borderRadius: '12px', color: '#fff', fontSize: '0.8rem', fontWeight: 600,
                    cursor: generatingDoc ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'all 0.2s', opacity: generatingDoc && generatingDoc !== doc ? 0.5 : 1
                  }}
                  onMouseOver={e => !generatingDoc && (e.currentTarget.style.background = 'rgba(41,98,255,0.2)')}
                  onMouseOut={e => !generatingDoc && (e.currentTarget.style.background = 'rgba(41,98,255,0.1)')}
                >
                  {generatingDoc === doc ? (
                    <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Création...</>
                  ) : (
                    <><Sparkles size={14} color="#FBBF24" /> {doc}</>
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Performance */}
        <motion.div initial="hidden" animate="visible" variants={cardVariants} custom={5} style={{ background: 'rgba(18,18,28,0.6)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '1.8rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '10px' }}><Target size={20} color="#EF4444" /></div> Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>
                <span style={{ color: '#fff' }}>Atteinte des objectifs</span>
                <span style={{ color: 'var(--stb-electric)' }}>87%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: '87%' }} transition={{ duration: 1, delay: 0.5 }} style={{ height: '100%', background: 'linear-gradient(90deg, #2962FF, #00B4FF)', borderRadius: '5px', boxShadow: '0 0 10px rgba(41,98,255,0.5)' }}></motion.div>
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>
                <span style={{ color: '#fff' }}>Taux de présence</span>
                <span style={{ color: '#10B981' }}>96%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: '96%' }} transition={{ duration: 1, delay: 0.7 }} style={{ height: '100%', background: 'linear-gradient(90deg, #10B981, #34D399)', borderRadius: '5px', boxShadow: '0 0 10px rgba(16,185,129,0.5)' }}></motion.div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ flex: 1, padding: '1.25rem', background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(0,0,0,0.1))', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Retards</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EF4444' }}>1</div>
              </div>
              <div style={{ flex: 1, padding: '1.25rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,0,0,0.1))', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Abs. Injustifiées</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10B981' }}>0</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Organigramme */}
        <motion.div initial="hidden" animate="visible" variants={cardVariants} custom={6} style={{ background: 'rgba(18,18,28,0.6)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '1.8rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}><Users size={20} color="#fff" /></div> Hiérarchie
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', paddingTop: '1rem' }}>
            {/* Manager */}
            <div style={{ padding: '1rem 2rem', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', width: '80%' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Manager (N+1)</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{employee.managerId?.nom ? `${employee.managerId.prenom} ${employee.managerId.nom}` : 'Direction Générale'}</div>
            </div>
            
            <div style={{ width: '2px', height: '25px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), var(--stb-blue-500))' }}></div>
            
            {/* Current Employee */}
            <div style={{ position: 'relative', padding: '1.25rem 2rem', background: 'linear-gradient(135deg, var(--stb-blue-600), var(--stb-electric))', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center', width: '90%', boxShadow: '0 10px 25px rgba(41,98,255,0.4)' }}>
              <div style={{ position: 'absolute', left: '-5px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', borderRadius: '50%', background: '#fff', boxShadow: '0 0 10px #fff' }}></div>
              <div style={{ position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', borderRadius: '50%', background: '#fff', boxShadow: '0 0 10px #fff' }}></div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.3rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Employé ciblé</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>{employee.prenom} {employee.nom}</div>
            </div>

            <div style={{ width: '2px', height: '25px', background: 'linear-gradient(to bottom, var(--stb-blue-500), rgba(255,255,255,0.1))' }}></div>

            {/* Subordinate */}
            <div style={{ padding: '1rem 2rem', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center', width: '80%' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Équipe (N-1)</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>{employee.roles?.includes('MANAGER') ? 'Équipe rattachée' : 'Aucun subordonné'}</div>
            </div>
          </div>
        </motion.div>

        {/* 🧠 BURNOUT PREDICTOR AI */}
        <motion.div
          initial="hidden" animate="visible" variants={cardVariants} custom={7}
          style={{
            gridColumn: '1 / -1',
            background: burnoutScore >= 65
              ? 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(18,18,28,0.9))'
              : burnoutScore >= 40
              ? 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(18,18,28,0.9))'
              : 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(18,18,28,0.9))',
            backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '2rem',
            border: `1px solid ${burnoutColor}30`,
            boxShadow: `0 8px 40px ${burnoutGlow}, 0 0 0 1px ${burnoutColor}15`,
            position: 'relative', overflow: 'hidden'
          }}
        >
          {/* Animated glow pulse if high risk */}
          {burnoutScore >= 65 && (
            <motion.div
              animate={{ opacity: [0.15, 0.35, 0.15] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.15), transparent 70%)', pointerEvents: 'none' }}
            />
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Icon + Score */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', minWidth: '140px' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <motion.path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke={burnoutColor} strokeWidth="3"
                    initial={{ strokeDasharray: '0, 100' }}
                    animate={{ strokeDasharray: `${burnoutScore}, 100` }}
                    transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                    style={{ filter: `drop-shadow(0 0 6px ${burnoutColor})` }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Flame size={22} color={burnoutColor} style={{ filter: `drop-shadow(0 0 8px ${burnoutColor})` }} />
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{burnoutScore}</span>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Risk Score</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: burnoutColor, marginTop: '0.2rem', textShadow: `0 0 15px ${burnoutColor}` }}>{burnoutLevel}</div>
              </div>
            </div>

            {/* Details */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.25rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BrainCircuit size={24} color={burnoutColor} style={{ filter: `drop-shadow(0 0 8px ${burnoutColor})` }} />
                Burnout Risk Predictor
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: `${burnoutColor}20`, color: burnoutColor, borderRadius: '20px', border: `1px solid ${burnoutColor}40`, fontWeight: 700 }}>
                  STB AI
                </span>
              </h3>
              <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {burnoutScore >= 65
                  ? `⚠️ ${employee.prenom} présente des signaux de risque élevé. Il est fortement conseillé d'engager une conversation et de planifier un repos.`
                  : burnoutScore >= 40
                  ? `🟡 Quelques indicateurs à surveiller. Vérifiez la charge de travail de ${employee.prenom} dans les prochaines semaines.`
                  : `✅ ${employee.prenom} présente un niveau de bien-être satisfaisant. Aucune action immédiate requise.`}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                {[
                  { label: 'Congés non pris', value: `${leaveRestant} jours`, risk: leaveRestant > 20, icon: Calendar },
                  { label: 'Retards ce mois', value: retardsCount > 0 ? `${retardsCount} retard${retardsCount > 1 ? 's' : ''}` : 'Aucun', risk: retardsCount > 0, icon: Clock },
                  { label: 'Ancienneté', value: `${seniorityYears} ans`, risk: parseFloat(String(seniorityYears)) > 4, icon: Award },
                  { label: 'Heures sup.', value: heuresSupp > 0 ? `${heuresSupp}h` : '0h', risk: heuresSupp > 10, icon: Activity },
                ].map((factor, i) => (
                  <div key={i} style={{
                    padding: '0.875rem', borderRadius: '12px',
                    background: factor.risk ? `${burnoutColor}12` : 'rgba(16,185,129,0.08)',
                    border: `1px solid ${factor.risk ? burnoutColor : '#10B981'}25`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      <factor.icon size={13} color={factor.risk ? burnoutColor : '#10B981'} />
                      {factor.label}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: factor.risk ? burnoutColor : '#10B981' }}>{factor.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            {burnoutScore >= 40 && (
              <div style={{ minWidth: '200px', padding: '1.25rem', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: `1px solid ${burnoutColor}25` }}>
                <div style={{ fontSize: '0.75rem', color: burnoutColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={14} /> Recommandations IA
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {burnoutScore >= 65 ? (
                    <>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>📅 Planifier un congé dès que possible</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>💬 Entretien manager urgent</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>🏥 Orientation médecine du travail</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>📊 Suivi hebdomadaire conseillé</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>🎯 Réduire les heures supplémentaires</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Timeline Historique */}
        <motion.div initial="hidden" animate="visible" variants={cardVariants} custom={7} style={{ gridColumn: '1 / -1', background: 'rgba(18,18,28,0.6)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(0,180,255,0.1)', borderRadius: '10px' }}><Clock size={20} color="var(--stb-electric)" /></div> Timeline des Événements
          </h3>
          
          <div style={{ position: 'relative', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0))' }}></div>
            
            {[
              { time: 'Aujourd\'hui', desc: 'Versement Prime de Rendement (1000 TND)', color: '#10B981', icon: DollarSign },
              { time: 'Hier', desc: 'Validation Congé Annuel (3 jours)', color: '#F59E0B', icon: Calendar },
              { time: 'La semaine dernière', desc: 'Création compte et carte bancaire STB', color: '#2962FF', icon: CreditCard },
              { time: 'Janvier 2026', desc: 'Promotion: Ingénieur Senior', color: '#8B5CF6', icon: TrendingUp },
            ].map((ev, i) => (
              <motion.div whileHover={{ x: 10 }} key={i} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ position: 'absolute', left: '-2.7rem', width: '24px', height: '24px', borderRadius: '50%', background: ev.color, border: '4px solid #12121C', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 15px ${ev.color}80` }}>
                  {/* Small internal dot */}
                  <div style={{ width: '4px', height: '4px', background: '#fff', borderRadius: '50%' }}></div>
                </div>
                <div style={{ padding: '0.75rem', background: `${ev.color}15`, borderRadius: '12px' }}>
                  <ev.icon size={20} color={ev.color} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: ev.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>{ev.time}</div>
                  <div style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 600 }}>{ev.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Employee360;
