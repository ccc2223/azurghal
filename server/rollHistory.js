// Roll History Module for Dice Temple
// Manages roll history and generates dice roll results

const history = [];

// Dice type configurations
const diceConfig = {
  d4: { min: 1, max: 4 },
  d6: { min: 1, max: 6 },
  d8: { min: 1, max: 8 },
  d10: { min: 1, max: 10 },
  d00: { values: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
  d12: { min: 1, max: 12 },
  d20: { min: 1, max: 20 }
};

/**
 * Generate a random roll result for a given die type
 * @param {string} dieType - The type of die (d4, d6, d8, d10, d00, d12, d20)
 * @returns {number|null} The roll result or null if invalid die type
 */
export function generateRoll(dieType) {
  const die = diceConfig[dieType.toLowerCase()];

  if (!die) {
    return null;
  }

  // Handle d00 (percentile die) with specific values
  if (die.values) {
    const randomIndex = Math.floor(Math.random() * die.values.length);
    return die.values[randomIndex];
  }

  // Handle standard dice with min/max range
  return Math.floor(Math.random() * (die.max - die.min + 1)) + die.min;
}

/**
 * Add a roll to the history
 * @param {object} rollData - Roll data object
 * @param {string} rollData.userName - Name of the user who rolled
 * @param {string} rollData.role - Role of the user (dm or player)
 * @param {string} rollData.dieType - Type of die rolled
 * @param {number} rollData.result - The roll result
 * @param {boolean} rollData.hidden - Whether the roll is hidden
 * @param {number} rollData.timestamp - Timestamp of the roll
 * @returns {object} The added roll object
 */
export function addRoll({ userName, role, dieType, result, hidden, timestamp }) {
  const roll = {
    id: `roll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userName,
    role,
    dieType,
    result,
    hidden,
    timestamp: timestamp || Date.now()
  };

  history.push(roll);
  return roll;
}

/**
 * Get all rolls in the history
 * @returns {array} Array of all roll objects
 */
export function getHistory() {
  return [...history];
}

/**
 * Get history formatted for a specific user role
 * Hidden rolls show result as null for non-DM users
 * @param {string} role - The role of the requesting user
 * @returns {array} Formatted history array
 */
export function getHistoryForRole(role) {
  return history.map(roll => {
    if (roll.hidden && role !== 'dm') {
      return { ...roll, result: null };
    }
    return { ...roll };
  });
}
