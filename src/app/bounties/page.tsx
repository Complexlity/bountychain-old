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
import FloatingButton from "@/features/bounties/components/floating-button";

export default function BountiesPage() {
  const { data, isPending } = useBounties();
  const [status, setStatus] = useState("ongoing");
  const filteredBounties = data?.filter((bounty) => bounty.status === status);

  return (
    <>
      <MaxWidthWrapper className="relative max-w-[1200px] py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold dark:text-white">
            {status === "ongoing" ? "Ongoing Bounties" : "Completed Bounties"} (
            {filteredBounties?.length})
          </h1>
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
        </div>
        {isPending ? (
          <div className="flex items-center justify-center">
            <Plus className="animate-spin h-5 w-5" />
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
          <FloatingButton />
        </CreateBountyDialog>
      </MaxWidthWrapper>
    </>
  );
}
