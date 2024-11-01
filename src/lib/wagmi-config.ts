import { createConfig, http } from "wagmi";
import { supportedChains, SupportedChainKey } from "./viem";

const activeChain =
  supportedChains[process.env.NEXT_PUBLIC_ACTIVE_CHAIN as SupportedChainKey];

export const wagmiConfig = createConfig({
  chains: [activeChain.chain],
  //@ts-expect-error: This is valid
  transports: {
    [activeChain.chain.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
