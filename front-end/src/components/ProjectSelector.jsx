import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/authContext';
import CustomButton from './CustomButton';
import styles from './component-styles/ProjectSelector.module.css'; 
import { FaFolder } from 'react-icons/fa';

function ProjectSelector({ activeTaskId, selectedProject, setSelectedProject }) {
  const { getIdToken } = useAuth();
  const [projects, setProjects] = useState([]);
  const [inputProject, setInputProject] = useState('');
  const [showInput, setShowInput] = useState(false);

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
      }
    };

    fetchProjects();
  }, [getIdToken]);

  // Handle selecting an existing project
  const handleProjectSelect = async (project) => {
    if (!activeTaskId || selectedProject?.id === project.id) {
      console.error("Project already associated or no active task!");
      return;
    }

    try {
      const token = await getIdToken();
      // Associate the selected project with the active task
      await axios.put(`${import.meta.env.VITE_API_URL}/tasks/${activeTaskId}/project/${project.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the selected project state
      setSelectedProject({ id: project.id, name: project.name });
    } catch (error) {
      console.error("Error associating project with task:", error);
    }
  };

  // Handle adding a new project
  const handleAddProject = async () => {
    if (!inputProject.trim() || !activeTaskId) return;

    try {
      const token = await getIdToken();
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/projects`, {
        name: inputProject,
        description: '',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newProject = response.data;
      // Associate the new project with the active task
      await axios.put(`${import.meta.env.VITE_API_URL}/tasks/${activeTaskId}/project/${newProject.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProjects((prevProjects) => [...prevProjects, newProject]);
      setSelectedProject(newProject); // Set the newly created project as the selected one
      setInputProject('');
      setShowInput(false);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  return (
    <div className={styles.projectSelector}>
      {!showInput ? (
        <CustomButton
          onClick={() => setShowInput(true)}
          variant="soft"
          disabled={!activeTaskId}
        >
          <FaFolder /> Select Project
        </CustomButton>
      ) : (
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={inputProject}
            onChange={(e) => setInputProject(e.target.value)}
            placeholder="Enter a new project"
            className={styles.projectInput}
          />
          <div className={styles.buttonRow}>
            <CustomButton onClick={() => setShowInput(false)} variant="soft">
              Back
            </CustomButton>
            <CustomButton onClick={handleAddProject} variant="soft" disabled={!inputProject.trim()}>
              Add
            </CustomButton>
          </div>
          <ul className={styles.projectList}>
            {projects.length > 0 ? (
              projects.map((project) => (
                <li
                  key={project.id}
                  onClick={() => handleProjectSelect(project)}
                  className={styles.projectListItem}
                >
                  {project.name}
                </li>
              ))
            ) : (
              <li>No projects available</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ProjectSelector;
