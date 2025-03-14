import "dotenv/config";
import { Account, RpcProvider, json } from "starknet";

const NETWORKS = {
  mainnet: {
    name: "mainnet",
    explorer_url: "https://voyager.online",
    rpc_url: `${process.env.RPC_API_KEY}`,
    feeder_gateway_url: "https://alpha-mainnet.starknet.io/feeder_gateway",
    gateway_url: "https://alpha-mainnet.starknet.io/gateway",
  },
  goerli: {
    name: "goerli",
    explorer_url: "https://goerli.voyager.online",
    rpc_url: `https://starknet-goerli.g.alchemy.com/v2/${process.env.RPC_API_KEY}`,
    feeder_gateway_url: "https://alpha4.starknet.io/feeder_gateway",
    gateway_url: "https://alpha4.starknet.io/gateway",
  },
  sepolia: {
    name: "sepolia",
    explorer_url: "https://sepolia.voyager.online",
    rpc_url: `https://starknet-sepolia.public.blastapi.io/rpc/v0_7`,
    feeder_gateway_url: "https://alpha-sepolia.starknet.io/feeder_gateway",
    gateway_url: "https://alpha-sepolia.starknet.io/gateway",
  },
};

export const getNetwork = (network) => {
  if (!NETWORKS[network.toLowerCase()]) {
    throw new Error(`Network ${network} not found`);
  }
  return NETWORKS[network.toLowerCase()];
};

export const getProvider = () => {
  let network = getNetwork(process.env.STARKNET_NETWORK);
  return new RpcProvider({ nodeUrl: network.rpc_url });
};

export const getAccount = () => {
  const provider = getProvider();
  const accountAddress = process.env.STARKNET_ACCOUNT_ADDRESS;
  const privateKey = process.env.STARKNET_ACCOUNT_PRIVATE_KEY;
  const cairoVersion = "1";
  return new Account(provider, accountAddress, privateKey, cairoVersion);
};