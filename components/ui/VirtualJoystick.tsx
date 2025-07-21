
import React, { useRef, useEffect } from 'react';

// This component is now purely for display.
// It reads its state from the global `window.touchState` object.
const VirtualJoystick: React.FC = () => {
    const baseRef = useRef<HTMLDivElement>(null);
    const stickRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);

    const baseSize = 120;
    const stickSize = 60;
    const maxDiff = baseSize / 2;

    useEffect(() => {
        const updateStick = () => {
            if (stickRef.current && (window as any).touchState) {
                const { x, y } = (window as any).touchState.joystick;
                const transX = x * maxDiff;
                const transY = y * maxDiff;
                stickRef.current.style.transform = `translate(${transX}px, ${transY}px)`;
            }
            animationFrameRef.current = requestAnimationFrame(updateStick);
        };

        animationFrameRef.current = requestAnimationFrame(updateStick);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [maxDiff]); // maxDiff is constant, so this runs once.

    return (
        <div 
            ref={baseRef}
            className="absolute bottom-[112px] left-[48px] z-50 rounded-full bg-gray-500/30 flex justify-center items-center select-none pointer-events-none"
            style={{ 
                width: `${baseSize}px`, 
                height: `${baseSize}px`,
            }}
        >
            <div
                ref={stickRef}
                className="rounded-full bg-gray-400/50"
                style={{ 
                    width: `${stickSize}px`, 
                    height: `${stickSize}px`,
                }}
            ></div>
        </div>
    );
};

export default VirtualJoystick;