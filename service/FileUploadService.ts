import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import path from 'path';
AWS.config.accessKeyId = process.env.AWS_ACCESS_KEY;
AWS.config.secretAccessKey = process.env.AWS_SECRET_KEY;
AWS.config.region = process.env.AWS_REGION;
const s3 = new AWS.S3();
export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'mybias-file',
    key: function (req: any, file: any, cb: any) {
      const extension = path.extname(file.originalname);
      cb(null, 'mybias_' + Date.now().toString() + extension);
    },
    acl: 'public-read',
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 용량 제한
});
