use starknet::ContractAddress;
use array::ArrayTrait;

#[derive(Model, Drop, Serde)]
struct PlayerCooldowns {
    #[key]
    player: ContractAddress,
    #[key]
    gameId: u128,
    lastStrike: u64,
}

#[derive(Model, Drop, Copy, Serde)]
struct PlayerEnrollment {
    #[key]
    address: ContractAddress,
    #[key]
    gameId: u128,
    enrolled: bool,
    index: u32
}

#[derive(Model, Drop, Copy, Serde)]
struct GamePlayers {
    #[key]
    gameId: u128,
    #[key]
    index: u32,
    address: ContractAddress
}

#[derive(Model, Drop, Copy, Serde)]
struct GlobalPlayerStats {
    #[key]
    address: ContractAddress,
    rank: u8,
    totalStrikes: u128,
    totalStrikeDamage: u128
}

#[derive(Model, Drop, Copy, Serde)]
struct Player {
    #[key]
    address: ContractAddress,
    #[key]
    gameId: u128,
    isGeneral: bool,
    gold: u16,
    sharpened: bool,
    totalStrikes: u8,
    totalStrikeDamage: u32,
    nickname: felt252
}

#[derive(Model, Copy, Drop, Serde)]
struct Game {
    #[key]
    gameId: u128,
    northGeneral: ContractAddress,
    southGeneral: ContractAddress,
    castle1Health: u32,
    castle2Health: u32,
    stage: u8,
    startTime: u128,
    nextPlayerIndex: u32,
    numPlayers: u128
}

#[derive(Model, Copy, Drop, Serde)]
struct GameWorld {
    #[key]
    metaId: felt252, // always 'game'
    nextGameId: u128,
    entropy: felt252
}