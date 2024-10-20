import React from 'react';
import styles from './component-styles/TimerDisplay.module.css';

function TimerDisplay({ elapsedTime }) {
  const formatElapsedTime = () => {
    // make sure elapsedTime is a number
    const totalSeconds = Number(elapsedTime) || 0; 
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={styles.timerContainer}>
      <div className={styles.timer}>
        {formatElapsedTime()}
      </div>
    </div>
  );
}

export default TimerDisplay;
