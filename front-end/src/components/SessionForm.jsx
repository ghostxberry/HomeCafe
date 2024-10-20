import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/authContext';
import TaskInput from './TaskInput';
import TagSelector from './TagSelector';
import TimerDisplay from './TimerDisplay';
import SelectedTags from './SelectedTags'; 
import styles from './component-styles/SessionForm.module.css';
import CustomButton from './CustomButton';
import ProjectSelector from './ProjectSelector';

function SessionForm({ addCompletedSession }) {
  const { getIdToken } = useAuth();
  const [taskTitle, setTaskTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]); 
  const [selectedProject, setSelectedProject] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Fetch active task and associated tags on mount
  useEffect(() => {
    const fetchActiveTask = async () => {
      try {
        const token = await getIdToken();
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/tasks/active`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          const { id, title, elapsedTime: activeElapsedTime, tags = [], project_id, project_name } = response.data || {};
          setTaskId(id);
          setTaskTitle(title);
          setElapsedTime(activeElapsedTime);
          setSelectedProject(project_id ? { id: project_id, name: project_name } : null);
          setSelectedTags(tags); // Set associated tags here
          setTimerRunning(true);

          // Fetch associated tags for the active task
          await fetchAssociatedTags(id); // Fetch tags immediately after loading the task
        } else {
          resetTaskState();
        }
      } catch (error) {
        console.error('Error fetching active task:', error);
      }
    };

    fetchActiveTask();
  }, [getIdToken]);

  const resetTaskState = () => {
    setTaskId(null);
    setTaskTitle('');
    setElapsedTime(0);
    setSelectedTags([]); // Reset selected tags
    setTimerRunning(false);
  };

  // Fetch associated tags for the active task
  const fetchAssociatedTags = async (taskId) => {
    try {
      const token = await getIdToken();
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/tasks/${taskId}/tags`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched tags:", response.data); // Log fetched tags
      setSelectedTags(response.data); // Update selected tags with fetched tags
    } catch (error) {
      console.error('Error fetching associated tags:', error);
    }
  };

  // Handle starting a new task
  const handleStartTask = async () => {
    if (!taskTitle.trim()) return;
  
    setElapsedTime(0); // Reset elapsed time when starting a new task
  
    try {
      const token = await getIdToken();
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/tasks`, {
        title: taskTitle,
        priority: null,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setTaskId(response.data.id);
      setTimerRunning(true);
  
      // Associate the project with the newly created task if a project is selected
      if (selectedProject) {
        await axios.put(`${import.meta.env.VITE_API_URL}/tasks/${response.data.id}/project/${selectedProject.id}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Failed to start task:', error);
    }
  };
  

  // Handle stopping the task
  const handleStopTask = async () => {
    try {
      const token = await getIdToken();
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/tasks/${taskId}/stop`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Reset the task state and add to completed sessions
      addCompletedSession(response.data);
      resetTaskState();
      setSelectedProject(null); // Reset selected project when task is stopped
    } catch (error) {
      console.error('Failed to stop task:', error);
    }
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (timerRunning) {
      timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [timerRunning]);

  // Handle removing a tag
  const handleTagRemove = async (tagToRemove) => {
    try {
      const token = await getIdToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${taskId}/tags/${tagToRemove.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSelectedTags((prevTags) => prevTags.filter(tag => tag.id !== tagToRemove.id));
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  return (
    <div className={styles.sessionForm}>
      <div className={styles.header}>

      {selectedProject && (
        <div className={styles.selectedProjectContainer}>
          <span><strong>Current Project:</strong> {selectedProject.name}</span>
        </div>
      )}

        {taskId ? (
          <h2 className={styles.currentTaskTitle}>{taskTitle}</h2>
        ) : (
          <TaskInput taskTitle={taskTitle} setTaskTitle={setTaskTitle} handleStartTask={handleStartTask} />
        )}
        
        {/* Render TimerDisplay only when a task is active */}
        {taskId && <TimerDisplay elapsedTime={elapsedTime} />}
        
        {timerRunning && (
          <div className={styles.controlsRow}>
            <CustomButton onClick={handleStopTask}>Stop Task</CustomButton>
          </div>
        )}
      </div>

      <div className={styles.selectorContainer}>
      <TagSelector
        setSelectedTags={setSelectedTags}
        selectedTags={selectedTags}
        activeTaskId={taskId}
      />
      <ProjectSelector
        activeTaskId={taskId}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
      />
    </div>

      <SelectedTags selectedTags={selectedTags} handleTagRemove={handleTagRemove} />
    </div>
  );
}

export default SessionForm;
