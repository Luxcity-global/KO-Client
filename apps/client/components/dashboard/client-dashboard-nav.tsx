'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Briefcase, Settings, type LucideIcon } from 'lucide-react';

type NavItem = {
  label: string;
  href: string;
  iconUrl?: string;
  icon?: LucideIcon;
};

const CLIENT_NAV: NavItem[] = [
  { label: 'Overview', href: '/overview', iconUrl: '/assets/dashboard_customize.svg' },
  { label: 'My Application', href: '/application', icon: Briefcase },
  { label: 'Messages', href: '/messages', iconUrl: '/assets/chat.svg' },
  { label: 'Settings', href: '/settings', icon: Settings },
];

function NavIcon({ item, active }: { item: NavItem; active: boolean }) {
  const tone = active ? '#00B8D9' : '#535E5B';

  return (
    <span
      className={`flex shrink-0 items-center gap-2 rounded-[34px] p-2 ${
        active ? 'bg-[rgba(255,255,255,0.95)]' : 'bg-[rgba(242,242,242,0.95)]'
      }`}
    >
      {item.iconUrl ? (
        <img src={item.iconUrl} alt="" width={24} height={24} className="h-6 w-6 shrink-0" />
      ) : item.icon ? (
        <item.icon className="h-6 w-6 shrink-0" style={{ color: tone }} aria-hidden />
      ) : null}
    </span>
  );
}

export function ClientDashboardNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside
      className="flex w-full shrink-0 flex-col items-start gap-[136px] border-b border-[#E4E4E4] bg-white py-[27px] pr-[14px] pl-[14px] lg:sticky lg:top-0 lg:min-h-dvh lg:w-[254px] lg:self-start lg:border-r lg:border-b-0"
      aria-label="Client navigation"
    >
      <Link
        href="/overview"
        className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-active-border focus-visible:ring-offset-2"
        aria-label="KO Platform home"
      >
        <div className="rounded-md bg-brand-teal p-1.5">
          <Building2 className="h-5 w-5 text-white" aria-hidden />
        </div>
        <span className="font-display text-xl font-bold tracking-tight text-brand-teal">
          KO Platform
        </span>
      </Link>

      <nav className="flex w-full flex-col items-start gap-[19px] self-stretch">
        {CLIENT_NAV.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex w-full items-center gap-2 self-stretch rounded-[32px] px-[14px] py-[6px] text-left text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-active-border focus-visible:ring-offset-2 ${
                active
                  ? 'border border-nav-active-border bg-nav-active-bg text-nav-text'
                  : 'border border-transparent bg-white text-nav-text hover:bg-[#fafafa]'
              }`}
            >
              <NavIcon item={item} active={active} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
