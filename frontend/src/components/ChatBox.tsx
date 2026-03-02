import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Pin } from 'lucide-react';
import { AutoChart } from './AutoChart';

interface Message {
    role: 'user' | 'agent';
    content: string;
    chartConfig?: any;
}

interface ChatBoxProps {
    onAddChart?: (chart: any) => void;
}

export const ChatBox = ({ onAddChart }: ChatBoxProps) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'agent', content: "Hello, I'm your ReasonaBI Agent. I've analyzed your data sources. What insights would you like to uncover today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });

            const data = await res.json();
            setMessages(prev => [...prev, {
                role: 'agent',
                content: data.reply || "I encountered an error analyzing that request.",
                chartConfig: data.insights?.chart
            }]);
        } catch {
            setMessages(prev => [...prev, { role: 'agent', content: "Connection error with reasoning engine. Is the backend running?" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePinChart = (config: any) => {
        if (onAddChart) {
            onAddChart(config);
            alert("Added to Dashboard!");
        }
    };

    const panelStyle: React.CSSProperties = {
        width: '100%',
        background: 'rgba(15,17,26,0.95)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem',
        height: '100%', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'relative'
    };

    return (
        <div style={panelStyle}>
            {/* Header */}
            <div style={{
                padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 10
            }}>
                <div style={{ position: 'relative' }}>
                    <div style={{
                        width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6d28d9, #0ea5e9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px'
                    }}>
                        <div style={{
                            width: '100%', height: '100%', backgroundColor: '#0f111a',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Sparkles size={16} color="#0ea5e9" />
                        </div>
                    </div>
                </div>
                <div>
                    <h2 style={{ fontWeight: 600, color: '#fff', margin: 0, fontSize: '1rem' }}>Insight Assistant</h2>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Online • AI Reasoning</div>
                </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                        <div style={{
                            width: '2rem', height: '2rem', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, marginTop: '0.25rem',
                            background: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(109,40,217,0.2)',
                            color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : '#6d28d9',
                            border: msg.role === 'agent' ? '1px solid rgba(109,40,217,0.3)' : 'none'
                        }}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div style={{
                            maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: '0.75rem',
                            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                        }}>
                            <div style={{
                                padding: '0.75rem 1.25rem', borderRadius: '1rem',
                                fontSize: '0.85rem', lineHeight: 1.6,
                                ...(msg.role === 'user'
                                    ? {
                                        background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
                                        color: '#fff', borderTopRightRadius: '0.25rem',
                                    }
                                    : {
                                        background: 'rgba(255,255,255,0.05)', color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderTopLeftRadius: '0.25rem'
                                    })
                            }}>
                                {msg.content}
                            </div>

                            {msg.chartConfig && (
                                <div style={{ width: '100%', minWidth: '300px', maxWidth: '340px' }}>
                                    <AutoChart config={msg.chartConfig} />
                                    <button
                                        onClick={() => handlePinChart(msg.chartConfig)}
                                        style={{
                                            marginTop: '0.5rem', padding: '0.4rem 0.75rem',
                                            background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(109,40,217,0.4)',
                                            borderRadius: '0.5rem', color: '#a78bfa', fontSize: '0.7rem',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(109,40,217,0.3)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(109,40,217,0.2)')}
                                    >
                                        <Pin size={12} /> Add to Dashboard
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{
                            width: '2rem', height: '2rem', borderRadius: '50%',
                            background: 'rgba(109,40,217,0.2)', color: '#6d28d9',
                            border: '1px solid rgba(109,40,217,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Bot size={14} />
                        </div>
                        <div style={{
                            padding: '1rem 1.25rem', borderRadius: '1rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex', gap: '0.5rem', alignItems: 'center'
                        }}>
                            <span style={{ animation: 'pulse 1.5s infinite' }}>●</span>
                            <span style={{ animation: 'pulse 1.5s infinite 0.3s' }}>●</span>
                            <span style={{ animation: 'pulse 1.5s infinite 0.6s' }}>●</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                <form onSubmit={sendMessage} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your data..."
                        style={{
                            width: '100%', background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem',
                            paddingRight: '3rem', paddingLeft: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem',
                            fontSize: '0.875rem', color: '#fff', outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        style={{
                            position: 'absolute', right: '0.5rem', padding: '0.5rem',
                            backgroundColor: '#6d28d9', borderRadius: '0.5rem',
                            color: '#fff', border: 'none', cursor: 'pointer',
                            opacity: (!input.trim() || isLoading) ? 0.5 : 1
                        }}
                    >
                        <Send size={16} />
                    </button>
                </form>
                <div style={{ fontSize: '0.6rem', textAlign: 'center', marginTop: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                    ReasonaBI can make mistakes. Verify critical business insights.
                </div>
            </div>
        </div>
    );
};
