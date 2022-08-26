import { Blockchain } from '../../../core/types/.';

export const chains = {
  mainnet: {
    id: 1,
    name: 'Ethereum',
    network: Blockchain.Eth,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: {
      alchemy: 'https://eth-mainnet.alchemyapi.io/v2',
      default: 'https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
      infura: 'https://mainnet.infura.io/v3',
      public: 'https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC'
    },
    blockExplorers: {
      etherscan: {
        name: 'Etherscan',
        url: 'https://etherscan.io'
      },
      default: {
        name: 'Etherscan',
        url: 'https://etherscan.io'
      }
    },
    ens: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
    },
    multicall: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14353601
    }
  },
  goerli: {
    id: 5,
    name: 'Goerli',
    network: Blockchain.EthTestnet,
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: {
      alchemy: 'https://eth-goerli.alchemyapi.io/v2',
      default: 'https://eth-goerli.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
      infura: 'https://goerli.infura.io/v3',
      public: 'https://eth-goerli.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC'
    },
    blockExplorers: {
      etherscan: {
        name: 'Etherscan',
        url: 'https://goerli.etherscan.io'
      },
      default: {
        name: 'Etherscan',
        url: 'https://goerli.etherscan.io'
      }
    },
    ens: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
    },
    multicall: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 6507670
    },
    testnet: true
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    network: Blockchain.Polygon,
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: {
      alchemy: 'https://polygon-mainnet.g.alchemy.com/v2',
      default: 'https://polygon-rpc.com',
      infura: 'https://polygon-mainnet.infura.io/v3',
      public: 'https://polygon-rpc.com'
    },
    blockExplorers: {
      etherscan: {
        name: 'PolygonScan',
        url: 'https://polygonscan.com'
      },
      default: {
        name: 'PolygonScan',
        url: 'https://polygonscan.com'
      }
    },
    multicall: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 25770160
    }
  },
  polygonMumbai: {
    id: 80001,
    name: 'Polygon Mumbai',
    network: Blockchain.PolygonTestnet,
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: {
      alchemy: 'https://polygon-mumbai.g.alchemy.com/v2',
      default: 'https://matic-mumbai.chainstacklabs.com',
      infura: 'https://polygon-mumbai.infura.io/v3',
      public: 'https://matic-mumbai.chainstacklabs.com'
    },
    blockExplorers: {
      etherscan: {
        name: 'PolygonScan',
        url: 'https://mumbai.polygonscan.com'
      },
      default: {
        name: 'PolygonScan',
        url: 'https://mumbai.polygonscan.com'
      }
    },
    multicall: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 25444704
    },
    testnet: true
  }
};
