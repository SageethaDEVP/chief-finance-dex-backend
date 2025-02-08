import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StoreQuiz {
  @IsString()
  @ApiProperty()
  value: string;
}
