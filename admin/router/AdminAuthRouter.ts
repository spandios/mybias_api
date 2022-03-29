import { Router } from 'express';
import localPassport from 'passport';
import AuthService from '../../service/AuthService';
import UserService from '../../service/UserService';
import TokenChecker from '../../middlewares/TokenChecker';

const adminAuthRouter = Router();

adminAuthRouter.post('/login', (req, res, next) => {
  localPassport.authenticate('local', { session: false }, async (err, user, info) => {
    if (err || !user) {
      return res.status(400).send(err);
    } else {
      return res.send(await AuthService.createToken(user));
    }
  })(req, res, next);
});

adminAuthRouter.post('/join', (req, res, next) => {
  const user = req.body;
  const type = req.query.type;
  if (type == null) {
    res.status(400).send('잘못된 권한입니다.');
  }
  user.role = type;
  if (!user.email || !user.password) {
    res.status(400).send('이메일 또는 패스워드는 필수값입니다.');
  }

  //가입된 유저인지 체크
  UserService.isExistByEmail(user.email)
    .then((existUser) => {
      if (existUser != null) {
        res.status(400).send('이미 가입하신 이메일입니다.');
      } else {
        //비밀번호 암호화
        AuthService.encrypt(user.password, (err, hashed) => {
          if (err) {
            console.log(err);
            next(err);
          } else {
            user.password = hashed;
            //어드민 가입
            UserService.save(user)
              .then((savedUser) => {
                delete savedUser.password;
                res.send(savedUser);
              })
              .catch((err) => {
                res.status(500).send(err.message);
              });
          }
        });
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

adminAuthRouter.get('/me', TokenChecker, (req, res) => {
  res.send(200);
});

export default adminAuthRouter;
