
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

const XLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-current ${className || 'w-6 h-6'}`}>
        <g>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </g>
    </svg>
);

const CommunityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 fill-current" viewBox="0 0 24 24">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
);

const GearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowLeaderboard, settings, onUpdateSettings }) => {
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [xProfileModalOpen, setXProfileModalOpen] = useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [lastProfile, setLastProfile] = useState<CurrentUser | null>(null);
    const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
    const [topScore, setTopScore] = useState(0);

    useEffect(() => {
        setLastProfile(getLastProfile());
        getLeaderboard().then(scores => {
            if (scores && scores.length > 0) {
                setTopScore(scores[0].score);
            }
        });
    }, []);

    const handleXLoginConfirm = async (username: string) => {
        setIsSubmittingProfile(true);
        try {
            // Using unavatar.io to get a user's X profile picture
            const avatarUrl = `https://unavatar.io/twitter/${username}`;
            const user: CurrentUser = { username, avatarUrl };
            saveLastProfile(user);
            setLastProfile(user);
            onStart(user);
        } catch (error) {
            console.error("Failed to fetch X profile", error);
            // Fallback or error message could be shown to the user
        } finally {
            setIsSubmittingProfile(false);
            setXProfileModalOpen(false);
        }
    };
    
    const handleStartAsUser = () => {
        if (lastProfile) {
            onStart(lastProfile);
        } else {
            setXProfileModalOpen(true);
        }
    };
    
    const formatMarketCap = (value: number) => {
        return `$${Math.floor(value).toLocaleString()}`;
    };

    return (
        <div className="absolute inset-0 bg-gray-900 flex justify-center items-center">
            <div className="absolute top-4 right-4 flex items-center gap-4 text-gray-400">
                <a 
                    href="https://x.com/i/communities/1947179185392255158"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                    aria-label="Community"
                >
                    <CommunityIcon />
                </a>
                <a 
                    href="https://x.com/trenvive_sol"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                    aria-label="X Profile"
                >
                    <XLogo className="w-7 h-7" />
                </a>
                <button 
                    onClick={() => setInfoModalOpen(true)} 
                    className="hover:text-white transition-colors"
                    aria-label="Whitepaper"
                >
                    <InfoIcon />
                </button>
                <button 
                    onClick={() => setSettingsModalOpen(true)} 
                    className="hover:text-white transition-colors"
                    aria-label="Settings"
                >
                    <GearIcon />
                </button>
            </div>


            <div className="text-center">
                <img src={SHIBA_HELMET_ICON} alt="Trench Survivors" className="w-32 h-32 mx-auto mb-4 drop-shadow-[0_5px_15px_rgba(251,191,36,0.2)]" />
                <h1 className="text-7xl text-yellow-300 text-shadow mb-2">Trench Survivors</h1>
                <p className="text-xl text-gray-400 mb-4">What doesn't rug you makes you trencher.</p>
                <p className="text-lg text-green-400 mb-8">
                    Current Top Score: {topScore > 0 ? formatMarketCap(topScore) : 'None'}
                </p>

                <div className="flex flex-col items-center gap-3 w-64 mx-auto">
                    <button
                        onClick={handleStartAsUser}
                        className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-xl hover:bg-blue-400 transition-colors transform hover:scale-105"
                    >
                        <XLogo />
                        {lastProfile ? `Play as ${lastProfile.username}` : 'Play as X'}
                    </button>
                    <button
                        onClick={() => onStart(null)}
                        className="w-full bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-xl hover:bg-gray-600 transition-colors"
                    >
                        Play as Guest
                    </button>
                    <button
                        onClick={onShowLeaderboard}
                        className="w-full bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-xl hover:bg-gray-600 transition-colors"
                    >
                        Leaderboard
                    </button>
                </div>
            </div>

            {infoModalOpen && <InfoModal onClose={() => setInfoModalOpen(false)} />}
            {xProfileModalOpen && <XProfileModal onClose={() => setXProfileModalOpen(false)} onConfirm={handleXLoginConfirm} isSubmitting={isSubmittingProfile} />}
            {settingsModalOpen && <SettingsModal settings={settings} onUpdateSettings={onUpdateSettings} onClose={() => setSettingsModalOpen(false)} />}
        </div>
    );
};

export default StartScreen;
