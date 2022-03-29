import { Router } from 'express';
import { CampaignCreateDTO, CampaignUpdateDTO } from '../../dto/CampaignDTO';
import CampaignService from '../../service/CampaignService';
import PageRequest, { Direction, getPageRequest } from '../../interface/Page/PageRequest';
import CommonService from '../../service/CommonService';
import Campaign from '../../entity/campaign/Campaign';
import { BadRequestException, NotFoundException } from '../../error/Error';
import CampaignImage from '../../entity/campaign/CampaignImage';
import CampaignCompletedImage from '../../entity/campaign/CampaignCompletedImage';
const adminCampaignRouter = Router();
//create
adminCampaignRouter.post('/', async (req, res, next) => {
  try {
    const createDTO = req.body as CampaignCreateDTO;
    const { name, amount, about, images, date, celeb, address, type } = createDTO;
    if (name && about && date && amount && images.length > 0 && type) {
      const created = await CampaignService.create(createDTO);
      res.sendStatus(200);
    } else {
      throw new BadRequestException('캠페인 생성 필드를 채워주세요');
    }
  } catch (e) {
    next(e);
  }
});

//paging
adminCampaignRouter.get('/', async (req, res, next) => {
  try {
    const pageRequest = getPageRequest(req);
    const statusWhere = `t.status = '${req.query.status}'`;
    const page = await CommonService.paging(Campaign, pageRequest, ['celeb'], [statusWhere], true);
    page.content = page.content.map((content: any) => {
      content.date = CommonService.datetimeWithFormat(content.date);
      content.celeb = content.celeb.name;
      return content;
    });
    res.send(page);
  } catch (err) {
    next(err);
  }
});

//detail
adminCampaignRouter.get('/:id', async (req, res, next) => {
  try {
    const id = CommonService.getParamsId(req);
    const cam = await CommonService.findById(Campaign, id, ['celeb', 'images']);
    if (!cam) throw new NotFoundException('Campaign을 찾을 수 없습니다.');
    res.send(cam);
  } catch (err) {
    next(err);
  }
});

//update
adminCampaignRouter.put('/:id', async (req, res, next) => {
  const id = CommonService.getParamsId(req);
  const targetCampaign = req.body as CampaignUpdateDTO;
  CampaignService.update(id, targetCampaign)
    .then((result) => {
      res.send(result);
    })
    .catch(next);
});

adminCampaignRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = CommonService.getParamsId(req);
    await CampaignService.delete(id);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

adminCampaignRouter.post('/deleteAll', async (req, res, next) => {
  try {
    await CampaignService.deleteAll(req.body.ids);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

adminCampaignRouter.post('/image/add', async (req, res, next) => {
  try {
    const { url, campaignId } = req.body;
    const image = await CampaignService.addImageByType(campaignId, url, 'campaign');
    console.log(image);
    res.send(200);
  } catch (err) {
    next(err);
  }
});

adminCampaignRouter.post('/image/delete', async (req, res, next) => {
  try {
    const { url } = req.body;
    await CampaignService.deleteImageByUrlAndType(url, 'campaign');
    res.send(200);
  } catch (err) {
    next(err);
  }
});

adminCampaignRouter.put('/:id/image/order', async (req, res, next) => {
  try {
    const id = CommonService.getParamsId(req);
    const images = req.body as CampaignImage[];
    const cam = await CampaignService.changeImageOrderByType(id, images, 'campaign');
    res.send(cam);
  } catch (err) {
    next(err);
  }
});

adminCampaignRouter.post('/image/completed/add', async (req, res, next) => {
  try {
    const { url, campaignId } = req.body;
    const image = await CampaignService.addImageByType(campaignId, url, 'completed');
    console.log(image);
    res.send(200);
  } catch (err) {
    next(err);
  }
});

adminCampaignRouter.post('/image/completed/delete', async (req, res, next) => {
  try {
    const { url } = req.body;
    await CampaignService.deleteImageByUrlAndType(url, 'completed');
    res.send(200);
  } catch (err) {
    next(err);
  }
});

adminCampaignRouter.put('/:id/image/completed/order', async (req, res, next) => {
  try {
    const id = CommonService.getParamsId(req);
    const images = req.body as CampaignCompletedImage[];
    const cam = await CampaignService.changeImageOrderByType(id, images, 'completed');
    res.send(cam);
  } catch (err) {
    next(err);
  }
});

adminCampaignRouter.put('/:originId/priority/:targetId', async (req, res, next) => {
  try {
    const { originId, targetId } = req.params;
    if (!originId || !targetId) {
      throw new BadRequestException('잘못된 아이디 입니다.');
    }
    console.log(originId, targetId);

    await CampaignService.changePriority(Number(originId), Number(targetId));
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});
export default adminCampaignRouter;
