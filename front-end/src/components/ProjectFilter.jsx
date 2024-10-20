import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/authContext';
import styles from './component-styles/ProjectFilter.module.css';
import CustomButton from './CustomButton';

const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const ProjectFilter = ({ completedTasks = [] }) => {
  const { getIdToken } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');


  // Fetch all projects for the current user
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = await getIdToken();
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setErrorMessage('Failed to fetch projects. Please try again.');
      }
    };

    fetchProjects();
  }, [getIdToken]);

  // Update filtered tasks when selectedProject changes
  useEffect(() => {
    const fetchTasksForProject = async () => {
      if (!selectedProject) return; // Skip if no project is selected
      try {
        const token = await getIdToken();
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/projects/${selectedProject}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFilteredTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks for project:', error);
      }
    };

    fetchTasksForProject();
  }, [selectedProject, getIdToken]);

  // Handle project selection
  const handleProjectSelect = (event) => {
    setSelectedProject(event.target.value); // Set selected project value
  };

  // Handle creating a new project
  const handleCreateProject = async (event) => {
    event.preventDefault();
    setErrorMessage(''); // Reset any previous error message
    setConfirmationMessage('');
    try {
      const token = await getIdToken();
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/projects`, {
        name: newProjectName,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Add the newly created project to the state
      setProjects(prevProjects => [...prevProjects, response.data]);
      // Clear input fields
      setNewProjectName('');
      setConfirmationMessage('Project created successfully!');
    } catch (error) {
      console.error('Error creating project:', error);
      setErrorMessage('Failed to create project. Please try again.');
    }
  };

  return (
    <div>
      <div style={{ height: '0px' }} /> {/* Spacer div to push down the Project Filter */}
      <div className={styles.projectFilter}>
        <h3>Projects</h3>
        <select onChange={handleProjectSelect} value={selectedProject}>
          <option value="">Select a project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
        
        <h4>Associated Tasks</h4>
        <ul className={styles.taskList}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <li key={task.id} className={styles.taskItem}>
                <div className={styles.taskTitle}>
                  {task.title}
                </div>
                <div className={styles.taskDetails}>
                  <span className={styles.taskDuration}>
                    Total Time: {formatTime(task.total_time)}
                  </span>
                  <span className={styles.taskCompletionTime}>
                    Completed at: {new Date(task.end_time).toLocaleString()}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li>No tasks available for this project.</li>
          )}
        </ul>
  
        <h4>Create New Project</h4>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        {confirmationMessage && <p style={{ color: 'green' }}>{confirmationMessage}</p>}
        
        <form className={styles.createProject} onSubmit={handleCreateProject}>
          <input 
            type="text" 
            value={newProjectName} 
            onChange={(e) => setNewProjectName(e.target.value)} 
            placeholder="Project Name" 
            required 
          />
          <CustomButton type="submit">Create Project</CustomButton>
        </form>
      </div>
    </div>
  );
};

export default ProjectFilter;
