import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Tabs, 
  Tab 
} from '@mui/material';
import UserManagement from './admin/UserManagement';
import DepartmentManagement from './admin/DepartmentManagement';
import CategoryManagement from './admin/CategoryManagement';

const AdminPanel = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Admin Panel
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="User Management" />
          <Tab label="Department Management" />
          <Tab label="Category Management" />
        </Tabs>
      </Box>
      
      {tabValue === 0 && <UserManagement />}
      {tabValue === 1 && <DepartmentManagement />}
      {tabValue === 2 && <CategoryManagement />}
    </Paper>
  );
};

export default AdminPanel;
