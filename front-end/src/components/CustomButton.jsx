import React from 'react';
import { Button } from '@radix-ui/themes';
import styles from './component-styles/CustomButton.module.css';

const CustomButton = ({ children, onClick, color = 'default', ...props }) => {
  return (
    <Button
      className={`${styles.button} ${styles[color]}`} 
      onClick={onClick}
      style={{ margin: '5px' }} 
      {...props}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
