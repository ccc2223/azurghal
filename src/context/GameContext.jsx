import React, { createContext, useContext, useReducer, useCallback } from 'react';

const GameContext = createContext(null);

const initialState = {
  currentUser: null,
  users: [],
  rollHistory: [],
  socket: null,
  socketActions: null,
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'REMOVE_USER':
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
      };
    case 'ADD_ROLL':
      return { ...state, rollHistory: [...state.rollHistory, action.payload] };
    case 'SET_HISTORY':
      return { ...state, rollHistory: action.payload };
    case 'TOGGLE_HIDE_ROLLS':
      if (!state.currentUser) return state;
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          hideRolls: !state.currentUser.hideRolls,
        },
      };
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
    case 'SET_SOCKET_ACTIONS':
      return { ...state, socketActions: action.payload };
    default:
      return state;
  }
};

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const setCurrentUser = useCallback((user) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: user });
  }, []);

  const setUsers = useCallback((users) => {
    dispatch({ type: 'SET_USERS', payload: users });
  }, []);

  const addUser = useCallback((user) => {
    dispatch({ type: 'ADD_USER', payload: user });
  }, []);

  const removeUser = useCallback((userId) => {
    dispatch({ type: 'REMOVE_USER', payload: userId });
  }, []);

  const addRoll = useCallback((roll) => {
    dispatch({ type: 'ADD_ROLL', payload: roll });
  }, []);

  const setHistory = useCallback((history) => {
    dispatch({ type: 'SET_HISTORY', payload: history });
  }, []);

  const toggleHideRolls = useCallback(() => {
    dispatch({ type: 'TOGGLE_HIDE_ROLLS' });
  }, []);

  const setSocket = useCallback((socket) => {
    dispatch({ type: 'SET_SOCKET', payload: socket });
  }, []);

  const setSocketActions = useCallback((actions) => {
    dispatch({ type: 'SET_SOCKET_ACTIONS', payload: actions });
  }, []);

  const value = {
    ...state,
    setCurrentUser,
    setUsers,
    addUser,
    removeUser,
    addRoll,
    setHistory,
    toggleHideRolls,
    setSocket,
    setSocketActions,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export default GameContext;
