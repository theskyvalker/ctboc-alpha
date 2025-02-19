import { defineContractComponents } from "./contractComponents";
import { world } from "./world";
import { DojoProvider } from "@dojoengine/core";
import { Account, num } from "starknet";
import manifest from "./manifest_staging.json";
import * as torii from "@dojoengine/torii-client";
import { stringToBytes16 } from "@latticexyz/utils";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork() {
    // Extract environment variables for better readability.
    const {
        VITE_PUBLIC_WORLD_ADDRESS,
        VITE_PUBLIC_NODE_URL,
        VITE_PUBLIC_TORII,
    } = import.meta.env;

    // Create a new RPCProvider instance.
    const provider = new DojoProvider(
        manifest,
        VITE_PUBLIC_NODE_URL,
    );

    const toriiClient = await torii.createClient({
        rpcUrl: VITE_PUBLIC_NODE_URL,
        toriiUrl: VITE_PUBLIC_TORII,
        worldAddress: VITE_PUBLIC_WORLD_ADDRESS,
        relayUrl: ""
    });

    // Return the setup object.
    return {
        provider,
        world,
        toriiClient,

        // Define contract components for the world.
        contractComponents: defineContractComponents(world),

        // Execute function.
        execute: async (
            signer: Account,
            contract: string,
            system: string,
            call_data: num.BigNumberish[]
        ) => {
            return provider.execute(signer, {
                contractName: contract,
                entrypoint: system,
                calldata: call_data}, "ctboc");
        },

        // Call function
        call: async (
            contract: string,
            system: string,
            call_data: num.BigNumberish[]
        ) => {
            return provider.call("ctboc", {
                contractName: contract,
                entrypoint: system,
                calldata: call_data
            });
        }

    };
}