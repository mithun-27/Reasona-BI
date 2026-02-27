import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ChatBox = () => {
    const [messages, setMessages] = useState([
        { role: 'agent', content: "Hello, I'm your ReasonaBI Agent. I've analyzed your data sources. What insights would you like to uncover today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMsg })
            });

            const data = await res.json();
            setMessages(prev => [...prev, {
                role: 'agent',
                content: data.reply || "I encountered an error analyzing that request."
            }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'agent', content: "Connection error with reasoning engine." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-[450px] glass-panel h-[calc(100vh-2rem)] flex flex-col m-4 relative overflow-hidden flex-shrink-0">
            <div className="absolute top-0 left-0 w-full h-[60px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none z-0"></div>

            <div className="p-6 border-b border-white/10 relative z-10 flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center p-[2px]">
                        <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                            <Sparkles size={16} className="text-secondary" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-background"></div>
                </div>
                <div>
                    <h2 className="font-semibold text-white">Insight Assistant</h2>
                    <div className="text-xs text-white/50">Online • Capable of auto-charting</div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg ${msg.role === 'user' ? 'bg-white/10 text-white/70' : 'bg-primary/20 text-primary border border-primary/30'
                            }`}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>

                        <div className={`px-5 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-gradient-to-bl from-primary to-violet-600 text-white rounded-tr-sm shadow-xl shadow-primary/20'
                                : 'bg-white/5 border border-white/10 rounded-tl-sm backdrop-blur-sm'
                            }`}>
                            <ReactMarkdown className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10 prose-pre:p-4 prose-pre:rounded-xl max-w-none text-sm whitespace-pre-wrap">
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                            <Bot size={14} />
                        </div>
                        <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 rounded-tl-sm">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
                <form onSubmit={sendMessage} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your data..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pr-12 pl-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-white placeholder-white/40"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 p-2 bg-primary rounded-lg text-white hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                    >
                        <Send size={16} />
                    </button>
                </form>
                <div className="text-[10px] text-center mt-3 text-white/30 truncate">
                    ReasonaBI can make mistakes. Verify critical business insights.
                </div>
            </div>
        </div>
    );
};
