import { Inject, Injectable } from '@nestjs/common';
import { QuizUsersRepository } from '../repositories';
import { QuizUsersEntity } from 'src/entities/quiz_users.entity';
import { RedisService } from 'src/infrastructure/redis';
import { Keys } from 'src/modules/quiz/services';
import { DIJWTOption, JwtOption } from 'src/authentication-module';

@Injectable()
export class QuizUserService {
  constructor(
    private readonly quizUsersRepository: QuizUsersRepository,
    private readonly redisService: RedisService,
  ) {}
  async login(walletAddress: string): Promise<void> {}
}
