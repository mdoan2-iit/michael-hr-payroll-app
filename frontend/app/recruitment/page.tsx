'use client';
import { useEffect, useState } from 'react';
import ResourcePage from '@/components/ResourcePage';
import { Badge, ErrorBanner, Field, Modal, PageHeader } from '@/components/ui';
import { api, post } from '@/lib/api';

const JOB = { endpoint: '/job-postings', label: (j: any) => `${j.title} (${j.department})` };
const STAGES = ['Applied', 'Screening', 'Testing', 'Interview', 'Offered', 'Hired', 'Rejected'];

const jobFields: Field[] = [
  { name: 'title', label: 'Job title', required: true }, { name: 'department', label: 'Department', required: true },
  { name: 'branchId', label: 'Branch', type: 'select', numeric: true, optionsFrom: { endpoint: '/branches', label: (b: any) => b.name } },
  { name: 'description', label: 'Description', type: 'textarea' }, { name: 'status', label: 'Status', type: 'select', options: ['Draft', 'Open', 'Closed'] },
];
const candidateFields: Field[] = [
  { name: 'fullName', label: 'Full name', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'phone', label: 'Phone' },
  { name: 'jobPostingId', label: 'Applying for', type: 'select', numeric: true, required: true, optionsFrom: JOB },
  { name: 'stage', label: 'Stage', type: 'select', options: STAGES }, { name: 'notes', label: 'Notes', type: 'textarea' },
];
const questionFields: Field[] = [
  { name: 'jobPostingId', label: 'Job', type: 'select', numeric: true, required: true, optionsFrom: JOB },
  { name: 'question', label: 'Question', type: 'textarea', required: true },
  { name: 'options', label: 'Answer options', type: 'lines', required: true, help: 'One option per line.' },
  { name: 'correctIndex', label: 'Correct option number', type: 'number', min: 0, required: true, help: 'Counting from 0: the first option is 0.' },
];

/** Candidate-facing CBT: loads the questions (without answers), submits, shows the auto-score. */
function TestModal({ candidate, onClose }: { candidate: any; onClose: () => void }) {
  const [qs, setQs] = useState<any[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  useEffect(() => { api(`/job-postings/${candidate.jobPostingId}/test`).then(setQs).catch((e) => { setError(e.message); setQs([]); }); }, [candidate]);

  const submit = async () => {
    if (qs && Object.keys(answers).length < qs.length) return setError('Answer every question before submitting.');
    try { setResult(await post(`/candidates/${candidate.id}/submit-test`, { answers: Object.entries(answers).map(([questionId, choice]) => ({ questionId: +questionId, choice })) })); setError(''); }
    catch (e: any) { setError(e.message); }
  };

  return (
    <Modal title={`Online test: ${candidate.fullName}`} onClose={onClose}>
      {error && <ErrorBanner message={error} />}
      {result ? (
        <div className="py-6 text-center"><p className="text-4xl font-semibold">{result.score}%</p><p className="mt-1 text-sm text-slate-600">{result.correct} of {result.total} correct</p>
          <button className="btn-primary mt-5" onClick={onClose}>Done</button></div>
      ) : qs === null ? <p className="text-sm text-slate-500">Loading questions…</p> : !qs.length && !error ? (
        <p className="text-sm text-slate-600">This job has no questions yet. Add some under the Test questions tab.</p>
      ) : (
        <div className="space-y-5">
          {qs.map((q, i) => (
            <fieldset key={q.id}><legend className="mb-2 text-sm font-medium">{i + 1}. {q.question}</legend>
              {q.options.map((o: string, k: number) => (
                <label key={k} className="flex items-center gap-2 py-1 text-sm"><input type="radio" name={`q${q.id}`} checked={answers[q.id] === k} onChange={() => setAnswers({ ...answers, [q.id]: k })} />{o}</label>
              ))}
            </fieldset>
          ))}
          {qs.length > 0 && <div className="flex justify-end"><button className="btn-primary" onClick={submit}>Submit test</button></div>}
        </div>
      )}
    </Modal>
  );
}

export default function Page() {
  const [tab, setTab] = useState<'jobs' | 'candidates' | 'questions'>('jobs');
  const [testing, setTesting] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const tabs = { jobs: 'Job postings', candidates: 'Candidates', questions: 'Test questions' } as const;
  return (
    <div>
      <PageHeader title="Recruitment" subtitle="Post jobs, track candidates, and run basic online tests." />
      <div role="tablist" className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(tabs) as (keyof typeof tabs)[]).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={tab === t ? 'btn-primary' : 'btn-ghost'}>{tabs[t]}</button>
        ))}
      </div>
      {msg && <div role="status" className="mb-3 rounded-md bg-brand-soft px-4 py-2 text-sm text-brand-dark">{msg}</div>}
      {tab === 'jobs' && <ResourcePage key="j" hideHeader noun="job posting" endpoint="/job-postings" fields={jobFields}
        filter={{ key: 'status', label: 'Status', options: ['Draft', 'Open', 'Closed'] }}
        columns={[{ key: 'title', label: 'Title' }, { key: 'department', label: 'Department' }, { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> }]} />}
      {tab === 'candidates' && <ResourcePage key="c" hideHeader noun="candidate" endpoint="/candidates" fields={candidateFields}
        filter={{ key: 'stage', label: 'Stage', options: STAGES }}
        columns={[
          { key: 'fullName', label: 'Candidate', render: (r) => <div><p className="font-medium">{r.fullName}</p><p className="text-xs text-slate-500">{r.email}</p></div> },
          { key: 'job', label: 'Applying for', render: (r) => r.jobPosting?.title ?? '-' },
          { key: 'stage', label: 'Stage', render: (r) => <Badge value={r.stage} /> },
          { key: 'testScore', label: 'Test score', render: (r) => (r.testScore == null ? 'Not taken' : `${r.testScore}%`) },
        ]}
        rowActions={(r, reload) => (
          <>
            <button className="btn-ghost !px-2.5 !py-1" onClick={() => setTesting(r)}>Take test</button>
            {r.stage !== 'Hired' && <button className="btn-primary !px-2.5 !py-1" onClick={async () => {
              try { await post(`/candidates/${r.id}/hire`); setMsg(`${r.fullName} was hired and added to Employees.`); reload(); } catch (e: any) { setMsg(e.message); }
            }}>Hire</button>}
          </>
        )} />}
      {tab === 'questions' && <ResourcePage key="q" hideHeader noun="question" endpoint="/test-questions" fields={questionFields}
        columns={[{ key: 'question', label: 'Question' }, { key: 'options', label: 'Options', render: (r) => r.options.map((o: string, i: number) => <div key={i} className={i === r.correctIndex ? 'font-medium text-brand-dark' : ''}>{i}. {o}</div>) }]} />}
      {testing && <TestModal candidate={testing} onClose={() => { setTesting(null); }} />}
    </div>
  );
}
