import React, { useEffect, useState } from 'react';
import Modal from 'react-responsive-modal';
import './AboutModal.css'; // Create and import a CSS file for additional styles

interface AboutModalProps {
    open: boolean;
    setOpen: (value: boolean) => void;
}

const AboutModal: React.FC<AboutModalProps> = ({open, setOpen}) => {

  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);

  return (
    <div>
      <div onClick={onOpenModal} className="image-button">ABOUT</div>
      <Modal open={open} onClose={onCloseModal} styles={{modal:{
        color:"black",
        backgroundImage:"url('/scroll2.png')",
        aspectRatio:"1032 / 968",
        height:"75%",
        width:"42%",
        opacity:"0.9",
        borderRadius:"20px",
        backgroundSize:"contain",
        backgroundRepeat:"no-repeat",
        backgroundBlendMode:"darken",
        backgroundColor:"transparent"
        }}} center>
        <div className="scroll-container">
          <div className="scroll-content">
            <p>Call The Banners (CTB) is a fully onchain game on Starknet from the <a href="https://bannersnft.com">Banners Team.</a></p>
            <p>We're soon integrating $LORDS as the primary currency and <a href="https://banners.realms.world">Pixel Banners</a> Starknet NFTs for bonuses and cosmetics.</p>
            <p>CTB began as a humble Discord game that has now grown into a cross-chain social phenomenon with CTB on Starknet, <a href="https://warpcast.com/~/channel/farcastles">Farcastles</a> on Farcaster, and <a href="https://ctb.bannersnft.com">CTB</a> seasons on Discord.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AboutModal;