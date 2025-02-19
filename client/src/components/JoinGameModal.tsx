import React, { useEffect, useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { GAME_STAGES } from '../utils/constants';
import { GameStageKey } from '../utils/types';
import { hexToDecimal } from '../utils';
import { useCookies } from 'react-cookie';
import { Steps } from 'intro.js-react';
import useUIStore from '../hooks/useUIStore';
import { fetchPinnedGames } from '../hooks/supabaseClient';

interface GameModalProps {
  open: boolean;
  onClose: () => void;
  games: any[];
  account: any;
  formatAddress: (address: string) => string;
  formatStartTime: (hexTime: string) => string;
  calculateHPPercentage: (currentHealth: number) => string;
  handleEnroll: (gameId: number) => void;
  handleJoinAsGeneral: (gameId: number, role: 'North' | 'South') => void;
}

const JoinGameModal: React.FC<GameModalProps> = ({ open, onClose, games, account, formatAddress, formatStartTime, calculateHPPercentage, handleEnroll, handleJoinAsGeneral }) => {
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState<string>('');
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const {
    gameNames,
    pinnedGames,
    setPinnedGames
  } = useUIStore();

  const [stepsEnabled, setStepsEnabled] = useState(false);
  const [cookies, setCookie] = useCookies(['introjs-dontShowAgain-join']);

  useEffect(() => {
    if (cookies['introjs-dontShowAgain-join'] !== true) {
      console.log("setting steps true");
      setStepsEnabled(true);
    }
  }, [cookies['introjs-dontShowAgain-join']]);

  useEffect(() => {
    const loadPinnedGames = async () => {
      const pinned = await fetchPinnedGames();
      setPinnedGames(pinned);
    };
    loadPinnedGames();
  }, []);

  useEffect(() => {
    console.log(gameNames);
  }, [gameNames]);

  const steps = [
    {
      element: '#games-table',
      intro: 'This is where you will see all ongoing games where you are not already enrolled.',
      position: 'top',
    },
    {
      element: '#gameid-header',
      intro: 'This is the game ID - a unique identifier to distinguish one ongoing game from another.',
      position: 'top'
    },
    {
      element: '#north-general',
      intro: 'The North General and South General columns show the wallet address of the player who is the current general for the respective side. N/A means that the general position is vacant for now.',
      position: 'top'
    },
    {
      element: '#game-stage',
      intro: 'A game progresses through three stages one after another: Enrollment, Staging, and Battle. You can join the game as a sellsword at any stage but generals can only be assigned during enrollment stage.',
      position: 'top'
    },
    {
      element: '#start-time',
      intro: 'This indicates the timestamp when the game was initially started by the first general.',
      position: 'top'
    },
    {
      element: '#num-players',
      intro: 'The total number of players currently enrolled in this game.',
      position: 'top'
    },
    {
      element: '#expand',
      intro: 'For any row of a game you can click the down arrow icon to get more details and join the game as a sellsword or general.',
      position: 'top'
    },
    {
      element: '#games-table-header',
      intro: 'Clicking on any header in the table will allow you to sort the games list in ascending or descending order by that dimension. Clicking once will sort it by ascending order. Clicking it again will switch to descending order.',
      position: 'top'
    },
    {
      element: '#searchbox',
      intro: 'You can search games here by entering a game ID or the Starknet address of a general whose game you wish to join.',
      position: 'top'
    },
    {
      element: '#tutorial',
      intro: 'To see this tour again, please click this button.',
      position: 'top'
    }
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSort = (field: string) => {
    const newSortOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newSortOrder);
  };

  const getSortedGames = (games: any[]) => {
    return games.sort((a, b) => {
      const isPinnedA = pinnedGames.includes(hexToDecimal(a.gameId));
      const isPinnedB = pinnedGames.includes(hexToDecimal(b.gameId));

      if (isPinnedA && !isPinnedB) return -1;
      if (!isPinnedA && isPinnedB) return 1;

      if (sortField) {

        let aValue, bValue;
        
        if (sortField === 'game_name') {
          aValue = gameNames[hexToDecimal(a.gameId)] ?? '';
          bValue = gameNames[hexToDecimal(b.gameId)] ?? '';
        } else {
          aValue = a[sortField];
          bValue = b[sortField];
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      }
      return 0;
    });
  };

  const getFilteredGames = (games: any[]) => {
        return games.filter(game => {
          if (game.gameId) {
            console.log(game);
            const gameIdMatch = game.gameId.toString().toLowerCase().includes(searchInput.toLowerCase());
            const gameNameMatch = game.game_name?.toLowerCase().includes(searchInput.toLowerCase());
            const northGeneralMatch = game.northGeneral && game.northGeneral.toLowerCase().includes(searchInput.toLowerCase());
            const southGeneralMatch = game.southGeneral && game.southGeneral.toLowerCase().includes(searchInput.toLowerCase());
            return gameIdMatch || northGeneralMatch || southGeneralMatch || gameNameMatch;
          }
      });
  };

  const sortedGames = getSortedGames(games);
  const filteredGames = getFilteredGames(sortedGames);

  return (
    <Modal open={open} onClose={onClose} classNames={{root: "main-modal", modal:"main-modal-bg"}} styles={{modal:{backgroundColor:"lightyellow", backgroundSize:"cover"}}} center>
      <Steps
        enabled={stepsEnabled}
        steps={steps}
        initialStep={0}
        onExit={()=>{
          setCookie('introjs-dontShowAgain-join', true);
          setStepsEnabled(false);
        }}
        options={{
          showStepNumbers: true,
          showProgress: true,
          overlayOpacity: 0.9
        }}
      />
      <div className='modal-header'>
        <div><h2>Join a Game</h2>
          <button id="tutorial" style={{marginBottom:"1rem"}} onClick={()=>setCookie('introjs-dontShowAgain-join', false)}>Show Tutorial</button>
        </div>
        <input 
            type="text" 
            placeholder="Search by game name, ID, or address" 
            value={searchInput} 
            onChange={handleSearch} 
            className="search-input" 
            id="searchbox"
            />
        </div>
      <table className="games-table" id="games-table">
        <thead id="games-table-header">
          <tr>
            <th id="gameid-header" onClick={() => handleSort('gameId')}># {sortField === 'gameId' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}</th>
            <th id="game-name-header" onClick={() => handleSort('game_name')}>Game Name {sortField === 'game_name' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}</th>
            <th id="north-general" onClick={() => handleSort('northGeneral')}>North General {sortField === 'northGeneral' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}</th>
            <th id="south-general" onClick={() => handleSort('southGeneral')}>South General {sortField === 'southGeneral' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}</th>
            <th id="game-stage" onClick={() => handleSort('stage')}>Game Stage {sortField === 'stage' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}</th>
            <th id="start-time" onClick={() => handleSort('startTime')}>Start Time {sortField === 'startTime' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}</th>
            <th id="num-players" onClick={() => handleSort('numPlayers')}># of Players {sortField === 'numPlayers' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}</th>
            <th id="expand">Details</th>
          </tr>
        </thead>
        <tbody>
          {filteredGames.filter(game => !game.enrolled).map(game => {
            const isExpanded = expandedGameId === game.gameId;
            return (
              <React.Fragment key={game.gameId}>
                <tr key={game.gameId} onClick={() => setExpandedGameId(isExpanded ? null : game.gameId)}>
                  <td>{parseInt(game.gameId)}</td>
                  <td>{gameNames[hexToDecimal(game.gameId)]} {pinnedGames.includes(hexToDecimal(game.gameId)) && <span className="pin-icon">📌</span>}</td>
                  <td>{(!game.northGeneral || hexToDecimal(game.northGeneral.replace("0x",'')) == 0) ? 'N/A' : formatAddress(game.northGeneral)}</td>
                  <td>{(!game.southGeneral || hexToDecimal(game.southGeneral.replace("0x",'')) == 0) ? 'N/A' : formatAddress(game.southGeneral)}</td>
                  <td>{GAME_STAGES[game.stage as GameStageKey]}</td>
                  <td>{formatStartTime(game.startTime)}</td>
                  <td>{parseInt(game.numPlayers, 16)}</td>
                  <td className="expand-icon">
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={8}>
                      <div className={`game-block ${game.northGeneral === account.address || game.southGeneral === account.address ? 'general' : 'sellsword'}`} key={game.gameId}>
                        <div className="game-header">
                          <div># {parseInt(game.gameId, 16)}</div>
                          <div>{formatStartTime(game.startTime)}</div>
                        </div>
                        <div className="game-body">
                          <div>
                            <div className={`north ${game.northGeneral === account.address ? 'general-color' : 'enemy-color'}`}>
                              <strong>North HP</strong>: {calculateHPPercentage(game.castle1Health)}%
                              <br />
                            </div>
                            <div className={`south ${game.southGeneral === account.address ? 'general-color' : 'enemy-color'}`}>
                              <strong>South HP:</strong> {calculateHPPercentage(game.castle2Health)}%
                              <br />
                            </div>
                          </div>
                          <div className="players">
                            <strong>Players:</strong> {parseInt(game.numPlayers, 16)}
                          </div>
                          {(!game.northGeneral || hexToDecimal(game.northGeneral.replace("0x",'')) == 0) && (
                            <button className="play-button" onClick={() => handleJoinAsGeneral(parseInt(game.gameId, 16), 'North')}>Join as North General</button>
                          )}
                          {(!game.southGeneral || hexToDecimal(game.southGeneral.replace("0x",'')) == 0) && (
                            <button className="play-button" onClick={() => handleJoinAsGeneral(parseInt(game.gameId, 16), 'South')}>Join as South General</button>
                          )}
                          <button className="play-button" style={{marginLeft:"0.5rem"}} onClick={() => handleEnroll(parseInt(game.gameId, 16))}>Enroll as Sellsword</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </Modal>
  );
};

export default JoinGameModal;