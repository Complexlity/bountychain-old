"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useChains, WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi-config";
import { Toaster } from "./ui/toaster";
const queryClient = new QueryClient();
import { useNavigate, useHref } from "@remix-run/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          showRecentTransactions={true}
          appInfo={{ appName: "Bountychain" }}
        >
          {children}
          <Toaster />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
