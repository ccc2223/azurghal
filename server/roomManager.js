// Room Manager Module for Dice Temple
// Manages users in the room with 5-user cap and single DM restriction

const users = new Map();
let dmHideRolls = false;

/**
 * Add a user to the room
 * @param {string} socketId - The socket ID of the user
 * @param {object} userData - User data containing name, role, and optional health
 * @returns {object} User object or error object
 */
export function addUser(socketId, { name, role, maxHealth, currentHealth }) {
  // Check user cap
  if (users.size >= 5) {
    return { error: 'Room is full. Maximum 5 users allowed.' };
  }

  // Check if DM already exists when trying to add a DM
  if (role === 'dm') {
    const existingDM = Array.from(users.values()).find(user => user.role === 'dm');
    if (existingDM) {
      return { error: 'A DM is already in the room.' };
    }
  }

  const user = {
    id: socketId,
    socketId,
    name,
    role,
    joinedAt: Date.now(),
    // Health tracking for players
    ...(role === 'player' && {
      maxHealth: maxHealth || 20,
      currentHealth: currentHealth || maxHealth || 20
    })
  };

  users.set(socketId, user);
  return user;
}

/**
 * Remove a user from the room
 * @param {string} socketId - The socket ID of the user to remove
 * @returns {object|null} The removed user or null if not found
 */
export function removeUser(socketId) {
  const user = users.get(socketId);
  if (user) {
    users.delete(socketId);
    // Reset hideRolls if DM leaves
    if (user.role === 'dm') {
      dmHideRolls = false;
    }
    return user;
  }
  return null;
}

/**
 * Get a user by socket ID
 * @param {string} socketId - The socket ID to look up
 * @returns {object|undefined} The user object or undefined
 */
export function getUser(socketId) {
  return users.get(socketId);
}

/**
 * Get all users in the room
 * @returns {array} Array of all user objects
 */
export function getUsers() {
  return Array.from(users.values());
}

/**
 * Set the DM's hide rolls preference
 * @param {boolean} hide - Whether to hide DM rolls
 */
export function setDMHideRolls(hide) {
  dmHideRolls = hide;
}

/**
 * Check if the DM is hiding rolls
 * @returns {boolean} True if DM is hiding rolls
 */
export function isDMHidingRolls() {
  return dmHideRolls;
}

/**
 * Update a user's current health
 * @param {string} socketId - The socket ID of the user
 * @param {number} newHealth - The new health value
 * @returns {object|null} Updated user or null if not found
 */
export function updateUserHealth(socketId, newHealth) {
  const user = users.get(socketId);
  if (user && user.role === 'player') {
    // Clamp health between 0 and maxHealth
    user.currentHealth = Math.max(0, Math.min(newHealth, user.maxHealth));
    users.set(socketId, user);
    return user;
  }
  return null;
}
