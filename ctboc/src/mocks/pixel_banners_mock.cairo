use starknet::{ContractAddress, ClassHash};
use dojo::world::IWorldDispatcher;

#[starknet::interface]
trait INFTMock<TState> {
    // IWorldProvider
    fn world(self: @TState,) -> IWorldDispatcher;

    // IUpgradeable
    fn upgrade(self: @TState, new_class_hash: ClassHash);

    // IERC721
    fn balance_of(self: @TState, account: ContractAddress) -> u256;
    fn owner_of(self: @TState, token_id: u128) -> ContractAddress;

    // IERC721Metadata
    fn name(self: @TState) -> felt252;
    fn symbol(self: @TState) -> felt252;
    fn token_uri(self: @TState, token_id: u128) -> ByteArray;

    // IERC721CamelOnly
    fn balanceOf(self: @TState, account: ContractAddress) -> u256;
    fn ownerOf(self: @TState, tokenId: u128) -> ContractAddress;

    // IERC721MetadataCamelOnly
    fn tokenURI(self: @TState, tokenId: u128) -> ByteArray;

    // Additional functions for testing
    fn mint(ref self: TState, to: ContractAddress, tokenId: u128);
}

#[starknet::interface]
trait INFTMockInitializer<TState> {
    fn initializer(self: @TState);
}

#[dojo::contract]
mod nft_mock {

    use integer::BoundedInt;
    use starknet::{get_caller_address, get_contract_address};
    use zeroable::Zeroable;
    use debug::PrintTrait;

    use token::components::security::initializable::initializable_component;

    component!(path: initializable_component, storage: initializable, event: InitializableEvent);

    #[storage]
    struct Storage {
        #[substorage(v0)]
        initializable: initializable_component::Storage,
    }

    #[event]
    #[derive(Copy, Drop, starknet::Event)]
    enum Event {
        InitializableEvent: initializable_component::Event,
    }

    mod Errors {
        const CALLER_IS_NOT_OWNER: felt252 = 'ERC721: caller is not owner';
    }

    impl InitializableImpl = initializable_component::InitializableImpl<ContractState>;

    //
    // Internal Impls
    //

    impl InitializableInternalImpl = initializable_component::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl NFTMockInitializerImpl of super::INFTMockInitializer<ContractState> {
        fn initializer(self: @ContractState) {

            assert(
                self.world().is_owner(get_caller_address(), get_contract_address().into()),
                Errors::CALLER_IS_NOT_OWNER
            );

            //self.erc721_metadata.initialize('Pixel Banners', 'PIXELS');

            self.initializable.initialize();
        }
    }
}