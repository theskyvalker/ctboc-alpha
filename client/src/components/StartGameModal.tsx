import React from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';

interface StartGameModalProps {
  open: boolean;
  onClose: () => void;
  handleStartAsNorthGeneral: () => void;
  handleStartAsSouthGeneral: () => void;
}

const StartGameModal: React.FC<StartGameModalProps> = ({ open, onClose, handleStartAsNorthGeneral, handleStartAsSouthGeneral }) => {
  return (
    <Modal open={open} onClose={onClose} classNames={{root: "main-modal", modal:"main-modal-bg"}} styles={{modal:{backgroundImage:"url('/pixelated_bg_menu.jpg')", backgroundSize:"cover"}}} center>
      <h2>Start a Game as:</h2>
      <div className="start-game-options">
        <div className="start-game-tile north-general" onClick={handleStartAsNorthGeneral}>
          <h3>North General</h3>
          <img src="/blue castle.svg" alt="North Castle" />
          <div className="cost">100 $LORDS</div>
        </div>
        <div className="start-game-tile south-general" onClick={handleStartAsSouthGeneral}>
          <h3>South General</h3>
          <img src="/red castle.svg" alt="South Castle" />
          <div className="cost">100 $LORDS</div>
        </div>
      </div>
    </Modal>
  );
};

export default StartGameModal;