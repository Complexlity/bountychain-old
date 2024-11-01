"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins } from "lucide-react";
import { Button } from "./ui/button";
import { CreateBountyDialog } from "@/features/bounties/components/create-bounty-dialog";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div>
      <header className="flex h-14 items-center justify-between px-4 py-8 lg:px-6">
        <Link className="flex items-center justify-center" href="/">
          <Coins className="h-8 w-8" />
          <span className="ml-2 text-xl md:text-2xl font-bold hidden sm:inline-flex">
            BountyChain
          </span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            className={cn(
              "text-sm sm:text-base md:text-xl font-medium underline-offset-4 transition-colors",
              pathname === "/"
                ? "text-primary font-semibold underline"
                : "text-muted-foreground hover:text-primary hover:underline"
            )}
            href="/"
          >
            Home
          </Link>
          <Link
            className={cn(
              "text-sm sm:text-base md:text-xl font-medium underline-offset-4 transition-colors",
              pathname === "/bounties"
                ? "text-primary font-semibold underline"
                : "text-muted-foreground hover:text-primary hover:underline"
            )}
            href="/bounties"
          >
            Bounties
          </Link>
          <CreateBountyDialog>
            <Button className="bold flex gap-1 h-fit rounded-none md:inline-block px-2 py-2 text-sm">
              <span className="hidden sm:inline">Create</span>
              <span>New Bounty</span>
            </Button>
          </CreateBountyDialog>
          <ConnectButton chainStatus={"icon"} showBalance={false} />
        </nav>
      </header>
    </div>
  );
}
