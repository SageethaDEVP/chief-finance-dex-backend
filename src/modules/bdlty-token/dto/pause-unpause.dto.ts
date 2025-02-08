import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { ChainId } from 'src/utils/contractConstants';

export class PauseUnpuaseDto {
  @IsNumber()
  @ApiProperty()
  chainId: ChainId;
}
