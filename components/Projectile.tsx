

import React from 'react';
import { Projectile } from '../types';

interface ProjectileProps {
    projectile: Projectile;
}

const PLAYER_PROJECTILE_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cG9seWdvbiBwb2ludHM9IjEwLDEwIDkwLDUwIDEwLDkwIDI1LDUwIiBmaWxsPSIjMzhiZGY4Ii8+PC9zdmc+";
const BOSS_PROJECTILE_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyNSIgZmlsbD0iI2RlM2IzYiIvPjxwYXRoIGQ9Ik01MCwxMCBMNTEsMzAgNDksMzBaIE05MCw1MCBMNzAsNTEgNzAsNDlaIE01MCw5MCBMNDksNzAgNTEsNzBaIE0xMCw1MCBMMzAsNDkgMzAsNTFaIE0yNSwyNSBMMzksMzkgNDAsNDAgTDI2LDI2WiBNNzUsMjUgTDYxLDM5IDYwLDQwIEw3NCwyNloiIGZpbGw9IiNiYzE4MmMiIHN0cm9rZT0iI2JjMTgyYyIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxNSIgZmlsbD0iI2VmNDQ0NCIvPjwvc3ZnPg==";


const ProjectileComponent: React.FC<ProjectileProps> = ({ projectile }) => {
    const style: React.CSSProperties = {
        left: projectile.x - projectile.width / 2,
        top: projectile.y - projectile.height / 2,
        width: projectile.width,
        height: projectile.height,
    };

    const imgSrc = projectile.isBossProjectile ? BOSS_PROJECTILE_SVG : PLAYER_PROJECTILE_SVG;
    const altText = projectile.isBossProjectile ? 'Boss Projectile' : 'Shill Tweet';
    const shadowClass = projectile.isBossProjectile ? 'drop-shadow-[0_0_5px_#ef4444]' : 'drop-shadow-lg';


    return (
        <div className="absolute" style={style}>
            <img src={imgSrc} alt={altText} className={`w-full h-full ${shadowClass}`} />
        </div>
    );
};

export default React.memo(ProjectileComponent);