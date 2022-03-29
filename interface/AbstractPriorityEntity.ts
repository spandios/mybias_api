import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
export default abstract class AbstractPriorityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'datetime', nullable: true })
  inactiveAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  priority: Date;

  changePriority(target: AbstractPriorityEntity): void {
    const { priority: originPriority } = this;
    const { priority: targetPriority } = target;
    const originTmpPriority = { priority: originPriority };
    this.priority = targetPriority;
    target.priority = originTmpPriority.priority;
  }
}
