#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

export STARKNET_RPC_URL="https://api.cartridge.gg/x/ctboc/katana";

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
    sozo auth grant writer $component,$ACTIONS_ADDRESS
done

echo "Default authorizations have been successfully set."
