'use client';
import { useCallback, useEffect, useState } from 'react';
import { EntityForm, ErrorBanner, Field, Modal, PageHeader } from '@/components/ui';
import { api, del, fullName, patch, post } from '@/lib/api';

const fields: Field[] = [
  { name: 'employeeId', label: 'Employee', type: 'select', numeric: true, required: true, optionsFrom: { endpoint: '/employees', label: (e: any) => `${e.firstName} ${e.lastName}` } },
  { name: 'lastWorkingDay', label: 'Last working day', type: 'date', required: true }, { name: 'reason', label: 'Reason for leaving', required: true },
];

export default function Page() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try { setRows(await api('/exit-records')); } catch (e: any) { setError(e.message); setRows([]); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (rec: any, i: number, done: boolean) => {
    try { await patch(`/exit-records/${rec.id}/checklist/${i}`, { done }); load(); } catch (e: any) { setError(e.message); }
  };

  return (
    <div>
      <PageHeader title="Offboarding" subtitle="Track the exit checklist for each departing employee." action={<button className="btn-primary" onClick={() => setAdding(true)}>Start offboarding</button>} />
      {error && <ErrorBanner message={error} onRetry={load} />}
      {rows === null && <div className="h-24 animate-pulse rounded-lg bg-white" />}
      {rows?.length === 0 && !error && <p className="rounded-lg border border-line bg-white px-4 py-10 text-center text-slate-500">No one is being offboarded. Select “Start offboarding” when an employee resigns or is let go.</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        {rows?.map((rec) => {
          const done = rec.checklist.filter((c: any) => c.done).length;
          return (
            <section key={rec.id} className="rounded-lg border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div><h2 className="font-semibold">{fullName(rec.employee)}</h2><p className="text-sm text-slate-600">Leaving {rec.lastWorkingDay}: {rec.reason}</p></div>
                <button className="btn-danger !px-2.5 !py-1" onClick={async () => { if (confirm('Remove this offboarding record?')) { await del(`/exit-records/${rec.id}`); load(); } }}>Remove</button>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded bg-slate-100" role="progressbar" aria-valuenow={done} aria-valuemax={rec.checklist.length} aria-label="Checklist progress">
                <div className="h-full bg-brand" style={{ width: `${(done / rec.checklist.length) * 100}%` }} /></div>
              <p className="mt-1 text-xs text-slate-500">{done} of {rec.checklist.length} complete{done === rec.checklist.length && ' · employee marked as exited'}</p>
              <ul className="mt-3 space-y-1.5">
                {rec.checklist.map((c: any, i: number) => (
                  <li key={i}><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={c.done} onChange={(e) => toggle(rec, i, e.target.checked)} />
                    <span className={c.done ? 'text-slate-400 line-through' : ''}>{c.item}</span></label></li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      {adding && <Modal title="Start offboarding" onClose={() => setAdding(false)}>
        <EntityForm fields={fields} submitLabel="Start offboarding" onCancel={() => setAdding(false)} onSubmit={async (p) => { await post('/exit-records', p); setAdding(false); load(); }} />
      </Modal>}
    </div>
  );
}
