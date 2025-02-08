import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class GetAnswer {
  @IsString()
  @ApiProperty()
  sessionId: string;

  @IsNumber()
  @ApiProperty()
  levelIndex: number;

  @IsNumber()
  @ApiProperty()
  questionIndex: number;

  @IsNumber()
  @ApiProperty()
  selectedAnswer: number;
}
