import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Tag, Image as ImageIcon, MapPin, DollarSign, Umbrella, Info, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Amicale() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', sub: '', cat: 'Voyages', img: '', price: '', color: '#7C3AED', desc: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/amicale');
      setOffers(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/amicale/${editingId}`, formData);
        toast.success('Offre modifiée avec succès');
      } else {
        await api.post('/amicale', formData);
        toast.success('Offre ajoutée avec succès');
      }
      setIsModalOpen(false);
      fetchOffers();
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette offre ?')) return;
    try {
      await api.delete(`/amicale/${id}`);
      toast.success('Offre supprimée');
      fetchOffers();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: '', sub: '', cat: 'Voyages', img: '', price: '', color: '#7C3AED', desc: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (offer: any) => {
    setEditingId(offer._id);
    setFormData({
      title: offer.title, sub: offer.sub, cat: offer.cat, img: offer.img, price: offer.price, color: offer.color, desc: offer.desc
    });
    setIsModalOpen(true);
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Amicale & Avantages</h1>
          <p className="page-subtitle">Gestion des offres exclusives pour les collaborateurs STB</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)' }}>
          <Plus size={20} />
          Nouvelle Offre
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {offers.map((offer, idx) => (
            <motion.div key={offer._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '160px', width: '100%', position: 'relative' }}>
                <img src={offer.img || 'https://images.unsplash.com/photo-1527838832700-5059252407fa'} alt={offer.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
                <div style={{ position: 'absolute', top: 12, right: 12, background: offer.color, color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={12} /> {offer.cat}
                </div>
                <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
                  <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{offer.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {offer.sub}</p>
                </div>
              </div>
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {offer.desc}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>Tarif STB</span>
                      <strong style={{ color: '#fff', fontSize: '1rem' }}>{offer.price}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEditModal(offer)} style={{ width: 32, height: 32, borderRadius: '8px', border: 'none', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(offer._id)} style={{ width: 32, height: 32, borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {offers.length === 0 && (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
               <Umbrella size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
               <p>Aucune offre disponible. Cliquez sur "Nouvelle Offre" pour en ajouter.</p>
             </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-card" style={{ position: 'relative', width: '100%', maxWidth: '600px', padding: '2rem', zIndex: 1, maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={24} color="#7C3AED" />
                {editingId ? 'Modifier l\'offre' : 'Nouvelle Offre Amicale'}
              </h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Titre principal</label>
                    <input type="text" className="form-input" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="ex: Paris 5 Jours" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sous-titre / Lieu</label>
                    <input type="text" className="form-input" required value={formData.sub} onChange={e => setFormData({...formData, sub: e.target.value})} placeholder="ex: Escapade romantique" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Catégorie</label>
                    <select className="form-input" value={formData.cat} onChange={e => setFormData({...formData, cat: e.target.value})}>
                      <option value="Voyages">Voyages</option>
                      <option value="Hôtels">Hôtels</option>
                      <option value="Bien-être">Bien-être</option>
                      <option value="Achats">Achats</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tarif STB (Texte)</label>
                    <input type="text" className="form-input" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="ex: 1 250 TND ou -20%" />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ImageIcon size={14} /> Image de l'offre (Upload PC)</label>
                  <input type="file" accept="image/*" className="form-input" style={{ padding: '8px' }} onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData({...formData, img: reader.result as string});
                      reader.readAsDataURL(file);
                    }
                  }} />
                  {formData.img && (
                    <div style={{ marginTop: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', height: '80px', width: '120px', backgroundImage: `url(${formData.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Couleur du badge (HEX)</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} style={{ width: '44px', height: '44px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }} />
                    <input type="text" className="form-input" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} style={{ flex: 1 }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Info size={14} /> Description de l'offre</label>
                  <textarea className="form-input" required rows={4} value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} placeholder="Détails complets de l'offre..." style={{ resize: 'vertical' }}></textarea>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary">{editingId ? 'Mettre à jour' : 'Ajouter l\'offre'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
