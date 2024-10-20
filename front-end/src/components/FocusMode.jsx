import React, { useEffect, useState } from 'react';
import SessionForm from './SessionForm';
import CompletedSessions from './CompletedSessions';
import axios from 'axios';
import { useAuth } from '../contexts/authContext';
import styles from './component-styles/focusmode.module.css';

const FocusMode = () => {
  const { getIdToken } = useAuth();
  const [completedTasks, setCompletedTasks] = useState([]);


  // Fetch all completed tasks (initial load)
  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        const token = await getIdToken();
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCompletedTasks(sortByMostRecent(response.data || []));
      } catch (error) {
        console.error('Error fetching completed tasks:', error);
        setCompletedTasks([]);
      }
    };

    fetchCompletedTasks();
  }, [getIdToken]);

  // Function to sort by most recent
  const sortByMostRecent = (tasks) => {
    return tasks.sort((a, b) => new Date(b.end_time) - new Date(a.end_time));
  };

  // Add newly stopped task to completed tasks
  const handleNewCompletedTask = (stoppedTask) => {
    setCompletedTasks((prevTasks) => sortByMostRecent([...prevTasks, stoppedTask]));
  };

  // Handle filtering tasks by tag name
  const handleFilterByTag = async (tagName) => {
    try {
      const token = await getIdToken();
      let url = `${import.meta.env.VITE_API_URL}/tasks`;
      if (tagName) {
        url += `?tagName=${tagName}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompletedTasks(sortByMostRecent(response.data || []));
    } catch (error) {
      console.error('Error filtering tasks by tag:', error);
    }
  };

 
  return (
    <div className={styles.focusMode}>
      <div>
        <SessionForm addCompletedSession={handleNewCompletedTask} />
        <h2 className={styles.completedSessions}>Past Sessions</h2>
        <CompletedSessions completedTasks={completedTasks} handleFilterByTag={handleFilterByTag} />
      </div>
    </div>
  );
};

export default FocusMode;
