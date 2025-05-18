import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { categoryService, documentService, storageService } from '../services/api';

const DocumentUpload = ({ userDepartments, userId }) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data);
      } catch (err) {
        setError('Failed to load categories');
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!title || !categoryId || !departmentId || !file) {
      setError('Please fill in all fields and select a file');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Step 1: Upload file to storage service
      const uploadResponse = await storageService.uploadFile(file);
      const fileData = uploadResponse.data;
      
      // Step 2: Create document metadata
      const documentData = {
        title,
        categoryId: parseInt(categoryId),
        departmentId: parseInt(departmentId),
        fileKey: fileData.fileKey,
        fileName: fileData.fileName,
        fileType: fileData.fileType,
        fileSize: fileData.fileSize
      };
      
      await documentService.createDocument(documentData);
      
      // Reset form
      setTitle('');
      setCategoryId('');
      setDepartmentId('');
      setFile(null);
      
      setSuccess('Document uploaded successfully!');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.detail || 
        'Failed to upload document. Please try again.'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload New Document
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="title"
          label="Document Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
        
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryId}
            label="Category"
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={loading}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Department</InputLabel>
          <Select
            value={departmentId}
            label="Department"
            onChange={(e) => setDepartmentId(e.target.value)}
            disabled={loading}
          >
            {userDepartments.map((department) => (
              <MenuItem key={department.id} value={department.id}>
                {department.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Box sx={{ mt: 2, mb: 2 }}>
          <input
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/*,text/plain"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            disabled={loading}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              disabled={loading}
              fullWidth
            >
              Select File
            </Button>
          </label>
          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected file: {file.name}
            </Typography>
          )}
        </Box>
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload Document'}
        </Button>
      </Box>
    </Paper>
  );
};

export default DocumentUpload;
