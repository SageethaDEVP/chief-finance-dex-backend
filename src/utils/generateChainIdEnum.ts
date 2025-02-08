import { ChainId } from './contractConstants';

function generateChainIdEnum(): { [key: string]: string } {
  const chainIdEnum: { [key: string]: string } = {};

  Object.keys(ChainId).forEach((key) => {
    const chainIdKey = key as keyof typeof ChainId;
    const chainIdValue: ChainId = ChainId[chainIdKey];
    chainIdEnum[`BURN_${chainIdValue}`] = 'BURN_' + chainIdValue;
    chainIdEnum[`MINT_${chainIdValue}`] = 'MINT_' + chainIdValue;
  });

  return chainIdEnum;
}

export const ChainIdEnum = generateChainIdEnum();
