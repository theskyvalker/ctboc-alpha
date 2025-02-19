import { createDojoConfig } from "@dojoengine/core";

import manifest from "./dojo/manifest_staging.json";

const {
    VITE_PUBLIC_WORLD_ADDRESS,
    VITE_PUBLIC_NODE_URL,
    VITE_PUBLIC_TORII,
} = import.meta.env;

export const dojoConfig = createDojoConfig({
    manifest,
    rpcUrl: VITE_PUBLIC_NODE_URL,
    toriiUrl: VITE_PUBLIC_TORII    
});