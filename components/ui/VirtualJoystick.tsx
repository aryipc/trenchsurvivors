
import React, { useRef, useEffect, useCallback } from 'react';

interface VirtualJoystickProps {
    onMove: (vector: { x: number; y: number }) => void;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
    const baseRef = useRef<HTMLDivElement>(null);
    const stickRef = useRef<HTMLDivElement>(null);
    const pointerIdRef = useRef<number | null>(null);

    const baseSize = 120;
    const stickSize = 60;
    const maxDiff = baseSize / 2;

    const updateStickPosition = useCallback((clientX: number, clientY: number) => {
        if (!baseRef.current || !stickRef.current) return;
        
        const baseRect = baseRef.current.getBoundingClientRect();
        const baseCenterX = baseRect.left + baseRect.width / 2;
        const baseCenterY = baseRect.top + baseRect.height / 2;
        
        let diffX = clientX - baseCenterX;
        let diffY = clientY - baseCenterY;
        
        const dist = Math.sqrt(diffX * diffX + diffY * diffY);

        if (dist > maxDiff) {
            diffX = (diffX / dist) * maxDiff;
            diffY = (diffY / dist) * maxDiff;
        }

        stickRef.current.style.transform = `translate(${diffX}px, ${diffY}px)`;
        onMove({ x: diffX / maxDiff, y: diffY / maxDiff });
    }, [onMove, maxDiff]);

    const resetStick = useCallback(() => {
        if (stickRef.current) {
            stickRef.current.style.transform = 'translate(0px, 0px)';
        }
        pointerIdRef.current = null;
        onMove({ x: 0, y: 0 });
    }, [onMove]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (pointerIdRef.current !== null) return;
        
        (e.target as Element).setPointerCapture(e.pointerId);
        pointerIdRef.current = e.pointerId;
        updateStickPosition(e.clientX, e.clientY);
    };

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (pointerIdRef.current !== e.pointerId) return;
        e.preventDefault();
        updateStickPosition(e.clientX, e.clientY);
    }, [updateStickPosition]);
    
    const handlePointerUp = useCallback((e: PointerEvent) => {
        if (pointerIdRef.current !== e.pointerId) return;
        e.preventDefault();
        // The element that captured the pointer is the one that will be the target
        // for the pointerup event, even if the cursor has moved elsewhere.
        (e.target as Element).releasePointerCapture(e.pointerId);
        resetStick();
    }, [resetStick]);

    useEffect(() => {
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
        
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
        };
    }, [handlePointerMove, handlePointerUp]);

    return (
        <div 
            ref={baseRef}
            className="absolute bottom-28 left-12 z-50 rounded-full bg-gray-500/30 flex justify-center items-center select-none"
            style={{ 
                width: `${baseSize}px`, 
                height: `${baseSize}px`,
                touchAction: 'none' // Essential for pointer events on touch devices
            }}
            onPointerDown={handlePointerDown}
        >
            <div
                ref={stickRef}
                className="rounded-full bg-gray-400/50 pointer-events-none"
                style={{ width: `${stickSize}px`, height: `${stickSize}px` }}
            ></div>
        </div>
    );
};

export default VirtualJoystick;
