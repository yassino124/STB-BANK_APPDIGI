import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, Zap, FileCode2, ShieldAlert, GitMerge, AlertCircle, CheckCircle2, ChevronRight, Calculator, Plus, X, SlidersHorizontal } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const BusinessRules = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'GLOBAL_PARAMS' | 'FORMULAS' | 'WORKFLOWS'>('GLOBAL_PARAMS');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const { data } = await api.get('/rules');
      setRules(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des règles métier');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/rules', rules);
      toast.success('Règles métier sauvegardées avec succès !', { icon: '🚀' });
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateFormula = (domain: string, value: string) => {
    setRules((prev: any) => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        formula: value
      }
    }));
  };

  const updateValue = (domain: string, key: string, value: any, subkey?: string) => {
    setRules((prev: any) => {
      const newDomain = { ...prev[domain] };
      if (subkey) {
        newDomain[key] = { ...newDomain[key], [subkey]: value };
      } else {
        newDomain[key] = value;
      }
      return { ...prev, [domain]: newDomain };
    });
  };

  const updatePolicyCondition = (domain: string, index: number, value: string) => {
    const newPolicies = [...rules[domain].policies];
    newPolicies[index].condition = value;
    setRules((prev: any) => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        policies: newPolicies
      }
    }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '60px', height: '60px', border: '3px solid rgba(16, 185, 129, 0.2)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div style={{ color: '#10B981', fontWeight: 600, letterSpacing: '2px' }}>INITIALISATION DU MOTEUR DE RÈGLES...</div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '4rem', position: 'relative' }}>
      
      {/* Decorative Background */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: -1, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: -1, pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '1rem', color: '#fff' }}>
            <div style={{ padding: '0.8rem', background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '16px', boxShadow: '0 10px 25px rgba(16,185,129,0.4)' }}>
              <Settings size={32} color="#fff" />
            </div>
            Enterprise Rules Engine
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '1.1rem', paddingLeft: '4.5rem' }}>
            Moteur de configuration dynamique (Formules mathématiques & Arbres de décision). Aucun déploiement requis.
          </p>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-primary" 
          style={{ padding: '1rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 8px 20px rgba(16,185,129,0.3)', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
        >
          {saving ? <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Save size={20} />}
          {saving ? 'DÉPLOIEMENT...' : 'DÉPLOYER LES RÈGLES'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('GLOBAL_PARAMS')}
          style={{ padding: '1rem 2rem', background: activeTab === 'GLOBAL_PARAMS' ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.05)', color: activeTab === 'GLOBAL_PARAMS' ? '#3B82F6' : '#fff', border: `1px solid ${activeTab === 'GLOBAL_PARAMS' ? '#3B82F6' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.3s' }}
        >
          <SlidersHorizontal size={20} />
          Paramètres Généraux
        </button>
        <button 
          onClick={() => setActiveTab('FORMULAS')}
          style={{ padding: '1rem 2rem', background: activeTab === 'FORMULAS' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: activeTab === 'FORMULAS' ? '#10B981' : '#fff', border: `1px solid ${activeTab === 'FORMULAS' ? '#10B981' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.3s' }}
        >
          <Calculator size={20} />
          Formula Builder
        </button>
        <button 
          onClick={() => setActiveTab('WORKFLOWS')}
          style={{ padding: '1rem 2rem', background: activeTab === 'WORKFLOWS' ? 'rgba(139,92,246,0.1)' : 'transparent', border: '1px solid', borderColor: activeTab === 'WORKFLOWS' ? '#8B5CF6' : 'rgba(255,255,255,0.05)', color: activeTab === 'WORKFLOWS' ? '#8B5CF6' : 'rgba(255,255,255,0.5)', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: activeTab === 'WORKFLOWS' ? '0 4px 20px rgba(139,92,246,0.2)' : 'none' }}
        >
          <GitMerge size={20} /> Workflow Builder
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'GLOBAL_PARAMS' && (
          <motion.div
            key="params"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
            style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}
          >
            <div style={{ position: 'relative', background: 'linear-gradient(145deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))', backdropFilter: 'blur(20px)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #3B82F6, #60A5FA)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(59,130,246,0.2)' }}><Settings size={24} color="#3B82F6" /></div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>Règles Congés</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Plafond Annuel (Jours)</label>
                  <input type="number" value={rules.leave?.maxDays || 30} onChange={e => updateValue('leave', 'maxDays', Number(e.target.value))} style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1.2rem', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Délai de Préavis Minimum (Jours)</label>
                  <input type="number" value={rules.leave?.minNotice || 2} onChange={e => updateValue('leave', 'minNotice', Number(e.target.value))} style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1.2rem', outline: 'none' }} />
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', background: 'linear-gradient(145deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))', backdropFilter: 'blur(20px)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(16,185,129,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #10B981, #34D399)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}><Settings size={24} color="#10B981" /></div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>Plafonds Financiers</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Max Avance sur Salaire (%)</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" value={rules.advance?.maxPercent || 40} onChange={e => updateValue('advance', 'maxPercent', Number(e.target.value))} style={{ width: '100%', padding: '1rem', paddingRight: '3rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1.2rem', outline: 'none' }} />
                    <span style={{ position: 'absolute', right: '1rem', top: '1rem', color: 'rgba(255,255,255,0.4)' }}>%</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', background: 'linear-gradient(145deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))', backdropFilter: 'blur(20px)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(245,158,11,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(245,158,11,0.2)' }}><Settings size={24} color="#F59E0B" /></div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>Primes Fixes</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Prime Ramadan (DT)</label>
                  <input type="number" value={rules.prime?.fixed?.ramadan || 500} onChange={e => updateValue('prime', 'fixed', Number(e.target.value), 'ramadan')} style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1.2rem', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Prime Aïd (DT)</label>
                  <input type="number" value={rules.prime?.fixed?.aid || 300} onChange={e => updateValue('prime', 'fixed', Number(e.target.value), 'aid')} style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1.2rem', outline: 'none' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'FORMULAS' && (
          <motion.div
            key="formulas"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
            style={{ display: 'grid', gap: '1.5rem' }}
          >
            <div style={{ position: 'relative', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.02))', border: '1px solid rgba(16,185,129,0.4)', padding: '2.5rem', borderRadius: '24px', display: 'flex', gap: '2rem', alignItems: 'flex-start', boxShadow: '0 10px 40px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'linear-gradient(180deg, #10B981, #34D399)' }} />
              <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.2)', borderRadius: '16px', boxShadow: '0 4px 15px rgba(16,185,129,0.2), inset 0 2px 10px rgba(255,255,255,0.1)' }}>
                <Zap size={32} color="#10B981" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 1rem 0', color: '#10B981', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Variables Systèmes Disponibles</h4>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {['salary', 'seniority_years', 'age', 'leave_balance'].map(v => (
                    <div key={v} style={{ padding: '0.4rem 1rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'monospace', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#10B981' }}>$</span>{v}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Formula Cards */}
            {['advance', 'credit', 'prime'].map((domain, idx) => (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} key={domain} style={{ position: 'relative', background: 'linear-gradient(145deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))', backdropFilter: 'blur(20px)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(16,185,129,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #10B981, #34D399)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}><FileCode2 size={24} color="#10B981" /></div>
                  <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#fff', textTransform: 'capitalize', fontWeight: 800 }}>Formule : {domain}</h3>
                </div>
                
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#09090b', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(16,185,129,0.3)', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.8), 0 0 20px rgba(16,185,129,0.1)' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4rem', background: 'rgba(16,185,129,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(16,185,129,0.2)' }}>
                    <Calculator size={20} color="#10B981" />
                  </div>
                  <input 
                    type="text" 
                    value={rules[domain]?.formula || ''}
                    onChange={(e) => updateFormula(domain, e.target.value)}
                    placeholder="Ex: salary * 0.40"
                    style={{ 
                      width: '100%', padding: '1.5rem 1.5rem 1.5rem 5.5rem', 
                      background: 'transparent', border: 'none',
                      color: '#E2E8F0', fontSize: '1.4rem', fontWeight: 500, 
                      fontFamily: '"Fira Code", monospace', outline: 'none', transition: 'all 0.3s'
                    }}
                    onFocus={(e) => e.target.parentElement!.style.borderColor = '#10B981'}
                    onBlur={(e) => e.target.parentElement!.style.borderColor = 'rgba(16,185,129,0.2)'}
                  />
                  <div style={{ position: 'absolute', right: '1.5rem', color: 'rgba(16,185,129,0.5)' }}>
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
                    <AlertCircle size={14} /> Astuces :
                  </span>
                  <button onClick={() => updateFormula(domain, rules[domain]?.formula + ' * 0.5')} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }}>+ Multiplier par 50%</button>
                  <button onClick={() => updateFormula(domain, rules[domain]?.formula + ' + 200')} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }}>+ Ajouter 200 DT</button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'WORKFLOWS' && (
          <motion.div
            key="workflows"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
            style={{ display: 'grid', gap: '1.5rem' }}
          >
            <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.02))', border: '1px solid rgba(139,92,246,0.3)', padding: '2rem', borderRadius: '24px', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', boxShadow: '0 8px 32px rgba(139,92,246,0.1)' }}>
              <div style={{ padding: '1rem', background: 'rgba(139,92,246,0.15)', borderRadius: '16px', boxShadow: 'inset 0 2px 10px rgba(139,92,246,0.2)' }}>
                <GitMerge size={28} color="#8B5CF6" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 1rem 0', color: '#8B5CF6', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Séquences de Validation (Workflow Builder)</h4>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.5 }}>Construisez les étapes d'approbation dynamiques. Ajoutez, supprimez ou déplacez l'ordre des valideurs (Manager N+1, Directeur, RH...). L'application s'adaptera instantanément.</p>
              </div>
            </div>

            {['leave', 'credit'].map((domain, idx) => (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} key={domain} style={{ position: 'relative', background: 'linear-gradient(145deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))', backdropFilter: 'blur(20px)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(139,92,246,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #8B5CF6, #C084FC)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px' }}><GitMerge size={24} color="#8B5CF6" /></div>
                  <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#fff', textTransform: 'capitalize', fontWeight: 800 }}>Workflow : {domain}</h3>
                </div>

                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                  {rules[domain]?.workflow?.map((role: string, index: number) => (
                    <div key={index} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ background: 'linear-gradient(180deg, #18181B, #09090B)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.4)', width: '240px', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 2px 20px rgba(139,92,246,0.1)', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.3s', cursor: 'grab' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(139,92,246,0.6), inset 0 2px 4px rgba(255,255,255,0.3)', border: '2px solid #09090B' }}>
                          {index + 1}
                        </div>
                        
                        <div style={{ color: '#D8B4FE', fontWeight: 900, fontSize: '1.2rem', textAlign: 'center', marginTop: '0.8rem', letterSpacing: '0.5px' }}>
                          {role}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                           <button 
                             onClick={() => {
                               const newWf = [...rules[domain].workflow];
                               if (index > 0) {
                                 [newWf[index - 1], newWf[index]] = [newWf[index], newWf[index - 1]];
                                 updateValue(domain, 'workflow', newWf);
                               }
                             }}
                             disabled={index === 0}
                             style={{ background: 'transparent', border: 'none', color: index === 0 ? 'rgba(255,255,255,0.2)' : '#8B5CF6', cursor: index === 0 ? 'default' : 'pointer' }}
                           >
                             ◀
                           </button>
                           
                           <button 
                             onClick={() => {
                               const newWf = [...rules[domain].workflow];
                               newWf.splice(index, 1);
                               updateValue(domain, 'workflow', newWf);
                             }}
                             style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                           >
                             <X size={18} />
                           </button>

                           <button 
                             onClick={() => {
                               const newWf = [...rules[domain].workflow];
                               if (index < newWf.length - 1) {
                                 [newWf[index + 1], newWf[index]] = [newWf[index], newWf[index + 1]];
                                 updateValue(domain, 'workflow', newWf);
                               }
                             }}
                             disabled={index === rules[domain].workflow.length - 1}
                             style={{ background: 'transparent', border: 'none', color: index === rules[domain].workflow.length - 1 ? 'rgba(255,255,255,0.2)' : '#8B5CF6', cursor: index === rules[domain].workflow.length - 1 ? 'default' : 'pointer' }}
                           >
                             ▶
                           </button>
                        </div>
                      </div>

                      {index < rules[domain].workflow.length - 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', color: '#8B5CF6', filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.8))' }}>
                          <ChevronRight size={36} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                     {rules[domain]?.workflow?.length > 0 && <ChevronRight size={36} strokeWidth={3} style={{ color: 'rgba(139,92,246,0.3)', marginRight: '1rem', filter: 'drop-shadow(0 0 5px rgba(139,92,246,0.4))' }} />}
                     <div style={{ background: 'rgba(139,92,246,0.05)', border: '2px dashed rgba(139,92,246,0.4)', borderRadius: '20px', width: '240px', height: '100%', minHeight: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(139,92,246,0.05)'}>
                       <select 
                         onChange={(e) => {
                           if (e.target.value) {
                             const newWf = [...(rules[domain].workflow || [])];
                             newWf.push(e.target.value);
                             updateValue(domain, 'workflow', newWf);
                             e.target.value = "";
                           }
                         }}
                         style={{ background: 'rgba(139,92,246,0.15)', color: '#D8B4FE', border: '1px solid rgba(139,92,246,0.4)', padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer', outline: 'none', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 12px rgba(139,92,246,0.15)' }}
                       >
                         <option value="">+ Ajouter Étape</option>
                         <option value="MANAGER">Manager (N+1)</option>
                         <option value="DIRECTOR">Directeur</option>
                         <option value="DG">Directeur Général</option>
                         <option value="RH">Ressources Humaines</option>
                         <option value="FINANCE">Finance</option>
                       </select>
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default BusinessRules;
