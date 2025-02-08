import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QuizUserService } from '../services';

@Controller('quiz-user')
@ApiTags('quiz-user')
export class QuizUserController {
  constructor(private readonly quizUsersService: QuizUserService) {}
  @Post('/login')
  async login(@Body() req: { walletAddress: string }) {
    await this.quizUsersService.login(req.walletAddress);
  }
}
