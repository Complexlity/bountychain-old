import { useEffect } from "react";
import { Address, isAddress } from "viem";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { activeChain, bountyAbi } from "../lib/constants";
import { supportedChains } from "@/lib/viem";
// import { useGasAmountEstimate } from '..';

type PayBountyArgs = {
  bountyId: string;
  submissionId: number;
  winnerAddress: Address;
  callerAddress: Address;
};

export const usePayBounty = (
  { bountyId, submissionId, winnerAddress, callerAddress }: PayBountyArgs,
  options?: {
    onSend?: (txHash: `0x${string}`) => void;
    onSuccess?: (txHash: Address) => Promise<void>;
    onError?: (err: unknown) => void;
  }
) => {
  const { chain } = useAccount();
  const enabled =
    !!bountyId &&
    !!winnerAddress &&
    !!submissionId &&
    isAddress(winnerAddress) &&
    isAddress(callerAddress);
  console.log({ enabled });

  const { data } = useSimulateContract({
    chainId: chain?.id,
    account: callerAddress,
    address: supportedChains[activeChain].contractAddress,
    abi: bountyAbi,
    functionName: "payBounty",
    args: [bountyId as Address, winnerAddress],
    query: { enabled },
  });

  const {
    data: txHash,
    isPending: isWaiting,
    isError: isSendingError,
    isSuccess: isSendingSuccess,
    writeContract: _sendPayBountyTransaction,
  } = useWriteContract();

  const sendPayBountyTransaction =
    !!data && !!_sendPayBountyTransaction
      ? () => _sendPayBountyTransaction(data.request)
      : undefined;

  useEffect(() => {
    if (!!txHash && isSendingSuccess) {
      options?.onSend?.(txHash);
    }
  }, [isSendingSuccess]);

  const {
    data: txReceipt,
    isFetching: isConfirming,
    isSuccess,
    isError: isConfirmingError,
    error,
  } = useWaitForTransactionReceipt({ chainId: chain?.id, hash: txHash });

  console.log({ isConfirmingError });

  useEffect(() => {
    if (!!txReceipt && !!txHash && isSuccess) {
      options?.onSuccess?.(txHash);
    }
  }, [isSuccess]);

  const isError = isSendingError || isConfirmingError;

  useEffect(() => {
    if (isError) {
      options?.onError?.(error);
    }
  }, [isError]);
  const isPending = isWaiting || isConfirming;
  return {
    isPending,
    isWaiting,
    isConfirming,
    isSuccess,
    isError,
    txHash,
    txReceipt,
    sendPayBountyTransaction,
  };
};
