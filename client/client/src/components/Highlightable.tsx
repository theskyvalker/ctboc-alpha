import React, { useEffect, useState } from 'react';
import useUIStore from '../hooks/useUIStore';

interface HighlightableProps {
  id: string;
  imageUrlDefault: string;
  imageUrlRollover: string;
  onClick?: (event?: any) => void;
  style?: React.CSSProperties;
  tooltip?: string;
  providedTooltipStyle?: React.CSSProperties;
}

const Highlightable: React.FC<HighlightableProps> = ({ id, imageUrlDefault, imageUrlRollover, onClick, style = undefined, tooltip, providedTooltipStyle }) => {

  const {
    redCastleRef,
    blueCastleRef
  } = useUIStore();

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const baseTooltipStyle: React.CSSProperties = {
    position: "absolute",
    top: "7%",
    width:"fit-content",
    color: 'black',
    textAlign: 'start',
    textSizeAdjust: 'auto',
    fontSize: '1rem',
    backgroundColor: 'white',
    padding: '5px',
    borderRadius: '2px',
    zIndex: '999',
    boxShadow: '0px 0px 5px rgba(0,0,0,0.2)'
  };

  const combinedTooltipStyle: React.CSSProperties = {
    ...baseTooltipStyle,
    ...providedTooltipStyle
  };

  if (id === "red-castle") {
    return (
      <>
    <svg id={id} ref={redCastleRef} className="svg-layer highlightable" onClick={onClick} style={style}>
      <g className="selector-that-triggers-hover" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <image xlinkHref={imageUrlDefault} className="default" width="100%" height="100%"/>
        <image xlinkHref={imageUrlRollover} className="rollover" width="100%" height="100%"/>
      </g>
    </svg>
    {tooltip && isHovered && (
      <div style={combinedTooltipStyle}>
        {tooltip}
      </div>
    )}
    </>
    );
  } else if (id === "blue-castle") {
    return (
      <>
    <svg id={id} ref={blueCastleRef} className="svg-layer highlightable" onClick={onClick} style={style}>
      <g className="selector-that-triggers-hover" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <image xlinkHref={imageUrlDefault} className="default" width="100%" height="100%"/>
        <image xlinkHref={imageUrlRollover} className="rollover" width="100%" height="100%"/>
      </g>
    </svg>
    {tooltip && isHovered && (
      <div style={combinedTooltipStyle}>
        {tooltip}
      </div>
    )}
    </>
    );
  } else {
    return (
    <>
    <svg id={id} className="svg-layer highlightable" onClick={onClick} style={style} >
      <g className="selector-that-triggers-hover" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <image xlinkHref={imageUrlDefault} className="default" width="100%" height="100%"/>
        <image xlinkHref={imageUrlRollover} className="rollover" width="100%" height="100%"/>
      </g>
    </svg>
    {tooltip && isHovered && (
      <div style={combinedTooltipStyle}>
        {tooltip}
      </div>
    )}
    </>
    );
  }

};

export default Highlightable;