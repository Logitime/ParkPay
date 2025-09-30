'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';


export function Header({ title }: { title: string }) {
  const t = useTranslations('Header');
  const [currentDate, setCurrentDate] = useState('');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setCurrentDate(format(new Date(), 'MMMM d, yyyy'));
  }, []);
  
  const onSelectChange = (value: string) => {
    // This will get the pathname without the locale.
    const newPathname = pathname.startsWith(`/${locale}`) ? pathname.substring(`/${locale}`.length) || '/' : pathname;
    router.replace(`/${value}${newPathname}`);
  };

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
       <div className="flex items-center gap-4">
        <Select value={locale} onValueChange={onSelectChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('language')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t('english')}</SelectItem>
            <SelectItem value="ar">{t('arabic')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
