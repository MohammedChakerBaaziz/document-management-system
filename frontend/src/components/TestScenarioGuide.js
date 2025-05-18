import React, { useState } from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent, 
  Typography, 
  Button, 
  Paper,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TestScenarioGuide = () => {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const steps = [
    {
      label: 'Create Departments',
      description: 'Create two departments: Finance and IT',
      path: '/departments',
      instructions: 'Click on "Add Department" and create two departments: Finance and IT'
    },
    {
      label: 'Create Users',
      description: 'Create three users: u1@ensia.dz, u2@ensia.dz, u3@ensia.dz',
      path: '/users',
      instructions: 'Click on "Add User" and create three users with the following emails: u1@ensia.dz, u2@ensia.dz, u3@ensia.dz'
    },
    {
      label: 'Assign Users to Departments',
      description: 'Assign users to departments: u1 -> IT, u2 -> Finance, u3 -> both',
      path: '/users',
      instructions: 'Click on the "Departments" button next to each user and assign them to the appropriate departments'
    },
    {
      label: 'Create Categories',
      description: 'Create categories: General, Administrative, Training',
      path: '/categories',
      instructions: 'Click on "Add Category" and create three categories: General, Administrative, Training'
    },
    {
      label: 'Log in as User 1',
      description: 'Log out and log in as u1@ensia.dz',
      path: '/login',
      instructions: 'Log out and log in with the credentials for u1@ensia.dz'
    },
    {
      label: 'Upload Document (User 1)',
      description: 'Upload a document to the IT department',
      path: '/upload',
      instructions: 'Upload a PDF document to the IT department'
    },
    {
      label: 'Log in as User 2',
      description: 'Log out and log in as u2@ensia.dz',
      path: '/login',
      instructions: 'Log out and log in with the credentials for u2@ensia.dz'
    },
    {
      label: 'Verify Document Access (User 2)',
      description: 'Verify that User 2 can only see documents in Finance department',
      path: '/documents',
      instructions: 'Check that you can only see documents in the Finance department, not in IT'
    },
    {
      label: 'Upload Document (User 2)',
      description: 'Upload a document to the Finance department',
      path: '/upload',
      instructions: 'Upload a PDF document to the Finance department'
    },
    {
      label: 'Log in as User 3',
      description: 'Log out and log in as u3@ensia.dz',
      path: '/login',
      instructions: 'Log out and log in with the credentials for u3@ensia.dz'
    },
    {
      label: 'Verify Document Access (User 3)',
      description: 'Verify that User 3 can see documents in both departments',
      path: '/documents',
      instructions: 'Check that you can see documents from both IT and Finance departments'
    },
    {
      label: 'Log in as User 1 Again',
      description: 'Log out and log in as u1@ensia.dz again',
      path: '/login',
      instructions: 'Log out and log in with the credentials for u1@ensia.dz'
    },
    {
      label: 'Verify Translation',
      description: 'Verify that the document title has been translated',
      path: '/documents',
      instructions: 'Check that the document title has been translated'
    }
  ];

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', my: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Test Scenario Guide
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Follow these steps to test the Document Management System functionality.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          This guide will help you complete the test scenarios. Click "Go to Step" to navigate to the relevant page.
        </Alert>
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="subtitle1">{step.label}</Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2">{step.description}</Typography>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Instructions:
                </Typography>
                <Typography variant="body2" paragraph>
                  {step.instructions}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={() => handleNavigate(step.path)}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Go to Step
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      {index === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3 }}>
            <Typography>All steps completed - you've successfully tested the system!</Typography>
            <Button onClick={() => setActiveStep(0)} sx={{ mt: 1, mr: 1 }}>
              Reset
            </Button>
          </Paper>
        )}
      </Paper>
    </Box>
  );
};

export default TestScenarioGuide;
