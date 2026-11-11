'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export type Field = {
  name: string; label: string; type?: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'lines' | 'multi';
  required?: boolean; options?: string[]; optionsFrom?: { endpoint: string; label: (r: any) => string };
  min?: number; max?: number; numeric?: boolean; help?: string;
};

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-semibold">{title}</h1>{subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}</div>
      {action}
    </div>
  );
}

export const ErrorBanner = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
    <span>{message}</span>{onRetry && <button className="btn-ghost" onClick={onRetry}>Try again</button>}
  </div>
);

const tone: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800', Approved: 'bg-emerald-100 text-emerald-800', Rejected: 'bg-red-100 text-red-800',
  Active: 'bg-emerald-100 text-emerald-800', 'On leave': 'bg-amber-100 text-amber-800', Exited: 'bg-slate-200 text-slate-700',
  Open: 'bg-sky-100 text-sky-800', Done: 'bg-emerald-100 text-emerald-800', Missed: 'bg-red-100 text-red-800',
  Hired: 'bg-emerald-100 text-emerald-800', Closed: 'bg-slate-200 text-slate-700', Resolved: 'bg-emerald-100 text-emerald-800',
  Investigating: 'bg-amber-100 text-amber-800', Draft: 'bg-slate-200 text-slate-700',
};
export const Badge = ({ value }: { value?: string }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tone[value ?? ''] ?? 'bg-brand-soft text-brand-dark'}`}>{value ?? '-'}</span>
);

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-xl bg-white p-5 shadow-xl sm:rounded-xl">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-slate-500 hover:bg-slate-100">✕</button></div>
        {children}
      </div>
    </div>
  );
}

/** Generic validated form. Validates required, email, number ranges before calling onSubmit. */
export function EntityForm({ fields, initial, submitLabel, onSubmit, onCancel }: {
  fields: Field[]; initial?: any; submitLabel: string; onSubmit: (payload: any) => Promise<void>; onCancel: () => void;
}) {
  const toForm = (init: any) => Object.fromEntries(fields.map((f) => {
    const v = init?.[f.name];
    if (f.type === 'lines') return [f.name, Array.isArray(v) ? v.join('\n') : ''];
    if (f.type === 'multi') return [f.name, Array.isArray(v) ? v : []];
    return [f.name, v ?? ''];
  }));
  const [values, setValues] = useState<any>(() => toForm(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lookups, setLookups] = useState<Record<string, { value: any; label: string }[]>>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fields.filter((f) => f.optionsFrom).forEach(async (f) => {
      try {
        const rows = await api(f.optionsFrom!.endpoint);
        setLookups((l) => ({ ...l, [f.name]: rows.map((r: any) => ({ value: r.id, label: f.optionsFrom!.label(r) })) }));
      } catch { /* shown as empty select */ }
    });
  }, [fields]);

  const validate = () => {
    const e: Record<string, string> = {};
    for (const f of fields) {
      const v = values[f.name];
      const empty = v === '' || v == null || (Array.isArray(v) && !v.length);
      if (f.required && empty) e[f.name] = `${f.label} is required`;
      else if (!empty && f.type === 'email' && !/^\S+@\S+\.\S+$/.test(v)) e[f.name] = 'Enter a valid email address';
      else if (!empty && f.type === 'number' && (isNaN(+v) || (f.min != null && +v < f.min) || (f.max != null && +v > f.max)))
        e[f.name] = f.min != null && f.max != null ? `Enter a number from ${f.min} to ${f.max}` : 'Enter a valid number';
    }
    if (values.startDate && values.endDate && values.endDate < values.startDate) e.endDate = 'End date must be on or after the start date';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const payload: any = {};
    for (const f of fields) {
      const v = values[f.name];
      if (v === '' || v == null) continue;
      if (f.type === 'number' || f.numeric) payload[f.name] = Number(v);
      else if (f.type === 'lines') payload[f.name] = String(v).split('\n').map((s) => s.trim()).filter(Boolean);
      else payload[f.name] = v;
    }
    setBusy(true); setFormError('');
    try { await onSubmit(payload); } catch (err: any) { setFormError(err.message); } finally { setBusy(false); }
  };

  const set = (n: string, v: any) => setValues((s: any) => ({ ...s, [n]: v }));

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      {formError && <ErrorBanner message={formError} />}
      {fields.map((f) => {
        const id = `f-${f.name}`; const err = errors[f.name];
        const cls = `input ${err ? 'input-error' : ''}`;
        const opts = f.optionsFrom ? lookups[f.name] ?? [] : (f.options ?? []).map((o) => ({ value: o, label: o }));
        return (
          <div key={f.name}>
            <label htmlFor={id} className="mb-1 block text-sm font-medium">{f.label}{f.required && <span className="text-red-600"> *</span>}</label>
            {f.type === 'textarea' || f.type === 'lines' ? (
              <textarea id={id} rows={f.type === 'lines' ? 4 : 3} className={cls} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} />
            ) : f.type === 'select' ? (
              <select id={id} className={cls} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)}>
                <option value="">{f.required ? 'Select…' : 'None'}</option>
                {opts.map((o) => <option key={String(o.value)} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === 'multi' ? (
              <div id={id} className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-line p-2">
                {opts.map((o) => (
                  <label key={String(o.value)} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={values[f.name].includes(o.value)}
                      onChange={(e) => set(f.name, e.target.checked ? [...values[f.name], o.value] : values[f.name].filter((x: any) => x !== o.value))} />{o.label}
                  </label>
                ))}
              </div>
            ) : (
              <input id={id} type={f.type ?? 'text'} step={f.type === 'number' ? 'any' : undefined} className={cls} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} />
            )}
            {f.help && !err && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
            {err && <p className="mt-1 text-xs text-red-700">{err}</p>}
          </div>
        );
      })}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
      </div>
    </form>
  );
}
