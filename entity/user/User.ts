import AbstractEntity from '../../interface/AbstractEntity';
import { Column, Entity, OneToMany } from 'typeorm';
import Country from './Country';
import bcrypt from 'bcryptjs';
import CelebToUser from '../celeb/CelebToUser';
import Support from '../support/Support';
import CampaignComment from '../campaign/CampaignComment';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  SUPER = 'SUPER',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

@Entity()
export class User extends AbstractEntity {
  @OneToMany(() => CelebToUser, (celebToUser) => celebToUser.user)
  celebsToUser: CelebToUser[];

  @Column({ default: 0 })
  followCnt: number;

  @OneToMany(() => Support, (support) => support.user)
  supports: Support[];

  @Column({ default: 0 })
  supportCnt: number;

  @OneToMany(() => CampaignComment, (comment) => comment.user)
  comments: CampaignComment[];

  @Column()
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true, select: false })
  password: string;

  repeatPassword: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ nullable: true, select: false })
  providerId: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  defaultProfileColor: string;

  @Column((type) => Country)
  country: Country;

  @Column({ nullable: true })
  completeJoin: boolean;

  @Column({ nullable: true })
  birth: Date;

  validPassword(plain: string) {
    return bcrypt.compareSync(plain, this.password);
  }
}
