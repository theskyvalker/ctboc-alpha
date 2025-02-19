use starknet::ContractAddress;

#[starknet::interface]
trait ILords<TState> {
    fn transfer(ref self: TState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TState, sender: ContractAddress, recipient: ContractAddress, amount: u256
    ) -> bool;
    fn allowance(ref self: TState, owner: ContractAddress, spender: ContractAddress) -> u256;
    fn balance_of(ref self: TState, account: ContractAddress) -> u256;
}