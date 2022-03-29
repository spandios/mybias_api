import { getRepository } from 'typeorm';
import PageRequest from '../interface/Page/PageRequest';
import Campaign from '../entity/campaign/Campaign';
import Page from '../interface/Page/Page';
import { ObjectType } from 'typeorm/common/ObjectType';
import moment from 'moment';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { types } from 'node-sass';
import { BadRequestException, NotFoundException } from '../error/Error';

enum PriorityType {
  UP = 'UP',
  DOWN = 'DOWN',
}

export default class CommonService {
  static changePriority(parentId: number, type: PriorityType): void {
    if (type == PriorityType.UP) {
    } else if (type == PriorityType.DOWN) {
    }
  }

  static async findById<T>(entity: ObjectType<T>, id: number, relations?: string[]): Promise<T> {
    const item =
      relations && relations.length > 0
        ? await getRepository(entity).findOne(id, { relations: relations })
        : await getRepository(entity).findOne(id);
    if (!item) throw new BadRequestException(`Not Founded [${entity.name}-${id}]`);
    return item;
  }

  static async paging<T>(
    entity: ObjectType<T>,
    pageRequest: PageRequest,
    relations?: string[],
    wheres?: string[],
    priorityOrder?: boolean,
  ): Promise<Page<T>> {
    try {
      const baseQuery: SelectQueryBuilder<T> = getRepository(entity)
        .createQueryBuilder('t')
        .where('t.active = :active', { active: true })
        .take(pageRequest.limit)
        .skip(pageRequest.skip);

      if (wheres && wheres.length > 0)
        for (let i = 0; i < wheres.length; i++) {
          if (i === 0) {
            baseQuery.andWhere(wheres[i]);
          } else {
            baseQuery.andWhere(wheres[i]);
          }
        }

      if (relations && relations.length > 0)
        relations.forEach((relation) => {
          baseQuery.innerJoinAndSelect(`t.${relation}`, relation);
        });

      if (priorityOrder) {
        baseQuery.orderBy(`t.priority`, 'DESC');
      } else {
        if (pageRequest.sort && pageRequest.direction) {
          baseQuery.orderBy(`t.${pageRequest.sort}`, pageRequest.direction);
        } else {
          baseQuery.orderBy(`t.createdAt`, 'DESC');
        }
      }

      const count = await getRepository(entity).count();
      let data = await baseQuery.getMany();
      data = data.map((result: any) => {
        result.createdAt = this.datetimeWithFormat(result.createdAt);
        result.updatedAt = this.datetimeWithFormat(result.updatedAt);
        return result;
      });
      return new Page<T>(data, count, pageRequest);
    } catch (err) {
      throw new Error(err);
    }
  }

  static async PagingAnd<T>(
    entity: ObjectType<T>,
    pageRequest: PageRequest,
    relations?: string[],
    where?: [],
  ): Promise<SelectQueryBuilder<T>> {
    const baseQuery: SelectQueryBuilder<T> = getRepository(entity)
      .createQueryBuilder('t')
      .take(pageRequest.limit)
      .skip(pageRequest.skip)
      .where('user.id = :id', { id: 1 });

    if (relations && relations.length > 0) {
      relations.forEach((relation) => {
        baseQuery.innerJoinAndSelect(`t.${relation}`, relation);
      });
    }

    if (pageRequest.sort && pageRequest.direction) {
      baseQuery.orderBy(`t.${pageRequest.sort}`, pageRequest.direction);
    } else {
      baseQuery.orderBy(`t.createdAt`, 'DESC');
    }

    return baseQuery;
  }

  static dateWithFormat(date: Date): string {
    return moment(date).format('ll');
  }

  static datetimeWithFormat(date: Date): string {
    return moment(date).format('lll');
  }

  static addMinute(date: Date, addMiniute: number): Date {
    return moment(date).add(addMiniute, 'm').toDate();
  }

  static addHour(date: Date, addHour: number): Date {
    return moment(date).add(addHour, 'h').toDate();
  }

  static addDay(date: Date, addDay: number): Date {
    return moment(date).add(addDay, 'd').toDate();
  }

  static addWeek(date: Date, addWeek: number): Date {
    return moment(date).add(addWeek, 'w').toDate();
  }

  static addMonth(date: Date, addMonth: number): Date {
    return moment(date).add(addMonth, 'm').toDate();
  }

  static getParamsId(req: any): number {
    if (!req) throw new NotFoundException();
    const id = Number(req.params.id);
    if (isNaN(id)) throw new BadRequestException('Invalid id number');
    return id;
  }

  static getParamsIdByName(req: any, paramName: string): number {
    if (!req) throw new NotFoundException();
    const id = Number(req.params[paramName]);
    if (isNaN(id)) throw new BadRequestException('Invalid id number');
    return id;
  }

  static getQuery(req: any, paramName: string): number {
    if (!req) throw new NotFoundException();
    const query = Number(req.query[paramName]);
    if (isNaN(query)) throw new BadRequestException('Invalid id number');
    return query;
  }
}
