import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import Celeb from '../celeb/Celeb';
import CampaignImage from './CampaignImage';
import { BadRequestException } from '../../error/Error';
import AbstractPriorityEntity from '../../interface/AbstractPriorityEntity';
import Support from '../support/Support';
import CampaignCompletedImage from './CampaignCompletedImage';
import CampaignComment from './CampaignComment';

export enum CampaignStatus {
  READY = 'READY',
  PROGRESS = 'PROGRESS',
  SUCCESS_FUND = 'SUCCESS_FUND',
  COMPLETED = 'COMPLETED',
}

export enum CampaignType {
  COFFEE = 'COFFEE',
  FOOD = 'FOOD',
  DONATE = 'DONATE',
  ADS = 'ADS',
}

@Entity()
class Campaign extends AbstractPriorityEntity {
  @Column()
  name: string;

  @Column({ default: '' })
  description: string;

  @ManyToOne(() => Celeb)
  celeb: Celeb;

  @Column('text')
  about: string;

  @Column('datetime')
  date: Date;

  @Column('datetime', { nullable: true })
  dateEnd: Date;

  @Column('datetime', { nullable: true })
  fundStartAt: Date;

  @Column('datetime', { nullable: true })
  fundExpiredAt: Date;

  @Column()
  address: string;

  @Column({ default: '' })
  addressTitle: string;

  //계산단위
  @Column({ type: 'decimal', precision: 10, scale: 0, default: 5 })
  amountUnit: number;

  //총 모금액
  @Column({ type: 'decimal', precision: 10, scale: 0 })
  amount: number;

  //모금 된 금액
  @Column({ type: 'decimal', precision: 10, scale: 0, default: 0, nullable: true })
  accAmount: number;

  //모금의 수량화
  @Column({ default: 0 })
  amountCnt: number;

  //모금 된 수금액의 수량화
  @Column({ default: 0 })
  accAmountCnt: number;

  @OneToMany(() => Support, (support) => support.campaign)
  supports: Support[];

  @Column({ default: 0, nullable: true })
  supportCnt: number;

  @OneToMany(() => CampaignComment, (comment) => comment.campaign)
  comments: CampaignComment[];

  @OneToMany(() => CampaignImage, (image) => image.campaign, { cascade: true, eager: true })
  images: CampaignImage[];

  @OneToMany(() => CampaignCompletedImage, (image) => image.campaign, {
    cascade: true,
    eager: true,
  })
  completedImages: CampaignCompletedImage[];

  @Column({ length: 30, default: 'READY' })
  status: string;

  @Column()
  type: string;

  @Column({ type: 'boolean', default: false })
  success: boolean;

  @Column('datetime', { nullable: true })
  completedDate: Date;

  sampleCampaignList: Campaign[];

  userPay(amount: number): void {
    if (amount) {
      throw new BadRequestException('amount should be not zero');
    }
    this.accAmount += amount;
    if (this.amount <= this.accAmount) {
      this.success = true;
    }
  }
}

export default Campaign;
