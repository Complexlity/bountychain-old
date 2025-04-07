import { bountyNativeAbi, bountyErc20Abi } from "../constants";
import { createPublicClient, http } from "viem";
import { arbitrum, arbitrumSepolia } from "viem/chains";

export const supportedChains = {
  arbitrum: {
    chain: arbitrum,
    bountyContractAddress: "0xEda8B0898DAc56ead2bC4f573C5252D3ef3d0b3c",
    contracts: {
      eth: {
        decimals: 18,
        token: undefined,
        address: "0xEda8B0898DAc56ead2bC4f573C5252D3ef3d0b3c",
        abi: bountyNativeAbi,
        // Weth address
        priceAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      },
      usdc: {
        decimals: 6,
        token: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        address: "0xA7661b719aa7c7af86Dcd7bC0Dc58437945d1BEd",
        abi: bountyErc20Abi,
        priceAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      },
    },
  },
  arbitrumSepolia: {
    chain: arbitrumSepolia,
    bountyContractAddress: "0x6E46796857a0E061374a0Bcb4Ce01af851773d2A",
    contracts: {
      eth: {
        decimals: 18,
        token: undefined,
        address: "0x6E46796857a0E061374a0Bcb4Ce01af851773d2A",
        abi: bountyNativeAbi,
        priceAddress: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",
      },
      usdc: {
        decimals: 6,
        token: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
        address: "0x48FD137b6cB91AC5e4eb5E71e0C8e31ee4801D7E",
        abi: bountyErc20Abi,
        priceAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
      },
    },
  },
} as const;

export type SupportedChainKey = keyof typeof supportedChains;

export const getPublicClient = (chain: keyof typeof supportedChains) => {
  return createPublicClient({
    chain: supportedChains[chain].chain,
    transport: http(),
  });
};
