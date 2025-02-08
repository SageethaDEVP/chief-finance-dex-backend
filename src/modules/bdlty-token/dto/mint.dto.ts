import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChainId } from 'src/utils/contractConstants';

export class MintDto {
  @IsNumber()
  @ApiProperty()
  chainId: ChainId;

  @IsString()
  @ApiProperty()
  value: string;
}
