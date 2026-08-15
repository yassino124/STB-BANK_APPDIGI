import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

//const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'; // 💻 Local
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://stb-backend-blno.onrender.com'; // ☁️ Render Cloud

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Connecté au serveur temps réel STB');
    });

    this.socket.on('connected', (data) => {
      // Optional: Handle successful connection message
    });

    this.socket.on('new-notification', (data) => {
      toast(data.message, {
        icon: '🔔',
        duration: 5000,
        style: {
          border: '1px solid #3B82F6',
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#fff',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.25)',
        },
      });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Déconnecté du serveur temps réel STB');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
