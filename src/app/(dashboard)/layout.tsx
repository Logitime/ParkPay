
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/icons/Logo';
import { SidebarLinks } from '@/components/layout/SidebarLinks';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
          <div className="flex items-center justify-between">
            <div className='flex items-center gap-3'>
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
            <Link href="/login" passHref>
                <Button variant="ghost" size="icon" aria-label="Log Out">
                    <LogOut className="size-4" />
                </Button>
            </Link>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
