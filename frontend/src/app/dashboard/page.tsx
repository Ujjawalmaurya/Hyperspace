"use client";
import React, { useEffect, useState } from 'react';
import {
    Activity,
    Droplets,
    CloudSun,
    Zap,
    TrendingUp,
    AlertTriangle,
    ArrowRight,
    Target,
    Loader2,
    ExternalLink,
    LocateFixed
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardCard from '@/components/DashboardCard';
import { useLanguage } from '@/hooks/useLanguage';
import { fetchStats } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Dashboard() {
    const { t } = useLanguage();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState<{ temp: number; description: string } | null>(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await fetchStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to load stats:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Using open-meteo.com - free weather API without API key required
                const response = await fetch(
                    'https://api.open-meteo.com/v1/forecast?latitude=26.4621&longitude=82.1342&current_weather=true'
                );
                const data = await response.json();
                if (data.current_weather) {
                    setWeather({
                        temp: Math.round(data.current_weather.temperature),
                        description: getWeatherDescription(data.current_weather.weathercode)
                    });
                }
            } catch (error) {
                console.error('Failed to fetch weather:', error);
                setWeather({ temp: 28, description: 'Clear Sky' }); // Fallback
            }
        };
        fetchWeather();
    }, []);

    const getWeatherDescription = (code: number): string => {
        const weatherCodes: { [key: number]: string } = {
            0: 'Clear Sky',
            1: 'Mainly Clear',
            2: 'Partly Cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Foggy',
            51: 'Light Drizzle',
            53: 'Drizzle',
            55: 'Heavy Drizzle',
            61: 'Light Rain',
            63: 'Rain',
            65: 'Heavy Rain',
            71: 'Light Snow',
            73: 'Snow',
            75: 'Heavy Snow',
            80: 'Rain Showers',
            95: 'Thunderstorm'
        };
        return weatherCodes[code] || 'Unknown';
    };

    const handleExport = () => {
        const data = `Metric,Value\nAvg NDVI,${stats?.avgNDVI}\nTotal Area,${stats?.totalArea} ha\nAlerts,${stats?.activeAlerts}\nDate,${new Date().toLocaleDateString()}`;
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hyperspace-report-${new Date().getTime()}.csv`;
        a.click();
        alert(t('exportSuccess'));
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
                    />
                    <p className="text-primary font-bold animate-pulse">Initializing Sky Scout Neural Link...</p>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-8 pb-12"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <motion.div variants={itemVariants} className="text-foreground">
                        <h1 className="text-4xl font-black tracking-tight">{t('overview')}</h1>
                        <p className="text-muted font-medium">{t('welcome')}</p>
                    </motion.div>
                    <div className="flex gap-3">
                        <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 border border-border/50 text-foreground">
                            <CloudSun className="w-5 h-5 text-accent" />
                            <span className="font-medium">
                                {weather ? `${weather.temp}°C / ${weather.description}` : 'Loading...'}
                            </span>
                        </div>
                        <button
                            onClick={handleExport}
                            className="bg-primary/10 hover:bg-primary/20 text-primary font-bold py-2 px-6 rounded-xl transition-all border border-primary/20"
                        >
                            {t('export')}
                        </button>
                    </div>
                </div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-foreground">
                    <DashboardCard
                        title="Avg. NDVI Index"
                        value={stats?.avgNDVI || "0.72"}
                        subtext={parseFloat(stats?.avgNDVI || "0.72") > 0.6 ? t('optimal') : t('moderate')}
                        icon={Activity}
                        trend={{ value: "+4.2%", isUp: true }}
                    />
                    <DashboardCard
                        title={t('moisture')}
                        value="64%"
                        subtext="Healthy"
                        icon={Droplets}
                        trend={{ value: "-1.5%", isUp: false }}
                    />
                    <DashboardCard
                        title={t('yield')}
                        value={stats?.totalArea ? `${stats.totalArea} ha` : "1250 ha"}
                        subtext="Total Area"
                        icon={TrendingUp}
                        trend={{ value: "+12%", isUp: true }}
                    />
                    <DashboardCard
                        title={t('pestRisk')}
                        value={stats?.activeAlerts > 0 ? "High" : "Low"}
                        subtext={`${stats?.activeAlerts || 3} ${t('alerts')}`}
                        icon={Zap}
                    />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-foreground">
                    <motion.div variants={itemVariants} className="lg:col-span-2 glass rounded-[2.5rem] p-8 border border-border/50 relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h2 className="text-2xl font-black flex items-center gap-3">
                                <Target className="w-8 h-8 text-primary" />
                                {t('zonalAnalysis')}
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-green-500 uppercase">Live Feed</span>
                                </div>
                                <select className="bg-white/5 border border-white/10 text-sm rounded-xl px-4 py-2 outline-none text-foreground font-bold backdrop-blur-md">
                                    <option>North Field A</option>
                                    <option>South Sector 4</option>
                                </select>
                            </div>
                        </div>

                        <div
                            onClick={() => router.push('/maps')}
                            className="aspect-video bg-[#0c1311] rounded-3xl relative overflow-hidden border border-white/5 flex items-center justify-center group cursor-pointer shadow-inner"
                        >
                            {/* Map Surface Simulation */}
                            <div className="absolute inset-0 bg-[url('/ortho.webp')] bg-cover bg-center brightness-[0.3] group-hover:scale-105 transition-transform duration-[10s]" />

                            {/* Scanning Laser */}
                            <motion.div
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-0.5 bg-primary/50 shadow-[0_0_15px_rgba(34,197,94,0.8)] z-20"
                            />

                            {/* Detection Point */}
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute top-1/3 left-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_rgba(34,197,94,1)]"
                            >
                                <div className="absolute inset-[-8px] border-2 border-primary rounded-full animate-ping" />
                            </motion.div>

                            <div className="z-10 text-foreground/40 text-center group-hover:text-primary transition-colors flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform group-hover:rotate-12 group-hover:bg-primary group-hover:text-black">
                                    <ExternalLink className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="font-black text-2xl tracking-tight text-white/90 group-hover:text-white">INTERACTIVE TACTICAL MAP</p>
                                    <p className="text-sm font-medium">Click to expand multispectral layers & NDVI data</p>
                                </div>
                            </div>

                            {/* HUD Elements */}
                            <div className="absolute top-4 right-4 p-4 font-mono text-[10px] text-primary/60 text-right space-y-1 pointer-events-none">
                                <p>LAT: 40.7128° N</p>
                                <p>LNG: 74.0060° W</p>
                                <p>ALT: 120m</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex flex-col gap-6">
                        <motion.div variants={itemVariants} className="glass rounded-[2.5rem] p-8 border border-border/50">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-accent" />
                                {t('alerts')}
                            </h2>
                            <div className="space-y-4">
                                {stats?.activeAlerts > 0 ? (
                                    <motion.div
                                        whileHover={{ x: 5 }}
                                        className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl group cursor-help"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm font-black text-red-400 uppercase tracking-wider">Pest Cluster</p>
                                            <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded">URGENT</span>
                                        </div>
                                        <p className="text-xs text-muted leading-relaxed font-medium">{stats.activeAlerts} zones showing aphid activity. Ground scouting recommended.</p>
                                    </motion.div>
                                ) : (
                                    <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                        <p className="text-sm font-black text-green-400 uppercase tracking-wider">All Clear</p>
                                        <p className="text-xs text-muted mt-1 font-medium">All monitored sectors are healthy.</p>
                                    </div>
                                )}
                                <motion.div
                                    whileHover={{ x: 5 }}
                                    className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl cursor-pointer"
                                >
                                    <p className="text-sm font-black text-orange-400 uppercase tracking-wider">Nitrogen Dip</p>
                                    <p className="text-xs text-muted mt-1 font-medium leading-relaxed">Zone B-4 shows 12% drop in chlorophyll activity.</p>
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="glass rounded-[2.5rem] p-8 border border-border/50">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                                <Zap className="w-6 h-6 text-primary" />
                                {t('smartActions')}
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { label: "Schedule Fertilizer Flyover", icon: LocateFixed },
                                    { label: "Optimize Irrigation Cycle", icon: Droplets }
                                ].map((action, i) => (
                                    <button key={i} className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-primary hover:text-black transition-all border border-white/5 group font-bold">
                                        <div className="flex items-center gap-3">
                                            <action.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm tracking-tight">{action.label}</span>
                                        </div>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </ProtectedRoute>
    );
}
