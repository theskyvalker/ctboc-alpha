import React, { useEffect, useState, useRef } from 'react';
import useFilteredEventSubscription from '../hooks/useFilteredEventSubscription';
import styles from './EventDisplay.module.css'; // Regular view styles
import popOutStyles from './EventDisplayPopOut.module.css'; // Pop-out view styles
import NewWindow from 'react-new-window';

const EventDisplay: React.FC<{formattedEvents: string}> = ({formattedEvents}) => {
  const [displayText, setDisplayText] = useState<string>('Waiting for events...');
  const [isMaximized, setIsMaximized] = useState(false);
  const [isPoppedOut, setIsPoppedOut] = useState(false);
  const [isLogHidden, setIsLogHidden] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (formattedEvents) {
      setDisplayText(formattedEvents);
    }
  }, [formattedEvents]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [displayText]);

  const handleMaximize = () => setIsMaximized(true);
  const handleCollapse = () => setIsMaximized(false);
  const handlePopOut = () => setIsPoppedOut(true);
  const handlePopIn = () => setIsPoppedOut(false);
  const handleHideLog = () => setIsLogHidden(true);
  const handleShowLog = () => setIsLogHidden(false);

  const currentStyles = isPoppedOut ? popOutStyles : styles;

  const content = (
    <div className={`${currentStyles.container} ${isMaximized ? currentStyles.maximized : ''}`}>
      <div className={currentStyles.buttonContainer}>
        {!isMaximized && !isPoppedOut && (
          <button onClick={handleMaximize} className={currentStyles.button}>Maximize</button>
        )}
        {isMaximized && !isPoppedOut && (
          <button onClick={handleCollapse} className={currentStyles.button}>Collapse</button>
        )}
        {!isPoppedOut && (
          <button onClick={handleHideLog} className={currentStyles.button}>Hide Event Log</button>
        )}
        {isPoppedOut ? (
          <button onClick={handlePopIn} className={currentStyles.button}>Pop In</button>
        ) : (
          <button onClick={handlePopOut} className={currentStyles.button}>Pop Out</button>
        )}
      </div>
      <textarea
        ref={textareaRef}
        value={displayText}
        readOnly
        className={currentStyles.textarea}
      />
    </div>
  );

  if (!isPoppedOut && isLogHidden) {
    return (
      <div className={currentStyles.smallContainer}>
        <button onClick={handleShowLog} className={currentStyles.button}>
          Show Event Log
        </button>
      </div>
    );
  }

  return (
    <>
      {!isPoppedOut && !isLogHidden && content}
      {isPoppedOut && (
        <NewWindow
          onUnload={handlePopIn}
          features={{ width: 600, height: 800, resizable: 'yes', scrollbars: 'yes' }}
          title="Event Log"
        >
          {content}
        </NewWindow>
      )}
    </>
  );
};

export default EventDisplay;