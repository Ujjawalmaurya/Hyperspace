"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
    Activity,
    Map as MapIcon,
    Thermometer,
    Zap,
    Loader2,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { fetchFarms } from '@/lib/api';

// Dynamic import for Leaflet component to avoid SSR issues
const FarmMap = dynamic(() => import('@/components/FarmMap'), {
    loading: () => <div className="w-full h-full bg-muted animate-pulse rounded-3xl" />,
    ssr: false
});

export default function MapsPage() {
    const { t } = useLanguage();
    const [farms, setFarms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeLayer, setActiveLayer] = useState('ndvi');

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
                        Visualize multispectral layers and health indices.
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

            <div className="flex-1 glass rounded-3xl relative overflow-hidden border border-border/50 group shadow-2xl">
                <FarmMap farms={farms} activeLayer={activeLayer} />

                {/* Map Overlay Controls */}
                <div className="absolute top-6 right-6 z-[400]">
                    <div className="glass px-6 py-3 rounded-2xl border border-primary/30 flex items-center gap-4 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-3 h-3 rounded-full bg-primary animate-ping absolute inset-0" />
                                <div className="w-3 h-3 rounded-full bg-primary relative" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live GIS Active</span>
                                <span className="text-[8px] text-foreground/40">Synchronized with Fleet</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
