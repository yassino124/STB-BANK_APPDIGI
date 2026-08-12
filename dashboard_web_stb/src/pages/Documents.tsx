import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Upload, FileText, Trash2, Eye, CheckCircle, Clock, X, ChevronRight, Download, Sparkles, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface Document {
  _id: string;
  title: string;
  type: string;
  fileName: string;
  fileSize: number;
  year: number;
  month?: number;
  createdAt: string;
  isRead: boolean;
  fileUrl: string;
}

interface Employee {
  _id: string;
  prenom: string;
  nom: string;
  matricule: string;
  poste: string;
  avatar?: string;
}

const documentTypes = [
  { value: 'PAYSLIP', label: 'Fiche de Paie', icon: '💰', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', autoGen: false },
  { value: 'WORK_CERTIFICATE', label: 'Attestation de Travail', icon: '💼', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', autoGen: false },
  { value: 'SALARY_CERTIFICATE', label: 'Attestation Salaire', icon: '💵', color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)', autoGen: false },
  { value: 'TAX_DECLARATION', label: 'Déclaration Fiscale', icon: '📊', color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', autoGen: false },
  { value: 'CNSS_DECLARATION', label: 'Déclaration CNSS', icon: '🏥', color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', autoGen: false },
  { value: 'CONTRACT', label: 'Contrat', icon: '📝', color: '#6366F1', gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)', autoGen: false },
  { value: 'ID_DOCUMENT', label: 'Pièce Identité', icon: '🆔', color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)', autoGen: false },
  { value: 'OTHER', label: 'Autre', icon: '📄', color: '#94A3B8', gradient: 'linear-gradient(135deg, #94A3B8, #64748B)', autoGen: false },
];

// Auto-generated document types (from backend)
const autoGenDocumentTypes = [
  { value: 'PACK_EMBAUCHE', label: 'Pack Embauche (Complet)', icon: '🎁', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', autoGen: true },
  { value: 'CONTRAT_CDI', label: 'Contrat CDI', icon: '📋', color: '#6366F1', gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)', autoGen: true },
  { value: 'CONTRAT_CDD', label: 'Contrat CDD', icon: '📋', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', autoGen: true },
  { value: 'ATTESTATION_EMBAUCHE', label: 'Attestation Embauche', icon: '🎓', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', autoGen: true },
  { value: 'ATTESTATION_TRAVAIL', label: 'Attestation Travail', icon: '💼', color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)', autoGen: true },
  { value: 'ATTESTATION_SALAIRE', label: 'Attestation Salaire', icon: '💵', color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', autoGen: true },
  { value: 'FICHE_PAIE', label: 'Fiche de Paie', icon: '💰', color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', autoGen: true },
  { value: 'AUTORISATION_CONGE', label: 'Autorisation Congé', icon: '🏖️', color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)', autoGen: true },
  { value: 'DECISION_PRIME', label: 'Décision Prime', icon: '💎', color: '#EC4899', gradient: 'linear-gradient(135deg, #EC4899, #DB2777)', autoGen: true },
  { value: 'CONTRAT_CREDIT', label: 'Contrat Crédit', icon: '🏦', color: '#14B8A6', gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)', autoGen: true },
  { value: 'AVENANT_CONTRAT', label: 'Avenant Contrat', icon: '📝', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', autoGen: true },
  { value: 'DECISION_PROMOTION', label: 'Décision Promotion', icon: '📈', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', autoGen: true },
  { value: 'DECISION_MUTATION', label: 'Décision Mutation', icon: '🔄', color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', autoGen: true },
];

export default function Documents() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAutoGenModal, setShowAutoGenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [uploadData, setUploadData] = useState({
    title: '',
    type: 'PAYSLIP',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    description: '',
    file: null as File | null,
  });

  const [autoGenData, setAutoGenData] = useState({
    templateType: 'PACK_EMBAUCHE',
    variables: {} as Record<string, string>,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchDocuments(selectedEmployee._id);
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/employees/directory/search?q=');
      setEmployees(res.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Erreur de chargement des employés');
    }
  };

  const fetchDocuments = async (employeeId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`/documents/employee/${employeeId}`);
      setDocuments(res.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Erreur de chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadData({ ...uploadData, file: e.target.files[0], title: e.target.files[0].name });
    }
  };

  const handleUpload = async () => {
    if (!selectedEmployee || !uploadData.file) return;

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        const payload = {
          employeeId: selectedEmployee._id,
          title: uploadData.title || uploadData.file!.name,
          type: uploadData.type,
          fileName: uploadData.file!.name,
          fileSize: uploadData.file!.size,
          fileUrl: base64,
          mimeType: uploadData.file!.type,
          description: uploadData.description,
          year: uploadData.year,
          month: uploadData.type === 'PAYSLIP' ? uploadData.month : undefined,
          isRead: false,
        };

        try {
          await axios.post('/documents', payload);
          toast.success('Document uploadé avec succès !');
          setShowUploadModal(false);
          setUploadData({
            title: '',
            type: 'PAYSLIP',
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            description: '',
            file: null,
          });
          fetchDocuments(selectedEmployee._id);
        } catch (error) {
          console.error('Upload error:', error);
          toast.error('Erreur lors de l\'upload');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(uploadData.file);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const deleteDocument = async (docId: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce document ?')) return;
    try {
      await axios.delete(`/documents/${docId}`);
      toast.success('Document supprimé');
      if (selectedEmployee) fetchDocuments(selectedEmployee._id);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleAutoGenerate = async () => {
    if (!selectedEmployee) return;

    try {
      setLoading(true);
      
      if (autoGenData.templateType === 'PACK_EMBAUCHE') {
        await axios.post(`/documents/onboarding/${selectedEmployee._id}`);
        toast.success('Pack Embauche généré avec succès !');
      } else {
        const payload = {
          type: autoGenData.templateType,
          additionalData: autoGenData.variables,
        };
        await axios.post(`/documents/generate/${selectedEmployee._id}`, payload);
        toast.success('Document généré avec succès !');
      }
      
      setShowAutoGenModal(false);
      setAutoGenData({ templateType: 'PACK_EMBAUCHE', variables: {} });
      fetchDocuments(selectedEmployee._id);
    } catch (error: any) {
      console.error('Auto-generation error:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (docId: string) => {
    try {
      const res = await axios.get(`/documents/${docId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `document_${docId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Document téléchargé');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    `${emp.prenom} ${emp.nom} ${emp.matricule}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeInfo = (type: string) => {
    const allTypes = [...documentTypes, ...autoGenDocumentTypes];
    return allTypes.find(t => t.value === type) || documentTypes[documentTypes.length - 1];
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2rem' }}>
            <div style={{ padding: '10px', background: 'linear-gradient(135deg, rgba(41,98,255,0.2), rgba(41,98,255,0.05))', borderRadius: '14px', border: '1px solid rgba(41,98,255,0.3)' }}>
              📄
            </div>
            Gestion des Documents
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="page-subtitle" style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
            Centralisez et gérez les documents RH de vos collaborateurs en toute sécurité.
          </motion.p>
        </div>
        {selectedEmployee && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(139,92,246,0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAutoGenModal(true)} 
              className="btn"
              style={{ 
                padding: '0.8rem 1.75rem', 
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
                boxShadow: '0 8px 20px rgba(139,92,246,0.3)',
                borderRadius: '99px',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Sparkles size={18} />
              Générer Auto
            </motion.button>
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(41,98,255,0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUploadModal(true)} 
              className="btn btn-primary"
              style={{ 
                padding: '0.8rem 1.75rem', 
                background: 'linear-gradient(135deg, #2962FF, #1565C0)', 
                boxShadow: '0 8px 20px rgba(41,98,255,0.3)',
                borderRadius: '99px',
                fontSize: '1rem',
                fontWeight: 700
              }}
            >
              <Upload size={18} />
              Uploader
            </motion.button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        
        {/* Left Sidebar: Employees */}
        <div className="glass-card" style={{ width: '380px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 100%)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>Collaborateurs</h3>
            <div className="search-box" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Search size={18} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Rechercher (nom, matricule)..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', fontSize: '0.95rem' }}
              />
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }} className="scrollbar-thin">
            <AnimatePresence>
              {filteredEmployees.map((emp, idx) => {
                const isSelected = selectedEmployee?._id === emp._id;
                return (
                  <motion.div
                    key={emp._id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                    onClick={() => setSelectedEmployee(emp)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1rem', cursor: 'pointer',
                      borderRadius: '16px',
                      background: isSelected ? 'linear-gradient(135deg, rgba(41,98,255,0.15), rgba(41,98,255,0.05))' : 'transparent',
                      border: isSelected ? '1px solid rgba(41,98,255,0.4)' : '1px solid transparent',
                      boxShadow: isSelected ? '0 4px 15px rgba(41,98,255,0.1)' : 'none',
                      marginBottom: '0.5rem',
                      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <div className="avatar avatar-md" style={{ 
                      background: isSelected && !emp.avatar ? 'linear-gradient(135deg, #2962FF, #1565C0)' : 'rgba(255,255,255,0.08)',
                      boxShadow: isSelected ? '0 4px 10px rgba(41,98,255,0.3)' : 'none',
                      color: isSelected ? '#fff' : 'var(--text-muted)'
                    }}>
                      {emp.avatar ? (
                        <img src={emp.avatar} alt={emp.prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <>{emp.prenom[0]}{emp.nom[0]}</>
                      )}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: isSelected ? '#fff' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {emp.prenom} {emp.nom}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>
                        {emp.matricule} • {emp.poste || 'Collaborateur'}
                      </div>
                    </div>
                    {isSelected && (
                      <ChevronRight size={20} color="var(--stb-electric)" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Content: Documents */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!selectedEmployee ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, rgba(41,98,255,0.05) 0%, rgba(0,0,0,0.2) 100%)' }}>
              <div style={{ 
                width: '120px', height: '120px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', 
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2), inset 0 2px 20px rgba(255,255,255,0.05)'
              }}>
                <FileText size={48} color="rgba(255,255,255,0.2)" />
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>Aucun collaborateur sélectionné</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px', textAlign: 'center', lineHeight: '1.5' }}>
                Sélectionnez un employé dans la liste de gauche pour consulter, ajouter ou gérer ses documents RH.
              </p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
              
              <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(90deg, rgba(41,98,255,0.05) 0%, rgba(0,0,0,0) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div className="avatar avatar-lg" style={{ background: selectedEmployee.avatar ? 'transparent' : 'linear-gradient(135deg, #1565C0, #2962FF)', boxShadow: '0 8px 20px rgba(41,98,255,0.3)' }}>
                    {selectedEmployee.avatar ? (
                      <img src={selectedEmployee.avatar} alt={selectedEmployee.prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>{selectedEmployee.prenom[0]}{selectedEmployee.nom[0]}</>
                    )}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
                      Dossier de {selectedEmployee.prenom} {selectedEmployee.nom}
                    </h2>
                    <p style={{ color: 'var(--stb-blue-300)', fontSize: '1rem', fontWeight: 600, marginTop: '0.2rem' }}>
                      {documents.length} document{documents.length !== 1 ? 's' : ''} enregistré{documents.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div style={{ flex: 1, padding: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="shimmer-effect" style={{ width: '320px', height: '220px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}></div>
                  ))}
                </div>
              ) : documents.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                  <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '4rem' }}>📭</span>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Le dossier est vide</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>Aucun document n'a encore été ajouté pour ce collaborateur.</p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUploadModal(true)} 
                    className="btn btn-primary"
                    style={{ padding: '1rem 2rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, #1565C0, #2962FF)' }}
                  >
                    + Ajouter le premier document
                  </motion.button>
                </div>
              ) : (
                <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', alignContent: 'start', flex: 1, overflowY: 'auto' }} className="scrollbar-thin">
                  <AnimatePresence>
                    {documents.map((doc, idx) => {
                      const type = getTypeInfo(doc.type);
                      return (
                        <motion.div
                          key={doc._id}
                          initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            padding: '1.5rem',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            cursor: 'default',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                            e.currentTarget.style.boxShadow = `0 15px 40px ${type.color}20`;
                            e.currentTarget.style.border = `1px solid ${type.color}50`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                          }}
                        >
                          {/* Accent Gradient Background Glow */}
                          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: type.color, filter: 'blur(80px)', opacity: 0.15, borderRadius: '50%' }}></div>
                          
                          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: type.gradient, boxShadow: `0 8px 16px ${type.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                              {type.icon}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={doc.title}>
                                {doc.title}
                              </h3>
                              <span style={{ 
                                display: 'inline-block', padding: '4px 10px', borderRadius: '8px', 
                                background: 'rgba(255,255,255,0.05)', color: type.color, fontSize: '0.75rem', fontWeight: 700,
                                border: `1px solid ${type.color}30`
                              }}>
                                {type.label}
                              </span>
                            </div>
                          </div>

                          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '14px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> Période</span>
                              <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{doc.month ? `${String(doc.month).padStart(2,'0')}/` : ''}{doc.year}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={14} /> Taille</span>
                              <strong style={{ color: '#fff' }}>{(doc.fileSize / 1024).toFixed(1)} KB</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Eye size={14} /> Statut</span>
                              {doc.isRead ? (
                                <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}><CheckCircle size={14} /> Lu</span>
                              ) : (
                                <span style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}><Clock size={14} /> Non lu</span>
                              )}
                            </div>
                          </div>

                          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                            <motion.button 
                              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                              style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }} 
                              onClick={() => downloadDocument(doc._id)}
                            >
                              <Download size={16} /> Télécharger
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.05, background: 'rgba(239,68,68,0.2)' }} whileTap={{ scale: 0.95 }}
                              style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                              onClick={() => deleteDocument(doc._id)}
                            >
                              <Trash2 size={18} />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Upload Modal (Premium WOW Design) */}
      <AnimatePresence>
        {showUploadModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
              onClick={() => !loading && setShowUploadModal(false)}
            />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              style={{ 
                position: 'relative',
                width: '100%', maxWidth: '750px', zIndex: 1000, 
                background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(9,14,23,0.98) 100%)',
                borderRadius: '32px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '200px', background: 'radial-gradient(ellipse at top, rgba(41,98,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
              
              <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #1565C0, #2962FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(41,98,255,0.3)' }}>
                    <Upload size={24} color="#fff" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Nouveau Document</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                      Pour <span style={{ color: '#fff', fontWeight: 600 }}>{selectedEmployee?.prenom} {selectedEmployee?.nom}</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => !loading && setShowUploadModal(false)}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxHeight: '70vh', overflowY: 'auto' }} className="scrollbar-thin">
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Type de Document</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                    {documentTypes.map(t => {
                      const isSelected = uploadData.type === t.value;
                      return (
                        <motion.div 
                          key={t.value} 
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setUploadData({ ...uploadData, type: t.value })}
                          style={{
                            padding: '1rem', borderRadius: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center',
                            background: isSelected ? t.gradient : 'rgba(255,255,255,0.03)',
                            border: isSelected ? '1px solid transparent' : '1px solid rgba(255,255,255,0.05)',
                            boxShadow: isSelected ? `0 10px 20px ${t.color}30` : 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span style={{ fontSize: '2rem', filter: isSelected ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' : 'none' }}>{t.icon}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isSelected ? '#fff' : 'var(--text-muted)' }}>{t.label}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#fff' }}>Titre personnalisé (Optionnel)</label>
                    <input type="text" className="form-input" placeholder="Ex: Fiche de paie Janvier 2026" 
                      value={uploadData.title} onChange={e => setUploadData({ ...uploadData, title: e.target.value })} 
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                      <label className="form-label" style={{ color: '#fff' }}>Année</label>
                      <input type="number" className="form-input" value={uploadData.year} onChange={e => setUploadData({ ...uploadData, year: parseInt(e.target.value) })} 
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem' }}
                      />
                    </div>
                    {uploadData.type === 'PAYSLIP' && (
                      <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label className="form-label" style={{ color: '#fff' }}>Mois</label>
                        <select className="form-input" value={uploadData.month} onChange={e => setUploadData({ ...uploadData, month: parseInt(e.target.value) })}
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', color: '#fff' }}>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <option key={m} value={m} style={{ background: '#0F172A' }}>{new Date(2000, m - 1).toLocaleString('fr', { month: 'long' })}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <input type="file" id="doc-upload" className="form-input" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" style={{ display: 'none' }} />
                  <label htmlFor="doc-upload" style={{ 
                    border: uploadData.file ? '2px solid #10B981' : '2px dashed rgba(255,255,255,0.2)', 
                    borderRadius: '24px', padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer',
                    background: uploadData.file ? 'rgba(16, 185, 129, 0.05)' : 'rgba(0,0,0,0.2)', display: 'block', transition: 'all 0.3s' 
                  }}
                  onMouseEnter={(e) => { if (!uploadData.file) e.currentTarget.style.borderColor = 'rgba(41,98,255,0.5)'; e.currentTarget.style.background = 'rgba(41,98,255,0.05)' }}
                  onMouseLeave={(e) => { if (!uploadData.file) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(0,0,0,0.2)' }}
                  >
                    {uploadData.file ? (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle size={32} color="#10B981" />
                        </div>
                        <div>
                          <p style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.2rem' }}>Fichier sélectionné avec succès</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{uploadData.file.name} • {(uploadData.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </motion.div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                          <Upload size={36} color="var(--text-secondary)" />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>Cliquez pour uploader un document</span>
                        <span style={{ fontSize: '0.95rem' }}>Formats supportés: PDF, PNG, JPG (Max 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div style={{ padding: '1.5rem 2.5rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem' }}>
                <button onClick={() => setShowUploadModal(false)} style={{ flex: 1, padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 700, fontSize: '1rem', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  Annuler
                </button>
                <button onClick={handleUpload} disabled={!uploadData.file || loading} style={{ flex: 2, padding: '1rem', borderRadius: '16px', background: uploadData.file ? 'linear-gradient(135deg, #1565C0, #2962FF)' : 'rgba(255,255,255,0.1)', color: uploadData.file ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: uploadData.file ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: uploadData.file ? '0 10px 20px rgba(41,98,255,0.3)' : 'none' }}>
                  {loading ? (
                    <><div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> En cours...</>
                  ) : (
                    <><CheckCircle size={20} /> Valider l'Upload</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auto-Generate Modal */}
      <AnimatePresence>
        {showAutoGenModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
              onClick={() => !loading && setShowAutoGenModal(false)}
            />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              style={{ 
                position: 'relative',
                width: '100%', maxWidth: '750px', zIndex: 1000, 
                background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(9,14,23,0.98) 100%)',
                borderRadius: '32px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '200px', background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
              
              <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(139,92,246,0.3)' }}>
                    <Sparkles size={24} color="#fff" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Génération Automatique</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                      Pour <span style={{ color: '#fff', fontWeight: 600 }}>{selectedEmployee?.prenom} {selectedEmployee?.nom}</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => !loading && setShowAutoGenModal(false)}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxHeight: '70vh', overflowY: 'auto' }} className="scrollbar-thin">
                <div>
                  <label style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileCheck size={18} />
                    Type de Document à Générer
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                    {autoGenDocumentTypes.map(t => {
                      const isSelected = autoGenData.templateType === t.value;
                      return (
                        <motion.div 
                          key={t.value} 
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setAutoGenData({ ...autoGenData, templateType: t.value })}
                          style={{
                            padding: '1rem', borderRadius: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center',
                            background: isSelected ? t.gradient : 'rgba(255,255,255,0.03)',
                            border: isSelected ? '1px solid transparent' : '1px solid rgba(255,255,255,0.05)',
                            boxShadow: isSelected ? `0 10px 20px ${t.color}30` : 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span style={{ fontSize: '2rem', filter: isSelected ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' : 'none' }}>{t.icon}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isSelected ? '#fff' : 'var(--text-muted)' }}>{t.label}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: 'rgba(139,92,246,0.1)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Sparkles size={20} color="#8B5CF6" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Génération IA avec STB Branding</h3>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    Le document sera automatiquement généré en PDF avec le logo STB, les couleurs de la marque, et toutes les informations de l'employé. 
                    Les templates sont pré-configurés et conformes aux standards RH.
                  </p>
                </div>
              </div>

              <div style={{ padding: '1.5rem 2.5rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem' }}>
                <button onClick={() => setShowAutoGenModal(false)} style={{ flex: 1, padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 700, fontSize: '1rem', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  Annuler
                </button>
                <button onClick={handleAutoGenerate} disabled={loading} style={{ flex: 2, padding: '1rem', borderRadius: '16px', background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)', color: loading ? 'rgba(255,255,255,0.3)' : '#fff', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: loading ? 'none' : '0 10px 20px rgba(139,92,246,0.3)' }}>
                  {loading ? (
                    <><div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> Génération...</>
                  ) : (
                    <><Sparkles size={20} /> Générer le Document</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
