import "./GameApp.css";
import Highlightable from "./components/Highlightable";
import Background from "./components/Background";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useMusic } from "./hooks/useMusic";
import useUIStore from "./hooks/useUIStore";
import { CastleButtons } from "./components/Composite/CastleButtons";
import { SellswordButtons } from "./components/Composite/SellswordButtons";
import { HealthBar } from "./components/HealthBar";
import { hexToDecimal, processTxReceipt } from "./utils";
import { AttackResult, Banner, SelectedBannersPerGame } from "./utils/types";
import { DEFAULT_TOAST_STYLE, DEFAULT_TOAST_STYLE_SUBSET, GENERAL_DEFAULT_COOLDOWN, GRAPHQL_ENDPOINT, SELLSWORD_DEFAULT_STYLE, SWORD_DEFAULT_COOLDOWN } from "./utils/constants";

import { useComponentValue, } from "@dojoengine/react";
import { Entity } from "@dojoengine/recs";
import { useDojo } from "./dojo/useDojo";
import { GAME_STAGES, tryBetterErrorMessage } from "./utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { provider, shortString } from "starknet";

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from "react-toastify";
import NicknameModal from "./components/NicknameModal";
import PayModal from "./components/PayModal";
import { starknetChainId, StarknetConfig, useAccount, useProvider } from "@starknet-react/core";
import { sepolia } from "@starknet-react/chains";
import { useNetworkValidation } from "./hooks/useNetworkValidation";
import BlockingModal from "./components/BlockingModal";
import EventDisplay from "./components/EventDisplay";
import MiniEventLog from "./components/MiniEventLog";
import useFilteredEventSubscription from "./hooks/useFilteredEventSubscription";
import GameButtons from "./components/Composite/GameButtons";
import ArrowButton from "./components/ArrowButton";

import { useCookies } from 'react-cookie';
import BannerGrid from "./components/ui/BannerGrid";
import Lobby from "./Lobby";

function GameApp() {

  const {
    displayButtonsCastle,
    setDisplayButtonsCastle,
    displayButtonsSellsword,
    setDisplayButtonsSellsword,
    ongoingAnimation,
    setOngoingAnimation,
    activeGameId,
    setActiveGameId,
    isBgmMuted,
    setIsBgmMuted,
    damageNorth,
    setDamageNorth,
    damageSouth,
    setDamageSouth,
    selectedCastle,
    setSelectedCastle,
    redHP,
    setRedHP,
    blueHP,
    setBlueHP,
    showPayModal,
    sellswordStyle,
    setSellswordStyle,
    walkBlueRef,
    attackBlueRef,
    walkRedRef,
    attackRedRef,
    damageTextBlueRef,
    damageTextRedRef,
    showLogoMenu,
    setShowLogoMenu,
    showFortifyMenu,
    setShowFortifyMenu,
    fortifyAmount,
    setFortifyAmount,
    showProfileMenu,
    setShowProfileMenu,
    blacksmithRef,
    sharpenCoinRef,
    showNickModal,
    setShowNickModal,
    newNickname,
    setNewNickname,
    nickConfirmed,
    setNickConfirmed
  } = useUIStore();

  const {
    setup: {
      systemCalls: { unenroll, fortify, sharpen, attack, pay, changegamestage, set_nickname, get_nickname },
      clientComponents: { Game, GameWorld, Player, GlobalPlayerStats, PlayerCooldowns, PlayerEnrollment },
    }
  } = useDojo();

  const { account } = useAccount();

  const { isWrongNetwork, switchNetwork } = useNetworkValidation();
  const [cookies, setCookie] = useCookies(['selectedBanners']);

  useEffect(() => {
    const searchParams = new URLSearchParams(document.location.search);
    setActiveGameId(parseInt(searchParams.get("gameId") || "0"));
  }, []);

  const { formattedEvents, formattedEventsNorth, formattedEventsSouth } = useFilteredEventSubscription(activeGameId);

  //console.log("account.address: ", account.address);
  //console.log("activeGameId: ", activeGameId);

  let playerGameId;
  let playerGlobalId;
  let gameWorldId;
  var gameId;

  if (account) {
    playerGameId = getEntityIdFromKeys([BigInt(account.address), BigInt(activeGameId)]) as Entity;
    playerGlobalId = getEntityIdFromKeys([BigInt(account.address)]) as Entity;
    gameWorldId = getEntityIdFromKeys([BigInt(shortString.encodeShortString("game"))]) as Entity;
    gameId = getEntityIdFromKeys([BigInt(activeGameId)]) as Entity;
  }

  const [bannerPortfolio, setBannerPortfolio] = useState<Banner[]>([]);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [selectedBannerSide, setSelectedBannerSide] = useState<'red' | 'blue' | null>(null);
  const [redBannerImg, setRedBannerImg] = useState("/red-banner.svg");
  const [blueBannerImg, setBlueBannerImg] = useState("/blue-banner.svg");

  // get current component values
  // var playerGlobalStats = useComponentValue(GlobalPlayerStats, playerGlobalId);
  var playerGameStats = useComponentValue(Player, playerGameId);
  const gameWorld = useComponentValue(GameWorld, gameWorldId);
  var game = useComponentValue(Game, gameId);
  // var playerCooldowns = useComponentValue(PlayerCooldowns, playerGameId);
  // var playerEnrolment = useComponentValue(PlayerEnrollment, playerGameId);

  //console.log(shortString.decodeShortString(playerGameStats?.nickname.toString() || ""));

  useEffect(() => {
    if (account?.address) {
      fetchBannerPortfolio(account.address);
    }
  }, [account?.address]);

  const fetchBannerPortfolio = async (address: string) => {
    let toastId;
    try {
      toastId = toast.loading("Loading your Pixel Banners...", DEFAULT_TOAST_STYLE.info);
      const response = await fetch(`https://sepolia-nft-api.vercel.app/api/nft/portfolio/${address}`, {
        headers: {
          "x-api-key": "<TESTNET NFT INDEXER API KEY>"
        }
      });
      const data = await response.json();
      console.log("Banner portfolio: ", data);
      setBannerPortfolio(data);
      toast.dismiss(toastId);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Error fetching banner portfolio', DEFAULT_TOAST_STYLE.error);
      console.error('Error fetching banner portfolio', error);
    }
  };

  const handleRedBannerClick = (event: React.MouseEvent) => {
    setSelectedBannerSide('red');
    setShowBannerModal(true);
    console.log("Red Clicked");
    event.stopPropagation();
  };

  const handleBlueBannerClick = (event: React.MouseEvent) => {
    setSelectedBannerSide('blue');
    setShowBannerModal(true);
    console.log("Blue Clicked");
    event.stopPropagation();
  };

  useEffect(() => {
    if (game && !ongoingAnimation) {
      setRedHP(game?.castle2Health);
      setBlueHP(game?.castle1Health);
    }
  }, [game, ongoingAnimation]);

  const playState = useMemo(
    () => ({
      isInBattle: ongoingAnimation,
      isMuted: isBgmMuted,
    }),
    [ongoingAnimation, isBgmMuted]
  );

  const { play, stop } = useMusic(playState, {
    volume: 0.2,
    loop: true,
  });

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
  }, []);

  function resetSellsword() {
    if (ongoingAnimation || showLogoMenu) {
      return;
    }
    // reset sellsword position
    setSellswordStyle(SELLSWORD_DEFAULT_STYLE);
  }

  /*function showButtonsCastle(event: any) {
    if (ongoingAnimation || showLogoMenu) {
      return;
    }
    setDisplayButtonsSellsword(false);
    event.stopPropagation();
    //console.log("showButtonsCastle");
    //console.log(event.currentTarget.id);

    // Check which castle is clicked
    if (event.currentTarget.id === "blue-castle") {

      setSelectedCastle("blue");
      setDisplayButtonsCastle(true);

      // If blue castle is clicked, set the sellsword position as it is
      setSellswordStyle({
        left: "30%",
        right: "",
        transform: "none",
        filter: "sepia(100%) saturate(500%) hue-rotate(300deg)",
        display: "block"
      });

    } else if (event.currentTarget.id === "red-castle") {

      setSelectedCastle("red");
      setDisplayButtonsCastle(true);

      // If red castle is clicked, flip the sellsword horizontally and change position
      setSellswordStyle({
        left: "",
        right: "30%",
        transform: "scaleX(-1)",
        filter: "sepia(100%) saturate(500%) hue-rotate(190deg)",
        display: "block"
      });
    }
  }*/

  // Function to hide buttons
  /*function hideButtons() {
    setSelectedCastle("");
    setDisplayButtonsCastle(false);
    setDisplayButtonsSellsword(false);
    setShowLogoMenu(false);
    //console.log("hideButtons");
    resetSellsword();
  }

  function showButtonsSellsword(event: any) {
    if (ongoingAnimation || showLogoMenu) {
      return;
    }
    //console.log("showButtonsSellsword");
    setDisplayButtonsCastle(false);
    setDisplayButtonsSellsword(true);
    event.stopPropagation();
  }*/

  async function getTimeDifferenceFromLastStrike(gameId: string, player: string): Promise<number> {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              ctbocPlayerCooldownsModels(where: { player: "${player}", gameId: "${gameId}" }) {
                edges {
                  node {
                    player
                    gameId
                    lastStrike
                  }
                }
              }
            }
          `,
        }),
      });

      const result = await response.json();

      // Check if data was returned
      if (!result.data || result.data.ctbocPlayerCooldownsModels.edges.length === 0) {
        console.info('No data found for the specified player or game.');
        return SWORD_DEFAULT_COOLDOWN + 1;
      }

      // Extract the lastStrike value (hexadecimal)
      const lastStrikeHex = result.data.ctbocPlayerCooldownsModels.edges[0].node.lastStrike;
      console.log('lastStrike (hex):', lastStrikeHex);

      // Step 2: Convert hex to decimal (Unix timestamp)
      const lastStrikeTimestamp = parseInt(lastStrikeHex, 16); // Convert hex to decimal
      console.log('lastStrike (Unix timestamp):', lastStrikeTimestamp);

      // Step 3: Get the current time in Unix format (seconds since Epoch)
      const currentTime = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
      console.log('Current time (Unix timestamp):', currentTime);

      // Step 4: Calculate the difference in time (in minutes)
      const timeDifferenceInSeconds = currentTime - lastStrikeTimestamp;
      const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);

      if (timeDifferenceInMinutes < 60) {
        console.log(`Time difference: ${timeDifferenceInMinutes} minutes`);
      } else {
        // Step 5: Convert time into weeks, days, hours, and minutes
        const weeks = Math.floor(timeDifferenceInMinutes / (7 * 24 * 60));
        const days = Math.floor((timeDifferenceInMinutes % (7 * 24 * 60)) / (24 * 60));
        const hours = Math.floor((timeDifferenceInMinutes % (24 * 60)) / 60);
        const minutes = timeDifferenceInMinutes % 60;

        console.log(`Time difference: ${weeks} weeks, ${days} days, ${hours} hours, and ${minutes} minutes`);
      }
      return timeDifferenceInSeconds;
    } catch (error) {
      console.error('Error fetching or processing data:', error);
      return -1;
    }
  }

  /* functions related to handling keyboard and mouse button controls */
  const [currentButtonSet, setCurrentButtonSet] = useState<'sellsword' | 'redCastle' | 'blueCastle'>('sellsword');
  const [focusedButtonIndex, setFocusedButtonIndex] = useState(0);

  const castleButtonsRef = useRef<{ invokeAction: () => void }>(null);
  const sellswordButtonsRef = useRef<{ invokeAction: () => void }>(null);

  const buttonSets: Array<'redCastle' | 'sellsword' | 'blueCastle'> = ['redCastle', 'sellsword', 'blueCastle'];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      switch (event.key) {
        case 'ArrowLeft':
          handleLeftKey();
          break;
        case 'ArrowRight':
          handleRightKey();
          break;
        case 'ArrowUp':
          setFocusedButtonIndex((prev) => (prev > 0 ? prev - 1 : getButtonCount() - 1));
          break;
        case 'ArrowDown':
          setFocusedButtonIndex((prev) => (prev < getButtonCount() - 1 ? prev + 1 : 0));
          break;
        case ' ':
        case 'Enter':
          handleAction();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentButtonSet, focusedButtonIndex]);

  const handleAction = () => {
    if (currentButtonSet === 'sellsword' && sellswordButtonsRef.current) {
      sellswordButtonsRef.current.invokeAction();
    } else if ((currentButtonSet === 'redCastle' || currentButtonSet === 'blueCastle') && castleButtonsRef.current) {
      castleButtonsRef.current.invokeAction();
    }
  };

  const getButtonCount = () => {
    switch (currentButtonSet) {
      case 'sellsword':
        return 3;
      case 'redCastle':
      case 'blueCastle':
        return 2;
      default:
        return 0;
    }
  };

  let currentButtonSetIndex = buttonSets.indexOf(currentButtonSet as any);

  const handleLeftKey = () => {
    if (currentButtonSetIndex > 0) {
      const newIndex = currentButtonSetIndex - 1;
      setCurrentButtonSet(buttonSets[newIndex]);
      setFocusedButtonIndex(0);
    }
  };

  const handleRightKey = () => {
    if (currentButtonSetIndex < buttonSets.length - 1) {
      const newIndex = currentButtonSetIndex + 1;
      setCurrentButtonSet(buttonSets[newIndex]);
      setFocusedButtonIndex(0);
    }
  };

  useEffect(() => {
    if (currentButtonSet === 'redCastle') {
      setSelectedCastle('red');
      setSellswordStyle({
        left: "",
        right: "30%",
        transform: "scaleX(-1)",
        filter: "sepia(100%) saturate(500%) hue-rotate(190deg)",
        display: "block"
      });
    } else if (currentButtonSet === 'blueCastle') {
      setSelectedCastle('blue');
      setSellswordStyle({
        left: "30%",
        right: "",
        transform: "none",
        filter: "sepia(100%) saturate(500%) hue-rotate(300deg)",
        display: "block"
      });
    } else if (currentButtonSet === 'sellsword') {
      setSellswordStyle(SELLSWORD_DEFAULT_STYLE);
    } else {
      resetSellsword();
    }
  }, [currentButtonSet]);

  function showButtonsCastle(event: any) {
    if (ongoingAnimation || showLogoMenu) {
      return;
    }
    event.stopPropagation();

    if (event.currentTarget.id === "blue-castle") {
      setSelectedCastle("blue");
      setCurrentButtonSet('blueCastle');
      setFocusedButtonIndex(0);
      setSellswordStyle({
        left: "30%",
        right: "",
        transform: "none",
        filter: "sepia(100%) saturate(500%) hue-rotate(300deg)",
        display: "block"
      });
    } else if (event.currentTarget.id === "red-castle") {
      setSelectedCastle("red");
      setCurrentButtonSet('redCastle');
      setFocusedButtonIndex(0);
      setSellswordStyle({
        left: "",
        right: "30%",
        transform: "scaleX(-1)",
        filter: "sepia(100%) saturate(500%) hue-rotate(190deg)",
        display: "block"
      });
    }
  }

  function showButtonsSellsword(event: any) {
    if (ongoingAnimation || showLogoMenu) {
      return;
    }
    event.stopPropagation();
    setCurrentButtonSet('sellsword');
    setFocusedButtonIndex(0);
  }

  function hideButtons() {
    setSelectedCastle("");
    setShowBannerModal(false);
    setShowLogoMenu(false);
    resetSellsword();
  }

  function triggerCooldownMessage(delta: number, playerCooldown: number) {
    const remainingTimeInSeconds = playerCooldown - delta;

    const hours = Math.floor(remainingTimeInSeconds / 3600);
    const minutes = Math.floor((remainingTimeInSeconds % 3600) / 60);
    const seconds = remainingTimeInSeconds % 60;

    let timeMessage = '';
    if (hours > 0) {
      timeMessage += `${hours} hours, `;
    }
    if (minutes > 0 || hours > 0) {
      timeMessage += `${minutes} minutes, `;
    }
    timeMessage += `${seconds} seconds`;

    return `Attack on cooldown for ${timeMessage}`;
  }

  async function attackCastle(): Promise<AttackResult> {
    if (!account) throw new Error("Not connected");
    const delta = await getTimeDifferenceFromLastStrike(activeGameId.toString(), account?.address.toString() || "");
    const playerCooldown = playerGameStats?.isGeneral ? GENERAL_DEFAULT_COOLDOWN : SWORD_DEFAULT_COOLDOWN;
    if (delta < playerCooldown) {
      throw new Error(triggerCooldownMessage(delta, playerCooldown));
    }
    var receipt;
    if (selectedCastle === "blue") {
      receipt = await attack(account, activeGameId, 1) as any;
    } else {
      receipt = await attack(account, activeGameId, 2) as any;
    }
    console.log("attackCastle receipt: ", receipt);
    if (!receipt) {
      throw new Error("Failed to get transaction status.");
    }
    if (receipt.execution_status === "REJECTED") {
      throw new Error("Transaction rejected");
    }
    if (receipt.execution_status === "REVERTED") {
      throw new Error(tryBetterErrorMessage(receipt) || "Transaction reverted");
    }
    if (receipt.execution_status === "SUCCEEDED") {
      console.log(receipt);
      return {
        success: true,
        //@ts-ignore
        damage: hexToDecimal(receipt?.events[4].data[5]) // Strike event
      }
    } else {
      throw new Error(receipt ? tryBetterErrorMessage(receipt) : "Transaction failed");
    }
  }

  function setBannersFromCookies() {
    const selectedBannersPerGame: SelectedBannersPerGame = cookies['selectedBanners'];
    if (selectedBannersPerGame) {
      try {
        const selectedBanners = selectedBannersPerGame[activeGameId];

        if (selectedBanners) {
          const redBanner = bannerPortfolio.find(
            (banner) => banner.tokenId === selectedBanners.red
          );
          const blueBanner = bannerPortfolio.find(
            (banner) => banner.tokenId === selectedBanners.blue
          );

          if (redBanner) {
            setRedBannerImg(redBanner.dataURL);
          } else {
            setRedBannerImg(`/random_banners/${Math.floor(Math.random() * 1000)}.png`);
          }

          if (blueBanner) {
            setBlueBannerImg(blueBanner.dataURL);
          } else {
            setBlueBannerImg(`/random_banners/${Math.floor(Math.random() * 1000)}.png`);
          }
        } else {
          // No banners selected for this game ID
          setRedBannerImg(`/random_banners/${Math.floor(Math.random() * 1000)}.png`);
          setBlueBannerImg(`/random_banners/${Math.floor(Math.random() * 1000)}.png`);
        }
      } catch (error) {
        console.error(
          `Unable to parse cookies: ${selectedBannersPerGame} with error: ${error}`
        );
      }
    } else {
      // No cookie exists, set random banners
      setRedBannerImg(`/random_banners/${Math.floor(Math.random() * 1000)}.png`);
      setBlueBannerImg(`/random_banners/${Math.floor(Math.random() * 1000)}.png`);
    }
  }

  /*async function getNickname(address: string): Promise<string | undefined> {

    const receipt = await get_nickname(account, activeGameId, address);
    console.log("get_nickname receipt: ", receipt);

    if (receipt?.status == "REJECTED") {
      console.log("throwing error due to reject");
      throw new Error(tryBetterErrorMessage(receipt));
    } else if (receipt?.execution_status == "REVERTED" && receipt?.finality_status == "ACCEPTED_ON_L2") {
      console.log("throwing error due to revert");
      throw new Error(tryBetterErrorMessage(receipt));
    } else if (receipt?.finality_status == "ACCEPTED_ON_L2" && receipt?.execution_status == "SUCCEEDED") {
      return shortString.decodeShortString(receipt?.events[0].data[2]); // Nickname event
    }
  }*/

  async function getNickname(address: string): Promise<string | undefined> {
    try {
      if (account) {
        return await get_nickname(account, activeGameId, address);
      }
    } catch {
      return undefined;
    }
  }

  async function fortifyCastle(): Promise<boolean> {
    if (!account) return false;
    let receipt;

    if (selectedCastle === "blue") {
      receipt = await fortify(account, activeGameId, 1, fortifyAmount);
    } else {
      receipt = await fortify(account, activeGameId, 2, fortifyAmount);
    }

    console.log("fortifyCastle receipt: ", receipt);

    return processTxReceipt(receipt);
  }

  async function performPayment(address: string, amount: number): Promise<boolean> {
    if (!account) return false;
    const receipt = await pay(account, activeGameId, address, amount);
    console.log("Payment receipt: ", receipt);
    return processTxReceipt(receipt);
  }

  async function changeStage(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
    event.stopPropagation();
    if (!game || !account) return;
    const receipt = await changegamestage(account, activeGameId, game?.stage + 1);
    try {
      processTxReceipt(receipt);
      toast.success(
        "Stage advanced!",
        DEFAULT_TOAST_STYLE.success
      )
    } catch (error: any) {
      toast.error(
        error.toString(),
        DEFAULT_TOAST_STYLE.error
      )
    }
  }

  const toggleLogoMenu = (event: React.PointerEvent) => {
    event?.stopPropagation();
    setShowLogoMenu(!showLogoMenu);
  }

  const toggleNickModal = (event: React.PointerEvent) => {
    event?.stopPropagation();
    //console.log("toggleNickModal");
    setShowNickModal(!showNickModal);
  }

  const handleBannerSelect = (banner: Banner) => {
    let selectedBannersPerGame: SelectedBannersPerGame = {};

    if (cookies['selectedBanners']) {
      try {
        selectedBannersPerGame = cookies['selectedBanners'];
      } catch (error) {
        console.error(
          `Unable to parse cookies: ${cookies['selectedBanners']} as valid JSON`
        );
      }
    }

    // Initialize the selected banners for this game ID if not present
    if (!selectedBannersPerGame[activeGameId]) {
      selectedBannersPerGame[activeGameId] = { red: null, blue: null };
    }

    if (selectedBannerSide === 'red') {
      setRedBannerImg(banner.dataURL);
      selectedBannersPerGame[activeGameId].red = banner.tokenId;
    } else if (selectedBannerSide === 'blue') {
      setBlueBannerImg(banner.dataURL);
      selectedBannersPerGame[activeGameId].blue = banner.tokenId;
    }

    // Save the updated selected banners per game back to the cookie
    setCookie('selectedBanners', JSON.stringify(selectedBannersPerGame), { path: '/' });
    setShowBannerModal(false);
  };

  useEffect(() => {
    setBannersFromCookies();
  }, [bannerPortfolio, cookies['selectedBanners'], activeGameId]);

  useEffect(() => {
    const changeNickname = async () => {
      if (nickConfirmed && game !== undefined && account) {
        try {
          console.log("Change nickname game ID: ", activeGameId, newNickname);
          const status = await set_nickname(account, activeGameId, shortString.encodeShortString(newNickname));
          console.log("set_nickname status: ", status);
        } catch (error) {
          console.error(error);
        }
      }
    };
    changeNickname();
    setNickConfirmed(false);
  }, [nickConfirmed]);

  useEffect(() => {

    /*function getRandomImage() {
      return Math.floor(Math.random() * 1000);
    }

    const redImageUrl = `/random_banners/${getRandomImage()}.png`;
    const blueImageUrl = `/random_banners/${getRandomImage()}.png`;

    setRedBannerImg(redImageUrl);
    setBlueBannerImg(blueImageUrl);*/
    setBannersFromCookies();
  }, []);

  async function performSharpen(): Promise<boolean> {
    if (account) {
      const receipt = await sharpen(account, activeGameId);
      console.log("Payment receipt: ", receipt);
      return processTxReceipt(receipt);
    } else {
      return false;
    }
  }

  async function showHelp() {
    console.log("help.");
  }

  return (
    <div id="scene" onClick={hideButtons}>
      <BlockingModal isVisible={isWrongNetwork} onSwitchNetwork={() => { }} />
      <Background id="sky" imageUrl="/sky light.svg" />

      <div className="idDisplay">Game ID: {activeGameId}</div>

      <Highlightable id="logo" imageUrlDefault="/logo.svg" imageUrlRollover="/logo_2_border.svg" onClick={toggleLogoMenu} tooltip="Main Menu" providedTooltipStyle={{ left: "45%", top: "2%" }} />
      <Background id="help-button" imageUrl="/help_button.svg" onClick={showHelp} tooltip="Click to see help" providedTooltipStyle={{ left: "50%" }} />

      <Background id="dirt" imageUrl="/dirt.svg" />

      <Background id="red-bushes" imageUrl="/red bushes.svg" />
      <Background id="blue-bushes" imageUrl="/blue bushes.svg" />

      <Highlightable id="blue-castle" imageUrlDefault="/blue castle.svg" imageUrlRollover="/blue castle rollover.svg" onClick={showButtonsCastle} tooltip="North Castle Actions" providedTooltipStyle={{ right: "15%", top: "50%" }} />

      <Highlightable id="red-castle" imageUrlDefault="/red castle.svg" imageUrlRollover="/red castle rollover.svg" onClick={showButtonsCastle} tooltip="South Castle Actions" providedTooltipStyle={{ left: "15%", top: "50%" }} />

      <Background id="red-tree" imageUrl="/red tree.svg" />
      <Background id="blue-tree" imageUrl="/blue tree.svg" />

      <Background id="red-fence" imageUrl="/red fence.svg" />
      <Background id="blue-fence" imageUrl="/blue fence.svg" />

      <Background id="red-foliage" imageUrl="/red foliage.svg" />
      <Background id="blue-foliage" imageUrl="/blue foliage.svg" />

      <Background id="red-banner" className="banner-image" imageUrl={redBannerImg} onClick={handleRedBannerClick} tooltip="Choose Banner" providedTooltipStyle={{ left: "35%", top: "61%" }} />
      <Background id="blue-banner" className="banner-image" imageUrl={blueBannerImg} onClick={handleBlueBannerClick} tooltip="Choose Banner" providedTooltipStyle={{ right: "35%", top: "61%" }} />

      {/*{displayButtonsCastle && (selectedCastle == "red" || selectedCastle == "blue") && (
        <CastleButtons castle={selectedCastle} attack={attackCastle} isGeneral={playerGameStats?.isGeneral} gold={playerGameStats?.gold || 0} fortify={fortifyCastle} />
      )}

      {displayButtonsSellsword && (
        <SellswordButtons sharpen={performSharpen} />
      )}*/}

      {/*<GameButtons 
      attack={attackCastle}
      fortify={fortifyCastle}
      gold={playerGameStats?.gold}
      isGeneral={playerGameStats?.isGeneral}
      sharpen={performSharpen}
      />*/}

      {currentButtonSet && (
        <GameButtons
          currentButtonSet={currentButtonSet}
          focusedButtonIndex={focusedButtonIndex}
          attack={attackCastle}
          fortify={fortifyCastle}
          gold={playerGameStats?.gold || 0}
          isGeneral={playerGameStats?.isGeneral}
          sharpen={performSharpen}
          castleButtonsRef={castleButtonsRef}
          sellswordButtonsRef={sellswordButtonsRef}
        />
      )}

      {/* Arrow Buttons */}
      {currentButtonSetIndex > 0 && (
        <ArrowButton
          direction="left"
          onClick={handleLeftKey}
          style={{ position: 'absolute', left: '35%', top: '50%' }}
        />
      )}
      {currentButtonSetIndex < buttonSets.length - 1 && (
        <ArrowButton
          direction="right"
          onClick={handleRightKey}
          style={{ position: 'absolute', right: '35%', top: '50%' }}
        />
      )}

      <HealthBar castle="red" health={redHP} />
      <HealthBar castle="blue" health={blueHP} />

      <Highlightable id="sellsword" imageUrlDefault="/IDLE.gif" imageUrlRollover="/IDLE rollover.gif" style={sellswordStyle} onClick={showButtonsSellsword} />
      {/*<Background id="blacksmith" imageUrl="/BLACKSMITH.gif" />*/}

      <div id="blacksmith" ref={blacksmithRef}></div>

      <div id="sharpencoin" ref={sharpenCoinRef}></div>

      <div id="walk-anim-to-blue" ref={walkBlueRef}></div>
      <div id="walk-anim-to-red" ref={walkRedRef}></div>

      <div id="attack-anim-red" ref={attackRedRef}></div>
      <div id="attack-anim-blue" ref={attackBlueRef}></div>

      <p id="damage-blue" className={damageNorth >= 100 ? "FloatingCombatTextCritical" : "FloatingCombatText"} ref={damageTextBlueRef} style={{ top: '64%', left: '70%' }}>{damageNorth >= 100 ? "⚡" : ""}{damageNorth}</p>
      <p id="damage-red" className={damageNorth >= 100 ? "FloatingCombatTextCritical" : "FloatingCombatText"} ref={damageTextRedRef} style={{ top: '64%', left: '20%' }}>{damageSouth >= 100 ? "⚡" : ""}{damageSouth}</p>

      <div className={"notifications"}>
        <EventDisplay formattedEvents={formattedEvents} />
      </div>

      <MiniEventLog castle="south" events={formattedEventsSouth} />
      <MiniEventLog castle="north" events={formattedEventsNorth} />

      {/*<button id="mute" className="svg-background" style={{top: '10%', left: '45%', height: '15%', width: '20%'}} onClick={() => setIsBgmMuted(!isBgmMuted)}>{isBgmMuted ? "Unmute" : "Mute"}</button>*/}

      {showProfileMenu &&
        <div id="profile-menu" onClick={(event: any) => event?.stopPropagation()}>
          <p style={{ color: 'Black', marginTop: '1rem' }}>Connected account: {account?.address.toString().substring(0, 4) + '...' + account?.address.toString().substring(account.address.toString().length - 4)}</p>
          <p style={{ color: 'Black' }}>Nickname: {shortString.decodeShortString(playerGameStats?.nickname.toString() || "")}</p> <button className="menu-button" onClick={(e: any) => toggleNickModal(e)}>Set Nickname</button>
          <p style={{ color: 'Black' }}>Total Gold: {playerGameStats?.gold}</p>
          <p style={{ color: 'Black' }}>Your role: {playerGameStats?.isGeneral ? `General of the ${playerGameStats?.address == game?.northGeneral ? "North (Blue) Castle" : "South (Red) Castle"} ` : "Sellsword"}</p>
          <p style={{ color: 'Black' }}>{playerGameStats?.sharpened ? "Your blade is sharpened!" : "Blade is not sharpened."}</p>
          <p style={{ color: 'Black' }}>Total Damage: {playerGameStats?.totalStrikeDamage}</p>
          <p style={{ color: 'Black' }}>Number of Strikes: {playerGameStats?.totalStrikes}</p>
          <button className="button menu-button" style={{ marginBottom: '1rem' }} onClick={() => { setShowProfileMenu(false) }}>Close Menu</button>
        </div>
      }

      {showLogoMenu &&
        <div id="logo-menu" onClick={(event: any) => event?.stopPropagation()}>
          <div style={{ color: 'Black', display: 'flex', flexDirection: 'column' }}>
            <div>
              Active Game World:
              <select
                value={activeGameId}
                onChange={(e) => { setActiveGameId(parseInt(e.target.value)); }}
              >
                {Array.from({ length: gameWorld ? Number(gameWorld.nextGameId) : 0 }, (_, index) => (
                  <option value={index} key={index}>
                    {index}
                  </option>
                ))}
              </select>
            </div>
            <p style={{ color: 'Black' }}>Connected account: {account?.address.toString().substring(0, 4) + '...' + account?.address.toString().substring(account.address.toString().length - 4)}</p>
            <div id="dev-mode">
              {/*<button className="button menu-button" style={{fontSize: '0.9rem'}} onClick={create}>
                {isDeploying ? "Deploying Burner" : "Create Burner"}
                </button>*/}
              {/*<div>
                Select Account: <select
                  style={{ fontSize: '0.8rem' }}
                  value={account ? account.address : ""}
                  onChange={(e) => { select(e.target.value) }}
                >
                  {list().map((account, index) => {
                    return (
                      <option value={account.address} key={index}>
                        {account.address}
                      </option>
                    );
                  })}
                </select>
                </div>*/}
            </div>
            {game &&
              <div className="sub-menu">
                <p style={{ color: 'Black' }}>Current game stage: {GAME_STAGES[game.stage]}</p>
                <button id="play" className="menu-button" onClick={changeStage}>Advance Stage</button>
              </div>}
            {game && <p style={{ color: 'Black' }}>Total Players: {game.numPlayers.toString()}</p>}
          </div>
          <button id="play" className="button menu-button"><a href="/" style={{ color: 'white' }}>Main Menu</a></button>
          <button id="mute" className="button menu-button" onClick={() => setIsBgmMuted(!isBgmMuted)}>{isBgmMuted ? "Play Music" : "Stop Music"}</button>
          <button id="play" className="button menu-button" onClick={() => { setShowLogoMenu(false) }}>Close Menu</button>
        </div>
      }

      {showNickModal && <div id="nick-modal"><NicknameModal /></div>}
      {showPayModal && <PayModal getNickname={getNickname} gold={playerGameStats?.gold || 0} performPayment={(address, amount) => performPayment(address, amount)} />}
      {/* Render the BannerGrid component inside the modal */}
      {showBannerModal && (
        <div id="banner-modal" onClick={(event) => event.stopPropagation()}>
          <BannerGrid
            bannerPortfolio={bannerPortfolio}
            onBannerSelect={handleBannerSelect}
            previewBgColor={"transparent"}
          />
        </div>
      )}

      <ToastContainer className={'toast-container'} />

    </div>

  );
}

export default GameApp;