import React from 'react';
import { MC_PER_SECOND, STARTING_MC } from '../../constants';

interface VictoryScreenProps {
    score: number;
    time: number;
    onRestart: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ score, time, onRestart }) => {
    const finalMarketCap = (time * MC_PER_SECOND) + STARTING_MC;
    const formatMarketCap = (value: number) => {
        return `$${Math.floor(value).toLocaleString()}`;
    };

    return (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex flex-col justify-center items-center z-30 text-white">
            <h1 className="text-8xl font-cinzel text-green-400 mb-4 drop-shadow-[0_2px_2px_rgba(0,255,0,0.5)]">DECENTRALIZATION ACHIEVED</h1>
            <div className="text-center mb-8 text-2xl">
                <p>You went to the moon!</p>
                <p>Final Market Cap: <span className="text-yellow-300 font-bold">{formatMarketCap(finalMarketCap)}</span></p>
                <p>You flipped <span className="text-yellow-300 font-bold">{score}</span> bears and rugged the CEX</p>
            </div>
            <button
                onClick={onRestart}
                className="bg-green-500 text-gray-900 font-bold py-4 px-10 rounded-lg text-2xl font-cinzel hover:bg-green-400 transition-colors transform hover:scale-105"
            >
                Dig Another Trench
            </button>
        </div>
    );
};

export default VictoryScreen;