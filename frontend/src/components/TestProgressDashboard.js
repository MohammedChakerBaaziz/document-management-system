import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { userService, departmentService, categoryService, documentService } from '../services/api';

const TestProgressDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data
        const [deptResponse, catResponse, userResponse, docResponse] = await Promise.all([
          departmentService.getAllDepartments(),
          categoryService.getAllCategories(),
          userService.getAllUsers(),
          documentService.getAllDocuments()
        ]);
        
        setDepartments(deptResponse.data);
        setCategories(catResponse.data);
        setUsers(userResponse.data);
        setDocuments(docResponse.data);
      } catch (error) {
        console.error('Error fetching test progress data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate progress percentages
  const calculateProgress = () => {
    // Check departments (Finance and IT)
    const hasDepartments = departments.some(d => d.name === 'Finance') && 
                          departments.some(d => d.name === 'IT');
    
    // Check categories (General, Administrative, Training)
    const hasCategories = categories.some(c => c.name === 'General') && 
                         categories.some(c => c.name === 'Administrative') && 
                         categories.some(c => c.name === 'Training');
    
    // Check users (u1@ensia.dz, u2@ensia.dz, u3@ensia.dz)
    const hasUsers = users.some(u => u.email === 'u1@ensia.dz') && 
                    users.some(u => u.email === 'u2@ensia.dz') && 
                    users.some(u => u.email === 'u3@ensia.dz');
    
    // Check documents (at least one document)
    const hasDocuments = documents.length > 0;
    
    // Calculate overall progress
    let progress = 0;
    if (hasDepartments) progress += 25;
    if (hasCategories) progress += 25;
    if (hasUsers) progress += 25;
    if (hasDocuments) progress += 25;
    
    return {
      departments: hasDepartments ? 100 : 0,
      categories: hasCategories ? 100 : 0,
      users: hasUsers ? 100 : 0,
      documents: hasDocuments ? 100 : 0,
      overall: progress
    };
  };

  const progress = calculateProgress();

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Test Progress Dashboard</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Track your progress through the test scenarios. Complete all steps to verify the system functionality.
        </Typography>
        
        <Box sx={{ mt: 3, mb: 4 }}>
          <Typography variant="body2" gutterBottom>Overall Progress: {progress.overall}%</Typography>
          <LinearProgress variant="determinate" value={progress.overall} sx={{ height: 10, borderRadius: 5 }} />
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Departments</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Progress:</Typography>
                  <Chip 
                    label={`${progress.departments}%`} 
                    color={progress.departments === 100 ? "success" : "primary"} 
                    size="small" 
                  />
                </Box>
                <LinearProgress variant="determinate" value={progress.departments} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {departments.length > 0 ? (
                    <>
                      Created: {departments.map(d => d.name).join(', ')}
                    </>
                  ) : 'No departments created yet'}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions>
                <Button size="small" onClick={() => navigateTo('/departments')}>Manage Departments</Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Categories</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Progress:</Typography>
                  <Chip 
                    label={`${progress.categories}%`} 
                    color={progress.categories === 100 ? "success" : "primary"} 
                    size="small" 
                  />
                </Box>
                <LinearProgress variant="determinate" value={progress.categories} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {categories.length > 0 ? (
                    <>
                      Created: {categories.map(c => c.name).join(', ')}
                    </>
                  ) : 'No categories created yet'}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions>
                <Button size="small" onClick={() => navigateTo('/categories')}>Manage Categories</Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Users</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Progress:</Typography>
                  <Chip 
                    label={`${progress.users}%`} 
                    color={progress.users === 100 ? "success" : "primary"} 
                    size="small" 
                  />
                </Box>
                <LinearProgress variant="determinate" value={progress.users} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {users.length > 0 ? (
                    <>
                      Created: {users.filter(u => u.email.includes('@ensia.dz')).map(u => u.email).join(', ')}
                    </>
                  ) : 'No test users created yet'}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions>
                <Button size="small" onClick={() => navigateTo('/users')}>Manage Users</Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Documents</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Progress:</Typography>
                  <Chip 
                    label={`${progress.documents}%`} 
                    color={progress.documents === 100 ? "success" : "primary"} 
                    size="small" 
                  />
                </Box>
                <LinearProgress variant="determinate" value={progress.documents} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {documents.length > 0 ? (
                    <>
                      Uploaded: {documents.length} document(s)
                    </>
                  ) : 'No documents uploaded yet'}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions>
                <Button size="small" onClick={() => navigateTo('/documents')}>View Documents</Button>
                <Button size="small" onClick={() => navigateTo('/upload')}>Upload Document</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigateTo('/test-scenario')}
            sx={{ mt: 2 }}
          >
            Go to Test Scenario Guide
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default TestProgressDashboard;
