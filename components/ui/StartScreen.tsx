
import React, { useState, useEffect } from 'react';
import InfoModal from './InfoModal';
import XProfileModal from './XLoginModal';
import SettingsModal from './SettingsModal';
import StartScreenBackground from './StartScreenBackground';
import TokenShopModal from './TokenShopModal';
import { CurrentUser, Settings, PermanentUpgrades } from '../../types';
import { saveLastProfile, getLastProfile } from '../../services/profileService';
import { getLeaderboard } from '../../services/leaderboardService';
import { SHIBA_HELMET_ICON } from '../../constants';

interface StartScreenProps {
    onStart: (user: CurrentUser | null) => void;
    onShowLeaderboard: () => void;
    settings: Settings;
    onUpdateSettings: (newSettings: Partial<Settings>) => void;
    permanentUpgrades: PermanentUpgrades;
    onUpdatePermanentUpgrades: (newUpgrades: Partial<PermanentUpgrades>) => void;
}

const XLogo = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current">
        <g>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </g>
    </svg>
);

const SolanaLogo = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current">
        <title>Solana</title>
        <path d="M6.42 4.137a.84.84 0 00-.77.104.839.839 0 00-.455.72l.004.053v14.072c0 .33.19.623.475.764a.833.833 0 00.826-.03l.05-.03 11.23-6.524a.826.826 0 00.428-.729.825.825 0 00-.428-.729L6.47 4.24a.835.835 0 00-.05-.02zm11.276 7.135L6.42 17.8V5.04l11.276 6.524zM4.15 5.925a.837.837 0 00-.81.23l-.05.05-2.21 2.45c-.21.23-.28.56-.18.85l.05.1 7.42 11.28c.21.32.59.45.92.35l.1-.05 2.21-1.28c.27-.16.42-.46.42-.78l-.01-.1-7.42-11.28a.84.84 0 00-.7-.4zM19.85 18.075a.837.837 0 00.81-.23l.05-.05 2.21-2.45c.21-.23.28-.56.18-.85l-.05-.1-7.42-11.28c-.21-.32-.59-.45-.92-.35l-.1.05-2.21 1.28c-.27.16-.42.46-.42.78l.01.1 7.42 11.28c.21.32.59.44.92.35z"></path>
    </svg>
);

const CommunityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 md:w-8 md:h-8 fill-current" viewBox="0 0 24 24">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
);

const GearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowLeaderboard, settings, onUpdateSettings, permanentUpgrades, onUpdatePermanentUpgrades }) => {
    const [isInfoModalOpen, setInfoModalOpen] = useState(false);
    const [isXModalOpen, setXModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isTokenShopOpen, setTokenShopOpen] = useState(false);
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
        <div className="absolute inset-0 bg-gray-900 flex flex-col justify-center items-center z-20 p-4 overflow-hidden" style={{ touchAction: 'pan-y' }}>
             <StartScreenBackground />
             {isInfoModalOpen && <InfoModal onClose={() => setInfoModalOpen(false)} />}
             {isXModalOpen && <XProfileModal onClose={() => setXModalOpen(false)} onConfirm={handleLogin} isSubmitting={isSubmitting} />}
             {isSettingsModalOpen && <SettingsModal settings={settings} onUpdateSettings={onUpdateSettings} onClose={() => setSettingsModalOpen(false)} />}
             {isTokenShopOpen && <TokenShopModal onClose={() => setTokenShopOpen(false)} upgrades={permanentUpgrades} onPurchase={onUpdatePermanentUpgrades} />}


             <div className="relative z-10 w-full h-full flex flex-col justify-center items-center">
                 <div className="absolute top-4 right-4 flex items-center space-x-1 md:space-x-2">
                     <a 
                        href="https://x.com/i/communities/1948656814683254864"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Join our X Community"
                        className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                     >
                        <CommunityIcon />
                     </a>
                     <a 
                        href="https://x.com/trench4_life"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Follow on X"
                        className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                     >
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-7 h-7 md:w-8 md:h-8 fill-current">
                            <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
                        </svg>
                     </a>
                     <button onClick={() => setInfoModalOpen(true)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                     </button>
                     <button onClick={() => setSettingsModalOpen(true)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors">
                        <GearIcon />
                     </button>
                </div>
                
                <div className="text-center">
                    <div className="mb-2 md:mb-4 w-40 h-40 md:w-52 md:h-52 mx-auto drop-shadow-lg">
                        <img src={SHIBA_HELMET_ICON} alt="Trench 4 Life Logo" className="w-full h-full" />
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-mario mb-2 text-rainbow">
                        {'Trench 4 Life'.split('').map((char, index) => (
                            <span key={index}>{char === ' ' ? '\u00A0' : char}</span>
                        ))}
                    </h1>
                     <div className="mb-6">
                        <p className="text-gray-400 text-base md:text-lg">What doesn’t rug you makes you trencher.</p>
                        {topScore && <p className="text-green-400 text-sm md:text-base mt-2">Current Top Score: {topScore}</p>}
                    </div>

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
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={onShowLeaderboard}
                                    className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg text-lg hover:bg-gray-600 transition-colors"
                                >
                                    Leaderboard
                                </button>
                                <button
                                    onClick={() => setTokenShopOpen(true)}
                                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 rounded-lg text-lg hover:bg-purple-500 transition-colors"
                                >
                                    <SolanaLogo />
                                    Upgrades
                                </button>
                            </div>
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
                             <div className="flex gap-4 w-full">
                                <button
                                    onClick={onShowLeaderboard}
                                    className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg text-lg hover:bg-gray-600 transition-colors"
                                >
                                    Leaderboard
                                </button>
                                <button
                                    onClick={() => setTokenShopOpen(true)}
                                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 rounded-lg text-lg hover:bg-purple-500 transition-colors"
                                >
                                    <SolanaLogo />
                                    Upgrades
                                </button>
                            </div>
                        </>
                     )}
                </div>
                 <p className="absolute bottom-2 text-xs text-gray-600">v1.1.0</p>
            </div>
        </div>
    );
};

export default StartScreen;
