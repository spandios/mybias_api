import { Router } from 'express';
import CelebImage from '../../entity/celeb/CelebImage';
import { CelebCreateDTO } from '../../dto/CelebDTO';
import CelebService from '../../service/CelebService';
import { BadRequestException } from '../../error/Error';
import CommonService from '../../service/CommonService';
import RedisService, { CacheType } from '../../service/RedisService';

const adminCelebRouter = Router();

//Create
adminCelebRouter.post('/', async (req, res, next) => {
  const celebCreateDto = req.body as CelebCreateDTO;
  const data = await CelebService.create(celebCreateDto);
  await RedisService.dirtyCache(CacheType.CELEB_LIST);
  res.send(data);
});

//List
adminCelebRouter.get('/', async (req, res, next) => {
  try {
    const data = await CelebService.list();
    res.send(data);
  } catch (err) {
    next(err);
  }
});

//detail
adminCelebRouter.get('/:id', async (req, res, next) => {
  try {
    const celebId = Number(req.params.id);
    const celeb = await CelebService.findOne(celebId);
    res.send(celeb);
  } catch (err) {
    next(err);
  }
});

//Delete
adminCelebRouter.delete('/:id', async (req, res, next) => {
  try {
    const celebId = Number(req.params.id);
    await CelebService.deleteCelebById(celebId);
    res.send(200);
  } catch (err) {
    next(err);
  }
});

adminCelebRouter.put('/:id', async (req, res, next) => {
  const celebId = Number(req.params.id);
  const { celeb } = req.body;
  await CelebService.update(celebId, celeb);
  res.send(200);
});

adminCelebRouter.post('/:id/profileImage', (req, res, next) => {
  try {
    const id = CommonService.getParamsId(req);
    const { url } = req.body;
    console.log(url);
    CelebService.addProfileImage(id, url)
      .then((r) => res.send(r))
      .catch(next);
  } catch (e) {
    next(e);
  }
});

adminCelebRouter.post('/image/add', async (req, res, next) => {
  const { url, celebId } = req.body;
  console.log(celebId);
  const image = await CelebService.addImage(celebId, url);
  console.log(image);
  res.send(200);
});

adminCelebRouter.post('/image/delete', async (req, res, next) => {
  const { url } = req.body;
  await CelebService.deleteImageByUrl(url);
  res.send(200);
});

adminCelebRouter.put('/:id/image/order', async (req, res, next) => {
  const id = Number(req.params.id);
  const images = req.body as CelebImage[];
  const celeb = await CelebService.changeImageOrder(id, images);
  res.send(celeb);
});

adminCelebRouter.post('/:id/notice', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const celebId = Number(req.params.id);
    res.send(await CelebService.createNotice(title, content, celebId));
  } catch (err) {
    next(err);
  }
});

adminCelebRouter.put('/notice/:id', async (req, res, next) => {
  try {
    const noticeId = Number(req.params.id);
    const { content } = req.body;
    res.send(await CelebService.updateNotice(noticeId, content));
  } catch (err) {
    next(err);
  }
});

adminCelebRouter.put('/:originId/priority/:targetId', async (req, res, next) => {
  try {
    if (!req.params.originId || !req.params.targetId) {
      throw new BadRequestException('잘못된 아이디 입니다.');
    }
    const originId = CommonService.getParamsIdByName(req, 'originId');
    const targetId = CommonService.getParamsIdByName(req, 'targetId');
    console.log(originId);
    console.log(targetId);
    await CelebService.changePriority(originId, targetId);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

export default adminCelebRouter;
