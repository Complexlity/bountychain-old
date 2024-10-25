import { get } from "@/features/bounties/api/bounty.bountyid";
import { NextRequest } from "next/server";
export const GET = async (
  _: NextRequest,
  {
    params,
  }: {
    params: Promise<{ bountyId: string }>;
  }
) => {
  const bountyId = (await params).bountyId;
  const res = await get({ params: { bountyId } });
  return new Response(JSON.stringify(res), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
