"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BountyCard } from "@/features/bounties/components/bounty-card";
import { CreateBountyDialog } from "@/features/bounties/components/create-bounty-dialog";
import { useBounties } from "@/features/bounties/hooks/bounties";
import { GradientSpinner } from "@/components/ui/gradient-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { SupportedChainKey, supportedChains } from "@/lib/viem";

export default function BountiesPage() {
  const { data, isPending } = useBounties();
  const [status, setStatus] = useState("ongoing");

  const activeChainId =
    supportedChains[process.env.NEXT_PUBLIC_ACTIVE_CHAIN as SupportedChainKey]
      .chain.id;
  const filteredBounties = data?.filter(
    (bounty) => bounty.status === status && bounty.chainId === activeChainId
  );

  return (
    <MaxWidthWrapper className="relative max-w-[1200px] py-8 flex-1 flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl sm:text-3xl font-bold dark:text-white">
          {isPending
            ? "Bounties"
            : status === "ongoing"
            ? "Ongoing Bounties"
            : "Completed Bounties"}{" "}
          {!isPending ? `(${filteredBounties?.length})` : ""}
        </h1>
        {isPending ? (
          <Skeleton className="w-[180px] rounded-none h-9" />
        ) : (
          <Select value={status} onValueChange={(value) => setStatus(value)}>
            <SelectTrigger className="w-[180px] rounded-none dark:text-white">
              <SelectValue placeholder="Filter By Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Bounty Status</SelectLabel>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>
      {isPending ? (
        <div className="flex flex-col gap-8 items-center justify-center  flex-1">
          <GradientSpinner />
          <p>Getting Bounties...</p>
        </div>
      ) : filteredBounties && filteredBounties.length > 0 ? (
        <div className="grid justify-center gap-6 py-2 md:grid-cols-2 lg:grid-cols-3 grid-flow-row">
          {filteredBounties.map((bounty) => (
            <BountyCard key={bounty.id} bounty={bounty} />
          ))}
        </div>
      ) : (
        <div>There are no bounties</div>
      )}
      <CreateBountyDialog>
        <button
          className="group absolute bottom-10 right-10 flex cursor-pointer items-end justify-end p-2"
          type="button"
        >
          {/* main */}
          <span className="absolute z-50 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-3 text-white shadow-xl">
            <Plus className="duration-[0.6s] h-6 w-6 transition-all group-hover:rotate-90" />
          </span>

          {/* sub middle */}
          <span className="duration-[0.2s] absolute flex w-40 scale-x-0 justify-center rounded-xl bg-zinc-200 py-2 transition-all ease-out group-hover:-translate-x-8 group-hover:-translate-y-12 group-hover:scale-x-100">
            Post New Bounty
          </span>
        </button>
      </CreateBountyDialog>
    </MaxWidthWrapper>
  );
}
