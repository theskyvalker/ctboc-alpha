import React from 'react';
import './BlockingModal.css';

interface BlockingModalProps {
  isVisible: boolean;
  onSwitchNetwork: () => void;
}

const BlockingModal: React.FC<BlockingModalProps> = ({ isVisible, onSwitchNetwork }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Please switch to the Starknet Sepolia network</h2>
        <p>Your wallet is currently connected to the wrong network. Please switch to Starknet Sepolia to continue.</p>
      </div>
    </div>
  );
};

export default BlockingModal;