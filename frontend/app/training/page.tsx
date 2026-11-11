'use client';
import ResourcePage from '@/components/ResourcePage';
import { Field } from '@/components/ui';

const fields: Field[] = [
  { name: 'title', label: 'Programme title', required: true }, { name: 'trainer', label: 'Trainer' },
  { name: 'startDate', label: 'Start date', type: 'date', required: true }, { name: 'endDate', label: 'End date', type: 'date' },
  { name: 'location', label: 'Location' },
  { name: 'attendeeIds', label: 'Attendees', type: 'multi', numeric: true, optionsFrom: { endpoint: '/employees', label: (e: any) => `${e.firstName} ${e.lastName}` } },
];

export default function Page() {
  return (
    <ResourcePage title="Training" subtitle="Programmes and who is attending." noun="training" endpoint="/trainings" fields={fields}
      columns={[
        { key: 'title', label: 'Programme' }, { key: 'trainer', label: 'Trainer' },
        { key: 'dates', label: 'Dates', render: (r) => r.endDate ? `${r.startDate} to ${r.endDate}` : r.startDate },
        { key: 'location', label: 'Location' }, { key: 'attendees', label: 'Attendees', render: (r) => r.attendeeIds?.length ?? 0 },
      ]} />
  );
}
