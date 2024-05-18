import { useComponentValue, } from "@dojoengine/react";
import { Entity } from "@dojoengine/recs";
import { useEffect, useState } from "react";
import "./App.css";
import { useDojo } from "./DojoContext";
import { GAME_STAGES } from "./utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { shortString } from "starknet";

function App() {
    const {
        setup: {
            systemCalls: { spawn, enroll, unenroll, assignGeneral, unassignGeneral, fortify, sharpen, attack, pay, buyrank, changegamestage, devchangegamestage },
            components: { Game, GameWorld, Player, GlobalPlayerStats, PlayerCooldowns, PlayerEnrollment },
        },
        account: {
            create,
            list,
            select,
            account,
            isDeploying,
            clear,
            copyToClipboard,
            applyFromClipboard,
        },
    } = useDojo();

    const [clipboardStatus, setClipboardStatus] = useState({
        message: "",
        isError: false,
    });

    const searchParams = new URLSearchParams(document.location.search);

    console.log(searchParams.get("gameId"));

    const activeGameId = parseInt(searchParams.get("gameId") || "0");
    console.log("activeGameId: ", activeGameId);
    console.log("account.address: ", account.address);

    var playerGameId = getEntityIdFromKeys([BigInt(account.address), BigInt(activeGameId)]) as Entity;
    var playerGlobalId = getEntityIdFromKeys([BigInt(account.address)]) as Entity;
    var gameWorldId = getEntityIdFromKeys([BigInt(shortString.encodeShortString("game"))]) as Entity;
    var gameId = getEntityIdFromKeys([BigInt(activeGameId)]) as Entity;

    console.log("activeGameId: ", activeGameId);
    console.log("playerGameId: ", playerGameId);
    console.log("playerGlobalId: ", playerGlobalId);
    console.log("gameWorldId: ", gameWorldId);
    console.log("gameId: ", gameId);

    // get current component values
    var playerGlobalStats = useComponentValue(GlobalPlayerStats, playerGlobalId);
    var playerGameStats = useComponentValue(Player, playerGameId);
    var gameWorld = useComponentValue(GameWorld, gameWorldId);
    var game = useComponentValue(Game, gameId);
    var playerCooldowns = useComponentValue(PlayerCooldowns, playerGameId);
    var playerEnrolment = useComponentValue(PlayerEnrollment, playerGameId);

    console.log("playerGlobalStats: ", playerGlobalStats);
    console.log("playerGameStats: ", playerGameStats);
    console.log("gameWorld: ", gameWorld);
    console.log("game: ", game);
    console.log("playerCooldowns: ", playerCooldowns);
    console.log("playerEnrolment: ", playerEnrolment);

    const handleRestoreBurners = async () => {
        try {
            await applyFromClipboard();
            setClipboardStatus({
                message: "Burners restored successfully!",
                isError: false,
            });
        } catch (error) {
            setClipboardStatus({
                message: `Failed to restore burners from clipboard`,
                isError: true,
            });
        }
    };

    useEffect(() => {
        if (clipboardStatus.message) {
            const timer = setTimeout(() => {
                setClipboardStatus({ message: "", isError: false });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [clipboardStatus.message]);

    return (
        <>
            <button onClick={() => create()}>
                {isDeploying ? "deploying burner" : "create burner"}
            </button>
            {list().length > 0 && (
                <button onClick={async () => await copyToClipboard()}>
                    Save Burners to Clipboard
                </button>
            )}
            <button onClick={handleRestoreBurners}>
                Restore Burners from Clipboard
            </button>
            {clipboardStatus.message && (
                <div className={clipboardStatus.isError ? "error" : "success"}>
                    {clipboardStatus.message}
                </div>
            )}

            <div className="card">
                Select signer: {" "}
                <select
                    value={account ? account.address : ""}
                    onChange={(e) => {select(e.target.value); window.location.replace(`?gameId=${activeGameId}`);}}
                >
                    {list().map((account, index) => {
                        return (
                            <option value={account.address} key={index}>
                                {account.address}
                            </option>
                        );
                    })}
                </select>
                <div>
                    <button onClick={() => clear()}>Clear burners</button>
                </div>
            </div>

            <div className="card">
                <div>
                    Total Game Worlds: {gameWorld ? `${gameWorld.nextGameId}` : "0"}
                </div>
                <div>
                    Active Game World: 
                    <select
                        value={activeGameId}
                        onChange={(e) => {window.location.replace(`?gameId=${e.target.value}`);}}
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
                                playerGameStats && playerGameStats.isGeneral ?
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
                <br/>
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
                    Gold: {playerGameStats? `${playerGameStats.gold}` : "Need to Spawn"}
                </div>
                <div>
                    Total Strikes: {playerGameStats ? `${playerGameStats.totalStrikes}` : "Need to Enroll"}
                </div>
                <div>
                    Total Damage: {playerGameStats ? `${playerGameStats.totalStrikeDamage}` : "Need to Enroll"}
                </div>
            </div>

            {/*<div className="card">
                <div>
                    <button
                        onClick={() =>
                            position && position.vec.y > 0
                                ? move(account, Direction.Up)
                                : console.log("Reach the borders of the world.")
                        }
                    >
                        Move Up
                    </button>
                </div>
                <div>
                    <button
                        onClick={() =>
                            position && position.vec.x > 0
                                ? move(account, Direction.Left)
                                : console.log("Reach the borders of the world.")
                        }
                    >
                        Move Left
                    </button>
                    <button onClick={() => move(account, Direction.Right)}>
                        Move Right
                    </button>
                </div>
                <div>
                    <button onClick={() => move(account, Direction.Down)}>
                        Move Down
                    </button>
                </div>
            </div>*/}
        </>
    );
}

export default App;