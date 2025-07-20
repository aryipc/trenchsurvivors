
import React, { useState } from 'react';
import InfoModal from './InfoModal';

interface StartScreenProps {
    onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <>
            <div className="absolute inset-0 bg-gray-900 flex flex-col justify-center items-center z-30 text-white p-4">
                <div className="text-center mb-12">
                    <h1 className="text-6xl md:text-8xl font-cinzel text-green-400 mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.7)]">Trench Survivors</h1>
                    <p className="text-lg md:text-xl text-gray-300">The market is a sea of red. Shill, dig, and diamond hand your way out of the trenches.</p>
                </div>

                <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-2xl border-2 border-gray-700 w-full max-w-md text-center">
                    <h2 className="text-xl md:text-2xl font-bold mb-4">How to Play</h2>
                    <p className="text-base md:text-lg"><span className="font-bold text-yellow-300">W, A, S, D</span> or <span className="font-bold text-yellow-300">Arrow Keys</span> to move.</p>
                    <p className="text-base md:text-lg mt-1"><span className="font-bold text-yellow-300">On Mobile:</span> Use the on-screen joystick.</p>
                    <p className="text-base md:text-lg mt-2">Tech fires automatically. Just survive.</p>
                     <button
                        onClick={() => setShowInfo(true)}
                        className="mt-6 text-yellow-300 underline hover:text-yellow-200 transition-colors text-lg"
                    >
                        Read Whitepaper
                    </button>
                </div>

                <button
                    onClick={onStart}
                    className="mt-12 bg-green-500 text-gray-900 font-bold py-4 px-10 rounded-lg text-xl md:text-2xl font-cinzel hover:bg-green-400 transition-colors transform hover:scale-105 animate-pulse"
                >
                    Start Trenching
                </button>
            </div>

            {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
        </>
    );
};

export default StartScreen;
