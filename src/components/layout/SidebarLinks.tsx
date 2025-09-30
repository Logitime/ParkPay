
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
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

export function SidebarLinks() {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  const locale = useLocale();

  const links = [
    { href: '/dashboard', label: 'dashboard', icon: LayoutDashboard },
    { href: '/cashier', label: 'cashier', icon: HandCoins },
    { href: '/operator', label: 'operator', icon: Shield },
    { href: '/kiosk', label: 'kiosk', icon: Presentation },
    { href: '/gates', label: 'gates', icon: Car },
    { href: '/zones', label: 'zones', icon: ParkingSquare },
    { href: '/parkers', label: 'parkers', icon: Users },
    { href: '/reports', label: 'reports', icon: BarChart3 },
    { href: '/returns', label: 'returns', icon: TicketPercent },
    { href: '/settings', label: 'settings', icon: Settings },
  ];
  
  // This helper function removes the locale from the start of the pathname
  const getActivePath = (path: string) => {
    const localePrefix = `/${locale}`;
    if (path.startsWith(localePrefix)) {
      const strippedPath = path.substring(localePrefix.length);
      // Handle the case where the path is just the locale, which should map to the dashboard
      if (strippedPath === '' || strippedPath === '/dashboard') return '/dashboard';
      return strippedPath;
    }
    return path;
  };
  
  const activePath = getActivePath(pathname);


  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <Link href={link.href} passHref>
            <SidebarMenuButton
              isActive={activePath === link.href}
              tooltip={t(link.label as any)}
            >
              <link.icon />
              <span>{t(link.label as any)}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
