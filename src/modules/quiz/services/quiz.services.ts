import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/infrastructure/redis';

export enum Keys {
  QUESTIONS = 'QUESTIONS',
  LEVEL = 'LEVEL',
}
@Injectable()
export class QuizServices {
  constructor(private readonly redisService: RedisService) {}
  async question(value: string): Promise<void> {
    await this.redisService.set(Keys.QUESTIONS, value);
  }
  async level(value: string): Promise<{ message: string }> {
    if (parseInt(value) <= 5 && parseInt(value) >= 1) {
      await this.redisService.set(Keys.LEVEL, value);
      return { message: 'Total Level Updated' };
    }
    return { message: 'Please set Level between 1 to 5' };
  }
  async getQuestion(): Promise<string> {
    const questions = await this.redisService.get(Keys.QUESTIONS);
    return questions ?? '0';
  }
  async getLevel(): Promise<string> {
    const levels = await this.redisService.get(Keys.LEVEL);
    return levels ?? '0';
  }
}
