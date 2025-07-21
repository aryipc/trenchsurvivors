
import React, { useState, useEffect } from 'react';
import { CurrentUser } from '../../types';

interface GameOverScreenProps {
    score: number;
    marketCap: number;
    maxBalance: number;
    onRestart: () => void;
    onBackToHome: () => void;
    isNewHighScore: boolean;
    username: CurrentUser | null;
}

const COMMENTARY_TIERS: { [key: string]: string[] } = {
    shame: [
        "That was... a warm-up?",
        "You bought the top AND held the bag.",
        "Even the dev gave up on you.",
        "A true paper-handed Trencher.",
    ],
    novice: [
        "Not bad, but you still got rugged like a rookie.",
        "You sniffed the pump, but couldn’t ride it.",
        "Almost made it. Almost.",
        "Honorably discharged from the trenches.",
    ],
    seasoned: [
        "You saw the top... and ignored it.",
        "You fought bravely. Then you round-tripped.",
        "Certified Trencher. But still got slapped.",
        "You made it out alive — barely.",
    ],
    legendary: [
        "Now that’s how a Trencher dies with glory.",
        "Your bags were almost worth framing.",
        "Legendary ape. Rugged with pride.",
        "They’ll write songs about your pump.",
    ],
};

const getCommentary = (marketCap: number): string => {
    let tier: string[];
    if (marketCap < 10000) {
        tier = COMMENTARY_TIERS.shame;
    } else if (marketCap < 30000) {
        tier = COMMENTARY_TIERS.novice;
    } else if (marketCap < 70000) {
        tier = COMMENTARY_TIERS.seasoned;
    } else {
        tier = COMMENTARY_TIERS.legendary;
    }
    return tier[Math.floor(Math.random() * tier.length)];
};

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, marketCap, maxBalance, onRestart, onBackToHome, isNewHighScore, username }) => {
    const [commentary, setCommentary] = useState('');

    useEffect(() => {
        setCommentary(getCommentary(marketCap));
    }, [marketCap]);

    const formatMarketCap = (value: number) => {
        return `$${Math.floor(value).toLocaleString()}`;
    };

    const formatBalance = (value: number) => {
        return `${Math.floor(value).toLocaleString()} U`;
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-30 text-white p-4">
            <h1 className="text-8xl text-red-500 mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">RUG PULLED</h1>
            <p className="text-gray-300 text-xl mb-6 text-center italic">"{commentary}"</p>
            
            {isNewHighScore && username && (
                 <div className="bg-green-500 text-white font-bold text-2xl py-2 px-6 rounded-lg mb-6 animate-pulse flex items-center gap-4">
                    {username.avatarUrl && <img src={username.avatarUrl} alt={username.username} className="w-10 h-10 rounded-full bg-gray-800" />}
                    NEW HIGH SCORE FOR {username.username.toUpperCase()}!
                </div>
            )}

            <div className="text-center mb-8 text-2xl space-y-2">
                <p>Final Market Cap: <span className="text-yellow-300 font-bold">{formatMarketCap(marketCap)}</span></p>
                <p>Your Max Balance: <span className="text-green-400 font-bold">{formatBalance(maxBalance)}</span></p>
                <p>You flipped <span className="text-yellow-300 font-bold">{score}</span> fuds</p>
            </div>
            
            <div className="flex flex-col items-center gap-2">
                <button
                    onClick={onRestart}
                    className="bg-yellow-400 text-gray-900 font-bold py-4 px-10 rounded-lg text-2xl hover:bg-yellow-300 transition-colors transform hover:scale-105"
                >
                    Ape In Again
                </button>
                <button
                    onClick={onBackToHome}
                    className="text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-lg text-lg"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default GameOverScreen;