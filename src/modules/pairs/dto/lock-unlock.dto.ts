import { IsEthereumAddress, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChainId } from 'src/utils/contractConstants';

export class LockUnlockDto {
  @IsNumber()
  @ApiProperty()
  chainId: ChainId;

  @IsEthereumAddress()
  @ApiProperty()
  address: string;
}
