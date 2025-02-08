import { Controller, Body, Post, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Roles } from '../../roles/decorators';
import { Role } from '../../roles/enums';
import { BurnDto, MintDto, PauseUnpuaseDto } from '../dto';
import { BDLTYTokenServices } from '../../ethers/services';
import { ChainId } from 'src/utils/contractConstants';

@Controller('/bdlty-token')
@ApiTags('bdlty-token')
export class BdltyTokenController {
  constructor(private readonly bdltyTokenServices: BDLTYTokenServices) {}

  @Roles(Role.MANAGE_BDLTY_TOKEN)
  @Post('/burn')
  async burn(@Body() body: BurnDto): Promise<void> {
    const { chainId, value } = body;
    await this.bdltyTokenServices.burn(chainId, value);
  }

  @Roles(Role.MANAGE_BDLTY_TOKEN)
  @Post('/mint')
  async mint(@Body() body: MintDto): Promise<void> {
    const { chainId, value } = body;
    await this.bdltyTokenServices.mint(chainId, value);
  }

  @Roles(Role.MANAGE_BDLTY_TOKEN)
  @Post('/pause')
  async pause(@Body() body: PauseUnpuaseDto): Promise<void> {
    const { chainId } = body;
    await this.bdltyTokenServices.pause(chainId);
  }

  @Roles(Role.MANAGE_BDLTY_TOKEN)
  @Post('/unpause')
  async unpause(@Body() body: PauseUnpuaseDto): Promise<void> {
    const { chainId } = body;
    await this.bdltyTokenServices.unpause(chainId);
  }

  @Get('/mint/:chainId')
  async getMint(@Param('chainId') chainId: ChainId): Promise<string> {
    return this.bdltyTokenServices.getMint(chainId);
  }

  @Get('/burn/:chainId')
  async getBurn(@Param('chainId') chainId: ChainId): Promise<string> {
    return this.bdltyTokenServices.getBurn(chainId);
  }
}
