import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
  CloudUpload as UploadIcon,
  People as UserIcon,
  Category as CategoryIcon,
  Business as DepartmentIcon,
  Logout as LogoutIcon,
  PlayArrow as TestIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/dashboard',
      showAlways: true 
    },
    { 
      text: 'My Documents', 
      icon: <DocumentIcon />, 
      path: '/documents',
      showAlways: true 
    },
    { 
      text: 'Upload Document', 
      icon: <UploadIcon />, 
      path: '/upload',
      showAlways: true 
    },
    { 
      text: 'Categories', 
      icon: <CategoryIcon />, 
      path: '/categories',
      adminOnly: true 
    },
    { 
      text: 'Departments', 
      icon: <DepartmentIcon />, 
      path: '/departments',
      adminOnly: true 
    },
    { 
      text: 'Users', 
      icon: <UserIcon />, 
      path: '/users',
      adminOnly: true 
    },
    { 
      text: 'Test Scenario', 
      icon: <TestIcon />, 
      path: '/test-scenario',
      showAlways: true 
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-start',
        py: 2 
      }}>
        <Typography variant="h6" noWrap component="div">
          DMS
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.username}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          // Show item if it's marked as showAlways or if it's adminOnly and user is admin
          if (item.showAlways || (item.adminOnly && isAdmin())) {
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          }
          return null;
        })}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
