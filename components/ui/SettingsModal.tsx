
import React from 'react';
import { Settings } from '../../types';

interface SettingsModalProps {
    settings: Settings;
    onUpdateSettings: (newSettings: Partial<Settings>) => void;
    onClose: () => void;
}

interface ToggleSwitchProps {
    label: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer p-4 bg-gray-800/50 rounded-lg">
        <span className="text-lg text-white">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={enabled} onChange={(e) => onChange(e.target.checked)} />
            <div className={`block w-14 h-8 rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-gray-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'transform translate-x-6' : ''}`}></div>
        </div>
    </label>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onUpdateSettings, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-gray-900 text-white border-2 border-green-400 rounded-lg shadow-2xl shadow-green-500/20 w-full max-w-md"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-4xl text-green-400">Settings</h1>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-4xl leading-none">&times;</button>
                    </div>

                    <div className="space-y-4">
                        <ToggleSwitch
                            label="Screen Shake"
                            enabled={settings.screenShake}
                            onChange={(value) => onUpdateSettings({ screenShake: value })}
                        />
                         <ToggleSwitch
                            label="Floating Text"
                            enabled={settings.floatingText}
                            onChange={(value) => onUpdateSettings({ floatingText: value })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;