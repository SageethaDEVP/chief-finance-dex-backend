import { Injectable } from '@nestjs/common';
import {
  JsonRpcProvider,
  Contract,
  Wallet,
  parseUnits,
  formatUnits,
} from 'ethers';
import { ConfigService } from '@nestjs/config';

import { IEthersConfig } from 'src/configs';
import { ConfigNames } from 'src/common/enums';
import bdlty from 'src/common/abi/bdlty.abi.json';
import { ErrorCode } from '../enum';
import { InternalServerErrorException } from 'src/common/exceptions';
import { RedisService } from 'src/infrastructure/redis';
import { ChainId, rpcUrl, CFNCTokenAddress } from 'src/utils/contractConstants';
import { ChainIdEnum } from 'src/utils/generateChainIdEnum';
export enum Keys {
  BURN = `BURN`,
  MINT = 'MINT',
}

// Generate the ChainIdEnum object
// const ChainIdEnum = generateChainIdEnum();

@Injectable()
export class BDLTYTokenServices {
  private readonly config: IEthersConfig;
  private contract: Contract;
  private provider: JsonRpcProvider;
  private signer: Wallet;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.config = this.configService.getOrThrow<IEthersConfig>(
      ConfigNames.ETHERS,
    );
    // this.provider = new JsonRpcProvider(this.config.rpc);

    // this.signer = new Wallet(this.config.privateKey, this.provider);

    // this.contract = new Contract(this.config.bdltyAddress, bdlty, this.signer);
  }

  async burn(chainId: ChainId, value: string): Promise<void> {
    this.provider = new JsonRpcProvider(rpcUrl[chainId]);
    this.signer = new Wallet(this.config.privateKey, this.provider);
    this.contract = new Contract(CFNCTokenAddress(chainId), bdlty, this.signer);
    try {
      const decimal = await this.contract.decimals();
      const valueBigInt = parseUnits(value, decimal);
      const fee = await this.provider.getFeeData();
      const burnKey = ChainIdEnum[`BURN_${chainId}`];
      const burn = await this.redisService.get<string>(burnKey);
      const burnBigInt = parseUnits(burn || '0', decimal) + valueBigInt;
      const tx = await this.contract.burn(valueBigInt, {
        maxFeePerGas: fee.maxFeePerGas,
      });
      await this.redisService.set<string>(
        burnKey,
        formatUnits(burnBigInt, decimal),
      );
      await tx.wait();
    } catch (error) {
      console.log(error);
      if (error.code === ErrorCode.INSUFFICIENT_FUNDS) {
        throw new InternalServerErrorException('Insufficient funds');
      }
      throw new InternalServerErrorException(error.code, error);
    }
  }

  async mint(chainId: ChainId, value: string): Promise<void> {
    this.provider = new JsonRpcProvider(rpcUrl[chainId]);
    this.signer = new Wallet(this.config.privateKey, this.provider);
    this.contract = new Contract(CFNCTokenAddress(chainId), bdlty, this.signer);
    try {
      const decimal = await this.contract.decimals();
      const valueBigInt = parseUnits(value, decimal);
      const mintKey = ChainIdEnum[`MINT_${chainId}`];
      const mint = await this.redisService.get<string>(mintKey);
      const mintBigInt = parseUnits(mint || '0', decimal) + valueBigInt;
      const fee = await this.provider.getFeeData();
      const tx = await this.contract.mint(this.signer.address, valueBigInt, {
        maxFeePerGas: fee.maxFeePerGas,
      });
      await this.redisService.set<string>(
        mintKey,
        formatUnits(mintBigInt, decimal),
      );
      await tx.wait();
    } catch (error) {
      console.log(error);
      if (error.code === ErrorCode.INSUFFICIENT_FUNDS) {
        throw new InternalServerErrorException('Insufficient funds');
      }
      throw new InternalServerErrorException(error.code, error);
    }
  }

  async getMint(chainId: ChainId): Promise<string> {
    const mintKey = ChainIdEnum[`MINT_${chainId}`];
    const mint = await this.redisService.get<string>(mintKey);

    return mint || '0';
  }

  async getBurn(chainId: ChainId): Promise<string> {
    const burnKey = ChainIdEnum[`BURN_${chainId}`];
    const burn = await this.redisService.get<string>(burnKey);

    return burn || '0';
  }

  async pause(chainId: ChainId): Promise<void> {
    this.provider = new JsonRpcProvider(rpcUrl[chainId]);
    this.signer = new Wallet(this.config.privateKey, this.provider);
    this.contract = new Contract(CFNCTokenAddress(chainId), bdlty, this.signer);
    try {
      const fee = await this.provider.getFeeData();

      const tx = await this.contract.pause({
        maxFeePerGas: fee.maxFeePerGas,
      });

      await tx.wait();
    } catch (error) {
      console.log(error);
      if (error.code === ErrorCode.INSUFFICIENT_FUNDS) {
        throw new InternalServerErrorException('Insufficient funds');
      }
      throw new InternalServerErrorException(error.code, error);
    }
  }

  async unpause(chainId: ChainId): Promise<void> {
    this.provider = new JsonRpcProvider(rpcUrl[chainId]);
    this.signer = new Wallet(this.config.privateKey, this.provider);
    this.contract = new Contract(CFNCTokenAddress(chainId), bdlty, this.signer);
    try {
      const fee = await this.provider.getFeeData();

      const tx = await this.contract.unpause({
        maxFeePerGas: fee.maxFeePerGas,
      });

      await tx.wait();
    } catch (error) {
      console.log(error);
      if (error.code === ErrorCode.INSUFFICIENT_FUNDS) {
        throw new InternalServerErrorException('Insufficient funds');
      }
      throw new InternalServerErrorException(error.code, error);
    }
  }
}
