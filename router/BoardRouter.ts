import { Router } from 'express';
import { BoardService } from '../service/BoardService';
import { BadRequestException } from '../error/Error';
import { BoardType } from '../interface/BoardEntity';

const boardRouter = Router();
const noticeService = new BoardService(BoardType.NOTICE);
const tosService = new BoardService(BoardType.TOS);
const faqService = new BoardService(BoardType.FAQ);

boardRouter.get('/', async (req, res, next) => {
  try {
    const boardType = req.query.type as BoardType;
    switch (boardType) {
      case BoardType.NOTICE:
        res.send(await noticeService.list());
        break;
      case BoardType.TOS:
        res.send(await tosService.list());
        break;
      case BoardType.FAQ:
        res.send(await faqService.list());
        break;
      default:
        throw new BadRequestException('BoardType Empty');
    }
  } catch (e) {
    next(e);
  }
});

export default boardRouter;
