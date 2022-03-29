import { Column } from 'typeorm';
import AbstractPrirotyEntity from './AbstractPriorityEntity';
export default abstract class AbstractImageEntity extends AbstractPrirotyEntity {
  @Column()
  url: string;

  constructor(url: string) {
    super();
    this.url = url;
  }
}
