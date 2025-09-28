import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  ParkingSquare,
  BarChart3,
  Settings,
} from 'lucide-react';
import { Logo } from '@/components/icons/Logo';
import { Toaster } from "@/components/ui/toaster";
import { SidebarLinks } from '@/components/layout/SidebarLinks';

export const metadata: Metadata = {
  title: 'ParkPay Kiosk',
  description: 'Cashier Parking System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased', 'min-h-screen bg-background')}>
        <SidebarProvider>
          <Sidebar
            variant="sidebar"
            collapsible="icon"
            className="border-r"
          >
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <Logo className="size-7 text-primary" />
                <span className="text-lg font-bold font-headline">ParkPay</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarLinks />
            </SidebarContent>
            <SidebarFooter>
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarImage src="https://picsum.photos/seed/avatar/40/40" data-ai-hint="professional headshot" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Admin User</span>
                  <span className="text-xs text-muted-foreground">
                    admin@parkpay.co
                  </span>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            {children}
            <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
