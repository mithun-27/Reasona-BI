import { useState, useEffect, useRef } from 'react';
import { UploadCloud, AlertCircle, Loader, Sparkles } from 'lucide-react';
import { KPICards } from './KPICards';
import { AutoChart } from './AutoChart';
import { GaugeChart } from './GaugeChart';
import { DataTable } from './DataTable';
import { FilterBar } from './FilterBar';

interface AnalysisData {
    kpis: any[];
    charts: any[];
    filters: any[];
    data_preview: Record<string, any>[];
    column_names: string[];
    table_name: string;
    dashboard_title: string;
    row_count: number;
    col_count: number;
}

interface DashboardProps {
    customCharts?: any[];
}

export const Dashboard = ({ customCharts = [] }: DashboardProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBrowseClick = () => fileInputRef.current?.click();
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) { setFile(e.target.files[0]); setError(''); }
    };
    const handleFilterChange = (col: string, vals: string[]) => {
        setActiveFilters(p => ({ ...p, [col]: vals }));
    };

    const updateAnalysis = async (filters: Record<string, string[]>) => {
        if (!analysis?.table_name) return;
        setUploading(true);
        try {
            const res = await fetch(`http://localhost:8000/api/analysis/${analysis.table_name}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters)
            });
            if (res.ok) {
                const data = await res.json();
                setAnalysis(data);
            }
        } catch (err) {
            console.error("Filter update failed", err);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (analysis?.table_name) {
            updateAnalysis(activeFilters);
        }
    }, [activeFilters]);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true); setError('');
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await fetch('http://localhost:8000/api/upload', { method: 'POST', body: fd });
            if (res.ok) {
                const data = await res.json();
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                if (data.analysis) {
                    // Set analysis first, which might trigger effect, so reset filters at same time
                    setAnalysis(data.analysis);
                    setActiveFilters({});
                }
            } else {
                const e = await res.json();
                setError(e.detail || 'Upload failed');
            }
        } catch { setError('Backend not reachable'); }
        finally { setUploading(false); }
    };

    const gauges = analysis?.charts.filter(c => c.type === 'gauge') || [];
    const charts = analysis?.charts.filter(c => c.type !== 'gauge') || [];

    // ─── Landing ───
    if (!analysis) {
        return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', height: '100vh' }}>
                <div style={{ maxWidth: '500px', textAlign: 'center' }}>
                    <div style={{
                        width: '5rem', height: '5rem', borderRadius: '1rem', margin: '0 auto 2rem',
                        background: 'rgba(109,40,217,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6d28d9'
                    }}>
                        <UploadCloud size={36} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f1f5f9' }}>
                        Upload Your Dataset
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Upload a CSV or Excel file. Our AI will automatically preprocess your data, detect patterns, and generate an interactive dashboard.
                    </p>

                    <input ref={fileInputRef} type="file" accept=".csv,.xlsx" onChange={handleFileChange} style={{ display: 'none' }} />
                    <button onClick={handleBrowseClick} style={{
                        padding: '0.75rem 2.5rem', background: '#6d28d9', color: '#fff',
                        border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.95rem',
                        cursor: 'pointer', boxShadow: '0 4px 20px rgba(109,40,217,0.4)'
                    }}>
                        Choose File
                    </button>

                    {file && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.75rem' }}>📄 {file.name}</div>
                            <button onClick={handleUpload} disabled={uploading} style={{
                                padding: '0.6rem 2rem', border: '1px solid #6d28d9', color: '#a78bfa',
                                background: 'transparent', borderRadius: '0.5rem', cursor: uploading ? 'wait' : 'pointer'
                            }}>
                                {uploading ? (<span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</span>) : 'Generate Dashboard'}
                            </button>
                        </div>
                    )}
                    {error && <div style={{ marginTop: '1rem', color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}><AlertCircle size={14} /> {error}</div>}
                </div>
            </div>
        );
    }

    // ─── Dashboard ───
    return (
        <div style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto', height: '100vh', position: 'relative' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.2rem' }}>
                        📊 {analysis.dashboard_title}
                    </h1>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                        {analysis.row_count.toLocaleString()} rows · {analysis.col_count} columns · Auto-generated
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input ref={fileInputRef} type="file" accept=".csv,.xlsx" onChange={handleFileChange} style={{ display: 'none' }} />
                    <button onClick={handleBrowseClick} style={{
                        padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.4rem',
                        color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.3rem'
                    }}>
                        <UploadCloud size={13} /> New Dataset
                    </button>
                </div>
            </div>

            {/* Floating upload toast */}
            {file && (
                <div style={{
                    position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 100,
                    background: '#1a1d2e', border: '1px solid rgba(109,40,217,0.4)', borderRadius: '0.75rem',
                    padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)', fontSize: '0.8rem'
                }}>
                    📄 {file.name}
                    <button onClick={handleUpload} disabled={uploading} style={{
                        padding: '0.35rem 0.75rem', background: '#6d28d9', border: 'none',
                        borderRadius: '0.4rem', color: '#fff', cursor: 'pointer', fontSize: '0.75rem'
                    }}>
                        {uploading ? 'Analyzing...' : 'Generate'}
                    </button>
                </div>
            )}

            {/* Filters */}
            {analysis.filters?.length > 0 && (
                <FilterBar filters={analysis.filters} activeFilters={activeFilters} onFilterChange={handleFilterChange} />
            )}

            {/* KPIs */}
            <KPICards kpis={analysis.kpis} />

            {/* Gauge + Chart Row */}
            {gauges.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                    <GaugeChart {...gauges[0]} />
                    {charts.length > 0 && <AutoChart config={charts[0]} />}
                </div>
            )}

            {/* AI Custom Charts Section */}
            {customCharts.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={14} /> AI Discovered Insights
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        {customCharts.map((c, i) => (
                            <AutoChart key={`custom-${i}`} config={c} />
                        ))}
                    </div>
                </div>
            )}

            {/* Charts Grid — 2 columns */}
            {charts.length > (gauges.length > 0 ? 1 : 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                    {charts.slice(gauges.length > 0 ? 1 : 0).map((c, i) => (
                        <AutoChart key={i} config={c} />
                    ))}
                </div>
            )}

            {/* Data Table */}
            <DataTable columns={analysis.column_names} data={analysis.data_preview} />
        </div>
    );
};
