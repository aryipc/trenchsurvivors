
import React from 'react';
import { UpgradeOption, WeaponType } from '../../types';

interface LevelUpModalProps {
    options: UpgradeOption[];
    onSelect: (option: UpgradeOption) => void;
    descriptions: Record<string, string>;
    loading: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const LevelUpModal: React.FC<LevelUpModalProps> = ({ options, onSelect, descriptions, loading }) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center z-20">
            <h1 className="text-6xl text-green-400 mb-8 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">DIG DEEPER!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {options.map((option) => {
                    const descKey = `${option.type}_${option.level}`;
                    return (
                        <button
                            key={descKey}
                            onClick={() => onSelect(option)}
                            className="bg-gray-800 border-2 border-green-400 rounded-lg p-6 w-72 text-left hover:bg-gray-700 hover:border-green-300 transform hover:-translate-y-1 transition-all duration-200 shadow-lg shadow-green-500/20"
                        >
                            <h2 className="text-2xl text-white mb-2">{option.name}</h2>
                            <p className="text-green-300 font-bold mb-3">{option.isNew ? 'New Tech!' : `Lvl ${option.level}`}</p>
                            <div className="text-gray-300 h-24 text-yellow-300">
                                {loading ? <LoadingSpinner /> : (descriptions[descKey] || `A powerful upgrade for ${option.type}.`)}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default LevelUpModal;