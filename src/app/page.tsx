"use client";

import MaxWidthWrapper from "@/components/max-width-wrapper";
import { BackgroundLines } from "@/components/ui/background-lines";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlareCard } from "@/components/ui/glare-card";
// import { BountyCard } from "@/features/bounties/components/bounty-card";
import { CreateBountyDialog } from "@/features/bounties/components/create-bounty-dialog";
import { useBounties } from "@/features/bounties/hooks/bounties";
import { Award, Search, Wallet } from "lucide-react";
// import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="grid flex-1 gap-12">
        <Hero />
        <Features />
        <OngoingBounties />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <BackgroundLines className="h-fit">
      <div className="flex flex-col py-48 dark:bg-gray-950">
        <section className="flex w-full flex-1 flex-col items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="items-center space-y-4">
              <div className="space-y-2">
                <h1 className="bg-inherit text-center text-3xl font-bold tracking-tighter dark:text-white sm:text-6xl md:text-7xl lg:text-6xl/none">
                  Decentralized Bounty Platform
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                  Post bounties, solve challenges, and earn rewards in a
                  decentralized ecosystem.
                </p>
              </div>
              <div className="flex justify-center">
                <CreateBountyDialog>
                  <button className="group relative inline-flex h-[calc(48px+8px)] items-center justify-center rounded-full bg-neutral-950 py-1 pl-6 pr-14 font-medium text-neutral-50">
                    <span className="z-10 pr-2">Get Started</span>
                    <div className="absolute right-1 inline-flex h-12 w-12 items-center justify-end rounded-full bg-neutral-700 transition-[width] group-hover:w-[calc(100%-8px)]">
                      <div className="mr-3.5 flex items-center justify-center">
                        <svg
                          width={15}
                          height={15}
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-neutral-50"
                        >
                          <path
                            d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                </CreateBountyDialog>
              </div>
            </div>
          </div>
        </section>
      </div>
    </BackgroundLines>
  );
}

function Features() {
  return (
    <section className="w-full dark:bg-gray-800">
      <div className="grid gap-12">
        <h2 className="py-4 text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Why Choose BountyChain?
        </h2>
        <MaxWidthWrapper className="grid grid-cols-2 items-center justify-center gap-4 md:grid-cols-3">
          <div className="flex justify-center">
            <GlareCard>
              <Card className="h-full border-none bg-sky-950 text-white">
                <CardHeader>
                  <Search className="mb-2 h-6 w-6" />
                  <CardTitle>Discover Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Find exciting bounties that match your skills and interests.
                  </p>
                </CardContent>
              </Card>
            </GlareCard>
          </div>
          <div className="flex items-center justify-center">
            <GlareCard>
              <Card className="h-full border-none bg-blue-950 text-white">
                <CardHeader>
                  <Award className="mb-2 h-6 w-6" />
                  <CardTitle>Earn Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Complete bounties and earn cryptocurrency rewards securely.
                  </p>
                </CardContent>
              </Card>
            </GlareCard>
          </div>
          <div className="flex items-center justify-center">
            <GlareCard>
              <Card className="h-full border-none bg-cyan-950 text-white">
                <CardHeader>
                  <Wallet className="mb-2 h-6 w-6" />
                  <CardTitle>Decentralized Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Receive instant payments directly to your wallet upon
                    completion.
                  </p>
                </CardContent>
              </Card>
            </GlareCard>
          </div>
        </MaxWidthWrapper>
      </div>
    </section>
  );
}

function OngoingBounties() {
  let { data } = useBounties();
  if (!data) {
    data = [];
  }
  return (
    <section className="w-full py-12">
      <MaxWidthWrapper>
        <h2 className="pb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Featured Bounties
        </h2>
        <div className="mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.length > 0 && <BountyCard bounty={data[0]} />}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}

function Footer() {
  return (
    <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        © 2024 BountyChain. All rights reserved.
      </p>
      <nav className="flex gap-4 sm:ml-auto sm:gap-6">
        <Link className="text-xs underline-offset-4 hover:underline" href="#">
          Terms of Service
        </Link>
        <Link className="text-xs underline-offset-4 hover:underline" href="#">
          Privacy
        </Link>
      </nav>
    </footer>
  );
}

type bounty = {
  id: string;
  creator: string;
  title: string;
  description: string;
  amount: number;
  createdAt: Date;
};

function BountyCard({ bounty }: { bounty: bounty }) {
  return (
    <div className="group relative h-full w-[350px] cursor-pointer">
      <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-600 to-green-600 opacity-25 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200 ">
        Hello{" "}
      </div>

      <Card
        key={bounty.id}
        className="flex relative h-full flex-col overflow-hidden rounded-none leading-none ring-1 ring-gray-900/5"
      >
        <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-50 text-center font-bold">
          <CardTitle className="text-xl font-bold">{bounty.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-6">
          <p className="mb-4 flex-1 text-gray-700">
            {bounty.description.length > 200
              ? bounty.description.slice(0, 200) + "..."
              : bounty.description}
          </p>

          <div className="bountys-center flex justify-between">
            <span className="flex items-center gap-1">
              <span className="text-3xl font-bold text-green-600">
                {bounty.amount}
              </span>
              <span>ETH</span>
            </span>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-100 p-4">
          <Link
            className={buttonVariants({
              className: "b mx-auto w-full rounded-none transition-colors",
            })}
            href={`/bounty/${bounty.id}`}
          >
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
