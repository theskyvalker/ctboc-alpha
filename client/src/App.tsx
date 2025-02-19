import { useComponentValue, useQuerySync, } from "@dojoengine/react";
import { Entity } from "@dojoengine/recs";
import { useEffect, useState } from "react";
import "./App.css";
import { useDojo } from "./dojo/useDojo";
import { GAME_STAGES } from "./utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { shortString } from "starknet";
import { useAccount } from "@starknet-react/core";
import Lobby from "./Lobby";

function App() {
    const {
        setup: {
            systemCalls: { spawn, enroll, unenroll, assignGeneral, unassignGeneral, fortify, sharpen, attack, pay, buyrank, changegamestage, devchangegamestage },
            clientComponents: { Game, GameWorld, Player, GlobalPlayerStats, PlayerCooldowns, PlayerEnrollment },
            contractComponents,
            client,
            toriiClient
        }
    } = useDojo();

    const { account } = useAccount();

    useQuerySync(toriiClient, contractComponents as any, []);

    const searchParams = new URLSearchParams(document.location.search);

    const activeGameId = parseInt(searchParams.get("gameId") || "0");

    const [playerGameId, setPlayerGameId] = useState(getEntityIdFromKeys([BigInt(account?.address || "0x0"), BigInt(activeGameId)]) as Entity);
    const [playerGlobalId, setPlayerGlobalId] = useState(getEntityIdFromKeys([BigInt(account?.address || "0x0")]) as Entity);
    const [gameWorldId, setGameWorldId] = useState(getEntityIdFromKeys([BigInt(shortString.encodeShortString("game"))]) as Entity);
    const [gameId, setGameId] = useState(getEntityIdFromKeys([BigInt(activeGameId)]) as Entity);

    useEffect(() => {
        
        if (account) {
            console.log(account);
            console.log("activeGameId: ", activeGameId);
            console.log("account.address: ", account.address);
    
            setPlayerGameId(getEntityIdFromKeys([BigInt(account?.address || "0x0"), BigInt(activeGameId)]) as Entity);
            setPlayerGlobalId(getEntityIdFromKeys([BigInt(account?.address || "0x0")]) as Entity);
            setGameWorldId(getEntityIdFromKeys([BigInt(shortString.encodeShortString("game"))]) as Entity);
            setGameId(getEntityIdFromKeys([BigInt(activeGameId)]) as Entity);

            console.log("activeGameId: ", activeGameId);
            console.log("playerGameId: ", playerGameId);
            console.log("playerGlobalId: ", playerGlobalId);
            console.log("gameWorldId: ", gameWorldId);
            console.log("gameId: ", gameId);

            console.log("playerGlobalStats: ", playerGlobalStats);
            console.log("playerGameStats: ", playerGameStats);
            console.log("gameWorld: ", gameWorld);
            console.log("game: ", game);
            console.log("playerCooldowns: ", playerCooldowns);
            console.log("playerEnrolment: ", playerEnrolment);
        }
    }, [account]);

    // get current component values
    const playerGlobalStats = useComponentValue(GlobalPlayerStats, playerGlobalId);
    const playerGameStats = useComponentValue(Player, playerGameId);
    const gameWorld = useComponentValue(GameWorld, gameWorldId);
    const game = useComponentValue(Game, gameId);
    const playerCooldowns = useComponentValue(PlayerCooldowns, playerGameId);
    const playerEnrolment = useComponentValue(PlayerEnrollment, playerGameId);

    if (!account) {
        return <Lobby />
    }

    return (
        <>
            <div className="card">
                <div>
                    Total Game Worlds: {gameWorld ? `${gameWorld.nextGameId}` : "0"}
                </div>
                <div>
                    Active Game World:
                    <select
                        value={activeGameId}
                        onChange={(e) => { window.location.replace(`?gameId=${e.target.value}`); }}
                    >
                        {Array.from({ length: gameWorld ? Number(gameWorld.nextGameId) : 0 }, (_, index) => (
                            <option value={index} key={index}>
                                {index}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="card">
                <div>
                    Your Enrollment Status: {(playerEnrolment && playerEnrolment.enrolled) || (playerGameStats && playerGameStats.isGeneral) ? `Enrolled` : "Not Enrolled"}
                </div>
                <div>
                    {(playerEnrolment && playerEnrolment.enrolled) || (playerGameStats && playerGameStats.isGeneral) ?
                        <div>
                            {
                                playerGameStats && playerGameStats.isGeneral && account ?
                                    <button onClick={() => unassignGeneral(account, activeGameId,
                                        playerGameStats && playerGameStats.address == game?.northGeneral ? 1 : 2
                                    )}>Resign as General</button> :
                                    <button onClick={() => unenroll(account, activeGameId)}>Unenroll from the Game</button>
                            }
                        </div> :
                        <div>
                            <button onClick={() => enroll(account, activeGameId)}>Enroll in the Game</button>
                            <button onClick={() => assignGeneral(account, activeGameId, 1)}>Become North General</button>
                            <button onClick={() => assignGeneral(account, activeGameId, 2)}>Become South General</button>
                        </div>
                    }
                </div>
            </div>

            <button onClick={() => devchangegamestage(account, activeGameId, 0)}> Enrolment </button>
            <button onClick={() => devchangegamestage(account, activeGameId, 1)}> Staging </button>
            <button onClick={() => devchangegamestage(account, activeGameId, 2)}> Battle </button>
            <button onClick={() => devchangegamestage(account, activeGameId, 3)}> End </button>

            <div className="card">
                <div>
                    <button onClick={() => sharpen(account, activeGameId)}>Sharpen</button>
                </div>
                <div>
                    <button onClick={() => attack(account, activeGameId, 1)}>Attack the North</button>
                    <button onClick={() => attack(account, activeGameId, 2)}>Attack the South</button>
                </div>
            </div>

            <div className="card">
                <div>
                    North General: {game ? `${"0x" + game.northGeneral.toString(16)}` : "0"}
                </div>
                <div>
                    South General: {game ? `${"0x" + game.southGeneral.toString(16)}` : "0"}
                </div>
                <br />
                <div>
                    Stage: {game ? `${GAME_STAGES[game.stage]}` : "Not Started"}
                </div>
                <div>
                    Number of Players: {game ? `${game.numPlayers}` : "Not Started"}
                </div>
                <div>
                    North Castle HP: {game ? `${game.castle1Health}` : "Not Started"}
                </div>
                <div>
                    South Castle HP: {game ? `${game.castle2Health}` : "Not Started"}
                </div>
            </div>

            <div className="card">
                <button onClick={() => spawn(account, 1)}>Start Game as North General</button>
                <button onClick={() => spawn(account, 2)}>Start Game as South General</button>
                <div>
                    Sharpened: {playerGameStats ? `${playerGameStats.sharpened}` : "Need to Spawn"}
                </div>
                <div>
                    Gold: {playerGameStats ? `${playerGameStats.gold}` : "Need to Spawn"}
                </div>
                <div>
                    Total Strikes: {playerGameStats ? `${playerGameStats.totalStrikes}` : "Need to Enroll"}
                </div>
                <div>
                    Total Damage: {playerGameStats ? `${playerGameStats.totalStrikeDamage}` : "Need to Enroll"}
                </div>
            </div>
        </>
    );
}

export default App;