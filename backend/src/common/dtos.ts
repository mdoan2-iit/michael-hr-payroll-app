import { PartialType } from '@nestjs/mapped-types';
import { ArrayNotEmpty, IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CandidateStage, ComplaintStatus, EmployeeStatus, JobStatus, LeaveStatus, LeaveType, ObjectiveStatus } from '../entities';

export class CreateBranchDto {
  @IsString() @MinLength(2) name: string;
  @IsString() city: string;
  @IsOptional() @IsString() address?: string;
}

export class CreateEmployeeDto {
  @IsString() @MinLength(1) firstName: string;
  @IsString() @MinLength(1) lastName: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() jobTitle: string;
  @IsString() department: string;
  @IsOptional() @IsNumber() @Min(0) salary?: number;
  @IsOptional() @IsEnum(EmployeeStatus) status?: EmployeeStatus;
  @IsOptional() @IsDateString() hireDate?: string;
  @IsOptional() @IsInt() branchId?: number;
}

export class CreateObjectiveDto {
  @IsInt() employeeId: number;
  @IsDateString() date: string;
  @IsString() @MinLength(3) goal: string;
  @IsOptional() @IsEnum(ObjectiveStatus) status?: ObjectiveStatus;
  @IsOptional() @IsString() notes?: string;
}

export class CreateReviewDto {
  @IsInt() employeeId: number;
  @IsString() reviewer: string;
  @IsString() period: string;
  @IsInt() @Min(1) @Max(5) rating: number;
  @IsOptional() @IsString() comments?: string;
}

export class CreateLeaveDto {
  @IsInt() employeeId: number;
  @IsEnum(LeaveType) type: LeaveType;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
  @IsOptional() @IsString() reason?: string;
}

export class DecideLeaveDto {
  @IsEnum(LeaveStatus) status: LeaveStatus;
  @IsOptional() @IsString() decisionNote?: string;
}

export class CreateJobDto {
  @IsString() @MinLength(2) title: string;
  @IsString() department: string;
  @IsOptional() @IsInt() branchId?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(JobStatus) status?: JobStatus;
}

export class CreateCandidateDto {
  @IsString() @MinLength(2) fullName: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() phone?: string;
  @IsInt() jobPostingId: number;
  @IsOptional() @IsEnum(CandidateStage) stage?: CandidateStage;
  @IsOptional() @IsString() notes?: string;
}

export class CreateQuestionDto {
  @IsInt() jobPostingId: number;
  @IsString() @MinLength(3) question: string;
  @IsArray() @ArrayNotEmpty() @IsString({ each: true }) options: string[];
  @IsInt() @Min(0) correctIndex: number;
}

export class SubmitTestDto {
  /** answers[i] is the chosen option index for question with id = questionIds[i] */
  @IsArray() @ValidateNested({ each: true }) @Type(() => AnswerDto) answers: AnswerDto[];
}
export class AnswerDto { @IsInt() questionId: number; @IsInt() @Min(0) choice: number; }

export class CreateTrainingDto {
  @IsString() @MinLength(2) title: string;
  @IsOptional() @IsString() trainer?: string;
  @IsDateString() startDate: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsArray() @IsInt({ each: true }) attendeeIds?: number[];
}

export class ChecklistItemDto { @IsString() item: string; @IsBoolean() done: boolean; }
export class CreateExitDto {
  @IsInt() employeeId: number;
  @IsDateString() lastWorkingDay: string;
  @IsString() reason: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ChecklistItemDto) checklist?: ChecklistItemDto[];
}

export class CreateComplaintDto {
  @IsOptional() @IsInt() employeeId?: number;
  @IsString() @MinLength(3) subject: string;
  @IsString() @MinLength(5) details: string;
  @IsOptional() @IsEnum(ComplaintStatus) status?: ComplaintStatus;
  @IsOptional() @IsString() resolution?: string;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
