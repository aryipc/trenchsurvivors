
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface VirtualJoystickProps {
    onMove: (vector: { x: number; y: number }) => void;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
    const baseRef = useRef<HTMLDivElement>(null);
    const stickRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [touchId, setTouchId] = useState<number | null>(null);

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
        setIsDragging(false);
        setTouchId(null);
        onMove({ x: 0, y: 0 });
    }, [onMove]);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.changedTouches[0];
        if (touch) {
            setIsDragging(true);
            setTouchId(touch.identifier);
            updateStickPosition(touch.clientX, touch.clientY);
        }
    };

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === touchId) {
                updateStickPosition(touch.clientX, touch.clientY);
                break;
            }
        }
    }, [isDragging, touchId, updateStickPosition]);
    
    const handleTouchEnd = useCallback((e: TouchEvent) => {
        if (!isDragging) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === touchId) {
                resetStick();
                break;
            }
        }
    }, [isDragging, touchId, resetStick]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleTouchEnd);
            window.addEventListener('touchcancel', handleTouchEnd);
        }
        
        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [isDragging, handleTouchMove, handleTouchEnd]);

    return (
        <div 
            ref={baseRef}
            className="fixed bottom-12 left-12 z-50 rounded-full bg-gray-500/30 flex justify-center items-center select-none"
            style={{ width: `${baseSize}px`, height: `${baseSize}px` }}
            onTouchStart={handleTouchStart}
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
