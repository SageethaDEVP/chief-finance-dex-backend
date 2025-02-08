import { Module } from '@nestjs/common';
import { CronService } from './services/cron.services';
// import { QuizSessionController } from '../quiz_sessions/controllers';
// import { QuizSessionServices } from '../quiz_sessions/services';
// import { QuizSessionController } from '../quiz_sessions/controllers';
import { QuizSessionsRepository } from '../quiz_sessions/repositories';
import { QuizUsersRepository } from '../quiz_users/repositories';

@Module({
  // controllers: [QuizSessionServices],
  // controllers: [QuizSessionController],
  providers: [QuizSessionsRepository, QuizUsersRepository, CronService],
})
export class CronModule {}
