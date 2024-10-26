import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { Coins } from "lucide-react";
import { Button } from "./ui/button";
import { CreateBountyDialog } from "@/features/bounties/components/create-bounty-dialog";

export default function Navbar() {
  return (
    <div>
      <header className="flex h-14 items-center justify-between px-4 py-8 lg:px-6">
        <Link className="flex items-center justify-center" href="/">
          <Coins className="h-6 w-6" />
          <span className="ml-2 text-lg font-bold">BountyChain</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          {/* <Link
						className="text-sm font-medium hover:underline underline-offset-4"
						to="#"
					>
						Features
					</Link> */}
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="/"
          >
            Home
          </Link>
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="/bounties"
          >
            Bounties
          </Link>
          <CreateBountyDialog>
            <Button className="bold hidden h-fit rounded-none md:inline-block">
              Create Bounty
            </Button>
          </CreateBountyDialog>
          <ConnectButton chainStatus={"icon"} showBalance={false} />
        </nav>
      </header>
    </div>
  );
}
