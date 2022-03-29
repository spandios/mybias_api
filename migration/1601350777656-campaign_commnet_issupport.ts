import { MigrationInterface, QueryRunner } from 'typeorm';

export class campaignCommnetIssupport1601350777656 implements MigrationInterface {
  name = 'campaignCommnetIssupport1601350777656';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `campaign_comment` ADD `isSupport` tinyint NOT NULL DEFAULT 0',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `campaign_comment` DROP COLUMN `isSupport`', undefined);
  }
}
