import { Router } from 'express';
import { BoardService } from '../../service/BoardService';
import { BoardType } from '../../interface/BoardEntity';

const adminNoticeRouter = Router();
const adminTosRouter = Router();
const adminFaqRouter = Router();
const noticeService = new BoardService(BoardType.NOTICE);
const tosService = new BoardService(BoardType.TOS);
const faqService = new BoardService(BoardType.FAQ);

adminNoticeRouter.get('/:id', async (req, res, next) => {
  try {
    return res.send(await noticeService.findById(req.params.id));
  } catch (err) {
    next(err);
  }
});

adminNoticeRouter.get('/', async (req, res, next) => {
  try {
    return res.send(await noticeService.list());
  } catch (err) {
    next(err);
  }
});

adminNoticeRouter.post('/', async (req, res, next) => {
  const board = req.body;
  try {
    res.send(await noticeService.create(board));
  } catch (err) {
    next(err);
  }
});

adminNoticeRouter.put('/:id', async (req, res, next) => {
  const id = req.params.id;
  const board = req.body;
  try {
    res.send(await noticeService.update(Number(id), board));
  } catch (err) {
    next(err);
  }
});

adminNoticeRouter.delete('/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    res.send(await noticeService.delete(Number(id)));
  } catch (err) {
    next(err);
  }
});

adminTosRouter.get('/', async (req, res, next) => {
  try {
    return res.send(await tosService.list());
  } catch (err) {
    next(err);
  }
});

adminTosRouter.post('/', async (req, res, next) => {
  const { content } = req.body;
  try {
    res.send(await tosService.createOrUpdate(content));
  } catch (err) {
    next(err);
  }
});

adminFaqRouter.get('/', async (req, res, next) => {
  try {
    return res.send(await faqService.list());
  } catch (err) {
    next(err);
  }
});

adminFaqRouter.get('/:id', async (req, res, next) => {
  try {
    return res.send(await faqService.findById(req.params.id));
  } catch (err) {
    next(err);
  }
});

adminFaqRouter.post('/', async (req, res, next) => {
  const board = req.body;
  try {
    res.send(await faqService.create(board));
  } catch (err) {
    next(err);
  }
});

adminFaqRouter.put('/:id', async (req, res, next) => {
  const id = req.params.id;
  const board = req.body;
  try {
    res.send(await faqService.update(Number(id), board));
  } catch (err) {
    next(err);
  }
});

adminFaqRouter.delete('/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    res.send(await faqService.delete(Number(id)));
  } catch (err) {
    next(err);
  }
});

export { adminTosRouter, adminNoticeRouter, adminFaqRouter };
