import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { useWriteContract } from "wagmi";
import { activeChain, bountyAbi } from "../lib/constants";
import { getPublicClient, supportedChains } from "@/lib/viem";

export const usePayBountyAsync = ({
  writeContractAsync,
  onSuccess,
}: {
  writeContractAsync: ReturnType<typeof useWriteContract>["writeContractAsync"];
  onSuccess?: (txHash: Address) => void;
}) => {
  return useMutation({
    mutationFn: async (options: {
      bountyId: string;
      winnerAddress: Address;
      callerAddress: Address;
    }) => {
      const { bountyId, winnerAddress, callerAddress } = options;
      const publicClient = getPublicClient(activeChain);

      const { request } = await publicClient.simulateContract({
        account: callerAddress,
        address: supportedChains[activeChain].contractAddress,
        abi: bountyAbi,
        functionName: "payBounty",
        args: [bountyId as Address, winnerAddress],
      });

      console.log({ request });
      if (!request) {
        throw new Error("Could not simulate contract");
      }

      console.log("Writing contract...");
      const hash = await writeContractAsync(request);

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });
      console.log(receipt.transactionHash);
      return { hash };
    },
    onSuccess: (data) => {
      onSuccess?.(data.hash);
    },
    onError: () => {
      alert("Something went wrong");
      return;
    },
  });
};
