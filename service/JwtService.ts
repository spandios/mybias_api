import jwt from 'jsonwebtoken';
import { MyCallback } from 'default';
import { Jwt } from '../interface/Auth';

export function createJwtToken(userId: number): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.tokenLife,
      },
      (err, encoded) => {
        if (err) return reject(err);
        resolve(encoded);
      },
    );
  });
}

export function createJwtRefreshToken(userId: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      { userId },
      process.env.refreshTokenSecret,
      {
        expiresIn: process.env.refreshTokenLife,
      },
      (err, encoded) => {
        if (err) return reject(err);
        resolve(encoded);
      },
    );
  });
}

export function validateJWtToken(token: string, callback: MyCallback): object | null {
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
      if (err) {
        return err;
      }
      return decoded;
    });
  } else {
    return null;
  }
}

export function validateRefreshJWtToken(refreshToken: string): Promise<number> {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, process.env.refreshTokenSecret, function (err, decoded: Jwt) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(decoded.userId);
      }
    });
  });
}
