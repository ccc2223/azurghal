import React from 'react';
import { useGame } from '../context/GameContext';
import DiceRoller from './DiceRoller';
import HealthBar from './HealthBar';

function PlayerBox({ user, isCurrentUser, position }) {
  const { rollHistory, currentUser, socketActions } = useGame();

  const lastRoll = rollHistory
    .filter((r) => r.userName === user.name)
    .slice(-1)[0];

  const handleRoll = (dieType) => {
    if (socketActions?.roll) {
      socketActions.roll(dieType);
    }
  };

  const handleToggleHideRolls = () => {
    if (socketActions?.toggleHideRolls) {
      socketActions.toggleHideRolls();
    }
  };

  const handleHealthChange = (newHealth) => {
    if (socketActions?.updateHealth) {
      socketActions.updateHealth(newHealth);
    }
  };

  const isDM = user.role === 'dm';
  const isPlayer = user.role === 'player';
  const canToggleHideRolls = isDM && isCurrentUser;

  return (
    <div className={`player-box position-${position} ${isDM ? 'dm' : ''} ${isCurrentUser ? 'current-user' : ''} ${user.disconnected ? 'disconnected' : ''}`}>
      <div className="player-header">
        <span className="player-name">{user.name}</span>
        <span className={`role-badge role-${user.role}`}>
          {user.role === 'dm' ? 'DM' : 'Player'}
        </span>
        {user.disconnected && (
          <span className="disconnected-indicator">Disconnected</span>
        )}
      </div>

      {/* Health bar for players */}
      {isPlayer && user.maxHealth && (
        <HealthBar
          currentHealth={user.currentHealth}
          maxHealth={user.maxHealth}
          onHealthChange={handleHealthChange}
          editable={isCurrentUser}
        />
      )}

      {canToggleHideRolls && (
        <div className="hide-rolls-toggle">
          <label>
            <input
              type="checkbox"
              checked={currentUser?.hideRolls || false}
              onChange={handleToggleHideRolls}
            />
            Hide my rolls
          </label>
        </div>
      )}

      <div className="dice-display">
        {lastRoll ? (
          <div className="last-roll">
            <span className="die-type">{lastRoll.dieType}</span>
            <span className="roll-result">
              {lastRoll.hidden && lastRoll.result === null ? 'hidden' : lastRoll.result}
            </span>
          </div>
        ) : (
          <div className="no-roll">No rolls yet</div>
        )}
      </div>

      {isCurrentUser && (
        <DiceRoller onRoll={handleRoll} />
      )}
    </div>
  );
}

export default PlayerBox;
