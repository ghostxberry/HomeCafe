import React, { useState } from 'react';
import CustomButton from './CustomButton';
import styles from './component-styles/TaskInput.module.css';
import { useAuth } from '../contexts/authContext';

function TaskInput({ taskTitle = '', setTaskTitle, handleStartTask }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getIdToken } = useAuth();

  const handleTaskInputChange = (e) => {
    setTaskTitle(e.target.value);
  };

  return (
    <div className={styles.inputContainer}>
      <input
        className={styles.textArea}
        placeholder="Enter your task here"
        value={taskTitle}
        onChange={handleTaskInputChange}
        disabled={loading}
      />
      <CustomButton onClick={handleStartTask} disabled={!taskTitle?.trim() || loading}>
        {loading ? 'Starting...' : 'Start'}
      </CustomButton>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}

export default TaskInput;
