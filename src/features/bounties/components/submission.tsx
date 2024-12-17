
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TruncatedAddress } from "@/components/ui/truncated-address";
import { useWallets } from "@/components/wallet-provider";
import { toast } from "@/hooks/use-toast";
import { getPublicClient, getTurnkeyWalletClient, SupportedChainKey, supportedChains } from "@/lib/viem";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTurnkey } from "@turnkey/sdk-react";
import { CheckCircle2, Clock, Loader2, Trophy, User } from "lucide-react";
import { useEffect, useState } from "react";
import { isAddress, type Address } from "viem";
import { usePayBounty } from "../hooks/use-pay-bounty";
import { type Submission } from "../lib/types";
import { createAccount } from "@turnkey/viem";

interface SubmissionCardProps {
  submission: Submission;
  callerAddress: Address;
  tokenType: keyof (typeof supportedChains)[SupportedChainKey]["contracts"];
  isExpanded: boolean;
  onToggle: () => void;
  isCreator: boolean;
  isOngoing: boolean;
  onMarkAsSolution?: () => void;
}

const MAX_LENGTH = 200;

export function SubmissionCard({
  callerAddress,
  tokenType,
  submission,
  isExpanded,
  onToggle,
  isCreator,
  isOngoing,
}: SubmissionCardProps) {
  // const { address } = useAccount();
  const { client } = useTurnkey()
  const { state } = useWallets()
  const { selectedAccount } = state
  const address = selectedAccount?.address

  const needsExpansion = submission.submissionDescription.length > MAX_LENGTH;
  const truncatedText = needsExpansion
    ? `${submission.submissionDescription.slice(0, MAX_LENGTH)}...`
    : submission.submissionDescription;
  const bountyId = submission.bountyId;
  const submissionId = submission.id;
  const winnerAddress = submission.creator as Address;
  const queryClient = useQueryClient();
  const isPending = !submission.isComplete && isOngoing;
  const isUserSubmission = submission.creator == address;
  const activeChain = process.env.NEXT_PUBLIC_ACTIVE_CHAIN as SupportedChainKey;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const chain = supportedChains[activeChain].chain;
  

  const [walletClient, setWalletClient] = useState<Awaited<
    ReturnType<typeof getTurnkeyWalletClient>
  > | null>(null)
  useEffect(() => {
    const initializeWalletClient = async () => {
      if (!selectedAccount || !address || !client) {
        alert('No client found. Getting current client')
        return
      }
      const walletClient = await getTurnkeyWalletClient(
        activeChain,
        client,
        address
      )
      setWalletClient(walletClient)
    }

    initializeWalletClient()
  }, [selectedAccount, client])


  const { address: contractAddress, abi: bountyAbi } =
    supportedChains[activeChain].contracts[tokenType];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const enabled =
    !!bountyId &&
    !!winnerAddress &&
    !!submissionId &&
    isAddress(winnerAddress) &&
    isAddress(callerAddress);
  
  // const { data: payBountyRequestData } = useSimulateContract({
  //   chainId: chain?.id,
  //   account: callerAddress,
  //   address: contractAddress,
  //   abi: bountyAbi,
  //   functionName: "payBounty",
  //   args: [bountyId as Address, winnerAddress],
  //   query: { enabled },
  // });


  const { mutateAsync: updateBountyBackup } = useMutation({
    mutationKey: ["payBounty"],
    mutationFn: async ({
      bountyId,
      submissionId,
      hash,
    }: {
      bountyId: string;
      submissionId: number;
      hash: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKUP_SERVER}/bounties/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hash,
            submissionId,
            bountyId,
          }),
        }
      );
      const result = await res.json();
      if (!res.ok) {
        throw result;
      }
      return result;
    },
    onError: () => {
      toast({
        title: "Could not update bounty",
        description:
          "Please contact complexlity: https://warpcast.com/complexlity",
        variant: "destructive",
      });

      console.log("Failed to update bounty");
    },
  });

  const { mutateAsync: updateBounty, isPending: isUpdating } = useMutation({
    mutationKey: ["payBounty"],
    mutationFn: async ({
      bountyId,
      submissionId,
      hash,
    }: {
      bountyId: string;
      submissionId: number;
      hash: string;
      tokenType: keyof (typeof supportedChains)[SupportedChainKey]["contracts"];
    }) => {
      const res = await fetch(`/api/bounty/${bountyId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hash,
          submissionId,
          bountyId,
          tokenType,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw result;
      }
      return result;
    },
    onError: async (error, data) => {
      await updateBountyBackup(data);
      toast({
        title: "Bounty details will update shortly...",
      });
      console.log("Failed to update bounty");
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sendPayBountyTransaction: payBountyMain, isPending: isMarking } =
    usePayBounty(
      { bountyId, submissionId, winnerAddress, callerAddress, tokenType },
      {
        onSuccess: async (txHash: Address) => {
          const data = { bountyId, submissionId, hash: txHash, tokenType };
          await updateBounty(data);
          queryClient.invalidateQueries({ queryKey: ["bounty", bountyId] });
          queryClient.refetchQueries({ queryKey: ["bounty", bountyId] });
        },
        onError: (error) => {
          console.error(error);
          toast({
            title: "Something went wrong paying bounty",
            description:
              error &&
              typeof error === "object" &&
              "message" in error &&
              typeof error.message === "string"
                ? error.message
                : "",
            variant: "destructive",
          });
        },
      }
    );
  
  const { mutate: payBountyTurnkey, isPending: isPayingBountyTurnkey } = useMutation({
    mutationFn: async () => {
      if (!address) {
        toast({
          title: "Connect your wallet",
          variant: "destructive"
        })
        throw new Error("Address not initialized")
      }

      let turnkeyWalletClient = walletClient
      if (!turnkeyWalletClient) {
        alert("Wallet client not found")
        if (client) {
          alert("")
          turnkeyWalletClient = await getTurnkeyWalletClient(
            activeChain,
            client,
            address
          )
        }
      }

        if (!turnkeyWalletClient || !client) {
          toast({
            title: "Turnkey wallet client not initialized",
            variant: "destructive"
          })
          throw new Error("Turnkey wallet client not initialized")
        }
      
        const publicClient = getPublicClient(activeChain)
        const turnkeyAccount = await createAccount({
          client: client,
          organizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID!,
          signWith: callerAddress,
        })
      
        const hash = await turnkeyWalletClient.writeContract({
          account: turnkeyAccount,
          address: contractAddress,
          abi: bountyAbi,
          functionName: "payBounty",
          args: [bountyId as Address, winnerAddress],
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        return hash
      },
        onSuccess: async (txHash: Address) => {
          const data = { bountyId, submissionId, hash: txHash, tokenType };
          await updateBounty(data);
          queryClient.invalidateQueries({ queryKey: ["bounty", bountyId] });
          queryClient.refetchQueries({ queryKey: ["bounty", bountyId] });
        },
        onError: (error) => {
          console.error(error);
          toast({
            title: "Something went wrong paying bounty",
            description:
              error &&
              typeof error === "object" &&
              "message" in error &&
              typeof error.message === "string"
                ? error.message
                : "",
            variant: "destructive",
          });
        },
  })
  
  // const payBounty = payBountyMain
  const payBounty = payBountyTurnkey

  return (
    <Card
      className={`${
        submission.isComplete ? "border-2 border-emerald-500" : ""
      }`}
    >
      <CardContent className="p-3 sm:p-6">
        <div className="flex flex-col space-y-2 sm:space-y-4">
          {/* Header Section */}
          <div className="flex flex-wrap items-center gap-2">
            {/* User Info */}
            <div className="flex items-center min-w-0 flex-shrink-0">
              <User className="h-4 w-4 flex-shrink-0" />
              <div className="flex items-center ml-2">
                {isUserSubmission ? (
                  <span className="font-mono text-sm">You</span>
                ) : (
                  <TruncatedAddress
                    address={submission.creator}
                    className="text-sm"
                  />
                )}
                <div className="flex-shrink-0">
                  <CopyButton text={submission.creator} />
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {submission.isComplete && (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 whitespace-nowrap">
                  <Trophy className="h-3 w-3 mr-1" />
                  Solution
                </Badge>
              )}
              {isPending && isUserSubmission && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="whitespace-nowrap">
                        <Clock className="h-3 w-3 mr-1" />
                        In Review
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        This submission is being reviewed by the bounty creator
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Action Button */}
            {isCreator && isOngoing && !submission.isComplete && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto text-emerald-500 border-emerald-500 hover:bg-emerald-500/10 disabled:text-emerald-500/50 disabled:border-emerald-500/50 whitespace-nowrap"
                //@ts-expect-error: this should work
                onClick={payBounty}
                disabled={isUpdating || isMarking || isPayingBountyTurnkey}
              >
                {isUpdating || isMarking ? (
                  <Loader2 className="h-4 w-4 animate-spin ease-in" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                )}
                Mark as Solution
              </Button>
            )}
          </div>

          {/* Content Section */}
          <Collapsible open={isExpanded} onOpenChange={onToggle}>
            <div className="text-muted-foreground">
              {isExpanded ? submission.submissionDescription : truncatedText}
            </div>
            {needsExpansion && (
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-0 h-auto mt-2 text-sm hover:text-primary"
                >
                  {isExpanded ? "Show less" : "Show more"}
                </Button>
              </CollapsibleTrigger>
            )}
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}
