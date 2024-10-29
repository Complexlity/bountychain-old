import { useEffect } from "react";
import { Address, isAddress } from "viem";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { BOUNTY_CONTRACT_ADDRESS, bountyAbi } from "../lib/constants";
// import { useGasAmountEstimate } from '..';

type PayBountyArgs = {
  bountyId: string;
  submissionId: number;
  winnerAddress: Address;
  callerAddress: Address;
};

export const usePayBountyOld = (
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

  const { data, isError: simulateError } = useSimulateContract({
    chainId: chain?.id,
    account: callerAddress,
    address: BOUNTY_CONTRACT_ADDRESS,
    abi: bountyAbi,
    functionName: "payBounty",
    args: [bountyId as Address, winnerAddress],
    query: { enabled },
  });

  console.log({ simulateError });

  const {
    data: txHash,
    isPending: isWaiting,
    isError: isSendingError,
    isSuccess: isSendingSuccess,
    writeContract: _sendPayBountyTransaction,
  } = useWriteContract();

  console.log({ isSendingError });

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
