"server-only";

import { createPublicClient, http } from "viem";
import { arbitrum, arbitrumSepolia } from "viem/chains";

export const arbitrumPublicClient = createPublicClient({
  chain: arbitrum,
  transport: http(),
});
export const arbitrumSepoliaPublicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});
