import Celeb from '../entity/celeb/Celeb';
import { User } from '../entity/user/User';
import Country from '../entity/user/Country';
import CelebToUser from '../entity/celeb/CelebToUser';

export class UserResponse {
  email: string;
  role: string;
  gender: string;
  nickname: string;
  profileImage: string;
  country: Country;
  completeJoin: boolean;
  birth: Date;
  active: boolean;
}

export class UserInitResponse {
  user: UserResponse;
  supportingCelebs: Celeb[];
  constructor(user: User, celebs: CelebToUser[]) {
    const userResponse = new UserResponse();
    userResponse.active = user.active;
    userResponse.birth = user.birth;
    userResponse.completeJoin = user.completeJoin;
    userResponse.gender = user.gender;
    userResponse.nickname = user.nickname;
    userResponse.profileImage = user.profileImage;
    userResponse.country = user.country;
    this.user = userResponse;
    this.supportingCelebs = celebs.map((celebToUser) => celebToUser.celeb);
  }
}
