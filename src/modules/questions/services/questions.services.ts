import { Injectable, Logger } from '@nestjs/common';
import { QuestionsRepository } from '../repositories/questions.repository';
import { DataSource, ILike } from 'typeorm';
import {
  pickRandomElementsFromArray,
  shuffleArray,
} from 'src/utils/questionServiceHelper';
import { QuizSessionsRepository } from 'src/modules/quiz_sessions/repositories';
import { QuizSessionsEntity } from 'src/entities';
import { RedisService } from 'src/infrastructure/redis';
import { Keys } from 'src/modules/quiz/services';
import { TokenService } from 'src/authentication-module/services';
import { UnauthorizedException } from 'src/common/exceptions';
import { GameAuthTokenPayload } from 'src/modules/game-auth/types';
import { CronJob } from 'cron';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { QuizUsersEntity } from 'src/entities/quiz_users.entity';

export type Question = {
  id: string;
  query: string;
  choices: string[];
};

@Injectable()
export class QuestionsServices {
  constructor(
    private readonly questionsRepository: QuestionsRepository,
    private readonly quizSessionsRepository: QuizSessionsRepository,
    private readonly redisService: RedisService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly quizUsersRepository: DataSource,
  ) {}

  options = new TokenService({
    secret: process.env.JWT_SECRET as string,
    expire: Number(process.env.JWT_EXPIRE),
    refreshExpire: Number(process.env.JWT_REFRESH_EXPIRE),
  });

  logger: Logger = new Logger(QuestionsServices.name);

  // private readonly quizUsersRepository = DataSource(QuizUsersEntity);
  async getQuestions(
    level: number,
    genre: string,
    sessionId: string,
    stakeAmount: number,
    token: string,
  ): Promise<Question[]> {
    try {
      const totalLevels = await this.redisService.get(Keys.LEVEL);
      const number = await this.redisService.get(Keys.QUESTIONS);
      if (level > totalLevels) {
        throw new Error('Total number of level exceeds');
      }
      const decoded = this.options.verify<GameAuthTokenPayload>(token);
      const walletAddress = decoded.walletAddress;
      const questions = await this.questionsRepository.getByParams({
        where: { genre: ILike(genre), level: level },
      });
      questions.forEach((question) => {
        const correctAnswer = question.choices[question.answer];
        shuffleArray(question.choices);
        question.answer = question.choices.indexOf(correctAnswer);
      });
      const randomElements = pickRandomElementsFromArray(
        questions,
        number ? number : 1,
      );
      const session = new QuizSessionsEntity();
      session.id = sessionId;
      const sessionFromDB = await this.quizSessionsRepository.getOneByParams({
        where: { id: sessionId },
        throwError: false,
      });
      let questionSet = {};
      if (sessionFromDB) {
        questionSet = JSON.parse(sessionFromDB.questionSet);
      } else {
        await this.quizUsersRepository
          .createQueryBuilder()
          .update(QuizUsersEntity)
          .set({ totalGamesPlayed: () => 'total_games_played + 1' })
          .where('wallet_address = :walletAddress', {
            walletAddress: walletAddress.toLowerCase(),
          })
          .execute();
      }

      const questionsWithLevels = {
        ...questionSet,
        [level]: randomElements,
      };

      session.questionSet = JSON.stringify(questionsWithLevels);
      session.walletAddress = walletAddress.toLowerCase();
      session.stakeAmount = stakeAmount;
      session.totalVests = 4;
      await this.quizSessionsRepository.save(session);
      // const;

      const cronJobs = this.schedulerRegistry.getCronJobs();
      if (!cronJobs.has(sessionId)) {
        this.addCronHandler(session.id);
      }

      const questionsWithoutAnswer = randomElements.map<Question>((que) => {
        return { id: que.id, query: que.query, choices: que.choices };
      });

      return questionsWithoutAnswer;
    } catch (error) {
      console.log({ error });
      throw new UnauthorizedException(error);
    }
  }

  addCronHandler(name: string) {
    const job = new CronJob(CronExpression.EVERY_5_SECONDS, async () => {
      const quiz = await this.quizSessionsRepository.getOneByParams({
        where: { id: name },
        throwError: false,
      });
      if (!quiz) return;
      // const totalLevels = await this.redisService.get(Keys.LEVEL);
      // const questionsPerLevel = await this.redisService.get(Keys.QUESTIONS);
      const [totalLevels, questionsPerLevel] = await Promise.all([
        this.redisService.get(Keys.LEVEL),
        this.redisService.get(Keys.QUESTIONS),
      ]);
      const totalQuestions = Number(totalLevels) * Number(questionsPerLevel);
      const quizStartTime = new Date(quiz.createdAt).getTime();

      // const totalQuestions = Number(totalLevels) * Number(questionsPerLevel);
      // const quizStartTime = new Date(quiz.createdAt).getTime();

      // total time plus 2 minute extra for any error buffer time
      const quizExpireTime =
        (quizStartTime + totalQuestions) * (45 * 1000) + 2 * 60 * 1000;
      if (Date.now() > quizExpireTime) {
        await this.quizSessionsRepository.update(
          { id: name },
          {
            isSubmitted: true,
            prevVestTime: quizExpireTime,
          },
        );
        this.logger.log(`quiz ${name} is submitted because of expiry `);
        this.deleteCronHandler(name);
      }
    });

    this.schedulerRegistry.addCronJob(name, job);
    job.start();
    this.logger.log(`job ${name} added for every 5 seconds!`);
  }
  deleteCronHandler(name: string) {
    const cronJobs = this.schedulerRegistry.getCronJobs();
    if (cronJobs.has(name)) {
      this.schedulerRegistry.deleteCronJob(name);
      this.logger.log(`deleted cron ${name}`);
    }
  }
}
