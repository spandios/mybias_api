import { Router } from 'express';
import adminAuthRouter from './AdminAuthRouter';
import adminCelebRouter from './AdminCelebRouter';
import TokenChecker from '../../middlewares/TokenChecker';
import adminCampaignRouter from './AdminCampaignRouter';
import adminUserRouter from './AdminUserRouter';
import adminSupportRouter from './AdminSupportRouter';
import { adminFaqRouter, adminNoticeRouter, adminTosRouter } from './AdminBoardRouter';

const adminRouter = Router();
adminRouter.use('/auth', adminAuthRouter);
adminRouter.use('/celeb', TokenChecker, adminCelebRouter);
adminRouter.use('/campaign', TokenChecker, adminCampaignRouter);
adminRouter.use('/board/notice', TokenChecker, adminNoticeRouter);
adminRouter.use('/board/tos', TokenChecker, adminTosRouter);
adminRouter.use('/board/faq', TokenChecker, adminFaqRouter);
adminRouter.use('/user', adminUserRouter);
adminRouter.use('/support', adminSupportRouter);
export default adminRouter;
