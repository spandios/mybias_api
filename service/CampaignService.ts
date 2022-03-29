import Campaign, { CampaignStatus } from '../entity/campaign/Campaign';
import { CampaignCreateDTO, CampaignUpdateDTO } from '../dto/CampaignDTO';
import { DeleteResult, getRepository } from 'typeorm';
import PageRequest from '../interface/Page/PageRequest';
import Celeb from '../entity/celeb/Celeb';
import CampaignImage from '../entity/campaign/CampaignImage';
import Page from '../interface/Page/Page';
import CommonService from './CommonService';
import { BadRequestException, ServerError } from '../error/Error';
import CampaignCompletedImage from '../entity/campaign/CampaignCompletedImage';
import { User } from '../entity/user/User';
import CampaignComment from '../entity/campaign/CampaignComment';
export default class CampaignService {
  static campaignList = (status: string): Promise<Campaign[]> => {
    const query = getRepository(Campaign)
      .createQueryBuilder('campaign')
      .orderBy('campaign.priority', 'DESC')
      .innerJoinAndSelect('campaign.celeb', 'celeb')
      .leftJoinAndSelect('campaign.images', 'images')
      .where('campaign.active = :active', { active: true });
    if (status === 'COMPLETED') {
      query.leftJoinAndSelect('campaign.completedImages', 'completedImages');
      query.andWhere('campaign.status=:status', { status });
    } else {
      query.andWhere('campaign.status=:progress OR campaign.status=:success', {
        progress: 'PROGRESS',
        success: 'SUCCESS_FUND',
      });
    }
    return query.getMany();
  };

  static page = async (pageRequest: PageRequest, wheres?: string[]): Promise<Page<Campaign>> => {
    return await CommonService.paging(Campaign, pageRequest, wheres);
  };

  static detailProgress = async (campaignId: number): Promise<Campaign> => {
    return getRepository(Campaign)
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.celeb', 'celeb')
      .leftJoinAndSelect('c.images', 'images')
      .where('c.id = :campaignId', { campaignId })
      .getOne();
  };

  static detailComplete = async (campaignId: number): Promise<Campaign> => {
    return getRepository(Campaign)
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.celeb', 'celeb')
      .leftJoinAndSelect('c.images', 'images')
      .leftJoinAndSelect('c.completedImages', 'completedImages')
      .leftJoinAndSelect('c.supports', 'supports')
      .innerJoinAndSelect('supports.user', 'supportUser')
      .leftJoinAndSelect('c.comments', 'comments')
      .innerJoinAndSelect('comments.user', 'commentUser')
      .where('c.id = :campaignId', { campaignId })
      .getOne();
  };

  static campaignImageHistory = async (camId: number, celebId: number): Promise<Campaign[]> => {
    return await getRepository(Campaign)
      .createQueryBuilder('campaign')
      .select('campaign')
      .leftJoinAndSelect('campaign.images', 'images')
      .where('campaign.id < :camId', { camId })
      .andWhere('campaign.celeb = :celebId', { celebId })
      .orderBy('campaign.id', 'DESC')
      .take(3)
      .getMany();
  };
  // static pageBaseQuery = async (pageRequest: PageRequest): Promise<Page<Campaign>> => {
  //   return await CommonService.PagingAnd(Campaign, pageRequest);
  // }

  static postComment = async (
    campaignId: number,
    userId: number,
    comment: string,
    isSupporter: boolean,
  ): Promise<CampaignComment> => {
    const campaign = await getRepository(Campaign).findOneOrFail(campaignId);
    const user = await getRepository(User).findOneOrFail(userId);
    const campaignComment = new CampaignComment();
    campaignComment.campaign = campaign;
    campaignComment.user = user;
    campaignComment.comment = comment;
    campaignComment.isSupport = isSupporter;
    return await getRepository(CampaignComment).save(campaignComment);
  };

  static listCommentByCampaign = async (campaignId: number): Promise<CampaignComment[]> => {
    return getRepository(CampaignComment)
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.user', 'user')
      .where('comment.campaign = :campaignId', { campaignId })
      .orderBy('comment.id', 'DESC')
      .getMany();
  };

  static create = async (origin: CampaignCreateDTO): Promise<Campaign> => {
    const {
      name,
      fundStartAt,
      fundExpiredAt,
      amountUnit,
      amount,
      amountCnt,
      about,
      images,
      date,
      dateEnd,
      celeb,
      address,
      addressTitle,
      type,
      description,
      status,
    } = origin;
    const campaign = new Campaign();
    campaign.name = name;
    campaign.about = about;
    campaign.date = date;
    campaign.dateEnd = dateEnd;
    campaign.fundStartAt = fundStartAt;
    campaign.fundExpiredAt = fundExpiredAt;
    campaign.amount = amount;
    campaign.amountUnit = amountUnit;
    campaign.amountCnt = amountCnt;
    campaign.address = address;
    campaign.addressTitle = addressTitle;
    campaign.type = type;
    campaign.description = description;

    campaign.status = status;
    campaign.images = images.map((image) => {
      const campaignImage = new CampaignImage(image);
      campaignImage.campaign = campaign;
      return campaignImage;
    });
    campaign.celeb = await getRepository(Celeb).findOne(celeb);
    return await getRepository(Campaign).save(campaign);
  };
  static delete = async (id: number): Promise<void> => {
    try {
      const campaignRepository = getRepository(Campaign);
      const campaign = await campaignRepository.findOne(id);
      if (!campaign) {
        throw new BadRequestException();
      }
      campaign.active = false;
      campaign.inactiveAt = new Date();
      await campaignRepository.save(campaign);
    } catch (e) {
      throw new Error(e.message);
    }
  };
  static update = async (id: number, target: CampaignUpdateDTO) => {
    const campaignRepository = getRepository(Campaign);
    return campaignRepository.update(id, {
      name: target.name,
      about: target.about,
      amount: target.amount,
      date: target.date,
      dateEnd: target.dateEnd,
      address: target.address,
      addressTitle: target.addressTitle,
      active: target.active,
      status: target.status,
      type: target.type,
      description: target.description,
      amountUnit: target.amountUnit,
      amountCnt: target.amountCnt,
      fundStartAt: target.fundStartAt,
      fundExpiredAt: target.fundExpiredAt,
    });
  };

  static deleteAll = async (ids: number[]): Promise<void> => {
    const campaignRepository = getRepository(Campaign);
    const campaigns = await campaignRepository.findByIds(ids);
    campaigns.forEach((cam) => {
      console.log(cam);
      cam.active = false;
      cam.inactiveAt = new Date();
    });

    await campaignRepository.save(campaigns);
  };

  static changePriority = async (originId: number, targetId: number): Promise<void> => {
    const campaignRepository = getRepository(Campaign);
    const originCam = await campaignRepository.findOne(originId);
    const targetCam = await campaignRepository.findOne(targetId);

    if (!originCam || !targetCam) {
      throw new BadRequestException('Not Exist Campaign');
    }
    originCam.changePriority(targetCam);
    await campaignRepository.save(originCam);
    await campaignRepository.save(targetCam);
  };

  static async addImageByType(camId: number, url: string, type: string) {
    const cam = await CommonService.findById(Campaign, camId);
    let camImage;
    if (type === 'campaign') {
      camImage = new CampaignImage(url);
    } else if (type === 'completed') {
      camImage = new CampaignImage(url);
    }
    if (!camImage) throw new BadRequestException('TYPE ERROR');
    camImage.campaign = cam;
    cam[getImagePath(type)].push(camImage);
    return getRepository(Campaign).save(cam);
  }

  static deleteImageByUrlAndType(url: string, type: string): Promise<DeleteResult> {
    return getRepository(
      type === 'campaign' ? CampaignImage : type === 'completed' ? CampaignCompletedImage : '',
    ).delete({ url });
  }

  static async changeImageOrderByType(
    id: number,
    images: CampaignImage[],
    type: string,
  ): Promise<Campaign> {
    const campaign = await CommonService.findById(Campaign, id, ['images']);
    campaign[getImagePath(type)] = [];
    images.map((image) => {
      this.deleteImageByUrlAndType(image.url, type);
      delete image.id;
      campaign[getImagePath(type)].push(image);
    });
    return await getRepository(Campaign).save(campaign);
  }
}

function getImagePath(type) {
  return type === 'campaign'
    ? 'images'
    : type === 'sample'
    ? 'sampleImages'
    : type === 'completed'
    ? 'completedImages'
    : '';
}

//Update
// const conn = getConnection();
// //Update Celeb
// if (target.celeb) {
//
//   await conn.createQueryBuilder().relation(Campaign, 'celeb').of(id).set(target.celeb);
// }

// if (target.images) {
//   //Update Image
//   // const originalImage = await getRepository(CampaignImage)
//   //   .createQueryBuilder('image')
//   //   .where('image.campaignId = :id', { id: id })
//   //   .getMany();
//   // const newImage = await getRepository(CampaignImage).save(target.images.map((url) => new CampaignImage(url)));
//   // await conn.createQueryBuilder().relation(Campaign, 'images').of(id).addAndRemove(newImage, originalImage);
//   const cam = await campaignRepository.findOne(id);
//   cam.images = target.images.map((url) => new CampaignImage(url));
//   await campaignRepository.save(cam);
// }
