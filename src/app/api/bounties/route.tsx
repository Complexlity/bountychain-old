import { get, post } from "@/features/bounties/api/bounties";
import { NextRequest } from "next/server";

export const GET = async () => {
  const res = await get();
  return new Response(JSON.stringify(res));
};

export const POST = async (request: NextRequest) => {
  const res = await post({ request });
  return new Response(JSON.stringify(res));
};
