import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/user/User';

@EntityRepository()
export class UserRepository extends Repository<User> {}
