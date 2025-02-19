import React, { useState, useEffect } from 'react';
import './ArrowButton.css';

interface ArrowButtonProps {
  direction: 'left' | 'right' | 'up' | 'down';
  onClick: () => void;
  style?: React.CSSProperties;
}

const ArrowButton: React.FC<ArrowButtonProps> = ({ direction, onClick, style }) => {
  const [isPressed, setIsPressed] = useState(false);

  let image = 'arrow_down.png';

  switch (direction) {
    case 'up':
      image = '/arrow_up.png';
      break;
    case 'down':
      image = '/arrow_down.png';
      break;
    case 'left':
      image = '/arrow_left.png';
      break;
    case 'right':
      image = '/arrow_right.png';
      break;
  }

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  useEffect(() => {
    if (isPressed) {
      const timer = setTimeout(() => {
        setIsPressed(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPressed]);

  return (
    <img
      src={isPressed ? image.replace('.png','_click.png') : image}
      alt={`${direction} arrow`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={onClick}
      style={{
        ...style,
      }}
      className={`arrow-button breathing-button ${isPressed ? 'pressed' : ''}`}
      draggable="false"
    />
  );
};

export default ArrowButton;