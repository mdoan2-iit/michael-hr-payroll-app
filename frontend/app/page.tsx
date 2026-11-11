'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ErrorBanner, PageHeader } from '@/components/ui';

const tiles = [
  ['employees', 'Active employees', '/employees'], ['pendingLeave', 'Leave awaiting a decision', '/leave'], ['openJobs', 'Open job postings', '/recruitment'],
  ['activeCandidates', 'Candidates in the pipeline', '/recruitment'], ['openComplaints', 'Unresolved complaints', '/complaints'], ['exitsInProgress', 'Offboarding records', '/exits'],
] as const;

export default function Overview() {
  const [data, setData] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState('');
  const load = () => { setError(''); api('/dashboard').then(setData).catch((e) => setError(e.message)); };
  useEffect(load, []);
  return (
    <div>
      <PageHeader title="HR overview" subtitle="What needs attention across all branches." />
      {error && <ErrorBanner message={error} onRetry={load} />}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map(([key, label, href]) => (
          <Link key={key} href={href} className="rounded-lg border border-line bg-white p-5 transition-colors hover:border-brand">
            <p className="text-3xl font-semibold">{data ? data[key] : <span className="inline-block h-8 w-10 animate-pulse rounded bg-slate-100" />}</p>
            <p className="mt-1 text-sm text-slate-600">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
