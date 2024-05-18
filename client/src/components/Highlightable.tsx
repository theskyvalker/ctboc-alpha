import React, { useEffect } from 'react';
import useUIStore from '../hooks/useUIStore';

interface HighlightableProps {
  id: string;
  imageUrlDefault: string;
  imageUrlRollover: string;
  onClick?: (event?: any) => void;
  style?: React.CSSProperties;
}

const Highlightable: React.FC<HighlightableProps> = ({ id, imageUrlDefault, imageUrlRollover, onClick, style = undefined }) => {

  const {
    redCastleRef,
    blueCastleRef
  } = useUIStore();

  if (id === "red-castle") {
    return (
    <svg id={id} ref={redCastleRef} className="svg-layer highlightable" onClick={onClick} style={style}>
      <g className="selector-that-triggers-hover">
        <image xlinkHref={imageUrlDefault} className="default" width="100%" height="100%"/>
        <image xlinkHref={imageUrlRollover} className="rollover" width="100%" height="100%"/>
      </g>
    </svg>
    );
  } else if (id === "blue-castle") {
    return (
    <svg id={id} ref={blueCastleRef} className="svg-layer highlightable" onClick={onClick} style={style}>
      <g className="selector-that-triggers-hover">
        <image xlinkHref={imageUrlDefault} className="default" width="100%" height="100%"/>
        <image xlinkHref={imageUrlRollover} className="rollover" width="100%" height="100%"/>
      </g>
    </svg>
    );
  } else {
    return (
    <svg id={id} className="svg-layer highlightable" onClick={onClick} style={style}>
      <g className="selector-that-triggers-hover">
        <image xlinkHref={imageUrlDefault} className="default" width="100%" height="100%"/>
        <image xlinkHref={imageUrlRollover} className="rollover" width="100%" height="100%"/>
      </g>
    </svg>
    );
  }

};

export default Highlightable;