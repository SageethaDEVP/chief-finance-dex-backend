import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnInQuizSessionTable1715151365315
  implements MigrationInterface
{
  name = 'AddColumnInQuizSessionTable1715151365315';
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      `ALTER TABLE "quiz_sessions" ADD "prev_vest_time" BIGINT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      'ALTER TABLE "quiz_sessions" DROP COLUMN "prev_vest_time"',
    );
  }
}
