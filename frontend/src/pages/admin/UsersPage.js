import React from 'react';
import { Typography, Paper } from '@mui/material';
import UserManagement from '../../components/admin/UserManagement';
import MainLayout from '../../components/layout/MainLayout';

const UsersPage = () => {
  return (
    <MainLayout>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          User Management
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Manage users, assign roles, and control access to departments and documents.
        </Typography>
      </Paper>
      <UserManagement />
    </MainLayout>
  );
};

export default UsersPage;
