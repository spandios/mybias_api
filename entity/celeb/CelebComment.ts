import AbstractEntity from '../../interface/AbstractEntity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import Celeb from './Celeb';
import { User } from '../user/User';

@Entity()
class CelebComment extends AbstractEntity {
  @IsNotEmpty()
  @Column()
  comment: string;
  @IsNotEmpty()
  @ManyToOne(() => Celeb)
  celeb: Celeb;
  @IsNotEmpty()
  @ManyToOne(() => User)
  user: User;
}

export default CelebComment;
