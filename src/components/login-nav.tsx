"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CreateBountyDialog } from "@/features/bounties/components/create-bounty-dialog"
import { useState } from "react"
import Auth from "./auth"
import AuthButton from "./auth-button"
import { Button } from "./ui/button"


export default function Navbar() {
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto justify-between">
        <div className="font-semibold">Your Logo</div>
        <div className="flex gap-4 items-center">

        <AuthButton setShowAuthModal={setShowAuthModal} />
        <CreateBountyDialog>
              <Button className="bold flex h-fit rounded-none gap-1 px-2 py-2 text-sm">
                <span className="hidden sm:inline">Create</span>
                <span>New Bounty</span>
              </Button>
            </CreateBountyDialog>
        </div>
      </div>
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <Auth setShowAuthModal={setShowAuthModal} />
        </DialogContent>
      </Dialog>
      
    </nav>
  )
}


