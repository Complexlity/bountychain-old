import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { useWriteContract } from "wagmi";
import { arbitrumSepoliaPublicClient } from "@/lib/viem";
import { bountyAbi } from "../lib/constants";

export const usePayBounty = ({
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
      const bountyContractAddress =
        "0x6E46796857a0E061374a0Bcb4Ce01af851773d2A";
      console.log("Simulating contract...");

      const { request } = await arbitrumSepoliaPublicClient.simulateContract({
        account: callerAddress,
        address: bountyContractAddress,
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

      const receipt =
        await arbitrumSepoliaPublicClient.waitForTransactionReceipt({
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
