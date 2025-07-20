
import React from 'react';
import { CurrentUser } from '../../types';

interface GameOverScreenProps {
    score: number;
    marketCap: number;
    onRestart: () => void;
    isNewHighScore: boolean;
    username: CurrentUser | null;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, marketCap, onRestart, isNewHighScore, username }) => {
    const formatMarketCap = (value: number) => {
        return `$${Math.floor(value).toLocaleString()}`;
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-30 text-white p-4">
            <h1 className="text-8xl font-cinzel text-red-500 mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">RUG PULLED</h1>
            
            {isNewHighScore && username && (
                 <div className="bg-green-500 text-white font-bold text-2xl py-2 px-6 rounded-lg mb-6 animate-pulse flex items-center gap-4">
                    {username.avatarUrl && <img src={username.avatarUrl} alt={username.username} className="w-10 h-10 rounded-full bg-gray-800" />}
                    NEW HIGH SCORE FOR {username.username.toUpperCase()}!
                </div>
            )}

            <div className="text-center mb-8 text-2xl">
                <p>Final Market Cap: <span className="text-yellow-300 font-bold">{formatMarketCap(marketCap)}</span></p>
                <p>You flipped <span className="text-yellow-300 font-bold">{score}</span> bears</p>
            </div>
            <button
                onClick={onRestart}
                className="bg-yellow-400 text-gray-900 font-bold py-4 px-10 rounded-lg text-2xl font-cinzel hover:bg-yellow-300 transition-colors transform hover:scale-105"
            >
                Ape In Again
            </button>
        </div>
    );
};

export default GameOverScreen;