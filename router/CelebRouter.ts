import { Router } from 'express';
import TokenChecker from '../middlewares/TokenChecker';
import { getRepository } from 'typeorm';
import CelebService from '../service/CelebService';
import UserService from '../service/UserService';
import Celeb from '../entity/celeb/Celeb';
import CommonService from '../service/CommonService';
import RedisService, { CacheType } from '../service/RedisService';
import userRouter from './UserRouter';

const router = Router();

//List
router.get('/', async (req, res, next) => {
  try {
    const cached = await RedisService.getObject<Celeb[]>(CacheType.CELEB_LIST);
    if (!cached) {
      const list = await CelebService.list();
      res.send(list);
      await RedisService.setObject(CacheType.CELEB_LIST, list, 60 * 5);
      return;
    }
    res.send(cached);
  } catch (e) {
    next(e);
  }
});

//FindById
router.get('/:id', async (req, res, next) => {
  try {
    const id = CommonService.getParamsId(req);
    const celeb = await CelebService.findOne(id);
    if (!celeb) {
      res.sendStatus(400);
    }
    res.send(celeb);
  } catch (err) {
    next(err);
  }
});

router.get('/isFollowing/:celebId', TokenChecker, async (req, res, next) => {
  try {
    const { userId } = req;
    const celebId = Number(req.params.celebId);
    const celebToUser = await UserService.followingCelebList(userId);
    if (celebToUser && celebToUser.length > 0) {
      const celebIds = celebToUser
        .map((celebToUser) => celebToUser.celeb.id)
        .filter((id) => id == celebId);
      res.send(celebIds.length > 0);
    } else {
      res.send(false);
    }
  } catch (e) {
    next(e);
  }
});

//following
router.post('/:id/follow', TokenChecker, async (req, res, next) => {
  try {
    const celebId = req.params.id;
    const { userId } = req;
    const celeb = await getRepository(Celeb).findOne(celebId);
    const user = await UserService.findById(userId);
    await CelebService.followingCeleb(celeb, user);
    await UserService.dirtyCacheUser(userId);
    res.send(200);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/follow', TokenChecker, async (req, res, next) => {
  try {
    const celebId = Number(req.params.id);
    const { userId } = req;
    const celeb = await getRepository(Celeb).findOne(celebId);
    const user = await UserService.findById(userId);
    await CelebService.unFollowCeleb(celeb, user);
    await UserService.dirtyCacheUser(userId);
    res.send(200);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/comment', async (req, res, next) => {
  try {
    const id = CommonService.getParamsId(req);
    const commentList = await CelebService.celebCommentList(id);
    res.send(commentList);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/comment', TokenChecker, async (req, res, next) => {
  try {
    const id = CommonService.getParamsId(req);
    const { userId } = req;
    const { comment } = req.body;
    const newComment = await CelebService.postComment(id, userId, comment);
    res.send(newComment);
  } catch (e) {
    next(e);
  }
});

router.get('/:id/notice', async (req, res, next) => {
  try {
    const celebId = Number(req.params.id);
    const noticeList = await CelebService.listNotice(celebId);
    res.send(noticeList);
  } catch (err) {
    next(err);
  }
});

export default router;
