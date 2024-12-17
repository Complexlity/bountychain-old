"use client"

import { Button } from "@/components/ui/button"
import { HoverCardContent } from "@/components/ui/hover-card"
import { useAuth } from "@/components/auth-provider"
import { useUser } from "@/hooks/use-user"

export function AuthHoverContent() {
  const { logout } = useAuth()
  const { refreshUser } = useUser()

  const handleLogout = async () => {
    await logout()
    refreshUser()
  }

  return (
    <HoverCardContent className="w-48 p-2">
      <Button 
        variant="ghost" 
        className="w-full justify-start" 
        onClick={handleLogout}
      >
        Logout
      </Button>
    </HoverCardContent>
  )
}