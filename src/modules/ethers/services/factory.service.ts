import { Injectable } from '@nestjs/common';
import { JsonRpcProvider, Contract, Wallet, parseUnits } from 'ethers';
import { ConfigService } from '@nestjs/config';

import { IEthersConfig } from 'src/configs';
import { ConfigNames } from 'src/common/enums';
import factoryAbi from 'src/common/abi/factory.abi.json';
import { ErrorCode } from '../enum';
import { InternalServerErrorException } from 'src/common/exceptions';
import { ChainId, factoryAddresses, rpcUrl } from 'src/utils/contractConstants';

@Injectable()
export class FactoryServices {
  private readonly config: IEthersConfig;
  private provider: JsonRpcProvider;
  private signer: Wallet;
  private contract: Contract;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.getOrThrow<IEthersConfig>(
      ConfigNames.ETHERS,
    );
  }

  async setSwapFeeBP(chainId: ChainId, value: string): Promise<void> {
    this.provider = new JsonRpcProvider(rpcUrl[chainId]);
    this.signer = new Wallet(this.config.privateKey, this.provider);
    this.contract = new Contract(
      factoryAddresses[chainId],
      factoryAbi,
      this.signer,
    );

    try {
      const valueBigInt = parseUnits(value, 2);

      const fee = await this.provider.getFeeData();

      const tx = await this.contract.setSwapFeeBP(valueBigInt, {
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

  async setAddLiquidityFeeBP(chainId: ChainId, value: string): Promise<void> {
    this.provider = new JsonRpcProvider(rpcUrl[chainId]);
    this.signer = new Wallet(this.config.privateKey, this.provider);
    this.contract = new Contract(
      factoryAddresses[chainId],
      factoryAbi,
      this.signer,
    );

    try {
      const valueBigInt = parseUnits(value, 2);

      const fee = await this.provider.getFeeData();

      const tx = await this.contract.setAddLiquidityFeeBP(valueBigInt, {
        maxFeePerGas: fee.maxFeePerGas,
      });

      await tx.wait();
    } catch (error) {
      if (error.code === ErrorCode.INSUFFICIENT_FUNDS) {
        throw new InternalServerErrorException('Insufficient funds');
      }
      throw new InternalServerErrorException(error.code, error);
    }
  }

  async setRemoveLiquidityFeeBP(
    chainId: ChainId,
    value: string,
  ): Promise<void> {
    this.provider = new JsonRpcProvider(rpcUrl[chainId]);
    this.signer = new Wallet(this.config.privateKey, this.provider);
    this.contract = new Contract(
      factoryAddresses[chainId],
      factoryAbi,
      this.signer,
    );
    try {
      const valueBigInt = parseUnits(value, 2);

      const fee = await this.provider.getFeeData();

      const tx = await this.contract.setRemoveLiquidityFeeBP(valueBigInt, {
        maxFeePerGas: fee.maxFeePerGas,
      });

      await tx.wait();
    } catch (error) {
      if (error.code === ErrorCode.INSUFFICIENT_FUNDS) {
        throw new InternalServerErrorException('Insufficient funds');
      }
      throw new InternalServerErrorException(error.code, error);
    }
  }

  async lock(chainId: ChainId, pool: string): Promise<void> {
    this.provider = new JsonRpcProvider(rpcUrl[chainId]);
    this.signer = new Wallet(this.config.privateKey, this.provider);
    this.contract = new Contract(
      factoryAddresses[chainId],
      factoryAbi,
      this.signer,
    );
    try {
      const fee = await this.provider.getFeeData();

      const tx = await this.contract.lock(pool, {
        maxFeePerGas: fee.maxFeePerGas,
      });

      await tx.wait();
    } catch (error) {
      if (error.code === ErrorCode.INSUFFICIENT_FUNDS) {
        throw new InternalServerErrorException('Insufficient funds');
      }
      throw new InternalServerErrorException(error.code, error);
    }
  }

  async unlock(chainId: ChainId, pool: string): Promise<void> {
    this.provider = new JsonRpcProvider(rpcUrl[chainId]);
    this.signer = new Wallet(this.config.privateKey, this.provider);
    this.contract = new Contract(
      factoryAddresses[chainId],
      factoryAbi,
      this.signer,
    );
    try {
      const fee = await this.provider.getFeeData();

      const tx = await this.contract.unlock(pool, {
        maxFeePerGas: fee.maxFeePerGas,
      });

      await tx.wait();
    } catch (error) {
      if (error.code === ErrorCode.INSUFFICIENT_FUNDS) {
        throw new InternalServerErrorException('Insufficient funds');
      }
      throw new InternalServerErrorException(error.code, error);
    }
  }
}
