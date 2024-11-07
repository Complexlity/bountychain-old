import { bountyAbi, bountyErc20Abi } from "@/features/bounties/lib/constants";
import { createPublicClient, http } from "viem";
import { arbitrum, arbitrumSepolia } from "viem/chains";

export const supportedChains = {
  arbitrum: {
    chain: arbitrum,
    bountyContractAddress: "0xEda8B0898DAc56ead2bC4f573C5252D3ef3d0b3c",
    contracts: {
      eth: {
        address: "0xEda8B0898DAc56ead2bC4f573C5252D3ef3d0b3c",
        abi: bountyAbi,
      },
      usdc: {
        address: "0xA7661b719aa7c7af86Dcd7bC0Dc58437945d1BEd",
        abi: bountyErc20Abi,
      },
    },
  },
  arbitrumSepolia: {
    chain: arbitrumSepolia,
    bountyContractAddress: "0x6E46796857a0E061374a0Bcb4Ce01af851773d2A",
    contracts: {
      eth: {
        address: "0x6E46796857a0E061374a0Bcb4Ce01af851773d2A",
        abi: bountyAbi,
      },
      usdc: {
        address: "0x48FD137b6cB91AC5e4eb5E71e0C8e31ee4801D7E",
        abi: bountyErc20Abi,
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
