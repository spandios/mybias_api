import { EntityRepository, Repository } from 'typeorm';
import Celeb from '../entity/celeb/Celeb';

@EntityRepository()
export class CelebRepository extends Repository<Celeb> {}
