import React, { useState, useRef, useEffect } from 'react';

/**
 * HealthBar Component
 *
 * Displays a green health bar that fills left to right.
 * Clicking the health value allows editing current health.
 *
 * @param {Object} props
 * @param {number} props.currentHealth - Current health value
 * @param {number} props.maxHealth - Maximum health value
 * @param {Function} props.onHealthChange - Callback when health is changed
 * @param {boolean} props.editable - Whether health can be edited (only for current user)
 */
function HealthBar({ currentHealth, maxHealth, onHealthChange, editable = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(currentHealth));
  const inputRef = useRef(null);

  const healthPercent = Math.max(0, Math.min(100, (currentHealth / maxHealth) * 100));

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(String(currentHealth));
  }, [currentHealth]);

  const handleClick = () => {
    if (editable) {
      setIsEditing(true);
      setEditValue(String(currentHealth));
    }
  };

  const handleBlur = () => {
    submitChange();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      submitChange();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(String(currentHealth));
    }
  };

  const submitChange = () => {
    setIsEditing(false);
    const newHealth = parseInt(editValue, 10);
    if (!isNaN(newHealth) && newHealth !== currentHealth) {
      onHealthChange(newHealth);
    } else {
      setEditValue(String(currentHealth));
    }
  };

  return (
    <div className="health-bar-container">
      <div className="health-bar">
        <div
          className="health-bar-fill"
          style={{ width: `${healthPercent}%` }}
        />
      </div>
      <div className={`health-value ${editable ? 'health-value--editable' : ''}`}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            className="health-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            min="0"
            max={maxHealth}
          />
        ) : (
          <span onClick={handleClick} title={editable ? 'Click to edit' : ''}>
            {currentHealth}
          </span>
        )}
        <span className="health-separator">/</span>
        <span className="health-max">{maxHealth}</span>
      </div>
    </div>
  );
}

export default HealthBar;
