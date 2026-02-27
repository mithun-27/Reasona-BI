import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';

export const Dashboard = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                setSuccess(true);
            }
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2">
                        AI Data Intelligence
                    </h1>
                    <p className="text-white/60 text-lg">Upload data for the Agent to analyze autonomously.</p>
                </div>
                <div className="flex gap-4">
                    <button className="btn-primary flex items-center gap-2">
                        <FileText size={18} />
                        Generate Report
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Widget */}
                <div className="glass-panel p-8 col-span-1 flex flex-col items-center justify-center text-center min-h-[300px] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {success ? (
                        <div className="flex flex-col items-center gap-4 text-emerald-400">
                            <CheckCircle size={48} />
                            <h3 className="text-xl font-semibold">Data Ingested Successfully</h3>
                            <p className="text-white/60 text-sm">Agents have processed your data.</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                                <UploadCloud size={32} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Upload Data Source</h3>
                            <p className="text-white/50 text-sm mb-6 max-w-[200px]">
                                Support for CSV or Excel files. Intelligence agents will auto-detect schema.
                            </p>

                            <input type="file" id="data-upload" className="hidden" accept=".csv,.xlsx" onChange={handleFileChange} />
                            <label htmlFor="data-upload" className="btn-primary cursor-pointer mb-2">
                                Browse Files
                            </label>
                            {file && <div className="text-sm text-white/70 mt-4">{file.name}</div>}
                            {file && (
                                <button onClick={handleUpload} disabled={uploading} className="mt-4 px-4 py-1 border border-primary/50 text-primary rounded-lg hover:bg-primary/10">
                                    {uploading ? 'Ingesting...' : 'Confirm Upload'}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Agent Overview / Quick Stats */}
                <div className="glass-panel p-8 col-span-2">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(14,165,233,0.8)]"></div>
                        System Intelligence Overview
                    </h3>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                            <div className="text-white/50 text-sm mb-2">Active Agents</div>
                            <div className="text-3xl font-bold">3</div>
                        </div>
                        <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                            <div className="text-white/50 text-sm mb-2">Data Sources</div>
                            <div className="text-3xl font-bold">{success ? 1 : 0}</div>
                        </div>
                        <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                            <div className="text-white/50 text-sm mb-2">Insights Generated</div>
                            <div className="text-3xl font-bold">128</div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-center h-[150px] bg-black/10 rounded-xl border border-white/5 text-white/40">
                        Interactive Data Insights will appear here
                    </div>
                </div>
            </div>
        </div>
    );
};
