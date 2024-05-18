import "./Lobby.css";
import React, { useEffect, useState } from "react";
import { useDojo } from "./DojoContext";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useComponentValue, useEntityQuery } from "@dojoengine/react";
import { Entity, HasValue } from "@dojoengine/recs";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { hexToDecimal, processTxReceipt } from "./utils";
import { DEFAULT_TOAST_STYLE, GRAPHQL_ENDPOINT } from "./utils/constants";
import DisconnectedView from "./components/DisconnectedView";
import ConnectedView from "./components/ConnectedView";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import ConnectModal from "./components/wallet/connect-modal";

function Lobby() {
  const {
    setup: {
      systemCalls: { spawn, enroll, assignGeneral, set_nickname, get_nickname },
      components: { Game, GameWorld, Player, GlobalPlayerStats, PlayerCooldowns, PlayerEnrollment },
    }
  } = useDojo();

  const { account } = useAccount();

  let playerGlobalId: any;
  let playerGlobalStats: any;

  playerGlobalId = getEntityIdFromKeys([BigInt(account?.address || "0x0")]) as Entity;
  playerGlobalStats = useComponentValue(GlobalPlayerStats, playerGlobalId);

  const [connected, setConnected] = useState(false);
  const [gameModels, setGameModels] = useState<any[]>([]);
  //const [playerModels, setPlayerModels] = useState<any[]>([]);
  const [playerEnrollments, setPlayerEnrollments] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [startModalOpen, setStartModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const adjustScale = () => {
      const scene = document.getElementById('scene');
      const scaleFactorWidth = window.innerWidth / 1600;
      const scaleFactorHeight = window.innerHeight / 900;
      const scaleFactor = Math.min(scaleFactorWidth, scaleFactorHeight);
      if (scene) {
        scene.style.transform = `scale(${scaleFactor})`;
      }
    };

    window.addEventListener('resize', adjustScale);
    adjustScale();

    return () => {
      window.removeEventListener('resize', adjustScale);
    };
  }, [connected]);

  const handleLogin = () => {
    setConnected(true);
    toast.success("Successfully logged in!", DEFAULT_TOAST_STYLE);
  };

  const handleDisconnect = () => {
    setConnected(false);
    toast.success("Successfully logged out!", DEFAULT_TOAST_STYLE);
  };

  const fetchGameModels = async () => {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
          query {
            gameModels {
              edges {
                node {
                  gameId
                  castle1Health
                  castle2Health
                  northGeneral
                  southGeneral
                  stage
                  startTime
                  numPlayers
                }
              }
            }
          }
        `,
        }),
      });

      const result = await response.json();
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        return [];
      }

      const gameModels = result.data.gameModels.edges.map((edge: any) => edge.node);
      setGameModels(gameModels);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const formatAddress = (address: string) => `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;

  const formatStartTime = (hexTime: string) => {
    const timestamp = parseInt(hexTime, 16);
    return new Date(timestamp * 1000).toLocaleString();
  };

  const fetchPlayerEnrollments = async () => {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              playerEnrollmentModels(where: { address: "${account?.address}" }) {
                edges {
                  node {
                    address
                    gameId
                    enrolled
                  }
                }
              }
            }
          `,
        }),
      });

      const result = await response.json();
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        return [];
      }

      const playerEnrollments = result.data.playerEnrollmentModels.edges.map((edge: any) => edge.node);
      setPlayerEnrollments(playerEnrollments);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  let playerModels: any;
  
  const filteredPlayer = useEntityQuery([
    HasValue(Player, { address: BigInt(account?.address || "") }),
  ]);

  try {
    playerModels = useComponentValue(Player, filteredPlayer[0]);
  } catch (error: any) {
    console.log("Not logged in.")
  }

  useEffect(() => {
    if (account) {
      fetchGameModels();
      fetchPlayerEnrollments();
      //fetchPlayerModels();

      const intervalId = setInterval(() => {
        fetchGameModels();
        fetchPlayerEnrollments();
        //fetchPlayerModels();
      }, 120000);

      return () => clearInterval(intervalId);
    }
  }, [account?.address]);

  const combinedData = gameModels.map((game: any) => {
    if (account && game && playerModels) {
      const enrollment = playerEnrollments.find((e: any) => e.gameId === game.gameId) || {};
      const playerModel = [playerModels].find((p: any) => p.gameId === game.gameId) || {};
      return { ...game, ...enrollment, ...playerModel };
    } else {
      return {...game}
    }
  });

  const calculateHPPercentage = (currentHealth: number) => ((currentHealth / 5000) * 100).toFixed(2);

  const handlePlay = (gameId: any): void => {
    window.location.replace(`/game/?gameId=${gameId}`);
  };

  const handleShop = () => {
    toast.info("Shop feature to buy sword ranks is coming soon!", DEFAULT_TOAST_STYLE);
  }

  const handleEnroll = async (gameId: number) => {
    const toastId = toast.loading(`Enrolling for Game ID: ${gameId}`, DEFAULT_TOAST_STYLE);
    const receipt = await enroll(account, gameId);
    try {
      const success = processTxReceipt(receipt);
      if (success) {
        toast.dismiss(toastId);
        toast.success("Successfully joined game!", DEFAULT_TOAST_STYLE);
      } else {
        throw new Error("Failed to join the game.")
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.toString(), DEFAULT_TOAST_STYLE);
    }
  };

  const handleJoinAsGeneral = async (gameId: number, role: 'North' | 'South') => {
    const toastId = toast.loading(`Joining as ${role} General`, DEFAULT_TOAST_STYLE);
    const receipt = await assignGeneral(account, gameId, role == "North" ? 1 : 2);
    try {
      const success = processTxReceipt(receipt);
      if (success) {
        toast.dismiss(toastId);
        toast.success("Successfully joined the game!", DEFAULT_TOAST_STYLE);
      } else {
        throw new Error("Failed to join the game.")
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.toString(), DEFAULT_TOAST_STYLE);
    }
  };

  const handleStartAsGeneral = async (side: "North" | "South") => {
    const toastId = toast.loading(`Starting a game as the ${side} General`, DEFAULT_TOAST_STYLE);
    const receipt = await spawn(account, side == "North" ? 1 : 2);
    try {
      const success = processTxReceipt(receipt);
      if (success) {
        toast.dismiss(toastId);
        toast.success("Successfully started game!", DEFAULT_TOAST_STYLE);
      } else {
        throw new Error("Failed to start game.")
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.toString(), DEFAULT_TOAST_STYLE);
    }
  };

  return connected ? (
    <>
    <ConnectedView
      account={account}
      playerGlobalStats={playerGlobalStats}
      combinedData={combinedData}
      formatAddress={formatAddress}
      formatStartTime={formatStartTime}
      calculateHPPercentage={calculateHPPercentage}
      handlePlay={handlePlay}
      handleEnroll={handleEnroll}
      handleShop={handleShop}
      handleDisconnect={handleDisconnect}
      handleJoinAsGeneral={handleJoinAsGeneral}
      handleStartAsNorthGeneral={() => handleStartAsGeneral("North")}
      handleStartAsSouthGeneral={() => handleStartAsGeneral("South")}
      setModalOpen={setModalOpen}
      setStartModalOpen={setStartModalOpen}
      modalOpen={modalOpen}
      startModalOpen={startModalOpen}
    />
    </>
  ) : (
    <>
    <DisconnectedView
      account={account}
      handleLogin={handleLogin}
    />
    </>
  );
}

export default Lobby;