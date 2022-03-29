import AbstractImageEntity from '../../interface/AbstractImageEntity';
import { Entity, ManyToOne } from 'typeorm';
import Campaign from './Campaign';

@Entity()
export default class CampaignImage extends AbstractImageEntity {
  @ManyToOne(() => Campaign, (campaign) => campaign.images, { onDelete: 'CASCADE' })
  campaign: Campaign;
}
