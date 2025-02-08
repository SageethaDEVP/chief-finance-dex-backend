import { Module } from '@nestjs/common';
import { QuizUsersRepository } from './repositories';
import { QuizUserService } from './services';
import { QuizUserController } from './controllers';

@Module({
  controllers: [QuizUserController],
  providers: [QuizUsersRepository, QuizUserService],
})
export class QuizUsersModule {}
