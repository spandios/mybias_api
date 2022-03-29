import Support, { Paypal } from '../entity/support/Support';
import { getRepository } from 'typeorm';
import CommonService from './CommonService';
import Campaign, { CampaignStatus } from '../entity/campaign/Campaign';
import { User } from '../entity/user/User';
import { validate, ValidationError } from 'class-validator';
import Celeb from '../entity/celeb/Celeb';
import { BadRequestException } from '../error/Error';
import PageRequest from '../interface/Page/PageRequest';
import Page from '../interface/Page/Page';
import Logger from './LoggerService';
import { createJwtRefreshToken } from './JwtService';

export default class SupportService {
  static async checkAvailableSupport(campaignId: number, cnt) {
    return new Promise(async (resolve, reject) => {
      const campaign = await CommonService.findById(Campaign, campaignId);
      if (campaign.accAmountCnt + cnt > campaign.amountCnt) {
        return reject(new BadRequestException('모금수량 초과입니다.'));
      }
      if (campaign.accAmountCnt == campaign.amountCnt) {
        return reject(new BadRequestException('모금이 끝났습니다.'));
      }
      resolve(true);
    });
  }
  static validateSupport(campaign: Campaign, cnt: number, amount: number) {
    if (cnt < 1) {
      return new BadRequestException('INVALID CNT');
    }

    if (amount < 1 || amount !== campaign.amountUnit * cnt) {
      return new BadRequestException('INVALID AMOUNT');
    }

    if (campaign.accAmountCnt + cnt > campaign.amountCnt) {
      return new BadRequestException('모금수량 초과입니다.');
    }
    if (campaign.accAmountCnt == campaign.amountCnt) {
      return new BadRequestException('모금이 끝났습니다.');
    }
  }

  static async prepareSupport(
    orderId: string,
    user: User,
    campaign: Campaign,
    amount: number,
    cnt: number,
  ): Promise<Support> {
    return new Promise(async (resolve, reject) => {
      try {
        const supportRepository = getRepository(Support);
        const newSupport = new Support();
        newSupport.user = user;
        newSupport.campaign = campaign;
        newSupport.amount = amount;
        newSupport.cnt = cnt;
        const paypal = new Paypal();
        paypal.orderId = orderId;
        paypal.amount = amount;
        newSupport.paypal = paypal;

        Logger.info(
          `Prepare Support Success! User : ${user.id} - ${user.nickname}, Campaign [${campaign.id} , Amount : ${campaign.amount} cnt : ${cnt}]`,
        );
        resolve(await supportRepository.save(newSupport));
      } catch (err) {
        reject(err);
      }
    });
  }

  static async completeSupport(user: User, campaign: Campaign, support: Support, paypal: Paypal) {
    support.paypal = paypal;
    support.isPayComplete = true;
    campaign.accAmount = Number(campaign.accAmount) + support.amount;
    campaign.accAmountCnt = campaign.accAmountCnt + support.cnt;
    campaign.supportCnt = campaign.supportCnt + 1;
    user.supportCnt = user.supportCnt + 1;
    if (campaign.accAmountCnt == campaign.amountCnt) {
      campaign.status = CampaignStatus.SUCCESS_FUND;
    }
    // const errors: ValidationError[] = await validate(newSupport);
    // if (errors.length > 0) {
    //   return reject(errors);
    // }
    await getRepository(User).save(user);
    await getRepository(Campaign).save(campaign);
    Logger.info(
      `Complete Support! User : ${user.id} - ${user.nickname}, Campaign [${campaign.id} , Amount : ${campaign.amount} cnt : ${support.cnt}]`,
    );
    return getRepository(Support).save(support);
  }

  static async support(
    userId: number,
    campaignId: number,
    amount: number,
    cnt: number,
    paypal: Paypal,
  ): Promise<Support | undefined> {
    return new Promise(async (resolve, reject) => {
      try {
        if (cnt < 1) {
          return reject(new BadRequestException('INVALID CNT'));
        }
        const campaign = await CommonService.findById(Campaign, campaignId);
        if (!campaign) {
          return reject(new BadRequestException('INVALID CAMPAIGN'));
        }

        if (amount < 1 || amount !== campaign.amountUnit * cnt) {
          return reject(new BadRequestException('INVALID AMOUNT'));
        }

        if (campaign.accAmountCnt + cnt > campaign.amountCnt) {
          return reject(new BadRequestException('모금수량 초과입니다.'));
        }
        if (campaign.accAmountCnt == campaign.amountCnt) {
          return reject(new BadRequestException('모금이 끝났습니다.'));
        }
        const user = await CommonService.findById(User, userId);
        const supportRepository = getRepository(Support);
        const newSupport = new Support();
        newSupport.user = user;
        newSupport.campaign = campaign;
        newSupport.paypal = paypal;
        newSupport.amount = amount;
        newSupport.cnt = cnt;

        const errors: ValidationError[] = await validate(newSupport);
        if (errors.length > 0) {
          return reject(errors);
        }
        campaign.accAmount = Number(campaign.accAmount) + amount;
        campaign.accAmountCnt = campaign.accAmountCnt + cnt;
        campaign.supportCnt = campaign.supportCnt + 1;

        user.supportCnt = user.supportCnt + 1;

        if (campaign.accAmountCnt == campaign.amountCnt) {
          campaign.status = CampaignStatus.SUCCESS_FUND;
          Logger.info('SUCCESS_FUNDING ID : ' + campaign.id);
        }
        await getRepository(User).save(user);
        await getRepository(Campaign).save(campaign);
        Logger.info(
          `Support Success! User : ${user.id} - ${user.nickname}, Campaign [${campaign.id} , Amount : ${campaign.amount} cnt : ${cnt}]`,
        );
        resolve(await supportRepository.save(newSupport));
      } catch (err) {
        reject(err);
      }
    });
  }

  static refund(userId: number, supportId: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const support = await getRepository(Support).findOne(supportId, {
          relations: ['campaign'],
        });
        support.refundAt = new Date();
        support.isRefund = true;
        await getRepository(Support).save(support);
        const campaign = await CommonService.findById(Campaign, support.campaign.id);
        campaign.accAmount = campaign.accAmount - support.amount;
        await getRepository(Campaign).save(campaign);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  static supportListByUser(userId: number) {
    return getRepository(Support)
      .createQueryBuilder('support')
      .innerJoinAndSelect('support.campaign', 'campaign')
      .leftJoinAndSelect('campaign.images', 'images')
      .innerJoinAndSelect('campaign.celeb', 'celeb')
      .where('support.user = :userId', { userId })
      .orderBy('support.id', 'DESC')
      .getMany();
  }

  static async isUserSupportCampaign(campaignId: number, userId: number) {
    const campaign = await getRepository(Campaign).findOne(campaignId);
    const user = await getRepository(User).findOne(userId);
    return getRepository(Support).findOne({ campaign, user });
  }

  static supporterListByCampaign(campaignId: number) {
    return getRepository(Support)
      .createQueryBuilder('support')
      .leftJoinAndSelect('support.user', 'user')
      .where('support.campaign = :campaignId', { campaignId })
      .orderBy('support.id', 'DESC')
      .take(5)
      .getMany();
  }

  static supporterCntByCampaign(campaignId: number) {
    return getRepository(Support)
      .createQueryBuilder('support')
      .where('support.campaign = :campaignId', { campaignId })
      .getCount();
  }

  static async rankingSupportListByCampaign() {
    const rankingList = [];
    const celebList = await getRepository(Celeb)
      .createQueryBuilder('celeb')
      .innerJoinAndSelect('celeb.campaigns', 'campaigns', "campaigns.status = 'PROGRESS'")
      .orderBy('campaigns.createdAt', 'DESC')
      .getMany();

    for (const celeb of celebList) {
      if (celeb.campaigns.length === 0) return;
      const lastCampaign = celeb.campaigns[0];
      const supportList = await getRepository(Support)
        .createQueryBuilder('support')
        .innerJoinAndSelect('support.user', 'user')
        .orderBy('support.amount', 'DESC')
        .where('support.campaign = :camId', { camId: lastCampaign.id })
        .take(3)
        .getMany();
      // if (lastCampaign != null) {
      //   rankingSupportList = rankingSupportList.sort((a, b) => b.amount - a.amount).slice(0, 3);
      // }
      const ranking = { celeb, campaign: lastCampaign, supportList };
      rankingList.push(ranking);
    }
    return rankingList;
  }

  static supportList = async (
    pageRequest: PageRequest,
    wheres?: string[],
  ): Promise<Page<Support>> => {
    return await CommonService.paging(Support, pageRequest, ['user', 'campaign'], wheres);
  };
}
