// src/lib/levels.ts

// Define XP thresholds for each level.
// Level 1: 0 XP
// Level 2: 50 XP
// Level 3: 120 XP
// Level 4: 200 XP
// Level 5: 350 XP, etc.
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  50,     // Level 2
  120,    // Level 3
  200,    // Level 4
  350,    // Level 5
  550,    // Level 6
  800,    // Level 7
  1100,   // Level 8
  1500,   // Level 9
  2000    // Level 10
];

/**
 * Calculates the user's level based on accumulated XP.
 * @param xp The user's total XP
 * @returns The user's current level (1-indexed)
 */
export function calculateLevel(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Returns the XP required for the NEXT level.
 */
export function getNextLevelXp(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    // Max level reached (or just arbitrary high limit)
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]; 
  }
  return LEVEL_THRESHOLDS[currentLevel];
}

/**
 * Returns the XP required to REACH the current level.
 */
export function getCurrentLevelBaseXp(currentLevel: number): number {
  if (currentLevel <= 1) return 0;
  return LEVEL_THRESHOLDS[Math.min(currentLevel - 1, LEVEL_THRESHOLDS.length - 1)];
}
