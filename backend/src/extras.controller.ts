import { BadRequestException, Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { pipe } from './common/crud';
import { CreateExitDto, DecideLeaveDto, SubmitTestDto } from './common/dtos';
import { Candidate, CandidateStage, Complaint, Employee, EmployeeStatus, ExitRecord, JobPosting, LeaveRequest, LeaveStatus, TestQuestion, ComplaintStatus } from './entities';

const DEFAULT_CHECKLIST = ['Return laptop and equipment', 'Return ID card and keys', 'Revoke system access', 'Clear outstanding payments', 'Exit interview completed', 'Final pay processed'];

@Controller()
export class ExtrasController {
  constructor(
    @InjectRepository(LeaveRequest) private leaves: Repository<LeaveRequest>,
    @InjectRepository(Employee) private employees: Repository<Employee>,
    @InjectRepository(Candidate) private candidates: Repository<Candidate>,
    @InjectRepository(TestQuestion) private questions: Repository<TestQuestion>,
    @InjectRepository(JobPosting) private jobs: Repository<JobPosting>,
    @InjectRepository(ExitRecord) private exits: Repository<ExitRecord>,
    @InjectRepository(Complaint) private complaints: Repository<Complaint>,
  ) {}

  /* ---- Leave: approve / reject ---- */
  @Patch('leave-requests/:id/decision')
  async decide(@Param('id', ParseIntPipe) id: number, @Body(pipe(DecideLeaveDto)) dto: DecideLeaveDto) {
    const leave = await this.leaves.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave request not found');
    leave.status = dto.status;
    leave.decisionNote = dto.decisionNote;
    return this.leaves.save(leave);
  }

  /* ---- CBT ---- */
  /** Questions for a job's test, with the answer key removed. */
  @Get('job-postings/:id/test')
  async test(@Param('id', ParseIntPipe) id: number) {
    const qs = await this.questions.find({ where: { jobPostingId: id }, order: { id: 'ASC' } });
    return qs.map(({ correctIndex, ...q }) => q);
  }

  /** Auto-scores a candidate's answers (0-100), stores it and moves them to the Testing stage. */
  @Post('candidates/:id/submit-test')
  async submit(@Param('id', ParseIntPipe) id: number, @Body(pipe(SubmitTestDto)) dto: SubmitTestDto) {
    const cand = await this.candidates.findOne({ where: { id } });
    if (!cand) throw new NotFoundException('Candidate not found');
    const qs = await this.questions.find({ where: { jobPostingId: cand.jobPostingId } });
    if (!qs.length) throw new BadRequestException('This job has no test questions yet');
    const correct = qs.filter((q) => dto.answers.find((a) => a.questionId === q.id)?.choice === q.correctIndex).length;
    cand.testScore = Math.round((correct / qs.length) * 100);
    if (cand.stage === CandidateStage.APPLIED || cand.stage === CandidateStage.SCREENING) cand.stage = CandidateStage.TESTING;
    await this.candidates.save(cand);
    return { score: cand.testScore, correct, total: qs.length };
  }

  /** Hiring a candidate turns them into an employee record. */
  @Post('candidates/:id/hire')
  async hire(@Param('id', ParseIntPipe) id: number) {
    const cand = await this.candidates.findOne({ where: { id }, relations: ['jobPosting'] });
    if (!cand) throw new NotFoundException('Candidate not found');
    if (cand.stage === CandidateStage.HIRED) throw new BadRequestException('Candidate is already hired');
    const [first, ...rest] = cand.fullName.trim().split(' ');
    const emp = await this.employees.save(this.employees.create({
      firstName: first, lastName: rest.join(' ') || '-', email: cand.email, phone: cand.phone,
      jobTitle: cand.jobPosting?.title ?? 'New hire', department: cand.jobPosting?.department ?? 'General',
      branchId: cand.jobPosting?.branchId, hireDate: new Date().toISOString().slice(0, 10),
    }));
    cand.stage = CandidateStage.HIRED;
    await this.candidates.save(cand);
    return emp;
  }

  /* ---- Exit / offboarding ---- */
  @Get('exit-records') listExits() { return this.exits.find({ relations: ['employee'], order: { id: 'DESC' } }); }

  @Post('exit-records')
  async startExit(@Body(pipe(CreateExitDto)) dto: CreateExitDto) {
    const emp = await this.employees.findOne({ where: { id: dto.employeeId } });
    if (!emp) throw new NotFoundException('Employee not found');
    return this.exits.save(this.exits.create({
      ...dto, checklist: dto.checklist?.length ? dto.checklist : DEFAULT_CHECKLIST.map((item) => ({ item, done: false })),
    }));
  }

  @Patch('exit-records/:id/checklist/:index')
  async toggle(@Param('id', ParseIntPipe) id: number, @Param('index', ParseIntPipe) index: number, @Body() body: { done: boolean }) {
    const rec = await this.exits.findOne({ where: { id } });
    if (!rec || !rec.checklist[index]) throw new NotFoundException('Checklist item not found');
    rec.checklist[index].done = !!body.done;
    await this.exits.save(rec);
    // When everything is ticked off, mark the employee as exited.
    if (rec.checklist.every((c) => c.done)) await this.employees.update(rec.employeeId, { status: EmployeeStatus.EXITED });
    return rec;
  }

  @Delete('exit-records/:id')
  async deleteExit(@Param('id', ParseIntPipe) id: number) { await this.exits.delete(id); return { deleted: true }; }

  /* ---- Dashboard ---- */
  @Get('dashboard')
  async dashboard() {
    const [employees, pendingLeave, openJobs, activeCandidates, openComplaints, exitsInProgress] = await Promise.all([
      this.employees.count({ where: { status: EmployeeStatus.ACTIVE } }),
      this.leaves.count({ where: { status: LeaveStatus.PENDING } }),
      this.jobs.count({ where: { status: 'Open' as any } }),
      this.candidates.createQueryBuilder('c').where('c.stage NOT IN (:...s)', { s: ['Hired', 'Rejected'] }).getCount(),
      this.complaints.count({ where: [{ status: ComplaintStatus.OPEN }, { status: ComplaintStatus.INVESTIGATING }] }),
      this.exits.count(),
    ]);
    return { employees, pendingLeave, openJobs, activeCandidates, openComplaints, exitsInProgress };
  }
}
