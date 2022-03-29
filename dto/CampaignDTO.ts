import { CampaignStatus, CampaignType } from '../entity/campaign/Campaign';

export class CampaignCreateDTO {
  name: string;
  celeb: number;
  about: string;
  address: string;
  addressTitle: string;
  date: Date;
  dateEnd: Date;
  fundStartAt: Date;
  fundExpiredAt: Date;
  amountUnit: number;
  amount: number;
  amountCnt: number;
  images: string[];
  type: CampaignType;
  description: string;
  status: CampaignStatus; //for test
}

export class CampaignUpdateDTO {
  name: string;
  celeb: number;
  about: string;
  address: string;
  addressTitle: string;
  date: Date;
  dateEnd: Date;
  fundStartAt: Date;
  fundExpiredAt: Date;
  amountUnit: number;
  amount: number;
  amountCnt: number;
  images: string[];
  status: CampaignStatus;
  active: boolean;
  type: CampaignType;
  description: string;
}
