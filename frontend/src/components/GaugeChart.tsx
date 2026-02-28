interface GaugeChartProps {
    title: string;
    value: number;
    min: number;
    max: number;
    color?: string;
}

export const GaugeChart = ({ title, value, min, max }: GaugeChartProps) => {
    const range = max - min || 1;
    const pct = Math.min(Math.max((value - min) / range, 0), 1);

    const fmt = (v: number) => {
        if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
        if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
        return v % 1 === 0 ? v.toString() : v.toFixed(1);
    };

    // Simple circular progress — clean, modern
    const size = 130;
    const stroke = 8;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - pct);

    const color = pct < 0.35 ? '#ef4444' : pct < 0.65 ? '#f59e0b' : '#34d399';

    return (
        <div style={{
            background: '#111424', borderRadius: '0.75rem',
            padding: '1.5rem', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'
        }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem' }}>
                {title}
            </h4>

            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    {/* Track */}
                    <circle cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
                    {/* Progress */}
                    <circle cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke={color} strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s' }}
                    />
                </svg>

                {/* Center text */}
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9' }}>{fmt(value)}</span>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{(pct * 100).toFixed(0)}%</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                <span>Min: {fmt(min)}</span>
                <span>Max: {fmt(max)}</span>
            </div>
        </div>
    );
};
