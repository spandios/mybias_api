import { Request } from 'express';

export enum Direction {
  ASC = 'ASC',
  DESC = 'DESC',
}

export default class PageRequest {
  page = 1;
  limit?: number;
  skip: number;
  sort?: string | null = '';
  direction?: Direction;

  constructor(page: number, limit: number, sort?: string, direction?: Direction) {
    this.page = isNaN(page) ? 1 : page;
    this.limit = isNaN(limit) ? 10 : limit > 100 ? 100 : limit;
    this.sort = sort != null && sort != '' ? sort : '';
    this.skip = (this.page - 1) * this.limit;
    this.direction = direction;
  }
}

export function getPageRequest(req: Request): PageRequest {
  const { page, limit, sort, direction } = req.query;
  return new PageRequest(Number(page), Number(limit), sort as string, direction as Direction);
}
