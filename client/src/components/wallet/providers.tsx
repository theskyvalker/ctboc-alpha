import React from "react";

import { sepolia, mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  voyager,
  InjectedConnector,
  blastProvider
} from "@starknet-react/core";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const {
    VITE_PUBLIC_IS_TESTNET,
    VITE_PUBLIC_BLAST_API_KEY
} = import.meta.env;

const queryClient = new QueryClient();

export function Provider({ children }: { children: React.ReactNode }) {

  const starkConnectors = [
    new InjectedConnector({ options: { id: "braavos", name: "Braavos" } }),
    new InjectedConnector({ options: { id: "argentX", name: "Argent X" } })
  ];

  return (
    <StarknetConfig
      chains={[
        ...(VITE_PUBLIC_IS_TESTNET === "true" ? [sepolia, mainnet] : [sepolia, mainnet])]}
      provider={blastProvider({apiKey: VITE_PUBLIC_BLAST_API_KEY || ""})}
      autoConnect={true}
      queryClient={queryClient}
      connectors={starkConnectors}
      explorer={voyager}
    >
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </StarknetConfig>
  );
}