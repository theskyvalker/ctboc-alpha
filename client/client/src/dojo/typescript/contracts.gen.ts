import { DojoProvider } from "@dojoengine/core";
import { Account, AccountInterface, BigNumberish, InvokeFunctionResponse, shortString } from "starknet";

export type IWorld = Awaited<ReturnType<typeof setupWorld>>;
import * as models from "./models.gen";

export async function setupWorld(provider: DojoProvider) {

	const actions_setConfig = async (snAccount: Account | AccountInterface, feeTokenAddress: string, pixelBannersAddress: string, adminAddress: string, treasuryAddress: string) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "set_config",
					calldata: [feeTokenAddress, pixelBannersAddress, adminAddress, treasuryAddress],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_spawn = async (snAccount: Account | AccountInterface, side: BigNumberish): Promise<InvokeFunctionResponse | undefined> => {
		try {
			console.log(snAccount);
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "spawn",
					calldata: [side],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_enroll = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "enroll",
					calldata: [gameId],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_assignGeneral = async (snAccount: Account | AccountInterface, gameId: BigNumberish, castle: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "assignGeneral",
					calldata: [gameId, castle],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_unenroll = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "unenroll",
					calldata: [gameId],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_unassignGeneral = async (snAccount: Account | AccountInterface, gameId: BigNumberish, castle: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "unassignGeneral",
					calldata: [gameId, castle],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_fortify = async (snAccount: Account | AccountInterface, gameId: BigNumberish, castle: BigNumberish, amount: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "fortify",
					calldata: [gameId, castle, amount],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_sharpen = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "sharpen",
					calldata: [gameId],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_attack = async (snAccount: Account | AccountInterface, gameId: BigNumberish, castle: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "attack",
					calldata: [gameId, castle],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_pay = async (snAccount: Account | AccountInterface, gameId: BigNumberish, recipient: string, amount: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "pay",
					calldata: [gameId, recipient, amount],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_buyrank = async (snAccount: Account | AccountInterface, gameId: BigNumberish, ranks: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "buyrank",
					calldata: [gameId, ranks],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_changeGameStage = async (snAccount: Account | AccountInterface, gameId: BigNumberish, stage: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "change_game_stage",
					calldata: [gameId, stage],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_getListOfPlayers = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "get_list_of_players",
					calldata: [gameId],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_setNickname = async (snAccount: Account | AccountInterface, gameId: BigNumberish, nickname: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "set_nickname",
					calldata: [gameId, nickname],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_getNickname = async (snAccount: Account | AccountInterface, gameId: BigNumberish, address: string) => {
		try {
			const result = await provider.call(
				"ctboc",
				{
					contractName: "actions",
					entrypoint: "get_nickname",
					calldata: [gameId, address],
				}
			);

			return shortString.decodeShortString(result.toString());
		} catch (error) {
			console.error(error);
		}
	};

	const actions_distributePrizes = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "distribute_prizes",
					calldata: [gameId],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_getTreasuryBalance = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "get_treasury_balance",
					calldata: [gameId],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_withdrawTreasuryFunds = async (snAccount: Account | AccountInterface) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "withdraw_treasury_funds",
					calldata: [],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_setCastleHp = async (snAccount: Account | AccountInterface, gameId: BigNumberish, castle: BigNumberish, hp: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "set_castle_hp",
					calldata: [gameId, castle, hp],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_devChangeGameStage = async (snAccount: Account | AccountInterface, gameId: BigNumberish, stage: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "dev_change_game_stage",
					calldata: [gameId, stage],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const actions_withdrawTreasuryFundsAmount = async (snAccount: Account | AccountInterface, amount: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				{
					contractName: "actions",
					entrypoint: "withdraw_treasury_funds_amount",
					calldata: [amount],
				},
				"ctboc",
			);
		} catch (error) {
			console.error(error);
		}
	};

	return {
		actions: {
			setConfig: actions_setConfig,
			spawn: actions_spawn,
			enroll: actions_enroll,
			assignGeneral: actions_assignGeneral,
			unenroll: actions_unenroll,
			unassignGeneral: actions_unassignGeneral,
			fortify: actions_fortify,
			sharpen: actions_sharpen,
			attack: actions_attack,
			pay: actions_pay,
			buyrank: actions_buyrank,
			changeGameStage: actions_changeGameStage,
			getListOfPlayers: actions_getListOfPlayers,
			setNickname: actions_setNickname,
			getNickname: actions_getNickname,
			distributePrizes: actions_distributePrizes,
			getTreasuryBalance: actions_getTreasuryBalance,
			withdrawTreasuryFunds: actions_withdrawTreasuryFunds,
			setCastleHp: actions_setCastleHp,
			devChangeGameStage: actions_devChangeGameStage,
			withdrawTreasuryFundsAmount: actions_withdrawTreasuryFundsAmount,
		},
	};
}