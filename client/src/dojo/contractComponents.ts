/* Autogenerated file. Do not edit manually. */

import { defineComponent, Type as RecsType, World } from "@dojoengine/recs";

export type ContractComponents = Awaited<ReturnType<typeof defineContractComponents>>;

export function defineContractComponents(world: World) {
  return {
    Game: (() => {
      return defineComponent(
        world,
        { gameId: RecsType.BigInt, northGeneral: RecsType.BigInt, southGeneral: RecsType.BigInt, castle1Health: RecsType.Number, castle2Health: RecsType.Number, stage: RecsType.Number, startTime: RecsType.BigInt, nextPlayerIndex: RecsType.Number, numPlayers: RecsType.BigInt },
        {
          metadata: {
            namespace: "ctboc",
            name: "Game",
            types: ["u128","contractaddress","contractaddress","u32","u32","u8","u128","u32","u128"],
            customTypes: [],
          },
        }
      );
    })(),
    GamePlayers: (() => {
      return defineComponent(
        world,
        { gameId: RecsType.BigInt, index: RecsType.Number, address: RecsType.BigInt },
        {
          metadata: {
            namespace: "ctboc",
            name: "GamePlayers",
            types: ["u128","u32","contractaddress"],
            customTypes: [],
          },
        }
      );
    })(),
    GameWorld: (() => {
      return defineComponent(
        world,
        { metaId: RecsType.BigInt, nextGameId: RecsType.BigInt, entropy: RecsType.BigInt },
        {
          metadata: {
            namespace: "ctboc",
            name: "GameWorld",
            types: ["felt252","u128","felt252"],
            customTypes: [],
          },
        }
      );
    })(),
    GlobalPlayerStats: (() => {
      return defineComponent(
        world,
        { address: RecsType.BigInt, rank: RecsType.Number, totalStrikes: RecsType.BigInt, totalStrikeDamage: RecsType.BigInt },
        {
          metadata: {
            namespace: "ctboc",
            name: "GlobalPlayerStats",
            types: ["contractaddress","u8","u128","u128"],
            customTypes: [],
          },
        }
      );
    })(),
    Player: (() => {
      return defineComponent(
        world,
        { address: RecsType.BigInt, gameId: RecsType.BigInt, isGeneral: RecsType.Boolean, gold: RecsType.Number, sharpened: RecsType.Boolean, totalStrikes: RecsType.Number, totalStrikeDamage: RecsType.Number, nickname: RecsType.BigInt },
        {
          metadata: {
            namespace: "ctboc",
            name: "Player",
            types: ["contractaddress","u128","bool","u16","bool","u8","u32","felt252"],
            customTypes: [],
          },
        }
      );
    })(),
    PlayerCooldowns: (() => {
      return defineComponent(
        world,
        { player: RecsType.BigInt, gameId: RecsType.BigInt, lastStrike: RecsType.BigInt },
        {
          metadata: {
            namespace: "ctboc",
            name: "PlayerCooldowns",
            types: ["contractaddress","u128","u64"],
            customTypes: [],
          },
        }
      );
    })(),
    PlayerEnrollment: (() => {
      return defineComponent(
        world,
        { address: RecsType.BigInt, gameId: RecsType.BigInt, enrolled: RecsType.Boolean, index: RecsType.Number },
        {
          metadata: {
            namespace: "ctboc",
            name: "PlayerEnrollment",
            types: ["contractaddress","u128","bool","u32"],
            customTypes: [],
          },
        }
      );
    })(),
  };
}
