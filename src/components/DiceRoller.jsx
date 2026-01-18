import React, { useState, useEffect } from 'react';

const DICE_TYPES = ['D4', 'D6', 'D8', 'D10', 'D00', 'D12', 'D20'];
const ROLL_ANIMATION_DURATION = 1500;

function DiceRoller({ onRoll, disabled = false }) {
  const [rolling, setRolling] = useState(false);
  const [currentDie, setCurrentDie] = useState(null);
  const [animationValue, setAnimationValue] = useState(null);

  useEffect(() => {
    let intervalId;
    let timeoutId;

    if (rolling && currentDie) {
      const maxValue = currentDie === 'D00' ? 100 : parseInt(currentDie.slice(1), 10);

      intervalId = setInterval(() => {
        setAnimationValue(Math.floor(Math.random() * maxValue) + 1);
      }, 50);

      timeoutId = setTimeout(() => {
        setRolling(false);
        setCurrentDie(null);
        setAnimationValue(null);
        clearInterval(intervalId);
      }, ROLL_ANIMATION_DURATION);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [rolling, currentDie]);

  const handleRoll = (dieType) => {
    if (rolling || disabled) return;

    setRolling(true);
    setCurrentDie(dieType);
    onRoll(dieType);
  };

  return (
    <div className="dice-roller">
      {rolling && (
        <div className="dice-animation tumbling">
          <span className="die-label">{currentDie}</span>
          <span className="rolling-value">{animationValue}</span>
        </div>
      )}

      <div className="dice-buttons">
        {DICE_TYPES.map((die) => (
          <button
            key={die}
            className={`dice-button ${die.toLowerCase()}`}
            onClick={() => handleRoll(die)}
            disabled={rolling || disabled}
          >
            {die}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DiceRoller;
