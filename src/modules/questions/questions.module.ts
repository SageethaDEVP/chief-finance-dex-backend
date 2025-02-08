import { Module } from '@nestjs/common';

import { QuestionsController } from './controllers';
import { QuestionsRepository } from './repositories';
import { QuestionsServices } from './services';
import { QuizSessionsRepository } from '../quiz_sessions/repositories';
import { QuizUsersRepository } from '../quiz_users/repositories';

@Module({
  controllers: [QuestionsController],
  providers: [
    QuestionsServices,
    QuestionsRepository,
    QuizSessionsRepository,
    QuizUsersRepository,
  ],
})
export class QuestionsModule {}
