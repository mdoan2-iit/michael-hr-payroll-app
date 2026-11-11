import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum LeaveStatus { PENDING = 'Pending', APPROVED = 'Approved', REJECTED = 'Rejected' }
export enum LeaveType { ANNUAL = 'Annual', SICK = 'Sick', MATERNITY = 'Maternity', PATERNITY = 'Paternity', UNPAID = 'Unpaid', OTHER = 'Other' }
export enum EmployeeStatus { ACTIVE = 'Active', ON_LEAVE = 'On leave', EXITED = 'Exited' }
export enum ObjectiveStatus { OPEN = 'Open', DONE = 'Done', MISSED = 'Missed' }
export enum CandidateStage { APPLIED = 'Applied', SCREENING = 'Screening', TESTING = 'Testing', INTERVIEW = 'Interview', OFFERED = 'Offered', HIRED = 'Hired', REJECTED = 'Rejected' }
export enum JobStatus { DRAFT = 'Draft', OPEN = 'Open', CLOSED = 'Closed' }
export enum ComplaintStatus { OPEN = 'Open', INVESTIGATING = 'Investigating', RESOLVED = 'Resolved' }

@Entity() export class Branch {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column() city: string;
  @Column({ nullable: true }) address?: string;
  @OneToMany(() => Employee, (e) => e.branch) employees: Employee[];
}

@Entity() export class Employee {
  @PrimaryGeneratedColumn() id: number;
  @Column() firstName: string;
  @Column() lastName: string;
  @Column({ unique: true }) email: string;
  @Column({ nullable: true }) phone?: string;
  @Column() jobTitle: string;
  @Column() department: string;
  @Column({ type: 'float', default: 0 }) salary: number;
  @Column({ type: 'varchar', default: EmployeeStatus.ACTIVE }) status: EmployeeStatus;
  @Column({ type: 'varchar', nullable: true }) hireDate?: string;
  @Column({ nullable: true }) branchId?: number;
  @ManyToOne(() => Branch, (b) => b.employees, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branchId' }) branch?: Branch;
  @CreateDateColumn() createdAt: Date;
}

@Entity() export class Objective {
  @PrimaryGeneratedColumn() id: number;
  @Column() employeeId: number;
  @ManyToOne(() => Employee, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'employeeId' }) employee?: Employee;
  @Column() date: string;
  @Column() goal: string;
  @Column({ type: 'varchar', default: ObjectiveStatus.OPEN }) status: ObjectiveStatus;
  @Column({ nullable: true }) notes?: string;
}

@Entity() export class Review {
  @PrimaryGeneratedColumn() id: number;
  @Column() employeeId: number;
  @ManyToOne(() => Employee, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'employeeId' }) employee?: Employee;
  @Column() reviewer: string;
  @Column() period: string;
  @Column({ type: 'int' }) rating: number;
  @Column({ nullable: true }) comments?: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity() export class LeaveRequest {
  @PrimaryGeneratedColumn() id: number;
  @Column() employeeId: number;
  @ManyToOne(() => Employee, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'employeeId' }) employee?: Employee;
  @Column({ type: 'varchar' }) type: LeaveType;
  @Column() startDate: string;
  @Column() endDate: string;
  @Column({ nullable: true }) reason?: string;
  @Column({ type: 'varchar', default: LeaveStatus.PENDING }) status: LeaveStatus;
  @Column({ nullable: true }) decisionNote?: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity() export class JobPosting {
  @PrimaryGeneratedColumn() id: number;
  @Column() title: string;
  @Column() department: string;
  @Column({ nullable: true }) branchId?: number;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'varchar', default: JobStatus.OPEN }) status: JobStatus;
  @CreateDateColumn() createdAt: Date;
  @OneToMany(() => TestQuestion, (q) => q.jobPosting) questions: TestQuestion[];
  @OneToMany(() => Candidate, (c) => c.jobPosting) candidates: Candidate[];
}

@Entity() export class Candidate {
  @PrimaryGeneratedColumn() id: number;
  @Column() fullName: string;
  @Column() email: string;
  @Column({ nullable: true }) phone?: string;
  @Column() jobPostingId: number;
  @ManyToOne(() => JobPosting, (j) => j.candidates, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'jobPostingId' }) jobPosting?: JobPosting;
  @Column({ type: 'varchar', default: CandidateStage.APPLIED }) stage: CandidateStage;
  @Column({ type: 'int', nullable: true }) testScore?: number;
  @Column({ nullable: true }) notes?: string;
  @CreateDateColumn() createdAt: Date;
}

/** CBT question. Options are stored as a JSON string; correctIndex is hidden from candidates. */
@Entity() export class TestQuestion {
  @PrimaryGeneratedColumn() id: number;
  @Column() jobPostingId: number;
  @ManyToOne(() => JobPosting, (j) => j.questions, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'jobPostingId' }) jobPosting?: JobPosting;
  @Column() question: string;
  @Column({ type: 'simple-json' }) options: string[];
  @Column({ type: 'int' }) correctIndex: number;
}

@Entity() export class Training {
  @PrimaryGeneratedColumn() id: number;
  @Column() title: string;
  @Column({ nullable: true }) trainer?: string;
  @Column() startDate: string;
  @Column({ nullable: true }) endDate?: string;
  @Column({ nullable: true }) location?: string;
  @Column({ type: 'simple-json', default: '[]' }) attendeeIds: number[];
}

@Entity() export class ExitRecord {
  @PrimaryGeneratedColumn() id: number;
  @Column() employeeId: number;
  @ManyToOne(() => Employee, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'employeeId' }) employee?: Employee;
  @Column() lastWorkingDay: string;
  @Column() reason: string;
  @Column({ type: 'simple-json' }) checklist: { item: string; done: boolean }[];
  @CreateDateColumn() createdAt: Date;
}

@Entity() export class Complaint {
  @PrimaryGeneratedColumn() id: number;
  @Column({ nullable: true }) employeeId?: number;
  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'employeeId' }) employee?: Employee;
  @Column() subject: string;
  @Column({ type: 'text' }) details: string;
  @Column({ type: 'varchar', default: ComplaintStatus.OPEN }) status: ComplaintStatus;
  @Column({ nullable: true }) resolution?: string;
  @CreateDateColumn() createdAt: Date;
}

export const ALL_ENTITIES = [Branch, Employee, Objective, Review, LeaveRequest, JobPosting, Candidate, TestQuestion, Training, ExitRecord, Complaint];
