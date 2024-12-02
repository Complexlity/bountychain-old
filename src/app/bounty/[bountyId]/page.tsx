"use client";

// import { getBounty } from "@/features/bounties/lib/queries";
import SingleBounty from "./single-bounty";
// import { Metadata } from "next";

// type Props = {
//   params: { bountyId: string };
// };

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const { bountyId } = params;
//   if (!bountyId) return {};

//   const bounty = await getBounty(bountyId);
//   if (!bounty) return {};

//   const ogUrl = new URL(
//     `api/og/bounty/${bountyId}`,
//     process.env.NEXT_PUBLIC_APP_URL
//   ).toString();

//   return {
//     title: `${bounty?.title}: ${bounty.amount} ${bounty.token.toUpperCase()}`,
//     description: bounty?.description,
//     openGraph: {
//       title: `${bounty?.title}: ${bounty.amount} ${bounty.token.toUpperCase()}`,
//       description: bounty?.description,
//       images: [
//         {
//           url: ogUrl,
//           width: 1200,
//           height: 630,
//           alt: bounty?.title,
//         },
//       ],
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: `${bounty?.title}: ${bounty.amount} ${bounty.token.toUpperCase()}`,
//       description: bounty?.description,
//       images: [ogUrl],
//     },
//   };
// }

export default function Page({ params }: { params: { bountyId: string } }) {
  return <SingleBounty params={params} />;
}
