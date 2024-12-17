"use client";

import { wagmiConfig } from "@/lib/wagmi-config";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TurnkeyProvider } from "@turnkey/sdk-react";
import { EthereumWallet } from "@turnkey/wallet-stamper";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { WagmiProvider } from "wagmi";
import { Toaster } from "./ui/toaster";
import { WalletsProvider } from "@/components/wallet-provider"

import { turnkeyConfig } from "@/config/turnkey";

import { AuthProvider } from "./auth-provider";

const queryClient = new QueryClient();
const wallet = new EthereumWallet()


export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          showRecentTransactions={true}
          appInfo={{ appName: "Bountychain" }}
        >
          <TurnkeyProvider
      config={{
        rpId: turnkeyConfig.passkey.rpId,
        apiBaseUrl: "https://api.turnkey.com",
  defaultOrganizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID,
        wallet: wallet,
      }}
    >
            <AuthProvider>
              <WalletsProvider>
        {children}
</WalletsProvider>
      </AuthProvider>
    </TurnkeyProvider>
          <ProgressBar
            height="5px"
            color="#3b82f6"
            options={{ showSpinner: false }}
            shallowRouting
          />
          <Toaster />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
