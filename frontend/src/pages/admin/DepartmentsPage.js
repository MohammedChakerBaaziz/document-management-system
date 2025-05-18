import React from 'react';
import { Typography, Paper } from '@mui/material';
import DepartmentManagement from '../../components/admin/DepartmentManagement';
import MainLayout from '../../components/layout/MainLayout';

const DepartmentsPage = () => {
  return (
    <MainLayout>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Departments Management
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Create and manage departments in your organization. Departments help organize users and control document access.
        </Typography>
      </Paper>
      <DepartmentManagement />
    </MainLayout>
  );
};

export default DepartmentsPage;
