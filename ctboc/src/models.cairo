use starknet::ContractAddress;
use array::ArrayTrait;

#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct PlayerCooldowns {
    #[key]
    player: ContractAddress,
    #[key]
    gameId: u128,
    lastStrike: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct PlayerEnrollment {
    #[key]
    address: ContractAddress,
    #[key]
    gameId: u128,
    enrolled: bool,
    index: u32
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct GamePlayers {
    #[key]
    gameId: u128,
    #[key]
    index: u32,
    address: ContractAddress
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct GlobalPlayerStats {
    #[key]
    address: ContractAddress,
    rank: u8,
    totalStrikes: u128,
    totalStrikeDamage: u128
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
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
    nickname: felt252,
    strikesAgainstCastle1: u16,
    strikesAgainstCastle2: u16
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
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
    numPlayers: u32,
    prizePool: u256,
    prizesDistributed: bool
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct GameWorld {
    #[key]
    metaId: felt252, // always 'game'
    nextGameId: u128,
    entropy: felt252,
    feeTokenAddress: ContractAddress,
    adminAddress: ContractAddress,
    treasuryAddress: ContractAddress,
    treasuryBalance: u256,
    pixelBannersAddress: ContractAddress
}