
import React, { useState, useEffect } from 'react';
import InfoModal from './InfoModal';
import XProfileModal from './XLoginModal';
import SettingsModal from './SettingsModal';
import { CurrentUser, Settings } from '../../types';
import { saveLastProfile, getLastProfile } from '../../services/profileService';
import { getLeaderboard } from '../../services/leaderboardService';
import { SHIBA_HELMET_ICON } from '../../constants';

interface StartScreenProps {
    onStart: (user: CurrentUser | null) => void;
    onShowLeaderboard: () => void;
    settings: Settings;
    onUpdateSettings: (newSettings: Partial<Settings>) => void;
}

const XLogo = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current">
        <g>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </g>
    </svg>
);

const GearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowLeaderboard, settings, onUpdateSettings }) => {
    const [isInfoModalOpen, setInfoModalOpen] = useState(false);
    const [isXModalOpen, setXModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [topScore, setTopScore] = useState<string | null>(null);

    useEffect(() => {
        const profile = getLastProfile();
        if (profile && profile.username) {
            setCurrentUser(profile);
        }

        const fetchTopScore = async () => {
            const scores = await getLeaderboard();
            if (scores.length > 0) {
                setTopScore(`$${scores[0].score.toLocaleString()}`);
            }
        };
        fetchTopScore();
    }, []);

    const handleLogin = async (username: string) => {
        setIsSubmitting(true);
        const avatarUrl = `https://unavatar.io/twitter/${username}`;
        
        const img = new Image();
        img.src = avatarUrl;
        img.onload = () => {
            const user = { username, avatarUrl };
            setCurrentUser(user);
            saveLastProfile(user);
            setIsSubmitting(false);
            setXModalOpen(false);
        };
        img.onerror = () => {
            const user = { username, avatarUrl: '' }; // Use default avatar
            setCurrentUser(user);
            saveLastProfile(user);
            setIsSubmitting(false);
            setXModalOpen(false);
        };
    };

    const handleLogout = () => {
        setCurrentUser(null);
        saveLastProfile({ username: '', avatarUrl: '' }); // Clear profile
    };

    return (
        <div className="absolute inset-0 bg-gray-900 flex flex-col justify-center items-center z-20 p-4" style={{ touchAction: 'pan-y' }}>
             {isInfoModalOpen && <InfoModal onClose={() => setInfoModalOpen(false)} />}
             {isXModalOpen && <XProfileModal onClose={() => setXModalOpen(false)} onConfirm={handleLogin} isSubmitting={isSubmitting} />}
             {isSettingsModalOpen && <SettingsModal settings={settings} onUpdateSettings={onUpdateSettings} onClose={() => setSettingsModalOpen(false)} />}

             <div className="absolute top-4 right-4 flex space-x-2">
                 <button onClick={() => setInfoModalOpen(true)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                 </button>
                 <button onClick={() => setSettingsModalOpen(true)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors">
                    <GearIcon />
                 </button>
            </div>
            
            <div className="text-center">
                <div className="mb-4 w-40 h-40 mx-auto drop-shadow-lg">
                    <img src={SHIBA_HELMET_ICON} alt="Trench Survivors Logo" className="w-full h-full" />
                </div>
                
                <h1 className="text-6xl md:text-7xl font-cinzel text-yellow-300 text-shadow mb-2">Trench Survivors</h1>
                <p className="text-gray-400 text-lg mb-8">Fend off FUD. Shill your coin. Survive the trenches.</p>
                {topScore && <p className="text-green-400 text-md mb-8">Current Top Score: {topScore}</p>}

            </div>
            
            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                 {currentUser?.username ? (
                    <>
                        <button
                            onClick={() => onStart(currentUser)}
                            className="w-full bg-green-500 text-gray-900 font-bold py-4 px-10 rounded-lg text-2xl font-cinzel hover:bg-green-400 transition-colors transform hover:scale-105"
                        >
                            Play
                        </button>
                        <button
                            onClick={onShowLeaderboard}
                            className="w-full bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-600 transition-colors"
                        >
                            Leaderboard
                        </button>
                        <div className="flex items-center gap-2 mt-2 bg-gray-800/50 px-3 py-2 rounded-full">
                           <span className="text-gray-400">Welcome,</span>
                           {currentUser.avatarUrl && <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-6 h-6 rounded-full" />}
                           <span className="font-bold text-white">{currentUser.username}</span>
                           <button onClick={handleLogout} className="text-red-500 hover:underline text-sm">[logout]</button>
                       </div>
                    </>
                 ) : (
                    <>
                        <button 
                            onClick={() => setXModalOpen(true)} 
                            className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-400 transition-colors transform hover:scale-105"
                        >
                            <XLogo />
                            <span>Play as X</span>
                        </button>
                        <button
                            onClick={() => onStart(null)}
                            className="w-full bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-600 transition-colors"
                        >
                            Play as Guest
                        </button>
                        <button
                            onClick={onShowLeaderboard}
                            className="w-full bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-600 transition-colors"
                        >
                            Leaderboard
                        </button>
                    </>
                 )}
            </div>
             <p className="absolute bottom-2 text-xs text-gray-600">v1.1.0</p>
        </div>
    );
};

export default StartScreen;
