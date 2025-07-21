import { useState, useEffect, useRef } from 'react';

// A global object to hold the state, avoiding re-renders.
// The game loop reads from this directly.
const touchState = {
    joystick: { x: 0, y: 0 },
    useItem: false
};

// Expose it to the game loop and other components.
(window as any).touchState = touchState;


export const useTouchControls = (enabled: boolean) => {
    const [isTouch] = useState(() => ('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    const joystickPointerId = useRef<number | null>(null);
    const joystickBasePos = useRef({ x: 0, y: 0 });
    const maxDiff = 60; // Half of joystick base size (120px)

    useEffect(() => {
        if (!isTouch || !enabled) {
            // Ensure state is reset if controls are disabled.
            if (joystickPointerId.current !== null) {
                joystickPointerId.current = null;
                touchState.joystick = { x: 0, y: 0 };
            }
            touchState.useItem = false;
            return; // Don't attach listeners
        }

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
            const rects = getRects();
            let gameControlTouched = false;
            for (const touch of Array.from(e.changedTouches)) {
                // Check for skill button first
                if (isInsideRect(touch, rects.skillButton)) {
                    touchState.useItem = true;
                    gameControlTouched = true;
                    continue; 
                }
                // Check for joystick if no pointer is already active
                if (joystickPointerId.current === null && isInsideRect(touch, rects.joystick)) {
                    joystickPointerId.current = touch.identifier;
                    joystickBasePos.current = {
                        x: rects.joystick.x + rects.joystick.width / 2,
                        y: rects.joystick.y + rects.joystick.height / 2,
                    };
                    updateJoystick(touch.clientX, touch.clientY);
                    gameControlTouched = true;
                }
            }

            // Only prevent default browser behavior (like scrolling or click events)
            // if we are actually using one of the game's touch controls.
            if (gameControlTouched) {
                e.preventDefault();
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            const joystickTouch = Array.from(e.changedTouches).find(
                t => t.identifier === joystickPointerId.current
            );
            
            if (joystickTouch) {
                e.preventDefault();
                updateJoystick(joystickTouch.clientX, joystickTouch.clientY);
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const joystickTouchEnded = Array.from(e.changedTouches).some(
                t => t.identifier === joystickPointerId.current
            );

            if (joystickTouchEnded) {
                e.preventDefault();
                joystickPointerId.current = null;
                touchState.joystick = { x: 0, y: 0 };
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
    }, [isTouch, enabled]);

    // This hook now only returns the `isTouch` flag.
    return { isTouch };
};