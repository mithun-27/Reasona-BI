import { LayoutDashboard, Database, MessageSquare, Settings, Sparkles } from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onOpenChat: () => void;
}

export const Sidebar = ({ activeTab, onTabChange, onOpenChat }: SidebarProps) => {
    const navItems = [
        { label: 'Dashboard', id: 'dashboard', icon: <LayoutDashboard size={18} /> },
        { label: 'Data Sources', id: 'data_sources', icon: <Database size={18} /> },
    ];

    return (
        <aside style={{
            width: '220px', flexShrink: 0,
            background: 'linear-gradient(180deg, #0f1120 0%, #0a0c15 100%)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            height: '100vh', display: 'flex', flexDirection: 'column',
            padding: '1.5rem 0'
        }}>
            {/* Logo */}
            <div style={{
                padding: '0 1.5rem', marginBottom: '2.5rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
                <div style={{
                    width: '2rem', height: '2rem', borderRadius: '0.5rem',
                    background: 'linear-gradient(135deg, #6d28d9, #4f46e5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Sparkles size={14} color="#fff" />
                </div>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    Reasona<span style={{ color: '#6d28d9' }}>BI</span>
                </span>
            </div>

            {/* Nav */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 0.75rem' }}>
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.65rem 0.75rem', borderRadius: '0.5rem',
                                border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                                fontSize: '0.85rem', fontWeight: isActive ? 600 : 400,
                                background: isActive ? 'rgba(109,40,217,0.15)' : 'transparent',
                                color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                                transition: 'all 0.15s'
                            }}
                        >
                            <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
                            {item.label}
                        </button>
                    );
                })}

                {/* Agent Chat Button */}
                <button
                    onClick={onOpenChat}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.65rem 0.75rem', borderRadius: '0.5rem',
                        border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                        fontSize: '0.85rem', fontWeight: 400,
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.5)',
                        transition: 'all 0.15s'
                    }}
                >
                    <span style={{ opacity: 0.6 }}><MessageSquare size={18} /></span>
                    Agent Chat
                </button>
            </nav>

            {/* Bottom */}
            <div style={{ marginTop: 'auto', padding: '0 0.75rem' }}>
                <button style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0.75rem', borderRadius: '0.5rem',
                    border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                    fontSize: '0.85rem', fontWeight: 400,
                    background: 'transparent', color: 'rgba(255,255,255,0.4)',
                    transition: 'all 0.15s'
                }}>
                    <Settings size={18} style={{ opacity: 0.6 }} />
                    Settings
                </button>
            </div>
        </aside>
    );
};
