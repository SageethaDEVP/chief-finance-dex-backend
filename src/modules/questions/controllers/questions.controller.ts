import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Question, QuestionsServices } from '../services/questions.services';
import { GetQuestion } from '../dto';

@Controller('questions')
@ApiTags('questions')
export class QuestionsController {
  constructor(private readonly questionServicce: QuestionsServices) {}

  @Post()
  async getQuestions(
    @Headers('x-refresh-token') token: string,
    @Body() body: GetQuestion,
  ): Promise<Question[]> {
    const { genre, level, sessionId, stakeAmount } = body;
    return this.questionServicce.getQuestions(
      level,
      genre,
      sessionId,
      stakeAmount,
      token,
    );
  }
}
