import { MigrationInterface, QueryRunner } from 'typeorm';

export class support1601034756849 implements MigrationInterface {
  name = 'support1601034756849';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `support` ADD `isRefund` tinyint NOT NULL DEFAULT 0',
      undefined,
    );
    await queryRunner.query('ALTER TABLE `support` ADD `refundAt` datetime NULL', undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `support` DROP COLUMN `refundAt`', undefined);
    await queryRunner.query('ALTER TABLE `support` DROP COLUMN `isRefund`', undefined);
  }
}
