import { Column, Entity, ManyToOne } from 'typeorm';
import AbstractEntity from '../../interface/AbstractEntity';
import Celeb from './Celeb';
import { IsNotEmpty } from 'class-validator';
@Entity()
class CelebNotice extends AbstractEntity {
  @Column({ default: '', nullable: true })
  title: string;

  @IsNotEmpty()
  @Column('text')
  content: string;

  @IsNotEmpty()
  @ManyToOne(() => Celeb, (celeb) => celeb.notices, { onDelete: 'CASCADE' })
  celeb: Celeb;

  constructor(title: string, content: string, celeb: Celeb) {
    super();
    this.title = title;
    this.content = content;
    this.celeb = celeb;
  }
}
export default CelebNotice;
