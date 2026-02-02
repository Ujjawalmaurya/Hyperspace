"use client";
import React from 'react';
import {
    LayoutDashboard,
    Map,
    Settings,
    History,
    Bell,
    Users,
    LineChart,
    LocateFixed,
    Zap,
    Droplets
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { motion } from 'framer-motion';

export default function Sidebar() {
    const { t } = useLanguage();
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: t('dashboard'), href: '/dashboard' },
        { icon: Map, label: t('maps'), href: '/maps' },
        { icon: LineChart, label: t('analytics'), href: '/analytics' },
        { icon: History, label: t('reports'), href: '/reports' },
        { icon: Users, label: t('team'), href: '/team' },
        { icon: Bell, label: t('notifications'), href: '/alerts' },
        { icon: Settings, label: t('settings'), href: '/settings' },
    ];

    const containerVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { staggerChildren: 0.05, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    if (pathname === '/') return null;

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-64 glass border-r border-border/50 hidden lg:block p-4 z-40">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-2"
            >
                {menuItems.map((item) => (
                    <motion.div key={item.label} variants={itemVariants}>
                        <Link
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${pathname === item.href
                                ? 'bg-primary text-white font-black shadow-[0_10px_20px_rgba(34,197,94,0.3)]'
                                : 'text-subtle hover:text-primary hover:bg-primary/10'
                                }`}
                        >
                            {pathname === item.href && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-0 bg-primary z-0"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <item.icon className={`w-5 h-5 relative z-10 transition-transform ${pathname === item.href ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'}`} />
                            <span className="font-bold relative z-10">{item.label}</span>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </aside>
    );
}
