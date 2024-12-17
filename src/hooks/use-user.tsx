"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTurnkey } from "@turnkey/sdk-react"
import { useRouter } from "next/navigation"

import { Email, User } from "@/types/turnkey"

export const useUser = () => {
  const { turnkey } = useTurnkey()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch user data
  const { 
    data, 
    isLoading, 
    refetch 
  } = useQuery<User | undefined>({

  
   queryKey:  ['currentUser'],
    queryFn: async () => {
      // If turnkey is not initialized, return undefined
      if (!turnkey) return undefined
      try {
        // Try to get the current user
        const currentUser = await turnkey.getCurrentUser()


        // If no current user, return undefined
        if (!currentUser) {
          return undefined
        }
        // Get user session to fetch email
        const client = await turnkey.currentUserSession()

        // Fetch full user details
        const { user: userDetails } =
          (await client?.getUser({
            organizationId: currentUser?.organization?.organizationId,
            userId: currentUser?.userId,
          })) || {}

        // Construct full user data
        return {
          user: {
            ...currentUser,
            email: userDetails?.userEmail as Email,
          },
          currentClient: client
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        return undefined
      }
    },
    // Disable automatic refetching to control when we want to refresh
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  }    
  )

  // Custom refresh function that mimics the original implementation
  const refreshUser = () => {
    // Clear the user query cache
    queryClient.invalidateQueries({queryKey: ['currentUser']})
    queryClient.setQueryData(['currentUser'], undefined)
    
    // Trigger a refetch
    refetch()
    
    // Soft page refresh
    router.refresh()
  }

  const { user, currentClient } = data || { user: undefined, currentClient: undefined }

  return { 
    user, 
    currentClient,
    refreshUser, 
    isLoading 
  }
}

