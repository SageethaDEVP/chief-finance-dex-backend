import { MigrationInterface, QueryRunner } from 'typeorm';

export class QuizUser1713417210060 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        CREATE TABLE "quiz_users" ("id" uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,"createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "wallet_address"	text NOT NULL, "total_games_played" INTEGER NOT NULL DEFAULT 0, "total_points_scored" INTEGER NOT NULL DEFAULT 0, game_credits NUMERIC CHECK (game_credits >= 0) NOT NULL DEFAULT 100, "claims" JSON)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "quiz_users"`);
  }
}
