
import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PermanentUpgrades } from '../../types';
import { TOKEN_UPGRADES } from '../../constants';

interface TokenShopModalProps {
    onClose: () => void;
    upgrades: PermanentUpgrades;
    onPurchase: (newUpgrades: Partial<PermanentUpgrades>) => void;
}

const SolanaLogo = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current">
        <title>Solana</title>
        <path d="M6.42 4.137a.84.84 0 00-.77.104.839.839 0 00-.455.72l.004.053v14.072c0 .33.19.623.475.764a.833.833 0 00.826-.03l.05-.03 11.23-6.524a.826.826 0 00.428-.729.825.825 0 00-.428-.729L6.47 4.24a.835.835 0 00-.05-.02zm11.276 7.135L6.42 17.8V5.04l11.276 6.524zM4.15 5.925a.837.837 0 00-.81.23l-.05.05-2.21 2.45c-.21.23-.28.56-.18.85l.05.1 7.42 11.28c.21.32.59.45.92.35l.1-.05 2.21-1.28c.27-.16.42-.46.42-.78l-.01-.1-7.42-11.28a.84.84 0 00-.7-.4zM19.85 18.075a.837.837 0 00.81-.23l.05-.05 2.21-2.45c.21-.23.28-.56-.18-.85l-.05-.1-7.42-11.28c-.21-.32-.59-.45-.92-.35l-.1.05-2.21 1.28c-.27-.16-.42-.46-.42-.78l.01.1 7.42 11.28c.21.32.59.44.92.35z"></path>
    </svg>
);

const LoadingSpinner: React.FC<{ size?: string }> = ({ size = 'h-5 w-5' }) => (
    <div className={`animate-spin rounded-full border-b-2 border-white ${size}`}></div>
);


const TokenShopModal: React.FC<TokenShopModalProps> = ({ onClose, upgrades, onPurchase }) => {
    const { connection } = useConnection();
    const { connected, publicKey } = useWallet();
    const [solBalance, setSolBalance] = useState<number | null>(null);
    const [isFetchingBalance, setIsFetchingBalance] = useState(false);
    const [purchasingId, setPurchasingId] = useState<string | null>(null);

    useEffect(() => {
        if (connected && publicKey) {
            setIsFetchingBalance(true);
            connection.getBalance(publicKey)
                .then(balance => {
                    setSolBalance(balance / LAMPORTS_PER_SOL);
                })
                .catch(err => {
                    console.error("Failed to fetch balance:", err);
                    setSolBalance(null);
                })
                .finally(() => {
                    setIsFetchingBalance(false);
                });
        } else {
            setSolBalance(null);
        }
    }, [connected, publicKey, connection]);

    const handlePurchase = (upgradeKey: keyof typeof TOKEN_UPGRADES) => {
        const upgrade = TOKEN_UPGRADES[upgradeKey];
        
        setPurchasingId(upgrade.id);
        // Simulate a transaction confirmation delay
        setTimeout(() => {
            // NOTE: In a real scenario, you'd confirm the transaction on-chain
            // before updating the state.
            onPurchase({
                bonusDamage: 'damageBonus' in upgrade ? upgrade.damageBonus : 0,
                bonusXpRate: 'xpBonus' in upgrade ? upgrade.xpBonus : 0,
            });
            setPurchasingId(null);
        }, 2000);
    };

    const isOwned = (upgradeKey: keyof typeof TOKEN_UPGRADES): boolean => {
        const upgrade = TOKEN_UPGRADES[upgradeKey];
        if (upgrade.id === 'bonusDamage') return upgrades.bonusDamage >= upgrade.damageBonus;
        if (upgrade.id === 'bonusXp') return upgrades.bonusXpRate >= upgrade.xpBonus;
        return false;
    };

    const renderPurchaseButton = (upgradeKey: keyof typeof TOKEN_UPGRADES) => {
        const upgrade = TOKEN_UPGRADES[upgradeKey];
        const owned = isOwned(upgradeKey);
        
        if (owned) {
            return (
                <button disabled className="w-full mt-4 bg-green-800 text-green-400 font-bold py-2 px-4 rounded-lg cursor-not-allowed">
                    Owned
                </button>
            );
        }

        const isLoading = purchasingId === upgrade.id;

        return (
            <button
                onClick={() => handlePurchase(upgradeKey)}
                disabled={isLoading || !connected}
                className="w-full mt-4 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed h-10 flex justify-center items-center"
            >
                {isLoading ? <LoadingSpinner /> : `Buy for ${upgrade.cost} T4L`}
            </button>
        );
    };


    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-gray-900 text-white border-2 border-purple-500 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-lg"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-cinzel text-purple-400 flex items-center gap-3"><SolanaLogo /> Solana Upgrades</h1>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-4xl leading-none">&times;</button>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-lg mb-6 flex flex-col items-center justify-center space-y-2">
                       <WalletMultiButton style={{ backgroundColor: '#8b5cf6', minWidth: '200px' }} />
                       {connected && (
                         <div className="text-center mt-2">
                            <p className="text-sm text-gray-400">Balance</p>
                            {isFetchingBalance ? (
                                <LoadingSpinner size="h-6 w-6" />
                            ) : (
                                <p className="text-xl font-bold text-green-400">
                                    {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : 'Error fetching balance'}
                                </p>
                            )}
                         </div>
                       )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(TOKEN_UPGRADES).map(key => {
                            const upgrade = TOKEN_UPGRADES[key as keyof typeof TOKEN_UPGRADES];
                            return (
                                <div key={upgrade.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <img src={upgrade.icon} alt={upgrade.name} className="w-8 h-8"/>
                                            <h3 className="font-bold text-lg text-white">{upgrade.name}</h3>
                                        </div>
                                        <p className="text-gray-400 text-sm">{upgrade.description}</p>
                                    </div>
                                    {renderPurchaseButton(key as keyof typeof TOKEN_UPGRADES)}
                                </div>
                            );
                        })}
                    </div>
                     <p className="text-xs text-gray-500 mt-6 text-center">Note: T4L token purchases are simulated. Only wallet connection and SOL balance are live.</p>
                </div>
            </div>
        </div>
    );
};

export default TokenShopModal;