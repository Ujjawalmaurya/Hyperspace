"use client";
import React, { useEffect, useState } from 'react';
import {
    FileText,
    Search,
    Filter,
    MoreVertical,
    ExternalLink,
    Plus,
    Upload,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Download
} from 'lucide-react';
import { fetchFarms, analyzeFarmImage } from '@/lib/api';
import { useLanguage } from '@/hooks/useLanguage';

export default function ReportsPage() {
    const { t } = useLanguage();
    const [farms, setFarms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFarmId, setSelectedFarmId] = useState("");
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await fetchFarms();
            setFarms(data);
            if (data.length > 0 && !selectedFarmId) {
                setSelectedFarmId(data[0]._id);
            }
        } catch (error) {
            console.error('Error fetching farms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !selectedFarmId) return;

        setUploading(true);
        try {
            await analyzeFarmImage(selectedFarmId, e.target.files[0]);
            await loadData();
            setShowUpload(false);
        } catch (error) {
            console.error('Analysis failed:', error);
            alert(t('analysisFailedAlert'));
        } finally {
            setUploading(false);
        }
    };

    const handleExport = () => {
        if (allReports.length === 0) return;
        const headers = "Farm,Date,NDVI,Status\n";
        const rows = allReports.map(r =>
            `${r.farmName},${new Date(r.date).toLocaleDateString()},${r.ndvi.toFixed(2)},${r.diseaseDetected ? t('anomalyDetected') : t('optimal')}`
        ).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flight-logs-${new Date().getTime()}.csv`;
        a.click();
    };

    const allReports = farms.flatMap(farm =>
        (farm.analysisHistory || []).map((analysis: any) => ({
            ...analysis,
            farmName: farm.name,
            farmId: farm._id
        }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{t('analysisTitle')}</h1>
                    <p className="text-foreground/60 text-sm">{t('analysisDesc')}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="glass text-foreground/70 font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:text-primary transition-colors border border-border/50"
                    >
                        <Download className="w-4 h-4" />
                        {t('export')}
                    </button>
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="bg-primary text-black font-bold px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        {t('newAnalysis')}
                    </button>
                </div>
            </div>

            {showUpload && (
                <div className="glass p-8 rounded-3xl border border-primary/20 animate-in slide-in-from-top duration-300">
                    <h2 className="text-lg font-bold mb-4">{t('newAnalysis')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/70">{t('selectFarm')}</label>
                            <select
                                value={selectedFarmId}
                                onChange={(e) => setSelectedFarmId(e.target.value)}
                                className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 px-4 outline-none focus:border-primary/50"
                            >
                                {farms.map(farm => (
                                    <option key={farm._id} value={farm._id}>{farm.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/70">{t('uploadImage')}</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className={`flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {uploading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Upload className="w-5 h-5" />
                                    )}
                                    {uploading ? t('processing') : t('selectFile')}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="glass rounded-3xl overflow-hidden border border-border/50">
                <div className="p-6 border-b border-border/50 flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative flex-1 max-w-md text-foreground">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                        <input
                            type="text"
                            placeholder={t('searchReports')}
                            className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 text-foreground">
                        <button className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm text-foreground/70 hover:text-primary transition-colors border border-border/50">
                            <Filter className="w-4 h-4" />
                            {t('filter')}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto text-foreground">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-muted/30">
                                <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-foreground/40">{t('farmName')}</th>
                                <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-foreground/40">{t('date')}</th>
                                <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-foreground/40">{t('ndviInfo')}</th>
                                <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-foreground/40">{t('status')}</th>
                                <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider text-foreground/40">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {allReports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-foreground/40 font-bold">
                                        {t('noReports')}
                                    </td>
                                </tr>
                            ) : allReports.map((report, idx) => (
                                <tr key={idx} className="hover:bg-primary/5 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <FileText className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="font-medium">{report.farmName}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-foreground/60">
                                        {new Date(report.date).toLocaleDateString()} {new Date(report.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">NDVI: {report.ndvi.toFixed(2)}</span>
                                            <span className="text-xs text-foreground/60">Yield: {report.yieldPrediction?.toFixed(1) || 'N/A'} t/ha</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-foreground">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter flex items-center gap-1 w-fit ${!report.diseaseDetected ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {!report.diseaseDetected ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                            {report.diseaseDetected ? t('anomalyDetected') : t('optimal')}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2 text-foreground">
                                            <a
                                                href={`http://localhost:5000${report.imageUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-foreground/40 hover:text-primary transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button className="p-2 text-foreground/40 hover:text-primary transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-border/50 text-center">
                    <p className="text-sm text-foreground/40">{t('actions')}: {allReports.length}</p>
                </div>
            </div>
        </div>
    );
}
