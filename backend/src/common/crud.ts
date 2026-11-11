import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, ValidationPipe, NotFoundException, Injectable, Type } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PartialType } from '@nestjs/mapped-types';
import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';

export const pipe = (cls: Type<any>) =>
  new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, expectedType: cls });

/** Builds a REST controller (GET list, GET one, POST, PATCH, DELETE) for an entity. */
export function crudController<T extends ObjectLiteral>(
  path: string, entity: Type<T>, CreateDto: Type<any>, relations: string[] = [], filterKeys: string[] = [],
) {
  const UpdateDto = PartialType(CreateDto);
  @Injectable() class Service { constructor(@InjectRepository(entity) public repo: Repository<T>) {} }
  @Controller(path) class Ctrl {
    constructor(public s: Service) {}
    @Get() list(@Query() q: Record<string, string>) {
      const where: any = {};
      for (const k of filterKeys) if (q[k] !== undefined && q[k] !== '') where[k] = isNaN(+q[k]) || k.endsWith('Name') ? q[k] : +q[k];
      return this.s.repo.find({ where: where as FindOptionsWhere<T>, relations, order: { id: 'DESC' } as any });
    }
    @Get(':id') async one(@Param('id', ParseIntPipe) id: number) {
      const row = await this.s.repo.findOne({ where: { id } as any, relations });
      if (!row) throw new NotFoundException(`${path} #${id} not found`);
      return row;
    }
    @Post() create(@Body(pipe(CreateDto)) dto: any) { return this.s.repo.save(this.s.repo.create(dto)); }
    @Patch(':id') async update(@Param('id', ParseIntPipe) id: number, @Body(pipe(UpdateDto as any)) dto: any) {
      const row = await this.s.repo.findOne({ where: { id } as any });
      if (!row) throw new NotFoundException(`${path} #${id} not found`);
      return this.s.repo.save({ ...row, ...dto });
    }
    @Delete(':id') async remove(@Param('id', ParseIntPipe) id: number) {
      const res = await this.s.repo.delete(id);
      if (!res.affected) throw new NotFoundException(`${path} #${id} not found`);
      return { deleted: true };
    }
  }
  return { Ctrl, Service };
}
