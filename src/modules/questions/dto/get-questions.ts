import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString } from 'class-validator';

export class GetQuestion {
  @IsInt()
  @ApiProperty()
  level: number;

  @IsString()
  @ApiProperty()
  genre: string;

  @IsString()
  @ApiProperty()
  sessionId: string;

  @IsNumber()
  @ApiProperty()
  stakeAmount: number;
}
