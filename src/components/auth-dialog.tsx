"use client"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import Auth from "./auth"
import AuthButton from "./auth-button"


export default function AuthDialog() {
    const [showAuthModal, setShowAuthModal] = useState(false)
  
    return (
  <>
    <AuthButton setShowAuthModal={setShowAuthModal} />
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
    <DialogTrigger>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[500px] p-0">
      <Auth setShowAuthModal={setShowAuthModal} />
    </DialogContent>
  </Dialog> 
  </>
    )
  }
  
  