"use client";
import React, { useState, useEffect } from 'react';
import {
    Layers,
    Maximize,
    ZoomIn,
    ZoomOut,
    Map as MapIcon,
    Eye,
    Info,
    Loader2,
    Activity,
    Thermometer,
    Zap
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { fetchFarms } from '@/lib/api';

export default function MapsPage() {
    const { t } = useLanguage();
    const [farms, setFarms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeLayer, setActiveLayer] = useState('ndvi');
    const [hoveredZone, setHoveredZone] = useState<number | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchFarms();
                setFarms(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const latestAnalysis = farms.length > 0 && farms[0].analysisHistory?.length > 0
        ? farms[0].analysisHistory[farms[0].analysisHistory.length - 1]
        : null;

    const layers = [
        { id: 'ndvi', icon: Activity, label: "NDVI Index" },
        { id: 'rgb', icon: MapIcon, label: "RGB Ortho" },
        { id: 'thermal', icon: Thermometer, label: "Thermal Map" },
        { id: 'pest', icon: Zap, label: "Pest Heatmap" }
    ];

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{t('maps')}</h1>
                    <p className="text-foreground/60 text-sm">
                        {latestAnalysis ? `Live Data Sync: ${new Date(latestAnalysis.date).toLocaleTimeString()}` : 'Visualize multispectral layers and health indices.'}
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
                        {layers.map(layer => (
                            <button
                                key={layer.id}
                                onClick={() => setActiveLayer(layer.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeLayer === layer.id ? 'bg-primary text-black' : 'text-foreground/60 hover:text-foreground'}`}
                            >
                                <layer.icon className="w-3.5 h-3.5" />
                                {layer.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 glass rounded-3xl relative overflow-hidden border border-border/50 group bg-[#0c1311] shadow-2xl">
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 p-4">

                    {[...Array(16)].map((_, i) => {
                        // Use AI-generated grid if available, otherwise fallback to baseNDVI logic
                        let zoneValue = 0.5; // Default neutral

                        if (latestAnalysis?.metadata?.ndviGrid && Array.isArray(latestAnalysis.metadata.ndviGrid)) {
                            zoneValue = latestAnalysis.metadata.ndviGrid[i] ?? 0.5;
                        } else if (latestAnalysis) {
                            // Fallback if grid is missing but analysis exists
                            const baseNDVI = latestAnalysis.ndvi || 0.7;
                            zoneValue = Math.max(0, Math.min(1, baseNDVI + (Math.sin(i) * 0.1)));
                        }

                        let bgColor = 'bg-primary/20';
                        if (activeLayer === 'ndvi') {
                            // NDVI Color Scale: 
                            // > 0.7 (Healthy) -> Green
                            // 0.4 - 0.7 (Moderate) -> Yellow
                            // < 0.4 (Stressed) -> Red
                            if (zoneValue > 0.7) bgColor = `bg-green-500/${Math.floor(zoneValue * 80 + 20)}`;
                            else if (zoneValue > 0.4) bgColor = `bg-yellow-500/${Math.floor(zoneValue * 80 + 20)}`;
                            else bgColor = `bg-red-500/${Math.floor((1 - zoneValue) * 80 + 20)}`;

                        } else if (activeLayer === 'thermal') {
                            bgColor = zoneValue > 0.6 ? 'bg-red-500/40' : 'bg-blue-500/40';
                        } else if (activeLayer === 'pest') {
                            bgColor = i % 5 === 0 ? 'bg-red-600/50 pulse-error' : 'bg-primary/5';
                        }

                        return (
                            <div
                                key={i}
                                onMouseEnter={() => setHoveredZone(i)}
                                onMouseLeave={() => setHoveredZone(null)}
                                className={`relative rounded-lg border border-white/5 transition-all cursor-crosshair ${bgColor} ${hoveredZone === i ? 'border-primary ring-2 ring-primary/20 z-10 scale-[1.01]' : ''}`}
                            >
                                {hoveredZone === i && (
                                    <div className="absolute top-2 left-full ml-4 glass p-4 rounded-2xl border border-primary/40 z-50 min-w-[180px] shadow-2xl animate-in slide-in-from-left-2 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-xs font-black text-primary uppercase tracking-tighter">Sector {String.fromCharCode(65 + Math.floor(i / 4))}{i % 4 + 1}</p>
                                                <p className="text-[10px] text-foreground/40">Lat: 28.6{i}4, Lng: 77.2{i}1</p>
                                            </div>
                                            <div className={`w-2 h-2 rounded-full ${zoneValue > 0.4 ? 'bg-primary' : 'bg-red-500'}`} />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-foreground/60">NDVI Health</span>
                                                <span className="font-bold text-foreground">{(zoneValue * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${zoneValue * 100}%` }} />
                                            </div>

                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-foreground/60">Moisture</span>
                                                <span className="font-bold text-foreground">64%</span>
                                            </div>

                                            {activeLayer === 'pest' && i % 5 === 0 && (
                                                <div className="mt-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                                    <p className="text-[10px] font-bold text-red-400">!! Pest Detected !!</p>
                                                    <p className="text-[8px] text-red-400/70">High confidence anomaly</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                    <button className="glass w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-muted transition-all border border-border/50 text-foreground shadow-lg">
                        <ZoomIn className="w-6 h-6" />
                    </button>
                    <button className="glass w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-muted transition-all border border-border/50 text-foreground shadow-lg">
                        <ZoomOut className="w-6 h-6" />
                    </button>
                </div>

                <div className="absolute top-6 right-6">
                    <div className="glass px-6 py-3 rounded-2xl border border-primary/30 flex items-center gap-4 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-3 h-3 rounded-full bg-primary animate-ping absolute inset-0" />
                                <div className="w-3 h-3 rounded-full bg-primary relative" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live GIS Active</span>
                                <span className="text-[8px] text-foreground/40">Synchronized with Fleet A-101</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 left-6 glass p-6 rounded-[2rem] border border-border/50 max-w-sm shadow-2xl">
                    <h3 className="text-sm font-bold mb-4 text-foreground flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        Health Legend (NDVI)
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-lg bg-green-500" />
                                <span className="text-foreground/70">{t('optimal')}</span>
                            </div>
                            <span className="font-bold text-foreground">0.8 - 1.0</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-lg bg-yellow-500" />
                                <span className="text-foreground/70">{t('moderate')}</span>
                            </div>
                            <span className="font-bold text-foreground">0.4 - 0.7</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-lg bg-red-500" />
                                <span className="text-foreground/70">{t('critical')}</span>
                            </div>
                            <span className="font-bold text-foreground">0.0 - 0.3</span>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 right-6 flex gap-3">
                    <button className="bg-primary text-black font-black px-6 py-3 rounded-2xl text-xs flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20">
                        <Maximize className="w-4 h-4" />
                        FULLSCREEN GIS
                    </button>
                    <button className="glass px-6 py-3 rounded-2xl border border-border/50 hover:bg-muted transition-all flex items-center gap-3 font-bold text-xs text-foreground shadow-xl">
                        <Eye className="w-4 h-4" />
                        VIEW LOGS
                    </button>
                </div>
            </div>
        </div>
    );
}
