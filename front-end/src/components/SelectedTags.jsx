import styles from './component-styles/SelectedTags.module.css';

function SelectedTags({ selectedTags, handleTagRemove }) {
  return (
    <div className={styles.selectedTagsContainer}>
      {selectedTags.length > 0 ? (
        selectedTags.map((tag) => (
          <div key={tag.id} className={styles.tagBox}>
            {tag.name}
            <span className={styles.closeButton} onClick={() => handleTagRemove(tag)}>
              &times;
            </span>
          </div>
        ))
      ) : (
        <></> 
      )}
    </div>
  );
}

export default SelectedTags;
