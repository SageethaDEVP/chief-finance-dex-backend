import { Module } from '@nestjs/common';

import { FactoryServices, BDLTYTokenServices } from './services';

@Module({
  providers: [FactoryServices, BDLTYTokenServices],
  exports: [FactoryServices, BDLTYTokenServices],
})
export class EthersModules {}
