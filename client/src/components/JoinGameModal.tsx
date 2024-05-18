import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { GAME_STAGES } from '../utils/constants';
import { GameStageKey } from '../utils/types';
import { hexToDecimal } from '../utils';

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
      if (sortField) {
        const aValue = a[sortField];
        const bValue = b[sortField];

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
      const gameIdMatch = game.gameId.toLowerCase().includes(searchInput.toLowerCase());
      const northGeneralMatch = game.northGeneral && game.northGeneral.toLowerCase().includes(searchInput.toLowerCase());
      const southGeneralMatch = game.southGeneral && game.southGeneral.toLowerCase().includes(searchInput.toLowerCase());
      return gameIdMatch || northGeneralMatch || southGeneralMatch;
    });
  };

  const sortedGames = getSortedGames(games);
  const filteredGames = getFilteredGames(sortedGames);

  return (
    <Modal open={open} onClose={onClose} classNames={{root: "main-modal", modal:"main-modal-bg"}} styles={{modal:{backgroundColor:"lightyellow", backgroundSize:"cover"}}} center>
      <div className='modal-header'>
        <h2>Join a Game</h2>
        <input 
            type="text" 
            placeholder="Search by address or game ID" 
            value={searchInput} 
            onChange={handleSearch} 
            className="search-input" 
            />
        </div>
      <table className="games-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('gameId')}># {sortField === 'gameId' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}</th>
            <th onClick={() => handleSort('northGeneral')}>North General {sortField === 'northGeneral' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}</th>
            <th onClick={() => handleSort('southGeneral')}>South General {sortField === 'southGeneral' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}</th>
            <th onClick={() => handleSort('stage')}>Game Stage {sortField === 'stage' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}</th>
            <th onClick={() => handleSort('startTime')}>Start Time {sortField === 'startTime' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}</th>
            <th onClick={() => handleSort('numPlayers')}># of Players {sortField === 'numPlayers' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredGames.filter(game => !game.enrolled).map(game => {
            const isExpanded = expandedGameId === game.gameId;
            return (
              <React.Fragment key={game.gameId}>
                <tr key={game.gameId} onClick={() => setExpandedGameId(isExpanded ? null : game.gameId)}>
                    <td>{parseInt(game.gameId)}</td>
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
                    <td colSpan={6}>
                      <div className={`game-block ${game.northGeneral === account.address || game.southGeneral === account.address ? 'general' : 'sellsword'}`} key={game.gameId}>
                        <div className="game-header">
                          <div># {parseInt(game.gameId, 16)}</div>
                          <div>Role: {game.northGeneral === account.address || game.southGeneral === account.address ? 'General' : 'Sellsword'}</div>
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
                          <button className="play-button" onClick={() => handleEnroll(parseInt(game.gameId, 16))}>Enroll as Sellsword</button>
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