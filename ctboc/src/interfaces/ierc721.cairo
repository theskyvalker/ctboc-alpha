use starknet::ContractAddress;
use token::erc721::interface::{IERC721Dispatcher, IERC721DispatcherTrait};

#[inline(always)]
fn ierc721(contract_address: ContractAddress) -> IERC721Dispatcher {
    (IERC721Dispatcher{contract_address: contract_address})
}