import { MigrationInterface, QueryRunner } from 'typeorm';

export class CelebToUser1600189138146 implements MigrationInterface {
  name = 'CelebToUser1600189138146';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `celeb_to_user` ADD `id` int NOT NULL PRIMARY KEY AUTO_INCREMENT',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `celeb_to_user` ADD `active` tinyint NOT NULL DEFAULT 1',
      undefined,
    );
    await queryRunner.query('ALTER TABLE `celeb_to_user` CHANGE `id` `id` int NOT NULL', undefined);
    await queryRunner.query('ALTER TABLE `celeb_to_user` DROP PRIMARY KEY', undefined);
    await queryRunner.query(
      'ALTER TABLE `celeb_to_user` ADD PRIMARY KEY (`id`, `userId`, `celebId`)',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `celeb_to_user` CHANGE `id` `id` int NOT NULL AUTO_INCREMENT',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `celeb_to_user` ADD CONSTRAINT `FK_c123ffa82c2b9004a77d3333429` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `celeb_to_user` ADD CONSTRAINT `FK_8ac6071293c1a25244a5282b661` FOREIGN KEY (`celebId`) REFERENCES `celeb`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `celeb_to_user` DROP FOREIGN KEY `FK_8ac6071293c1a25244a5282b661`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `celeb_to_user` DROP FOREIGN KEY `FK_c123ffa82c2b9004a77d3333429`',
      undefined,
    );
    await queryRunner.query('ALTER TABLE `celeb_to_user` CHANGE `id` `id` int NOT NULL', undefined);
    await queryRunner.query('ALTER TABLE `celeb_to_user` DROP PRIMARY KEY', undefined);
    await queryRunner.query('ALTER TABLE `celeb_to_user` ADD PRIMARY KEY (`id`)', undefined);
    await queryRunner.query(
      'ALTER TABLE `celeb_to_user` CHANGE `id` `id` int NOT NULL AUTO_INCREMENT',
      undefined,
    );
    await queryRunner.query('ALTER TABLE `celeb_to_user` DROP COLUMN `active`', undefined);
    await queryRunner.query('ALTER TABLE `celeb_to_user` DROP COLUMN `id`', undefined);
  }
}
