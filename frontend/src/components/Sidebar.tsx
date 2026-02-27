import React from 'react';
import { Database, LayoutDashboard, MessageSquare, Settings } from 'lucide-react';

export const Sidebar = () => {
    return (
        <aside className="w-64 flex-shrink-0 glass-panel h-[calc(100vh-2rem)] m-4 flex flex-col items-center py-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-12">
                ReasonaBI
            </div>

            <nav className="flex flex-col gap-4 w-full px-6">
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                    <LayoutDashboard size={20} className="text-primary" />
                    Dashboard
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-all font-medium">
                    <Database size={20} />
                    Data Sources
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-all font-medium">
                    <MessageSquare size={20} />
                    Agent Chat
                </a>
            </nav>

            <div className="mt-auto w-full px-6">
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-all font-medium">
                    <Settings size={20} />
                    Settings
                </a>
            </div>
        </aside>
    );
};
