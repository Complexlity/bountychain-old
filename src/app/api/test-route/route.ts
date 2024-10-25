import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@/db/schema";
import { NextRequest } from "next/server";
import env from "@/lib/env";

const data = {
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
};

const client = createClient(data);
async function main() {
  console.log({ data });
  const db = drizzle({ client, schema });

  const result = await db.run("select 1");
  console.log({ result });
  const res = db.query.bounties.findFirst({});
  return res;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = async (_: NextRequest) => {
  const res = await main();
  return new Response(JSON.stringify(res));
};
