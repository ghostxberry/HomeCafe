import React from 'react';
import styles from './page-styles/landing.module.css'; 
import heroImage from '../assets/hero-image.png';

const Landing = () => {
  return (
    <div className={styles.landing} style={{ backgroundImage: `url(${heroImage})` }}>
      <div className={styles.headerWrapper}>
        <h1 className={styles.header}>Home Cafe</h1>
      </div>
      <p className={styles.subText}>
         Bring your coffee-shop productivity to your home office
         and keep track of the time you spend on projects. With features 
         like project and work-session management, journaling, and calendar organization,
         Home Cafe is ready to brew some productivity!
      </p>
    </div>
  );
};

export default Landing;
