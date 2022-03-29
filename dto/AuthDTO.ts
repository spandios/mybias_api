import { Gender } from '../entity/user/User';
import Country from '../entity/user/Country';

export type DetailJoin = {
  profileImage: string;
  nickname: string;
  birth: Date;
  gender: Gender;
  country: Country;
  defaultProfileColor: string;
};

export type JoinDTO = {
  email: string;
  provider: string;
  providerId: string;
  detailJoin?: DetailJoin;
};
