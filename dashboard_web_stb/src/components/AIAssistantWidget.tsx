import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle, Loader2, X, CheckCircle, BarChart2 } from 'lucide-react';

const insights = [
  {
    type: 'positive',
    icon: <TrendingUp size={16} />,
    text: "La masse salariale est stable (+0.5% vs mois précédent).",
  },
  {
    type: 'warning',
    icon: <AlertTriangle size={16} />,
    text: "Il y a 12 demandes de congés qui nécessitent votre attention avant vendredi.",
  },
  {
    type: 'neutral',
    icon: <Sparkles size={16} />,
    text: "Générez le rapport de clôture RH en un clic.",
  }
];

const AIAssistantWidget: React.FC = () => {
  const [currentInsight, setCurrentInsight] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsModalOpen(true);
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2500);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="ai-widget-container"
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(13, 38, 107, 0.4) 0%, rgba(10, 17, 33, 0.8) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(41, 98, 255, 0.3)',
        borderRadius: 'var(--r-xl)',
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        marginBottom: '2rem'
      }}
    >
      {/* Background animated elements */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(41, 98, 255, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      <motion.div
        animate={{ 
          rotate: -360,
          scale: [1, 1.5, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          bottom: '-50%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      {/* STB Copilot Icon */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--stb-electric), var(--purple))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(41, 98, 255, 0.5), inset 0 2px 4px rgba(255,255,255,0.4)',
          position: 'relative'
        }}>
          <Sparkles size={28} color="#fff" />
          {/* Ripple effect */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          />
        </div>
      </div>

      {/* AI Content */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          STB RH Copilot
          <span className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem' }}>AI Powered</span>
        </h3>
        
        <div style={{ height: '24px', position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentInsight}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'absolute', width: '100%' }}
            >
              <div style={{ 
                color: insights[currentInsight].type === 'positive' ? 'var(--success)' : 
                       insights[currentInsight].type === 'warning' ? 'var(--warning)' : 
                       'var(--stb-blue-300)',
                display: 'flex'
              }}>
                {insights[currentInsight].icon}
              </div>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {insights[currentInsight].text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Action Button */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <button 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="btn btn-primary" 
          style={{ 
            padding: '0.6rem 1.25rem', 
            borderRadius: '99px', 
            boxShadow: isAnalyzing ? 'none' : '0 4px 15px rgba(41,98,255,0.4)',
            opacity: isAnalyzing ? 0.8 : 1,
            cursor: isAnalyzing ? 'wait' : 'pointer',
            transition: 'all 0.3s'
          }}
        >
          {isAnalyzing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {isAnalyzing ? 'Analyse...' : 'Analyser Dashboard'}
        </button>
      </div>
    </motion.div>

    <AnimatePresence>
      {isModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6, 13, 26, 0.7)', backdropFilter: 'blur(8px)', padding: '1rem' }}
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{ width: '100%', maxWidth: '600px', background: 'rgba(18, 18, 28, 0.95)', border: '1px solid rgba(41, 98, 255, 0.3)', borderRadius: '24px', padding: '2rem', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Background FX */}
            <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(41, 98, 255, 0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }} />
            
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--stb-electric), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isAnalyzing ? <Loader2 size={24} color="#fff" className="animate-spin" /> : <Sparkles size={24} color="#fff" />}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Diagnostic IA <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>En direct</span>
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {isAnalyzing ? "Analyse approfondie en cours..." : "Analyse terminée avec succès."}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                <X size={18} />
              </button>
            </div>

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {isAnalyzing ? (
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2.5, ease: "linear" }} style={{ height: '100%', background: 'linear-gradient(90deg, var(--stb-electric), var(--purple))' }} />
                  </div>
                  <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ fontSize: '0.85rem', color: 'var(--stb-blue-300)' }}>
                    Scan des dossiers collaborateurs et des flux financiers...
                  </motion.p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ staggerChildren: 0.1 }}>
                  {[
                    { icon: <TrendingUp size={16} />, text: "Masse salariale optimisée, aucune anomalie détectée sur les fiches de paie récentes.", color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
                    { icon: <AlertTriangle size={16} />, text: "Attention : 4 collaborateurs dépassent leur quota de congés payés annuels.", color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' },
                    { icon: <BarChart2 size={16} />, text: "Le taux d'absence est en baisse de 1.2% ce trimestre par rapport au précédent.", color: 'var(--stb-electric)', bg: 'rgba(41, 98, 255, 0.1)' }
                  ].map((insight, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.15 }} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: insight.bg, color: insight.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {insight.icon}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {insight.text}
                      </p>
                    </motion.div>
                  ))}
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button onClick={() => setIsModalOpen(false)} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={16} /> Compris, merci !
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default AIAssistantWidget;
