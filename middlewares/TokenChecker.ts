import jwt, { VerifyErrors } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { Jwt } from '../interface/Auth';
import Logger from '../service/LoggerService';

export default (req: Request, res: Response, next: NextFunction): void => {
  const strings = req.headers['authorization'] as string;
  if (strings != null) {
    const token = strings.split('Bearer ')[1];
    // decode token
    if (token != null) {
      // verifies secret and checks exp
      jwt.verify(token, process.env.JWT_SECRET, (err: VerifyErrors, decoded: Jwt) => {
        if (err) {
          console.log('token error');
          if (err.name === 'TokenExpiredError') {
            res.status(401).send('Token Expired');
          } else {
            res.status(401).send('UnAuthorization');
          }
        }
        if (decoded as Jwt) {
          const jwt = decoded as Jwt;
          req.userId = jwt.userId;
          Logger.info(`${req.url} | USER ID : ${req.userId}`);
        }
        next();
      });
    } else {
      res.status(403).send('Empty Token');
    }
  } else {
    res.status(403).send('EmptyToken');
  }
};
