import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import "./config/firebase-config.js"
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { AuthProvider } from "./contexts/authContext.jsx"


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <Theme accentColor="bronze">
    <App />
    </Theme>
    </AuthProvider>
  </StrictMode>,
)
