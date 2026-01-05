"use client";
import React from 'react';
import {
    LayoutDashboard,
    Map,
    Settings,
    History,
    Bell,
    Users,
    LineChart
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';

export default function Sidebar() {
    const { t } = useLanguage();
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: t('dashboard'), href: '/' },
        { icon: Map, label: t('maps'), href: '/maps' },
        { icon: LineChart, label: t('analytics'), href: '/analytics' },
        { icon: History, label: t('reports'), href: '/reports' },
        { icon: Users, label: t('team'), href: '/team' },
        { icon: Bell, label: t('notifications'), href: '/alerts' },
        { icon: Settings, label: t('settings'), href: '/settings' },
    ];

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-64 glass border-r border-border/50 hidden lg:block p-4">
            <div className="space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${pathname === item.href
                                ? 'bg-primary/20 text-primary shadow-sm shadow-primary/10'
                                : 'text-foreground/70 hover:text-primary hover:bg-primary/10'
                            }`}
                    >
                        <item.icon className={`w-5 h-5 transition-transform ${pathname === item.href ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>

            <div className="absolute bottom-8 left-4 right-4">
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-4 rounded-2xl border border-primary/20">
                    <p className="text-xs font-semibold text-primary mb-1">{t('proPlan')}</p>
                    <p className="text-sm text-foreground/80 mb-3">Get advanced multispectral analysis.</p>
                    <button className="w-full bg-primary text-black text-sm font-bold py-2 rounded-lg hover:bg-primary-dark transition-colors">
                        {t('upgrade')}
                    </button>
                </div>
            </div>
        </aside>
    );
}
