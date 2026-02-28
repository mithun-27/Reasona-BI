interface DataTableProps {
    columns: string[];
    data: Record<string, any>[];
}

export const DataTable = ({ columns, data }: DataTableProps) => {
    if (!data || data.length === 0) return null;

    return (
        <div style={{ background: '#111424', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', overflow: 'hidden' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                Data Preview
            </h4>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                        <tr>
                            {columns.map((col, i) => (
                                <th key={i} style={{
                                    padding: '0.6rem 0.75rem', textAlign: 'left',
                                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                                    color: '#6d28d9', fontWeight: 600, whiteSpace: 'nowrap',
                                    fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.03em'
                                }}>
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, ri) => (
                            <tr key={ri}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                onMouseLeave={e => (e.currentTarget.style.background = '')}
                            >
                                {columns.map((col, ci) => (
                                    <td key={ci} style={{
                                        padding: '0.5rem 0.75rem',
                                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                                        color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap',
                                        maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis'
                                    }}>
                                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : '—'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
