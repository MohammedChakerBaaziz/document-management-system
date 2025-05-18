import React from 'react';
import { Box, Toolbar, CssBaseline } from '@mui/material';
import Sidebar from './Sidebar';

const drawerWidth = 240;

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar />
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` }
        }}
      >
        <Toolbar /> {/* This creates space at the top equal to the app bar height */}
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
