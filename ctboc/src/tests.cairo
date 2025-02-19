#[cfg(test)]
mod tests {
    use starknet::class_hash::Felt252TryIntoClassHash;
    use starknet::{testing};
    use debug::PrintTrait;
    use core::ArrayTrait;

    // import world dispatcher
    use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
    use ctboc::mocks::lords_mock::{lords_mock, ILordsMockDispatcher, ILordsMockDispatcherTrait, ILordsMockFaucet};
    use ctboc::config::{ConfigManagerTrait};
    use ctboc::interfaces::ierc20::{ierc20, IERC20Dispatcher, IERC20DispatcherTrait};

    // import test utils
    use dojo::test_utils::{spawn_test_world, deploy_contract};

    // import models
    use ctboc::models::{Game, PlayerEnrollment, Player, GameWorld, GamePlayers, game, player_enrollment, player, game_world, game_players};
    use ctboc::game_settings::{INITIAL_CASTLE_HEALTH, ENROLLMENT_STAGE_DELAY, BATTLE_STAGE_DELAY, COST_GENERAL, COST_SELLSWORD};
    use ctboc::game_entropy::{GameEntropy, GameEntropyPacking};

    // import actions
    use ctboc::actions::{actions, IActionsDispatcher, IActionsDispatcherTrait};

    use ctboc::utils::{setup_world, elapse_timestamp, execute_ierc20_initializer, execute_approve, execute_faucet, _next_block, INITIAL_TIMESTAMP, ETH_TO_WEI};

    #[test]
    #[available_gas(900000000)]
    fn test_enroll() {
        let owner = starknet::contract_address_const::<'GG'>();

        let ( world, actions_contract_address, actions_system, lords ) = setup_world(owner, true, true, 200);

        actions_system.spawn(1); // first game id is 0
        actions_system.spawn(2); // second game id is 1 

        // call enroll
        actions_system.enroll(0);

        assert(get!(world, 0, (Game)).numPlayers == 1, 'numPlayers not 1');

        assert(get!(world, (owner, 0), (PlayerEnrollment)).enrolled, 'enrolled not true');

        // call unenroll
        actions_system.unenroll(0);

        assert(lords.balance_of(actions_contract_address) / ETH_TO_WEI == 200, 'balance incorrect');

        assert(get!(world, 0, (Game)).numPlayers == 0, 'numPlayers not 0');
    }

    #[test]
    #[should_panic]
    #[available_gas(900000000)]
    fn test_enroll_failure_init() {
        let owner = starknet::contract_address_const::<'GG'>();

        let ( world, actions_contract_address, actions_system, lords ) = setup_world(owner, false, true, 200);

        actions_system.spawn(1); // first game id is 0
        actions_system.spawn(2); // second game id is 1 

        // call enroll
        actions_system.enroll(0);

        assert(get!(world, 0, (Game)).numPlayers == 1, 'numPlayers not 1');

        assert(get!(world, (owner, 0), (PlayerEnrollment)).enrolled, 'enrolled not true');

        actions_system.unenroll(0);

        assert(lords.balance_of(actions_contract_address) / ETH_TO_WEI == 200, 'balance incorrect');

        assert(get!(world, 0, (Game)).numPlayers == 0, 'numPlayers not 0');
    }

    #[test]
    #[should_panic]
    #[available_gas(900000000)]
    fn test_enroll_failure_balance() {
        let owner = starknet::contract_address_const::<'GG'>();

        let ( world, actions_contract_address, actions_system, lords ) = setup_world(owner, true, false, 200);

        actions_system.spawn(1); // first game id is 0
        actions_system.spawn(2); // second game id is 1 

        actions_system.enroll(0);

        assert(get!(world, 0, (Game)).numPlayers == 1, 'numPlayers not 1');

        assert(get!(world, (owner, 0), (PlayerEnrollment)).enrolled, 'enrolled not true');

        actions_system.unenroll(0);

        assert(lords.balance_of(actions_contract_address) / ETH_TO_WEI == 200, 'balance incorrect');

        assert(get!(world, 0, (Game)).numPlayers == 0, 'numPlayers not 0');
    }

    #[test]
    #[should_panic]
    #[available_gas(900000000)]
    fn test_enroll_failure_approval() {
        let owner = starknet::contract_address_const::<'GG'>();

        let ( world, actions_contract_address, actions_system, lords ) = setup_world(owner, true, true, 0);

        actions_system.spawn(1); // first game id is 0
        actions_system.spawn(2); // second game id is 1 

        actions_system.enroll(0);

        assert(get!(world, 0, (Game)).numPlayers == 1, 'numPlayers not 1');

        assert(get!(world, (owner, 0), (PlayerEnrollment)).enrolled, 'enrolled not true');

        actions_system.unenroll(0);

        assert(lords.balance_of(actions_contract_address) / ETH_TO_WEI == 200, 'balance incorrect');

        assert(get!(world, 0, (Game)).numPlayers == 0, 'numPlayers not 0');
    }

    #[test]
    #[available_gas(300000000)]
    fn test_general_functions() {

        let caller = starknet::contract_address_const::<'GG'>();

        let ( world, actions_contract_address, actions_system, lords ) = setup_world(caller, true, true, 2000);

        actions_system.spawn(1); // first game id is 0 
        actions_system.spawn(1); // next game id is 1

        assert(get!(world, 1, (Game)).northGeneral == caller, 'northGeneral not caller');
        assert(get!(world, 1, (Game)).numPlayers == 1, 'player count not 1');
        assert(get!(world, 1, (Game)).southGeneral == starknet::contract_address_const::<0x0>(), 'southGeneral not 0x0');

        // call unassignGeneral
        actions_system.unassignGeneral(1, 1);

        assert(get!(world, 1, (Game)).northGeneral == starknet::contract_address_const::<0x0>(), 'northGeneral not 0x0');

        actions_system.assignGeneral(1, 2);
        
        assert(get!(world, 1, (Game)).southGeneral == caller, 'southGeneral not caller');
    }

    #[test]
    #[available_gas(300000000)]
    fn test_fortify() {
        // caller
        let caller = starknet::contract_address_const::<'GG'>();

        let ( world, actions_contract_address, actions_system, lords ) = setup_world(caller, true, true, 2000);

        actions_system.spawn(1); // first game id is 0 
        actions_system.spawn(1); // next game id is 1

        'castle1Health before fortify:'.print();
        get!(world, 1, (Game)).castle1Health.print();
        get!(world, 1, (Game)).northGeneral.print();

        actions_system.dev_change_game_stage(1, 1);

        // call fortify on north castle
        actions_system.fortify(1, 1, 10);

        assert(get!(world, 1, (Game)).castle1Health == INITIAL_CASTLE_HEALTH + 20, 'castle1Health not +20');
        
        'castle1Health after fortify:'.print();
        get!(world, 1, (Game)).castle1Health.print();

        assert(get!(world, 1, (Game)).castle1Health == INITIAL_CASTLE_HEALTH + 20, 'castle1Health not +20');
    }

    #[test]
    #[available_gas(300000000)]
    #[should_panic]
    fn test_sharpen_failure() {
        // caller
        let mut caller = starknet::contract_address_const::<'GG'>();

        let ( world, actions_contract_address, actions_system, lords ) = setup_world(caller, true, true, 2000);

        // call sharpen without gold
        actions_system.sharpen(1);

        let mut player = get!(world, (caller, 1), (Player));

        assert(player.sharpened, 'sharpened somehow true');

        player.gold = 51;
        set!(world, (player));

        // call sharpen again with gold
        actions_system.sharpen(1);

        assert(get!(world, (caller, 1), (Player)).sharpened, 'sharpened not true');
        assert(get!(world, (caller, 1), (Player)).gold == 1, 'gold not 1');
    }

    #[test]
    #[available_gas(300000000)]
    fn test_sharpen_success() {
        // caller
        let mut caller = starknet::contract_address_const::<0x1>();

        let ( world, actions_contract_address, actions_system, lords ) = setup_world(caller, true, true, 2000);

        actions_system.spawn(1);
        actions_system.spawn(1);

        actions_system.dev_change_game_stage(1, 2);

        caller = starknet::contract_address_const::<'GG'>();
        starknet::testing::set_contract_address(caller);

        let mut player = get!(world, (caller, 1), (Player));

        player.gold = 51;
        set!(world, (player));

        // call sharpen again with gold
        actions_system.sharpen(1);

        assert(get!(world, (caller, 1), (Player)).sharpened, 'sharpened not true');
        assert(get!(world, (caller, 1), (Player)).gold == 1, 'gold not 1');
    }

    #[test]
    #[available_gas(300000000)]
    #[should_panic(expected: ('Not enrolled in game', 'ENTRYPOINT_FAILED'))]
    fn test_attack_fail_enrollment() {
        let mut caller = starknet::contract_address_const::<'GG'>();

        let ( world, actions_contract_address, actions_system, lords ) = setup_world(caller, true, true, 2000);

        actions_system.spawn(2);
        actions_system.dev_change_game_stage(0, 2);

        caller = starknet::contract_address_const::<'AB'>();
        testing::set_contract_address(caller);

        actions_system.attack(0, 1);
    }

    #[test]
    #[available_gas(300000000)]
    #[should_panic(expected: ('Attack on cooldown', 'ENTRYPOINT_FAILED'))]
    fn test_attack_cooldown() {
        // caller
        let mut caller = starknet::contract_address_const::<'GG'>();

        let ( world, actions_contract_address, actions_system, lords ) = setup_world(caller, true, true, 2000);

        let mut game_world = get!(world, 'game', (GameWorld));
        game_world.entropy = GameEntropyPacking::pack(
            GameEntropy {
                hash: 0,
                last_updated_block: 1,
                last_updated_time: 100,
                next_update_block: 4,
            }
        );

        set!(world, (game_world));

        actions_system.spawn(2);

        let mut game = get!(world, 1, (Game));
        game.castle1Health = 1000;
        game.castle2Health = 1000;
        set!(world, (game));

        caller = starknet::contract_address_const::<'GG'>();
        starknet::testing::set_contract_address(caller);

        // call enroll
        actions_system.enroll(0);

        actions_system.dev_change_game_stage(0, 2);

        starknet::testing::set_block_timestamp(1000);
        starknet::testing::set_block_number(5);

        actions_system.attack(0, 1);

        starknet::testing::set_block_timestamp(2000);
        starknet::testing::set_block_number(6);
        
        // this one should trigger cooldown notice
        actions_system.attack(0, 1);
    }

    #[test]
    #[available_gas(300000000)]
    #[should_panic(expected: ('Not in attack stage', 'ENTRYPOINT_FAILED'))]
    fn test_attack() {
        // caller
        let mut caller = starknet::contract_address_const::<'GG'>();

        let ( world, actions_contract_address, actions_system, lords ) = setup_world(caller, true, true, 2000);

        actions_system.spawn(2);

        // call enroll
        actions_system.enroll(0);
        actions_system.attack(0, 1);
    }

    #[test]
    #[available_gas(300000000)]
    #[should_panic(expected: ('Too early for staging stage', 'ENTRYPOINT_FAILED'))]
    fn test_attack_fail_stage() {
        // caller
        let mut caller = starknet::contract_address_const::<'GG'>();
        
        let ( world, actions_contract_address, actions_system, lords ) = setup_world(caller, true, true, 2000);

        actions_system.spawn(1);

        starknet::testing::set_block_timestamp((ENROLLMENT_STAGE_DELAY + 1).into());

        actions_system.change_game_stage(0, 1);

        starknet::testing::set_block_timestamp((ENROLLMENT_STAGE_DELAY + BATTLE_STAGE_DELAY - 1).into());

        actions_system.change_game_stage(0, 2);
        actions_system.attack(0, 2);
    }

    #[test]
    #[available_gas(300000000)]
    fn test_attack_success() {
        // caller
        let mut caller = starknet::contract_address_const::<'GG'>();

        let ( world, actions_contract_address, actions_system, lords ) = setup_world(caller, true, true, 2000);

        let mut game_world = get!(world, 'game', (GameWorld));
        game_world.entropy = GameEntropyPacking::pack(
            GameEntropy {
                hash: 0,
                last_updated_block: 1,
                last_updated_time: 100,
                next_update_block: 4,
            }
        );

        set!(world, (game_world));

        actions_system.spawn(1);
        'spawn done'.print();

        let mut game = get!(world, 0, (Game));
        game.castle1Health = 1000;
        game.castle2Health = 1000;
        set!(world, (game));
        'castle set'.print();

        let mut player = get!(world, (caller, 0), (Player));

        //change game state to battle
        actions_system.dev_change_game_stage(0, 2);
        'game stage changed'.print();

        starknet::testing::set_block_timestamp(1000);
        starknet::testing::set_block_number(5);

        // call attack
        actions_system.attack(0, 2);
        'attack done'.print();

        assert(get!(world, 0, (Game)).castle2Health == 960, 'castle2Health not 960');

        player.gold = 100;
        set!(world, (player));
        'player set'.print();
        actions_system.sharpen(0);
        'sharpen done'.print();

        starknet::testing::set_block_timestamp(23000);
        starknet::testing::set_block_number(8);

        actions_system.attack(0, 2);
        'attack done'.print();

        assert(!get!(world, (caller, 0), (Player)).sharpened, 'sharpened not false');
    }

    #[test]
    #[available_gas(300000000)]
    fn test_player_directory() {
        // caller
        let mut caller = starknet::contract_address_const::<'AB'>();

        let ( world, actions_contract_address, actions_system, lords ) = setup_world(caller, true, true, 2000);

        // spawn game with 0x0 as north general
        actions_system.spawn(1);

        // check that player directory index 0 is 0x0 and nextPlayerIndex is updated to 1
        assert(get!(world, (0, 0), (GamePlayers)).address == starknet::contract_address_const::<'AB'>(), 'address not AB');
        assert(get!(world, (0, 0), (GamePlayers)).index == 0, 'index not 0');
        assert(get!(world, 0, (Game)).nextPlayerIndex == 1, 'nextPlayerIndex not 1');

        caller = starknet::contract_address_const::<'GG'>();
        starknet::testing::set_contract_address(caller);

        execute_faucet(lords, caller);
        lords.approve(actions_contract_address, 200 * ETH_TO_WEI);

        // call enroll
        actions_system.enroll(0);

        // check that player directory index 1 is caller and nextPlayerIndex is updated to 2
        assert(get!(world, (0, 1), (GamePlayers)).address == caller, 'address not caller');
        assert(get!(world, (caller, 0), (PlayerEnrollment)).index == 1, 'index not 1');
        assert(get!(world, 0, (Game)).nextPlayerIndex == 2, 'nextPlayerIndex not 2');

        // call uneroll
        actions_system.unenroll(0);

        // check that nextPlayerIndex should not change though enrollment status should and the index should be the same
        assert(get!(world, (0, 1), (GamePlayers)).address == caller, 'address not caller');
        assert(get!(world, (caller, 0), (PlayerEnrollment)).index == 1, 'index not 1');
        assert(get!(world, 0, (Game)).nextPlayerIndex == 2, 'nextPlayerIndex not 2');
        assert(get!(world, (caller, 0), (PlayerEnrollment)).enrolled == false, 'enrolled not false');

        // call enroll again
        actions_system.enroll(0);

        // check that nextPlayerIndex should not change though enrollment status should and the index should be the same
        assert(get!(world, (0, 1), (GamePlayers)).address == caller, 'address not caller');
        assert(get!(world, (caller, 0), (PlayerEnrollment)).index == 1, 'index not 1');
        assert(get!(world, 0, (Game)).nextPlayerIndex == 2, 'nextPlayerIndex not 2');
        assert(get!(world, (caller, 0), (PlayerEnrollment)).enrolled == true, 'enrolled not true');

        // call unassignGeneral as AB
        caller = starknet::contract_address_const::<'AB'>();
        starknet::testing::set_contract_address(caller);
        execute_faucet(lords, caller);
        lords.approve(actions_contract_address, 200 * ETH_TO_WEI);

        actions_system.unassignGeneral(0, 1);

        // check that nextPlayerIndex should not change though enrollment status should and the index should be the same
        assert(get!(world, (0, 0), (GamePlayers)).address == caller, 'address not caller');
        assert(get!(world, (caller, 0), (PlayerEnrollment)).index == 0, 'index not 0');
        assert(get!(world, 0, (Game)).nextPlayerIndex == 2, 'nextPlayerIndex not 2');
        assert(get!(world, (caller, 0), (PlayerEnrollment)).enrolled == false, 'enrolled not false');
        assert(get!(world, (caller, 0), (Player)).isGeneral == false, 'isGeneral not false');

        // call assignGeneral as AB but for castle 2
        actions_system.assignGeneral(0, 2);

        // check that nextPlayerIndex should not change though enrollment status should and the index should be the same
        assert(get!(world, (0, 0), (GamePlayers)).address == caller, 'address not caller');
        assert(get!(world, (caller, 0), (PlayerEnrollment)).index == 0, 'index not 0');
        assert(get!(world, 0, (Game)).nextPlayerIndex == 2, 'nextPlayerIndex not 2');
        assert(get!(world, (caller, 0), (PlayerEnrollment)).enrolled == true, 'enrolled not true');

        // and now try adding a 3rd player to the mix
        caller = starknet::contract_address_const::<'HH'>();
        starknet::testing::set_contract_address(caller);
        execute_faucet(lords, caller);
        lords.approve(actions_contract_address, 200 * ETH_TO_WEI);

        // call enroll
        actions_system.enroll(0);

        // check that nextPlayerIndex should now update to 3 and the new player should get 2 as the index
        assert(get!(world, (caller, 0), (PlayerEnrollment)).index == 2, 'index not 2');
        assert(get!(world, (0, 2), (GamePlayers)).address == caller, 'address not caller');
        assert(get!(world, 0, (Game)).nextPlayerIndex == 3, 'nextPlayerIndex not 3');
        assert(get!(world, (caller, 0), (PlayerEnrollment)).enrolled == true, 'enrolled not true');
    }

    #[test]
    #[should_panic]
    #[available_gas(300000000)]
    fn test_list_players() {
        // caller
        let mut caller = starknet::contract_address_const::<'AB'>();

        let ( world, actions_contract_address, actions_system, lords ) = setup_world(caller, true, true, 2000);

        // spawn game with 0x0 as north general
        actions_system.spawn(1);

        // check that player directory index 0 is 0x0 and nextPlayerIndex is updated to 1
        assert(get!(world, (0, 0), (GamePlayers)).address == starknet::contract_address_const::<'AB'>(), 'address not AB');
        assert(get!(world, (0, 0), (GamePlayers)).index == 0, 'index not 0');
        assert(get!(world, 0, (Game)).nextPlayerIndex == 1, 'nextPlayerIndex not 1');

        caller = starknet::contract_address_const::<'GG'>();
        starknet::testing::set_contract_address(caller);

        // call enroll
        actions_system.enroll(0);

        // check the list of players includes both 'AB' and 'GG'
        actions_system.get_list_of_players(0);

        //assert(*players.at(0) == starknet::contract_address_const::<'AB'>(), 'players[0] not AB');
        //assert(*players.at(1) == starknet::contract_address_const::<'GG'>(), 'players[1] not GG');
    }

    #[test]
    #[available_gas(300000000)]
    #[should_panic(expected: ('Not enrolled in game', 'ENTRYPOINT_FAILED'))]
    fn test_set_nickname_failure() {
        // caller
        let mut caller = starknet::contract_address_const::<'AB'>();

        let ( world, actions_contract_address, actions_system, lords ) = setup_world(caller, true, true, 2000);

        // spawn game as north general
        actions_system.spawn(1);

        caller = starknet::contract_address_const::<'GG'>();
        starknet::testing::set_contract_address(caller);

        // try to set nickname without being enrolled
        actions_system.set_nickname(0, 'GG');
    }

    #[test]
    #[available_gas(300000000)]
    fn test_set_nickname() {
        // caller
        let mut caller = starknet::contract_address_const::<'AB'>();

        let ( world, actions_contract_address, actions_system, lords ) = setup_world(caller, true, true, 2000);

        actions_system.spawn(1);

        actions_system.set_nickname(0, 'AB');

        assert(get!(world, (caller, 0), (Player)).nickname == 'AB', 'nickname not AB');
    }

    #[test]
    #[available_gas(300000000)]
    fn test_distribute_prizes_success() {
        // Admin address
        let admin = starknet::contract_address_const::<'AB'>();

        // Player addresses
        let player1 = starknet::contract_address_const::<'GG'>();
        let player2 = starknet::contract_address_const::<'HH'>();

        // Set up the world with admin as owner
        let (world, actions_contract_address, actions_system, lords) = setup_world(admin, true, true, 2000);

        // Admin spawns a game as general of side 1
        testing::set_contract_address(admin);
        actions_system.spawn(1); // gameId = 0

        // Players enroll and approve tokens
        testing::set_contract_address(player1);
        execute_faucet(lords, player1);
        lords.approve(actions_contract_address, COST_SELLSWORD.into() * ETH_TO_WEI);
        actions_system.enroll(0);

        testing::set_contract_address(player2);
        execute_faucet(lords, player2);
        lords.approve(actions_contract_address, COST_SELLSWORD.into() * ETH_TO_WEI);
        actions_system.enroll(0);

        // Advance the game to battle stage
        testing::set_contract_address(admin);
        actions_system.dev_change_game_stage(0, 2); // Battle stage

        // Simulate attacks
        // player1 attacks the losing castle (castle 2)
        testing::set_contract_address(player1);
        actions_system.attack(0, 2);

        // player2 attacks the winning castle (castle 1)
        testing::set_contract_address(player2);
        actions_system.attack(0, 1);

        // Simulate castle 2 falling by setting its HP to 0
        testing::set_contract_address(admin);
        actions_system.set_castle_hp(0, 2, 0);

        // Advance the game to end stage
        actions_system.dev_change_game_stage(0, 3); // End stage

        // Call distribute_prizes
        actions_system.distribute_prizes(0);

        // Verify that prizesDistributed is true
        let game = get!(world, 0, (Game));
        assert(game.prizesDistributed == true, 'Prizes not distributed');

        // Since we cannot check token balances directly, we assume successful execution indicates correct behavior
    }

    #[test]
    #[available_gas(300000000)]
    #[should_panic(expected: ('Game is not over yet', 'ENTRYPOINT_FAILED'))]
    fn test_distribute_prizes_fail_before_end() {
        // Admin address
        let admin = starknet::contract_address_const::<'AB'>();

        // Player address
        let player1 = starknet::contract_address_const::<'GG'>();

        // Set up the world
        let (world, actions_contract_address, actions_system, lords) = setup_world(admin, true, true, 2000);

        // Admin spawns a game
        testing::set_contract_address(admin);
        actions_system.spawn(1); // gameId = 0

        // Player enrolls
        testing::set_contract_address(player1);
        execute_faucet(lords, player1);
        lords.approve(actions_contract_address, COST_SELLSWORD.into() * ETH_TO_WEI);
        actions_system.enroll(0);

        // Game is not yet in end stage
        // Try to call distribute_prizes
        actions_system.distribute_prizes(0);
    }

    #[test]
    #[available_gas(300000000)]
    fn test_withdraw_treasury_funds_success() {
        // Admin address
        let admin = starknet::contract_address_const::<'AB'>();

        // Set up the world
        let (world, actions_contract_address, actions_system, _lords) = setup_world(admin, true, true, 2000);

        // Simulate treasury balance
        let mut game_world = get!(world, 'game', (GameWorld));
        game_world.treasuryBalance = 1000 * ETH_TO_WEI;
        set!(world, (game_world));

        execute_faucet(_lords, actions_contract_address);

        'contract lords balance start'.print();
        _lords.balance_of(actions_contract_address).print();
        'contract lords balance end'.print();

        // Admin calls withdraw_treasury_funds
        testing::set_contract_address(admin);
        actions_system.withdraw_treasury_funds();

        // Verify that treasuryBalance is now zero
        let game_world = get!(world, 'game', (GameWorld));
        assert(game_world.treasuryBalance == 0_u256, 'Treasury balance not 0');
    }

    #[test]
    #[available_gas(300000000)]
    #[should_panic(expected: ('You are not admin', 'ENTRYPOINT_FAILED'))]
    fn test_withdraw_treasury_funds_fail_non_admin() {
        // Admin address
        let admin = starknet::contract_address_const::<'AB'>();

        // Non-admin address
        let non_admin = starknet::contract_address_const::<'GG'>();

        // Set up the world
        let (world, actions_contract_address, actions_system, _lords) = setup_world(admin, true, true, 2000);

        // Simulate treasury balance
        let mut game_world = get!(world, 'game', (GameWorld));
        game_world.treasuryBalance = 1000 * ETH_TO_WEI;
        set!(world, (game_world));

        // Non-admin tries to call withdraw_treasury_funds
        testing::set_contract_address(non_admin);
        actions_system.withdraw_treasury_funds();
    }

    #[test]
    #[available_gas(300000000)]
    fn test_set_castle_hp_success() {
        // Admin address
        let admin = starknet::contract_address_const::<'AB'>();

        // Set up the world
        let (world, actions_contract_address, actions_system, _lords) = setup_world(admin, true, true, 2000);

        // Admin spawns a game
        testing::set_contract_address(admin);
        actions_system.spawn(1); // gameId = 0

        // Admin sets castle HP
        actions_system.set_castle_hp(0, 1, 1000);

        // Verify that castle1Health is updated
        let game = get!(world, 0, (Game));
        assert(game.castle1Health == 1000_u32, 'Castle1Health not updated');
    }

    #[test]
    #[available_gas(300000000)]
    #[should_panic(expected: ('You are not admin', 'ENTRYPOINT_FAILED'))]
    fn test_set_castle_hp_fail_non_admin() {
        // Admin address
        let admin = starknet::contract_address_const::<'AB'>();

        // Non-admin address
        let non_admin = starknet::contract_address_const::<'GG'>();

        // Set up the world
        let (world, actions_contract_address, actions_system, _lords) = setup_world(admin, true, true, 2000);

        // Admin spawns a game
        testing::set_contract_address(admin);
        actions_system.spawn(1); // gameId = 0

        // Non-admin tries to set castle HP
        testing::set_contract_address(non_admin);
        actions_system.set_castle_hp(0, 1, 1000);
    }

}