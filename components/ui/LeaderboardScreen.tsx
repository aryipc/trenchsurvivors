
import React from 'react';
import { ScoreEntry } from '../../types';

interface LeaderboardScreenProps {
    scores: ScoreEntry[];
    onBack: () => void;
    loading: boolean;
}

const GuestAvatar = () => (
    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    </div>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
    </div>
);

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ scores, onBack, loading }) => {

    const formatMarketCap = (value: number) => {
        return `$${Math.floor(value).toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch(e) {
            return 'N/A';
        }
    };

    return (
        <div className="absolute inset-0 bg-gray-900 flex flex-col items-center z-30 text-white p-4 pt-16 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
            <div className="w-full max-w-3xl">
                <h1 className="text-6xl font-cinzel text-yellow-300 mb-8 text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">High Scores</h1>
                
                <div className="bg-gray-800 border-2 border-gray-700 rounded-lg shadow-lg max-h-[60vh] min-h-[20vh] overflow-y-auto" style={{ touchAction: 'pan-y' }}>
                    {loading ? (
                        <LoadingSpinner />
                    ) : scores.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="bg-gray-900/50 sticky top-0">
                                <tr>
                                    <th className="p-4 font-bold text-green-400 w-16 text-center">Rank</th>
                                    <th className="p-4 font-bold text-green-400">Handle</th>
                                    <th className="p-4 font-bold text-green-400 text-right">Top MC</th>
                                    <th className="p-4 font-bold text-green-400 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scores.map((entry, index) => (
                                    <tr key={index} className="border-t border-gray-700 hover:bg-gray-700/50">
                                        <td className="p-4 text-xl font-bold text-center">{index + 1}</td>
                                        <td className="p-4 text-lg">
                                            <div className="flex items-center gap-4">
                                                {entry.avatarUrl ? (
                                                    <img src={entry.avatarUrl} alt={entry.username} className="w-10 h-10 rounded-full bg-gray-700 object-cover" />
                                                ) : (
                                                    <GuestAvatar />
                                                )}
                                                <span>{entry.username}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-lg text-yellow-300 font-mono text-right">{formatMarketCap(entry.score)}</td>
                                        <td className="p-4 text-sm text-gray-400 text-right">{formatDate(entry.date)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="p-8 text-center text-gray-400 text-lg">No scores recorded yet. Go get trenching!</p>
                    )}
                </div>

                <div className="mt-8 text-center">
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