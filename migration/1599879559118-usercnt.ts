import { MigrationInterface, QueryRunner } from 'typeorm';

export class usercnt1599879559118 implements MigrationInterface {
  name = 'usercnt1599879559118';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user` ADD `followCnt` int NOT NULL DEFAULT 0', undefined);
    await queryRunner.query(
      'ALTER TABLE `user` ADD `supportCnt` int NOT NULL DEFAULT 0',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `supportCnt`', undefined);
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `followCnt`', undefined);
  }
}
