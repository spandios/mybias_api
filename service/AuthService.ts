import { User } from '../entity/user/User';
import { createJwtRefreshToken, createJwtToken, validateRefreshJWtToken } from './JwtService';
import { Token } from '../interface/Auth';
import bcrypt from 'bcryptjs';
import { BadRequestException } from '../error/Error';

const saltRounds = 10;

export default class AuthService {
  static refreshToken = async (refreshToken: string): Promise<string> => {
    try {
      const userId = await validateRefreshJWtToken(refreshToken);
      console.log('send refresh token ');
      return await createJwtToken(userId);
    } catch (err) {
      console.log(err);
      return Promise.reject('Fail Refresh Token');
    }
  };

  static async createToken(user: User): Promise<Token> {
    return new Promise(async (resolve, reject) => {
      try {
        const accessToken = await createJwtToken(user.id);
        const refreshToken = await createJwtRefreshToken(user.id);
        resolve({ accessToken, refreshToken });
      } catch (err) {
        reject(err);
        console.log(err);
      }
    });
  }

  static encrypt = (plain: string, cb: (err: Error, hashed: string) => void) => {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) {
        throw new BadRequestException(err.message);
      }

      bcrypt.hash(plain, salt, cb);
    });
  };

  static decrypt = (
    plain: string,
    encrypted: string,
    cb: (err: Error, result: boolean) => void,
  ) => {
    bcrypt.compare(plain, encrypted, (err, result) => {
      if (err) {
        console.log('compare error : ' + err.message);
        cb(err, null);
      } else {
        cb(null, result);
      }
    });
  };
}
