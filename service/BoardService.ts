import { getRepository } from 'typeorm/index';
import { BoardDTO } from '../dto/BoardDTO';
import { Repository } from 'typeorm/repository/Repository';
import Tos from '../entity/board/Tos';

export class BoardService {
  entityName: string;
  constructor(entityName: string) {
    this.entityName = entityName;
  }

  findById = (id) => {
    return getRepository(this.entityName).findOne(id);
  };
  list = () => {
    return getRepository(this.entityName).find({ order: { createdAt: 'DESC' } });
  };
  create(boardDto: BoardDTO) {
    return getRepository(this.entityName).save(boardDto);
  }
  update(id: number, boardDto: BoardDTO) {
    return getRepository(this.entityName).update({ id }, boardDto);
  }

  async createOrUpdate(content: string) {
    const repository: Repository<Tos> = getRepository(this.entityName);
    const tosList = await repository.find();
    if (tosList.length > 0) {
      const tos = tosList[0];
      await repository.update(tos.id, { content });
    } else {
      await repository.save({ title: 'tos', content });
    }
  }

  delete(id: number) {
    return getRepository(this.entityName).delete({ id });
  }
}
