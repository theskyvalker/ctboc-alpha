import "./Lobby.css";
import { useEffect, useState } from "react";
import { useDojo } from "./dojo/useDojo";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useComponentValue, useEntityQuery } from "@dojoengine/react";
import { Entity, HasValue } from "@dojoengine/recs";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { formatAddress, formatStartTime, processTxReceipt } from "./utils";
import { DEFAULT_TOAST_STYLE, GRAPHQL_ENDPOINT } from "./utils/constants";
import DisconnectedView from "./components/DisconnectedView";
import ConnectedView from "./components/ConnectedView";
import { useAccount } from "@starknet-react/core";
import BlockingModal from './components/BlockingModal';
import { useNetworkValidation } from "./hooks/useNetworkValidation";
import { GetTransactionReceiptResponse } from "starknet";

function Lobby() {
  const {
    setup: {
      systemCalls: { spawn, enroll, assignGeneral },
      clientComponents: { Player, GlobalPlayerStats },
    }
  } = useDojo();

  const { account, chainId } = useAccount();

  const {isWrongNetwork} = useNetworkValidation();

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
  const [combinedData, setCombinedData] = useState<any>();

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
    if (account && account?.address) {
      setConnected(true);
      toast.success("Successfully logged in!", DEFAULT_TOAST_STYLE.success);
    } else {
      toast.info("Please connect your wallet first!", DEFAULT_TOAST_STYLE.info);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    toast.success("Successfully logged out!", DEFAULT_TOAST_STYLE.success);
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
            ctbocGameModels {
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

      const gameModels = result.data.ctbocGameModels.edges.map((edge: any) => edge.node);
      console.log("Games found: ", gameModels.length);
      setGameModels(gameModels);
    } catch (error) {
      console.error('Fetch error:', error);
    }
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
              ctbocPlayerEnrollmentModels(where: { address: "${account?.address}" }) {
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

      const playerEnrollments = result.data.ctbocPlayerEnrollmentModels.edges.map((edge: any) => edge.node);
      console.log("Enrollments found: ", playerEnrollments.length);
      setPlayerEnrollments(playerEnrollments);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  function refreshData() {
    if (account) {
      fetchGameModels();
      fetchPlayerEnrollments();
      console.log("Refresh done!");
    }
  }

  /*let playerEnrollments: any;

  const filteredPlayerEnrollments = useEntityQuery(
      [HasValue(PlayerEnrollment, { address: BigInt(account?.address || "") } )]
  );

  try {
    playerEnrollments = useComponentValue(PlayerEnrollment, filteredPlayerEnrollments[0]);
  } catch (error: any) {
    console.log("Not logged in.");
  }*/

  let playerModels: any;
  
  const filteredPlayer = useEntityQuery([
    HasValue(Player, { address: BigInt(account?.address || "") }),
  ]);

  try {
    playerModels = useComponentValue(Player, filteredPlayer[0]);
  } catch (error: any) {
    console.log("Not logged in.");
  }

  useEffect(() => {
    if (account) {
      fetchGameModels();
      fetchPlayerEnrollments();

      const intervalId = setInterval(() => {
        fetchGameModels();
        fetchPlayerEnrollments();
      }, 120000);

      return () => clearInterval(intervalId);
    }
  }, [account?.address]);

  useEffect(() => {
    const combinedDataTemp = gameModels.map((game: any) => {
      if (account && game && playerModels && playerEnrollments) {
        const enrollment = playerEnrollments.find((e: any) => parseInt(e.gameId) === parseInt(game.gameId)) || {};
        const playerModel = [playerModels].find((p: any) => parseInt(p.gameId) === parseInt(game.gameId)) || {};
        return { ...game, ...enrollment, ...playerModel };
      } else if (account && game && playerEnrollments) {
        const enrollment = playerEnrollments.find((e: any) => parseInt(e.gameId) === parseInt(game.gameId)) || {};
        return { ...game, ...enrollment};
      }
      else {
        return {...game}
      }
    });
    setCombinedData(combinedDataTemp);
  }, [account, gameModels, playerModels, playerEnrollments]);

  const calculateHPPercentage = (currentHealth: number) => ((currentHealth / 5000) * 100).toFixed(2);

  if (!account || !connected) {
    return (<>
      <BlockingModal isVisible={isWrongNetwork} onSwitchNetwork={()=>{}} />
      <DisconnectedView
        account={account}
        handleLogin={handleLogin}
      />
      </>
    );
  }

  const handlePlay = (gameId: any): void => {
    window.location.replace(`/game/?gameId=${gameId}`);
  };

  const handleShop = () => {
    toast.info("Shop feature to buy sword ranks is coming soon!", DEFAULT_TOAST_STYLE.info);
  }

  const handleEnroll = async (gameId: number) => {
    const toastId = toast.loading(`Enrolling for Game ID: ${gameId}`, DEFAULT_TOAST_STYLE.info);
    const receipt = await enroll(account, gameId);
    try {
      const success = processTxReceipt(receipt);
      if (success) {
        toast.dismiss(toastId);
        toast.success("Successfully joined game!", DEFAULT_TOAST_STYLE.success);
      } else {
        throw new Error("Failed to join the game.")
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.toString(), DEFAULT_TOAST_STYLE.error);
    }
  };

  const handleJoinAsGeneral = async (gameId: number, role: 'North' | 'South') => {
    const toastId = toast.loading(`Joining as ${role} General`, DEFAULT_TOAST_STYLE.info);
    const receipt = await assignGeneral(account, gameId, role == "North" ? 1 : 2);
    try {
      const success = processTxReceipt(receipt);
      if (success) {
        toast.dismiss(toastId);
        toast.success("Successfully joined the game!", DEFAULT_TOAST_STYLE.success);
      } else {
        throw new Error("Failed to join the game.")
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.toString(), DEFAULT_TOAST_STYLE.error);
    }
  };

  const handleStartAsGeneral = async (side: "North" | "South") => {
    const toastId = toast.loading(`Starting a game as the ${side} General`, DEFAULT_TOAST_STYLE.info);
    const receipt = await spawn(account, side == "North" ? 1 : 2);
    try {
      const success = processTxReceipt(receipt as GetTransactionReceiptResponse);
      if (success) {
        toast.dismiss(toastId);
        toast.success("Successfully started game!", DEFAULT_TOAST_STYLE.success);
      } else {
        throw new Error("Failed to start game.")
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.toString(), DEFAULT_TOAST_STYLE.error);
    }
  };

  return (
    <>
    <BlockingModal isVisible={isWrongNetwork} onSwitchNetwork={()=>{}} />
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
      refreshData={refreshData}
      modalOpen={modalOpen}
      startModalOpen={startModalOpen}
    />
    </>
  );
}

export default Lobby;