
import { Weapon, UpgradeOption, WeaponType } from '../types';
import { WEAPON_DATA } from '../constants';

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function getUpgradeOptions(currentWeapons: Weapon[]): UpgradeOption[] {
    const availableUpgrades: UpgradeOption[] = [];
    const ownedWeaponTypes = currentWeapons.map(w => w.type);

    // Add options to upgrade existing weapons
    currentWeapons.forEach(weapon => {
        const weaponData = WEAPON_DATA[weapon.type];
        if (weapon.level < weaponData.maxLevel) {
            availableUpgrades.push({
                type: weapon.type,
                name: weaponData.name,
                level: weapon.level + 1,
                isNew: false,
            });
        }
    });

    // Add options for new weapons if player has less than 6 weapons
    if (ownedWeaponTypes.length < 6) {
        const allWeaponTypes = Object.keys(WEAPON_DATA) as WeaponType[];
        const unownedWeapons = allWeaponTypes.filter(type => !ownedWeaponTypes.includes(type));

        unownedWeapons.forEach(type => {
            const weaponData = WEAPON_DATA[type];
            availableUpgrades.push({
                type: type,
                name: weaponData.name,
                level: 1,
                isNew: true,
            });
        });
    }


    // Shuffle and pick 3 options
    return shuffleArray(availableUpgrades).slice(0, 3);
}
