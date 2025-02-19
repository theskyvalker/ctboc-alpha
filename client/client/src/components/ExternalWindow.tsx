import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

interface ExternalWindowProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ExternalWindow: React.FC<ExternalWindowProps> = ({ isOpen, onClose, children }) => {
  const externalWindow = useRef<Window | null>(null);
  const containerEl = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<ReactDOM.Root | null>(null);

  useEffect(() => {
    if (isOpen && !externalWindow.current) {
      // Open the external window
      externalWindow.current = window.open('', '', 'width=600,height=800,left=200,top=200,resizable=yes');

      if (externalWindow.current) {
        // Set up the external window document
        externalWindow.current.document.title = 'Event Log';
        externalWindow.current.document.body.style.margin = '0';

        // Create a container div in the external window
        containerEl.current = externalWindow.current.document.createElement('div');
        externalWindow.current.document.body.appendChild(containerEl.current);

        // Copy stylesheets
        document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
          externalWindow.current?.document.head.appendChild(node.cloneNode(true));
        });

        // Create a React root in the external window
        rootRef.current = ReactDOM.createRoot(containerEl.current);

        // Handle window close
        const handleUnload = () => {
          onClose();
        };
        externalWindow.current.addEventListener('beforeunload', handleUnload);

        return () => {
          externalWindow.current?.removeEventListener('beforeunload', handleUnload);
          rootRef.current?.unmount();
          externalWindow.current?.close();
          externalWindow.current = null;
          containerEl.current = null;
          rootRef.current = null;
        };
      } else {
        // Pop-up blocked
        onClose();
      }
    } else if (!isOpen && externalWindow.current) {
      // Close the external window
      rootRef.current?.unmount();
      externalWindow.current.close();
      externalWindow.current = null;
      containerEl.current = null;
      rootRef.current = null;
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (rootRef.current && containerEl.current) {
      // Render content into the external window
      rootRef.current.render(children);
    }
  }, [children]);

  return null;
};

export default ExternalWindow;