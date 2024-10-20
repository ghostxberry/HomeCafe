// Workspace.js
import React from 'react';
import FocusMode from '../components/FocusMode';
import styles from './page-styles/workspace.module.css'; 

const Sessions = () => {
  
  return (
    <div className={styles.workspace}>
      <div className={styles.content}> 
        <FocusMode/>
      </div>
    </div>
  );
};

export default Sessions;
