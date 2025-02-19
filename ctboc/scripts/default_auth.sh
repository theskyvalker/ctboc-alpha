#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

# export STARKNET_RPC_URL="https://api.cartridge.gg/x/ctboc/katana";
export STARKNET_RPC_URL="https://starknet-sepolia.blastapi.io/f28ffa92-eaa3-411e-9d3d-1b6698fc1aee/rpc/v0_7";

export DOJO_WORLD_ADDRESS=$(cat ./manifests/staging/manifest.json | jq -r '.world.address')

export ACTIONS_ADDRESS=$(cat ./manifests/staging/manifest.json | jq -r '.contracts[] | select(.name == "ctboc::actions::actions" ).address');

echo "---------------------------------------------------------------------------"
echo world : $DOJO_WORLD_ADDRESS 
echo " "
echo actions : $ACTIONS_ADDRESS
echo "---------------------------------------------------------------------------"

# enable system -> component authorizations
COMPONENTS=("Game" "GameWorld" "GamePlayers" "PlayerCooldowns" "PlayerEnrollment" "GlobalPlayerStats" "Player")

for component in ${COMPONENTS[@]}; do
    sozo --profile staging auth grant writer $component,$ACTIONS_ADDRESS
    echo component processed: $component
    sleep 2
done

echo "Default authorizations have been successfully set."