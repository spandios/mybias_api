import { Router } from 'express';
import userRouter from './UserRouter';
import authRouter from './AuthRouter';
import fileRouter from './FileRouter';
import celebRouter from './CelebRouter';
import campaignRouter from './CampaignRouter';
import supportRouter from './SupportRouter';
import boardRouter from './BoardRouter';
import TokenChecker from '../middlewares/TokenChecker';

const indexRouter = Router();
indexRouter.use('/user', TokenChecker, userRouter);
indexRouter.use('/auth', authRouter);
indexRouter.use('/file', fileRouter);
indexRouter.use('/celeb', celebRouter);
indexRouter.use('/campaign', campaignRouter);
indexRouter.use('/support', supportRouter);
indexRouter.use('/board', boardRouter);

export default indexRouter;
