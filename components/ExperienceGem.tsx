
import React from 'react';
import { ExperienceGem } from '../types';

interface ExperienceGemProps {
    gem: ExperienceGem;
}

const ExperienceGemComponent: React.FC<ExperienceGemProps> = ({ gem }) => {
    const style: React.CSSProperties = {
        left: gem.x - 5,
        top: gem.y - 5,
        width: 10,
        height: 10,
    };

    return (
        <div className="absolute bg-purple-500 rounded-full border-2 border-white" style={style}></div>
    );
};

export default React.memo(ExperienceGemComponent);