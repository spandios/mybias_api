import PageRequest from './PageRequest';

export default class Page<T> {
  content: T[];
  totalCnt: number;
  page: number;
  prev: boolean;
  next: boolean;
  limit?: number;
  sort?: string;

  constructor(content: T[], totalCnt: number, { page, limit, sort }: PageRequest) {
    this.content = content;
    this.totalCnt = totalCnt;
    this.page = page;
    this.prev = page !== 1;
    this.next = page * limit < totalCnt;
    this.limit = limit;
    this.sort = sort;
  }
}
