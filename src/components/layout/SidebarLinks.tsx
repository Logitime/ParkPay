
'use client';

import {
  BarChart3,
  LayoutDashboard,
  ParkingSquare,
  Settings,
  Car,
  HandCoins,
  Users,
  TicketPercent,
  Shield,
  Presentation,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import Link from 'next/link';

export function SidebarLinks() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/cashier', label: 'Cashier', icon: HandCoins },
    { href: '/operator', label: 'Operator', icon: Shield },
    { href: '/kiosk', label: 'Kiosk', icon: Presentation },
    { href: '/gates', label: 'Gates', icon: Car },
    { href: '/zones', label: 'Zones', icon: ParkingSquare },
    { href: '/parkers', label: 'Parkers', icon: Users },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/returns', label: 'Returns', icon: TicketPercent },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <Link href={link.href} passHref>
            <SidebarMenuButton
              isActive={pathname === (link.href === '/' ? '/' : `${link.href}`)}
              tooltip={link.label}
            >
              <link.icon />
              <span>{link.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
