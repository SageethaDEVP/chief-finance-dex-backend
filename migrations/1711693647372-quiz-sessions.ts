import { MigrationInterface, QueryRunner } from 'typeorm';

export class QuizSessions1711693647372 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "quiz_sessions" ("id" uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "question_set" text NOT NULL, "wallet_address" text NOT NULL, "is_submitted" boolean NOT NULL DEFAULT false, "selected_answers" text, cfnc_won NUMERIC CHECK (cfnc_won >= 0) NOT NULL DEFAULT 0, "is_claimed" boolean NOT NULL DEFAULT false, stake_amount NUMERIC CHECK (stake_amount >= 0) NOT NULL DEFAULT 0, "vesting_id" SMALLINT, "total_vests" SMALLINT, "vests_claimed" SMALLINT)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "quiz_sessions"`);
  }
}
