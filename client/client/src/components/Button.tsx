import React from 'react';

interface ButtonProps {
  id: string;
  imgUrl: string;
  onClick?: (event?: any) => void;
  style: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({ id, imgUrl, onClick, style }) => {
  return (
    <svg id={id} className="svg-layer button" onClick={onClick} style={style}>
        <image xlinkHref={imgUrl} width="100%" height="100%" preserveAspectRatio="xMidYMid meet"/>
    </svg>
  );
};

export default Button;