import { Router } from 'express';
import { getPageRequest } from '../../interface/Page/PageRequest';
import CommonService from '../../service/CommonService';
import { User } from '../../entity/user/User';
import UserService from '../../service/UserService';
import { getRepository } from 'typeorm';

const router = Router();

router.get('/list', (req, res, next) => {
  getRepository(User)
    .find()
    .then((r) => {
      res.send(r);
    })
    .catch(next);
});

router.get('/', async (req, res, next) => {
  try {
    const pageRequest = getPageRequest(req);
    const roleWhere = `t.role = '${req.query.role || 'USER'}'`;
    const page = await CommonService.paging(User, pageRequest, [], [roleWhere]);
    res.send(page);
  } catch (e) {
    next(e);
  }
});

router.get('/:id(\\d+)', async (req, res, next) => {
  try {
    const id = CommonService.getParamsId(req);
    const user = await UserService.detailUser(id);
    if (user == null) {
      return res.sendStatus(400);
    }
    res.send(user);
  } catch (e) {
    next(e);
  }
});

export default router;
