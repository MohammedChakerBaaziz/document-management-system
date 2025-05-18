import React from 'react';
import { Typography, Paper } from '@mui/material';
import CategoryManagement from '../../components/admin/CategoryManagement';
import MainLayout from '../../components/layout/MainLayout';

const CategoriesPage = () => {
  return (
    <MainLayout>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Document Categories
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Manage document categories for organizing your documents. Categories help users find documents more easily.
        </Typography>
      </Paper>
      <CategoryManagement />
    </MainLayout>
  );
};

export default CategoriesPage;
