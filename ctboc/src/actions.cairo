use ctboc::models::{Player, Game};
use starknet::{ContractAddress};
use ctboc::game_entropy::{GameEntropy};

// define the interface
#[dojo::interface]
trait IActions {
    fn spawn(side: u8);
    
    // Staging
    fn enroll(gameId: u128);
    fn assignGeneral(gameId: u128, castle: u8);
    fn unenroll(gameId: u128);
    fn unassignGeneral(gameId: u128, castle: u8);
    fn fortify(gameId: u128, castle: u8, amount: u16);
    
    // Battle stage
    fn sharpen(gameId: u128);
    fn attack(gameId: u128, castle: u8);
    fn pay(gameId: u128, recipient: ContractAddress, amount: u16);
    
    // End stage
    fn buyrank(gameId: u128, ranks: u8);
    
    // Change game stage
    fn change_game_stage(gameId: u128, stage: u8);
    fn dev_change_game_stage(gameId: u128, stage: u8);
    
    // Get list of players
    fn get_list_of_players(gameId: u128);
    
    // Manipulate player nickname
    fn set_nickname(gameId: u128, nickname: felt252);
    fn get_nickname(gameId: u128, address: ContractAddress) -> felt252;
}

// dojo decorator
#[dojo::contract]
mod actions {
    use starknet::{ContractAddress, get_caller_address};
    use ctboc::models::{Game, PlayerEnrollment, Player, GlobalPlayerStats, GameWorld, GamePlayers, PlayerCooldowns};
    use ctboc::utils::{get_attack_damage};
    use super::IActions;
    use ctboc::game_settings::{INITIAL_CASTLE_HEALTH, SWORD_COOLDOWN,
        GENERAL_COOLDOWN, GENERAL_STARTING_GOLD, STARTING_RANK
        , ENROLLMENT_STAGE_DELAY, BATTLE_STAGE_DELAY};
    use ctboc::game_entropy::{GameEntropy};

    #[derive(Drop, starknet::Event)]
    struct Strike {
        player: ContractAddress,
        gameId: u128,
        target: u8,
        damage: u32
    }

    #[derive(Drop, starknet::Event)]
    struct PlayerNickname {
        player: ContractAddress,
        gameId: u128,
        nickname: felt252
    }

    #[derive(Drop, starknet::Event)]
    struct Payment {
        gameId: u128,
        sender: ContractAddress,
        receiver: ContractAddress,
        amount: u16 
    }

    #[derive(Drop, starknet::Event)]
    struct GamePlayersList {
        gameId: u128,
        players: Array<ContractAddress>
    }

    // impl: implement functions specified in trait
    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {

        // spawn: spawn a new game world
        fn spawn(world: IWorldDispatcher, side: u8) {

            // Get the address of the current caller, possibly the player's address.
            let playerAddress = get_caller_address();

            let mut game_world = get!(world, 'game', (GameWorld));

            let block = starknet::get_block_info().unbox();

            // Create a new game
            let mut game = Game {
                gameId: game_world.nextGameId,
                numPlayers: 1, // counting the initiating player themselves
                northGeneral: starknet::contract_address_const::<0x0>(),
                southGeneral: starknet::contract_address_const::<0x0>(),
                castle1Health: INITIAL_CASTLE_HEALTH,
                castle2Health: INITIAL_CASTLE_HEALTH,
                stage: 0, // enrollment
                startTime: block.block_timestamp.into(),
                nextPlayerIndex: 1
            };

            let mut player = get!(world, (playerAddress, game.gameId), (Player));

            if side == 1 {
                game.northGeneral = playerAddress;
            } else if side == 2 {
                game.southGeneral = playerAddress;
            }

            game_world.nextGameId += 1;

            let player_enrollment = PlayerEnrollment {
                address: playerAddress,
                gameId: game.gameId,
                enrolled: true,
                index: 0
            };

            let game_players = GamePlayers {
                gameId: game.gameId,
                index: 0,
                address: playerAddress,
            };

            player = Player {
                address: playerAddress,
                gameId: game.gameId,
                isGeneral: true,
                gold: 0,
                sharpened: false,
                totalStrikes: 0,
                totalStrikeDamage: 0,
                nickname: 0
            };

            // Update the world status, add a player to the count and set the player's enrollment status to true.
            set!(world, (game));
            set!(world, (game_world));
            set!(world, (player_enrollment));
            set!(world, (player));
            set!(world, (game_players));
        }

        // ContractState is defined by system decorator expansion
        fn enroll(world: IWorldDispatcher, gameId: u128) {

            InternalFunctions::_validate_game_id(world, gameId);

            // Get the address of the current caller, possibly the player's address.
            let playerAddress = get_caller_address();

            // Retrieve the player's current enrollment status for the game
            let mut game = get!(world, gameId, (Game));

            let mut enrollment_status = get!(world, (playerAddress, gameId), (PlayerEnrollment));
            let mut player = get!(world, (playerAddress, gameId), (Player));
            let mut game_players = get!(world, (gameId, enrollment_status.index), (GamePlayers));

            player = Player {
                address: playerAddress,
                gameId: gameId,
                isGeneral: false,
                gold: 0,
                sharpened: false,
                totalStrikes: 0,
                totalStrikeDamage: 0,
                nickname: 0
            };

            // Update the enrollment_status if player is not already enrolled with new index if player is not
            // already part of the player directory
            if !enrollment_status.enrolled && game_players.address != playerAddress {

                enrollment_status.enrolled = true;
                enrollment_status.index = game.nextPlayerIndex; // set the index for this player
                game.numPlayers += 1;
                game.nextPlayerIndex += 1;

                game_players.address = playerAddress;
                game_players.index = enrollment_status.index;

            } else if !enrollment_status.enrolled && game_players.address == playerAddress {
                enrollment_status.enrolled = true;
                game.numPlayers += 1;
            }

            // Update the world status, add a player to the count and set the player's enrollment status to true.
            //set!(world, PlayerEnrollment { address: playerAddress, gameId: gameId, enrolled: true });

            set!(world, (enrollment_status));
            set!(world, (game));
            set!(world, (player));
            set!(world, (game_players));

            // Emit an event to the world to notify about the player's enrollment.
            //emit!(world, Enrollment { player: playerAddress, index: enrollment_status.index, numPlayers: game.numPlayers });
        }

        fn unenroll(world: IWorldDispatcher, gameId: u128) {

            InternalFunctions::_validate_game_id(world, gameId);

            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();

            // Retrieve the player's current enrollment status for the game
            let mut game = get!(world, (gameId), (Game));

            let mut enrollment_status = get!(world, (player, gameId), (PlayerEnrollment));

            // Update the enrollment_status if player is enrolled
            if enrollment_status.enrolled {
            
                game.numPlayers -= 1;
                enrollment_status.enrolled = false;

                // Update the world status, add a player to the count and set the player's enrollment status to true.
                set!(world, (enrollment_status));
                set!(world, (game));

                //emit!(world, Enrollment { player, index: enrollment_status.index, numPlayers: game.numPlayers });
            }
        }

        fn assignGeneral(world: IWorldDispatcher, gameId: u128, castle: u8) {

            InternalFunctions::_validate_game_id(world, gameId);

            // Get the address of the current caller, possibly the player's address.
            let playerAddress = get_caller_address();

            // Retrieve the player's current enrollment status for the game
            let mut game = get!(world, (gameId), (Game));
            let mut player_enrollment = get!(world, (playerAddress, gameId), (PlayerEnrollment));
            let mut player = get!(world, (playerAddress, gameId), (Player));
            let mut game_players = get!(world, (gameId, player_enrollment.index), (GamePlayers));

            assert(game.stage == 0, 'Not in enrollment stage');

            assert(game.northGeneral != playerAddress && game.southGeneral != playerAddress, 'Already a general');

            assert(!player_enrollment.enrolled, 'Already a sellsword');

            assert(castle == 1 || castle == 2, 'Invalid castle');
            
            assert(castle == 1 && game.northGeneral == starknet::contract_address_const::<0x0>() || castle == 2 && game.southGeneral == starknet::contract_address_const::<0x0>(), 'castle already has general');

            // Update the enrollment_status if player is not already enrolled
            if castle == 1 && game.northGeneral == starknet::contract_address_const::<0x0>() && !player_enrollment.enrolled {
                game.northGeneral = playerAddress;
                if game_players.address != playerAddress {
                    player_enrollment.index = game.nextPlayerIndex;
                    game.nextPlayerIndex += 1;
                    game_players.address = playerAddress;
                    game_players.index = player_enrollment.index;
                }
            } else if castle == 2 && game.southGeneral == starknet::contract_address_const::<0x0>() && !player_enrollment.enrolled {
                game.southGeneral = playerAddress;
                if game_players.address != playerAddress {
                    player_enrollment.index = game.nextPlayerIndex;
                    game.nextPlayerIndex += 1;
                    game_players.address = playerAddress;
                    game_players.index = player_enrollment.index;
                }
            }

            game.numPlayers += 1;
            player_enrollment.enrolled = true;
            player.isGeneral = true;
            player.sharpened = false;

            set!(world, (game));
            set!(world, (player_enrollment));
            set!(world, (player));
            set!(world, (game_players));

            //emit!(world, Enrollment { player: playerAddress, index: player_enrollment.index, numPlayers: game.numPlayers });
        }

        fn unassignGeneral(world: IWorldDispatcher, gameId: u128, castle: u8) {

            InternalFunctions::_validate_game_id(world, gameId);

            // Get the address of the current caller, possibly the player's address.
            let playerAddress = get_caller_address();

            // Retrieve the player's current enrollment status for the game
            let mut game = get!(world, (gameId), (Game));
            let mut player_enrollment = get!(world, (playerAddress, gameId), (PlayerEnrollment));
            let mut player = get!(world, (playerAddress, gameId), (Player));

            assert(game.stage == 0, 'Not in enrollment stage');

            assert(player_enrollment.enrolled, 'Not enrolled in game');
            assert(player.isGeneral, 'Not a general');
            assert(castle == 1 || castle == 2, 'Invalid castle');
            assert(castle == 1 && game.northGeneral == playerAddress || castle == 2 && game.southGeneral == playerAddress, 'Not general of castle');

            // Update the enrollment_status if player is not already enrolled
            if castle == 1 && game.northGeneral == playerAddress {
                game.northGeneral = starknet::contract_address_const::<0x0>();
            } else if castle == 2 && game.southGeneral == playerAddress {
                game.southGeneral = starknet::contract_address_const::<0x0>();
            }
            
            game.numPlayers -= 1;
            player_enrollment.enrolled = false;
            player.isGeneral = false;
            
            set!(world, (game));
            set!(world, (player_enrollment));
            set!(world, (player));

            //emit!(world, Enrollment { player: playerAddress, index: player_enrollment.index, numPlayers: game.numPlayers });
        }

        fn fortify(world: IWorldDispatcher, gameId: u128, castle: u8, amount: u16) {

            InternalFunctions::_validate_game_id(world, gameId);

            // Get the address of the current caller, possibly the player's address.
            let playerAddress = get_caller_address();

            let mut player = get!(world, (playerAddress, gameId), (Player));

            // Retrieve the player's current enrollment status for the game
            let mut game = get!(world, (gameId), (Game));

            assert(game.stage == 1, 'Not in staging phase');
            assert(amount > 0 && amount <= player.gold, 'Invalid amount');
            assert(castle == 1 || castle == 2, 'Invalid castle');
            assert(castle == 1 && game.northGeneral == playerAddress || castle == 2 && game.southGeneral == playerAddress, 'Not general of this castle');

            // Fortify the castle if the player is the general for the castle
            if castle == 1 && game.northGeneral == playerAddress {
                game.castle1Health += amount.into() * 2;
                player.gold -= amount;
                set!(world, (player));
                set!(world, (game));
                //emit!(world, Fortification { general: player, castle: castle, amount: amount });
            } else if castle == 2 && game.southGeneral == playerAddress {
                game.castle2Health += amount.into() * 2;
                player.gold -= amount;
                set!(world, (player));
                set!(world, (game));
                //emit!(world, Fortification { general: player, castle: castle, amount: amount });
            }
        }

        fn attack(world: IWorldDispatcher, gameId: u128, castle: u8) {

            InternalFunctions::_validate_game_id(world, gameId);

            // Get the address of the current caller, possibly the player's address.
            let playerAddress = get_caller_address();

            // Retrieve current block timestamp
            let info = starknet::get_block_info().unbox();

            let player_enrollment = get!(world, (playerAddress, gameId), (PlayerEnrollment));

            assert(player_enrollment.enrolled, 'Not enrolled in game');

            let mut player_cooldown = get!(world, (playerAddress, gameId), (PlayerCooldowns));
            let mut player = get!(world, (playerAddress, gameId), (Player));

            if player_cooldown.lastStrike != 0 {
                if player.isGeneral && player_cooldown.lastStrike + GENERAL_COOLDOWN.into() > info.block_timestamp.into() {
                    let cooldown = player_cooldown.lastStrike + GENERAL_COOLDOWN.into() - info.block_timestamp.into();
                    // let remaining_cooldown: u16 = cooldown.try_into().unwrap();
                    assert(false, 'Attack on cooldown');
                } else if player_cooldown.lastStrike + SWORD_COOLDOWN.into() > info.block_timestamp.into() {
                    let cooldown = player_cooldown.lastStrike + SWORD_COOLDOWN.into() - info.block_timestamp.into();
                    // let remaining_cooldown: u16 = cooldown.try_into().unwrap();
                    assert(false, 'Attack on cooldown');
                }
            }

            // Retrieve the player's current enrollment status for the game
            let mut game = get!(world, (gameId), (Game));
            let game_world = get!(world, 'game', (GameWorld));
            let mut global_player_stats = get!(world, (playerAddress), (GlobalPlayerStats));

            if global_player_stats.rank < STARTING_RANK {
                global_player_stats.rank = STARTING_RANK;
            }

            assert(game.stage == 2, 'Not in attack stage');

            assert(castle == 1 || castle == 2, 'Invalid castle');

            if castle == 1 {
                assert(game.northGeneral != playerAddress, 'Cannot attack own castle');
            } else if castle == 2 {
                assert(game.southGeneral != playerAddress, 'Cannot attack own castle');
            } else {
                assert(false, 'Invalid castle');
            }

            // Calculate the damage dealt to the castle
            let damage = get_attack_damage(player.sharpened, global_player_stats.rank, game_world.entropy);

            // Attack the castle
            if castle == 1 {
                game.castle1Health -= damage;
            } else if castle == 2 {
                game.castle2Health -= damage;
            }

            player.totalStrikes += 1;
            player.totalStrikeDamage += damage;
            player.sharpened = false;

            global_player_stats.totalStrikes += 1;
            global_player_stats.totalStrikeDamage += damage.into();

            player_cooldown.lastStrike = info.block_timestamp.into();

            set!(world, (game));
            set!(world, (player));
            set!(world, (global_player_stats));
            set!(world, (player_cooldown));
            emit!(world, Strike { player: playerAddress, gameId: gameId, target: castle, damage: damage });
        }

        fn sharpen(world: IWorldDispatcher, gameId: u128) {

            InternalFunctions::_validate_game_id(world, gameId);

            // Get the address of the current caller, possibly the player's address.
            let playerAddress = get_caller_address();

            // Retrieve the player's current enrollment status for the game
            let mut player = get!(world, (playerAddress, gameId), (Player));
            let game = get!(world, (gameId), (Game));

            assert(game.stage == 2, 'Not in attack stage');

            assert(player.gold >= 50, 'Need 50 gold to sharpen');

            assert(!player.sharpened, 'Already sharpened');

            // Sharpen the player's sword if it is not already sharpened and the player has at least 50 gold
            if !player.sharpened && player.gold >= 50 {
                player.sharpened = true;
                player.gold -= 50;
                set!(world, (player));
                //emit!(world, Sharpening {player: playerAddress});
            }
        }

        fn pay(world: IWorldDispatcher, gameId: u128, recipient: ContractAddress, amount: u16) {

            InternalFunctions::_validate_game_id(world, gameId);

            // Get the address of the current caller, possibly the player's address.
            let playerAddress = get_caller_address();

            // Retrieve the player's current enrollment status for the game
            let mut player = get!(world, (playerAddress, gameId), (Player));

            assert(player.gold >= amount, 'Not enough gold');

            let mut recipientPlayer = get!(world, (recipient, gameId), (Player));

            // Pay the recipient if the player has enough gold
            if player.gold >= amount {
                player.gold -= amount;
                set!(world, (player));
                recipientPlayer.gold += amount;
                set!(world, (recipientPlayer));
                emit!(world, Payment { gameId: gameId, sender: playerAddress, receiver: recipient, amount: amount});
            }
        }

        fn buyrank(world: IWorldDispatcher, gameId: u128, ranks: u8) {

            InternalFunctions::_validate_game_id(world, gameId);

            // Get the address of the current caller, possibly the player's address.
            let playerAddress = get_caller_address();

            // Retrieve the player's current enrollment status for the game
            let mut player = get!(world, (playerAddress, gameId), (Player));
            let game = get!(world, (gameId), (Game));
            let mut playerStats = get!(world, (playerAddress), (GlobalPlayerStats));

            assert(game.stage == 3, 'Not in end stage yet');
            assert(player.gold >= ranks.into() * 500, 'Not enough gold');

            // Increase player rank if the player has enough gold
            if player.gold >= ranks.into() * 500 {
                player.gold -= ranks.into() * 500;
                playerStats.rank += ranks.into();
                set!(world, (player));
                set!(world, (playerStats));
            }
        }

        fn change_game_stage(world: IWorldDispatcher, gameId: u128, stage: u8) {

            InternalFunctions::_validate_game_id(world, gameId);
            
            assert(stage >= 0 && stage < 4, 'Invalid game stage');

            let game = get!(world, (gameId), (Game));

            assert(stage >= game.stage, 'Cannot go back in game stage');

            let block = starknet::get_block_info().unbox();

            if stage == 1 {
                // wait X time before going from staging to enrollment stage
                if block.block_timestamp.into() >= game.startTime + ENROLLMENT_STAGE_DELAY.into() {
                    InternalFunctions::_change_game_stage(self.world_dispatcher.read(), gameId, stage);
                }
                else {
                    assert(false, 'Too early for enrollment stage');
                }
            } else if stage == 2 {
                // wait X time before going from enrollment to battle stage
                if block.block_timestamp.into() >= game.startTime + ENROLLMENT_STAGE_DELAY.into() + BATTLE_STAGE_DELAY.into() {
                    InternalFunctions::_change_game_stage(self.world_dispatcher.read(), gameId, stage);
                }
                else {
                    assert(false, 'Too early for battle stage');
                }
            } else if stage == 3 {
                // at least one castle should have 0 HP left
                if game.castle1Health == 0 || game.castle2Health == 0 {
                    InternalFunctions::_change_game_stage(self.world_dispatcher.read(), gameId, stage);
                }
                else {
                    assert(false, 'Neither castle has fallen yet');
                }
            }
        }

        fn dev_change_game_stage(world: IWorldDispatcher, gameId: u128, stage: u8) {

            InternalFunctions::_validate_game_id(world, gameId);
            
            assert(stage >= 0 && stage < 4, 'Invalid game stage');

            let game = get!(world, (gameId), (Game));

            let block = starknet::get_block_info().unbox();

            if stage == 1 {
                InternalFunctions::_change_game_stage(world, gameId, stage);
            } else if stage == 2 {
                InternalFunctions::_change_game_stage(world, gameId, stage);
            } else if stage == 3 {
                InternalFunctions::_change_game_stage(world, gameId, stage);
            }
        }

        fn get_list_of_players(world: IWorldDispatcher, gameId: u128) {

            InternalFunctions::_validate_game_id(world, gameId);
            
            let mut players = ArrayTrait::new();
        
            let game = get!(world, (gameId), (Game));
        
            let mut i = 0;
            
            loop {
                if i >= game.numPlayers {
                    break;
                }
                let player = get!(world, (gameId, i), (GamePlayers));
                players.append(player.address);
                i += 1;
            };
        
            emit!(world, GamePlayersList { gameId: gameId, players: players });
        }

        fn set_nickname(world: IWorldDispatcher, gameId: u128, nickname: felt252) {

            InternalFunctions::_validate_game_id(world, gameId);

            let playerAddress = get_caller_address();

            let PlayerEnrollment = get!(world, (playerAddress, gameId), (PlayerEnrollment));

            assert(PlayerEnrollment.enrolled, 'Not enrolled in game');

            let mut player = get!(world, (playerAddress, gameId), (Player));

            let oldNickname = player.nickname;

            player.nickname = nickname;

            set!(world, (player));
            //emit!(world, PlayerNickname { gameId: gameId, player: playerAddress, oldNickname: oldNickname, newNickname: player.nickname });
        }

        fn get_nickname(world: IWorldDispatcher, gameId: u128, address: ContractAddress) -> felt252 {
            let PlayerEnrollment = get!(world, (address, gameId), (PlayerEnrollment));
            assert(PlayerEnrollment.enrolled, 'Address not enrolled in game');
            let player = get!(world, (address, gameId), (Player));
            assert(player.nickname != 0, 'No nickname defined');
            emit!(world, PlayerNickname {player: address, gameId: gameId, nickname: player.nickname});
            return player.nickname;
        }

    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {

        fn _validate_game_id(world: IWorldDispatcher, gameId: u128) {
            let world = get!(world, 'game', (GameWorld));
            assert(gameId < world.nextGameId, 'invalid game id provided');
        }

        fn _change_game_stage(world: IWorldDispatcher, gameId: u128, stage: u8) {

            InternalFunctions::_validate_game_id(world, gameId);
    
            // Retrieve the player's current enrollment status for the game
            let mut game = get!(world, (gameId), (Game));
    
            if stage == 1 {
                // give gold to generals if their gold is 0
                let mut northGeneral = get!(world, (game.northGeneral, gameId), (Player));
                let mut southGeneral = get!(world, (game.southGeneral, gameId), (Player));
                if northGeneral.address != starknet::contract_address_const::<0x0>() && northGeneral.gold == 0 {
                    northGeneral.gold += GENERAL_STARTING_GOLD;
                    set!(world, (northGeneral));
                }
                if southGeneral.address != starknet::contract_address_const::<0x0>() && southGeneral.gold == 0 {
                    southGeneral.gold += GENERAL_STARTING_GOLD;
                    set!(world, (southGeneral));
                }
            }
            
            game.stage = stage;
    
            set!(world, (game));
            //emit!(world, GameStageChange { gameId: gameId, stage: stage });
        }
    }

}