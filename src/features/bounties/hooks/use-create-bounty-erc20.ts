import {
  getPublicClient,
  SupportedChainKey,
  supportedChains,
} from "@/lib/viem";
import { useMutation } from "@tanstack/react-query";
import {
  Address,
  decodeEventLog,
  erc20Abi,
  parseEther,
  parseUnits,
} from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

export const useCreateBountyErc20 = ({
  writeContractAsync,
}: {
  writeContractAsync: ReturnType<typeof useWriteContract>["writeContractAsync"];
}) => {
  const { address } = useAccount();
  return useMutation({
    mutationFn: async ({
      amount,
      tokenType,
    }: {
      amount: number;
      tokenType: keyof (typeof supportedChains)[SupportedChainKey]["contracts"];
    }) => {
      if (tokenType === "eth") {
        throw new Error("ETH is not supported here");
      }

      const activeChain = process.env
        .NEXT_PUBLIC_ACTIVE_CHAIN as SupportedChainKey;
      console.log({ activeChain });
      const publicClient = getPublicClient(activeChain);
      const {
        address: contractAddress,
        decimals,
        abi: bountyAbi,
        token: tokenAddress,
      } = supportedChains[activeChain].contracts[tokenType];

      const depositAmount = parseUnits(`${amount}`, decimals);
      console.log({ depositAmount });
      console.log({ tokenAddress, address, contractAddress });

      const allowance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address as Address, contractAddress],
      });
      console.log({ allowance });

      console.log("Simulating...");
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        account: address,
        abi: bountyAbi,
        functionName: "createBounty",
        args: [depositAmount],
      });

      if (!request) {
        throw new Error("Could not simulate contract");
      }

      console.log({ request });
      console.log("Writing...");
      const hash = await writeContractAsync(request);
      console.log({ hash });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });
      let decoded = null;
      for (const log of receipt.logs) {
        try {
          decoded = decodeEventLog({
            abi: bountyAbi,
            data: log.data,
            eventName: "BountyCreated",
            topics: log.topics,
          });
        } catch (error) {
          console.log("I errrored");
        }
      }
      if (decoded) {
        const bountyId = decoded.args.bountyId as Address;
        return { bountyId, hash };
      }
      return { bountyId: null, hash };
    },
  });
};
