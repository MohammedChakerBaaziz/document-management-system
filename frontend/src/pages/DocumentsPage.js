import React, { useState, useEffect } from 'react';
import { Typography, Paper } from '@mui/material';
import DocumentList from '../components/DocumentList';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';

const DocumentsPage = () => {
  const { user } = useAuth();
  const [userDepartments, setUserDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDepartments = async () => {
      try {
        setLoading(true);
        const response = await userService.getUserDepartments(user.id);
        setUserDepartments(response.data);
      } catch (err) {
        setError('Failed to load user departments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserDepartments();
    }
  }, [user]);

  return (
    <MainLayout>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          My Documents
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          View and manage your documents. You can search, filter, and download documents.
        </Typography>
      </Paper>
      <DocumentList 
        userDepartments={userDepartments} 
        userId={user?.id} 
      />
    </MainLayout>
  );
};

export default DocumentsPage;
