"use client";

import { Bounty } from "@/features/bounties/components/bounty";
import { useBounty } from "@/features/bounties/hooks/bounties";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import invariant from "tiny-invariant";

export default function Page({ params }: { params: { bountyId: string } }) {
  const { bountyId } = params;
  const router = useRouter();
  invariant(bountyId, "Bounty Id is not defined");

  const { data: bounty, isLoading, isError } = useBounty(bountyId);

  useEffect(() => {
    if (!bountyId) {
      router.push("/bounties");
      return;
    }
  }, [bountyId]);

  useEffect(() => {
    if (!isLoading && (!bounty || isError)) {
      router.push("/bounties");
    }
  }, [isLoading, bounty, isError]);

  if (!bountyId || isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div></div>;
  }

  if (!bounty) {
    return <div></div>;
  }

  return <Bounty bounty={bounty} />;
}
