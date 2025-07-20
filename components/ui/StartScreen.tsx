
import React, { useState, useEffect } from 'react';
import InfoModal from './InfoModal';
import XProfileModal from './XLoginModal';
import { CurrentUser } from '../../types';
import { saveLastProfile, getLastProfile } from '../../services/profileService';
import { getLeaderboard } from '../../services/leaderboardService';

interface StartScreenProps {
    onStart: (user: CurrentUser | null) => void;
    onShowLeaderboard: () => void;
}

const XLogo = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current">
        <g>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </g>
    </svg>
);

/**
 * Escapes characters in a string that have special meaning in a regular expression.
 * @param string The string to escape.
 * @returns The escaped string.
 */
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowLeaderboard }) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showXProfileModal, setShowXProfileModal] = useState(false);
    const [lastProfile, setLastProfile] = useState<CurrentUser | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setLastProfile(getLastProfile());
    }, []);

    const handleConfirmProfile = async (username: string) => {
        setIsSubmitting(true);
        
        const leaderboard = await getLeaderboard();
        
        let highestSuffix = 0;
        
        // This regex matches the base username, or the base username followed by a dash and a number.
        // e.g., if username is "player", it matches "player" and "player-2", but not "player-x" or "myplayer".
        const suffixRegex = new RegExp(`^${escapeRegExp(username)}(?:-(\\d+))?$`, 'i');
        
        leaderboard.forEach(entry => {
            const match = entry.username.match(suffixRegex);
            if (match) {
                if (match[1]) { // A suffixed version was found, e.g., "player-2". match[1] is "2".
                    highestSuffix = Math.max(highestSuffix, parseInt(match[1], 10));
                } else { // The base username itself was found.
                    highestSuffix = Math.max(highestSuffix, 1);
                }
            }
        });
        
        // If highestSuffix is 0, no matches were found.
        // If highestSuffix is 1, it means "username" exists, so the next should be "username-2".
        // If highestSuffix is N, it means "username-N" exists, so the next should be "username-(N+1)".
        const finalUsername = highestSuffix > 0 ? `${username}-${highestSuffix + 1}` : username;

        const avatarUrl = `https://unavatar.io/twitter/${username}`; // The avatar URL always uses the original, unsuffixed handle.
        const user = { username: finalUsername, avatarUrl };
        saveLastProfile(user);
        onStart(user);
        // No need to set isSubmitting to false, as the component unmounts.
    };
    
    const handleCloseModal = () => {
        setShowXProfileModal(false);
        setIsSubmitting(false);
    };

    return (
        <>
            <div className="absolute inset-0 bg-gray-900 flex flex-col items-center z-30 text-white p-4 pt-16 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
                <div className="text-center mb-10">
                    <h1 className="text-6xl md:text-8xl font-cinzel text-green-400 mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.7)]">
                        TRENCH<br />SURVIVORS
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300">The market is a sea of red. Shill, dig, and diamond hand your way out of the trenches.</p>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-xs">
                     {lastProfile ? (
                         <>
                            <button
                                onClick={() => onStart(lastProfile)}
                                className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-xl font-cinzel hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 border-2 border-blue-400"
                            >
                                <img src={lastProfile.avatarUrl} alt={lastProfile.username} className="w-8 h-8 rounded-full bg-gray-700 object-cover" />
                                Continue as @{lastProfile.username.split('-')[0]}
                            </button>
                             <button
                                onClick={() => setShowXProfileModal(true)}
                                className="bg-black text-white font-bold py-3 px-8 rounded-lg text-lg font-cinzel hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 border-2 border-gray-600"
                            >
                                <XLogo />
                                Use New X Profile
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setShowXProfileModal(true)}
                            className="bg-black text-white font-bold py-4 px-8 rounded-lg text-xl font-cinzel hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 border-2 border-gray-600"
                        >
                            <XLogo />
                            Play with X Profile
                        </button>
                    )}
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
            {showXProfileModal && (
                <XProfileModal
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmProfile}
                    isSubmitting={isSubmitting}
                />
            )}
        </>
    );
};

export default StartScreen;