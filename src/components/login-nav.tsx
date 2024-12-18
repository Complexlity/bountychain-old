"use client"

import { CreateBountyDialog } from "@/features/bounties/components/create-bounty-dialog"
import { Button } from "./ui/button"
import AuthDialog from "./auth-dialog"


export default function Navbar() {

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto justify-between">
        <div className="font-semibold">Your Logo</div>
        <div className="flex gap-4 items-center">
    <AuthDialog />
        <CreateBountyDialog>
              <Button className="bold flex h-fit rounded-none gap-1 px-2 py-2 text-sm">
                <span className="hidden sm:inline">Create</span>
                <span>New Bounty</span>
              </Button>
            </CreateBountyDialog>
        </div>
      </div>
    </nav>
  )
}


