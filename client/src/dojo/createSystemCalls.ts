import { SetupNetworkResult } from "./setupNetwork";
import { Account, AccountInvocationItem, TransactionExecutionStatus, TransactionFinalityStatus } from "starknet";
import { Entity, getComponentValue } from "@dojoengine/recs";
import { uuid } from "@latticexyz/utils";
import { ClientComponents } from "./createClientComponents";
import { Direction, updatePositionWithDirection } from "../utils";
import {
    getEntityIdFromKeys,
    getEvents,
    setComponentsFromEvents,
} from "@dojoengine/utils";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
    { execute, contractComponents }: SetupNetworkResult,
    { Game, GameWorld, GlobalPlayerStats, Player, PlayerCooldowns, PlayerEnrollment }: ClientComponents
) {
    const spawn = async (signer: Account, side: number) => {
        /*const entityId = getEntityIdFromKeys([
            BigInt(signer.address),
        ]) as Entity;*/

        try {
            const { transaction_hash } = await execute(
                signer,
                "actions",
                "spawn",
                [side]
            );

            const receipt = await signer.waitForTransaction(transaction_hash, {
                errorStates: [TransactionExecutionStatus.REJECTED, TransactionExecutionStatus.REVERTED],
                successStates: [TransactionFinalityStatus.ACCEPTED_ON_L2, TransactionExecutionStatus.SUCCEEDED],
                retryInterval: 300
            });

            return receipt;

            // const receipt = await signer.getTransactionReceipt(transaction_hash);

            /*setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await signer.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                    })
                )
            );*/
        } catch (e) {
            console.log(e);
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        } finally {
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        }
    };

    const enroll = async (signer: Account, game: number) => {
        /*const entityId = getEntityIdFromKeys([
            BigInt(signer.address),
        ]) as Entity;*/

        try {
            const { transaction_hash } = await execute(
                signer,
                "actions",
                "enroll",
                [game]
            );

            const receipt = await signer.waitForTransaction(transaction_hash, {
                errorStates: [TransactionExecutionStatus.REJECTED, TransactionExecutionStatus.REVERTED],
                successStates: [TransactionFinalityStatus.ACCEPTED_ON_L2, TransactionExecutionStatus.SUCCEEDED],
                retryInterval: 300
            });

            return receipt;

            /*setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await signer.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                    })
                )
            );*/
        } catch (e) {
            console.log(e);
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        } finally {
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        }
    };

    const unenroll = async (signer: Account, game: number) => {
        /*const entityId = getEntityIdFromKeys([
            BigInt(signer.address),
        ]) as Entity;*/

        try {
            const { transaction_hash } = await execute(
                signer,
                "actions",
                "unenroll",
                [game]
            );

            const receipt = await signer.getTransactionReceipt(transaction_hash);
            return receipt;

            /*setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await signer.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                    })
                )
            );*/
        } catch (e) {
            console.log(e);
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        } finally {
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        }
    };

    const assignGeneral = async (signer: Account, game: number, castle: number) => {
        /*const entityId = getEntityIdFromKeys([
            BigInt(signer.address),
        ]) as Entity;*/

        try {
            const { transaction_hash } = await execute(
                signer,
                "actions",
                "assignGeneral",
                [game, castle]
            );

            const receipt = await signer.waitForTransaction(transaction_hash, {
                errorStates: [TransactionExecutionStatus.REJECTED, TransactionExecutionStatus.REVERTED],
                successStates: [TransactionFinalityStatus.ACCEPTED_ON_L2, TransactionExecutionStatus.SUCCEEDED],
                retryInterval: 300
            });

            return receipt;

            /*setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await signer.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                    })
                )
            );*/
        } catch (e) {
            console.log(e);
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        } finally {
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        }
    };

    const unassignGeneral = async (signer: Account, game: number, castle: number) => {
        /*const entityId = getEntityIdFromKeys([
            BigInt(signer.address),
        ]) as Entity;*/

        try {
            const { transaction_hash } = await execute(
                signer,
                "actions",
                "unassignGeneral",
                [game, castle]
            );

            const receipt = await signer.waitForTransaction(transaction_hash, {
                errorStates: [TransactionExecutionStatus.REJECTED, TransactionExecutionStatus.REVERTED],
                successStates: [TransactionFinalityStatus.ACCEPTED_ON_L2, TransactionExecutionStatus.SUCCEEDED],
                retryInterval: 300
            });

            return receipt;

            /*setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await signer.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                    })
                )
            );*/
        } catch (e) {
            console.log(e);
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        } finally {
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        }
    };

    const fortify = async (signer: Account, game: number, castle: number, amount: number) => {
        /*const entityId = getEntityIdFromKeys([
            BigInt(signer.address),
        ]) as Entity;*/

        try {
            console.log(signer.address, game, castle, amount);
            const { transaction_hash } = await execute(
                signer,
                "actions",
                "fortify",
                [game, castle, amount]
            );
            
            console.log(transaction_hash);

            const receipt = await signer.waitForTransaction(transaction_hash, {
                errorStates: [TransactionExecutionStatus.REJECTED, TransactionExecutionStatus.REVERTED],
                successStates: [TransactionFinalityStatus.ACCEPTED_ON_L2, TransactionExecutionStatus.SUCCEEDED],
                retryInterval: 300
            });

            return receipt;

            /*setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await signer.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                    })
                )
            );*/

            return receipt;
        } catch (e) {
            console.log(e);
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        } finally {
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        }
    };

    const sharpen = async (signer: Account, game: number) => {
        /*const entityId = getEntityIdFromKeys([
            BigInt(signer.address),
        ]) as Entity;*/

        try {
            const { transaction_hash } = await execute(
                signer,
                "actions",
                "sharpen",
                [game]
            );

            const receipt = await signer.waitForTransaction(transaction_hash, {
                errorStates: [TransactionExecutionStatus.REJECTED, TransactionExecutionStatus.REVERTED],
                successStates: [TransactionFinalityStatus.ACCEPTED_ON_L2, TransactionExecutionStatus.SUCCEEDED],
                retryInterval: 300
            });

            return receipt;

            /*setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await signer.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                    })
                )
            );*/

            return receipt;
        } catch (e) {
            console.log(e);
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        } finally {
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        }
    };

    const set_nickname = async (signer: Account, gameId: number, nickname: string) => {
        console.log("Setting nickname: ", nickname);
        try {
            const { transaction_hash } = await execute(
                signer,
                "actions",
                "set_nickname",
                [gameId, nickname]
            );

            console.log("Set nickname tx: ", transaction_hash);

            const receipt = await signer.waitForTransaction(transaction_hash, {
                errorStates: [TransactionExecutionStatus.REJECTED, TransactionExecutionStatus.REVERTED],
                successStates: [TransactionFinalityStatus.ACCEPTED_ON_L2, TransactionExecutionStatus.SUCCEEDED],
                retryInterval: 300
            });

            return receipt;

            /*setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await signer.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                    }),
                )
            );*/

            return receipt;
        } catch (e) {
            console.log(e);
        }
    }

    const attack = async (signer: Account, game: number, castle: number) => {
        /*const entityId = getEntityIdFromKeys([
            BigInt(signer.address),
        ]) as Entity;*/

        try {
            const {transaction_hash} = await execute(
                signer,
                "actions",
                "attack",
                [game, castle]
            );

            console.log(transaction_hash);

            const events = getEvents(
                await signer.waitForTransaction(transaction_hash, {
                    retryInterval: 100,
                })
            );

            console.log(events);

            const receipt = await signer.waitForTransaction(transaction_hash, {
                errorStates: [TransactionExecutionStatus.REJECTED, TransactionExecutionStatus.REVERTED],
                successStates: [TransactionFinalityStatus.ACCEPTED_ON_L2, TransactionExecutionStatus.SUCCEEDED],
                retryInterval: 300
            });

            return receipt;

            /*setComponentsFromEvents(
                contractComponents,
                events
            );*/

            return receipt;
        } catch (e) {
            console.log("error occured");
            console.log(e);
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        } finally {
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        }
    };

    const pay = async (signer: Account, game: number, recipient: string, amount: number) => {
        /*const entityId = getEntityIdFromKeys([
            BigInt(signer.address),
        ]) as Entity;*/

        try {
            const { transaction_hash } = await execute(
                signer,
                "actions",
                "pay",
                [game, recipient, amount]
            );

            const receipt = await signer.waitForTransaction(transaction_hash, {
                errorStates: [TransactionExecutionStatus.REJECTED, TransactionExecutionStatus.REVERTED],
                successStates: [TransactionFinalityStatus.ACCEPTED_ON_L2, TransactionExecutionStatus.SUCCEEDED],
                retryInterval: 300
            });

            return receipt;

            /*setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await signer.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                    })
                )
            );*/
        } catch (e) {
            console.log(e);
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        } finally {
            //Position.removeOverride(positionId);
            //Moves.removeOverride(movesId);
        }
    };

    const buyrank = async (signer: Account, game: number, ranks: number) => {
        /*const entityId = getEntityIdFromKeys([
            BigInt(signer.address),
        ]) as Entity;*/

        try {
            const { transaction_hash } = await execute(
                signer,
                "actions",
                "buyrank",
                [game, ranks]
            );

            const receipt = await signer.waitForTransaction(transaction_hash, {
                errorStates: [TransactionExecutionStatus.REJECTED, TransactionExecutionStatus.REVERTED],
                successStates: [TransactionFinalityStatus.ACCEPTED_ON_L2, TransactionExecutionStatus.SUCCEEDED],
                retryInterval: 300
            });

            return receipt;

            /*setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await signer.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                    })
                )
            );*/
        } catch (e) {
            console.log(e);   
        }
    };

    const changegamestage = async (signer: Account, game: number, stage: number) => {
        try {
            const { transaction_hash } = await execute(
                signer,
                "actions",
                "change_game_stage",
                [game, stage]
            );

            console.log("Game stage change tx: ", transaction_hash);

            const receipt = await signer.waitForTransaction(transaction_hash, {
                errorStates: [TransactionExecutionStatus.REJECTED, TransactionExecutionStatus.REVERTED],
                successStates: [TransactionFinalityStatus.ACCEPTED_ON_L2, TransactionExecutionStatus.SUCCEEDED],
                retryInterval: 300
            });

            console.log("Game stage change receipt: ", receipt);

            return receipt;

            /*setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await signer.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                    }),
                )
            );*/
        } catch (e) {
            console.log(e);
        }
    }

    const devchangegamestage = async (signer: Account, game: number, stage: number) => {
        try {
            const { transaction_hash } = await execute(
                signer,
                "actions",
                "dev_change_game_stage",
                [game, stage]
            );

            const receipt = await signer.waitForTransaction(transaction_hash, {
                errorStates: [TransactionExecutionStatus.REJECTED, TransactionExecutionStatus.REVERTED],
                successStates: [TransactionFinalityStatus.ACCEPTED_ON_L2, TransactionExecutionStatus.SUCCEEDED],
                retryInterval: 300
            });

            return receipt;

            /*setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await signer.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                    }),
                )
            );*/
        } catch (e) {
            console.log(e);
        }
    }

    const get_nickname = async (signer: Account, gameId: number, address: string) => {
        try {
            const { transaction_hash } = await execute(
                signer,
                "actions",
                "get_nickname",
                [gameId, address]
            );

            const receipt = await signer.waitForTransaction(transaction_hash, {
                errorStates: [TransactionExecutionStatus.REJECTED, TransactionExecutionStatus.REVERTED],
                successStates: [TransactionFinalityStatus.ACCEPTED_ON_L2, TransactionExecutionStatus.SUCCEEDED],
                retryInterval: 300
            });

            return receipt;
        } catch (e) {
            console.log(e);
        }
    }

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
        get_nickname
    };
}