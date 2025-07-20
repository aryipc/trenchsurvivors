


import React from 'react';
import { Projectile } from '../types';

interface ProjectileProps {
    projectile: Projectile;
}

const PLAYER_PROJECTILE_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cG9seWdvbiBwb2ludHM9IjEwLDEwIDkwLDUwIDEwLDkwIDI1LDUwIiBmaWxsPSIjMzhiZGY4Ii8+PC9zdmc+";

const ProjectileComponent: React.FC<ProjectileProps> = ({ projectile }) => {
    // Render boss projectile as a red "candle"
    if (projectile.isBossProjectile) {
        const angle = Math.atan2(projectile.dy || 0, projectile.dx || 0);

        const style: React.CSSProperties = {
            position: 'absolute',
            left: projectile.x - projectile.width / 2,
            top: projectile.y - projectile.height / 2,
            width: projectile.width,
            height: projectile.height,
            backgroundColor: 'rgba(239, 68, 68, 0.8)', // red-500
            boxShadow: '0 0 15px 3px rgba(239, 68, 68, 0.5)',
            transform: `rotate(${angle}rad)`,
            borderRadius: '4px',
        };

        return <div style={style} />;
    }

    // Render player projectile as before
    const style: React.CSSProperties = {
        left: projectile.x - projectile.width / 2,
        top: projectile.y - projectile.height / 2,
        width: projectile.width,
        height: projectile.height,
    };
    
    return (
        <div className="absolute" style={style}>
            <img src={PLAYER_PROJECTILE_SVG} alt="Shill Tweet" className={'w-full h-full drop-shadow-lg'} />
        </div>
    );
};

export default React.memo(ProjectileComponent);