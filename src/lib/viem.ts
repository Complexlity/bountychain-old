import { bountyAbi, bountyErc20Abi } from "@/features/bounties/lib/constants";
import { TurnkeyBrowserClient } from "@turnkey/sdk-browser";
import { TurnkeyServerClient } from "@turnkey/sdk-server";
import { createAccount } from "@turnkey/viem";
import { Account, Address, createPublicClient, createWalletClient, http } from "viem";
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
        abi: bountyAbi,
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
        abi: bountyAbi,
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


// export const getTurnKeyPublicClient = (chain: keyof typeof supportedChains) => {
//     return createPublicClient({
//       chain: supportedChains[chain].chain,
//       transport: http(turnkeyConfig.rpcUrl),
//     })
//   }
//   return publicClient
// }

export const getInjectedWalletClient = async (chain: keyof typeof supportedChains) => {
    const [account] = await window.ethereum!.request({
      method: "eth_requestAccounts",
    })

    const client = createWalletClient({
      account,
      chain: supportedChains[chain].chain,
      transport: http(),
    })

  return client
}


export const getTurnkeyWalletClient = async (
  chain: keyof typeof supportedChains, 
  turnkeyClient: TurnkeyBrowserClient | TurnkeyServerClient,
  signWith: string | Address
) => {
  // Create a new account using the provided Turnkey client and the specified account for signing
  const turnkeyAccount = await createAccount({
    client: turnkeyClient,
    organizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID!,
    signWith,
  })

  // Create a wallet client using the newly created account, targeting the Sepolia chain
  const client = createWalletClient({
    account: turnkeyAccount as Account,
    chain: supportedChains[chain].chain,
    transport: http(),
  })

  return client
}