import { Router } from 'express';
import SupportService from '../../service/SupportService';
import PageRequest, { getPageRequest } from '../../interface/Page/PageRequest';
import TokenChecker from '../../middlewares/TokenChecker';
import CommonService from '../../service/CommonService';
import Support from '../../entity/support/Support';

const router = Router();

router.get('/', (req, res, next) => {
  const userId = req.query.userId ? [`t.user = ${req.query.userId}`] : [];
  const pageRequest = getPageRequest(req);
  SupportService.supportList(pageRequest, userId)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/refund/:supportId', TokenChecker, async (req, res, next) => {
  try {
    const supportId = CommonService.getParamsIdByName(req, 'supportId');
    await SupportService.refund(req.userId, supportId);
    res.send(200);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', TokenChecker, async (req, res, next) => {
  try {
    const id = CommonService.getParamsId(req);
    const support = await CommonService.findById(Support, id, ['user', 'campaign']);
    res.send(support);
  } catch (e) {
    next(e);
  }
});
export default router;
