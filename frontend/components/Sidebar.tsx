'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  ['/', 'Overview'], ['/employees', 'Employees'], ['/branches', 'Branches'], ['/performance', 'Objectives & reviews'],
  ['/leave', 'Leave'], ['/recruitment', 'Recruitment'], ['/training', 'Training'], ['/exits', 'Offboarding'], ['/complaints', 'Complaints'],
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="bg-rail text-slate-200 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0">
      <div className="px-5 py-4 lg:py-6">
        <p className="text-base font-semibold text-white">Tropical ERP</p>
        <p className="text-xs text-slate-400">Human resources</p>
      </div>
      <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
        {links.map(([href, label]) => {
          const active = href === '/' ? path === '/' : path.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={active ? 'page' : undefined}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors ${active ? 'bg-brand text-white' : 'hover:bg-white/10'}`}>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
