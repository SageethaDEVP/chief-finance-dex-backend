import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export class SignatureData {
  @IsString()
  @ApiProperty()
  gameId: string;
}
