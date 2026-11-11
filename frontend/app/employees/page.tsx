'use client';
import ResourcePage from '@/components/ResourcePage';
import { Badge, Field } from '@/components/ui';
import { fullName } from '@/lib/api';

const fields: Field[] = [
  { name: 'firstName', label: 'First name', required: true }, { name: 'lastName', label: 'Last name', required: true },
  { name: 'email', label: 'Work email', type: 'email', required: true }, { name: 'phone', label: 'Phone' },
  { name: 'jobTitle', label: 'Job title', required: true }, { name: 'department', label: 'Department', required: true },
  { name: 'branchId', label: 'Branch', type: 'select', numeric: true, optionsFrom: { endpoint: '/branches', label: (b: any) => `${b.name} (${b.city})` } },
  { name: 'salary', label: 'Monthly salary', type: 'number', min: 0 }, { name: 'hireDate', label: 'Hire date', type: 'date' },
  { name: 'status', label: 'Status', type: 'select', options: ['Active', 'On leave', 'Exited'] },
];

export default function Page() {
  return (
    <ResourcePage title="Employees" subtitle="Staff profiles and branch assignments across all locations." noun="employee" endpoint="/employees" fields={fields}
      filter={{ key: 'status', label: 'Status', options: ['Active', 'On leave', 'Exited'] }}
      columns={[
        { key: 'name', label: 'Name', render: (r) => <div><p className="font-medium">{fullName(r)}</p><p className="text-xs text-slate-500">{r.email}</p></div> },
        { key: 'jobTitle', label: 'Role', render: (r) => <div>{r.jobTitle}<p className="text-xs text-slate-500">{r.department}</p></div> },
        { key: 'branch', label: 'Branch', render: (r) => r.branch?.name ?? '-' },
        { key: 'salary', label: 'Salary', render: (r) => Number(r.salary).toLocaleString() },
        { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
      ]} />
  );
}
