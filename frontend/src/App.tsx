import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ChatBox } from './components/ChatBox';

function App() {
  return (
    <div className="flex bg-background min-h-screen text-white w-full overflow-hidden font-sans">
      <Sidebar />
      <Dashboard />
      <ChatBox />
    </div>
  );
}

export default App;
