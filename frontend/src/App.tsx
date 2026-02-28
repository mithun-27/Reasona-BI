import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ChatBox } from './components/ChatBox';
import { MessageSquare, X } from 'lucide-react';

function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div style={{
      display: 'flex', backgroundColor: '#0a0c15',
      minHeight: '100vh', color: '#fff', width: '100%',
      overflow: 'hidden', fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <Sidebar />
      <Dashboard />

      {/* Chat Toggle Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          style={{
            position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 200,
            width: '3.5rem', height: '3.5rem', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6d28d9, #4f46e5)',
            border: 'none', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(109,40,217,0.5)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = '')}
        >
          <MessageSquare size={20} />
        </button>
      )}

      {/* Chat Panel - Overlay */}
      {chatOpen && (
        <div style={{
          position: 'fixed', right: '1rem', bottom: '1rem', top: '1rem',
          zIndex: 200, width: '380px',
          animation: 'slideIn 0.25s ease-out'
        }}>
          <button
            onClick={() => setChatOpen(false)}
            style={{
              position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 10,
              width: '2rem', height: '2rem', borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={14} />
          </button>
          <ChatBox />
        </div>
      )}
    </div>
  );
}

export default App;
