
import React from 'react';
import { ExperienceGem } from '../types';

interface ExperienceGemProps {
    gem: ExperienceGem;
}

const ExperienceGemComponent: React.FC<ExperienceGemProps> = ({ gem }) => {
    const size = gem.isLarge ? 20 : 10;
    const offset = size / 2;

    const style: React.CSSProperties = {
        left: gem.x - offset,
        top: gem.y - offset,
        width: size,
        height: size,
        boxShadow: gem.isLarge ? '0 0 10px 2px rgba(192, 132, 252, 0.7)' : undefined, // purple-400 glow
    };

    return (
        <div className="absolute bg-purple-500 rounded-full border-2 border-white transition-all duration-300" style={style}></div>
    );
};

export default React.memo(ExperienceGemComponent);