import { Entity, ManyToOne } from 'typeorm';
import AbstractImageEntity from '../../interface/AbstractImageEntity';
import Celeb from './Celeb';

@Entity()
class CelebImage extends AbstractImageEntity {
  @ManyToOne(() => Celeb, (celeb) => celeb.images, { onDelete: 'CASCADE' })
  celeb: Celeb;
}

export default CelebImage;
