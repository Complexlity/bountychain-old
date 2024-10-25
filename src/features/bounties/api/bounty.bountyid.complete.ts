import { ClientActionFunctionArgs, json } from "@remix-run/react";
import { Address, decodeEventLog } from "viem";
import { z } from "zod";
import { arbitrumSepoliaPublicClient } from "@/lib/viem";
import { completeBounty } from "../lib/queries";
import { isZeroAddress } from "../lib/utils";
import { bountyAbi } from "../lib/constants";
import { NextRequest } from "next/server";

const postSchema = z.object({
  hash: z
    .string()
    .startsWith("0x")
    .transform((val): Address => val as Address),
  bountyId: z
    .string()
    .startsWith("0x")
    .transform((val): Address => val as Address),
  submissionId: z.coerce.number(),
});

export const post = async ({ request }: { request: NextRequest }) => {
  const formData = await request.json();
  const { hash, bountyId, submissionId } = postSchema.parse(formData);
  const txReceipt = await arbitrumSepoliaPublicClient.getTransactionReceipt({
    hash,
  });
  const logs = txReceipt.logs;
  const decoded = decodeEventLog({
    abi: bountyAbi,
    data: logs[0].data,
    topics: logs[0].topics,
  });
  if (
    decoded.eventName === "BountyPaid" &&
    "args" in decoded &&
    decoded.args &&
    "bountyId" in decoded.args &&
    !isZeroAddress(decoded.args.bountyId)
  ) {
    await completeBounty(bountyId, submissionId);
    return { message: "ok" };
  }
  return { message: "Something went wrong" };
};
