"use client"

import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { useUser } from "@/hooks/use-user"
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTurnkey } from "@turnkey/sdk-react"
import { Loader2 } from "lucide-react"
import { useWallets } from "./wallet-provider"
import { useEffect } from "react"
import { getPublicClient, supportedChains } from "@/lib/viem"
import { formatEther, isAddress } from "viem"


export default function AuthButton({
  setShowAuthModal
}: {
  setShowAuthModal: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const { user, isLoading, refreshUser } = useUser()
  const { state } = useWallets()
  const { turnkey } = useTurnkey()
  const { selectedAccount } = state
  const userAddress = selectedAccount?.address
  const activeChain = process.env.NEXT_PUBLIC_ACTIVE_CHAIN as keyof typeof supportedChains
  
  const publicClient = getPublicClient(activeChain)
  const handleAuthClick = () => {
    if (!user && !!turnkey && !isLoading) {
      setShowAuthModal(true)
    }
  }


  useEffect(() => {
    if (!!user || isLoading || !turnkey) {
    setShowAuthModal(false)
  }
}, [user, isLoading, turnkey])

  const {data: userBalance} = useQuery({
    queryKey: ['userBalance', userAddress],
    queryFn: async () => {
      if (!userAddress || !isAddress(userAddress)) {
        return 0
      }
      const balance = await publicClient.getBalance({ address: userAddress })

      return Number(formatEther(balance)).toFixed(3).toString()
    },
    enabled: !!userAddress,
    refetchInterval: 1000 * 60 * 5,
  })
  // Create a mutation for logout
  const { mutate: logoutMutation, isPending } = useMutation({
    mutationFn: async () => {
      // Perform logout
      await turnkey?.logoutUser()
    },

    // On successful logout
    onSuccess: () => {
      // Clear the user query cache completely
      refreshUser()
      //
      window.location.reload()
    },
          
    // Handle any potential errors
    onError: (error) => {
      console.error('Logout failed', error)
      // Optionally, you could show an error toast/notification
    }
  })



  // Loading state
  if (isLoading || !turnkey ) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  // Not logged in state
  if (!user) {
    return (
      <Button onClick={handleAuthClick}>
        Sign in
      </Button>
    )
  }


  if (!selectedAccount) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Getting Account...
      </Button>
    )
  }

  // Logged in state
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <Button variant="outline">
          {
            isPending ?
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
              :
              ((userAddress?.slice(0, 6) || '') + '...' + (userAddress?.slice(-4) || '')) +
              ` || ${userBalance || 0} ETH`
        }
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-48 p-2">
        {/* Fix: Should be a buttion */}
        <div
          name="logout"
      variant="ghost"
          className="w-full justify-start"
          //@ts-expect-error: Logging out
          onClick={logoutMutation}
      disabled={isPending}
    >
      {isPending ? 'Logging out...' : 'Logout'}
    </div>
      </HoverCardContent>
    </HoverCard>
  )
}

  