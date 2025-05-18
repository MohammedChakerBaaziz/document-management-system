import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Typography, 
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box
} from '@mui/material';
import { 
  Description as DocumentIcon,
  CloudUpload as UploadIcon,
  Category as CategoryIcon,
  Business as DepartmentIcon,
  People as UserIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import TestProgressDashboard from '../components/TestProgressDashboard';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <MainLayout>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Welcome, {user?.username}! Manage your documents and system settings from this dashboard.
        </Typography>
      </Paper>
      
      {/* Test Progress Dashboard */}
      <TestProgressDashboard />
      
      <Grid container spacing={3}>
        {/* Common features */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardActionArea onClick={() => handleNavigate('/documents')}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <DocumentIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">My Documents</Typography>
                  <Typography variant="body2" color="text.secondary">
                    View and manage your documents
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardActionArea onClick={() => handleNavigate('/upload')}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <UploadIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">Upload Document</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add new documents to the system
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        
        {/* Admin features */}
        {isAdmin() && (
          <>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea onClick={() => handleNavigate('/categories')}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <CategoryIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h6">Categories</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage document categories
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea onClick={() => handleNavigate('/departments')}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <DepartmentIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h6">Departments</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage organization departments
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea onClick={() => handleNavigate('/users')}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <UserIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h6">Users</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage system users
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </MainLayout>
  );
};

export default Dashboard;
