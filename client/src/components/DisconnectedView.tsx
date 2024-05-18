import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Background from './Background';
import Highlightable from './Highlightable';
import Connect from './wallet/connect';
import AboutModal from './AboutModal';

interface DisconnectedViewProps {
  account: any;
  handleLogin: () => void;
}

const DisconnectedView: React.FC<DisconnectedViewProps> = ({ account, handleLogin }) => {

  const [open, setOpen] = useState(false);
  
  return (
    <>
    <div id="scene">
      <Background id="sky" imageUrl="/sky light.svg" />
      <Highlightable id="logo" imageUrlDefault="/logo.svg" imageUrlRollover="/logo_2_border.svg" onClick={setOpen}/>
      <Background id="dirt" imageUrl="/dirt.svg" />
      <Background id="red-bushes" imageUrl="/red bushes.svg" />
      <Background id="blue-bushes" imageUrl="/blue bushes.svg" />
      <Background id="red-fence" imageUrl="/red fence.svg" />
      <Background id="blue-fence" imageUrl="/blue fence.svg" />
      <Background id="red-foliage" imageUrl="/red foliage.svg" />
      <Background id="blue-foliage" imageUrl="/blue foliage.svg" />
      <img id="left-banner" className="banner" src="/WAVY_BANNER2-export.gif" />
      <img id="right-banner" className="banner" src="/WAVY_BANNER2-export-flip.gif" />
      <div className="center-menu">
        <div className="image-button" onClick={handleLogin}>CONNECT WALLET</div>
        <Connect />
        <AboutModal open={open} setOpen={setOpen}/>
      </div>
    </div>
    <ToastContainer className={'toast-container'} />
    </>
  );
};

export default DisconnectedView;