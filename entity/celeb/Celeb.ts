import { Column, Entity, OneToMany, ManyToMany } from 'typeorm';
import CelebImage from './CelebImage';
import CelebToUser from './CelebToUser';
import Campaign from '../campaign/Campaign';
import CelebNotice from './CelebNotice';
import AbstractPriorityEntity from '../../interface/AbstractPriorityEntity';

@Entity()
class Celeb extends AbstractPriorityEntity {
  @Column()
  name: string;

  @Column({ type: 'int', default: 0 })
  followCnt: number;

  @OneToMany(() => Campaign, (campaign) => campaign.celeb)
  campaigns: Campaign[];

  @OneToMany(() => CelebToUser, (celebToUser) => celebToUser.celeb)
  celebsToUser: CelebToUser[];

  @Column({ default: '' })
  profileImage: string;

  @OneToMany(() => CelebImage, (image) => image.celeb, { cascade: true, eager: true })
  images: CelebImage[];

  @OneToMany(() => CelebNotice, (notice) => notice.celeb)
  notices: CelebNotice[];
}
export default Celeb;
