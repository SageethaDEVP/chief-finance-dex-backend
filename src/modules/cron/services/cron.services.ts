// cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  Contract,
  EventLog,
  JsonRpcProvider,
  Wallet,
  formatEther,
} from 'ethers';
// import { QuizSessionsEntity } from 'src/entities';
import { QuizSessionsRepository } from 'src/modules/quiz_sessions/repositories';
import { gameContract } from 'src/utils/contractConstants';
import gameABI from 'src/common/game.abi.json';
import { QuizUsersRepository } from 'src/modules/quiz_users/repositories';
import { ILike } from 'typeorm';
import { RedisService } from 'src/infrastructure/redis';
// import { QuizSessionServices } from 'src/modules/quiz_sessions/services';
// import { DatabaseService } from './database.service';

// const contractAddress = '0x749cc2edB2B69019e4fc3D9D9861a773f99f1460';
const claimEventName = 'Claimed';
const paymentEventName = 'PaymentReceived';

const Keys = {
  CLAIM_FROM_BLOCK: 'CLAIM_FROM_BLOCK',
  PAYMENT_FROM_BLOCK: 'PAYMENT_FROM_BLOCK',
  LAST_CLAIM_LISTENED: 'LAST_CLAIM_LISTENED',
  LAST_PAYMENT_LISTENED: 'LAST_PAYMENT_LISTENED',
};
@Injectable()
export class CronService {
  logger: Logger = new Logger(CronService.name);

  private contract: Contract;
  private provider: JsonRpcProvider;
  private signer: Wallet;

  constructor(
    private readonly quizSessionsRepository: QuizSessionsRepository,
    private readonly quizUsersRepository: QuizUsersRepository,
    private readonly redisService: RedisService,
  ) {
    this.provider = new JsonRpcProvider(process.env.SEPOLIA_RPC);
    this.signer = new Wallet(
      process.env.GAME_CONTACT_PRIVATE_KEY as string,
      this.provider,
    );
    this.contract = new Contract(gameContract, gameABI, this.signer);
  }
  claimFromBlock = 5892917;
  lastClaimListened = 0;

  paymentFromBlock = 5892917;
  lastPaymentListened = 0;

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron(): Promise<void> {
    try {
      await this.quizSessionsRepository.delete({ CFNC_won: 0 });
    } catch (error) {
      console.log(error);
    }
    // const sessionFromDB = await this.quizSessionsRepository.getByParams({});

    // for (let i = 0; i < sessionFromDB.length; i++) {
    //   const createdTime = sessionFromDB[i].createdAt;
    //   const expiresTime = new Date(
    //     createdTime.getTime() + 900 * 1000,
    //   ).getTime();
    //   const currentTime = new Date().getTime();

    //   if (
    //     expiresTime <= currentTime &&
    //     sessionFromDB[i].isSubmitted === false
    //   ) {
    //     await this.quizSessionsRepository.delete({ id: sessionFromDB[i].id });

    //     this.logger.log(
    //       `session: ${sessionFromDB[i].id} deleted form database`,
    //     );
    //   }
    // }
  }

  // claimed event listener
  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleClaimEvent() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      let claimFromBlock = Number(
        (await this.redisService.get(Keys.CLAIM_FROM_BLOCK)) as string,
      );
      const lastClaimListened = await this.redisService.get(
        Keys.LAST_CLAIM_LISTENED,
      );

      if (blockNumber === Number(lastClaimListened)) return;
      if (!claimFromBlock) {
        await this.redisService.set(Keys.CLAIM_FROM_BLOCK, this.claimFromBlock);
        claimFromBlock = this.claimFromBlock;
      }
      const claimEvents = await this.contract.queryFilter(
        claimEventName,
        claimFromBlock + 1,
      );
      if (claimEvents.length === 0) return;
      claimEvents?.map(async (event: EventLog) => {
        const [gameId, vestingId, prevVestTime, vestsClaimed] = event.args;
        console.log({ vestingId, prevVestTime, vestsClaimed });
        const sessionFromDB = await this.quizSessionsRepository.getOneByParams({
          where: { id: gameId },
          throwError: false,
        });
        // if (!sessionFromDB) return;
        if (sessionFromDB) {
          let isClaimed = false;
          if (sessionFromDB.totalVests <= Number(vestsClaimed)) {
            isClaimed = true;
          }
          await this.quizSessionsRepository.update(
            { id: gameId },
            {
              isClaimed: isClaimed,
              vestingId: Number(vestingId),
              vestsClaimed: Number(vestsClaimed),
              prevVestTime: Number(prevVestTime) * 1000,
            },
          );
        }
      });

      // updating the last listened block for event
      const _lastClaimListened = claimEvents.length
        ? claimEvents[claimEvents.length - 1].blockNumber
        : blockNumber;
      await this.redisService.set(Keys.LAST_CLAIM_LISTENED, _lastClaimListened);
      await this.redisService.set(Keys.CLAIM_FROM_BLOCK, _lastClaimListened);
      // this.claimFromBlock = this.lastClaimListened;
    } catch (error) {
      console.log(error);
    }
  }

  // PaymentRecieved event listener
  @Cron(CronExpression.EVERY_5_SECONDS)
  async handlePaymentEvent() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      let paymentFromBlock = Number(
        (await this.redisService.get(Keys.PAYMENT_FROM_BLOCK)) as string,
      );
      const lastClaimListened = await this.redisService.get(
        Keys.LAST_PAYMENT_LISTENED,
      );
      if (blockNumber === Number(lastClaimListened)) return;
      if (!paymentFromBlock) {
        await this.redisService.set(
          Keys.PAYMENT_FROM_BLOCK,
          this.paymentFromBlock,
        );
        paymentFromBlock = this.paymentFromBlock;
      }

      if (blockNumber === this.lastPaymentListened) return;
      // payment event capture
      const paymentEvents = await this.contract.queryFilter(
        paymentEventName,
        paymentFromBlock + 1,
      );
      if (paymentEvents.length === 0) return;
      const playerWinning = {};

      // adding same user payment if captured in same block
      paymentEvents?.map(async (paymentEvent: EventLog) => {
        const [payer, amount, timestamp] = paymentEvent.args;
        if (playerWinning[payer]) {
          playerWinning[payer] += Number(amount);
        } else {
          playerWinning[payer] = Number(amount);
        }
      });
      Object.keys(playerWinning)?.map(async (walletAddress) => {
        const gamePlayer = await this.quizUsersRepository.getOneByParams({
          where: { walletAddress: ILike(walletAddress) },
          throwError: false,
        });
        if (gamePlayer) {
          await this.quizUsersRepository.update(
            { id: gamePlayer.id },
            {
              gameCredits:
                Number(gamePlayer.gameCredits) +
                Math.floor(
                  parseFloat(
                    formatEther(playerWinning[walletAddress].toString()),
                  ),
                ),
            },
          );
        }
      });

      // updating the last listened block for event
      const _lastPaymentListened = paymentEvents.length
        ? paymentEvents[paymentEvents.length - 1].blockNumber
        : blockNumber;
      // this.paymentFromBlock = this.lastPaymentListened;

      await this.redisService.set(
        Keys.LAST_PAYMENT_LISTENED,
        _lastPaymentListened,
      );
      await this.redisService.set(
        Keys.PAYMENT_FROM_BLOCK,
        _lastPaymentListened,
      );
    } catch (error) {
      console.log(error);
    }
  }
}
