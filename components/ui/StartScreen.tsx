
import React, { useState } from 'react';
import InfoModal from './InfoModal';
import XLoginModal from './XLoginModal';

interface StartScreenProps {
    onStart: (user: { username: string; avatarUrl: string } | null) => void;
    onShowLeaderboard: () => void;
}

const XLogo = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current">
        <g>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </g>
    </svg>
);

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowLeaderboard }) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showXLogin, setShowXLogin] = useState(false);

    return (
        <>
            <div className="absolute inset-0 bg-gray-900 flex flex-col justify-center items-center z-30 text-white p-4">
                <div className="text-center mb-10">
                    <h1 className="text-6xl md:text-8xl font-cinzel text-green-400 mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.7)]">
                        TRENCH<br />SURVIVORS
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300">The market is a sea of red. Shill, dig, and diamond hand your way out of the trenches.</p>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-xs">
                     <button
                        onClick={() => setShowXLogin(true)}
                        className="bg-black text-white font-bold py-4 px-8 rounded-lg text-xl font-cinzel hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 border-2 border-gray-600"
                    >
                        <XLogo />
                        Connect with X
                    </button>
                    <button
                        onClick={() => onStart(null)}
                        className="bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-lg font-cinzel hover:bg-gray-600 transition-colors"
                    >
                        Play as Guest
                    </button>
                </div>


                <div className="mt-12 flex flex-col gap-4 items-center">
                    <button
                        onClick={onShowLeaderboard}
                        className="bg-gray-700 text-yellow-300 font-bold py-2 px-6 rounded-lg text-lg font-cinzel hover:bg-gray-600 transition-colors"
                    >
                        View Leaderboard
                    </button>
                    <button
                        onClick={() => setShowInfo(true)}
                        className="text-yellow-300 underline hover:text-yellow-200 transition-colors text-lg"
                    >
                        Read Whitepaper
                    </button>
                </div>
            </div>

            {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
            {showXLogin && (
                <XLoginModal
                    onClose={() => setShowXLogin(false)}
                    onConfirm={(username) => {
                        setShowXLogin(false);
                        const avatarUrl = `https://unavatar.io/twitter/${username}`;
                        onStart({ username, avatarUrl });
                    }}
                />
            )}
        </>
    );
};

export default StartScreen;