import { RedisService } from 'src/infrastructure/redis';
import { QuizUsersRepository } from 'src/modules/quiz_users/repositories';
import { TokenService } from 'src/authentication-module/services';
import crypto from 'crypto';
import {
  JsonRpcProvider,
  TypedDataDomain,
  TypedDataField,
  Wallet,
  keccak256,
  parseEther,
} from 'ethers';
import { UnauthorizedException } from 'src/common/exceptions';
import { QuizUsersEntity } from 'src/entities/quiz_users.entity';
import { GameAuthTokenPayload } from '../types';
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import Web3 from 'web3';
import { ChainId, gameContract, rpcUrl } from 'src/utils/contractConstants';
import { QuizSessionsRepository } from 'src/modules/quiz_sessions/repositories';
import { ClaimData } from '../controllers';

@Injectable()
export class GameAuthServices {
  private provider: JsonRpcProvider;
  private signer: Wallet;
  constructor(
    private readonly quizUsersRepository: QuizUsersRepository,
    private readonly quizSessionsRepository: QuizSessionsRepository,
    private readonly redisService: RedisService,
  ) {
    this.provider = new JsonRpcProvider(process.env.SEPOLIA_RPC);
    this.signer = new Wallet(
      process.env.GAME_CONTACT_PRIVATE_KEY as string,
      this.provider,
    );
  }

  options = new TokenService({
    secret: process.env.JWT_SECRET as string,
    expire: Number(process.env.JWT_EXPIRE),
    refreshExpire: Number(process.env.JWT_REFRESH_EXPIRE),
  });

  async generateNonce(address: string) {
    const nonce = crypto.randomBytes(16).toString('hex');
    const data = {
      walletAddress: address,
      nonce,
    };
    const key = `GAME_LOGIN_${data.nonce}`;
    await this.redisService.set(key, JSON.stringify(data));
    return { nonce };
  }

  async login(nonce: string, signature: string) {
    const web3 = new Web3(rpcUrl[ChainId.SEPOLIA]);
    const signer = web3.eth.accounts.recover(
      keccak256('0x' + nonce),
      signature,
    );
    if (!signer) {
      throw new UnauthorizedException({
        message: 'Invalid Nonce and Signature',
      });
    }
    const key = `GAME_LOGIN_${nonce}`;
    let redisData = await this.redisService.get(key);
    if (!redisData) {
      throw new UnauthorizedException({ message: 'Nonce not found' });
    }
    redisData = JSON.parse(redisData);
    const checkAddressMatched =
      redisData.walletAddress.toLowerCase() === signer.toLowerCase();
    if (!checkAddressMatched) {
      throw new UnauthorizedException({
        message: 'Invalid Nonce and Signature',
      });
    }
    const checkAddress = await this.quizUsersRepository.getOneByParams({
      where: {
        walletAddress: redisData.walletAddress.toLowerCase().trim(),
      },
      throwError: false,
    });
    if (checkAddress) {
      const token = this.options.signRefresh({
        id: checkAddress.id,
        walletAddress: signer,
      });
      return { token, userData: checkAddress };
    } else {
      try {
        const newUser = new QuizUsersEntity();
        newUser.walletAddress = signer.toLowerCase().trim();
        const saveUser = await this.quizUsersRepository.save(newUser);

        const token = this.options.signAccess<GameAuthTokenPayload>({
          id: saveUser.id,
          walletAddress: saveUser.walletAddress,
        });
        // await this.redisService.del(key);
        return { token, userData: saveUser };
      } catch (error) {
        throw new UnauthorizedException({ message: error });
      }
    }
  }

  async verifyJwtExpired(walletAddress: string, refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException({ message: 'No Header found' });
    }
    try {
      let returnData = { status: false };
      jwt.verify(
        refreshToken,
        process.env.JWT_SECRET as string,
        (err, decoded: jwt.JwtPayload & GameAuthTokenPayload) => {
          if (err) {
            returnData = {
              status: false,
            };
          } else {
            if (
              decoded?.walletAddress.toLowerCase() ===
              walletAddress.toLowerCase()
            ) {
              returnData = { status: true };
            } else {
              returnData = { status: false };
            }
          }
        },
      );
      return returnData;
    } catch (error) {
      return { status: false };
    }
  }
  async getUser(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException({ message: 'No Header found' });
    }
    const decoded = this.options.verify<GameAuthTokenPayload>(refreshToken);
    const userData = await this.quizUsersRepository.getOneByParams({
      where: {
        walletAddress: decoded.walletAddress.toLowerCase(),
      },
      throwError: false,
    });
    return { userData };
  }

  async generateSignature(gameId: string, token: string) {
    if (!token) {
      throw new UnauthorizedException({ message: 'No Header found' });
    }
    const decoded = this.options.verify<GameAuthTokenPayload>(token);
    const chainId = 11155111;
    const domain: TypedDataDomain = {
      name: 'AIGame',
      version: '1.0',
      chainId: chainId,
      verifyingContract: gameContract,
    };
    const type: Record<string, TypedDataField[]> = {
      VEST: [
        { name: 'gameId', type: 'string' },
        { name: 'totalTokens', type: 'uint256' },
        { name: 'prevVestTime', type: 'uint256' },
        { name: 'percentage', type: 'uint16' },
        { name: 'totalVests', type: 'uint256' },
        { name: 'vestsClaimed', type: 'uint256' },
        { name: 'player', type: 'address' },
        { name: 'startTime', type: 'uint256' },
      ],
    };
    try {
      const gameData = await this.quizSessionsRepository.getOneByParams({
        where: {
          id: gameId,
          isSubmitted: true,
        },
        throwError: true,
      });
      // const walletAddress = '0x63FaC9201494f0bd17B9892B9fae4d52fe3BD377';
      if (
        gameData.walletAddress.toLowerCase() !==
        decoded.walletAddress.toLowerCase()
        // walletAddress.toLowerCase()
      ) {
        throw new UnauthorizedException({
          message: 'Unauthorized wallet address',
        });
      }

      // const totalLevels = await this.redisService.get(Keys.LEVEL);
      // const questionsPerLevel = await this.redisService.get(Keys.QUESTIONS);
      // const totalQuestions = Number(totalLevels) + Number(questionsPerLevel);
      // const quizStartTime = new Date(gameData.createdAt).getTime();

      // total time plus 1 minute extra for any error buffer time
      // const quizExpireTime =
      //   quizStartTime + totalQuestions * 45 * 1000 + 60 * 1000;
      const prevTime = Math.floor(
        new Date(Number(gameData.prevVestTime)).getTime() / 1000,
      );
      const claimData: ClaimData = {
        gameId: gameData.id,
        totalTokens: parseEther(String(gameData.CFNC_won)).toString(),
        prevVestTime: prevTime,
        percentage: 25 * 100,
        totalVests: 4,
        vestsClaimed: 0,
        player: gameData.walletAddress,
        startTime: prevTime,
      };
      if (gameData.vestingId !== null) {
        return;
      }
      const signature = await this.signer.signTypedData(
        domain,
        type,
        claimData,
      );
      return { signature, claimData };
    } catch (error) {
      throw new UnauthorizedException({ message: error });
    }
  }
}
