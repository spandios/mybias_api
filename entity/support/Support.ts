import { IsNotEmpty } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
import AbstractEntity from '../../interface/AbstractEntity';
import Campaign from '../campaign/Campaign';
import { User } from '../user/User';

export class Paypal {
  @Column({ nullable: true })
  orderId: string;
  @Column({ nullable: true })
  captureId?: string;
  @Column(() => Payer)
  payer?: Payer | null;
  @Column({ default: 'CAPTURE' })
  intent?: string;
  @Column({ nullable: true, default: 0 })
  amount?: number;
  @Column({ default: 'PREPARE' })
  status?: string;
  @Column({ default: false })
  payComplete: boolean;
}

export class Payer {
  @Column({ nullable: true })
  email: string;
  @Column({ nullable: true })
  name: string;
  @Column({ nullable: true })
  id: string;
  @Column({ nullable: true })
  countryCode: string;
}

@Entity()
class Support extends AbstractEntity {
  @Column(() => Paypal)
  paypal?: Paypal;

  @IsNotEmpty()
  @ManyToOne(() => User, (user) => user.supports)
  user: User;

  @IsNotEmpty()
  @ManyToOne(() => Campaign, (campaign) => campaign.supports)
  campaign: Campaign;

  @IsNotEmpty()
  @Column({ type: 'decimal', precision: 10, scale: 0 })
  amount: number;

  @IsNotEmpty()
  @Column({ default: 1 })
  cnt: number;

  @Column({ default: false })
  isPayComplete: boolean;

  @Column({ default: false })
  isRefund: boolean;

  @Column({ nullable: true })
  refundAt: Date;
}

export default Support;
