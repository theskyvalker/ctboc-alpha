// use starknet::{ContractAddress, get_caller_address, contract_address_const};
// use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
// use ctboc::models::{GameWorld};

// #[derive(Copy, Drop)]
// struct ConfigManager {
//     world: IWorldDispatcher
// }

// #[generate_trait]
// impl ConfigManagerTraitImpl of ConfigManagerTrait {
    
//     fn new(world: IWorldDispatcher) -> ConfigManager {
//         ConfigManager { world }
//     }

//     fn get(self: ConfigManager) -> GameWorld {
//         get!(self.world, 'game', GameWorld)
//     }

//     fn set(self: ConfigManager, config: GameWorld) {
//         let caller = get_caller_address();
//         assert(self.is_admin(caller), 'not admin');
//         set!(self.world, (config));
//     }

//     fn is_admin(self: ConfigManager, address: ContractAddress) -> bool {
//         let config = self.get();
//         (config.adminAddress == contract_address_const::<0x0>() || config.adminAddress == address)
//     }
// }