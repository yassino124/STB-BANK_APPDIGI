import { useEffect, useState } from 'react';
import { Users, Plus, MessageSquare, UserPlus, Settings } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

interface Conversation {
  _id: string;
  type: string;
  participants: { _id: string; nom: string; prenom: string; matricule: string }[];
  title?: string;
  description?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  isActive: boolean;
}

const Conversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'DIRECT', participants: [], title: '', description: '', createdBy: 'current-user-id' });

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations?employeeId=current-user-id');
      setConversations(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/conversations', form);
      setShowModal(false);
      setForm({ type: 'DIRECT', participants: [], title: '', description: '', createdBy: 'current-user-id' });
      fetchConversations();
    } catch (e) {
      console.error(e);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DIRECT': return <UserPlus className="text-blue-400" size={18} />;
      case 'GROUP': return <Users className="text-emerald-400" size={18} />;
      case 'SUPPORT': return <Settings className="text-yellow-400" size={18} />;
      case 'BROADCAST': return <MessageSquare className="text-purple-400" size={18} />;
      default: return <Users className="text-slate-400" size={18} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DIRECT': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'GROUP': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'SUPPORT': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'BROADCAST': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Conversations</h1>
          <p className="text-slate-400 mt-1">Manage internal conversations and groups</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
        >
          <Plus size={18} />
          New Conversation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Conversations</p>
              <p className="text-2xl font-bold text-white">{conversations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <MessageSquare className="text-emerald-400" size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Direct Messages</p>
              <p className="text-2xl font-bold text-white">{conversations.filter((c) => c.type === 'DIRECT').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="text-purple-400" size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Groups</p>
              <p className="text-2xl font-bold text-white">{conversations.filter((c) => c.type === 'GROUP').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Settings className="text-yellow-400" size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Support</p>
              <p className="text-2xl font-bold text-white">{conversations.filter((c) => c.type === 'SUPPORT').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Title / Participants</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Last Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {conversations.map((conv, i) => (
              <motion.tr
                key={conv._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-slate-700/30 cursor-pointer"
                onClick={() => {/* Navigate to messages */}}
              >
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(conv.type)}`}>
                    {getTypeIcon(conv.type)}
                    {conv.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-white font-medium">
                  {conv.title || conv.participants.map((p) => `${p.prenom} ${p.nom}`).join(', ')}
                </td>
                <td className="px-6 py-4 text-slate-400">{conv.description || '-'}</td>
                <td className="px-6 py-4 text-slate-400">
                  {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString() : '-'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      conv.isActive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {conv.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">New Conversation</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="DIRECT">Direct</option>
                  <option value="GROUP">Group</option>
                  <option value="SUPPORT">Support</option>
                  <option value="BROADCAST">Broadcast</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title (optional for groups)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversations;
