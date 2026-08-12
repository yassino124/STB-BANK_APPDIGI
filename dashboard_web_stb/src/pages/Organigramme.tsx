import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Search, Download, ChevronDown, Award, Mail, Phone, MapPin } from 'lucide-react';
import api from '../api/axios';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Avatar Component
const Avatar = ({ empId, name, role }: { empId: string, name: string, role: string }) => {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = `/api/v1/employees/${empId}/avatar`;
  
  const isTop = role?.toUpperCase().includes('DIRECTEUR') || role?.toUpperCase().includes('DG');

  return (
    <div style={{ position: 'relative', width: '72px', height: '72px', margin: '0 auto 1.2rem' }}>
      <div style={{
        position: 'absolute',
        inset: -6,
        background: isTop ? 'linear-gradient(135deg, #FFD700, #F59E0B, #EA580C)' : 'linear-gradient(135deg, #2563EB, #3B82F6, #60A5FA)',
        borderRadius: '50%',
        zIndex: 0,
        opacity: 0.9,
        filter: 'blur(8px)',
        animation: 'pulse 3s infinite alternate'
      }} />
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        overflow: 'hidden',
        border: `3px solid ${isTop ? '#FDE047' : '#93C5FD'}`,
        zIndex: 1,
        background: '#0F172A',
        boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
      }}>
        {!imgError ? (
          <img 
            src={avatarUrl} 
            alt={name} 
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1E3A8A, #312E81)', color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>
            {name.charAt(0)}
          </div>
        )}
      </div>
      {isTop && (
        <div style={{ position: 'absolute', bottom: -8, right: -8, background: 'linear-gradient(135deg, #F59E0B, #EA580C)', borderRadius: '50%', padding: '6px', zIndex: 2, boxShadow: '0 4px 12px rgba(234,88,12,0.6)', border: '2px solid #0F172A' }}>
          <Award size={16} color="#fff" />
        </div>
      )}
    </div>
  );
};

// Component for a single Node in the tree
const OrgNode = ({ node, level = 0 }: { node: any, level?: number }) => {
  const [expanded, setExpanded] = useState(level < 2); // Auto expand top 2 levels
  const hasChildren = node.children && node.children.length > 0;
  
  const isRoot = level === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      {/* Node Card */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
        whileHover={{ scale: 1.05, translateY: -8, boxShadow: isRoot ? '0 30px 60px rgba(37,99,235,0.5)' : '0 20px 40px rgba(59,130,246,0.3)' }}
        style={{
          background: isRoot 
            ? 'linear-gradient(145deg, rgba(30,58,138,0.95), rgba(37,99,235,0.9))'
            : 'linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))',
          backdropFilter: 'blur(20px)',
          border: isRoot ? '1px solid rgba(147,197,253,0.6)' : '1px solid rgba(148,163,184,0.15)',
          borderRadius: '28px',
          padding: '2rem 1.5rem',
          width: '280px',
          textAlign: 'center',
          boxShadow: isRoot 
            ? '0 20px 50px rgba(37,99,235,0.4), inset 0 2px 4px rgba(255,255,255,0.3)' 
            : '0 15px 35px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.1)',
          position: 'relative',
          zIndex: 2,
          cursor: hasChildren ? 'pointer' : 'default',
        }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <Avatar empId={node._id} name={node.prenom} role={node.poste} />
        
        <h4 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          {node.prenom} {node.nom}
        </h4>
        
        <p style={{ margin: '0.5rem 0', color: isRoot ? '#E0E7FF' : '#94A3B8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {node.poste || 'Employé'}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.2rem' }}>
          <span style={{ 
            fontSize: '0.75rem', 
            padding: '0.4rem 1rem', 
            borderRadius: '99px', 
            background: isRoot ? 'rgba(255,255,255,0.2)' : 'rgba(59,130,246,0.15)', 
            color: isRoot ? '#fff' : '#60A5FA',
            fontWeight: 800,
            border: `1px solid ${isRoot ? 'rgba(255,255,255,0.3)' : 'rgba(59,130,246,0.3)'}`,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}>
            {node.departement || 'STB'}
          </span>
        </div>

        {/* Contact Quick Links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <motion.div whileHover={{ scale: 1.2, color: '#60A5FA' }} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}><Mail size={16} /></motion.div>
          <motion.div whileHover={{ scale: 1.2, color: '#34D399' }} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}><Phone size={16} /></motion.div>
          <motion.div whileHover={{ scale: 1.2, color: '#F87171' }} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}><MapPin size={16} /></motion.div>
        </div>

        {hasChildren && (
          <motion.div 
            animate={{ rotate: expanded ? 180 : 0 }}
            style={{ 
              position: 'absolute', 
              bottom: '-20px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#fff', 
              border: '4px solid #0F172A', 
              zIndex: 3,
              boxShadow: '0 0 20px rgba(59,130,246,0.6)'
            }}
          >
            <ChevronDown size={22} strokeWidth={3} />
          </motion.div>
        )}
      </motion.div>

      {/* Children Container */}
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scaleY: 0 }}
            animate={{ opacity: 1, height: 'auto', scaleY: 1 }}
            exit={{ opacity: 0, height: 0, scaleY: 0 }}
            style={{ position: 'relative', display: 'flex', gap: '4rem', marginTop: '3rem', paddingTop: '3rem', transformOrigin: 'top center' }}
          >
            {/* Glowing Vertical line down from parent */}
            <div style={{ position: 'absolute', top: 0, left: '50%', width: '3px', height: '3rem', background: 'linear-gradient(to bottom, rgba(59,130,246,0.8), rgba(59,130,246,0.3))', boxShadow: '0 0 10px rgba(59,130,246,0.5)', transform: 'translateX(-50%)' }} />
            
            {/* Horizontal line connecting children */}
            {node.children.length > 1 && (
              <div style={{ 
                position: 'absolute', 
                top: '3rem', 
                left: `calc(50% / ${node.children.length})`, 
                right: `calc(50% / ${node.children.length})`, 
                height: '3px', 
                background: 'rgba(59,130,246,0.3)',
                boxShadow: '0 0 10px rgba(59,130,246,0.4)'
              }} />
            )}

            {node.children.map((child: any) => (
              <div key={child._id} style={{ position: 'relative' }}>
                {/* Vertical line up to horizontal line */}
                <div style={{ position: 'absolute', top: '-3rem', left: '50%', width: '3px', height: '3rem', background: 'rgba(59,130,246,0.3)', boxShadow: '0 0 10px rgba(59,130,246,0.4)', transform: 'translateX(-50%)' }} />
                <OrgNode node={child} level={level + 1} />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Organigramme: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/employees');
      const employees = response.data.data;
      
      const empMap = new Map();
      employees.forEach((emp: any) => empMap.set(emp._id, { ...emp, children: [] }));
      
      let rootNodes: any[] = [];
      
      empMap.forEach((emp: any) => {
        if (emp.managerId && empMap.has(emp.managerId)) {
          empMap.get(emp.managerId).children.push(emp);
        } else {
          rootNodes.push(emp);
        }
      });
      
      if (rootNodes.length > 1) {
        setTreeData({
          _id: 'ROOT',
          nom: 'STB',
          prenom: 'Direction',
          poste: 'Générale',
          departement: 'Siège',
          children: rootNodes
        });
      } else if (rootNodes.length === 1) {
        setTreeData(rootNodes[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const element = document.getElementById('org-chart-container');
    if (!element) return;
    
    html2canvas(element, { 
      scale: 2, 
      backgroundColor: '#050B14',
      useCORS: true,
      allowTaint: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('STB_Organigramme.pdf');
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '2rem', background: '#0B1121' }}>
        <div className="spinner" style={{ width: '60px', height: '60px', borderTopColor: '#3B82F6' }}></div>
        <p style={{ color: '#60A5FA', fontWeight: 700, fontSize: '1.2rem', animation: 'pulse 2s infinite', letterSpacing: '2px' }}>GÉNÉRATION DE L'ARBRE...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'radial-gradient(ellipse at top, #0B1E46 0%, #0F172A 100%)',
      overflow: 'hidden'
    }}>
      {/* Absolute Full Page Grid Background */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />
      
      {/* Decorative Blur Orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ padding: '2rem', zIndex: 1, position: 'relative' }}>
        {/* Premium Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem', 
          padding: '2.5rem',
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(24px)',
          borderRadius: '32px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ 
              padding: '1.5rem', 
              background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(6,182,212,0.2))', 
              borderRadius: '24px', 
              border: '1px solid rgba(6,182,212,0.3)',
              boxShadow: '0 0 40px rgba(6,182,212,0.2) inset, 0 0 20px rgba(37,99,235,0.4)'
            }}>
              <Network size={42} color="#22D3EE" />
            </div>
            <div>
              <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: 0, color: '#F8FAFC', letterSpacing: '-0.04em', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                Hiérarchie <span style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text', backgroundImage: 'linear-gradient(90deg, #60A5FA, #22D3EE)' }}>Intelligente</span>
              </h1>
              <p style={{ margin: '0.8rem 0 0 0', color: '#94A3B8', fontSize: '1.2rem', fontWeight: 500, letterSpacing: '0.02em' }}>
                Visualisez et naviguez dans la structure organisationnelle de la banque
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 16, top: 14 }} />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '0.8rem 1rem 0.8rem 3rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.2)',
                  color: '#fff',
                  width: '200px',
                  outline: 'none'
                }}
              />
            </div>
            <button 
              onClick={exportPDF} 
              style={{ 
                padding: '0.8rem 1.5rem', 
                background: 'linear-gradient(135deg, #2563EB, #06B6D4)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: 700, 
                fontSize: '1rem',
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.8rem', 
                boxShadow: '0 10px 20px rgba(37,99,235,0.3), inset 0 1px 2px rgba(255,255,255,0.2)',
                transition: 'all 0.3s'
              }} 
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }} 
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Download size={20} /> Exporter PDF
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div 
          ref={containerRef}
          style={{ 
            flex: 1,
            overflow: 'auto',
            position: 'relative',
            minHeight: '75vh',
            borderRadius: '32px',
            boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.02)'
          }}
        >
          <div 
            id="org-chart-container" 
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              minWidth: 'max-content', 
              padding: '4rem 4rem 12rem 4rem',
              position: 'relative',
            }}
          >
            {treeData && <OrgNode node={treeData} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Organigramme;
