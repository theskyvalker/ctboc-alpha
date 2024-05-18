import "./GameApp.css";
import Highlightable from "./components/Highlightable";
import Background from "./components/Background";
import React, { useEffect, useState, useMemo } from "react";
import { useMusic } from "./hooks/useMusic";
import useUIStore from "./hooks/useUIStore";
import { CastleButtons } from "./components/Composite/CastleButtons";
import { SellswordButtons } from "./components/Composite/SellswordButtons";
import { HealthBar } from "./components/HealthBar";
import { hexToDecimal, processTxReceipt } from "./utils";
import { AttackResult, FortifyResult } from "./utils/types";
import { DEFAULT_TOAST_STYLE, SELLSWORD_DEFAULT_STYLE } from "./utils/constants";

import { useComponentValue, } from "@dojoengine/react";
import { Entity } from "@dojoengine/recs";
import { useDojo } from "./DojoContext";
import { GAME_STAGES, tryBetterErrorMessage } from "./utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { shortString } from "starknet";

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from "react-toastify";
import NicknameModal from "./components/NicknameModal";
import PayModal from "./components/PayModal";
import { useAccount } from "@starknet-react/core";

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
      components: { Game, GameWorld, Player, GlobalPlayerStats, PlayerCooldowns, PlayerEnrollment },
    }
  } = useDojo();

  const { account } = useAccount();

  useEffect(() => {
    const searchParams = new URLSearchParams(document.location.search);
    setActiveGameId(parseInt(searchParams.get("gameId") || "0"));
  }, []);

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

  const [redBannerImg, setRedBannerImg] = useState("/red-banner.svg");
  const [blueBannerImg, setBlueBannerImg] = useState("/blue-banner.svg");

  // get current component values
  var playerGlobalStats = useComponentValue(GlobalPlayerStats, playerGlobalId);
  var playerGameStats = useComponentValue(Player, playerGameId);
  const gameWorld = useComponentValue(GameWorld, gameWorldId);
  var game = useComponentValue(Game, gameId);
  var playerCooldowns = useComponentValue(PlayerCooldowns, playerGameId);
  var playerEnrolment = useComponentValue(PlayerEnrollment, playerGameId);

  //console.log(shortString.decodeShortString(playerGameStats?.nickname.toString() || ""));

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

  function showButtonsCastle(event: any) {
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
  }

  // Function to hide buttons
  function hideButtons() {
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
  }

  async function attackCastle(): Promise<AttackResult> {
    var receipt;
    if (selectedCastle === "blue") {
      receipt = await attack(account, activeGameId, 1);
    } else {
      receipt = await attack(account, activeGameId, 2);
    }
    console.log("attackCastle receipt: ", receipt);
    if (receipt?.status == "REJECTED") {
      throw new Error("Transaction rejected");
    }
    if (receipt?.execution_status == "REVERTED" && receipt?.execution_status == "ACCEPTED_ON_L2") {
      throw new Error(tryBetterErrorMessage(receipt) || "Transaction reverted");
    }
    if (receipt?.finality_status == "ACCEPTED_ON_L2" && receipt?.execution_status == "SUCCEEDED") {
      return {
        success: true,
        damage: hexToDecimal(receipt?.events[4].data[3]) // Strike event
      }
    } else {
      throw new Error(receipt ? tryBetterErrorMessage(receipt) : "Transaction failed");
    }
  }

  async function getNickname(address: string): Promise<string | undefined> {

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
  }

  async function fortifyCastle(): Promise<boolean> {
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
    const receipt = await pay(account, activeGameId, address, amount);
    console.log("Payment receipt: ", receipt);
    return processTxReceipt(receipt);
  }

  async function changeStage(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
    event.stopPropagation();
    if (!game) return;
    const receipt = await changegamestage(account, activeGameId, game?.stage + 1);
    try {
      processTxReceipt(receipt);
      toast.success(
        "Stage advanced!",
        DEFAULT_TOAST_STYLE
      )
    } catch (error: any) {
      toast.error(
        error.toString(),
        DEFAULT_TOAST_STYLE
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

  useEffect(() => {
    const changeNickname = async () => {
      if (nickConfirmed && game) {
        //console.log("Nickname confirmed:", newNickname);
        try {
          const status = await set_nickname(account, activeGameId, shortString.encodeShortString(newNickname));
          //console.log("set_nickname status: ", status);
        } catch (error) {
          console.error(error);
        }
      }
    };
    changeNickname();
    setNickConfirmed(false);
  }, [nickConfirmed]);

  useEffect(() => {

    function getRandomImage() {
      return Math.floor(Math.random() * 1000);
    }

    const redImageUrl = `/random_banners/${getRandomImage()}.png`;
    const blueImageUrl = `/random_banners/${getRandomImage()}.png`;

    setRedBannerImg(redImageUrl);
    setBlueBannerImg(blueImageUrl);
  }, []);

  async function performSharpen(): Promise<boolean> {
    const receipt = await sharpen(account, activeGameId);
    console.log("Payment receipt: ", receipt);
    return processTxReceipt(receipt);
  }

  return (

    <div id="scene" onClick={hideButtons}>
      <Background id="sky" imageUrl="/sky light.svg" />

      <Highlightable id="logo" imageUrlDefault="/logo.svg" imageUrlRollover="/logo_2_border.svg" onClick={toggleLogoMenu} />

      <Background id="dirt" imageUrl="/dirt.svg" />

      <Background id="red-bushes" imageUrl="/red bushes.svg" />
      <Background id="blue-bushes" imageUrl="/blue bushes.svg" />

      <Highlightable id="blue-castle" imageUrlDefault="/blue castle.svg" imageUrlRollover="/blue castle rollover.svg" onClick={showButtonsCastle} />

      <Highlightable id="red-castle" imageUrlDefault="/red castle.svg" imageUrlRollover="/red castle rollover.svg" onClick={showButtonsCastle} />

      <Background id="red-tree" imageUrl="/red tree.svg" />
      <Background id="blue-tree" imageUrl="/blue tree.svg" />

      <Background id="red-fence" imageUrl="/red fence.svg" />
      <Background id="blue-fence" imageUrl="/blue fence.svg" />

      <Background id="red-foliage" imageUrl="/red foliage.svg" />
      <Background id="blue-foliage" imageUrl="/blue foliage.svg" />

      <Background id="red-banner" imageUrl={redBannerImg} />
      <Background id="blue-banner" imageUrl={blueBannerImg} />

      {displayButtonsCastle && (selectedCastle == "red" || selectedCastle == "blue") && (
        <CastleButtons castle={selectedCastle} attack={attackCastle} isGeneral={playerGameStats?.isGeneral} gold={playerGameStats?.gold || 0} fortify={fortifyCastle} />
      )}

      {displayButtonsSellsword && (
        <SellswordButtons sharpen={performSharpen} />
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

      <ToastContainer className={'toast-container'} />

    </div>

  );
}

export default GameApp;