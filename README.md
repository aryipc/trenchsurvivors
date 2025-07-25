
# Trench 4 Life

**"What doesn’t rug you makes you trencher."**

![Trench 4 Life Gameplay](https://i.imgur.com/kYd7tqN.png)

Trench 4 Life is a top-down, bullet-heaven survival game with a crypto/memecoin theme. Fend off waves of FUD, paper hands, and rival whales as you shill your way to a legendary market cap. This game is built with React, TypeScript, and Tailwind CSS, featuring a Vercel KV-powered leaderboard.

---

## How to Play

### Controls
- **Desktop:** Use `WASD` or the `Arrow Keys` to move your character.
- **Mobile:** Use the on-screen `virtual joystick` in the bottom-left corner.

### Objective
Your goal is to survive for as long as possible against endless waves of market threats.
1.  **Survive:** Avoid enemies and their attacks. If your **Balance (Health)** drops to zero, the game is over.
2.  **Collect Hype (XP):** Defeated enemies drop purple gems. Collect them to level up.
3.  **Upgrade:** When you level up, you'll be presented with three upgrade options. Choose one to enhance your existing weapons or acquire new ones.
4.  **Increase Market Cap (Score):** Your score is the Market Cap, which grows steadily over time.
5.  **Defeat the Boss:** At a market cap of **$70,000**, a **Migrating Boss** will appear. The market becomes volatile and will start to drop until you defeat it.

---

## Core Game Mechanics

#### Player Stats
- **Balance (Health):** Your health pool. You get rugged if it hits zero.
- **Hype (XP):** Experience points. Fill the blue bar to level up and get stronger.
- **Market Cap (Score):** The primary score metric. Survive longer to increase it.

#### Weapons & Upgrades
You can have up to six unique weapons. Each can be upgraded multiple times.
- **Shill Tweet:** Fires auto-targeting projectiles. Upgrades add piercing, damage, and fire rate.
- **HODLer Area:** A damaging aura that also slows enemies. Upgrades increase its size, damage, and slowing power.
- **Trading Bot:** Deploys orbiting bots that damage enemies on contact. Upgrades add more bots.
- **Laser Eyes:** A powerful, channeled beam that melts the nearest target. Upgrades boost its damage, width, and duration.
- **Airdrop:** Calls in a devastating strike on a random enemy, causing area-of-effect damage.

#### Special Items
Enemies have a small chance to drop powerful, single-use items that activate automatically when you walk over them.
- **Candles (Gake, West, etc.):** Unleash a powerful, rotating beam that decimates enemies. Different candle variants have unique effects, like doubling your max balance or stunning all enemies.
- **BONK Aura:** Activates "BONK Mode," a temporary state where all your weapons are massively overpowered.

#### Enemies
- **FUD:** Standard, slow-moving entities representing Fear, Uncertainty, and Doubt.
- **Paper Hands:** Fast but fragile enemies that try to overwhelm you.
- **Rival Whale:** A slow but very tanky threat that deals significant contact damage.
- **Migrating Boss:** A massive CEX-themed boss that destabilizes the market, introduces new attack patterns, and summons minions.

---

## Technical Stack

-   **Frontend:** Built with **React** and **TypeScript** for a modern, type-safe development experience.
-   **Styling:** Styled with **Tailwind CSS** for rapid and responsive UI development.
-   **Game Loop & Logic:**
    -   A custom `useGameLoop` hook provides a reliable `requestAnimationFrame` loop.
    -   All core game state updates are handled in a decoupled `logic/gameLogic.ts` module. This was a critical optimization to remove a `JSON.parse(JSON.stringify())` bottleneck, ensuring smooth performance by using immutable update patterns.
-   **Backend & Leaderboard:**
    -   The global leaderboard is powered by **Vercel KV (Redis)**.
    -   A **Vercel Serverless Function** (`api/leaderboard.ts`) provides a secure API endpoint for fetching and submitting scores.
-   **Graphics:** Most game assets are SVGs, ensuring they remain crisp and scalable on all devices.

---

## Project Structure

The codebase is organized to separate concerns, making it easier to maintain and extend.

```
/
├── api/
│   └── leaderboard.ts      # Vercel Serverless Function for the leaderboard.
├── public/                 # Static assets.
├── src/
│   ├── components/
│   │   ├── ui/             # UI components (HUD, Modals, Buttons).
│   │   ├── Enemy.tsx       # Renders a single enemy.
│   │   ├── GameScreen.tsx  # Renders the main game area and all entities.
│   │   └── Player.tsx      # Renders the player character.
│   ├── hooks/
│   │   ├── useGameLoop.ts  # Manages the core requestAnimationFrame loop.
│   │   ├── useSettings.ts  # Manages user settings in localStorage.
│   │   └── useTouch.ts     # Handles mobile touch controls.
│   ├── logic/
│   │   └── gameLogic.ts    # The heart of the game: contains the main tick function.
│   ├── services/
│   │   ├── geminiService.ts # (Now static) Handles descriptions for upgrades.
│   │   ├── leaderboardService.ts # Client-side functions to call the leaderboard API.
│   │   └── profileService.ts   # Manages user profile data in localStorage.
│   ├── utils/
│   │   └── upgradeHelper.ts# Logic for generating level-up options.
│   ├── App.tsx             # Main application component, manages top-level state.
│   ├── constants.ts        # All game balance values (damage, health, speed, etc.).
│   └── types.ts            # Centralized TypeScript type definitions.
├── index.html              # Entry HTML file.
└── README.md               # You are here!
```