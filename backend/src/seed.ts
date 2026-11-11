import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ALL_ENTITIES, Branch, Candidate, Employee, JobPosting, LeaveRequest, Objective, Review, TestQuestion, Training } from './entities';

(async () => {
  const ds = await new DataSource((process.env.DATABASE_URL
    ? { type: 'postgres', url: process.env.DATABASE_URL }
    : { type: 'sqljs', location: 'hr.sqlite', autoSave: true }) as any as any).setOptions({ entities: ALL_ENTITIES, synchronize: true } as any).initialize();

  if (await ds.getRepository(Branch).count()) { console.log('Database already has data - skipping seed.'); return; }
  const b = await ds.getRepository(Branch).save([{ name: 'Head Office', city: 'Lagos' }, { name: 'Abuja Branch', city: 'Abuja' }, { name: 'Port Harcourt Branch', city: 'Port Harcourt' }]);
  const e = await ds.getRepository(Employee).save([
    { firstName: 'Amaka', lastName: 'Obi', email: 'amaka.obi@tropical.test', jobTitle: 'HR Manager', department: 'Human Resources', salary: 450000, branchId: b[0].id, hireDate: '2021-03-01' },
    { firstName: 'Tunde', lastName: 'Bello', email: 'tunde.bello@tropical.test', jobTitle: 'Sales Lead', department: 'Sales', salary: 380000, branchId: b[1].id, hireDate: '2022-07-15' },
    { firstName: 'Ngozi', lastName: 'Eze', email: 'ngozi.eze@tropical.test', jobTitle: 'Accountant', department: 'Finance', salary: 320000, branchId: b[0].id, hireDate: '2023-01-10' },
    { firstName: 'Ibrahim', lastName: 'Musa', email: 'ibrahim.musa@tropical.test', jobTitle: 'Warehouse Supervisor', department: 'Logistics', salary: 270000, branchId: b[2].id, hireDate: '2020-11-02' },
  ]);
  const today = new Date().toISOString().slice(0, 10);
  await ds.getRepository(Objective).save([{ employeeId: e[1].id, date: today, goal: 'Close 3 pending wholesale orders' }, { employeeId: e[2].id, date: today, goal: 'Reconcile weekly branch ledgers' }]);
  await ds.getRepository(Review).save([{ employeeId: e[1].id, reviewer: 'Amaka Obi', period: 'Q3 2026', rating: 4, comments: 'Consistently exceeds targets.' }]);
  await ds.getRepository(LeaveRequest).save([{ employeeId: e[3].id, type: 'Annual' as any, startDate: '2026-12-15', endDate: '2026-12-29', reason: 'Year-end family trip' }]);
  const j = await ds.getRepository(JobPosting).save({ title: 'Customer Support Agent', department: 'Sales', description: 'Handle customer enquiries across channels.', branchId: b[0].id });
  await ds.getRepository(TestQuestion).save([
    { jobPostingId: j.id, question: 'A customer is angry about a late delivery. What do you do first?', options: ['Argue the facts', 'Acknowledge and apologise, then investigate', 'Transfer them immediately', 'Ignore the message'], correctIndex: 1 },
    { jobPostingId: j.id, question: 'Which channel is best for sharing a detailed order invoice?', options: ['Email', 'Social media comment', 'Voice note', 'Phone call'], correctIndex: 0 },
  ]);
  await ds.getRepository(Candidate).save({ fullName: 'Chidi Okafor', email: 'chidi@example.com', jobPostingId: j.id });
  await ds.getRepository(Training).save({ title: 'Customer Service Excellence', trainer: 'External consultant', startDate: '2026-11-10', endDate: '2026-11-11', location: 'Head Office', attendeeIds: [e[1].id, e[2].id] });
  console.log('Seeded.');
})();
