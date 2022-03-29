import { Entity } from 'typeorm';
import BoardEntity from '../../interface/BoardEntity';

@Entity()
export default class Notice extends BoardEntity {}
