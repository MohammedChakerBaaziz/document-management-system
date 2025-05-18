import React from 'react';
import { Typography, Paper } from '@mui/material';
import TestScenarioGuide from '../components/TestScenarioGuide';
import MainLayout from '../components/layout/MainLayout';

const TestScenarioPage = () => {
  return (
    <MainLayout>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Test Scenario Guide
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This page provides a step-by-step guide to test the Document Management System functionality.
          Follow the instructions to complete each test scenario.
        </Typography>
      </Paper>
      <TestScenarioGuide />
    </MainLayout>
  );
};

export default TestScenarioPage;
