import { Router } from 'express';
import UserService from '../service/UserService';

const userRouter = Router();

//유저 정보
userRouter.get('/me', async (req, res, next) => {
  try {
    const { userId } = req;
    // const cachedUser = await RedisService.getObject(CacheType.USER + userId);
    const user = await UserService.me(userId);
    res.send(user);
  } catch (e) {
    next(e);
  }
});

userRouter.get('/followingCeleb', async (req, res, next) => {
  try {
    const { userId } = req;
    const celebToUser = await UserService.followingCelebList(userId);
    if (celebToUser == null) res.send(celebToUser);
    if (celebToUser != null && celebToUser.length > 0) {
      res.send(celebToUser.map((celebToUser) => celebToUser.celeb));
    } else {
      res.send([]);
    }
  } catch (e) {
    next(e);
  }
});

//유저 수정
userRouter.put('/', async (req, res, next) => {
  try {
    const { userId } = req;
    // await RedisService.dirtyCache(CacheType.USER + userId);
    const { nickname, gender, country, profileImage, birth } = req.body;
    const user = await UserService.findById(userId);
    user.nickname = nickname;
    // user.gender = gender;
    // user.country = country;
    user.profileImage = profileImage;
    user.birth = birth;
    const updatedUser = await UserService.save(user);
    res.send(updatedUser);
  } catch (e) {
    next(e);
  }
});

export default userRouter;
