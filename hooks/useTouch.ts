
import { useState, useEffect, useCallback } from 'react';

export interface JoystickVector {
    x: number;
    y: number;
}

// A global object to hold the state, avoiding re-renders
const touchState = {
    joystick: { x: 0, y: 0 },
    useItem: false
};

// Expose it to the game loop
(window as any).touchState = touchState;

export const useTouchControls = () => {
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        setIsTouch(isTouchDevice);

        // Reset state on load
        touchState.joystick = { x: 0, y: 0 };
        touchState.useItem = false;
    }, []);

    const handleJoystickMove = useCallback((vector: JoystickVector) => {
        touchState.joystick = vector;
    }, []);

    const handleUseItem = useCallback(() => {
        // This will be a one-shot trigger that the game loop consumes and resets
        if (touchState.useItem === false) {
           touchState.useItem = true;
        }
    }, []);

    return { isTouch, handleJoystickMove, handleUseItem };
};
