"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CopyButton } from "@/components/ui/copy-button";
import { CheckCircle2, Clock, Loader2, Trophy, User } from "lucide-react";
import { type Submission } from "../lib/types";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePayBountyOld } from "../hooks/use-pay-old";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import env from "@/lib/server-env";
import clientEnv from "@/lib/client-env";

interface SubmissionCardProps {
  submission: Submission;
  callerAddress: Address;
  isExpanded: boolean;
  onToggle: () => void;
  isCreator: boolean;
  isOngoing: boolean;
  onMarkAsSolution?: () => void;
}

const MAX_LENGTH = 200;

export function SubmissionCard({
  callerAddress,
  submission,
  isExpanded,
  onToggle,
  isCreator,
  isOngoing,
}: SubmissionCardProps) {
  const { address } = useAccount();
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
        `${clientEnv.NEXT_PUBLIC_BACKUP_SERVER}/bounties/complete`,
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
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw result;
      }
      return result;
    },
    onError: async (error, data) => {
      //Send completion data to backup server if
      await updateBountyBackup(data);
      toast({
        title: "Bounty details will update shortly...",
      });
      //TODO: Retry this, or save for later. Handle bad db updates somehow.
      console.log("Failed to update bounty");
    },
  });

  const { sendPayBountyTransaction: payBounty, isPending: isMarking } =
    usePayBountyOld(
      { bountyId, submissionId, winnerAddress, callerAddress },
      {
        onSuccess: async (txHash: Address) => {
          await updateBounty({ bountyId, submissionId, hash: txHash });
          queryClient.invalidateQueries({ queryKey: ["bounty", bountyId] });
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

  return (
    <Card
      className={`${
        submission.isComplete ? "border-2 border-emerald-500" : ""
      }`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4" />
              <div className="flex items-center">
                <span className="font-mono text-sm">
                  {isUserSubmission ? "You" : submission.creator}
                </span>
                <CopyButton text={submission.creator} />
              </div>
              {submission.isComplete && (
                <Badge className="ml-2 bg-emerald-500 hover:bg-emerald-600">
                  <Trophy className="h-3 w-3 mr-1" />
                  Solution
                </Badge>
              )}
              {isPending && isUserSubmission && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="ml-2">
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
              {isCreator && isOngoing && !submission.isComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto text-emerald-500 border-emerald-500 hover:bg-emerald-500/10 disabled:text-emerald-500/50 disabled:border-emerald-500/50"
                  onClick={payBounty}
                  disabled={isUpdating || isMarking}
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
        </div>
      </CardContent>
    </Card>
  );
}
