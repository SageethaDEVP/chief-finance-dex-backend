import { Module } from '@nestjs/common';
import { GameAuthController } from './controllers';
import { QuizUsersRepository } from '../quiz_users/repositories';
import { GameAuthServices } from './services';
import { QuizSessionsRepository } from '../quiz_sessions/repositories';

@Module({
  controllers: [GameAuthController],
  providers: [GameAuthServices, QuizUsersRepository, QuizSessionsRepository],
})
export class GameAuthModule {}
