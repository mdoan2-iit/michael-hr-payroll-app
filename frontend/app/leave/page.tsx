'use client';
import ResourcePage from '@/components/ResourcePage';
import { Badge, Field } from '@/components/ui';
import { fullName, patch } from '@/lib/api';

const fields: Field[] = [
  { name: 'employeeId', label: 'Employee', type: 'select', numeric: true, required: true, optionsFrom: { endpoint: '/employees', label: (e: any) => `${e.firstName} ${e.lastName}` } },
  { name: 'type', label: 'Leave type', type: 'select', required: true, options: ['Annual', 'Sick', 'Maternity', 'Paternity', 'Unpaid', 'Other'] },
  { name: 'startDate', label: 'Start date', type: 'date', required: true }, { name: 'endDate', label: 'End date', type: 'date', required: true },
  { name: 'reason', label: 'Reason', type: 'textarea' },
];

const days = (r: any) => Math.round((+new Date(r.endDate) - +new Date(r.startDate)) / 86400000) + 1;

export default function Page() {
  return (
    <ResourcePage title="Leave & vacation" subtitle="Review applications and track their status." noun="leave request" endpoint="/leave-requests" fields={fields}
      filter={{ key: 'status', label: 'Status', options: ['Pending', 'Approved', 'Rejected'] }}
      columns={[
        { key: 'employee', label: 'Employee', render: (r) => fullName(r.employee) }, { key: 'type', label: 'Type' },
        { key: 'dates', label: 'Dates', render: (r) => <div>{r.startDate} to {r.endDate}<p className="text-xs text-slate-500">{days(r)} day(s)</p></div> },
        { key: 'reason', label: 'Reason' }, { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
      ]}
      rowActions={(r, reload) => r.status === 'Pending' && (
        <>
          <button className="btn-primary !px-2.5 !py-1" onClick={async () => { await patch(`/leave-requests/${r.id}/decision`, { status: 'Approved' }); reload(); }}>Approve</button>
          <button className="btn-danger !px-2.5 !py-1" onClick={async () => { await patch(`/leave-requests/${r.id}/decision`, { status: 'Rejected' }); reload(); }}>Reject</button>
        </>
      )} />
  );
}
