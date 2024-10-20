import React, { useEffect, useState } from 'react';
import styles from './component-styles/CompletedSessions.module.css';
import TagFilter from './TagFilter';

const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const CompletedSessions = ({ completedTasks, handleFilterByTag }) => {
  const [filteredTasks, setFilteredTasks] = useState(completedTasks);

  // Keep filteredTasks in sync with completedTasks when it changes
  useEffect(() => {
    setFilteredTasks(completedTasks);
  }, [completedTasks]);

  // Handle filtering by tag
  const handleTagFilter = (tagName) => {
    if (tagName) {
      const filtered = completedTasks.filter(task =>
        task.tags && task.tags.includes(tagName) // Check if task has the tag
      );
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(completedTasks); // Show all tasks
    }
  };

  if (!filteredTasks || filteredTasks.length === 0) {
    return <div className={styles.noSessions}>No completed tasks available.</div>;
  }

  return (
    <div className={styles.completedSessionsContainer}>
      {/* Render the TagFilter */}
      <TagFilter onFilterByTag={handleTagFilter} />

      <ul className={styles.sessionList}>
        {filteredTasks.map((task) => (
          <li key={task.id} className={styles.completedSessionItem}>
            <div className={styles.sessionTitle}>
              {task.title}
            </div>
            <div className={styles.sessionDetails}>
              <span className={styles.sessionDuration}>
                Total Time: {formatTime(task.total_time)}
              </span>
              <span className={styles.sessionTime}>
                Completed at: {new Date(task.end_time).toLocaleString()}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompletedSessions;
