'use client';
import { useState } from 'react';
import ResourcePage from '@/components/ResourcePage';
import { PageHeader, Badge, Field } from '@/components/ui';
import { fullName } from '@/lib/api';

const EMP = { endpoint: '/employees', label: (e: any) => `${e.firstName} ${e.lastName}` };
const objectiveFields: Field[] = [
  { name: 'employeeId', label: 'Employee', type: 'select', numeric: true, required: true, optionsFrom: EMP },
  { name: 'date', label: 'Date', type: 'date', required: true }, { name: 'goal', label: 'Daily goal', type: 'textarea', required: true },
  { name: 'status', label: 'Status', type: 'select', options: ['Open', 'Done', 'Missed'] }, { name: 'notes', label: 'Notes' },
];
const reviewFields: Field[] = [
  { name: 'employeeId', label: 'Employee', type: 'select', numeric: true, required: true, optionsFrom: EMP },
  { name: 'reviewer', label: 'Reviewer (manager)', required: true }, { name: 'period', label: 'Review period', required: true, help: 'For example: Q4 2026' },
  { name: 'rating', label: 'Rating (1 to 5)', type: 'number', min: 1, max: 5, required: true }, { name: 'comments', label: 'Comments', type: 'textarea' },
];

export default function Page() {
  const [tab, setTab] = useState<'objectives' | 'reviews'>('objectives');
  return (
    <div>
      <PageHeader title="Objectives & reviews" subtitle="Log daily work goals and record management assessments." />
      <div role="tablist" className="mb-4 flex gap-2">
        {(['objectives', 'reviews'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={tab === t ? 'btn-primary' : 'btn-ghost'}>{t === 'objectives' ? 'Daily objectives' : 'Performance reviews'}</button>
        ))}
      </div>
      {tab === 'objectives' ? (
        <ResourcePage key="o" hideHeader noun="objective" endpoint="/objectives" fields={objectiveFields}
          filter={{ key: 'status', label: 'Status', options: ['Open', 'Done', 'Missed'] }}
          columns={[
            { key: 'date', label: 'Date' }, { key: 'employee', label: 'Employee', render: (r) => fullName(r.employee) },
            { key: 'goal', label: 'Goal' }, { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
          ]} />
      ) : (
        <ResourcePage key="r" hideHeader noun="review" endpoint="/reviews" fields={reviewFields}
          columns={[
            { key: 'employee', label: 'Employee', render: (r) => fullName(r.employee) }, { key: 'period', label: 'Period' }, { key: 'reviewer', label: 'Reviewer' },
            { key: 'rating', label: 'Rating', render: (r) => <span aria-label={`${r.rating} out of 5`}>{'★'.repeat(r.rating)}<span className="text-slate-300">{'★'.repeat(5 - r.rating)}</span></span> },
            { key: 'comments', label: 'Comments' },
          ]} />
      )}
    </div>
  );
}
