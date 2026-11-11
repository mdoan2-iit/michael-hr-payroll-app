'use client';
import ResourcePage from '@/components/ResourcePage';
import { Field } from '@/components/ui';

const fields: Field[] = [{ name: 'name', label: 'Branch name', required: true }, { name: 'city', label: 'City', required: true }, { name: 'address', label: 'Address' }];

export default function Page() {
  return (
    <ResourcePage title="Branches" subtitle="Locations that employees are assigned to." noun="branch" endpoint="/branches" fields={fields}
      columns={[{ key: 'name', label: 'Branch' }, { key: 'city', label: 'City' }, { key: 'address', label: 'Address' }]} />
  );
}
