import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class StoreSession {
  @IsString()
  @ApiProperty()
  sessionId: string;

  @IsString()
  @ApiProperty()
  selectedAnswers: string;

  @IsNumber()
  @ApiProperty()
  questionNumber: number;

  @IsNumber()
  @ApiProperty()
  level: number;
}
