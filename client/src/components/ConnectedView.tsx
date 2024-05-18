import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Background from './Background';
import Highlightable from './Highlightable';
import JoinGameModal from './JoinGameModal';
import StartGameModal from './StartGameModal';
import { hexToDecimal } from '../utils';

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
  modalOpen,
  startModalOpen
}) => {
  return (
    <>
    <div id="scene">
      <Background id="sky" imageUrl="/sky light.svg" />
      <Highlightable id="logo" imageUrlDefault="/logo.svg" imageUrlRollover="/logo_2_border.svg" />
      <Background id="dirt" imageUrl="/dirt.svg" />
      <Background id="red-bushes" imageUrl="/red bushes.svg" />
      <Background id="blue-bushes" imageUrl="/blue bushes.svg" />
      <Background id="red-fence" imageUrl="/red fence.svg" />
      <Background id="blue-fence" imageUrl="/blue fence.svg" />
      <Background id="red-foliage" imageUrl="/red foliage.svg" />
      <Background id="blue-foliage" imageUrl="/blue foliage.svg" />
      <img id="left-banner" className="banner" src="/WAVY_BANNER2-export.gif" />
      <img id="right-banner" className="banner" src="/WAVY_BANNER2-export-flip.gif" />
      <div className="left-content banner-content">
        <h2>YOUR EXPLOITS ACROSS THE REALMS</h2>
        <p><strong>Current Account: </strong>{`${account.address.substring(0, 4) + '...' + account.address.substring(account.address.length - 4, account.address.length)}`}</p>
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
        <h2>YOUR SIEGES</h2>
        <div className="sieges-list">
          {combinedData.map((game: any) => {
            if (!game || !game.enrolled) return null;
            const isGeneral = game.northGeneral === account.address || game.southGeneral === account.address;
            return (
              <div className={`game-block ${isGeneral ? 'general' : 'sellsword'}`} key={game.gameId}>
                <div className="game-header">
                  <div># {hexToDecimal(game.gameId)}</div>
                  <div>{isGeneral ? "Role: General" : game.enrolled ? "Role: Sellsword" : <button className="play-button" onClick={() => handleEnroll(hexToDecimal(game.gameId))}>ENROLL</button>}</div>
                  <div>{formatStartTime(game.startTime)}</div>
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
      <div className="center-menu">
        <div className="image-button" onClick={() => setStartModalOpen(true)}>START A GAME</div>
        <div className="image-button" onClick={() => setModalOpen(true)}>JOIN A GAME</div>
        <div className="image-button" onClick={() => handleShop()}>SHOP</div>
        <div className="image-button" onClick={handleDisconnect}>DISCONNECT</div>
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