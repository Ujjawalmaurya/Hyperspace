"use client";
import React from 'react';
import {
    BarChart3,
    TrendingUp,
    Calendar,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Yield & Health Analytics</h1>
                    <p className="text-foreground/60 text-sm">Historical performance and predictive trends.</p>
                </div>
                <div className="flex gap-3">
                    <button className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        Last 30 Days
                    </button>
                    <button className="bg-primary text-black font-bold px-4 py-2 rounded-xl flex items-center gap-2 text-sm hover:bg-primary-dark transition-colors">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass rounded-3xl p-8 border border-border/50">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-lg font-bold">Health Index Trend (NDVI)</h2>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-xs text-foreground/60">Current Season</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                                <span className="text-xs text-foreground/60">Last Season</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-2">
                        {[40, 55, 45, 70, 85, 80, 75, 90, 95, 85, 70, 60].map((h, i) => (
                            <div key={i} className="flex-1 group relative">
                                <div
                                    className="bg-primary/20 group-hover:bg-primary/40 rounded-t-lg transition-all"
                                    style={{ height: `${h}%` }}
                                />
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-foreground/40 font-medium">
                                    W{i + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass rounded-3xl p-8 border border-border/50">
                    <h2 className="text-lg font-bold mb-6">Predictive Insights</h2>
                    <div className="space-y-6">
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/30">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium">Est. Harvest Date</span>
                                <ArrowUpRight className="w-4 h-4 text-primary" />
                            </div>
                            <p className="text-2xl font-bold text-primary">Mar 12, 2026</p>
                            <p className="text-xs text-foreground/40 mt-1">Based on current growth rates</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/30">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium">Projected Yield</span>
                                <TrendingUp className="w-4 h-4 text-primary" />
                            </div>
                            <p className="text-2xl font-bold text-primary">14.2 Tons</p>
                            <p className="text-xs text-foreground/40 mt-1">Expected increase of 12% YoY</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-3xl p-8 border border-border/50">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Filter className="w-5 h-5 text-primary" />
                        Resource Utilization
                    </h2>
                    <div className="space-y-4">
                        {['Water Consumption', 'Fertilizer Usage', 'Energy Consumption'].map((label, i) => (
                            <div key={label}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-foreground/70">{label}</span>
                                    <span className="font-bold">{[75, 45, 30][i]}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${[75, 45, 30][i]}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass rounded-3xl p-8 border border-border/50">
                    <h2 className="text-lg font-bold mb-6">Economic Impact</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                            <p className="text-xs text-foreground/60 mb-1">Cost Savings</p>
                            <p className="text-xl font-bold text-primary">₹42,500</p>
                            <p className="text-[10px] text-primary/60 mt-1">Due to precision spraying</p>
                        </div>
                        <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20">
                            <p className="text-xs text-foreground/60 mb-1">Revenue Boost</p>
                            <p className="text-xl font-bold text-accent">₹1,12,000</p>
                            <p className="text-[10px] text-accent/60 mt-1">Est. from quality improvements</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
