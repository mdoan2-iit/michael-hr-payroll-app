'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, del, patch, post } from '@/lib/api';
import { EntityForm, ErrorBanner, Field, Modal, PageHeader } from './ui';

export type Column = { key: string; label: string; render?: (row: any) => React.ReactNode };

type Props = {
  title?: string; subtitle?: string; noun: string; endpoint: string; columns: Column[]; fields: Field[];
  filter?: { key: string; label: string; options: string[] };
  rowActions?: (row: any, reload: () => void) => React.ReactNode;
  hideHeader?: boolean; readOnly?: boolean;
};

/** Reusable list + create/edit/delete screen backed by a REST endpoint. */
export default function ResourcePage({ title, subtitle, noun, endpoint, columns, fields, filter, rowActions, hideHeader }: Props) {
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<any | 'new' | null>(null);
  const [query, setQuery] = useState('');
  const [filterValue, setFilterValue] = useState('');

  const load = useCallback(async () => {
    setError('');
    try { setRows(await api(filter && filterValue ? `${endpoint}?${filter.key}=${encodeURIComponent(filterValue)}` : endpoint)); }
    catch (e: any) { setError(e.message); setRows([]); }
  }, [endpoint, filter, filterValue]);

  useEffect(() => { load(); }, [load]);

  const remove = async (row: any) => {
    if (!confirm(`Delete this ${noun}? This can't be undone.`)) return;
    try { await del(`${endpoint}/${row.id}`); load(); } catch (e: any) { setError(e.message); }
  };

  const visible = (rows ?? []).filter((r) => !query || JSON.stringify(r).toLowerCase().includes(query.toLowerCase()));
  const addBtn = <button className="btn-primary" onClick={() => setEditing('new')}>Add {noun}</button>;

  return (
    <div>
      {!hideHeader && title && <PageHeader title={title} subtitle={subtitle} action={addBtn} />}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input aria-label={`Search ${noun}s`} placeholder={`Search ${noun}s`} className="input max-w-xs" value={query} onChange={(e) => setQuery(e.target.value)} />
        {filter && (
          <select aria-label={filter.label} className="input w-auto" value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
            <option value="">{filter.label}: all</option>
            {filter.options.map((o) => <option key={o}>{o}</option>)}
          </select>
        )}
        {hideHeader && <div className="ml-auto">{addBtn}</div>}
      </div>
      {error && <ErrorBanner message={error} onRetry={load} />}

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-600">
            <tr>{columns.map((c) => <th key={c.key} className="px-4 py-3 font-medium">{c.label}</th>)}<th className="px-4 py-3 text-right font-medium">Actions</th></tr>
          </thead>
          <tbody>
            {rows === null && Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b border-line last:border-0"><td colSpan={columns.length + 1} className="px-4 py-3"><div className="h-4 animate-pulse rounded bg-slate-100" /></td></tr>
            ))}
            {rows !== null && !visible.length && !error && (
              <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-500">
                {rows.length ? `No ${noun}s match your search.` : `No ${noun}s yet. Select “Add ${noun}” to create the first one.`}</td></tr>
            )}
            {visible.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0 hover:bg-slate-50/60">
                {columns.map((c) => <td key={c.key} className="px-4 py-3 align-top">{c.render ? c.render(row) : row[c.key] ?? '-'}</td>)}
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {rowActions?.(row, load)}
                    <button className="btn-ghost !px-2.5 !py-1" onClick={() => setEditing(row)}>Edit</button>
                    <button className="btn-danger !px-2.5 !py-1" onClick={() => remove(row)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing === 'new' ? `Add ${noun}` : `Edit ${noun}`} onClose={() => setEditing(null)}>
          <EntityForm fields={fields} initial={editing === 'new' ? undefined : editing} submitLabel={editing === 'new' ? `Save ${noun}` : 'Save changes'}
            onCancel={() => setEditing(null)}
            onSubmit={async (payload) => {
              if (editing === 'new') await post(endpoint, payload); else await patch(`${endpoint}/${editing.id}`, payload);
              setEditing(null); load();
            }} />
        </Modal>
      )}
    </div>
  );
}
