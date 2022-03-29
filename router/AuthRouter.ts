import { Router } from 'express';
import UserService from '../service/UserService';
import { User, UserRole } from '../entity/user/User';
import { JoinDTO } from '../dto/AuthDTO';
import { getRepository } from 'typeorm';
import AuthService from '../service/AuthService';

const authRouter = Router();
authRouter.post('/checkNickname', async (req, res, next) => {
  try {
    const nickname = req.body.nickname.value;
    if (!nickname) {
      return res.status(400).send('Invalid Nickname');
    }
    const user = await UserService.checkNickname(nickname);
    res.send(user ? 'exist' : 'not exist');
  } catch (e) {
    next(e);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const joinDto = req.body as JoinDTO;
    const { provider, providerId, email } = joinDto;
    const existUser = await UserService.isExist(providerId, provider);
    //아직 가입되지 않은 유저
    if (existUser == null) {
      console.log('아직 가입되지 않았습니다.');
      //디테일 정보기입 -> 최종 가입
      if (joinDto.detailJoin != null) {
        const { nickname, profileImage, birth, defaultProfileColor } = joinDto.detailJoin;
        const user = new User();
        user.email = email;
        user.role = UserRole.USER;
        user.provider = provider;
        user.providerId = providerId;
        user.provider = provider;
        user.profileImage = profileImage;
        user.defaultProfileColor = defaultProfileColor;
        // user.gender = gender;
        user.nickname = nickname;
        // user.country = country;
        user.completeJoin = true;
        user.birth = birth;
        console.log(birth);
        console.log('가입완료');
        console.log(user);
        const newUser = await getRepository(User).save(user);
        return res.send(await AuthService.createToken(newUser));
      } else {
        console.log('complete join : false');
        return res.send({ completeJoin: false });
      }
    } else {
      //가입은 했지만 디테일 정보를 기입하지 않는 경우
      if (existUser.completeJoin == false) return res.send({ completeJoin: false });
      //기존유저 로그인 성공 -> 토큰발행
      console.log('로그인 성공');
      return res.send(await AuthService.createToken(existUser));
    }
  } catch (e) {
    console.log(e);
    next(e);
  }
});
authRouter.post('/refresh_token', async (req, res, next) => {
  const { refresh_token } = req.body;
  if (refresh_token != null) {
    try {
      const accessToken = await AuthService.refreshToken(refresh_token);
      console.log('refresh token success :' + accessToken);
      return res.send({ accessToken });
    } catch (err) {
      res.status(401).send(err.message);
    }
  } else {
    res.status(400).send('Empty RefreshToken');
  }
});

export default authRouter;
