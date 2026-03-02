import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ChatBox } from './components/ChatBox';
import { MessageSquare, X, Database } from 'lucide-react';

function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customCharts, setCustomCharts] = useState<any[]>([]);

  const handleAddChart = (chart: any) => {
    setCustomCharts(prev => [...prev, chart]);
  };

  return (
    <div style={{
      display: 'flex', backgroundColor: '#0a0c15',
      minHeight: '100vh', color: '#fff', width: '100%',
      overflow: 'hidden', fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenChat={() => setChatOpen(true)}
      />

      {activeTab === 'dashboard' ? (
        <Dashboard customCharts={customCharts} />
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0c15' }}>
          <Database size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>Data Sources</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Detailed data management coming soon.</p>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{ marginTop: '1.5rem', padding: '0.5rem 1rem', background: '#6d28d9', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            Return to Dashboard
          </button>
        </div>
      )}

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
          <ChatBox onAddChart={handleAddChart} />
        </div>
      )}
    </div>
  );
}

export default App;
