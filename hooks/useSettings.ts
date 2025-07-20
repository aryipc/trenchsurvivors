import { useState, useEffect, useCallback } from 'react';
import { Settings } from '../types';

const SETTINGS_KEY = 'trenchSurvivorsSettings';

const defaultSettings: Settings = {
    screenShake: true,
    floatingText: true,
};

export const useSettings = (): [Settings, (newSettings: Partial<Settings>) => void] => {
    const [settings, setSettings] = useState<Settings>(() => {
        try {
            const storedSettings = localStorage.getItem(SETTINGS_KEY);
            if (storedSettings) {
                // Merge stored settings with defaults to ensure all keys are present
                return { ...defaultSettings, ...JSON.parse(storedSettings) };
            }
        } catch (error) {
            console.error("Failed to parse settings from localStorage", error);
        }
        return defaultSettings;
    });

    useEffect(() => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error("Failed to save settings to localStorage", error);
        }
    }, [settings]);

    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
    }, []);

    return [settings, updateSettings];
};
