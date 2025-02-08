import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetSession {
  @IsString()
  @ApiProperty()
  sessionId: string;
}
