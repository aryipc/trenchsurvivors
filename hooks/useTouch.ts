
import { useState, useEffect, useRef } from 'react';

// A global object to hold the state, avoiding re-renders.
// The game loop reads from this directly.
const touchState = {
    joystick: { x: 0, y: 0 },
    useItem: false
};

// Expose it to the game loop and other components.
(window as any).touchState = touchState;

// A global object for UI components to register their geometry.
// This is initialized here to ensure it exists before components mount.
if (!(window as any).controlGeometries) {
    (window as any).controlGeometries = {
        joystick: null as DOMRect | null,
        skillButton: null as DOMRect | null,
    };
}


// A more precise, reusable function for circular hit detection.
const isInsideCircle = (touch: Touch, centerX: number, centerY: number, radius: number): boolean => {
    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    // Using squared distances to avoid expensive square root operations.
    return (dx * dx + dy * dy) <= (radius * radius);
};


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
            const { joystick: joyRect, skillButton: skillRect } = (window as any).controlGeometries;
            let gameControlTouched = false;

            for (const touch of Array.from(e.changedTouches)) {
                // Check for skill button first
                if (skillRect && isInsideCircle(touch, skillRect.left + skillRect.width / 2, skillRect.top + skillRect.height / 2, skillRect.width / 2)) {
                    touchState.useItem = true;
                    gameControlTouched = true;
                    continue; 
                }
                // Check for joystick if no pointer is already active
                if (joystickPointerId.current === null && joyRect && isInsideCircle(touch, joyRect.left + joyRect.width / 2, joyRect.top + joyRect.height / 2, joyRect.width / 2)) {
                    joystickPointerId.current = touch.identifier;
                    joystickBasePos.current = { x: joyRect.left + joyRect.width / 2, y: joyRect.top + joyRect.height / 2 };
                    updateJoystick(touch.clientX, touch.clientY);
                    gameControlTouched = true;
                }
            }

            if (gameControlTouched) {
                e.preventDefault();
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (joystickPointerId.current === null) return;
            // Iterate over all active touches, not just changed ones, to find the joystick finger.
            const joystickTouch = Array.from(e.touches).find(
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
