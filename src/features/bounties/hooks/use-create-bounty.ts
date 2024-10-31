import {
  default as abi,
  default as BountyContractABI,
} from "@/features/bounties/contract/bountyAbi.json";
import { getPublicClient, supportedChains } from "@/lib/viem";
import { useMutation } from "@tanstack/react-query";
import { Address, decodeEventLog, parseEther } from "viem";
import { useWriteContract } from "wagmi";
import { activeChain } from "../lib/constants";

export const useCreateBounty = ({
  writeContractAsync,
}: {
  writeContractAsync: ReturnType<typeof useWriteContract>["writeContractAsync"];
}) => {
  return useMutation({
    mutationFn: async (amount: number, tokenType: "ETH" | "USDC" = "ETH") => {
      const isETH = tokenType === "ETH";
      const publicClient = getPublicClient(activeChain);

      const { request } = await publicClient.simulateContract({
        address: supportedChains[activeChain].bountyContractAddress,
        abi: BountyContractABI,
        functionName: "createBounty",
        args: [isETH ? 0 : 1, parseEther(`${amount}`)],
        value: isETH ? parseEther(`${amount}`) : undefined,
      });
      if (!request) {
        throw new Error("Could not simulate contract");
      }

      const hash = await writeContractAsync(request);

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });
      const log = receipt.logs[0];
      const decoded = decodeEventLog({
        abi,
        data: log.data,
        topics: log.topics,
      });
      if (
        decoded.eventName === "BountyCreated" &&
        "args" in decoded &&
        decoded.args &&
        "bountyId" in decoded.args
      ) {
        const bountyId = decoded.args.bountyId as Address;
        return { bountyId, hash };
      }

      return { bountyId: null, hash };
    },
  });
};
