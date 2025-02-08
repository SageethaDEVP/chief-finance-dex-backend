import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QuizServices } from '../services';
import { StoreQuiz } from '../dto';
import { Roles } from 'src/modules/roles/decorators';
import { Role } from 'src/modules/roles/enums';

@Controller('quiz')
@ApiTags('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizServices) {}
  @Post('/question')
  @Roles(Role.MANAGE_QUIZ)
  async question(@Body() body: StoreQuiz) {
    const { value } = body;
    await this.quizService.question(value);
  }

  @Post('/level')
  @Roles(Role.MANAGE_QUIZ)
  async level(@Body() body: StoreQuiz) {
    const { value } = body;
    return await this.quizService.level(value);
  }

  @Get('/get-question')
  async getQuestion() {
    return await this.quizService.getQuestion();
  }

  @Get('/get-level')
  async getLevel() {
    return await this.quizService.getLevel();
  }
}
