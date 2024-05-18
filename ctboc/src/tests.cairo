#[cfg(test)]
mod tests {
    use starknet::class_hash::Felt252TryIntoClassHash;
    use debug::PrintTrait;
    use core::ArrayTrait;

    // import world dispatcher
    use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};

    // import test utils
    use dojo::test_utils::{spawn_test_world, deploy_contract};

    // import models
    use ctboc::models::{Game, PlayerEnrollment, Player, GameWorld, GamePlayers, game, player_enrollment, player, game_world, game_players};
    use ctboc::game_settings::{INITIAL_CASTLE_HEALTH, ENROLLMENT_STAGE_DELAY, BATTLE_STAGE_DELAY};
    use ctboc::game_entropy::{GameEntropy, GameEntropyPacking};

    // import actions
    use super::{actions, IActionsDispatcher, IActionsDispatcherTrait};
    use super::actions::change_game_stage;

    #[test]
    #[available_gas(60000000)]
    fn test_enroll() {
        // caller
        let caller = starknet::contract_address_const::<0x0>();

        // models
        let mut models = array![
            game::TEST_CLASS_HASH,
            player_enrollment::TEST_CLASS_HASH
        ];

        // deploy world with models
        let world = spawn_test_world(models);

        // deploy systems contract
        let contract_address = world
            .deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.spawn(1); // first game id is 0 

        // call enroll
        actions_system.enroll(0);

        assert(get!(world, 0, (Game)).numPlayers == 1, 'numPlayers not 1');

        assert(get!(world, (caller, 0), (PlayerEnrollment)).enrolled, 'enrolled not true');

        // call unenroll
        actions_system.unenroll(0);

        assert(get!(world, 0, (Game)).numPlayers == 0, 'numPlayers not 0');
    }

    #[test]
    #[available_gas(300000000)]
    fn test_general_functions() {
        // caller
        let caller = starknet::contract_address_const::<'GG'>();

        // models
        let mut models = array![
            game::TEST_CLASS_HASH,
            player_enrollment::TEST_CLASS_HASH
        ];

        // deploy world with models
        let world = spawn_test_world(models);

        // deploy systems contract
        let contract_address = world
            .deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());
        let actions_system = IActionsDispatcher { contract_address };

        starknet::testing::set_contract_address(caller);

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
        caller.print();

        starknet::testing::set_contract_address(caller);

        // models
        let mut models = array![
            game::TEST_CLASS_HASH,
            player_enrollment::TEST_CLASS_HASH
        ];

        // deploy world with models
        let world = spawn_test_world(models);

        // deploy systems contract
        let contract_address = world
            .deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.spawn(1); // first game id is 0 
        actions_system.spawn(1); // next game id is 1

        'castle1Health before fortify:'.print();
        get!(world, 1, (Game)).castle1Health.print();
        get!(world, 1, (Game)).northGeneral.print();

        change_game_stage(world, 1, 1);

        // call fortify on north castle
        actions_system.fortify(1, 1, 10);

        assert(get!(world, 1, (Game)).castle1Health == INITIAL_CASTLE_HEALTH + 100, 'castle1Health not +100');

        change_game_stage(world, 1, 0);
        // call unassignGeneral - no longer general
        actions_system.unassignGeneral(1, 1);

        assert(get!(world, 1, (Game)).northGeneral == starknet::contract_address_const::<0x0>(), 'northGeneral not 0x0');

        change_game_stage(world, 1, 1);
        actions_system.fortify(1, 1, 10); // this line should not do anything
        
        'castle1Health after fortify:'.print();
        get!(world, 1, (Game)).castle1Health.print();

        assert(get!(world, 1, (Game)).castle1Health == INITIAL_CASTLE_HEALTH + 100, 'castle1Health not +100');

        change_game_stage(world, 1, 0);
        // call assignGeneral
        actions_system.assignGeneral(1, 2);

        change_game_stage(world, 1, 1);
        // call fortify
        actions_system.fortify(1, 2, 5);

        assert(get!(world, 1, (Game)).castle2Health == INITIAL_CASTLE_HEALTH + 50, 'castle2Health not +50');
    }

    #[test]
    #[available_gas(300000000)]
    #[should_panic]
    fn test_sharpen_failure() {
        // caller
        let mut caller = starknet::contract_address_const::<0x0>();

        // models
        let mut models = array![
            game::TEST_CLASS_HASH,
            player_enrollment::TEST_CLASS_HASH,
            player::TEST_CLASS_HASH
        ];

        // deploy world with models
        let world = spawn_test_world(models);

        // deploy systems contract
        let contract_address = world
            .deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());
        let actions_system = IActionsDispatcher { contract_address };

        caller = starknet::contract_address_const::<'GG'>();
        starknet::testing::set_contract_address(caller);

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
        let mut caller = starknet::contract_address_const::<0x0>();

        // models
        let mut models = array![
            game::TEST_CLASS_HASH,
            player_enrollment::TEST_CLASS_HASH,
            player::TEST_CLASS_HASH
        ];

        // deploy world with models
        let world = spawn_test_world(models);

        // deploy systems contract
        let contract_address = world
            .deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.spawn(1);
        actions_system.spawn(1);

        change_game_stage(world, 1, 2);

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
        // caller
        let mut caller = starknet::contract_address_const::<0x0>();

        // models
        let mut models = array![
            game::TEST_CLASS_HASH,
            player_enrollment::TEST_CLASS_HASH,
            player::TEST_CLASS_HASH
        ];

        // deploy world with models
        let world = spawn_test_world(models);

        // deploy systems contract
        let contract_address = world
            .deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());
        let actions_system = IActionsDispatcher { contract_address };

        caller = starknet::contract_address_const::<'GG'>();
        starknet::testing::set_contract_address(caller);

        actions_system.attack(1, 1);
    }

    #[test]
    #[available_gas(300000000)]
    #[should_panic(expected: ('Attack on cooldown', 'ENTRYPOINT_FAILED'))]
    fn test_attack_cooldown() {
        // caller
        let mut caller = starknet::contract_address_const::<0x0>();

        // models
        let mut models = array![
            game::TEST_CLASS_HASH,
            player_enrollment::TEST_CLASS_HASH,
            player::TEST_CLASS_HASH
        ];

        // deploy world with models
        let world = spawn_test_world(models);

        // deploy systems contract
        let contract_address = world
            .deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());
        let actions_system = IActionsDispatcher { contract_address };

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

        let mut game = get!(world, 1, (Game));
        game.castle1Health = 1000;
        game.castle2Health = 1000;
        set!(world, (game));

        caller = starknet::contract_address_const::<'GG'>();
        starknet::testing::set_contract_address(caller);

        // call enroll
        actions_system.enroll(1);

        change_game_stage(world, 1, 2);

        starknet::testing::set_block_timestamp(1000);
        starknet::testing::set_block_number(5);

        actions_system.attack(1, 1);

        starknet::testing::set_block_timestamp(2000);
        starknet::testing::set_block_number(6);
        
        // this one should trigger cooldown notice
        actions_system.attack(1, 1);
    }

    #[test]
    #[available_gas(300000000)]
    #[should_panic(expected: ('Not in attack stage', 'ENTRYPOINT_FAILED'))]
    fn test_attack() {
        // caller
        let mut caller = starknet::contract_address_const::<0x0>();

        // models
        let mut models = array![
            game::TEST_CLASS_HASH,
            player_enrollment::TEST_CLASS_HASH,
            player::TEST_CLASS_HASH
        ];

        // deploy world with models
        let world = spawn_test_world(models);

        // deploy systems contract
        let contract_address = world
            .deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());
        let actions_system = IActionsDispatcher { contract_address };

        caller = starknet::contract_address_const::<'GG'>();
        starknet::testing::set_contract_address(caller);

        // call enroll
        actions_system.enroll(1);
        actions_system.attack(1, 1);
    }

    #[test]
    #[available_gas(300000000)]
    #[should_panic(expected: ('Too early for battle stage', 'ENTRYPOINT_FAILED'))]
    fn test_attack_fail_stage() {
        // caller
        let mut caller = starknet::contract_address_const::<0x0>();

        // models
        let mut models = array![
            game::TEST_CLASS_HASH,
            player_enrollment::TEST_CLASS_HASH,
            player::TEST_CLASS_HASH
        ];

        // deploy world with models
        let world = spawn_test_world(models);

         // deploy systems contract
        let contract_address = world
            .deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());
        let actions_system = IActionsDispatcher { contract_address };

        caller = starknet::contract_address_const::<'GG'>();
        starknet::testing::set_contract_address(caller);

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
        let mut caller = starknet::contract_address_const::<0x0>();

        // models
        let mut models = array![
            game::TEST_CLASS_HASH,
            player_enrollment::TEST_CLASS_HASH,
            player::TEST_CLASS_HASH,
            game_world::TEST_CLASS_HASH
        ];

        // deploy world with models
        let world = spawn_test_world(models);

        // deploy systems contract
        let contract_address = world
            .deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());
        let actions_system = IActionsDispatcher { contract_address };

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

        caller = starknet::contract_address_const::<'GG'>();
        starknet::testing::set_contract_address(caller);

        let mut game = get!(world, 1, (Game));
        game.castle1Health = 1000;
        game.castle2Health = 1000;
        set!(world, (game));

        // call enroll
        actions_system.enroll(1);

        let mut player = get!(world, (caller, 1), (Player));

        //change game state to battle
        change_game_stage(world, 1, 2);

        starknet::testing::set_block_timestamp(1000);
        starknet::testing::set_block_number(5);

        // call attack
        actions_system.attack(1, 2);

        assert(get!(world, 1, (Game)).castle2Health == 960, 'castle2Health not 960');

        player.gold = 100;
        set!(world, (player));
        actions_system.sharpen(1);

        starknet::testing::set_block_timestamp(23000);
        starknet::testing::set_block_number(8);

        actions_system.attack(1, 1);

        assert(get!(world, 1, (Game)).castle1Health == 928, 'castle1Health not 928');
        assert(!get!(world, (caller, 1), (Player)).sharpened, 'sharpened not false');
    }

    #[test]
    #[available_gas(300000000)]
    fn test_player_directory() {
        // caller
        let mut caller = starknet::contract_address_const::<'AB'>();

        // models
        let mut models = array![
            game::TEST_CLASS_HASH,
            player_enrollment::TEST_CLASS_HASH,
            game_players::TEST_CLASS_HASH,
            player::TEST_CLASS_HASH
        ];

        // deploy world with models
        let world = spawn_test_world(models);

        // deploy systems contract
        let contract_address = world
            .deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());

        let actions_system = IActionsDispatcher { contract_address };

        starknet::testing::set_contract_address(caller);

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

        // call enroll
        actions_system.enroll(0);

        // check that nextPlayerIndex should now update to 3 and the new player should get 2 as the index
        assert(get!(world, (caller, 0), (PlayerEnrollment)).index == 2, 'index not 2');
        assert(get!(world, (0, 2), (GamePlayers)).address == caller, 'address not caller');
        assert(get!(world, 0, (Game)).nextPlayerIndex == 3, 'nextPlayerIndex not 3');
        assert(get!(world, (caller, 0), (PlayerEnrollment)).enrolled == true, 'enrolled not true');
    }

    #[test]
    #[available_gas(300000000)]
    fn test_list_players() {
        // caller
        let mut caller = starknet::contract_address_const::<'AB'>();

        // models
        let mut models = array![
            game::TEST_CLASS_HASH,
            player_enrollment::TEST_CLASS_HASH,
            game_players::TEST_CLASS_HASH,
            player::TEST_CLASS_HASH
        ];

        // deploy world with models
        let world = spawn_test_world(models);

        // deploy systems contract
        let mut contract_address = world
            .deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());

        let actions_system = IActionsDispatcher { contract_address };

        starknet::testing::set_contract_address(caller);

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

        // models
        let mut models = array![
            game::TEST_CLASS_HASH,
            player_enrollment::TEST_CLASS_HASH,
            game_players::TEST_CLASS_HASH,
            player::TEST_CLASS_HASH
        ];

        // deploy world with models
        let world = spawn_test_world(models);

        // deploy systems contract
        let mut contract_address = world
            .deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());

        let actions_system = IActionsDispatcher { contract_address };

        starknet::testing::set_contract_address(caller);

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

        // models
        let mut models = array![
            game::TEST_CLASS_HASH,
            player_enrollment::TEST_CLASS_HASH,
            game_players::TEST_CLASS_HASH,
            player::TEST_CLASS_HASH
        ];

        // deploy world with models
        let world = spawn_test_world(models);

        // deploy systems contract
        let mut contract_address = world
            .deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());

        let actions_system = IActionsDispatcher { contract_address };

        starknet::testing::set_contract_address(caller);

        actions_system.spawn(1);

        actions_system.set_nickname(0, 'AB');

        assert(get!(world, (caller, 0), (Player)).nickname == 'AB', 'nickname not AB');

        caller = starknet::contract_address_const::<'GG'>();
        starknet::testing::set_contract_address(caller);

        // call enroll
        actions_system.enroll(0);

        // set nickname
        actions_system.set_nickname(0, 'GG');

        assert(get!(world, (caller, 0), (Player)).nickname == 'GG', 'nickname not GG');
    }

}