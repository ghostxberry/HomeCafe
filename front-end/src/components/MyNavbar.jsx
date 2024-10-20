import { TabNav } from '@radix-ui/themes';
import { useAuth } from '../contexts/authContext';
import logo from '../assets/coffee-cup (small).png';
import { useLocation } from 'react-router-dom';
import styles from './component-styles/MyNavbar.module.css'

function MyNavbar() {
  const { currentUser, signInWithGoogle, logout } = useAuth(); // Get auth state and functions from context
  const location = useLocation(); // Get the current location
  const activeTab = location.pathname; // Use pathname for active tab

  return (
    <TabNav.Root className={styles.navbar}>
      {/* Always accessible logo link */}
      <TabNav.Link 
        href="/" 
        active={activeTab === '/' ? false : undefined} // Ensure logo is not highlighted
      >
        <img src={logo} alt="MyCafe" style={{ height: '30px', paddingBottom: '5px' }} />
      </TabNav.Link>

      {/* Conditionally render links based on authentication status */}
      {currentUser && (
        <>
          
          <TabNav.Link 
            href="/projects" 
            active={activeTab === '/projects'}
          >
            Projects
          </TabNav.Link>
          <TabNav.Link 
            href="/sessions" 
            active={activeTab === '/sessions'}
          >
            Sessions
          </TabNav.Link>

          <TabNav.Link 
            href="/journal" 
            active={activeTab === '/journal'}
          >
            Journal
          </TabNav.Link>

          <TabNav.Link 
            href="/calender" 
            active={activeTab === '/calender'}
          >
            Calender
          </TabNav.Link>
        </>
      )}

      {/* Conditional login/logout button */}
      <TabNav.Link asChild>
        {currentUser ? (
          <button onClick={logout} style={{ cursor: 'pointer', border: 'none', background: 'none', color: 'inherit' }}>
            Logout
          </button>
        ) : (
          <button onClick={signInWithGoogle} style={{ cursor: 'pointer', border: 'none', background: 'none', color: 'inherit' }}>
            Login
          </button>
        )}
      </TabNav.Link>
    </TabNav.Root>
  );
}

export default MyNavbar;
