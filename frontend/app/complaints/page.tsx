'use client';
import ResourcePage from '@/components/ResourcePage';
import { Badge, Field } from '@/components/ui';
import { fullName } from '@/lib/api';

const fields: Field[] = [
  { name: 'employeeId', label: 'Raised by', type: 'select', numeric: true, optionsFrom: { endpoint: '/employees', label: (e: any) => `${e.firstName} ${e.lastName}` }, help: 'Leave empty for an anonymous complaint.' },
  { name: 'subject', label: 'Subject', required: true }, { name: 'details', label: 'Details', type: 'textarea', required: true },
  { name: 'status', label: 'Status', type: 'select', options: ['Open', 'Investigating', 'Resolved'] }, { name: 'resolution', label: 'Resolution', type: 'textarea' },
];

export default function Page() {
  return (
    <ResourcePage title="Complaints" subtitle="Log and resolve staff complaints." noun="complaint" endpoint="/complaints" fields={fields}
      filter={{ key: 'status', label: 'Status', options: ['Open', 'Investigating', 'Resolved'] }}
      columns={[
        { key: 'subject', label: 'Subject', render: (r) => <div><p className="font-medium">{r.subject}</p><p className="text-xs text-slate-500">{r.details}</p></div> },
        { key: 'employee', label: 'Raised by', render: (r) => (r.employee ? fullName(r.employee) : 'Anonymous') },
        { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
      ]} />
  );
}
