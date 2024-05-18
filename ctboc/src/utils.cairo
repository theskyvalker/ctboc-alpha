use ctboc::dice::DiceTrait;
use ctboc::models::{Player};
use debug::PrintTrait;
use ctboc::{game_entropy, dice};
use poseidon::PoseidonTrait;
use hash::HashStateTrait;
use traits::Into;
use ctboc::game_entropy::{ImplGameEntropy, GameEntropy, GameEntropyPacking};

fn get_attack_damage(sharpened: bool, rank: u8, entropy: felt252) -> u32 {

    let current_block_info = starknet::get_block_info().unbox();

    let unpacked: GameEntropy = GameEntropyPacking::unpack(
        entropy
    );

    let blocks_per_hour = ImplGameEntropy::calculate_blocks_per_hour(
        unpacked.last_updated_block,
        unpacked.last_updated_time,
        current_block_info.block_number,
        current_block_info.block_timestamp
    );

    let next_update_block = ImplGameEntropy::calculate_next_update_block(
        current_block_info.block_number, blocks_per_hour
    );
    
    let new_game_entropy = ImplGameEntropy::new(
        current_block_info.block_number, current_block_info.block_timestamp, next_update_block
    );

    if sharpened {
        randint(rank.into(), 200, new_game_entropy.hash, current_block_info.block_timestamp)
    } else {
        randint(rank.into(), 100, new_game_entropy.hash, current_block_info.block_timestamp)
    }
}

fn random(entropy: u64) -> u64 {
    let a = 1664525;
    let c = 1013904223;
    let m = 2 ^ 32;
    let mut random_number = (a * entropy + c) % m;
    random_number % 101
}

fn randint(min: u32, max: u32, seed: felt252, nonce: u64) -> u32 {
    let mut state = PoseidonTrait::new();
    state = state.update(seed);
    state = state.update(nonce.into());
    let random: u256 = state.finalize().into();
    (random % (max - min).into() + min.into()).try_into().unwrap()
}

// ---------------------------
// ---------- Tests ----------
// ---------------------------
// RANDOM FUNCTION TEST
#[cfg(test)]
mod tests {
    use core::traits::TryInto;
    use core::traits::Into;
    //use debug::PrintTrait;
    use super::{randint};
    use ctboc::game_entropy::{ImplGameEntropy, GameEntropy};

    #[test]
    #[available_gas(300000)]
    fn random_function_test() {

        let prev_game_entropy = GameEntropy{
            hash: 0,
            last_updated_block: 1,
            last_updated_time: 1,
            next_update_block: 4
        };

        starknet::testing::set_block_number(4);
        starknet::testing::set_block_timestamp(100);

        let current_block_info = starknet::get_block_info().unbox();

        let blocks_per_hour = ImplGameEntropy::calculate_blocks_per_hour(
            prev_game_entropy.last_updated_block,
            prev_game_entropy.last_updated_time,
            current_block_info.block_number,
            current_block_info.block_timestamp
        );

        let next_update_block = ImplGameEntropy::calculate_next_update_block(
            current_block_info.block_number, blocks_per_hour
        );
        
        let new_game_entropy = ImplGameEntropy::new(
            current_block_info.block_number, current_block_info.block_timestamp, next_update_block
        );

        assert(new_game_entropy.hash != 0, 'Hash is 0');

        //y = random(new_game_entropy.hash);

        //randint(0, 100, new_game_entropy.hash, 0).print();
        //randint(0, 100, new_game_entropy.hash, 0).print();

        //randint(0, 200, new_game_entropy.hash, current_block_info.block_timestamp).print();
    }
}