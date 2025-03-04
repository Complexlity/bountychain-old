import { useQuery } from "@tanstack/react-query";
import { createPublicClient, Hex, http } from 'viem';
import { mainnet } from 'viem/chains';

export function useEnsName(address?: string) {
    return useQuery({
      queryKey: ["ensName", address],
      queryFn: async () => {
        if (!address) return null;
        
        const client = createPublicClient({
          chain: mainnet,
          transport: http(),
        });
  
        try {
          const ensName = await client.getEnsName({ address: address as Hex });
          return ensName;
        } catch (error) {
          console.error("Error fetching ENS name:", error);
          return null;
        }
      },
      enabled: !!address, // Only run the query if address exists
    });
  }