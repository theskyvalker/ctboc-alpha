use ctboc::models::{Player, Game};
use starknet::{ContractAddress};
use ctboc::game_entropy::{GameEntropy};

// define the interface
#[starknet::interface]
trait IActions<T> {
    fn set_config(
        ref self: T,
        feeTokenAddress: ContractAddress,
        pixelBannersAddress: ContractAddress,
        adminAddress: ContractAddress,
        treasuryAddress: ContractAddress
    );
    fn spawn(ref self: T, side: u8);

    // Staging stage
    fn enroll(ref self: T, gameId: u128);
    fn assignGeneral(ref self: T, gameId: u128, castle: u8);
    fn unenroll(ref self: T, gameId: u128);
    fn unassignGeneral(ref self: T, gameId: u128, castle: u8);
    fn fortify(ref self: T, gameId: u128, castle: u8, amount: u16);

    // Battle stage
    fn sharpen(ref self: T, gameId: u128);
    fn attack(ref self: T, gameId: u128, castle: u8);
    fn pay(ref self: T, gameId: u128, recipient: ContractAddress, amount: u16);

    // End stage
    fn buyrank(ref self: T, gameId: u128, ranks: u8);

    // Change game stage
    fn change_game_stage(ref self: T, gameId: u128, stage: u8);

    // Get list of players
    fn get_list_of_players(ref self: T, gameId: u128);

    // Manipulate player nickname
    fn set_nickname(ref self: T, gameId: u128, nickname: felt252);
    fn get_nickname(ref self: T, gameId: u128, address: ContractAddress) -> felt252;

    // Treasury related functionalities
    fn distribute_prizes(ref self: T, gameId: u128);
    fn get_treasury_balance(ref self: T, gameId: u128) -> u256;


    // Admin-only functions
    fn withdraw_treasury_funds(ref self: T);
    fn set_castle_hp(ref self: T, gameId: u128, castle: u8, hp: u32);
    fn dev_change_game_stage(ref self: T, gameId: u128, stage: u8);
    fn withdraw_treasury_funds_amount(ref self: T, amount: u256);
}

// dojo decorator
#[dojo::contract]
pub mod actions {
    use super::IActions;
    use starknet::{ContractAddress, get_caller_address};
    use ctboc::models::{
        Game, PlayerEnrollment, Player, GlobalPlayerStats, GameWorld, GamePlayers, PlayerCooldowns
    };
    use ctboc::utils::{
        get_attack_damage, _check_and_transfer_fees, ETH_TO_WEI, _pay_player
    };
    use ctboc::game_settings::{
        INITIAL_CASTLE_HEALTH, SWORD_COOLDOWN, GENERAL_COOLDOWN, GENERAL_STARTING_GOLD,
        STARTING_RANK, ENROLLMENT_STAGE_DELAY, BATTLE_STAGE_DELAY, COST_GENERAL, COST_SELLSWORD,
        MAXIMUM_RANK, TREASURY_CUT_PERCENTAGE
    };
    use ctboc::game_entropy::{GameEntropy};
    use debug::PrintTrait;

    use dojo::model::{ModelStorage, ModelValueStorage};
    use dojo::event::EventStorage;

    // #[event]
    // #[derive(Drop, starknet::Event)]
    // enum Event {
    //     Strike: Strike,
    //     Enrollment: Enrollment,
    //     Unenrollment: Unenrollment,
    //     Fortification: Fortification,
    //     Sharpening: Sharpening,
    //     PlayerNickname: PlayerNickname,
    //     Payment: Payment,
    //     GameStageChange: GameStageChange,
    //     GamePlayersList: GamePlayersList,
    //     TreasuryBalance: TreasuryBalance
    // }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        TreasuryBalance: TreasuryBalance
    }

    #[derive(Drop, starknet::Event)]
    pub struct TreasuryBalance {
        pub gameId: u128,
        pub balance: u256
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct Strike {
        #[key]
        pub player: ContractAddress,
        #[key]
        pub gameId: u128,
        pub target: u8,
        pub damage: u32
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct Spawn {
        #[key]
        pub gameId: u128,
        pub player: ContractAddress,
        pub general: u8
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct Enrollment {
        #[key]
        pub player: ContractAddress,
        #[key]
        pub gameId: u128,
        pub general: u8,
        pub index: u32,
        pub numPlayers: u32
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct Unenrollment {
        #[key]
        pub player: ContractAddress,
        #[key]
        pub gameId: u128,
        pub general: u8,
        pub index: u32,
        pub numPlayers: u32
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct Fortification {
        #[key]
        pub general: ContractAddress,
        #[key]
        pub gameId: u128,
        pub castle: u8,
        pub amount: u16
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct Sharpening {
        #[key]
        pub player: ContractAddress,
        pub gameId: u128
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct PlayerNickname {
        #[key]
        pub player: ContractAddress,
        #[key]
        pub gameId: u128,
        pub oldNickname: felt252,
        pub newNickname: felt252
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct Payment {
        #[key]
        pub gameId: u128,
        #[key]
        pub sender: ContractAddress,
        pub receiver: ContractAddress,
        pub amount: u16
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct GameStageChange {
        #[key]
        pub gameId: u128,
        pub stage: u8
    }

    #[derive(Drop, Serde)]
    #[dojo::event]
    pub struct GamePlayersList {
        #[key]
        pub gameId: u128,
        pub players: Array<ContractAddress>
    }

    // impl: implement functions specified in trait
    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        // set_config: set the game configuration
        fn set_config(
            ref self: ContractState,
            feeTokenAddress: ContractAddress,
            pixelBannersAddress: ContractAddress,
            adminAddress: ContractAddress,
            treasuryAddress: ContractAddress
        ) {
            let mut world = self.world_default();
            
            let mut game_world: GameWorld = world.read_model('game');
            
            game_world.feeTokenAddress = feeTokenAddress;
            game_world.pixelBannersAddress = pixelBannersAddress;
            game_world.adminAddress = adminAddress;
            game_world.treasuryAddress = treasuryAddress;
            
            world.write_model(@game_world);
        }

        // spawn: spawn a new game world
        fn spawn(ref self: ContractState, side: u8) {
            // Get the default world.
            let mut world = self.world_default();

            // Get the address of the current caller, possibly the player's address.
            let playerAddress = get_caller_address();

            // let mut game_world = get!(world, 'game', (GameWorld));
            let mut game_world: GameWorld = world.read_model('game');

            let block = starknet::get_block_info().unbox();

            _check_and_transfer_fees(
                playerAddress, COST_GENERAL.into(), game_world.feeTokenAddress
            );

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
                nextPlayerIndex: 1,
                prizePool: COST_GENERAL.into(),
                prizesDistributed: false
            };

            // let mut player = get!(world, (playerAddress, game.gameId), (Player));
            let mut player: Player = world.read_model((playerAddress, game.gameId));

            if side == 1 {
                game.northGeneral = playerAddress;
            } else if side == 2 {
                game.southGeneral = playerAddress;
            }

            game_world.nextGameId += 1;

            let player_enrollment = PlayerEnrollment {
                address: playerAddress, gameId: game.gameId, enrolled: true, index: 0
            };

            let game_players = GamePlayers {
                gameId: game.gameId, index: 0, address: playerAddress,
            };

            player =
                Player {
                    address: playerAddress,
                    gameId: game.gameId,
                    isGeneral: true,
                    gold: 0,
                    sharpened: false,
                    totalStrikes: 0,
                    totalStrikeDamage: 0,
                    nickname: 0,
                    strikesAgainstCastle1: 0,
                    strikesAgainstCastle2: 0
                };

            // Update the world status, add a player to the count and set the player's enrollment
            // status to true.
            // set!(world, (game));
            // set!(world, (game_world));
            // set!(world, (player_enrollment));
            //set!(world, (player));
            // set!(world, (game_players));

            world.write_model(@game);
            world.write_model(@game_world);
            world.write_model(@player_enrollment);
            world.write_model(@player);
            world.write_model(@game_players);

            // emit!(world, (Event::Spawn( Spawn { gameId: game.gameId, player: playerAddress,
            // general: side})));
            world.emit_event(@Spawn { gameId: game.gameId, player: playerAddress, general: side });
        }

        // ContractState is defined by system decorator expansion
        fn enroll(ref self: ContractState, gameId: u128) {
            let mut world = self.world_default();

            self._validate_game_id(gameId);

            let mut game_world: GameWorld = world.read_model('game');
            let playerAddress = get_caller_address();
            let mut game: Game = world.read_model(gameId);
            let mut enrollment_status: PlayerEnrollment = world.read_model((playerAddress, gameId));
            let mut player: Player = world.read_model((playerAddress, gameId));
            let mut game_players: GamePlayers = world.read_model((gameId, enrollment_status.index));

            player =
                Player {
                    address: playerAddress,
                    gameId: gameId,
                    isGeneral: false,
                    gold: 0,
                    sharpened: false,
                    totalStrikes: 0,
                    totalStrikeDamage: 0,
                    nickname: 0,
                    strikesAgainstCastle1: 0,
                    strikesAgainstCastle2: 0,
                };

            if !enrollment_status.enrolled && game_players.address != playerAddress {
                _check_and_transfer_fees(
                    playerAddress, COST_SELLSWORD.into(), game_world.feeTokenAddress
                );
                game.prizePool += COST_SELLSWORD.into();

                enrollment_status.enrolled = true;
                enrollment_status.index = game.nextPlayerIndex;
                game.numPlayers += 1;
                game.nextPlayerIndex += 1;

                game_players.address = playerAddress;
                game_players.index = enrollment_status.index;
            } else if !enrollment_status.enrolled && game_players.address == playerAddress {
                enrollment_status.enrolled = true;
                game.numPlayers += 1;
            }

            world.write_model(@enrollment_status);
            world.write_model(@game);
            world.write_model(@player);
            world.write_model(@game_players);

            world
                .emit_event(
                    @Enrollment {
                        player: playerAddress,
                        gameId: gameId,
                        general: 0,
                        index: enrollment_status.index,
                        numPlayers: game.numPlayers,
                    }
                );
        }

        fn unenroll(ref self: ContractState, gameId: u128) {
            let mut world = self.world_default();

            self._validate_game_id(gameId);

            let playerAddress = get_caller_address();
            let mut game: Game = world.read_model(gameId);
            let mut enrollment_status: PlayerEnrollment = world.read_model((playerAddress, gameId));

            if enrollment_status.enrolled {
                game.numPlayers -= 1;
                enrollment_status.enrolled = false;

                world.write_model(@enrollment_status);
                world.write_model(@game);

                world
                    .emit_event(
                        @Unenrollment {
                            player: playerAddress,
                            gameId: gameId,
                            general: 0,
                            index: enrollment_status.index,
                            numPlayers: game.numPlayers,
                        }
                    );
            }
        }

        // assignGeneral: assign a player as a general for a castle
        fn assignGeneral(ref self: ContractState, gameId: u128, castle: u8) {
            let mut world = self.world_default();

            self._validate_game_id(gameId);

            let playerAddress = get_caller_address();
            let mut game_world: GameWorld = world.read_model('game');
            let mut game: Game = world.read_model(gameId);
            let mut player_enrollment: PlayerEnrollment = world.read_model((playerAddress, gameId));
            let mut player: Player = world.read_model((playerAddress, gameId));
            let mut game_players: GamePlayers = world.read_model((gameId, player_enrollment.index));

            assert(game.stage == 0, 'Not in enrollment stage');
            assert(
                game.northGeneral != playerAddress && game.southGeneral != playerAddress,
                'Already a general'
            );
            assert(!player_enrollment.enrolled, 'Already a sellsword');
            assert(castle == 1 || castle == 2, 'Invalid castle');

            assert(
                castle == 1
                    && game.northGeneral == starknet::contract_address_const::<0x0>() || castle == 2
                    && game.southGeneral == starknet::contract_address_const::<0x0>(),
                'castle already has general'
            );

            _check_and_transfer_fees(
                playerAddress, COST_GENERAL.into(), game_world.feeTokenAddress
            );
            game.prizePool += COST_GENERAL.into();

            if castle == 1
                && game.northGeneral == starknet::contract_address_const::<0x0>()
                && !player_enrollment.enrolled {
                game.northGeneral = playerAddress;
                if game_players.address != playerAddress {
                    player_enrollment.index = game.nextPlayerIndex;
                    game.nextPlayerIndex += 1;
                    game_players.address = playerAddress;
                    game_players.index = player_enrollment.index;
                }
            } else if castle == 2
                && game.southGeneral == starknet::contract_address_const::<0x0>()
                && !player_enrollment.enrolled {
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

            world.write_model(@game);
            world.write_model(@player_enrollment);
            world.write_model(@player);
            world.write_model(@game_players);

            world
                .emit_event(
                    @Enrollment {
                        player: playerAddress,
                        gameId: gameId,
                        general: castle,
                        index: player_enrollment.index,
                        numPlayers: game.numPlayers,
                    }
                );
        }

        // unassignGeneral: unassign a player from being a general
        fn unassignGeneral(ref self: ContractState, gameId: u128, castle: u8) {
            let mut world = self.world_default();

            self._validate_game_id(gameId);

            let playerAddress = get_caller_address();
            let mut game: Game = world.read_model(gameId);
            let mut player_enrollment: PlayerEnrollment = world.read_model((playerAddress, gameId));
            let mut player: Player = world.read_model((playerAddress, gameId));

            assert(game.stage == 0, 'Not in enrollment stage');
            assert(player_enrollment.enrolled, 'Not enrolled in game');
            assert(player.isGeneral, 'Not a general');
            assert(castle == 1 || castle == 2, 'Invalid castle');
            assert(
                castle == 1
                    && game.northGeneral == playerAddress || castle == 2
                    && game.southGeneral == playerAddress,
                'Not general of castle'
            );

            if castle == 1 && game.northGeneral == playerAddress {
                game.northGeneral = starknet::contract_address_const::<0x0>();
            } else if castle == 2 && game.southGeneral == playerAddress {
                game.southGeneral = starknet::contract_address_const::<0x0>();
            }

            game.numPlayers -= 1;
            player_enrollment.enrolled = false;
            player.isGeneral = false;

            world.write_model(@game);
            world.write_model(@player_enrollment);
            world.write_model(@player);

            world
                .emit_event(
                    @Unenrollment {
                        player: playerAddress,
                        gameId: gameId,
                        general: castle,
                        index: player_enrollment.index,
                        numPlayers: game.numPlayers,
                    }
                );
        }

        // fortify: fortify a castle
        fn fortify(ref self: ContractState, gameId: u128, castle: u8, amount: u16) {
            let mut world = self.world_default();

            self._validate_game_id(gameId);

            let playerAddress = get_caller_address();
            let mut player: Player = world.read_model((playerAddress, gameId));
            let mut game: Game = world.read_model(gameId);

            assert(game.stage == 1, 'Not in staging phase');
            assert(amount > 0 && amount <= player.gold, 'Invalid amount');
            assert(castle == 1 || castle == 2, 'Invalid castle');
            assert(
                castle == 1
                    && game.northGeneral == playerAddress || castle == 2
                    && game.southGeneral == playerAddress,
                'Not general of this castle'
            );

            if castle == 1 && game.northGeneral == playerAddress {
                game.castle1Health += amount.into() * 2;
                player.gold -= amount;
                world.write_model(@player);
                world.write_model(@game);
            } else if castle == 2 && game.southGeneral == playerAddress {
                game.castle2Health += amount.into() * 2;
                player.gold -= amount;
                world.write_model(@player);
                world.write_model(@game);
            }

            world
                .emit_event(
                    @Fortification {
                        general: playerAddress, gameId: gameId, castle: castle, amount: amount,
                    }
                );
        }

        // attack: attack a castle
        fn attack(ref self: ContractState, gameId: u128, castle: u8) {
            let mut world = self.world_default();

            self._validate_game_id(gameId);

            let playerAddress = get_caller_address();
            let info = starknet::get_block_info().unbox();

            let player_enrollment: PlayerEnrollment = world.read_model((playerAddress, gameId));
            assert(player_enrollment.enrolled, 'Not enrolled in game');

            let mut player_cooldown: PlayerCooldowns = world.read_model((playerAddress, gameId));
            let mut player: Player = world.read_model((playerAddress, gameId));

            if player_cooldown.lastStrike != 0 {
                if player.isGeneral && player_cooldown.lastStrike
                    + GENERAL_COOLDOWN.into() > info.block_timestamp.into() {
                    assert(false, 'Attack on cooldown');
                } else if player_cooldown.lastStrike
                    + SWORD_COOLDOWN.into() > info.block_timestamp.into() {
                    assert(false, 'Attack on cooldown');
                }
            }

            let mut game: Game = world.read_model(gameId);
            let game_world: GameWorld = world.read_model('game');
            let mut global_player_stats: GlobalPlayerStats = world.read_model(playerAddress);

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

            let damage = get_attack_damage(
                player.sharpened, global_player_stats.rank, game_world.entropy
            );

            if castle == 1 {
                game.castle1Health -= damage;
                player.strikesAgainstCastle1 += 1;
            } else if castle == 2 {
                game.castle2Health -= damage;
                player.strikesAgainstCastle2 += 1;
            }

            player.totalStrikes += 1;
            player.totalStrikeDamage += damage;
            player.sharpened = false;

            global_player_stats.totalStrikes += 1;
            global_player_stats.totalStrikeDamage += damage.into();

            player_cooldown.lastStrike = info.block_timestamp.into();

            world.write_model(@game);
            world.write_model(@player);
            world.write_model(@global_player_stats);
            world.write_model(@player_cooldown);

            world
                .emit_event(
                    @Strike {
                        player: playerAddress, gameId: gameId, target: castle, damage: damage,
                    }
                );
        }

        // sharpen: sharpen the player's sword
        fn sharpen(ref self: ContractState, gameId: u128) {
            let mut world = self.world_default();

            self._validate_game_id(gameId);

            let playerAddress = get_caller_address();
            let mut player: Player = world.read_model((playerAddress, gameId));
            let game: Game = world.read_model(gameId);

            assert(game.stage == 2, 'Not in attack stage');
            assert(player.gold >= 50, 'Need 50 gold to sharpen');
            assert(!player.sharpened, 'Already sharpened');

            if !player.sharpened && player.gold >= 50 {
                player.sharpened = true;
                player.gold -= 50;
                world.write_model(@player);
                world.emit_event(@Sharpening { player: playerAddress, gameId: gameId });
            }
        }

        // pay: pay another player
        fn pay(ref self: ContractState, gameId: u128, recipient: ContractAddress, amount: u16) {
            let mut world = self.world_default();

            self._validate_game_id(gameId);

            let playerAddress = get_caller_address();
            let mut player: Player = world.read_model((playerAddress, gameId));

            assert(player.gold >= amount, 'Not enough gold');

            let mut recipientPlayer: Player = world.read_model((recipient, gameId));

            if player.gold >= amount {
                player.gold -= amount;
                world.write_model(@player);

                recipientPlayer.gold += amount;
                world.write_model(@recipientPlayer);

                world
                    .emit_event(
                        @Payment {
                            gameId: gameId,
                            sender: playerAddress,
                            receiver: recipient,
                            amount: amount,
                        }
                    );
            }
        }

        // buyrank: buy rank for the player
        fn buyrank(ref self: ContractState, gameId: u128, ranks: u8) {
            let mut world = self.world_default();

            self._validate_game_id(gameId);

            let playerAddress = get_caller_address();
            let mut player: Player = world.read_model((playerAddress, gameId));
            let game: Game = world.read_model(gameId);
            let mut playerStats: GlobalPlayerStats = world.read_model(playerAddress);

            assert(game.stage == 3, 'Game must have ended');
            assert(player.gold >= ranks.into() * 500, 'Not enough gold');
            assert(playerStats.rank < MAXIMUM_RANK, 'Already at max rank');

            if player.gold >= ranks.into() * 500 && playerStats.rank < MAXIMUM_RANK {
                player.gold -= ranks.into() * 500;
                playerStats.rank += ranks.into();
                world.write_model(@player);
                world.write_model(@playerStats);
            }
        }

        // change_game_stage: change the stage of the game
        fn change_game_stage(ref self: ContractState, gameId: u128, stage: u8) {
            let mut world = self.world_default();

            self._validate_game_id(gameId);

            assert(stage >= 0 && stage < 4, 'Invalid game stage');

            let mut game: Game = world.read_model(gameId);
            assert(stage >= game.stage, 'Cannot go back in game stage');

            let block = starknet::get_block_info().unbox();

            if stage == 1 {
                if block.block_timestamp.into() >= game.startTime + ENROLLMENT_STAGE_DELAY.into() {
                    self._change_game_stage(gameId, stage);
                } else {
                    assert(false, 'Too early for staging stage');
                }
            } else if stage == 2 {
                if block.block_timestamp.into() >= game.startTime
                    + ENROLLMENT_STAGE_DELAY.into()
                    + BATTLE_STAGE_DELAY.into() {
                    self._change_game_stage(gameId, stage);
                } else {
                    assert(false, 'Too early for battle stage');
                }
            } else if stage == 3 {
                if game.castle1Health == 0 || game.castle2Health == 0 {
                    self._change_game_stage(gameId, stage);
                } else {
                    assert(false, 'Neither castle has fallen yet');
                }
            }
        }

        // dev_change_game_stage: admin-only change game stage
        fn dev_change_game_stage(ref self: ContractState, gameId: u128, stage: u8) {

            self._validate_admin_access();

            self._validate_game_id(gameId);

            assert(stage >= 0 && stage < 4, 'Invalid game stage');

            self._change_game_stage(gameId, stage);
        }

        // get_treasury_balance: get the balance of the treasury
        fn get_treasury_balance(ref self: ContractState, gameId: u128) -> u256 {
            
            let world = self.world_default();

            self._validate_game_id(gameId);

            let game: Game = world.read_model(gameId);
            self.emit(TreasuryBalance { gameId: gameId, balance: game.prizePool });

            game.prizePool
        }

        // withdraw_treasury_funds_amount: withdraw funds from the treasury
        fn withdraw_treasury_funds_amount(ref self: ContractState, amount: u256) {
            let mut world = self.world_default();

            self._validate_admin_access();

            let mut game_world: GameWorld = world.read_model('game');

            assert(game_world.treasuryBalance >= amount, 'Insufficient treasury balance');

            _pay_player(game_world.treasuryAddress, amount, game_world.feeTokenAddress);

            game_world.treasuryBalance -= amount;
            world.write_model(@game_world);
        }

        // get_list_of_players: get a list of players for a game
        fn get_list_of_players(ref self: ContractState, gameId: u128) {
            
            let mut world = self.world_default();

            self._validate_game_id(gameId);

            let mut players = ArrayTrait::new();

            let game: Game = world.read_model(gameId);
            let mut i = 0;

            while i < game.numPlayers {
                let game_player: GamePlayers = world.read_model((gameId, i));
                players.append(game_player.address);
                i += 1;
            };

            world.emit_event(@GamePlayersList { gameId: gameId, players: players });
        }

        // set_nickname: set a player's nickname
        fn set_nickname(ref self: ContractState, gameId: u128, nickname: felt252) {
            let mut world = self.world_default();

            self._validate_game_id(gameId);

            let playerAddress = get_caller_address();
            let player_enrollment: PlayerEnrollment = world.read_model((playerAddress, gameId));

            assert(player_enrollment.enrolled, 'Not enrolled in game');

            let mut player: Player = world.read_model((playerAddress, gameId));
            let oldNickname = player.nickname;

            player.nickname = nickname;
            world.write_model(@player);

            world
                .emit_event(
                    @PlayerNickname {
                        gameId: gameId,
                        player: playerAddress,
                        oldNickname: oldNickname,
                        newNickname: player.nickname
                    }
                );
        }

        // get_nickname: get a player's nickname
        fn get_nickname(ref self: ContractState, gameId: u128, address: ContractAddress) -> felt252 {
            
            let world = self.world_default();

            let player_enrollment: PlayerEnrollment = world.read_model((address, gameId));
            assert(player_enrollment.enrolled, 'Address not enrolled in game');

            let player: Player = world.read_model((address, gameId));
            assert(player.nickname != 0, 'No nickname defined');

            player.nickname
        }

        // distribute prizes after a game ends
        fn distribute_prizes(ref self: ContractState, gameId: u128) {
            let mut world = self.world_default();

            self._validate_game_id(gameId);

            let mut game: Game = world.read_model(gameId);

            assert(game.stage == 3, 'Game is not over yet');
            assert(!game.prizesDistributed, 'Prizes already distributed');

            game.prizesDistributed = true;
            world.write_model(@game);

            let treasuryCut = game.prizePool * TREASURY_CUT_PERCENTAGE.into() / 100.into();
            let playerShare = game.prizePool - treasuryCut;

            let mut winningCastle: u8 = 0;
            let mut losingCastle: u8 = 0;
            if game.castle1Health == 0 {
                winningCastle = 2;
                losingCastle = 1;
            } else if game.castle2Health == 0 {
                winningCastle = 1;
                losingCastle = 2;
            } else {
                assert(false, 'No castle has fallen yet');
            }

            let mut totalShares: u256 = 0.into();
            let mut eligiblePlayers = ArrayTrait::new();
            let mut playerShares = ArrayTrait::new();
            let numPlayers = game.nextPlayerIndex;

            let mut i = 0;
            while i < numPlayers {
                let game_player: GamePlayers = world.read_model((gameId, i));
                let playerAddress = game_player.address;
                let player: Player = world.read_model((playerAddress, gameId));

                let mut shares: u256 = 0;
                if player.isGeneral {
                    shares = (COST_GENERAL / COST_SELLSWORD).into();
                } else {
                    let strikesAgainstWinning = if winningCastle == 1 {
                        player.strikesAgainstCastle1
                    } else {
                        player.strikesAgainstCastle2
                    };
                    let strikesAgainstLosing = if losingCastle == 1 {
                        player.strikesAgainstCastle1
                    } else {
                        player.strikesAgainstCastle2
                    };
                    if strikesAgainstLosing > strikesAgainstWinning {
                        shares = 1.into();
                    }
                }
                if shares != 0.into() {
                    eligiblePlayers.append(playerAddress);
                    playerShares.append(shares);
                    totalShares += shares;
                }
                i += 1;
            };

            let mut game_world: GameWorld = world.read_model('game');

            if totalShares != 0.into() {
                let shareAmount = playerShare / totalShares;

                let numEligiblePlayers = eligiblePlayers.len();
                let mut idx = 0;
                while idx < numEligiblePlayers {
                    let playerAddress = eligiblePlayers.get(idx);
                    let shares = playerShares.get(idx);
                    let prize: u256 = shareAmount * *shares.unwrap().unbox();
                    _pay_player(*playerAddress.unwrap().unbox(), prize, game_world.feeTokenAddress);
                    idx += 1;
                }
            }

            game_world.treasuryBalance += treasuryCut;
            world.write_model(@game_world);
        }

        // withdraw_treasury_funds: withdraw all treasury funds
        fn withdraw_treasury_funds(ref self: ContractState) {
            let mut world = self.world_default();

            self._validate_admin_access();

            let mut game_world: GameWorld = world.read_model('game');
            let treasuryBalance = game_world.treasuryBalance / ETH_TO_WEI;

            _pay_player(game_world.treasuryAddress, treasuryBalance, game_world.feeTokenAddress);

            game_world.treasuryBalance = 0;
            world.write_model(@game_world);
        }

        // set_castle_hp: manually set the HP of a castle
        fn set_castle_hp(ref self: ContractState, gameId: u128, castle: u8, hp: u32) {
            let mut world = self.world_default();

            self._validate_game_id(gameId);
            self._validate_admin_access();

            let mut game: Game = world.read_model(gameId);

            if castle == 1 {
                game.castle1Health = hp;
            } else if castle == 2 {
                game.castle2Health = hp;
            } else {
                assert(false, 'Invalid castle');
            }

            world.write_model(@game);
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {

        // Get default world
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"ctboc")
        }

        // Validate the game ID
        fn _validate_game_id(self: @ContractState, gameId: u128) {
            let world = self.world_default();
            let game_world: GameWorld = world.read_model('game');
            assert(gameId < game_world.nextGameId, 'Invalid game ID provided');
        }

        // Validate admin access
        fn _validate_admin_access(self: @ContractState) {
            let mut world = self.world_default();
            let caller = get_caller_address();
            let game_world: GameWorld = world.read_model('game');
            assert(caller == game_world.adminAddress, 'You are not admin');
        }

        // Change the game stage
        fn _change_game_stage(
            self: @ContractState, gameId: u128, stage: u8
        ) {
            let mut world = self.world_default();

            self._validate_game_id(gameId);

            let mut game: Game = world.read_model(gameId);

            if stage == 1 {
                // Give gold to generals if their gold is 0
                let mut northGeneral: Player = world
                    .read_model((game.northGeneral, gameId));
                let mut southGeneral: Player = world
                    .read_model((game.southGeneral, gameId));

                if northGeneral.address != starknet::contract_address_const::<0x0>()
                    && northGeneral.gold == 0 {
                    northGeneral.gold += GENERAL_STARTING_GOLD;
                    world.write_model(@northGeneral);
                }

                if southGeneral.address != starknet::contract_address_const::<0x0>()
                    && southGeneral.gold == 0 {
                    southGeneral.gold += GENERAL_STARTING_GOLD;
                    world.write_model(@southGeneral);
                }
            }

            game.stage = stage;

            world.write_model(@game);

            world.emit_event(@GameStageChange { gameId: gameId, stage: stage, });
        }
    }
}
