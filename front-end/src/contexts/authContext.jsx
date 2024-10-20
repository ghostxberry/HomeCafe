
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../config/firebase-config';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// Create the context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider); // Get the result of sign in
      const user = result.user; 
      const idToken = await user.getIdToken(true); // Get the ID token
      console.log('User signed in:', user);
      console.log('ID Token:', idToken); // Log the ID token
    } catch (err) {
      console.error(err);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

   // Get ID Token
   const getIdToken = async () => {
    if (!currentUser) {
      throw new Error('No user is currently signed in.');
    }
    return await currentUser.getIdToken();
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, signInWithGoogle, logout, getIdToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
