import { useState, useEffect, useRef } from 'react';

// A global object to hold the state, avoiding re-renders.
// The game loop reads from this directly.
const touchState = {
    joystick: { x: 0, y: 0 },
    useItem: false
};

// Expose it to the game loop and other components.
(window as any).touchState = touchState;


export const useTouchControls = () => {
    const [isTouch, setIsTouch] = useState(false);
    const joystickPointerId = useRef<number | null>(null);
    const joystickBasePos = useRef({ x: 0, y: 0 });
    const maxDiff = 60; // Half of joystick base size (120px)

    useEffect(() => {
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        setIsTouch(isTouchDevice);
        
        if (!isTouchDevice) return;

        // Reset state on load
        touchState.joystick = { x: 0, y: 0 };
        touchState.useItem = false;
        joystickPointerId.current = null;

        // --- Define touch areas ---
        // These are hardcoded based on CSS.
        const joystickRectDef = { left: 48, bottom: 112, width: 120, height: 120 };
        const skillButtonRectDef = { right: 48, bottom: 124, width: 96, height: 96 };

        const getRects = () => {
             const vh = window.innerHeight;
             return {
                joystick: {
                    x: joystickRectDef.left,
                    y: vh - joystickRectDef.bottom - joystickRectDef.height,
                    width: joystickRectDef.width,
                    height: joystickRectDef.height,
                },
                skillButton: {
                    x: window.innerWidth - skillButtonRectDef.right - skillButtonRectDef.width,
                    y: vh - skillButtonRectDef.bottom - skillButtonRectDef.height,
                    width: skillButtonRectDef.width,
                    height: skillButtonRectDef.height
                }
             };
        };
        
        const isInsideRect = (touch: Touch, rect: {x: number, y: number, width: number, height: number}) => {
            return (
                touch.clientX >= rect.x &&
                touch.clientX <= rect.x + rect.width &&
                touch.clientY >= rect.y &&
                touch.clientY <= rect.y + rect.height
            );
        };
        
        const updateJoystick = (clientX: number, clientY: number) => {
            let diffX = clientX - joystickBasePos.current.x;
            let diffY = clientY - joystickBasePos.current.y;
            const dist = Math.sqrt(diffX * diffX + diffY * diffY);

            if (dist > maxDiff) {
                diffX = (diffX / dist) * maxDiff;
                diffY = (diffY / dist) * maxDiff;
            }
            touchState.joystick = { x: diffX / maxDiff, y: diffY / maxDiff };
        };

        const handleTouchStart = (e: TouchEvent) => {
            e.preventDefault();
            const rects = getRects();
            for (const touch of Array.from(e.changedTouches)) {
                // Check for skill button first
                if (isInsideRect(touch, rects.skillButton)) {
                    touchState.useItem = true;
                    // We don't track this touch's ID because it's a one-shot action
                    continue; // Check if other new touches are for the joystick
                }
                // Check for joystick if no pointer is already active
                if (joystickPointerId.current === null && isInsideRect(touch, rects.joystick)) {
                    joystickPointerId.current = touch.identifier;
                    joystickBasePos.current = {
                        x: rects.joystick.x + rects.joystick.width / 2,
                        y: rects.joystick.y + rects.joystick.height / 2,
                    };
                    updateJoystick(touch.clientX, touch.clientY);
                }
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            for (const touch of Array.from(e.changedTouches)) {
                if (touch.identifier === joystickPointerId.current) {
                    updateJoystick(touch.clientX, touch.clientY);
                }
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            e.preventDefault();
            for (const touch of Array.from(e.changedTouches)) {
                 if (touch.identifier === joystickPointerId.current) {
                    joystickPointerId.current = null;
                    touchState.joystick = { x: 0, y: 0 };
                }
                // No need to handle touchend for the skill button, as its state
                // is reset in the game loop after one frame.
            }
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: false });
        window.addEventListener('touchcancel', handleTouchEnd, { passive: false });

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [isTouch, maxDiff]);

    // This hook now only returns the `isTouch` flag.
    // All state management is done via the global `touchState` object.
    return { isTouch };
};
