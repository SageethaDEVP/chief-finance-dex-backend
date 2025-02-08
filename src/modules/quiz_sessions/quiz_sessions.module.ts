import { Module } from '@nestjs/common';

import { QuizSessionsRepository } from './repositories';
import { QuizSessionServices } from './services';
import { QuizSessionController } from './controllers';
import { QuizUsersRepository } from '../quiz_users/repositories';

@Module({
  controllers: [QuizSessionController],
  providers: [QuizUsersRepository, QuizSessionsRepository, QuizSessionServices],
})
export class QuizSessionssModule {}
