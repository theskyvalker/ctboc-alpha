import React, { useEffect, useState, useRef } from 'react';
import useFilteredEventSubscription from '../hooks/useFilteredEventSubscription';
import { AiOutlineFullscreen, AiOutlineFullscreenExit, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FiExternalLink, FiLogIn } from 'react-icons/fi';
import NewWindow from 'react-new-window';
import miniLogStyles from './MiniEventDisplay.module.css'; // New CSS for mini logs
import popOutStyles from './EventDisplayPopOut.module.css'; // Pop-out view styles

interface MiniEventLogProps {
  castle: 'north' | 'south';
  events: string;
}

const MiniEventLog: React.FC<MiniEventLogProps> = ({ castle, events }) => {
  const [displayText, setDisplayText] = useState<string>('Waiting for events...');
  const [isMaximized, setIsMaximized] = useState(false);
  const [isPoppedOut, setIsPoppedOut] = useState(false);
  const [isLogHidden, setIsLogHidden] = useState(false);
  
  // useRef to store the window instance for this specific log
  const windowRef = useRef<Window | null>(null);

  useEffect(() => {
    if (events) {
      setDisplayText(events);
    }
  }, [events]);

  const handleMaximize = () => setIsMaximized(true);
  const handleCollapse = () => setIsMaximized(false);
  const handlePopOut = () => setIsPoppedOut(true);
  const handlePopIn = () => {
    setIsPoppedOut(false);
    if (windowRef.current) {
      windowRef.current.close(); // Close the specific window if it was open
    }
  };
  const handleHideLog = () => setIsLogHidden(true);
  const handleShowLog = () => setIsLogHidden(false);

  // Determine the alignment styles based on the castle prop
  const alignmentStyle = castle === 'south' ? miniLogStyles.leftAlign : miniLogStyles.rightAlign;

  const currentStyles = isPoppedOut ? popOutStyles : miniLogStyles; // Use popOutStyles if popped out

  const content = (
    <div className={`${currentStyles.container} ${alignmentStyle} ${isMaximized ? currentStyles.miniMaximized : ''}`}>
      <div className={currentStyles.iconContainer}>
        {!isMaximized && !isPoppedOut && (
          <AiOutlineFullscreen onClick={handleMaximize} className={currentStyles.icon} />
        )}
        {isMaximized && !isPoppedOut && (
          <AiOutlineFullscreenExit onClick={handleCollapse} className={currentStyles.icon} />
        )}
        {!isPoppedOut && (
          <AiOutlineEyeInvisible onClick={handleHideLog} className={currentStyles.icon} />
        )}
        {isPoppedOut ? (
          <FiLogIn onClick={handlePopIn} className={currentStyles.icon} />
        ) : (
          <FiExternalLink onClick={handlePopOut} className={currentStyles.icon} />
        )}
      </div>
      <textarea
        value={displayText}
        readOnly
        className={currentStyles.miniTextarea}
      />
    </div>
  );

  if (!isPoppedOut && isLogHidden) {
    return (
      <div className={`${currentStyles.smallContainer} ${alignmentStyle}`}>
        {/* Apply the black color to the hidden eye icon */}
        <AiOutlineEye onClick={handleShowLog} className={currentStyles.hiddenIcon} />
      </div>
    );
  }

  return (
    <>
      {!isPoppedOut && !isLogHidden && content}
      {isPoppedOut && (
        <NewWindow
          onUnload={handlePopIn}
          name={`mini-event-log-${castle}`} // Unique window name for each log
          features={{ width: 600, height: 800, resizable: 'yes', scrollbars: 'yes' }}
          title={`Mini Event Log - ${castle} castle`}
          onOpen={(windowInstance) => {
            windowRef.current = windowInstance; // Store window reference
          }}
        >
          {/* When popped out, content will use popOutStyles */}
          {content}
        </NewWindow>
      )}
    </>
  );
};

export default MiniEventLog;