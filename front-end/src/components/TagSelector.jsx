import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/authContext';
import CustomButton from './CustomButton';
import styles from './component-styles/TagSelector.module.css';
import { FaTag } from 'react-icons/fa'; 

function TagSelector({ activeTaskId, selectedTags, setSelectedTags }) {
  const { getIdToken } = useAuth();
  const [tags, setTags] = useState([]); // Store user's tags
  const [inputTag, setInputTag] = useState(''); // New tag input
  const [showInput, setShowInput] = useState(false); // Input visibility

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

  // Handle selecting an existing tag from the dropdown
  const handleTagSelectClick = async (tag) => {
    if (!activeTaskId || selectedTags.find(selected => selected.id === tag.id)) {
      console.error("Tag already associated or no active task!");
      return;
    }

    try {
      const token = await getIdToken();
      await axios.post(`${import.meta.env.VITE_API_URL}/tasks/${activeTaskId}/tags`, {
        tag_id: tag.id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update selected tags
      setSelectedTags((prevSelectedTags) => [...prevSelectedTags, { id: tag.id, name: tag.name }]);
    } catch (error) {
      console.error("Error associating tag with task:", error);
    }
  };

  // Handle adding a new tag
  const handleAddTag = async () => {
    if (!inputTag.trim() || !activeTaskId || selectedTags.find(selected => selected.name === inputTag)) return;

    try {
      const token = await getIdToken();
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/tags`, {
        name: inputTag,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newTag = response.data;

      await axios.post(`${import.meta.env.VITE_API_URL}/tasks/${activeTaskId}/tags`, {
        tag_id: newTag.id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTags((prevTags) => [...prevTags, newTag]); // Add to available tags
      setSelectedTags((prevSelectedTags) => [...prevSelectedTags, { id: newTag.id, name: newTag.name }]); // Update selected tags
      setInputTag('');
      setShowInput(false);
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };

  return (
    <div className={styles.tagSelector}>
      {!showInput ? (
        <CustomButton
          onClick={() => setShowInput(true)}
          variant="soft"
          disabled={!activeTaskId}
        >
          <FaTag /> Add Tag
        </CustomButton>
      ) : (
        <div className={styles.inputContainer}>
          <div className={styles.inputRow}>
            <input
              type="text"
              value={inputTag}
              onChange={(e) => setInputTag(e.target.value)}
              placeholder="Enter a new tag"
              className={styles.tagInput}
            />

            <div className={styles.buttonRow}>
              <CustomButton onClick={() => setShowInput(false)} variant="soft">
                Back
              </CustomButton>
              <CustomButton onClick={handleAddTag} variant="soft" disabled={!inputTag.trim()}>
                Add
              </CustomButton>
            </div>
          </div>

          <ul className={styles.tagList}>
            {tags.length > 0 ? (
              tags.map((tag) => (
                <li
                  key={tag.id}
                  onClick={() => handleTagSelectClick(tag)}
                  className={styles.tagListItem}
                >
                  {tag.name}
                </li>
              ))
            ) : (
              <li>No tags available</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TagSelector;
