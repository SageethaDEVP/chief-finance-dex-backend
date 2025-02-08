import { Module } from '@nestjs/common';

import { BdltyTokenController } from './controllers';
import { EthersModules } from '../ethers/ethers.module';

@Module({ imports: [EthersModules], controllers: [BdltyTokenController] })
export class BDLTYToken {}
