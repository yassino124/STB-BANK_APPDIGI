import { useEffect, useState } from 'react';
import { MessageSquare, Send, Search, Paperclip, Smile } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

interface Message {
  _id: string;
  conversationId: string;
  senderId: { _id?: string; nom: string; prenom: string; matricule: string };
  recipientId: { _id?: string; nom: string; prenom: string; matricule: string };
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  _id: string;
  type: string;
  participants: { _id?: string; nom: string; prenom: string; matricule: string }[];
  title?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
}

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

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

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await api.get(`/messages/conversation/${conversationId}`);
      setMessages(res.data);
      setSelectedConversation(conversationId);
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      await api.post('/messages', {
        conversationId: selectedConversation,
        senderId: 'current-user-id',
        recipientId: 'recipient-id',
        content: newMessage,
        type: 'TEXT',
      });
      setNewMessage('');
      fetchMessages(selectedConversation);
    } catch (e) {
      console.error(e);
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
    <div className="flex h-[calc(100vh-200px)] bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv, i) => (
            <motion.div
              key={conv._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => fetchMessages(conv._id)}
              className={`p-4 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/30 transition ${
                selectedConversation === conv._id ? 'bg-slate-700/50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <MessageSquare className="text-blue-400" size={18} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">
                      {conv.title || conv.participants.map((p) => `${p.prenom} ${p.nom}`).join(', ')}
                    </h3>
                    <p className="text-slate-400 text-xs truncate max-w-[180px]">
                      {conv.lastMessagePreview || 'No messages yet'}
                    </p>
                  </div>
                </div>
                {conv.lastMessageAt && (
                  <span className="text-xs text-slate-500">
                    {new Date(conv.lastMessageAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-white font-semibold">
                {conversations.find((c) => c._id === selectedConversation)?.title || 'Conversation'}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex ${msg.senderId._id === 'current-user-id' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.senderId._id === 'current-user-id'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs opacity-60 mt-1 block">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <button type="button" className="p-2 text-slate-400 hover:text-white transition">
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button type="button" className="p-2 text-slate-400 hover:text-white transition">
                  <Smile size={20} />
                </button>
                <button
                  type="submit"
                  className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto text-slate-600 mb-3" size={48} />
              <p className="text-slate-400">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
