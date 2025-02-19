import React, { useState } from 'react';

interface BackgroundProps {
  id: string;
  imageUrl: string;
  className?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
  tooltip?: string;
  providedTooltipStyle?: React.CSSProperties;
}

const Background: React.FC<BackgroundProps> = ({ id, imageUrl, className, onClick, tooltip, providedTooltipStyle }) => {

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

  if (tooltip) {
    return (
      <>
        <svg id={id} className={`svg-background ${className ?? className}`} onClick={onClick} onPointerEnter={handleMouseEnter} onPointerLeave={handleMouseLeave}>
          <image xlinkHref={imageUrl} width="100%" height="100%" />
        </svg>
        {isHovered && (
          <div style={combinedTooltipStyle}>
            {tooltip}
          </div>
        )}
      </>
    );
  } else {
    return (
      <svg id={id} className={`svg-background ${className ?? className}`} onClick={onClick}>
        <image xlinkHref={imageUrl} width="100%" height="100%" />
      </svg>
    );
  }
};

export default Background;