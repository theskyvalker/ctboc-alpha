import { SetupNetworkResult } from "./setupNetwork";
import {
    Account,
    AccountInterface,
    BigNumberish,
    GetTransactionReceiptResponse,
    InvokeFunctionResponse,
    provider,
} from "starknet";
import { ClientComponents } from "./createClientComponents";
import { getEvents } from "@dojoengine/utils";
import { lordsAbi } from "../utils/ABI";
import { Contract } from "starknet";

import { World } from "@dojoengine/recs";
import type { IWorld } from "./typescript/contracts.gen";
import { sleep } from "@latticexyz/utils";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

const {
    VITE_PUBLIC_ACTIONS_ADDRESS,
    VITE_PUBLIC_LORDS_ADDRESS,
} = import.meta.env;

const checkTokenBalance = async (
    account: any,
    feeInDecimal: number,
    contractAddress: string,
) => {
    const abi = await lordsAbi();
    const fee = BigInt(feeInDecimal * (10 ** 18));
    const contract = new Contract(abi, contractAddress, account);
    const balance = await contract.call("balanceOf", [account.address], {
        parseResponse: true,
        parseRequest: true,
    });
    if (BigInt(balance.toString()) < fee) {
        throw new Error(
            "Insufficient LORDS balance. Please acquire more LORDS and then attempt to join/start the game.",
        );
    }
    return true;
};

async function getTransactionReceipt(signer: Account | AccountInterface, transaction_hash: string, tries: number = 0) {
    if (transaction_hash) {
        try {
            const receipt = await signer.getTransactionReceipt(transaction_hash);
            return receipt;
        } catch (error: any) {
            console.log("Ran into an error in fetching tx receipt: ", error);
            if (tries > 5) {
                throw new Error("Failed to confirm transaction status.");
            } else {
                await sleep(1000);
                console.log("Retrying fetching transaction receipt");
                return getTransactionReceipt(signer, transaction_hash, tries + 1);
            }
        }
    }
}

const checkApproval = async (account: any, feeInDecimal: number) => {
    const abi = await lordsAbi();
    const contract = new Contract(abi, VITE_PUBLIC_LORDS_ADDRESS, account);
    const allowance = await contract.call("allowance", [
        account.address,
        VITE_PUBLIC_ACTIONS_ADDRESS,
    ], { parseResponse: true, parseRequest: true });
    const fee = BigInt(feeInDecimal * (10 ** 18));

    return (BigInt(allowance.toString().replace("n", "")) >= fee);
};

const checkApprovalAndPerformAction = async (
    signer: any,
    feeInDecimal: number,
    actionEntrypoint: string,
    calldata: any[],
) => {
    const abi = await lordsAbi();
    const contract = new Contract(abi, VITE_PUBLIC_LORDS_ADDRESS, signer);
    const allowance = await contract.call("allowance", [
        signer.address,
        VITE_PUBLIC_ACTIONS_ADDRESS,
    ], { parseResponse: true, parseRequest: true });
    const fee = BigInt(feeInDecimal * (10 ** 18));

    if (BigInt(allowance.toString().replace("n", "")) >= fee) {
        const { transaction_hash } = await signer.execute({
            contractAddress: VITE_PUBLIC_ACTIONS_ADDRESS,
            entrypoint: actionEntrypoint,
            calldata: calldata,
        });

        return transaction_hash;
    } else {
        const { transaction_hash } = await signer.execute([
            {
                contractAddress: VITE_PUBLIC_LORDS_ADDRESS,
                entrypoint: "approve",
                calldata: [
                    VITE_PUBLIC_ACTIONS_ADDRESS,
                    (100 * (10 ** 18)).toString(),
                    0,
                ],
            },
            {
                contractAddress: VITE_PUBLIC_ACTIONS_ADDRESS,
                entrypoint: actionEntrypoint,
                calldata: calldata,
            },
        ]);

        if (!transaction_hash) {
            throw new Error("Error approving fee and performing game action");
        }

        return transaction_hash;
    }
};

export function createSystemCalls(
    { client }: { client: IWorld },
    {
        Game,
        GameWorld,
        GlobalPlayerStats,
        Player,
        PlayerCooldowns,
        PlayerEnrollment,
    }: ClientComponents,
    world: World,
) {
    const spawn = async (
        account: Account | AccountInterface,
        side: BigNumberish,
    ): Promise<GetTransactionReceiptResponse | undefined> => {
        try {
            await checkTokenBalance(account, 100, VITE_PUBLIC_LORDS_ADDRESS); // will throw an error if balance < 100 LORDS
            const transaction_hash = await checkApprovalAndPerformAction(account, 100, "spawn", [side]);
            return transaction_hash ? getTransactionReceipt(account, transaction_hash) : undefined;
        } catch (e) {
            console.log(e);
        }
    };

    const enroll = async (signer: Account | AccountInterface, game: number): Promise<GetTransactionReceiptResponse | undefined> => {
        try {
            await checkTokenBalance(signer, 10, VITE_PUBLIC_LORDS_ADDRESS); // will throw an error if balance < 10 LORDS
            const transaction_hash = await checkApprovalAndPerformAction(signer, 10, "enroll", [game]);
            return transaction_hash ? getTransactionReceipt(signer, transaction_hash) : undefined;
        } catch (e) {
            console.log(e);
        }
    };

    const unenroll = async (
        signer: Account | AccountInterface,
        game: number,
    ): Promise<GetTransactionReceiptResponse | undefined> => {
        try {
            // If you also need to check token balances or approvals, do so here
            // e.g. await checkTokenBalance(signer, 10, VITE_PUBLIC_LORDS_ADDRESS);

            const txResult = await client.actions.unenroll(signer, game);
            return txResult ? getTransactionReceipt(signer, txResult.transaction_hash) : undefined;
        } catch (e) {
            console.log(e);
        }
    };

    const assignGeneral = async (
        signer: Account | AccountInterface,
        game: number,
        castle: number,
    ): Promise<GetTransactionReceiptResponse | undefined> => {
        try {
            await checkTokenBalance(signer, 100, VITE_PUBLIC_LORDS_ADDRESS);
            const transaction_hash = await checkApprovalAndPerformAction(signer, 100, "assignGeneral", [game, castle]);
            return transaction_hash ? getTransactionReceipt(signer, transaction_hash) : undefined;
        } catch (e) {
            console.log(e);
        }
    };

    const unassignGeneral = async (
        signer: Account | AccountInterface,
        game: number,
        castle: number,
    ): Promise<GetTransactionReceiptResponse | undefined> => {
        try {
            const txResult = await client.actions.unassignGeneral(
                signer,
                game,
                castle,
            );
            return txResult ? getTransactionReceipt(signer, txResult.transaction_hash) : undefined;
        } catch (e) {
            console.log(e);
        }
    };

    const fortify = async (
        signer: Account | AccountInterface,
        game: number,
        castle: number,
        amount: number,
    ): Promise<GetTransactionReceiptResponse | undefined> => {
        try {
            const txResult = await client.actions.fortify(
                signer,
                game,
                castle,
                amount,
            );
            return txResult ? getTransactionReceipt(signer, txResult.transaction_hash) : undefined;
        } catch (e) {
            console.log(e);
        }
    };

    const sharpen = async (
        signer: Account | AccountInterface,
        game: number,
    ): Promise<GetTransactionReceiptResponse | undefined> => {
        try {
            const txResult = await client.actions.sharpen(signer, game);
            return txResult ? getTransactionReceipt(signer, txResult.transaction_hash) : undefined;
        } catch (e) {
            console.log(e);
        }
    };

    const set_nickname = async (
        signer: Account | AccountInterface,
        gameId: number,
        nickname: string,
    ): Promise<InvokeFunctionResponse | undefined> => {
        try {
            const receipt = await client.actions.setNickname(
                signer,
                gameId,
                nickname,
            );
            return receipt;
        } catch (e) {
            console.log(e);
        }
    };

    const attack = async (
        signer: Account | AccountInterface,
        game: number,
        castle: number,
    ): Promise<GetTransactionReceiptResponse | undefined> => {
        try {
            const txResult = await client.actions.attack(signer, game, castle);
            return txResult ? getTransactionReceipt(signer, txResult.transaction_hash) : undefined;
        } catch (e) {
            console.log(e);
        }
    };

    const pay = async (
        signer: Account | AccountInterface,
        game: number,
        recipient: string,
        amount: number,
    ): Promise<GetTransactionReceiptResponse | undefined> => {
        try {
            const txResult = await client.actions.pay(
                signer,
                game,
                recipient,
                amount,
            );
            console.log("payment transaction hash: ", txResult);
            return txResult ? getTransactionReceipt(signer, txResult.transaction_hash) : undefined;
        } catch (e) {
            console.error(e);
        }
    };

    const buyrank = async (
        signer: Account | AccountInterface,
        game: number,
        ranks: number,
    ): Promise<InvokeFunctionResponse | undefined> => {
        try {
            const receipt = await client.actions.buyrank(signer, game, ranks);
            return receipt;
        } catch (e) {
            console.error(e);
        }
    };

    const changegamestage = async (
        signer: Account | AccountInterface,
        game: number,
        stage: number,
    ): Promise<GetTransactionReceiptResponse | undefined> => {
        try {
            const txResult = await client.actions.changeGameStage(
                signer,
                game,
                stage,
            );
            return txResult ? getTransactionReceipt(signer, txResult.transaction_hash) : undefined;
        } catch (e) {
            console.error(e);
        }
    };

    const devchangegamestage = async (
        signer: Account | AccountInterface,
        game: number,
        stage: number,
    ): Promise<InvokeFunctionResponse | undefined> => {
        try {
            const receipt = await client.actions.devChangeGameStage(
                signer,
                game,
                stage,
            );
            return receipt;
        } catch (e) {
            console.error(e);
        }
    };

    const get_nickname = async (
        signer: Account | AccountInterface,
        gameId: number,
        address: string,
    ): Promise<string | undefined> => {
        try {
            // Perform a read-only call to get the nickname
            const nickname = await client.actions.getNickname(
                signer, gameId, address
            )
            return nickname;
        } catch (e) {
            console.error(e);
            throw new Error("Error fetching nickname");
        }
    };

    return {
        spawn,
        enroll,
        unenroll,
        assignGeneral,
        unassignGeneral,
        fortify,
        sharpen,
        attack,
        pay,
        buyrank,
        changegamestage,
        devchangegamestage,
        set_nickname,
        get_nickname,
    };
}
