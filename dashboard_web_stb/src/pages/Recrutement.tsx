import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, CheckCircle2, XCircle, Briefcase, UserPlus, Upload, FileText, Users, ChevronDown } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Recrutement = () => {
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('Ingénieur en Informatique Full-Stack');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText.trim();
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    setFileName(file.name);
    
    if (file.type === 'application/pdf') {
      setIsLoadingPdf(true);
      const toastId = toast.loading('Extraction du texte PDF...');
      try {
        const text = await extractTextFromPdf(file);
        setCvText(text);
        toast.success(`CV extrait : ${file.name}`, { id: toastId });
      } catch {
        toast.error('Impossible de lire ce PDF.', { id: toastId });
      } finally {
        setIsLoadingPdf(false);
      }
    } else if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCvText(e.target?.result as string);
        toast.success(`Fichier chargé : ${file.name}`);
      };
      reader.readAsText(file);
    } else {
      toast.error('Format non supporté. Utilisez un PDF ou TXT.');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const loadEmployeeCV = async () => {
    setIsLoadingEmployees(true);
    try {
      const { data } = await api.get('/employees?limit=100');
      const list = data?.data || data || [];
      setEmployees(Array.isArray(list) ? list : []);
      setShowEmployeeList(true);
    } catch {
      toast.error('Impossible de charger les employés.');
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const selectEmployee = (emp: any) => {
    const generatedCv = `CURRICULUM VITAE
=================
Nom : ${emp.prenom || ''} ${emp.nom || ''}
Matricule : ${emp.matricule || ''}
Poste actuel : ${emp.poste || 'Non défini'}
Département : ${emp.departement || emp.direction || 'Non défini'}
Email : ${emp.email || ''}
Téléphone : ${emp.phone || ''}
Ancienneté : ${emp.dateEmbauche ? Math.floor((new Date().getTime() - new Date(emp.dateEmbauche).getTime()) / (1000*3600*24*365)) + ' ans' : 'Non défini'}
Solde Congés : ${emp.soldeConges || 0} jours
Salaire de base : ${emp.salaireBase || 0} TND

COMPÉTENCES TECHNIQUES :
• Maîtrise des outils bancaires STB
• Gestion des opérations financières
• Relation clientèle et service bancaire
• Conformité réglementaire et compliance

FORMATION :
• Formation bancaire interne STB
• Certification secteur financier tunisien

EXPÉRIENCES PRÉCÉDENTES :
• ${emp.poste || 'Collaborateur'} chez STB Bank depuis ${emp.dateEmbauche ? new Date(emp.dateEmbauche).getFullYear() : 'N/A'}`;

    setCvText(generatedCv);
    setFileName(`CV_${emp.prenom}_${emp.nom}.txt`);
    setShowEmployeeList(false);
    toast.success(`CV de ${emp.prenom} ${emp.nom} chargé !`);
  };

  const handleAnalyze = async () => {
    if (!cvText.trim()) {
      toast.error('Veuillez charger ou coller un CV.');
      return;
    }
    setIsAnalyzing(true);
    const toastId = toast.loading("L'IA STB analyse le profil...");
    try {
      const { data } = await api.post('/ai/analyze-cv', { cvText, jobDescription });
      setAnalysis(data);
      toast.success('Analyse terminée avec succès.', { id: toastId });
    } catch {
      toast.error("Erreur lors de l'analyse.", { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

  const radarData = analysis ? [
    { subject: 'Expérience', A: Math.min(100, analysis.score + 10) },
    { subject: 'Compétences', A: analysis.score },
    { subject: 'Soft Skills', A: Math.min(100, analysis.score + 15) },
    { subject: 'Formation', A: 90 },
    { subject: 'Culture STB', A: Math.max(0, analysis.score - 5) },
  ] : [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <UserPlus className="title-icon" style={{ color: 'var(--stb-electric)' }} />
            Recrutement IA
          </h1>
          <p className="page-subtitle">Analyse sémantique des CV et matching avec les offres STB</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left: Input */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Offre emploi */}
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Offre d'emploi cible
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.6rem 1rem' }}>
              <Briefcase size={16} color="var(--stb-blue-300)" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
              <input
                type="text"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Upload zone */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                Charger un CV
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', background: 'rgba(41,98,255,0.1)', border: '1px solid rgba(41,98,255,0.3)', borderRadius: '8px', color: 'var(--stb-electric)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Upload size={12} /> Importer PDF
                </button>
                <button
                  onClick={loadEmployeeCV}
                  disabled={isLoadingEmployees}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#10B981', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Users size={12} /> Employé STB <ChevronDown size={10} />
                </button>
              </div>
            </div>

            <input ref={fileInputRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

            {/* Employee dropdown */}
            <AnimatePresence>
              {showEmployeeList && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  style={{ background: 'rgba(5,5,15,0.98)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '0.5rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '0.75rem', zIndex: 10 }}
                >
                  {employees.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Aucun employé trouvé</p>
                  ) : (
                    employees.map((emp) => (
                      <button
                        key={emp._id}
                        onClick={() => selectEmployee(emp)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.6rem 0.75rem', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', color: '#fff' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#10B981', flexShrink: 0 }}>
                          {emp.prenom?.[0]}{emp.nom?.[0]}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>{emp.prenom} {emp.nom}</p>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.matricule} — {emp.poste || 'N/A'}</p>
                        </div>
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Drag-and-drop zone */}
            <motion.div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              animate={{ borderColor: isDragging ? 'var(--stb-electric)' : 'rgba(255,255,255,0.06)', background: isDragging ? 'rgba(41,98,255,0.06)' : 'rgba(0,0,0,0.15)' }}
              onClick={() => fileInputRef.current?.click()}
              style={{ border: '2px dashed rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.25rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '0.75rem' }}
            >
              {isLoadingPdf ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid rgba(41,98,255,0.2)', borderTopColor: 'var(--stb-electric)', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--stb-electric)' }}>Extraction en cours...</span>
                </div>
              ) : fileName ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <FileText size={20} color="#10B981" />
                  <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 600 }}>{fileName}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <Upload size={24} color="rgba(255,255,255,0.2)" />
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Glisser-déposer un <strong style={{ color: 'var(--stb-electric)' }}>PDF</strong> ou <strong style={{ color: 'var(--stb-electric)' }}>TXT</strong></p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>ou cliquer pour choisir un fichier</p>
                </div>
              )}
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </motion.div>

            {/* Text area */}
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Ou collez le texte du CV directement
            </label>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Nom : ..., Expérience : ..., Compétences : ..."
              rows={7}
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.75rem 1rem', color: '#fff', outline: 'none', fontSize: '0.85rem', resize: 'vertical', fontFamily: 'monospace', boxSizing: 'border-box' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--stb-electric)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.05)')}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!cvText.trim())}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', background: 'linear-gradient(135deg, #1E40AF, var(--stb-electric))', fontSize: '1rem', fontWeight: 700 }}
          >
            {isAnalyzing ? (
              <>
                <span className="spinner" style={{ width: '18px', height: '18px' }}></span>
                Analyse IA en cours...
              </>
            ) : (
              <>
                <BrainCircuit size={20} />
                Lancer l'analyse intelligente
              </>
            )}
          </button>
        </div>

        {/* Right: Results */}
        <AnimatePresence mode="wait">
          {analysis ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="card"
              style={{ background: 'linear-gradient(145deg, rgba(10,6,25,0.95), rgba(5,3,15,0.98))', border: '1px solid rgba(41,98,255,0.2)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {/* Score */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700 }}>Matching Score IA</h3>
                  <span style={{
                    padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800,
                    background: analysis.recommendation === 'HIRE' ? 'rgba(16,185,129,0.2)' : analysis.recommendation === 'INTERVIEW' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                    color: analysis.recommendation === 'HIRE' ? '#10B981' : analysis.recommendation === 'INTERVIEW' ? '#F59E0B' : '#EF4444'
                  }}>
                    {analysis.recommendation === 'HIRE' ? '✅ EXCELLENT PROFIL' : analysis.recommendation === 'INTERVIEW' ? '🟡 À ENVISAGER' : '❌ PROFIL NON RETENU'}
                  </span>
                </div>
                <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="90" height="90" viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r="40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="9" />
                    <motion.circle
                      cx="45" cy="45" r="40" fill="none"
                      stroke={getScoreColor(analysis.score)} strokeWidth="9"
                      strokeDasharray={`${(analysis.score / 100) * 251} 251`}
                      strokeLinecap="round" transform="rotate(-90 45 45)"
                      initial={{ strokeDasharray: '0 251' }}
                      animate={{ strokeDasharray: `${(analysis.score / 100) * 251} 251` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      style={{ filter: `drop-shadow(0 0 8px ${getScoreColor(analysis.score)}80)` }}
                    />
                  </svg>
                  <span style={{ position: 'absolute', fontSize: '1.5rem', fontWeight: 900, color: getScoreColor(analysis.score) }}>{analysis.score}%</span>
                </div>
              </div>

              {/* Summary */}
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: `4px solid ${getScoreColor(analysis.score)}` }}>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{analysis.summary}</p>
              </div>

              {/* Strengths / Weaknesses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(16,185,129,0.05)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(16,185,129,0.1)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: 700 }}>
                    <CheckCircle2 size={15} /> Points Forts
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.8 }}>
                    {analysis.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div style={{ background: 'rgba(239,68,68,0.05)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(239,68,68,0.1)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#EF4444', margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: 700 }}>
                    <XCircle size={15} /> Points Faibles
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.8 }}>
                    {analysis.weaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>

              {/* Radar Chart */}
              <div style={{ height: '200px', width: '100%', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '0.5rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.07)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} />
                    <Radar name="Candidat" dataKey="A" stroke="var(--stb-electric)" fill="var(--stb-electric)" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="card"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)', minHeight: '400px' }}
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(41,98,255,0.05)', border: '1px solid rgba(41,98,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <BrainCircuit size={44} color="rgba(41,98,255,0.25)" />
              </motion.div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>Analyse IA en attente</h3>
              <p style={{ textAlign: 'center', maxWidth: '280px', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                Importez un <strong style={{ color: 'var(--stb-electric)' }}>PDF</strong>, sélectionnez un <strong style={{ color: '#10B981' }}>employé STB</strong>, ou collez un CV pour générer un rapport IA complet.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Score de matching', 'Points forts/faibles', 'Radar Chart IA', 'Verdict final'].map((feat) => (
                  <span key={feat} style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                    {feat}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Recrutement;
