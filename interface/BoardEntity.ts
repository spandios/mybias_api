import AbstractEntity from './AbstractEntity';
import { Column } from 'typeorm';

export default abstract class BoardEntity extends AbstractEntity {
  @Column()
  title: string;
  @Column('text')
  content: string;
}

export enum BoardType {
  NOTICE = 'Notice',
  TOS = 'Tos',
  FAQ = 'Faq',
}
