"use client";
import React from "react";

import dynamic from "next/dynamic";

import { useAccount } from "@starknet-react/core";

const ConnectModal = dynamic(
  () => import("./connect-modal"), { ssr: false }
);

const DisconnectModal = dynamic(
  () => import("./disconnect-modal"), { ssr: false }
);

export default function ConnectWallet() {
  const { account, address, chainId } = useAccount();

  return (
    <div className="w-full">
      {account ? <DisconnectModal /> : <ConnectModal />}
    </div>
  );
}