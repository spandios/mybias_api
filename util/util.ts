import { getRepository } from 'typeorm';
import Faq from '../entity/board/Faq';
import Notice from '../entity/board/Notice';
import Tos from '../entity/board/Tos';
import Support from '../entity/support/Support';
import { User } from '../entity/user/User';
import Campaign from '../entity/campaign/Campaign';
import CelebNotice from '../entity/celeb/CelebNotice';
import CelebToUser from '../entity/celeb/CelebToUser';
import Celeb from '../entity/celeb/Celeb';
import { BadRequestException } from '../error/Error';

export const deleteAll = async () => {
  await getRepository(Faq).delete({});
  await getRepository(Notice).delete({});
  await getRepository(Tos).delete({});
  await getRepository(Support).delete({});
  await getRepository(User).delete({});
  await getRepository(Campaign).delete({});
  await getRepository(CelebNotice).delete({});
  await getRepository(CelebToUser).delete({});
  await getRepository(Celeb).delete({});
  await getRepository(Support).delete({});
};

export const toNumber = (str: string): number => {
  if (Number.isNaN(Number(str))) {
    throw new BadRequestException('NAN');
  } else {
    return Number(str);
  }
};
