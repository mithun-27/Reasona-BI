import { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface FilterConfig {
    column: string;
    values: string[];
    type: string;
}

interface FilterBarProps {
    filters: FilterConfig[];
    activeFilters: Record<string, string[]>;
    onFilterChange: (column: string, values: string[]) => void;
}

export const FilterBar = ({ filters, activeFilters, onFilterChange }: FilterBarProps) => {
    const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

    if (!filters || filters.length === 0) return null;

    const toggleValue = (column: string, value: string) => {
        const current = activeFilters[column] || [];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        onFilterChange(column, updated);
    };

    const clearFilter = (column: string) => {
        onFilterChange(column, []);
    };

    const totalActive = Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', flexShrink: 0 }}>
                <Filter size={14} />
                Filters{totalActive > 0 && ` (${totalActive})`}
            </div>

            {filters.map(filter => {
                const isExpanded = expandedFilter === filter.column;
                const active = activeFilters[filter.column] || [];

                return (
                    <div key={filter.column} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setExpandedFilter(isExpanded ? null : filter.column)}
                            style={{
                                padding: '0.35rem 0.75rem', borderRadius: '2rem',
                                border: `1px solid ${active.length > 0 ? '#6d28d9' : 'rgba(255,255,255,0.15)'}`,
                                background: active.length > 0 ? 'rgba(109,40,217,0.2)' : 'rgba(255,255,255,0.05)',
                                color: active.length > 0 ? '#a78bfa' : 'rgba(255,255,255,0.7)',
                                fontSize: '0.75rem', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap'
                            }}
                        >
                            {filter.column}
                            {active.length > 0 && (
                                <span style={{
                                    background: '#6d28d9', color: '#fff', borderRadius: '50%',
                                    width: '1.1rem', height: '1.1rem', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem'
                                }}>
                                    {active.length}
                                </span>
                            )}
                        </button>

                        {isExpanded && (
                            <div style={{
                                position: 'absolute', top: '110%', left: 0, zIndex: 50,
                                background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '0.75rem', padding: '0.5rem', minWidth: '180px',
                                maxHeight: '250px', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0.5rem', marginBottom: '0.25rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{filter.column}</span>
                                    {active.length > 0 && (
                                        <button onClick={() => clearFilter(filter.column)} style={{
                                            background: 'none', border: 'none', color: '#ef4444',
                                            cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.2rem'
                                        }}>
                                            <X size={10} /> Clear
                                        </button>
                                    )}
                                </div>
                                {filter.values.map(val => (
                                    <button
                                        key={val}
                                        onClick={() => toggleValue(filter.column, val)}
                                        style={{
                                            display: 'block', width: '100%', textAlign: 'left',
                                            padding: '0.4rem 0.5rem', borderRadius: '0.4rem',
                                            border: 'none', cursor: 'pointer', fontSize: '0.75rem',
                                            background: active.includes(val) ? 'rgba(109,40,217,0.3)' : 'transparent',
                                            color: active.includes(val) ? '#a78bfa' : 'rgba(255,255,255,0.7)',
                                            marginBottom: '0.15rem'
                                        }}
                                    >
                                        {active.includes(val) ? '☑ ' : '☐ '}{val}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
