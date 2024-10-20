// contexts/SessionContext.js
import React, { createContext, useContext, useState } from 'react';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null); // Initial session state
  const [currentView, setCurrentView] = useState('tasks'); // Default view

  const startSession = (userData) => {
    setSession(userData); // Set session data when a session starts
  };

  const endSession = () => {
    setSession(null); // Clear session data when a session ends
  };

  const switchView = (view) => {
    setCurrentView(view); // Update the current view
  };

  return (
    <SessionContext.Provider value={{ session, startSession, endSession, currentView, switchView }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  return useContext(SessionContext);
};
