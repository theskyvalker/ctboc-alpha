import React from 'react';

interface BackgroundProps {
  id: string;
  imageUrl: string;
}

const Background: React.FC<BackgroundProps> = ({ id, imageUrl }) => {
  return (
    <svg id={id} className="svg-background">
      <image xlinkHref={imageUrl} width="100%" height="100%" />
    </svg>
  );
};

export default Background;