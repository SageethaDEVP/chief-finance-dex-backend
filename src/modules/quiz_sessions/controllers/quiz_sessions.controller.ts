import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetAnswer, GetSession, StoreSession } from '../dto';
import { QuizSessionServices } from '../services';

@Controller('quiz-session')
@ApiTags('quiz-session')
export class QuizSessionController {
  constructor(private readonly quizSessionService: QuizSessionServices) {}

  @Post('/get-session')
  async getSession(
    @Headers('x-refresh-token') token: string,
    @Body() body: GetSession,
  ) {
    const { sessionId } = body;
    return await this.quizSessionService.getSession(sessionId, token);
  }

  @Post()
  async storeSession(
    @Headers('x-refresh-token') token: string,
    @Body() body: StoreSession,
  ) {
    const { sessionId, selectedAnswers, level, questionNumber } = body;
    await this.quizSessionService.storeSession(
      sessionId,
      selectedAnswers,
      questionNumber,
      level,
      token,
    );
  }

  @Post('/get-answer')
  async getAnswer(@Body() body: GetAnswer) {
    const { levelIndex, questionIndex, selectedAnswer, sessionId } = body;
    return await this.quizSessionService.getAnswer(
      sessionId,
      levelIndex,
      questionIndex,
      selectedAnswer,
    );
  }

  @Get('/get-all-sessions')
  async getAllSessions(@Headers('x-refresh-token') token: string) {
    return await this.quizSessionService.getAllSessions(token);
  }

  @Post('/text-to-speech')
  async textToSpeech(
    @Headers('x-refresh-token') token: string,
    @Body() body: { text: string },
  ) {
    const { text } = body;
    return await this.quizSessionService.textToSpeech(text, token);
  }
}
