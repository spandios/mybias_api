import express from 'express';
import { upload } from '../service/FileUploadService';

const fileRouter = express.Router();

fileRouter.post('/', upload.single('file'), (req, res) => {
  const file = req.file as any;
  res.send(file.location);
});

export default fileRouter;
