
import { useState, useEffect, useCallback } from 'react';
import { PermanentUpgrades } from '../types';

const UPGRADES_KEY = 'trench4LifePermanentUpgrades';

const defaultUpgrades: PermanentUpgrades = {
    bonusDamage: 0,
    bonusXpRate: 0,
};

export const usePermanentUpgrades = (): [PermanentUpgrades, (newUpgrades: Partial<PermanentUpgrades>) => void] => {
    const [upgrades, setUpgrades] = useState<PermanentUpgrades>(() => {
        try {
            const storedUpgrades = localStorage.getItem(UPGRADES_KEY);
            if (storedUpgrades) {
                // Merge stored settings with defaults to ensure all keys are present
                return { ...defaultUpgrades, ...JSON.parse(storedUpgrades) };
            }
        } catch (error) {
            console.error("Failed to parse permanent upgrades from localStorage", error);
        }
        return defaultUpgrades;
    });

    useEffect(() => {
        try {
            localStorage.setItem(UPGRADES_KEY, JSON.stringify(upgrades));
        } catch (error) {
            console.error("Failed to save permanent upgrades to localStorage", error);
        }
    }, [upgrades]);

    const updateUpgrades = useCallback((newUpgrades: Partial<PermanentUpgrades>) => {
        setUpgrades(prevUpgrades => {
            const updated = { ...prevUpgrades };
            if (newUpgrades.bonusDamage) {
                updated.bonusDamage += newUpgrades.bonusDamage;
            }
            if (newUpgrades.bonusXpRate) {
                updated.bonusXpRate += newUpgrades.bonusXpRate;
            }
            return updated;
        });
    }, []);

    return [upgrades, updateUpgrades];
};