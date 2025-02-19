use ctboc::dice::DiceTrait;
use debug::PrintTrait;
use ctboc::{game_entropy, dice};
use poseidon::PoseidonTrait;
use hash::HashStateTrait;
use traits::Into;
use ctboc::game_entropy::{ImplGameEntropy, GameEntropy, GameEntropyPacking};
use ctboc::interfaces::ierc20::{ierc20, IERC20Dispatcher, IERC20DispatcherTrait};
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
//use ctboc::mocks::lords_mock::{lords_mock, ILordsMockDispatcher, ILordsMockDispatcherTrait};
//use ctboc::config::{ConfigManagerTrait};
//use ctboc::interfaces::lords::{ILordsDispatcher, ILordsDispatcherTrait};
use ctboc::actions::{actions, IActionsDispatcher, IActionsDispatcherTrait};
use starknet::{ContractAddress, contract_address_const, testing};
use ctboc::models::{Game, PlayerEnrollment, Player, GameWorld, GamePlayers};
// use dojo::test_utils::{spawn_test_world, deploy_contract};

const INITIAL_TIMESTAMP: u64 = 0x100000000;
const INITIAL_STEP: u64 = 0x10;
const ETH_TO_WEI: u256 = 1_000_000_000_000_000_000;

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

fn _check_and_transfer_fees(playerAddress: ContractAddress, amount: u256, feeTokenAddress: ContractAddress) {
    
    // let lords = ILordsDispatcher { contract_address: feeTokenAddress };
    let lords = IERC20Dispatcher { contract_address: feeTokenAddress };
    let balance: u256 = lords.balance_of(playerAddress);
    
    assert(balance >= amount * ETH_TO_WEI, 'Insufficient balance for fees');
    let allowance: u256 = lords.allowance(playerAddress, starknet::get_contract_address());
    assert(allowance >= amount * ETH_TO_WEI, 'Not allowed to transfer fees');
    
    lords.transfer_from(playerAddress, starknet::get_contract_address(), amount * ETH_TO_WEI);
}

fn _pay_player(playerAddress: ContractAddress, amount: u256, feeTokenAddress: ContractAddress) -> bool {

    let lords = IERC20Dispatcher { contract_address: feeTokenAddress };
    
    lords.transfer(playerAddress, amount * ETH_TO_WEI)
}

// fn setup_world(owner: ContractAddress, initialize: bool, faucet_enabled: bool, approval_amount: u64) -> (
//     IWorldDispatcher,
//     ContractAddress,
//     IActionsDispatcher,
//     ILordsMockDispatcher
// ) {

//     testing::set_contract_address(owner);
//     testing::set_block_number(1);
//     testing::set_block_timestamp(INITIAL_TIMESTAMP);

//     // models
//     let mut models = array![
//         game::TEST_CLASS_HASH,
//         player_enrollment::TEST_CLASS_HASH,
//         player::TEST_CLASS_HASH,
//         game_world::TEST_CLASS_HASH,
//         game_players::TEST_CLASS_HASH
//     ];

//     // deploy world with models
//     let world = spawn_test_world(models);

//     let lords = ILordsMockDispatcher{ contract_address: world.deploy_contract('salt1', lords_mock::TEST_CLASS_HASH.try_into().unwrap()) };
//     // 'lords deployed'.print();

//     _next_block();

//     execute_ierc20_initializer(lords, owner);
//     // 'init done'.print();

//     if (faucet_enabled) {
//         execute_faucet(lords, owner);
//         // 'faucet done'.print();
//         _next_block();
//     }

//     if (initialize) {

//         _set_config(world, lords.contract_address, owner, owner);
//         //'config set'.print();

//         _next_block();
//     }

//     // deploy actions
//     let actions_contract_address = world.deploy_contract('salt2', actions::TEST_CLASS_HASH.try_into().unwrap());
//     let actions_system = IActionsDispatcher { contract_address: actions_contract_address };

//     _next_block();

//     if (approval_amount > 0) {
//         lords.approve(actions_contract_address, approval_amount.into() * ETH_TO_WEI);
//         //'approve done'.print();
//     }

//     (world, actions_contract_address, actions_system, lords)
// }

// fn _set_config(world: IWorldDispatcher, feeTokenAddress: ContractAddress, pixelBannersAddress: ContractAddress, adminAddress: ContractAddress, treasuryAddress: ContractAddress) {
//     let configManager = ConfigManagerTrait::new(world);

//     let mut game_world = configManager.get();

//     game_world.feeTokenAddress = feeTokenAddress;
//     game_world.adminAddress = adminAddress;
//     game_world.treasuryAddress = treasuryAddress;
//     game_world.pixelBannersAddress = pixelBannersAddress;

//     configManager.set(game_world);
// }

fn elapse_timestamp(delta: u64) -> (u64, u64) {
    let block_info = starknet::get_block_info().unbox();
    let new_block_number = block_info.block_number + 1;
    let new_block_timestamp = block_info.block_timestamp + delta;
    testing::set_block_number(new_block_number);
    testing::set_block_timestamp(new_block_timestamp);
    (new_block_number, new_block_timestamp)
}

#[inline(always)]
fn _next_block() -> (u64, u64) {
    elapse_timestamp(INITIAL_STEP)
}

// ::ierc20
//fn execute_ierc20_initializer(system: ILordsMockDispatcher, sender: ContractAddress) {
    //testing::set_contract_address(sender);
    //system.initializer();
    //_next_block();
//}
//fn execute_faucet(system: ILordsMockDispatcher, sender: ContractAddress) {
    //testing::set_contract_address(sender);
    //system.faucet();
    //_next_block();
//}
//fn execute_approve(system: ILordsMockDispatcher, owner: ContractAddress, spender: ContractAddress, value: u256) {
    //testing::set_contract_address(owner);
    //system.approve(spender, value);
    //_next_block();
//}

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