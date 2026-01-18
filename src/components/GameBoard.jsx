import React from 'react';
import { useGame } from '../context/GameContext';
import PlayerBox from './PlayerBox';
import RollHistory from './RollHistory';

const POSITIONS = ['top', 'left', 'right', 'bottom-left', 'bottom-right'];

function GameBoard() {
  const { users, currentUser } = useGame();

  const getPlayerPosition = (index, user) => {
    if (user.role === 'dm') {
      return 'top';
    }
    const nonDmUsers = users.filter((u) => u.role !== 'dm');
    const nonDmIndex = nonDmUsers.findIndex((u) => u.id === user.id);
    const availablePositions = POSITIONS.filter((p) => p !== 'top');
    return availablePositions[nonDmIndex % availablePositions.length];
  };

  if (users.length < 2) {
    return (
      <div className="game-board temple-background">
        <div className="waiting-message">
          <h2>Waiting for players...</h2>
          <p>At least 2 players are needed to start the game.</p>
          <p>Connected: {users.length} / 2</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-board temple-background">
      <div className="player-positions">
        {users.map((user, index) => (
          <PlayerBox
            key={user.id}
            user={user}
            isCurrentUser={currentUser?.id === user.id}
            position={getPlayerPosition(index, user)}
          />
        ))}
      </div>
      <RollHistory />
    </div>
  );
}

export default GameBoard;
