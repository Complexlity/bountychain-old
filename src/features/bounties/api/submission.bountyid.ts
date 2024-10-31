"server-only";

import invariant from "tiny-invariant";
import { createBountySubmission, getBountySubmissions } from "../lib/queries";
import { isAddress } from "viem";
import type {
  CreateBountySubmissionSchema,
  WithSignature,
} from "@/features/bounties/lib/types";
import { NextRequest } from "next/server";
import { insertSubmissionsSchema } from "@/db/schema";
import { getPublicClient } from "@/lib/viem";
import { activeChain } from "../lib/constants";

export async function get({ params }: { params: { bountyId: string } }) {
  // Handle GET request
  invariant(params.bountyId, "Missing bountyId param");
  const bounty = await getBountySubmissions(params.bountyId); // Fetch bounties from the database
  return bounty;
}

export async function post({ request }: { request: NextRequest }) {
  const formData = await request.json();
  const { signature, address, ...message } =
    formData as WithSignature<CreateBountySubmissionSchema>;
  if (!signature || !isAddress(address)) {
    return { message: "Signature or Address Invalid" };
  }
  const isValid = await getPublicClient(activeChain).verifyMessage({
    address,
    message: JSON.stringify(message),
    signature,
  });
  if (!isValid) {
    return { message: "Invalid signature", status: 422 };
  }
  const { success, error } = insertSubmissionsSchema.safeParse(formData);
  if (!success) {
    const message = error.flatten();
    return { message, status: 422 };
  }

  const newSubmission = await createBountySubmission(formData).catch(
    () => null
  ); // Create new bounty
  if (!newSubmission)
    return { message: "Something went wrong creating submission", status: 500 };
  return newSubmission;
}
