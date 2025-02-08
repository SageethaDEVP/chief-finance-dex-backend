import { Injectable, Logger } from '@nestjs/common';
import { QuizSessionsRepository } from '../repositories';
import { QuizSessionsEntity } from 'src/entities';
import { QuizUsersRepository } from 'src/modules/quiz_users/repositories';
import { MoreThan } from 'typeorm';
import { TokenService } from 'src/authentication-module/services';
import { GameAuthTokenPayload } from 'src/modules/game-auth/types';
import {
  ForbiddenException,
  UnauthorizedException,
} from 'src/common/exceptions';
import { SchedulerRegistry } from '@nestjs/schedule';
import { RedisService } from 'src/infrastructure/redis';
import { Keys } from 'src/modules/quiz/services';
import axios from 'axios';

type NonAuthorisedResponse = {
  message: string;
};
type GetSessionResponse =
  | (QuizSessionsEntity & { levelWiseScore: { [key: string]: number } })
  | NonAuthorisedResponse;

@Injectable()
export class QuizSessionServices {
  constructor(
    private readonly quizSessionsRepository: QuizSessionsRepository,
    private readonly quizUsersRepository: QuizUsersRepository,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly redisService: RedisService,
  ) {}

  options = new TokenService({
    secret: process.env.JWT_SECRET as string,
    expire: Number(process.env.JWT_EXPIRE),
    refreshExpire: Number(process.env.JWT_REFRESH_EXPIRE),
  });

  logger: Logger = new Logger(QuizSessionServices.name);
  async getSession(
    sessionId: string,
    token: string,
  ): Promise<GetSessionResponse> {
    try {
      const decoded = this.options.verify<GameAuthTokenPayload>(token);

      const session = await this.quizSessionsRepository.getOneByParams({
        where: { id: sessionId, isSubmitted: true },
        throwError: false,
      });
      if (session) {
        if (
          session.walletAddress.toLowerCase() !==
          decoded.walletAddress.toLowerCase()
        ) {
          return { message: 'You cant get data of other wallet session' };
        } else {
          const { questionSet, selectedAnswers } = session;
          const questionSetJSON = JSON.parse(questionSet);
          const selectedAnswersJSON = JSON.parse(selectedAnswers);
          const levelWiseScore = {};

          Object.keys(questionSetJSON).map((key) => {
            let innerScore = 0;
            questionSetJSON[key].map((set, index) => {
              if (
                set.answer === selectedAnswersJSON[key].selectedAnswer[index]
              ) {
                innerScore++;
              }
              levelWiseScore[key] = innerScore;
            });
          });

          return { ...session, levelWiseScore };
        }
      }
      return { message: 'No data found' };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async storeSession(
    sessionId: string,
    selectedAnswers: string,
    questionNumber: number,
    level: number,
    token: string,
  ): Promise<void> {
    try {
      const decoded = this.options.verify<GameAuthTokenPayload>(token);
      const sessionFromDB = await this.quizSessionsRepository.getOneByParams({
        where: { id: sessionId },
        throwError: false,
      });
      if (!sessionFromDB) {
        return;
      }
      if (
        sessionFromDB.walletAddress.toLowerCase() !==
        decoded.walletAddress.toLowerCase()
      )
        throw new UnauthorizedException({
          message: 'Unauthorized wallet address.',
        });
      if (sessionFromDB && sessionFromDB.isSubmitted) {
        return;
      }
      await this.quizSessionsRepository.update(
        {
          id: sessionFromDB.id,
        },
        { selectedAnswers: selectedAnswers },
      );
      // submitting quiz if it is last question
      const totalLevels = await this.redisService.get(Keys.LEVEL);
      const questionsPerLevel = await this.redisService.get(Keys.QUESTIONS);
      const isLastQuestion =
        level === Number(totalLevels) &&
        questionNumber === Number(questionsPerLevel) - 1;
      if (isLastQuestion) {
        const prevVestTime = new Date().getTime();
        await this.quizSessionsRepository.update(
          { id: sessionFromDB.id },
          {
            isSubmitted: true,
            prevVestTime: prevVestTime,
          },
        );
        this.deleteCronHandler(sessionFromDB.id);
      }
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
  async getAnswer(
    sessionId: string,
    levelIndex: number,
    questionIndex: number,
    selectedAnswer: number,
  ): Promise<boolean | string> {
    try {
      const sessionFromDB = await this.quizSessionsRepository.getOneByParams({
        where: { id: sessionId },
        throwError: true,
      });
      if (sessionFromDB.isSubmitted) {
        return false;
      }
      const questionSet = JSON.parse(sessionFromDB.questionSet);
      const quizUser = await this.quizUsersRepository.getOneByParams({
        where: {
          walletAddress: sessionFromDB.walletAddress.toLowerCase(),
        },
        throwError: false,
      });
      // deducting staked game credits
      if (quizUser) {
        await this.quizUsersRepository.update(
          { walletAddress: sessionFromDB.walletAddress.toLowerCase() },
          { gameCredits: quizUser.gameCredits - sessionFromDB.stakeAmount },
        );
      }

      // return true | false | 'not selscted'
      if (questionSet[levelIndex][questionIndex].answer === selectedAnswer) {
        await this.quizSessionsRepository.update(
          { id: sessionFromDB.id },
          {
            CFNC_won:
              Number(sessionFromDB.CFNC_won) +
              Number(sessionFromDB.stakeAmount),
          },
        );
        return true;
      }

      if (selectedAnswer === -1) {
        return 'not Selected';
      }

      return false;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAllSessions(token: string) {
    try {
      const decoded = this.options.verify<GameAuthTokenPayload>(token);
      const sessions = await this.quizSessionsRepository.getByParams({
        where: {
          walletAddress: decoded.walletAddress.toLowerCase(),
          isSubmitted: true,
          CFNC_won: MoreThan(0),
          isClaimed: false,
        },
        order: {
          createdAt: 'DESC',
        },
        throwError: false,
      });
      // const filteredSesssion = sessions.filter((session) => {
      //   const selectedAnswers = JSON.parse(session.selectedAnswers);
      //   if (
      //     selectedAnswers !== null &&
      //     Object.keys(selectedAnswers).length === 1
      //   ) {
      //     const data = Object.keys(selectedAnswers).map((selectedAnswer) => {
      //       console.log({ selectedAnswer: selectedAnswers[selectedAnswer] });
      //       const isOrphan = selectedAnswers[
      //         selectedAnswer
      //       ].selectedAnswer.every((ele) => {
      //         return ele === -1;
      //       });
      //       return !isOrphan;
      //     });
      //     return data[0];
      //   } else {
      //     return true;
      //   }
      // });
      // const nullRemoved = sessions.filter(
      //   (session) => session.selectedAnswers !== null,
      // );
      // nullRemoved.map((sesssion) =>
      //   console.log('filter', sesssion.selectedAnswers),
      // );
      return sessions;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(error);
    }
  }

  async textToSpeech(text: string, token: string) {
    try {
      const decode = this.options.verify<GameAuthTokenPayload>(token);
      if (!decode.walletAddress) {
        throw new UnauthorizedException({
          message: 'Unauthorized wallet address.',
        });
      }
      const apiUrl =
        'https://natural-text-to-speech-converter-at-lowest-price.p.rapidapi.com/';
      const data = await axios.post(
        apiUrl,
        JSON.stringify({
          ttsService: 'wavenet',
          audioKey: 'ff63037e-6994-4c50-9861-3e162ee56468',
          storageService: 's3',
          text: `<speak>${text}</speak>`,
          voice: {
            value: 'en-US-Wavenet-H',
            lang: 'en-US',
          },
          audioOutput: {
            fileFormat: 'mp3',
            sampleRate: 24000,
          },
        }),
        {
          headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': process.env.TTS_KEY,
            'X-RapidAPI-Host':
              'natural-text-to-speech-converter-at-lowest-price.p.rapidapi.com',
          },
        },
      );
      return data.data;
    } catch (error) {
      throw new ForbiddenException({ message: error });
    }
  }

  deleteCronHandler(name: string) {
    const cronJobs = this.schedulerRegistry.getCronJobs();
    if (cronJobs.has(name)) {
      this.schedulerRegistry.deleteCronJob(name);
      this.logger.log(`deleted cron ${name}`);
    }
  }
}
