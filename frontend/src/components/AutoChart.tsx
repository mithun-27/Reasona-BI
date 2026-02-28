import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';

interface ChartConfig {
    title: string;
    type: 'bar' | 'line' | 'pie' | 'donut' | 'scatter' | 'area' | 'stacked_bar';
    data: Record<string, any>[];
    xKey?: string;
    yKey?: string;
    yKeys?: string[];
    color?: string;
    colors?: string[];
}

const TT: React.CSSProperties = {
    backgroundColor: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.5rem', color: '#e2e8f0', fontSize: '0.75rem', padding: '0.5rem 0.75rem'
};
const AX = { fill: 'rgba(255,255,255,0.35)', fontSize: 10 };
const GRID = 'rgba(255,255,255,0.04)';
const COLORS = ['#6d28d9', '#0ea5e9', '#34d399', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export const AutoChart = ({ config }: { config: ChartConfig }) => {
    const { title, type, data, xKey, yKey, yKeys, color = '#6d28d9', colors } = config;

    const chart = () => {
        switch (type) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                            <XAxis dataKey={xKey} tick={AX} angle={-30} textAnchor="end" interval={0} height={55} />
                            <YAxis tick={AX} width={45} />
                            <Tooltip contentStyle={TT} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} opacity={0.9} />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'stacked_bar':
                return (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                            <XAxis dataKey={xKey} tick={AX} angle={-30} textAnchor="end" interval={0} height={55} />
                            <YAxis tick={AX} width={45} />
                            <Tooltip contentStyle={TT} />
                            <Legend wrapperStyle={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }} />
                            {(yKeys || []).map((key, i) => (
                                <Bar key={key} dataKey={key} stackId="a" fill={(colors || COLORS)[i % COLORS.length]} radius={i === (yKeys?.length || 1) - 1 ? [3, 3, 0, 0] : undefined} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
                            <defs>
                                <linearGradient id={`ag-${title}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                            <XAxis dataKey={xKey} tick={AX} angle={-30} textAnchor="end" interval="preserveStartEnd" height={55} />
                            <YAxis tick={AX} width={45} />
                            <Tooltip contentStyle={TT} />
                            <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} fill={`url(#ag-${title})`} dot={false} activeDot={{ r: 4, fill: '#fff', stroke: color, strokeWidth: 2 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                            <XAxis dataKey={xKey} tick={AX} angle={-30} textAnchor="end" interval="preserveStartEnd" height={55} />
                            <YAxis tick={AX} width={45} />
                            <Tooltip contentStyle={TT} />
                            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={{ fill: color, r: 2.5 }} activeDot={{ r: 4, fill: '#fff', stroke: color, strokeWidth: 2 }} />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'pie':
            case 'donut':
                const C = colors || COLORS;
                return (
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                outerRadius={90} innerRadius={type === 'donut' ? 50 : 0}
                                paddingAngle={type === 'donut' ? 3 : 0}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                            >
                                {data.map((_: any, idx: number) => <Cell key={idx} fill={C[idx % C.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={TT} />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'scatter':
                return (
                    <ResponsiveContainer width="100%" height={260}>
                        <ScatterChart margin={{ top: 10, right: 10, bottom: 15, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                            <XAxis dataKey={xKey} name={xKey} tick={AX} />
                            <YAxis dataKey={yKey} name={yKey} tick={AX} width={45} />
                            <Tooltip contentStyle={TT} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.15)' }} />
                            <Scatter data={data} fill={color} opacity={0.7} />
                        </ScatterChart>
                    </ResponsiveContainer>
                );

            default:
                return null;
        }
    };

    return (
        <div style={{
            background: '#111424', borderRadius: '0.75rem',
            padding: '1.25rem 1.5rem', overflow: 'hidden'
        }}>
            <h4 style={{
                fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem',
                color: 'rgba(255,255,255,0.7)', letterSpacing: '0.01em'
            }}>
                {title}
            </h4>
            {chart()}
        </div>
    );
};
