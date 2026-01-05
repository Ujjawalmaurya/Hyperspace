"use client";
import React, { useState } from 'react';
import {
    Settings,
    User,
    Bell,
    Shield,
    Globe,
    HardDrive,
    Smartphone,
    Cloud,
    Save,
    Drone,
    CheckCircle,
    Info
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function SettingsPage() {
    const { t, lang, setLang } = useLanguage();
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', icon: User, label: "Profile" },
        { id: 'notifications', icon: Bell, label: "Notifications" },
        { id: 'security', icon: Shield, label: "Security" },
        { id: 'language', icon: Globe, label: "Language" },
        { id: 'api', icon: HardDrive, label: "Integrations" },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/70">Full Name</label>
                                <input type="text" defaultValue="Rajesh Kumar" className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 px-4 focus:border-primary/50 outline-none text-foreground" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/70">Email Address</label>
                                <input type="email" defaultValue="rajesh@farm.com" className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 px-4 focus:border-primary/50 outline-none text-foreground" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/70">Farm Location</label>
                                <input type="text" defaultValue="Punjab, India" className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 px-4 focus:border-primary/50 outline-none text-foreground" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/70">Phone Number</label>
                                <input type="text" defaultValue="+91 98765 43210" className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 px-4 focus:border-primary/50 outline-none text-foreground" />
                            </div>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {[
                            { label: "Pest Alerts", desc: "Get notified when anomalies are detected.", active: true },
                            { label: "Drone Status", desc: "Receive updates on flight health and battery.", active: true },
                            { label: "Weekly Reports", desc: "Summary of field health sent every Sunday.", active: false },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between p-4 glass rounded-2xl border border-border/50">
                                <div>
                                    <p className="font-bold text-foreground">{item.label}</p>
                                    <p className="text-xs text-foreground/60">{item.desc}</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${item.active ? 'bg-primary' : 'bg-muted'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/70">Current Password</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 px-4 focus:border-primary/50 outline-none text-foreground" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/70">New Password</label>
                                <input type="password" placeholder="Min 8 characters" className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 px-4 focus:border-primary/50 outline-none text-foreground" />
                            </div>
                        </div>
                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex gap-3">
                            <Shield className="w-5 h-5 text-orange-400 shrink-0" />
                            <p className="text-xs text-orange-200/80">Two-factor authentication is recommended to protect your farm data.</p>
                        </div>
                    </div>
                );
            case 'language':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setLang('en')}
                                className={`p-6 rounded-2xl border-2 transition-all text-center ${lang === 'en' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'}`}
                            >
                                <span className="text-3xl mb-2 block">🇺🇸</span>
                                <p className="font-bold text-foreground">English</p>
                            </button>
                            <button
                                onClick={() => setLang('hi')}
                                className={`p-6 rounded-2xl border-2 transition-all text-center ${lang === 'hi' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'}`}
                            >
                                <span className="text-3xl mb-2 block">🇮🇳</span>
                                <p className="font-bold text-foreground">हिंदी (Hindi)</p>
                            </button>
                        </div>
                    </div>
                );
            case 'api':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 text-foreground">
                        <div className="space-y-4">
                            <div className="p-4 glass rounded-2xl border border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Drone className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold">DJI Mavic 3M Connection</p>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            <p className="text-xs text-green-400">Live Connection Active</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button className="text-xs font-bold text-primary hover:underline">Calibrate</button>
                                    <button className="text-xs font-bold text-red-400 hover:underline">Disconnect</button>
                                </div>
                            </div>
                            <div className="p-4 glass rounded-2xl border border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Cloud className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Sentinal-2 Hub</p>
                                        <p className="text-xs text-foreground/40">Satellite Data Feed</p>
                                    </div>
                                </div>
                                <button className="px-4 py-1 bg-primary text-black text-xs font-bold rounded-lg transition-transform hover:scale-105">Connect</button>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 space-y-3">
                            <div className="flex items-center gap-2 text-primary">
                                <Info className="w-4 h-4" />
                                <p className="text-xs font-bold uppercase tracking-widest">Hardware Calibration</p>
                            </div>
                            <p className="text-xs text-foreground/60 leading-relaxed">
                                Ensure your drone's multispectral sensors are calibrated before every flight for accurate NDVI readings.
                                Last successful sync: Today at 09:14 AM.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-foreground">{t('settings')}</h1>
                <p className="text-foreground/60 text-sm">Manage your account and drone hardware configurations.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                                ? 'bg-primary text-black font-bold shadow-lg shadow-primary/20'
                                : 'text-foreground/70 hover:bg-muted font-medium'
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 glass p-8 rounded-3xl border border-border/50 relative">
                    <div className="mb-8 flex justify-between items-center">
                        <h2 className="text-xl font-bold capitalize text-foreground">{activeTab} Settings</h2>
                        <button className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-bold border border-primary/20 transition-all">
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                    </div>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
