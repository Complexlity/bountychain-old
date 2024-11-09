import { getBounty } from "@/features/bounties/lib/queries";
import SingleBounty from "./single-bounty";

export async function generateMetadata({
  params,
}: {
  params: { bountyId: string };
}) {
  const { bountyId } = params;
  if (!bountyId) return null;
  const bounty = await getBounty(bountyId);
  if (!bounty) return null;
  return {
    title: `${bounty?.title}: ${bounty.amount} ${bounty.token.toUpperCase()}`,
    description: bounty?.description,
  };
}

export default function Page({ params }: { params: { bountyId: string } }) {
  return <SingleBounty params={params} />;
}
