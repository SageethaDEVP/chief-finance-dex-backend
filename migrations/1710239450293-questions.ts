import { MigrationInterface, QueryRunner } from 'typeorm';

export class Questions1710239450293 implements MigrationInterface {
  name = 'Questions1710239450293';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "questions" ("id" uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY, "query" text NOT NULL UNIQUE, "choices" text[4] NOT NULL, "answer" SMALLINT NOT NULL, "genre" text NOT NULL, "level" SMALLINT NOT NULL, "explanation" text NOT NULL)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "questions"`);
  }
}
