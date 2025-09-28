'use client';

import {
    BarChart3,
    LayoutDashboard,
    ParkingSquare,
    Settings,
  } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
SidebarMenu,
SidebarMenuItem,
SidebarMenuButton,
} from '@/components/ui/sidebar';
  
export function SidebarLinks() {
const pathname = usePathname();

const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/zones', label: 'Zones', icon: ParkingSquare },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
];

return (
    <SidebarMenu>
    {links.map((link) => (
        <SidebarMenuItem key={link.href}>
        <SidebarMenuButton
            href={link.href}
            isActive={pathname === link.href}
            tooltip={link.label}
        >
            <link.icon />
            <span>{link.label}</span>
        </SidebarMenuButton>
        </SidebarMenuItem>
    ))}
    </SidebarMenu>
);
}
