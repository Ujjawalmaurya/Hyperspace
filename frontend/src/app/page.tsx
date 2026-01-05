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
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardCard from '@/components/DashboardCard';
import { useLanguage } from '@/hooks/useLanguage';
import { fetchStats } from '@/lib/api';

export default function Home() {
  const { t } = useLanguage();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-foreground">
          <h1 className="text-3xl font-bold">{t('overview')}</h1>
          <p className="text-foreground/60">{t('welcome')}</p>
        </div>
        <div className="flex gap-3">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 border border-border/50 text-foreground">
            <CloudSun className="w-5 h-5 text-accent" />
            <span className="font-medium">28°C / Clear Sky</span>
          </div>
          <button
            onClick={handleExport}
            className="bg-primary/10 hover:bg-primary/20 text-primary font-bold py-2 px-6 rounded-xl transition-all border border-primary/20"
          >
            {t('export')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-foreground">
        <DashboardCard
          title="Avg. NDVI Index"
          value={stats?.avgNDVI || "0.0"}
          subtext={parseFloat(stats?.avgNDVI) > 0.6 ? t('optimal') : t('moderate')}
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
          value={stats?.totalArea ? `${stats.totalArea} ha` : "0 ha"}
          subtext="Total Area"
          icon={TrendingUp}
          trend={{ value: "+12%", isUp: true }}
        />
        <DashboardCard
          title={t('pestRisk')}
          value={stats?.activeAlerts > 0 ? "High" : "Low"}
          subtext={`${stats?.activeAlerts || 0} ${t('alerts')}`}
          icon={Zap}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-foreground">
        <div className="lg:col-span-2 glass rounded-3xl p-8 border border-border/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              {t('zonalAnalysis')}
            </h2>
            <select className="bg-muted border border-border text-sm rounded-lg px-3 py-1 outline-none text-foreground">
              <option>North Field A</option>
              <option>South Sector 4</option>
            </select>
          </div>

          <div
            onClick={() => router.push('/maps')}
            className="aspect-video bg-[#0c1311] rounded-2xl relative overflow-hidden border border-border/30 flex items-center justify-center group cursor-pointer"
          >
            <div className="z-10 text-foreground/40 text-center group-hover:text-primary transition-colors flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                <ExternalLink className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Interactive Map View</p>
                <p className="text-sm">Click to view multispectral layers</p>
              </div>
            </div>
            <div className="absolute inset-0 opacity-20 pointer-events-none grid grid-cols-4 grid-rows-4">
              {[...Array(16)].map((_, i) => (
                <div key={i} className={`border border-white/5 ${i % 3 === 0 ? 'bg-primary' : 'bg-accent'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border border-border/50">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent" />
              {t('alerts')}
            </h2>
            <div className="space-y-4">
              {stats?.activeAlerts > 0 ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-sm font-bold text-red-400">Pest Detected</p>
                  <p className="text-xs text-foreground/60 mt-1">{stats.activeAlerts} zones showing anomalies. Drone inspection triggered.</p>
                </div>
              ) : (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                  <p className="text-sm font-bold text-green-400">No Critical Alerts</p>
                  <p className="text-xs text-foreground/60 mt-1">All sectors performing within normal parameters.</p>
                </div>
              )}
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                <p className="text-sm font-bold text-orange-400">Nutrient Deficiency</p>
                <p className="text-xs text-foreground/60 mt-1">Zone B-4 shows low nitrogen levels. Remediation recommended.</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border border-border/50">
            <h2 className="text-lg font-bold mb-4">{t('smartActions')}</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-all border border-border/30 group">
                <span className="text-sm font-medium">Schedule Fertilizer Drone</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-all border border-border/30 group">
                <span className="text-sm font-medium">Optimize Irrigation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
