import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import type { BigNumberish } from 'starknet';

import { defineComponent, Type as RecsType, World } from "@dojoengine/recs";
import { defineContractComponents } from "../contractComponents";

export type ContractComponents = Awaited<
    ReturnType<typeof defineContractComponents>
>;

type RemoveFieldOrder<T> = T extends object
  ? Omit<
      {
        [K in keyof T]: T[K] extends object ? RemoveFieldOrder<T[K]> : T[K];
      },
      'fieldOrder'
    >
  : T;
// Type definition for `ctboc::models::Game` struct
export interface Game {
	fieldOrder: string[];
	gameId: BigNumberish;
	northGeneral: string;
	southGeneral: string;
	castle1Health: BigNumberish;
	castle2Health: BigNumberish;
	stage: BigNumberish;
	startTime: BigNumberish;
	nextPlayerIndex: BigNumberish;
	numPlayers: BigNumberish;
	prizePool: BigNumberish;
	prizesDistributed: boolean;
}
export type InputGame = RemoveFieldOrder<Game>;

// Type definition for `ctboc::models::GameValue` struct
export interface GameValue {
	fieldOrder: string[];
	northGeneral: string;
	southGeneral: string;
	castle1Health: BigNumberish;
	castle2Health: BigNumberish;
	stage: BigNumberish;
	startTime: BigNumberish;
	nextPlayerIndex: BigNumberish;
	numPlayers: BigNumberish;
	prizePool: BigNumberish;
	prizesDistributed: boolean;
}
export type InputGameValue = RemoveFieldOrder<GameValue>;

// Type definition for `ctboc::models::GamePlayersValue` struct
export interface GamePlayersValue {
	fieldOrder: string[];
	address: string;
}
export type InputGamePlayersValue = RemoveFieldOrder<GamePlayersValue>;

// Type definition for `ctboc::models::GamePlayers` struct
export interface GamePlayers {
	fieldOrder: string[];
	gameId: BigNumberish;
	index: BigNumberish;
	address: string;
}
export type InputGamePlayers = RemoveFieldOrder<GamePlayers>;

// Type definition for `ctboc::models::GameWorldValue` struct
export interface GameWorldValue {
	fieldOrder: string[];
	nextGameId: BigNumberish;
	entropy: BigNumberish;
	feeTokenAddress: string;
	adminAddress: string;
	treasuryAddress: string;
	treasuryBalance: BigNumberish;
	pixelBannersAddress: string;
}
export type InputGameWorldValue = RemoveFieldOrder<GameWorldValue>;

// Type definition for `ctboc::models::GameWorld` struct
export interface GameWorld {
	fieldOrder: string[];
	metaId: BigNumberish;
	nextGameId: BigNumberish;
	entropy: BigNumberish;
	feeTokenAddress: string;
	adminAddress: string;
	treasuryAddress: string;
	treasuryBalance: BigNumberish;
	pixelBannersAddress: string;
}
export type InputGameWorld = RemoveFieldOrder<GameWorld>;

// Type definition for `ctboc::models::GlobalPlayerStatsValue` struct
export interface GlobalPlayerStatsValue {
	fieldOrder: string[];
	rank: BigNumberish;
	totalStrikes: BigNumberish;
	totalStrikeDamage: BigNumberish;
}
export type InputGlobalPlayerStatsValue = RemoveFieldOrder<GlobalPlayerStatsValue>;

// Type definition for `ctboc::models::GlobalPlayerStats` struct
export interface GlobalPlayerStats {
	fieldOrder: string[];
	address: string;
	rank: BigNumberish;
	totalStrikes: BigNumberish;
	totalStrikeDamage: BigNumberish;
}
export type InputGlobalPlayerStats = RemoveFieldOrder<GlobalPlayerStats>;

// Type definition for `ctboc::models::Player` struct
export interface Player {
	fieldOrder: string[];
	address: string;
	gameId: BigNumberish;
	isGeneral: boolean;
	gold: BigNumberish;
	sharpened: boolean;
	totalStrikes: BigNumberish;
	totalStrikeDamage: BigNumberish;
	nickname: BigNumberish;
	strikesAgainstCastle1: BigNumberish;
	strikesAgainstCastle2: BigNumberish;
}
export type InputPlayer = RemoveFieldOrder<Player>;

// Type definition for `ctboc::models::PlayerValue` struct
export interface PlayerValue {
	fieldOrder: string[];
	isGeneral: boolean;
	gold: BigNumberish;
	sharpened: boolean;
	totalStrikes: BigNumberish;
	totalStrikeDamage: BigNumberish;
	nickname: BigNumberish;
	strikesAgainstCastle1: BigNumberish;
	strikesAgainstCastle2: BigNumberish;
}
export type InputPlayerValue = RemoveFieldOrder<PlayerValue>;

// Type definition for `ctboc::models::PlayerCooldowns` struct
export interface PlayerCooldowns {
	fieldOrder: string[];
	player: string;
	gameId: BigNumberish;
	lastStrike: BigNumberish;
}
export type InputPlayerCooldowns = RemoveFieldOrder<PlayerCooldowns>;

// Type definition for `ctboc::models::PlayerCooldownsValue` struct
export interface PlayerCooldownsValue {
	fieldOrder: string[];
	lastStrike: BigNumberish;
}
export type InputPlayerCooldownsValue = RemoveFieldOrder<PlayerCooldownsValue>;

// Type definition for `ctboc::models::PlayerEnrollmentValue` struct
export interface PlayerEnrollmentValue {
	fieldOrder: string[];
	enrolled: boolean;
	index: BigNumberish;
}
export type InputPlayerEnrollmentValue = RemoveFieldOrder<PlayerEnrollmentValue>;

// Type definition for `ctboc::models::PlayerEnrollment` struct
export interface PlayerEnrollment {
	fieldOrder: string[];
	address: string;
	gameId: BigNumberish;
	enrolled: boolean;
	index: BigNumberish;
}
export type InputPlayerEnrollment = RemoveFieldOrder<PlayerEnrollment>;

export interface SchemaType extends ISchemaType {
	ctboc: {
		Game: Game,
		GameValue: GameValue,
		GamePlayersValue: GamePlayersValue,
		GamePlayers: GamePlayers,
		GameWorldValue: GameWorldValue,
		GameWorld: GameWorld,
		GlobalPlayerStatsValue: GlobalPlayerStatsValue,
		GlobalPlayerStats: GlobalPlayerStats,
		Player: Player,
		PlayerValue: PlayerValue,
		PlayerCooldowns: PlayerCooldowns,
		PlayerCooldownsValue: PlayerCooldownsValue,
		PlayerEnrollmentValue: PlayerEnrollmentValue,
		PlayerEnrollment: PlayerEnrollment,
	},
}
export const schema: SchemaType = {
	ctboc: {
		Game: {
			fieldOrder: ['gameId', 'northGeneral', 'southGeneral', 'castle1Health', 'castle2Health', 'stage', 'startTime', 'nextPlayerIndex', 'numPlayers', 'prizePool', 'prizesDistributed'],
			gameId: 0,
			northGeneral: "",
			southGeneral: "",
			castle1Health: 0,
			castle2Health: 0,
			stage: 0,
			startTime: 0,
			nextPlayerIndex: 0,
			numPlayers: 0,
			prizePool: 0,
			prizesDistributed: false,
		},
		GameValue: {
			fieldOrder: ['northGeneral', 'southGeneral', 'castle1Health', 'castle2Health', 'stage', 'startTime', 'nextPlayerIndex', 'numPlayers', 'prizePool', 'prizesDistributed'],
			northGeneral: "",
			southGeneral: "",
			castle1Health: 0,
			castle2Health: 0,
			stage: 0,
			startTime: 0,
			nextPlayerIndex: 0,
			numPlayers: 0,
			prizePool: 0,
			prizesDistributed: false,
		},
		GamePlayersValue: {
			fieldOrder: ['address'],
			address: "",
		},
		GamePlayers: {
			fieldOrder: ['gameId', 'index', 'address'],
			gameId: 0,
			index: 0,
			address: "",
		},
		GameWorldValue: {
			fieldOrder: ['nextGameId', 'entropy', 'feeTokenAddress', 'adminAddress', 'treasuryAddress', 'treasuryBalance', 'pixelBannersAddress'],
			nextGameId: 0,
			entropy: 0,
			feeTokenAddress: "",
			adminAddress: "",
			treasuryAddress: "",
			treasuryBalance: 0,
			pixelBannersAddress: "",
		},
		GameWorld: {
			fieldOrder: ['metaId', 'nextGameId', 'entropy', 'feeTokenAddress', 'adminAddress', 'treasuryAddress', 'treasuryBalance', 'pixelBannersAddress'],
			metaId: 0,
			nextGameId: 0,
			entropy: 0,
			feeTokenAddress: "",
			adminAddress: "",
			treasuryAddress: "",
			treasuryBalance: 0,
			pixelBannersAddress: "",
		},
		GlobalPlayerStatsValue: {
			fieldOrder: ['rank', 'totalStrikes', 'totalStrikeDamage'],
			rank: 0,
			totalStrikes: 0,
			totalStrikeDamage: 0,
		},
		GlobalPlayerStats: {
			fieldOrder: ['address', 'rank', 'totalStrikes', 'totalStrikeDamage'],
			address: "",
			rank: 0,
			totalStrikes: 0,
			totalStrikeDamage: 0,
		},
		Player: {
			fieldOrder: ['address', 'gameId', 'isGeneral', 'gold', 'sharpened', 'totalStrikes', 'totalStrikeDamage', 'nickname', 'strikesAgainstCastle1', 'strikesAgainstCastle2'],
			address: "",
			gameId: 0,
			isGeneral: false,
			gold: 0,
			sharpened: false,
			totalStrikes: 0,
			totalStrikeDamage: 0,
			nickname: 0,
			strikesAgainstCastle1: 0,
			strikesAgainstCastle2: 0,
		},
		PlayerValue: {
			fieldOrder: ['isGeneral', 'gold', 'sharpened', 'totalStrikes', 'totalStrikeDamage', 'nickname', 'strikesAgainstCastle1', 'strikesAgainstCastle2'],
			isGeneral: false,
			gold: 0,
			sharpened: false,
			totalStrikes: 0,
			totalStrikeDamage: 0,
			nickname: 0,
			strikesAgainstCastle1: 0,
			strikesAgainstCastle2: 0,
		},
		PlayerCooldowns: {
			fieldOrder: ['player', 'gameId', 'lastStrike'],
			player: "",
			gameId: 0,
			lastStrike: 0,
		},
		PlayerCooldownsValue: {
			fieldOrder: ['lastStrike'],
			lastStrike: 0,
		},
		PlayerEnrollmentValue: {
			fieldOrder: ['enrolled', 'index'],
			enrolled: false,
			index: 0,
		},
		PlayerEnrollment: {
			fieldOrder: ['address', 'gameId', 'enrolled', 'index'],
			address: "",
			gameId: 0,
			enrolled: false,
			index: 0,
		},
	},
};
// Type definition for ERC__Balance struct
export type ERC__Type = 'ERC20' | 'ERC721';
export interface ERC__Balance {
    fieldOrder: string[];
    balance: string;
    type: string;
    tokenMetadata: ERC__Token;
}
export interface ERC__Token {
    fieldOrder: string[];
    name: string;
    symbol: string;
    tokenId: string;
    decimals: string;
    contractAddress: string;
}
export interface ERC__Transfer {
    fieldOrder: string[];
    from: string;
    to: string;
    amount: string;
    type: string;
    executedAt: string;
    tokenMetadata: ERC__Token;
    transactionHash: string;
}