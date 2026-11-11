import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { crudController } from './common/crud';
import * as D from './common/dtos';
import { ALL_ENTITIES, Branch, Candidate, Complaint, Employee, JobPosting, LeaveRequest, Objective, Review, TestQuestion, Training } from './entities';
import { ExtrasController } from './extras.controller';

const branches = crudController('branches', Branch, D.CreateBranchDto);
const employees = crudController('employees', Employee, D.CreateEmployeeDto, ['branch'], ['branchId', 'status', 'department']);
const objectives = crudController('objectives', Objective, D.CreateObjectiveDto, ['employee'], ['employeeId', 'date', 'status']);
const reviews = crudController('reviews', Review, D.CreateReviewDto, ['employee'], ['employeeId']);
const leave = crudController('leave-requests', LeaveRequest, D.CreateLeaveDto, ['employee'], ['employeeId', 'status']);
const jobs = crudController('job-postings', JobPosting, D.CreateJobDto, [], ['status']);
const candidates = crudController('candidates', Candidate, D.CreateCandidateDto, ['jobPosting'], ['jobPostingId', 'stage']);
const questions = crudController('test-questions', TestQuestion, D.CreateQuestionDto, [], ['jobPostingId']);
const trainings = crudController('trainings', Training, D.CreateTrainingDto);
const complaints = crudController('complaints', Complaint, D.CreateComplaintDto, ['employee'], ['status']);

const parts = [branches, employees, objectives, reviews, leave, jobs, candidates, questions, trainings, complaints];

const dbOptions: any = process.env.DATABASE_URL
  ? { type: 'postgres', url: process.env.DATABASE_URL }
  : { type: 'sqljs', location: 'hr.sqlite', autoSave: true };

@Module({
  imports: [TypeOrmModule.forRoot({ ...dbOptions, entities: ALL_ENTITIES, synchronize: true }), TypeOrmModule.forFeature(ALL_ENTITIES)],
  controllers: [...parts.map((p) => p.Ctrl), ExtrasController],
  providers: parts.map((p) => p.Service),
})
export class AppModule {}
