import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Background from './Background';
import Highlightable from './Highlightable';
import JoinGameModal from './JoinGameModal';
import StartGameModal from './StartGameModal';
import { hexToDecimal } from '../utils';
import { RefreshCwIcon } from 'lucide-react';
import 'intro.js/introjs.css';
import './connectedview.css';
import { Steps, Hints } from 'intro.js-react';
import { useCookies } from 'react-cookie';
import useUIStore from '../hooks/useUIStore';
import { fetchGameNames, fetchPinnedGames, updateGameName } from '../hooks/supabaseClient';

interface ConnectedViewProps {
  account: any;
  playerGlobalStats: any;
  combinedData: any[];
  formatAddress: (address: string) => string;
  formatStartTime: (hexTime: string) => string;
  calculateHPPercentage: (currentHealth: number) => string;
  handlePlay: (gameId: any) => void;
  handleShop: () => void;
  handleEnroll: (gameId: number) => void;
  handleDisconnect: () => void;
  handleJoinAsGeneral: (gameId: number, role: 'North' | 'South') => void;
  handleStartAsNorthGeneral: () => void;
  handleStartAsSouthGeneral: () => void;
  setModalOpen: (open: boolean) => void;
  setStartModalOpen: (open: boolean) => void;
  refreshData: () => void;
  modalOpen: boolean;
  startModalOpen: boolean;
}

const ConnectedView: React.FC<ConnectedViewProps> = ({
  account,
  playerGlobalStats,
  combinedData,
  formatAddress,
  formatStartTime,
  calculateHPPercentage,
  handlePlay,
  handleShop,
  handleEnroll,
  handleDisconnect,
  handleJoinAsGeneral,
  handleStartAsNorthGeneral,
  handleStartAsSouthGeneral,
  setModalOpen,
  setStartModalOpen,
  refreshData,
  modalOpen,
  startModalOpen
}) => {

  const [stepsEnabled, setStepsEnabled] = useState(true);
  const [cookies] = useCookies(['introjs-dontShowAgain']);
  const {gameNames, setGameNames, pinnedGames, setPinnedGames} = useUIStore();

  useEffect(() => {
    const loadPinnedGames = async () => {
      const pinned = await fetchPinnedGames();
      console.log("pinned games: ", pinned);
      setPinnedGames(pinned);
    };
    loadPinnedGames();
  }, []);

  const sortedGames = [...combinedData].sort((a, b) => {
    const isPinnedA = pinnedGames.includes(hexToDecimal(a.gameId));
    const isPinnedB = pinnedGames.includes(hexToDecimal(b.gameId));

    if (isPinnedA && !isPinnedB) return -1;
    if (!isPinnedA && isPinnedB) return 1;
    return 0;
  });

  useEffect(() => {
    if (cookies['introjs-dontShowAgain'] === 'true') {
      setStepsEnabled(false);
    }
  }, [cookies]);

  async function mintTestnetLORDS() {
    await account.execute({
        contractAddress: "0x044e6bcc627e6201ce09f781d1aae44ea4c21c2fdef299e34fce55bef2d02210",
        entrypoint: "mint",
        calldata: [account.address, (500 * (10 ** 18)).toString(), 0]
    });
  }

  useEffect(() => {
    const loadGameNames = async () => {
      const names = await fetchGameNames();
      console.log("Game Names: ", names);
      const namesMap = names.reduce((acc, { id, game_name }) => {
        acc[id] = game_name;
        return acc;
      }, {});
      console.log(namesMap);
      setGameNames(namesMap);
    };
    loadGameNames();
  }, []);

  const steps = [
    {
      element: '#left-banner',
      intro: 'This is where you will see your stats once you start fighting in some sieges.',
      position: 'bottom',
    },
    {
      element: '#right-banner',
      intro: 'This contains your list of joined sieges in progress with an overview of their state. You can jump into a game and take actions for that game from here.',
    },
    {
      element: '#action-start',
      intro: 'This is where you can start a new game with yourself as either the North General or the South General, starting a game costs 100 $LORDS and entitles you to a larger share of the winnings pool if your side wins.',
    },
    {
      element: '#join-button',
      intro: 'Click here to search for games to join, you can join as a general for 100 $LORDS if a game doesn not have both generals already or enroll as a sellsword for 10 $LORDS.'
    },
    {
      element: '#shop',
      intro: 'Soon, you will be able to purchase sword rank (that increases the minimum damage you deal with an attack) from your coins saved up from concluded sieges.'
    },
    {
      element: '#mint-lords',
      intro: 'While we are on Starknet Sepolia testnet, you can mint as many $LORDS as you want to test using this button.'
    },
    {
      element: '#disconnect',
      intro: 'You can disconnect your wallet and go back to the main screen using this button. We hope to see you again soon!'
    },
  ];

  return (
    <>
    <div id="scene">
      <Steps
        enabled={stepsEnabled}
        steps={steps}
        initialStep={0}
        onExit={()=>{}}
        options={{
          showStepNumbers: true,
          showProgress: true,
          dontShowAgain: true,
          overlayOpacity: 0.9
        }}
      />
      <Background id="sky" imageUrl="/sky light.svg" />
      <Highlightable id="logo" imageUrlDefault="/logo.svg" imageUrlRollover="/logo_2_border.svg" />
      <Background id="dirt" imageUrl="/dirt.svg" />
      <Background id="red-bushes" imageUrl="/red bushes.svg" />
      <Background id="blue-bushes" imageUrl="/blue bushes.svg" />
      <Background id="red-fence" imageUrl="/red fence.svg" />
      <Background id="blue-fence" imageUrl="/blue fence.svg" />
      <Background id="red-foliage" imageUrl="/red foliage.svg" />
      <Background id="blue-foliage" imageUrl="/blue foliage.svg" />
      <img id="left-banner" className="banner" src="/WAVY_BANNER_thick_left.gif" />
      <img id="right-banner" className="banner" src="/WAVY_BANNER_thick_right.gif" />
      <div className="left-content banner-content">
        <h2>YOUR EXPLOITS ACROSS THE REALMS</h2>
        <p><strong>Ye Olde Accounte: </strong>{`${account.address.substring(0, 4) + '...' + account.address.substring(account.address.length - 4, account.address.length)}`}</p>
        {playerGlobalStats?.rank && (
          <div>
            <p><strong>⚔ Sword Rank: </strong>{`${playerGlobalStats?.rank}`}</p>
            <p><strong>☠ Total Damage: </strong>{`${playerGlobalStats?.totalStrikeDamage}`}</p>
            <p><strong>⚡ Number of Strikes : </strong>{`${playerGlobalStats?.totalStrikes}`}</p>
          </div>
        )}
        {!playerGlobalStats?.rank && <p>Fight some battles, my lord, and we shall sing of your exploits here.</p>}
      </div>
      <div className="right-content banner-content">
        <div className="right-header">
          <h2>YOUR SIEGES</h2>
          <div><button onClick={refreshData}><RefreshCwIcon /></button></div>
        </div>
        <div className="sieges-list">
          {sortedGames.map((game: any) => {
            if (!game || !game.enrolled) return null;
            const isGeneral = game.northGeneral === account.address || game.southGeneral === account.address;
            return (
              <div className={`game-block ${isGeneral ? 'general' : 'sellsword'}`} key={game.gameId}>
                <div className="game-header">
                  <div># {hexToDecimal(game.gameId)} {gameNames[hexToDecimal(game.gameId)]} {pinnedGames.includes(hexToDecimal(game.gameId)) && <span className="pin-icon">📌</span>}</div>
                  <div>
                    <div>{isGeneral ? "Role: General" : game.enrolled ? "Role: Sellsword" : <button className="play-button" onClick={() => handleEnroll(hexToDecimal(game.gameId))}>ENROLL</button>}</div>
                    <div>{formatStartTime(game.startTime)}</div>
                  </div>
                </div>
                <div className="game-body">
                  <div>
                    <div className={`north ${game.northGeneral == account.address ? 'general-color' : isGeneral ? 'enemy-color' : ''}`}>
                      <strong>North HP</strong>: {calculateHPPercentage(game.castle1Health)}%
                      <br />
                      General: {game.northGeneral == account.address ? "YOU" : formatAddress(game.northGeneral)}
                    </div>
                    <div className={`south ${game.southGeneral == account.address ? 'general-color' : isGeneral ? 'enemy-color' : ''}`}>
                      <strong>South HP:</strong> {calculateHPPercentage(game.castle2Health)}%
                      <br />
                      General: {game.southGeneral == account.address ? "YOU" : formatAddress(game.southGeneral)}
                    </div>
                  </div>
                  <div>
                    <div className="players"><strong>Players:</strong> {parseInt(game.numPlayers, 16)}</div>
                    <button className="play-button" onClick={() => handlePlay(hexToDecimal(game.gameId))} disabled={!game.enrolled}>PLAY</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="right-banner-bottom-content">
        <div><button className='play-button' onClick={mintTestnetLORDS} id="mint-lords">
          MINT 500 TESTNET LORDS
        </button>
        </div>
        <div>
        <button className='play-button' onClick={()=>{window.open("https://test.bannersnft.com","_blank")}} id="mint-lords">
          MINT TESTNET BANNERS
        </button>
        </div>
      </div>
      <div className="center-menu">
        <div id="action-start" className="image-button" onClick={() => setStartModalOpen(true)}>START A GAME</div>
        <div id="join-button" className="image-button" onClick={() => setModalOpen(true)}>JOIN A GAME</div>
        <div id="shop" className="image-button" onClick={() => handleShop()}>SHOP</div>
        <div id="disconnect" className="image-button" onClick={handleDisconnect}>DISCONNECT</div>
      </div>
      <JoinGameModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        games={combinedData.filter(game => game && !game.enrolled)}
        account={account}
        formatAddress={formatAddress}
        formatStartTime={formatStartTime}
        calculateHPPercentage={calculateHPPercentage}
        handleEnroll={handleEnroll}
        handleJoinAsGeneral={handleJoinAsGeneral}
      />
      <StartGameModal
        open={startModalOpen}
        onClose={() => setStartModalOpen(false)}
        handleStartAsNorthGeneral={handleStartAsNorthGeneral}
        handleStartAsSouthGeneral={handleStartAsSouthGeneral}
      />
    </div>
    <ToastContainer className={'toast-container'} />
    </>
  );
};

export default ConnectedView;