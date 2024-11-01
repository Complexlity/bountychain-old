import { getPublicClient, supportedChains } from "@/lib/viem";
import { NextRequest } from "next/server";
import { Address } from "viem";
import { bountyAbi } from "../lib/constants";
import { createBounty, getBounties } from "../lib/queries";
import { CreateBountySchema } from "../lib/types";
import { isZeroAddress } from "../lib/utils";
import serverEnv from "@/lib/server-env";

export async function get() {
  const bounties = await getBounties();
  return bounties;
}

export async function post({ request }: { request: NextRequest }) {
  const formData = (await request.json()) as CreateBountySchema;
  const activeChain = serverEnv.NEXT_PUBLIC_ACTIVE_CHAIN;
  const bountyDetails = await getPublicClient(activeChain).readContract({
    address: supportedChains[activeChain].bountyContractAddress,
    abi: bountyAbi,
    functionName: "getBountyInfo",
    args: [formData.id as Address],
  });
  if (
    !bountyDetails ||
    isZeroAddress(bountyDetails[0] || bountyDetails[3] < 0)
  ) {
    return { error: "Bounty not found" };
  }
  const newBounty = await createBounty(formData); // Create new bounty
  return newBounty;
}
