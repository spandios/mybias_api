import { ManyToOne, Entity } from 'typeorm';
import Celeb from './Celeb';
import { User } from '../user/User';
import AbstractEntity from '../../interface/AbstractEntity';

@Entity()
export default class CelebToUser extends AbstractEntity {
  //User 삭제시 userId 칼럼 또한 삭제
  @ManyToOne(() => User, (user) => user.celebsToUser, { primary: true, onDelete: 'CASCADE' })
  user: User;

  //Celeb 삭제시 celebId 또한 삭제
  @ManyToOne(() => Celeb, (celeb) => celeb.celebsToUser, { primary: true, onDelete: 'CASCADE' })
  celeb: Celeb;
}
