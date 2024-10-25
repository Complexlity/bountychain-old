import invariant from "tiny-invariant";
import { createBountySubmission, getBountySubmissions } from "../lib/queries";
import { isAddress } from "viem";
// import {
//   WithSignature,
//   CreateBountySubmissionSchema,
// } from "@/app/routes/bounty.$bountyId";
import { arbitrumSepoliaPublicClient } from "@/lib/viem";
import type {
  CreateBountySubmissionSchema,
  WithSignature,
} from "@/features/bounties/lib/types";
import { NextRequest } from "next/server";

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
  const isValid = await arbitrumSepoliaPublicClient.verifyMessage({
    address,
    message: JSON.stringify(message),
    signature,
  });
  if (!isValid) {
    return { message: "Invalid signature" };
  }

  const newSubmission = await createBountySubmission(formData).catch(
    () => null
  ); // Create new bounty
  if (!newSubmission)
    return { message: "Something went wrong creating submission" };
  return newSubmission;
}
