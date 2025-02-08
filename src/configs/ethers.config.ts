import { registerAs } from '@nestjs/config';

import { ConfigNames } from 'src/common/enums';

export interface IEthersConfig {
  privateKey: string;
}

export const etherConfig = registerAs(ConfigNames.ETHERS, () => {
  const privateKey = process.env.PRIVATE_KEY as string;

  if (!privateKey) {
    throw new Error('[Config selector]: required env PRIVATE_KEY');
  }

  const config: IEthersConfig = {
    privateKey,
  };

  return config;
});
