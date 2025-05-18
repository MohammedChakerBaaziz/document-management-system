import React, { useState, useEffect } from 'react';
import { Typography, Paper } from '@mui/material';
import DocumentUpload from '../components/DocumentUpload';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';

const UploadPage = () => {
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
          Upload Document
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Upload new documents to the system. You can add metadata, select a category, and assign to departments.
        </Typography>
      </Paper>
      <DocumentUpload 
        userDepartments={userDepartments} 
        userId={user?.id} 
      />
    </MainLayout>
  );
};

export default UploadPage;
