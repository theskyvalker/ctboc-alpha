import { json } from 'starknet';

export async function lordsAbi() {
    const abi = json.parse(
      `[
        {
          "name": "constructor",
          "type": "function",
          "inputs": [
            {
              "name": "l2_bridge",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "name": "name",
          "type": "function",
          "inputs": [],
          "outputs": [
            {
              "type": "core::felt252"
            }
          ],
          "state_mutability": "view"
        },
        {
          "name": "symbol",
          "type": "function",
          "inputs": [],
          "outputs": [
            {
              "type": "core::felt252"
            }
          ],
          "state_mutability": "view"
        },
        {
          "name": "decimals",
          "type": "function",
          "inputs": [],
          "outputs": [
            {
              "type": "core::integer::u8"
            }
          ],
          "state_mutability": "view"
        },
        {
          "name": "total_supply",
          "type": "function",
          "inputs": [],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "view"
        },
        {
          "name": "totalSupply",
          "type": "function",
          "inputs": [],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "view"
        },
        {
          "name": "balance_of",
          "type": "function",
          "inputs": [
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "view"
        },
        {
          "name": "balanceOf",
          "type": "function",
          "inputs": [
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "view"
        },
        {
          "name": "allowance",
          "type": "function",
          "inputs": [
            {
              "name": "owner",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "spender",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "view"
        },
        {
          "name": "approve",
          "type": "function",
          "inputs": [
            {
              "name": "spender",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "name": "transfer",
          "type": "function",
          "inputs": [
            {
              "name": "recipient",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "name": "transfer_from",
          "type": "function",
          "inputs": [
            {
              "name": "sender",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "recipient",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "name": "transferFrom",
          "type": "function",
          "inputs": [
            {
              "name": "sender",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "recipient",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "name": "mint",
          "type": "function",
          "inputs": [
            {
              "name": "recipient",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "name": "burn",
          "type": "function",
          "inputs": [
            {
              "name": "owner",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "name": "Transfer",
          "type": "event",
          "inputs": [
            {
              "name": "from",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "to",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "value",
              "type": "core::integer::u256"
            }
          ]
        },
        {
          "name": "Approval",
          "type": "event",
          "inputs": [
            {
              "name": "owner",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "spender",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "value",
              "type": "core::integer::u256"
            }
          ]
        }
      ]`);
    return abi;
}