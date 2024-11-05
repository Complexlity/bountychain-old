"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Bounty,
  CreateBountySubmissionSchema,
  WithSignature,
} from "@/features/bounties/lib/types";
import { toast } from "@/hooks/use-toast";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { isAddress } from "viem";
import { useAccount, useSignMessage } from "wagmi";

export function SubmitSolution({ bounty }: { bounty: Bounty }) {
  const [newSubmission, setNewSubmission] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const { address } = useAccount();
  const { signMessageAsync: signMessage } = useSignMessage();
  const queryClient = useQueryClient();
  const bountyId = bounty.id;
  const { openConnectModal } = useConnectModal();

  const { mutateAsync: createSubmission, isPending } = useMutation({
    mutationKey: ["createBountySubmission"],
    mutationFn: async (data: WithSignature<CreateBountySubmissionSchema>) => {
      const res = await fetch(`/api/submission/${bountyId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw result;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bounty", bountyId] });
      toast({
        title: "Submission added successfully",
      });
      setNewSubmission("");
    },
    onError: (error) => {
      toast({
        title: "Error creating bounty submisson",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !isAddress) {
      if (!!openConnectModal) {
        openConnectModal();
      } else return;
    }

    if (!newSubmission) {
      toast({
        variant: "destructive",
        title: "Submission Required",
        description: "Please provide a description of your solution",
      });
      return;
    }

    if (!address) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet to submit a solution",
      });
      return;
    }
    const submission: CreateBountySubmissionSchema = {
      bountyId,
      submissionDescription: newSubmission,
      creator: address,
    };
    setIsSigning(true);

    const signature = await signMessage({
      message: JSON.stringify(submission),
    }).catch(() => {
      toast({
        title: "Error signing message",
        variant: "destructive",
      });
      return null;
    });
    setIsSigning(false);
    if (!signature) return;
    await createSubmission({ ...submission, signature, address }).catch((e) => {
      toast({
        title: "Error creating submission",
        description: e.message,
        variant: "destructive",
      });
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-semibold">Submit Your Solution</h2>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Textarea
                placeholder="Describe your solution or provide a link to your work"
                value={newSubmission}
                onChange={(e) => setNewSubmission(e.target.value)}
                required
                className="min-h-[100px]"
              />
              {!address ? (
                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  onClick={() => openConnectModal?.()}
                >
                  Connect Wallet
                </Button>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  isLoading={isPending || isSigning}
                >
                  Submit Solution
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
