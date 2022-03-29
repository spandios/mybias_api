import express, { Router } from 'express';
import compression from 'compression'; // compresses requests
import bodyParser from 'body-parser';
import lusca from 'lusca';
import path from 'path';
import 'reflect-metadata';
import cors from 'cors';
import { createConnection, QueryFailedError, getConnectionOptions, getRepository } from 'typeorm';
import passport from 'passport';
import helmet from 'helmet';
import indexRouter from './router';
import adminRouter from './admin/router';
import PassportService from './service/PassportService';
import 'moment/locale/ko';
import moment from 'moment';
import * as dotenv from 'dotenv';
import {
  AccessDeniedException,
  BadRequestException,
  NotFoundException,
  RequestError,
  ServerError,
  UnAuthorizationException,
} from './error/Error';
import Logger from './service/LoggerService';
import { initRedis } from './config/RedisConn';
import { RedisClient } from 'redis';
import { ValidationError } from 'class-validator';
import paypal from '@paypal/checkout-server-sdk';
const appVer = '1.0.2';
dotenv.config();
function makeEnvironment() {
  const clientId =
    process.env.NODE_ENV === 'ecs'
      ? process.env.PAYPAL_CLIENT_ID
      : 'AXF9vwigjQCTjiaVeNBFlSWgGqTGx2qKIo9Svizckdx3KmHM3BABGBWu-QGr6KlDtBn7d3zwdEmuyPtb';
  const clientSecret =
    process.env.NODE_ENV === 'ecs'
      ? process.env.PAYPAL_CLIENT_SECRET
      : '';

  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'ecs') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

export const environment = makeEnvironment();
export const payPalHttpClient = new paypal.core.PayPalHttpClient(environment);
const app = express();
export let redis: RedisClient = null;
const corsList = [
  'admin.mybias.io',
  'mybias.io',
  'http://admin.mybias.io',
  'http://localhost:3001',
  'https://mybias.io',
  'http://localhost:3000',
  'https://www.mybias.io',
];

getConnectionOptions(process.env.NODE_ENV).then((connectionOptions) => {
  createConnection({ ...connectionOptions, name: 'default' })
    .then((conn) => {
      settingApp();
    })
    .catch((err) => {
      throw new Error(err);
    });
});

function settingApp() {
  moment.locale('ko');
  app.use(helmet());
  redis = initRedis();
  app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
  app.use(compression());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(lusca.xframe('SAMEORIGIN'));
  app.use(lusca.xssProtection(true));
  app.use(
    cors({
      origin: corsList,
    }),
  );
  app.use(passport.initialize());
  new PassportService();
  // app.use(function (req: express.Request, res: express.Response, next: express.NextFunction) {
  //   Logger.info(
  //     `${req.method} ${req.url} ${res.statusCode} | ip -> ${req.ip} | ${
  //       req.hostname
  //     } | ${req.header('user-agent')} `,
  //   );
  //   next();
  // });
  app.get('/', (req, res, next) => {
    res.send(appVer);
  });
  app.get('/health', (req, res) => {
    res.send(appVer);
  });
  const webhookRouter = Router();
  webhookRouter.post('/webhook/paypal/success', (req, res, next) => {
    setTimeout(() => {
      console.log(req.body.resource.result.id);
    }, 5000);
  });
  app.use('/api', indexRouter);
  app.use('/api/admin', adminRouter);
  app.use('/', webhookRouter);

  app.use(function (err, req, res, next) {
    if (Array.isArray(err)) {
      if (err.length > 0) {
        console.log(err[0]);
        if (err[0] instanceof ValidationError) {
          console.log('validationError');
          return res.status(400).send(err);
        }
      }
    }
    if (err)
      if (!err.statusCode) {
        Logger.error(
          `[${req.ip} -- [${new Date()}]] --- [${500} ${req.method} ${req.url}]  ${
            err.message
          } stack : ${err.stack} `,
        );
        return res.status(500).json(err.message);
      } else {
        const reqError = err as RequestError;
        Logger.error(
          `[${req.ip} -- [${new Date()}]] --- [${reqError.statusCode} ${req.method} ${req.url}]  ${
            reqError.message
          }`,
        );
        return res.status(reqError.statusCode).json(reqError.message);
      }
  });

  app.use(function (req: express.Request, res: express.Response) {
    return res.status(404).send('can not found your request');
  });
}

export default app;
