import "dotenv/config";
import { getNetwork, getAccount, getProvider } from "./network.mjs";
import { CallData, } from "starknet";

// const actionsAddress = 0x7063ae1f885497ffcce7d8de153b254705760308fcb1c2ab51b7b668f0821can;
// const actionsAddress = 0x7f2a65676acebc9430b38b84344af80719a10b4e93dddeed3b9ab5ff0a955dn;
const actionsAddress = 0x1d162f565d3d26d474e52b4720e4289fdd5b4c1d5f74bd8be70747fd8253fadn;
const treasuryAddress = 0x0339b675af6abb75d11fcd4632ad6489c48e7df09f6a79da51a38c9fc64d120dn;
const pixelBannersAddress = 0x00e88b3624a67987d0864b33c724840b342ac559ad6c2e4a42ac87f0e2fad6ean;
const lordsAddress = 0x044e6bcc627e6201ce09f781d1aae44ea4c21c2fdef299e34fce55bef2d02210n;

export const setConfig = async () => {

  // Load account
  const account = getAccount();

  const provider = getProvider();

  // const { abi } = await provider.getClassAt(0x07063ae1f885497ffcce7d8de153b254705760308fcb1c2ab51b7b668f0821can);

  // Connect the deployed Test contract in Testnet

  let res = await account.execute(
    { contractAddress: actionsAddress,
      entrypoint: "set_config",
      calldata: [lordsAddress, pixelBannersAddress, account.address, treasuryAddress],
    }, undefined, {
      maxFee: 8000000000000
    }
  );

  let network = getNetwork(process.env.STARKNET_NETWORK);
  
  console.log(
    "Tx hash: ",
    `${network.explorer_url}/tx/${res.transaction_hash}`,
  );
  
  await provider.waitForTransaction(res.transaction_hash);

}

setConfig();