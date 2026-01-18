import React, { useState } from 'react';

/**
 * JoinScreen Component
 *
 * Entry point for users to join the Dice Temple game.
 * Allows selecting role (Player or Dungeon Master) and entering credentials.
 *
 * @param {Object} props
 * @param {Function} props.onJoin - Callback fired with user data: { name, role, secret? }
 */
function JoinScreen({ onJoin }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('player');
  const [secret, setSecret] = useState('');
  const [maxHealth, setMaxHealth] = useState('20');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Display name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (name.trim().length > 20) {
      newErrors.name = 'Name must be 20 characters or less';
    }

    // Secret validation for DM
    if (role === 'dm' && !secret.trim()) {
      newErrors.secret = 'DM secret is required';
    }

    // Max health validation for players
    if (role === 'player') {
      const healthNum = parseInt(maxHealth, 10);
      if (!maxHealth || isNaN(healthNum) || healthNum < 1) {
        newErrors.maxHealth = 'Max health must be at least 1';
      } else if (healthNum > 999) {
        newErrors.maxHealth = 'Max health cannot exceed 999';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const healthNum = parseInt(maxHealth, 10);
    const userData = {
      name: name.trim(),
      role,
      ...(role === 'dm' && { secret: secret.trim() }),
      ...(role === 'player' && { maxHealth: healthNum, currentHealth: healthNum }),
    };

    try {
      await onJoin(userData);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to join. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="join-screen">
      <div className="join-card">
        <div className="join-card__header">
          <h1 className="join-card__title">Dice Temple</h1>
          <p className="join-card__subtitle">Enter the realm of chance</p>
        </div>

        <form className="join-form" onSubmit={handleSubmit}>
          {/* Display Name Input */}
          <div className="form-group">
            <label htmlFor="display-name" className="form-label">
              Display Name
            </label>
            <input
              type="text"
              id="display-name"
              className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoComplete="off"
              autoFocus
            />
            {errors.name && (
              <span className="form-error">{errors.name}</span>
            )}
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <span className="form-label">Role</span>
            <div className="role-selector">
              <label className={`role-option ${role === 'player' ? 'role-option--selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="player"
                  checked={role === 'player'}
                  onChange={(e) => setRole(e.target.value)}
                  className="visually-hidden"
                />
                <span className="role-option__icon">&#9876;</span>
                <span className="role-option__label">Player</span>
              </label>

              <label className={`role-option ${role === 'dm' ? 'role-option--selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="dm"
                  checked={role === 'dm'}
                  onChange={(e) => setRole(e.target.value)}
                  className="visually-hidden"
                />
                <span className="role-option__icon">&#9813;</span>
                <span className="role-option__label">Dungeon Master</span>
              </label>
            </div>
          </div>

          {/* DM Secret Input (conditional) */}
          {role === 'dm' && (
            <div className="form-group form-group--dm-secret">
              <label htmlFor="dm-secret" className="form-label">
                DM Secret
              </label>
              <input
                type="password"
                id="dm-secret"
                className={`form-input ${errors.secret ? 'form-input--error' : ''}`}
                placeholder="Enter the secret phrase"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                autoComplete="off"
              />
              {errors.secret && (
                <span className="form-error">{errors.secret}</span>
              )}
              <span className="form-hint">
                The secret phrase is set by the session host
              </span>
            </div>
          )}

          {/* Max Health Input (for players only) */}
          {role === 'player' && (
            <div className="form-group form-group--health">
              <label htmlFor="max-health" className="form-label">
                Max Health
              </label>
              <input
                type="number"
                id="max-health"
                className={`form-input form-input--health ${errors.maxHealth ? 'form-input--error' : ''}`}
                placeholder="20"
                value={maxHealth}
                onChange={(e) => setMaxHealth(e.target.value)}
                min="1"
                max="999"
              />
              {errors.maxHealth && (
                <span className="form-error">{errors.maxHealth}</span>
              )}
              <span className="form-hint">
                Your character's maximum hit points
              </span>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="form-error form-error--submit">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="join-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="join-button__loading">
                <span className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </span>
            ) : (
              'Enter the Temple'
            )}
          </button>
        </form>
      </div>

      <style>{`
        .join-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          min-height: 100dvh;
          padding: var(--space-lg);
        }

        .join-card {
          width: 100%;
          max-width: 400px;

          background: rgba(42, 37, 32, 0.95);
          border: 1px solid var(--stone-light);
          border-radius: var(--radius-lg);

          box-shadow:
            var(--shadow-lg),
            0 0 60px rgba(0, 0, 0, 0.5);

          overflow: hidden;
        }

        .join-card__header {
          padding: var(--space-xl) var(--space-xl) var(--space-lg);
          text-align: center;

          background: linear-gradient(
            180deg,
            rgba(201, 162, 39, 0.1) 0%,
            transparent 100%
          );
          border-bottom: 1px solid rgba(201, 162, 39, 0.2);
        }

        .join-card__title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--gold-accent);
          margin: 0 0 var(--space-xs);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .join-card__subtitle {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin: 0;
        }

        .join-form {
          padding: var(--space-xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .form-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input {
          padding: var(--space-md);

          background: var(--stone-dark);
          border: 2px solid var(--stone-light);
          border-radius: var(--radius-md);

          color: var(--text-light);
          font-size: 1rem;

          transition:
            border-color var(--transition-fast),
            box-shadow var(--transition-fast);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--gold-accent);
          box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.2);
        }

        .form-input::placeholder {
          color: var(--text-muted);
        }

        .form-input--error {
          border-color: var(--danger);
        }

        .form-input--error:focus {
          box-shadow: 0 0 0 3px rgba(156, 74, 74, 0.2);
        }

        .form-error {
          font-size: 0.8rem;
          color: var(--danger);
        }

        .form-error--submit {
          padding: var(--space-sm) var(--space-md);
          background: rgba(156, 74, 74, 0.1);
          border-radius: var(--radius-sm);
          text-align: center;
        }

        .form-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-style: italic;
        }

        /* Role Selector */
        .role-selector {
          display: flex;
          gap: var(--space-md);
        }

        .role-option {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xs);

          padding: var(--space-md);

          background: var(--stone-dark);
          border: 2px solid var(--stone-light);
          border-radius: var(--radius-md);

          cursor: pointer;
          transition:
            border-color var(--transition-fast),
            background var(--transition-fast),
            transform var(--transition-fast);
        }

        .role-option:hover {
          border-color: var(--gold-dim);
          background: rgba(61, 54, 50, 0.5);
        }

        .role-option--selected {
          border-color: var(--gold-accent);
          background: rgba(201, 162, 39, 0.1);
        }

        .role-option--selected:hover {
          border-color: var(--gold-accent);
        }

        .role-option__icon {
          font-size: 1.5rem;
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }

        .role-option--selected .role-option__icon {
          color: var(--gold-accent);
        }

        .role-option__label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-light);
        }

        /* DM Secret animation */
        .form-group--dm-secret,
        .form-group--health {
          animation: slideDown 0.3s ease-out;
        }

        .form-input--health {
          max-width: 120px;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Submit Button */
        .join-button {
          width: 100%;
          padding: var(--space-md) var(--space-lg);
          margin-top: var(--space-sm);

          background: linear-gradient(
            145deg,
            var(--gold-accent) 0%,
            var(--gold-dim) 100%
          );
          border: none;
          border-radius: var(--radius-md);

          color: var(--temple-bg);
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;

          cursor: pointer;
          transition:
            transform var(--transition-fast),
            box-shadow var(--transition-fast),
            opacity var(--transition-fast);
        }

        .join-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            var(--shadow-md),
            0 0 20px rgba(201, 162, 39, 0.4);
        }

        .join-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .join-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Loading dots animation */
        .loading-dots {
          display: inline-flex;
          gap: 4px;
        }

        .loading-dots span {
          width: 6px;
          height: 6px;
          background: var(--temple-bg);
          border-radius: 50%;
          animation: loadingDot 1.4s ease-in-out infinite both;
        }

        .loading-dots span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .loading-dots span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes loadingDot {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        /* Responsive */
        @media (max-width: 480px) {
          .join-screen {
            padding: var(--space-md);
          }

          .join-card__header {
            padding: var(--space-lg);
          }

          .join-card__title {
            font-size: 1.5rem;
          }

          .join-form {
            padding: var(--space-lg);
          }

          .role-selector {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default JoinScreen;
