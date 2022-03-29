import { redis } from '../app';
export enum CacheType {
  USER = 'USER',
  CELEB_LIST = 'CELEB_LIST',
  CAMPAIGN = 'CAMPAIGN',
  FAQ = 'FAQ',
  NOTICE = 'NOTICE',
  TOS = 'TOS',
  CAMPAIGN_COMMENT = 'CAMPAIGN_COMMENT',
  CELEB_COMMENT = 'CELEB_COMMENT',
}

class RedisService {
  static async dirtyCache(type: CacheType | string) {
    console.log('cache clear : ' + type);
    redis.set(type, 'null');
  }

  static async setObject(type: CacheType | string, ob: any, seconds?: number) {
    redis.setex(type, seconds ? seconds : 60 * 10, JSON.stringify(ob));
  }

  static async getObject<T>(type: CacheType | string) {
    return new Promise((resolve: (value: T) => void, reject) => {
      redis.get(type, (err, str) => {
        if (err) {
          reject(err);
        } else {
          if (str == null) resolve(null);
          const parse = JSON.parse(str);
          if (parse == 'null') resolve(null);
          resolve(parse as T);
        }
      });
    });
  }
  static async isCached(type: CacheType | string) {
    return new Promise((resolve, reject) => {
      redis.get(type, (err, str) => {
        if (err) {
          reject(err);
        } else {
          const parse = str == 'ture';
          resolve(parse);
        }
      });
    });
  }
}

export default RedisService;
