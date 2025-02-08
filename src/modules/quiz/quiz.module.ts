import { Module } from '@nestjs/common';
import { QuizController } from './controllers';
import { QuizServices } from './services';

@Module({
  controllers: [QuizController],
  providers: [QuizServices],
})
export class QuizModule {}
