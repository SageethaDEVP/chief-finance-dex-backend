import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GameAuthServices } from '../services';
import { QuizUsersEntity } from 'src/entities/quiz_users.entity';
import { SignatureData } from '../dto';

type LoginResponseDto = {
  token: string;
  userData: QuizUsersEntity;
};
export type ClaimData = {
  gameId: string;
  totalTokens: string;
  player: string;
  prevVestTime: number;
  percentage: number;
  totalVests: number;
  vestsClaimed: number;
  startTime: number;
};

@Controller('/game-auth')
@ApiTags('/game-auth')
export class GameAuthController {
  constructor(private readonly gameAuthServices: GameAuthServices) {}
  @Get('/generate-nonce/:address')
  async generateNonce(
    @Param('address') address: string,
  ): Promise<{ nonce: string }> {
    return await this.gameAuthServices.generateNonce(address);
  }
  @Post('/login')
  async login(
    @Body() body: { nonce: string; signature: string },
  ): Promise<LoginResponseDto> {
    const { nonce, signature } = body;
    return await this.gameAuthServices.login(nonce, signature);
  }

  @Post('/verify-jwt-expired')
  async verifyJwtExpired(
    @Body() body: { walletAddress: string },
    @Headers('x-refresh-token') refreshToken: string,
  ): Promise<{
    status: boolean;
  }> {
    const { walletAddress } = body;
    const { status } = await this.gameAuthServices.verifyJwtExpired(
      walletAddress,
      refreshToken,
    );
    if (!status) {
      return { status: false };
    }
    return { status: true };
  }
  @Post('/get-user')
  async getUser(
    @Headers('x-refresh-token') refreshToken: string,
  ): Promise<{ userData: QuizUsersEntity | null }> {
    const userData = await this.gameAuthServices.getUser(refreshToken);
    return userData;
  }

  @Post('/generate-signature')
  async generateSignature(
    @Headers('x-refresh-token') token: string,
    @Body() body: SignatureData,
  ): Promise<{ signature: string; claimData: ClaimData } | undefined> {
    const { gameId } = body;
    return await this.gameAuthServices.generateSignature(gameId, token);
  }
}
