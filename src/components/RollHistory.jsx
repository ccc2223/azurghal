import React, { useRef, useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function RollHistory() {
  const { rollHistory } = useGame();
  const scrollContainerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [rollHistory, autoScroll]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 20;
    setAutoScroll(isAtBottom);
  };

  return (
    <div className="roll-history">
      <div className="roll-history-header">
        <h3>Roll History</h3>
      </div>
      <div
        className="roll-history-list"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {rollHistory.length === 0 ? (
          <div className="no-history">No rolls yet</div>
        ) : (
          rollHistory.map((roll, index) => (
            <div key={roll.id || index} className="roll-entry">
              <span className="roll-time">{formatTime(roll.timestamp)}</span>
              <span className="roll-player">{roll.userName}</span>
              <span className="roll-die">{roll.dieType}</span>
              <span className={`roll-result ${roll.hidden ? 'hidden-roll' : ''}`}>
                {roll.hidden ? 'hidden' : roll.result}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RollHistory;
