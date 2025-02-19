// Button.tsx
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './ActionButton.css'; // Ensure you have the correct path

interface ButtonProps {
    id: string;
    imgUrl: string;
    onClick: (event?: React.PointerEvent) => void;
    style?: React.CSSProperties;
    className?: string;
}

interface ButtonRef {
    triggerPressedAnimation: () => void;
}

const ActionButton = forwardRef<ButtonRef, ButtonProps>((props, ref) => {
    const { id, imgUrl, onClick, style, className } = props;
    const [isPressed, setIsPressed] = useState(false);

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

    useImperativeHandle(ref, () => ({
        triggerPressedAnimation: () => {
            setIsPressed(true);
        },
    }));

    return (
        <img
            id={id}
            src={imgUrl}
            alt=""
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={(event) => {
              //@ts-ignore
              if (onClick) onClick(event);
            }}
            className={`${className || ''} ${isPressed ? 'pressed' : ''} svg-layer button`}
            style={style}
            draggable="false"
        />
    );
});

export default ActionButton;