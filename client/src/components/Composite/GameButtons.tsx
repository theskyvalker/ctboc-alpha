// GameButtons.tsx
import React from 'react';
import {CastleButtons} from './CastleButtons';
import {SellswordButtons} from './SellswordButtons';
import { AttackResult } from '../../utils/types';

interface GameButtonsProps {
  currentButtonSet: 'sellsword' | 'redCastle' | 'blueCastle';
  focusedButtonIndex: number;
  isGeneral: boolean | undefined;
  gold: number;
  attack: () => Promise<AttackResult>;
  fortify: () => Promise<boolean>;
  sharpen: () => Promise<boolean>;
  castleButtonsRef: React.RefObject<{ invokeAction: () => void }>;
  sellswordButtonsRef: React.RefObject<{ invokeAction: () => void }>;
}

const GameButtons: React.FC<GameButtonsProps> = ({
  currentButtonSet,
  focusedButtonIndex,
  isGeneral,
  gold,
  attack,
  fortify,
  sharpen,
  castleButtonsRef,
  sellswordButtonsRef,
}) => {
  return (
    <>
      {currentButtonSet === 'sellsword' && (
        <SellswordButtons
          ref={sellswordButtonsRef}
          focusedButtonIndex={focusedButtonIndex}
          sharpen={sharpen}
        />
      )}
      {(currentButtonSet === 'redCastle' || currentButtonSet === 'blueCastle') && (
        <CastleButtons
          ref={castleButtonsRef}
          focusedButtonIndex={focusedButtonIndex}
          castle={currentButtonSet === 'redCastle' ? 'red' : 'blue'}
          isGeneral={isGeneral}
          gold={gold}
          attack={attack}
          fortify={fortify}
        />
      )}
    </>
  );
};

export default GameButtons;