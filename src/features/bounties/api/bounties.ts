import { insertBountiesSchema } from "@/db/schema";
import serverEnv from "@/lib/server-env";
import { getPublicClient, supportedChains } from "@/lib/viem";
import { NextRequest } from "next/server";
import { Address } from "viem";
import { createBounty, getBounties } from "../lib/queries";
import { CreateBountySchema } from "../lib/types";
import { isZeroAddress } from "../lib/utils";

export async function get() {
  const bounties = await getBounties();
  return bounties;
}

export async function post({ request }: { request: NextRequest }) {
  const formData = (await request.json()) as CreateBountySchema;
  const { success, data } = insertBountiesSchema.safeParse(formData);
  if (!success) {
    return { message: "Invalid data", statusCode: 422 };
  }
  console.log("I was parsed properly...");
  const activeChain = serverEnv.NEXT_PUBLIC_ACTIVE_CHAIN;
  const publicClient = getPublicClient(activeChain);
  const type =
    (data.token as keyof (typeof supportedChains)[typeof activeChain]["contracts"]) ??
    "eth";
  const { address: contractAddress, abi: bountyAbi } =
    supportedChains[activeChain].contracts[type];
  const bountyDetails = await publicClient.readContract({
    address: contractAddress,
    abi: bountyAbi,
    functionName: "getBountyInfo",
    args: [data.id as Address],
  });
  if (!bountyDetails || isZeroAddress(bountyDetails[0])) {
    return { message: "Bounty not found", statusCode: 400 };
  }
  console.log("Bounty found. Creating on db...");
  const newBounty = await createBounty(data).catch((e) => {
    console.log(e);
    if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return { message: "Bounty already exists", statusCode: 400 };
    }
    return { message: "Something went wrong", statusCode: 500 };
  }); // Create new bounty
  return newBounty;
}
