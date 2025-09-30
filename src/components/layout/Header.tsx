'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';


export function Header({ title }: { title: string }) {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(format(new Date(), 'MMMM d, yyyy'));
  }, []);
  
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold font-headline tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{currentDate}</p>
        </div>
      </div>
    </header>
  );
}
