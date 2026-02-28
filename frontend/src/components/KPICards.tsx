import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPI {
    label: string;
    value: string;
    icon: string;
    trend?: 'up' | 'down' | 'neutral';
    subtitle?: string;
    goal?: string;
}

const accentColors: string[] = ['#6d28d9', '#0ea5e9', '#34d399', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const TrendBadge = ({ trend }: { trend?: string }) => {
    const color = trend === 'up' ? '#34d399' : trend === 'down' ? '#ef4444' : 'rgba(255,255,255,0.3)';
    const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.2rem',
            padding: '0.15rem 0.4rem', borderRadius: '1rem',
            background: `${color}15`, color: color, fontSize: '0.65rem', fontWeight: 600
        }}>
            <Icon size={10} />
        </div>
    );
};

export const KPICards = ({ kpis }: { kpis: KPI[] }) => {
    // Show max 4 per row for clean layout
    const displayKpis = kpis.slice(0, 8);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem', marginBottom: '1.5rem'
        }}>
            {displayKpis.map((kpi, i) => {
                const accent = accentColors[i % accentColors.length];
                return (
                    <div key={i} style={{
                        background: '#111424', borderRadius: '0.75rem',
                        padding: '1.25rem 1.5rem',
                        borderLeft: `3px solid ${accent}`,
                        transition: 'transform 0.15s', cursor: 'default'
                    }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = '')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {kpi.label}
                            </span>
                            <TrendBadge trend={kpi.trend} />
                        </div>

                        <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1, marginBottom: '0.4rem', color: '#f1f5f9' }}>
                            {kpi.value}
                        </div>

                        {kpi.subtitle && (
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                                {kpi.subtitle}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
