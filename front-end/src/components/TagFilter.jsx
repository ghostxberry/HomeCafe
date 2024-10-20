import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/authContext';
import styles from './component-styles/TagFilter.module.css';

function TagFilter({ onFilterByTag }) {
  const { getIdToken } = useAuth();
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');

  // Fetch all tags for the current user
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const token = await getIdToken();
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/tags`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, [getIdToken]);

  const handleTagChange = (e) => {
    const selectedTagName = e.target.value;
    setSelectedTag(selectedTagName);
    onFilterByTag(selectedTagName); // Call the parent function to filter sessions
  };

  return (
    <div className={styles.tagFilter}>
      <strong><label htmlFor="tagSelect">Filter by Tag:</label></strong>
      <select id="tagSelect" value={selectedTag} onChange={handleTagChange}>
        <option value="">All Tags</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.name}>
            {tag.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TagFilter;
