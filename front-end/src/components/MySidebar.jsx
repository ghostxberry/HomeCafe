import React from 'react';
import { Sidebar, Menu, MenuItem, SubMenu, sidebarClasses } from 'react-pro-sidebar';
import { useSession } from '../contexts/SessionContext';

const MySidebar = () => {
  const { switchView } = useSession(); // Get switchView from context

  return (
    <Sidebar
      rootStyles={{
        [`.${sidebarClasses.container}`]: {
          position: 'fixed',
          top: '40px',
          left: 0,
          width: '250px',
          height: 'calc(100vh - 60px)',
          backgroundColor: '#f9f9f9',
          zIndex: 1,
        },
      }}
    >
      <Menu>
        <MenuItem onClick={() => switchView('tasks')}>Focus Mode</MenuItem>
        <SubMenu label="Journal">
          <MenuItem> Compose </MenuItem>
          <MenuItem> Read </MenuItem>
        </SubMenu>
        <MenuItem onClick={() => switchView('projects')}>Projects</MenuItem>
        <MenuItem> Calendar </MenuItem>
      </Menu>
    </Sidebar>
  );
};

export default MySidebar;
