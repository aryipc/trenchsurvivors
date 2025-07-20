
import React, { useState } from 'react';

interface XLoginModalProps {
    onClose: () => void;
    onConfirm: (username: string) => void;
}

const XLogo = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-10 h-10 mx-auto mb-4 fill-white">
        <g>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </g>
    </svg>
);


const XLoginModal: React.FC<XLoginModalProps> = ({ onClose, onConfirm }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onConfirm(username.trim());
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" 
            onClick={onClose}
        >
            <div
                className="bg-gray-900 text-white border-2 border-gray-700 rounded-lg shadow-2xl w-full max-w-sm"
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit} className="p-8">
                    <XLogo />
                    <h2 className="text-2xl font-bold text-center mb-2">Enter your X handle</h2>
                    <p className="text-center text-gray-400 mb-6">Your public avatar will be displayed on the leaderboard.</p>

                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">@</span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                            placeholder="your_handle"
                            maxLength={15}
                            className="bg-gray-800 border-2 border-gray-600 rounded-md pl-8 pr-4 py-3 text-white w-full text-lg focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                            autoFocus
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={!username.trim()}
                        className="w-full mt-6 bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-400 transition-colors transform disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Continue
                    </button>
                     <button
                        type="button"
                        onClick={onClose}
                        className="w-full mt-2 text-gray-400 hover:text-white transition-colors py-2 rounded-lg"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default XLoginModal;
