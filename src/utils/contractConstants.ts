export enum ChainId {
  SEPOLIA = 11155111,
  BSCTESTNET = 97,
  AMOY = 80002,
  ARBITRUM = 421614,
  AVALANCHE = 43113,
  FANTOM = 4002,
  OPTIMISM = 11155420,
  LINEA = 59141,
  BASE = 84532,
  CELO = 44787,
  BLAST = 168587773,
  AURORA = 1313161555,
  SCROLL = 534351,
  MOONBASE = 1287,
}

export const factoryAddresses: { [chainId in ChainId]: string } = {
  [ChainId.SEPOLIA]: '0x46e1443bF8F2c1F57dCC093bd29188087D7B71B7',
  [ChainId.BSCTESTNET]: '0x0f2ce8eE8Ac81687976EdF8D0C10D2576F6D85A4',
  [ChainId.AMOY]: '0xa1749f0f055c6b85e600B1303DF4EBDCB3fc9635',
  [ChainId.ARBITRUM]: '0x448e31F4682eE1bbF36aDF44cC38f7C9d84fd262',
  [ChainId.AVALANCHE]: '0x4cd93352D611BeDaC1E28c7C68d8BB52E35eA104',
  [ChainId.FANTOM]: '0x448e31F4682eE1bbF36aDF44cC38f7C9d84fd262',
  [ChainId.OPTIMISM]: '0xC8481648F5Ff2Fe46027a4E5B49165A55DE106Fd',
  [ChainId.LINEA]: '0x4370963Dd8295d4BF309d8541CC8a5062222dE2f',
  [ChainId.BASE]: '0xC8481648F5Ff2Fe46027a4E5B49165A55DE106Fd',
  [ChainId.CELO]: '0x9014dAE23DfB0059A0c2bc7E6503334F213A8036',
  [ChainId.BLAST]: '0x01805a841ece00cf680996bF4B4e21746C68Fd4e',
  [ChainId.AURORA]: '0xceBa082c764292e475A026BD3ED7cF89369c94cF',
  [ChainId.SCROLL]: '0x01805a841ece00cf680996bF4B4e21746C68Fd4e',
  [ChainId.MOONBASE]: '0xC8481648F5Ff2Fe46027a4E5B49165A55DE106Fd',
};
export const CFNCTokenAddress = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.CELO:
      return '0x47B1A0ad58C1BE485448E4d81843361Ba84089a3';
    default:
      return '0x9BED7e1B07be88894bBf599b50E8189C55b0a888';
  }
};

export const rpcUrl: { [chainId in ChainId]: string } = {
  [ChainId.SEPOLIA]: process.env.SEPOLIA_RPC as string,
  [ChainId.BSCTESTNET]: process.env.BSC_RPC as string,
  [ChainId.AMOY]: process.env.AMOY_RPC as string,
  [ChainId.ARBITRUM]: process.env.ARBITRUM_RPC as string,
  [ChainId.AVALANCHE]: process.env.AVALANCHE_RPC as string,
  [ChainId.FANTOM]: process.env.FANTOM_RPC as string,
  [ChainId.OPTIMISM]: process.env.OPTMISM_RPC as string,
  [ChainId.LINEA]: process.env.LINEA_RPC as string,
  [ChainId.BASE]: process.env.BASE_URL as string,
  [ChainId.CELO]: process.env.CELO_RPC as string,
  [ChainId.BLAST]: process.env.BLAST_RPC as string,
  [ChainId.AURORA]: process.env.AURORA_RPC as string,
  [ChainId.SCROLL]: process.env.SCROLL_RPC as string,
  [ChainId.MOONBASE]: process.env.MOONBASE_RPC as string,
};

export const gameContract = '0xefb7a7E76E0fD822F63c75054Ab9C48CfAe3849F';
