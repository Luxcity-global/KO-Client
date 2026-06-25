'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Briefcase,
  Settings,
  LayoutDashboard,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  href: string;
  /** Desktop sidebar: custom SVG asset path */
  iconUrl?: string;
  /** Lucide icon — used on mobile bottom bar and desktop fallback */
  icon: LucideIcon;
};

const CLIENT_NAV: NavItem[] = [
  {
    label: 'Overview',
    href: '/overview',
    iconUrl: '/assets/dashboard_customize.svg',
    icon: LayoutDashboard,
  },
  {
    label: 'Application',
    href: '/application',
    icon: Briefcase,
  },
  {
    label: 'Messages',
    href: '/messages',
    iconUrl: '/assets/chat.svg',
    icon: MessageSquare,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

/** Desktop sidebar pill icon */
function SidebarIcon({ item, active }: { item: NavItem; active: boolean }) {
  const tone = active ? '#00B8D9' : '#535E5B';
  return (
    <span
      className={cn(
        'flex shrink-0 items-center gap-2 rounded-[34px] p-2',
        active ? 'bg-[rgba(255,255,255,0.95)]' : 'bg-[rgba(242,242,242,0.95)]',
      )}
    >
      {item.iconUrl ? (
        <img src={item.iconUrl} alt="" width={24} height={24} className="h-6 w-6 shrink-0" />
      ) : (
        <item.icon className="h-6 w-6 shrink-0" style={{ color: tone }} aria-hidden />
      )}
    </span>
  );
}

export function ClientDashboardNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* ── Mobile: fixed bottom tab bar ── */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 flex items-stretch justify-around border-t border-[#E4E4E4] bg-white lg:hidden"
        aria-label="Client navigation"
      >
        {CLIENT_NAV.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className="flex flex-1 flex-col items-center gap-1 px-1 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-teal-500"
            >
              <Icon
                className="h-6 w-6"
                style={{ color: active ? '#1d9e75' : '#535E5B' }}
                aria-hidden
              />
              <span
                className={cn(
                  'text-[10px] font-medium leading-none',
                  active ? 'text-brand-teal-500' : 'text-ink-60',
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Desktop: left sidebar ── */}
      <aside
        className="hidden lg:sticky lg:top-0 lg:flex lg:min-h-dvh lg:w-[254px] lg:shrink-0 lg:flex-col lg:items-start lg:gap-[136px] lg:self-start lg:border-r lg:border-[#E4E4E4] lg:bg-white lg:py-[27px] lg:pr-[14px] lg:pl-[14px]"
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
                className={cn(
                  'flex w-full items-center gap-2 self-stretch rounded-[32px] px-[14px] py-[6px] text-left text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-active-border focus-visible:ring-offset-2',
                  active
                    ? 'border border-nav-active-border bg-nav-active-bg text-nav-text'
                    : 'border border-transparent bg-white text-nav-text hover:bg-[#fafafa]',
                )}
              >
                <SidebarIcon item={item} active={active} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
