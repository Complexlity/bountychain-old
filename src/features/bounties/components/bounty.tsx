"use client";

import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import { type Bounty } from "../lib/types";
import { SubmissionCard } from "./submission";
import { SubmitSolution } from "./submission-form";
import { SupportedChainKey, supportedChains } from "@/lib/viem";
import { useTokenPrice } from "@/hooks/use-token-price";
export function Bounty({ bounty }: { bounty: Bounty }) {
  const [expandedSubmissionIndex, setExpandedSubmissionIndex] = useState<
    number | null
  >(null);
  const { address } = useAccount();
  const isCreator = address === bounty.creator;
  const isOngoing = bounty.status === "ongoing";

  const { data: tokenPrice } = useTokenPrice({
    tokenType:
      bounty.token as keyof (typeof supportedChains)[SupportedChainKey]["contracts"],
    chain: process.env.NEXT_PUBLIC_ACTIVE_CHAIN as SupportedChainKey,
  });

  const handleSubmissionToggle = (index: number) => {
    setExpandedSubmissionIndex(
      expandedSubmissionIndex === index ? null : index
    );
  };

  const submissions = bounty.submissions ?? [];
  const userHasSubmitted = submissions.some(
    (submission) => submission.creator === address
  );
  const userSubmission = submissions.find(
    (submission) => submission.creator === address
  );
  const otherSubmissions = submissions.filter(
    (submission) => submission.creator !== address
  );

  return (
    <div className="w-full max-w-3xl mx-auto bg-background/50 backdrop-blur-sm rounded-lg">
      <div className="p-8 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between relative ">
            <div className="flex items-center justify-center absolute top-[60%] -left-7 -translate-y-1/2 md:-left-14">
              <Link href="/bounties">
                <button>
                  <ArrowLeft className="md:h-8 md:w-8" />
                  <span className="sr-only">Back to bounties</span>
                </button>
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {bounty.title}
            </h1>
            <Badge
              variant={isOngoing ? "default" : "secondary"}
              className={
                isOngoing
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-green-500 hover:bg-green-600"
              }
            >
              {bounty.status}
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Creator</span>
            <div className="flex items-center">
              {isCreator ? (
                <Badge variant="outline" className="ml-2">
                  You
                </Badge>
              ) : (
                <span className="font-mono">{bounty.creator}</span>
              )}
              <CopyButton text={bounty.creator} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-emerald-500">
              {bounty.amount} {bounty.token.toUpperCase()}
            </span>
            {tokenPrice && (
              <span className="bg-[#191D200f] rounded-sm px-1 py-[1px] whitespace-nowrap text-[#191D20b3] text-xs font-bold opacity-100">
                ({(tokenPrice.usdPrice * bounty.amount).toFixed(2)} USD)
              </span>
            )}
            <Badge
              variant="outline"
              className="text-emerald-500 border-emerald-500"
            >
              Reward
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            {bounty.description}
          </p>
          <Separator className="bg-gray-400/50" />

          {!isCreator && !userHasSubmitted && isOngoing && (
            <>
              <SubmitSolution bounty={bounty} />
              <Separator className="bg-gray-400/50" />
            </>
          )}

          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold">
              Submissions ({bounty.submissions.length})
            </h2>

            {/* User's submission */}
            {userSubmission && (
              <div className="">
                <SubmissionCard
                  callerAddress={address!}
                  tokenType={
                    bounty.token as keyof (typeof supportedChains)[SupportedChainKey]["contracts"]
                  }
                  submission={userSubmission}
                  isExpanded={
                    expandedSubmissionIndex ===
                    submissions.indexOf(userSubmission)
                  }
                  onToggle={() =>
                    handleSubmissionToggle(submissions.indexOf(userSubmission))
                  }
                  isCreator={isCreator}
                  isOngoing={isOngoing}
                />
              </div>
            )}

            {/* Other submissions */}
            {otherSubmissions.length > 0 && (
              <div>
                <div className="space-y-4">
                  {otherSubmissions
                    .sort((a, b) => Number(b.isComplete) - Number(a.isComplete))
                    .map((submission, index) => (
                      <SubmissionCard
                        key={index}
                        callerAddress={address!}
                        submission={submission}
                        tokenType={
                          bounty.token as keyof (typeof supportedChains)[SupportedChainKey]["contracts"]
                        }
                        isExpanded={
                          expandedSubmissionIndex ===
                          submissions.indexOf(submission)
                        }
                        onToggle={() =>
                          handleSubmissionToggle(
                            submissions.indexOf(submission)
                          )
                        }
                        isCreator={isCreator}
                        isOngoing={isOngoing}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
