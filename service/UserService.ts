import { User } from '../entity/user/User';
import { getRepository } from 'typeorm';
import RedisService, { CacheType } from './RedisService';
import Support from '../entity/support/Support';
import CelebToUser from '../entity/celeb/CelebToUser';
import PageRequest from '../interface/Page/PageRequest';
import Page from '../interface/Page/Page';
import Campaign from '../entity/campaign/Campaign';
import CommonService from './CommonService';

export default class UserService {
  static async dirtyCacheUser(userId: number): Promise<void> {
    await RedisService.dirtyCache(CacheType.USER + userId);
  }

  static save(user: User): Promise<User> {
    const repository = getRepository(User);
    return repository.save(user);
  }

  static isExist(providerId: string, provider: string): Promise<User> {
    const repository = getRepository(User);
    return repository.findOne({ provider: provider, providerId: providerId });
  }

  static isExistByEmail(email: string): Promise<User> {
    const repository = getRepository(User);
    return repository.findOne({ email });
  }

  static findById(id: number): Promise<User> {
    const repository = getRepository(User);
    return repository.findOne(id);
  }

  static findByEmail(email: string): Promise<User> {
    return getRepository(User)
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  static join(user: User): Promise<User> {
    const repository = getRepository(User);
    return repository.save(user);
  }

  static checkNickname(nickname: string): Promise<User> {
    return getRepository(User).findOne({ nickname });
  }

  static async me(userId: number): Promise<User> {
    const repository = getRepository(User);
    return repository.createQueryBuilder('user').where('user.id = :userId', { userId }).getOne();
  }

  static async followingCelebList(userId: number): Promise<CelebToUser[]> {
    return getRepository(CelebToUser)
      .createQueryBuilder('celebToUser')
      .innerJoinAndSelect('celebToUser.celeb', 'celeb')
      .where('celebToUser.user = :userId', { userId })
      .getMany();
  }

  static async supportList(userId: number) {
    return getRepository(Support)
      .createQueryBuilder('support')
      .innerJoinAndSelect('support.campaign', 'campaign')
      .leftJoinAndSelect('campaign.images', 'camImages')
      .where('support.user = :userId', { userId })
      .getMany();
  }

  static async detailUser(userId: number): Promise<User> {
    return getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.celebsToUser', 'celebs')
      .leftJoinAndSelect('celebs.celeb', 'celeb')
      .leftJoinAndSelect('user.supports', 'supports')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  static userList = async (pageRequest: PageRequest, wheres?: string[]): Promise<Page<User>> => {
    return await CommonService.paging(User, pageRequest, wheres);
  };
}
