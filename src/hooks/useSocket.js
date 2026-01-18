import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useGame } from '../context/GameContext';

// In production, connect to same origin. In dev, use VITE_SERVER_URL or localhost.
const SERVER_URL = import.meta.env.PROD
  ? ''
  : (import.meta.env.VITE_SERVER_URL || 'http://localhost:3000');

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  const {
    setCurrentUser,
    setUsers,
    addUser,
    removeUser,
    addRoll,
    setHistory,
    setSocket,
    setSocketActions,
  } = useGame();

  useEffect(() => {
    const socket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;
    setSocket(socket);

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      setError(err.message);
      setConnected(false);
    });

    socket.on('join-success', (data) => {
      setCurrentUser(data.user);
      setUsers(data.users);
      setHistory(data.history || []);
      setError(null);
    });

    socket.on('join-error', (data) => {
      setError(data.message);
    });

    socket.on('user-joined', (data) => {
      setUsers(data.users);
    });

    socket.on('user-left', (data) => {
      setUsers(data.users);
    });

    socket.on('roll-result', (roll) => {
      addRoll(roll);
    });

    socket.on('history-sync', (history) => {
      setHistory(history);
    });

    socket.on('health-updated', (data) => {
      setUsers(data.users);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [setCurrentUser, setUsers, addUser, removeUser, addRoll, setHistory, setSocket, setSocketActions]);

  const joinRoom = useCallback((name, role, secret, maxHealth, currentHealth) => {
    if (socketRef.current) {
      const payload = { name, role };
      if (secret) {
        payload.secret = secret;
      }
      if (maxHealth !== undefined) {
        payload.maxHealth = maxHealth;
        payload.currentHealth = currentHealth || maxHealth;
      }
      socketRef.current.emit('join', payload);
    }
  }, []);

  const roll = useCallback((dieType) => {
    if (socketRef.current) {
      socketRef.current.emit('roll', { dieType });
    }
  }, []);

  const toggleHideRolls = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('toggle-hide-rolls');
    }
  }, []);

  const updateHealth = useCallback((newHealth) => {
    if (socketRef.current) {
      socketRef.current.emit('update-health', { newHealth });
    }
  }, []);

  useEffect(() => {
    setSocketActions({ roll, toggleHideRolls, updateHealth });
  }, [roll, toggleHideRolls, updateHealth, setSocketActions]);

  return {
    socket: socketRef.current,
    connected,
    error,
    joinRoom,
    roll,
    toggleHideRolls,
    updateHealth,
  };
}

export default useSocket;
