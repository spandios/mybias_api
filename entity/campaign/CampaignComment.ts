import AbstractEntity from '../../interface/AbstractEntity';
import { Column, Entity, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import Campaign from './Campaign';
import { User } from '../user/User';
import { IsNotEmpty } from 'class-validator';
@Entity()
export default class CampaignComment extends AbstractEntity {
  @IsNotEmpty()
  @Column()
  comment: string;
  @IsNotEmpty()
  @ManyToOne(() => Campaign, (campaign) => campaign.comments)
  campaign: Campaign;
  @IsNotEmpty()
  @ManyToOne(() => User)
  user: User;

  @Column({ default: false })
  isSupport: boolean;
}
