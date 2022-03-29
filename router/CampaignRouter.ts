import { Router } from 'express';
import CampaignService from '../service/CampaignService';
import CommonService from '../service/CommonService';
import TokenChecker from '../middlewares/TokenChecker';
import { getRepository } from 'typeorm';
import CampaignComment from '../entity/campaign/CampaignComment';
import Celeb from '../entity/celeb/Celeb';
import SupportService from '../service/SupportService';
import { BadRequestException } from '../error/Error';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const status = req.query.status;
    if (status == 'PROGRESS' || status == 'COMPLETED') {
      const camList = await CampaignService.campaignList(status);
      res.send(camList);
    } else {
      return res.status(400).send('INVALID STATUS');
    }
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = CommonService.getParamsId(req);
    const status = req.query.status;
    const result =
      status == 'COMPLETE'
        ? await CampaignService.detailComplete(id)
        : await CampaignService.detailProgress(id);
    if (!result) {
      throw new BadRequestException();
    }
    res.send(result);
  } catch (e) {
    next(e);
  }
});

router.get('/:campaignId/sample-history/:celebId', (req, res, next) => {
  const campaignId = CommonService.getParamsIdByName(req, 'campaignId');
  const celebId = CommonService.getParamsIdByName(req, 'celebId');
  CampaignService.campaignImageHistory(campaignId, celebId)
    .then((result) => {
      res.send(result);
    })
    .catch(next);
});

router.post('/:campaignId/comment', TokenChecker, (req, res, next) => {
  const campaignId = CommonService.getParamsIdByName(req, 'campaignId');
  const userId = req.userId;
  const { comment } = req.body;
  SupportService.isUserSupportCampaign(campaignId, userId)
    .then((support) => {
      CampaignService.postComment(campaignId, userId, comment, support != null)
        .then((r) => res.send(r))
        .catch(next);
    })
    .catch(next);
});

router.get('/:campaignId/comment', (req, res, next) => {
  const campaignId = CommonService.getParamsIdByName(req, 'campaignId');
  CampaignService.listCommentByCampaign(campaignId)
    .then((result) => res.send(result))
    .catch(next);
});

router.get('/comment/all', async (req, res, next) => {
  try {
    const comments = await getRepository(CampaignComment)
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoin('comment.campaign', 'campaign')
      .leftJoinAndMapOne('comment.celeb', Celeb, 'celeb', 'celeb.id = campaign.celebId')
      .orderBy('comment.createdAt', 'DESC')
      .take(30)
      .getMany();
    res.send(comments);
  } catch (e) {
    next(e);
  }
});

export default router;
