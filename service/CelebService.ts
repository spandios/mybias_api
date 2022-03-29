import Celeb from '../entity/celeb/Celeb';
import { DeleteResult, getRepository, UpdateResult } from 'typeorm';
import { CelebCreateDTO } from '../dto/CelebDTO';
import CelebImage from '../entity/celeb/CelebImage';
import { User } from '../entity/user/User';
import CelebToUser from '../entity/celeb/CelebToUser';
import CelebNotice from '../entity/celeb/CelebNotice';
import { BadRequestException, NotFoundException } from '../error/Error';
import CelebComment from '../entity/celeb/CelebComment';
import CommonService from './CommonService';
import RedisService, { CacheType } from './RedisService';
import UserService from './UserService';

export default class CelebService {
  static async create(celebDto: CelebCreateDTO): Promise<Celeb> {
    const celeb = new Celeb();
    celeb.name = celebDto.name;
    celeb.profileImage = celebDto.profileImage;
    celeb.images = celebDto.images.map((url) => new CelebImage(url));
    await CelebService.dirtyCacheList();
    return getRepository(Celeb).save(celeb);
  }

  static async dirtyCacheList(): Promise<void> {
    await RedisService.dirtyCache(CacheType.CELEB_LIST);
  }

  static async postComment(
    celebId: number,
    userId: number,
    comment: string,
  ): Promise<CelebComment> {
    const celeb = await CommonService.findById(Celeb, celebId);
    const user = await CommonService.findById(User, userId);
    const newComment = new CelebComment();
    newComment.celeb = celeb;
    newComment.user = user;
    newComment.comment = comment;
    return getRepository(CelebComment).save(newComment);
  }

  static async commentList(celebId: number): Promise<CelebComment[]> {
    return getRepository(CelebComment)
      .createQueryBuilder('cc')
      .innerJoinAndSelect('cc.user', 'user')
      .innerJoin('cc.celebId', 'celeb', 'celeb.id = :celebId', { celebId })
      .getMany();
  }

  static async list() {
    return getRepository(Celeb)
      .createQueryBuilder('celeb')
      .orderBy('celeb.priority', 'DESC')
      .getMany();
  }

  static findOne(id: number): Promise<Celeb> {
    return getRepository(Celeb)
      .createQueryBuilder('celeb')
      .leftJoinAndSelect('celeb.campaigns', 'campaign', 'campaign.active = 1')
      .leftJoinAndSelect('campaign.images', 'camImages')
      .leftJoinAndSelect('campaign.completedImages', 'camCompleteImages')
      .leftJoinAndSelect('celeb.images', 'images')
      .orderBy('campaign.createdAt', 'DESC')
      .where('celeb.id = :id', { id })
      .getOne();
  }

  static async update(id: number, celeb: Celeb): Promise<Celeb> {
    await CelebService.dirtyCacheList();
    const celebOrigin = await getRepository(Celeb).findOne(id);
    celebOrigin.name = celeb.name;
    celebOrigin.profileImage = celeb.profileImage;
    celebOrigin.active = celeb.active;
    return getRepository(Celeb).save(celebOrigin);
  }

  static async followingCeleb(celeb: Celeb, user: User): Promise<CelebToUser> {
    const exist = await getRepository(CelebToUser).findOne({ celeb, user });
    if (!exist) {
      const celebToUser = new CelebToUser();
      celebToUser.celeb = celeb;
      celebToUser.user = user;
      celeb.followCnt = celeb.followCnt + 1;
      user.followCnt = user.followCnt + 1;
      await getRepository(Celeb).save(celeb);
      await getRepository(User).save(user);
      return getRepository(CelebToUser).save(celebToUser);
    } else {
      return null;
    }
  }

  static async unFollowCeleb(celeb: Celeb, user: User): Promise<DeleteResult> {
    celeb.followCnt = celeb.followCnt - 1;
    user.followCnt = user.followCnt - 1;
    await getRepository(Celeb).save(celeb);
    await getRepository(User).save(user);
    return getRepository(CelebToUser).delete({ user, celeb });
  }

  static async celebCommentList(celebId: number): Promise<CelebComment[]> {
    return getRepository(CelebComment)
      .createQueryBuilder('cc')
      .innerJoinAndSelect('cc.user', 'user')
      .where('cc.celebId = :celebId', { celebId })
      .orderBy('cc.id', 'DESC')
      .getMany();
  }

  static async deleteCelebById(celebId: number) {
    await CelebService.dirtyCacheList();
    return getRepository(Celeb).delete({ id: celebId });
  }

  static async addProfileImage(celebId: number, url: string) {
    await CelebService.dirtyCacheList();
    const celeb = await this.findOne(celebId);
    celeb.profileImage = url;
    return getRepository(Celeb).save(celeb);
  }

  static async addImage(celebId: number, url: string) {
    const celeb = await CelebService.findOne(celebId);
    const celebImage = new CelebImage(url);
    celebImage.celeb = celeb;
    celeb.images.push(celebImage);
    return getRepository(Celeb).save(celeb);
  }

  static async deleteImageByUrl(url: string): Promise<DeleteResult> {
    return getRepository(CelebImage).delete({ url });
  }
  static async deleteImageById(id: number): Promise<DeleteResult> {
    return getRepository(CelebImage).delete({ id });
  }

  static async changeImageOrder(celebId: number, images: CelebImage[]): Promise<Celeb> {
    const celeb = await getRepository(Celeb).findOne(celebId);
    celeb.images = [];
    images.map((image) => {
      this.deleteImageById(image.id);
      delete image.id;
      celeb.images.push(image);
    });
    return await getRepository(Celeb).save(celeb);
  }

  static async createNotice(title: string, content: string, celebId: number): Promise<CelebNotice> {
    try {
      const celeb = await getRepository(Celeb).findOne(celebId);
      return await getRepository(CelebNotice).save(new CelebNotice(title, content, celeb));
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  static async listNotice(celebId: number): Promise<CelebNotice[]> {
    return await getRepository(CelebNotice)
      .createQueryBuilder('notice')
      .where('notice.celeb = :celebId', { celebId })
      .orderBy('notice.createdAt', 'DESC')
      .getMany();
  }

  static async updateNotice(noticeId: number, content: string): Promise<UpdateResult> {
    return await getRepository(CelebNotice).update(noticeId, { content });
  }

  static changePriority = async (originId: number, targetId: number): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await CelebService.dirtyCacheList();
        const celebRepository = getRepository(Celeb);
        const originCeleb = await celebRepository.findOne(originId);
        const targetCeleb = await celebRepository.findOne(targetId);
        if (!originCeleb || !targetCeleb) {
          throw new NotFoundException();
        }
        originCeleb.changePriority(targetCeleb);
        await celebRepository.save(originCeleb);
        await celebRepository.save(targetCeleb);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  };
}
