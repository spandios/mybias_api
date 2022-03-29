import AbstractImageEntity from '../../interface/AbstractImageEntity';
import { Entity, ManyToOne } from 'typeorm';
import Campaign from './Campaign';

@Entity()
class CampaignCompletedImage extends AbstractImageEntity {
  @ManyToOne(() => Campaign, (campaign) => campaign.completedImages)
  campaign: Campaign;
}

export default CampaignCompletedImage;
