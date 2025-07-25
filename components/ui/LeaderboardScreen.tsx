import React from 'react';
import { ScoreEntry } from '../../types';
import { SHIBA_HELMET_ICON } from '../../constants';

interface LeaderboardScreenProps {
    scores: ScoreEntry[];
    onBack: () => void;
    loading: boolean;
}

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
    </div>
);

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ scores, onBack, loading }) => {

    const formatMarketCap = (value: number) => {
        return `$${Math.floor(value).toLocaleString()}`;
    };

    const formatBalance = (value: number) => {
        if (typeof value !== 'number') return '0 U';
        return `${Math.floor(value).toLocaleString()} U`;
    };

    const formatDate = (dateString: string) => {
        try {
            // Displaying date and time down to the minute.
            return new Date(dateString).toLocaleString([], {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false, // Using 24-hour clock for compactness
            }).replace(',', ''); // remove comma for more space
        } catch(e) {
            return 'N/A';
        }
    };

    return (
        <div className="absolute inset-0 bg-gray-900 flex flex-col items-center z-30 text-white p-2 pt-12 md:p-4 md:pt-16 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
            <div className="w-full max-w-4xl">
                <h1 className="text-5xl md:text-6xl font-cinzel text-yellow-300 mb-6 text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">High Scores</h1>
                
                <div className="bg-gray-800 border-2 border-gray-700 rounded-lg shadow-lg max-h-[60vh] min-h-[20vh] overflow-y-auto" style={{ touchAction: 'pan-y' }}>
                    {loading ? (
                        <LoadingSpinner />
                    ) : scores.length > 0 ? (
                        <table className="w-full text-left table-fixed">
                            <thead className="bg-gray-900/50 sticky top-0">
                                <tr>
                                    <th className="p-2 md:p-4 font-bold text-green-400 text-center w-14">Rank</th>
                                    <th className="p-2 md:p-4 font-bold text-green-400">Handle</th>
                                    <th className="p-2 md:p-4 font-bold text-green-400 text-right w-24 md:w-28">Top MC</th>
                                    <th className="p-2 md:p-4 font-bold text-green-400 text-right w-24 md:w-28">Top Balance</th>
                                    <th className="p-2 md:p-4 font-bold text-green-400 text-right w-[70px] md:w-24">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scores.map((entry, index) => (
                                    <tr key={index} className="border-t border-gray-700 hover:bg-gray-700/50">
                                        <td className="p-2 md:p-4 text-lg md:text-xl font-bold text-center align-middle">{index + 1}</td>
                                        <td className="p-2 md:p-4 text-base align-middle">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    <img
                                                        src={entry.avatarUrl || SHIBA_HELMET_ICON}
                                                        alt={entry.username}
                                                        className="w-full h-full object-cover"
                                                        style={{ transform: !entry.avatarUrl ? 'scale(1.4)' : 'none' }}
                                                    />
                                                </div>
                                                <span className="truncate">{entry.username}</span>
                                            </div>
                                        </td>
                                        <td className="p-2 md:p-4 text-sm md:text-base text-yellow-300 font-mono text-right align-middle">{formatMarketCap(entry.score)}</td>
                                        <td className="p-2 md:p-4 text-sm md:text-base text-green-400 font-mono text-right align-middle">{formatBalance(entry.maxBalance)}</td>
                                        <td className="p-2 md:p-4 text-xs md:text-sm text-gray-400 text-right align-middle">{formatDate(entry.date)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="p-8 text-center text-gray-400 text-lg">No scores recorded yet. Go get trenching!</p>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500 mb-4 px-4">Note: X avatars are based on user-provided handles and may not represent the actual account holder.</p>
                    <button
                        onClick={onBack}
                        className="bg-green-500 text-gray-900 font-bold py-3 px-10 rounded-lg text-xl font-cinzel hover:bg-green-400 transition-colors transform hover:scale-105"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardScreen;