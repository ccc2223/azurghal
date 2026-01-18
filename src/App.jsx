import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { useSocket } from './hooks/useSocket';
import JoinScreen from './components/JoinScreen';
import GameBoard from './components/GameBoard';

function AppContent() {
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const { currentUser } = useGame();
  const { joinRoom, error, connected } = useSocket();

  useEffect(() => {
    if (currentUser) {
      setJoined(true);
      setJoinError(null);
    }
  }, [currentUser]);

  useEffect(() => {
    if (error) {
      setJoinError(error);
    }
  }, [error]);

  const handleJoin = async (userData) => {
    setJoinError(null);
    joinRoom(userData.name, userData.role, userData.secret, userData.maxHealth, userData.currentHealth);

    return new Promise((resolve, reject) => {
      const checkJoined = setInterval(() => {
        if (currentUser) {
          clearInterval(checkJoined);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkJoined);
        if (!currentUser) {
          reject(new Error(joinError || 'Failed to join. Please try again.'));
        }
      }, 5000);
    });
  };

  if (!connected) {
    return (
      <div className="app connecting">
        <div className="connecting-message">
          <h2>Connecting to Dice Temple...</h2>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {!joined ? (
        <JoinScreen onJoin={handleJoin} />
      ) : (
        <GameBoard />
      )}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
