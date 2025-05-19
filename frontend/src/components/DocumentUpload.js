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
    
    // Reset states
    setError('');
    setSuccess('');
    
    // Validation
    const validationErrors = [];
    if (!title) validationErrors.push('Title is required');
    if (!categoryId) validationErrors.push('Category is required');
    if (!departmentId) validationErrors.push('Department is required');
    if (!file) validationErrors.push('File is required');
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    try {
      setLoading(true);
      
      // Step 1: Upload file to storage service
      let uploadResponse;
      try {
        uploadResponse = await storageService.uploadFile(file);
      } catch (uploadErr) {
        throw new Error(
          uploadErr.response?.data?.message ||
          'Failed to upload file. Please try again.'
        );
      }
      
      const fileData = uploadResponse.data;
      
      // Step 2: Create document metadata
      const documentData = {
        title: title.trim(),
        categoryId: parseInt(categoryId),
        departmentId: parseInt(departmentId),
        fileKey: fileData.fileKey,
        fileName: fileData.fileName,
        fileType: fileData.fileType,
        fileSize: fileData.fileSize
      };
      
      try {
        await documentService.createDocument(documentData);
      } catch (docErr) {
        // If document creation fails, we should ideally clean up the uploaded file
        // This would require adding a delete method to the storage service
        throw new Error(
          docErr.response?.data?.message ||
          docErr.response?.data?.detail ||
          'Failed to create document. Please try again.'
        );
      }
      
      // Reset form
      setTitle('');
      setCategoryId('');
      setDepartmentId('');
      setFile(null);
      if (e.target.querySelector('input[type=file]')) {
        e.target.querySelector('input[type=file]').value = '';
      }
      
      setSuccess('Document uploaded successfully!');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      console.error('Document upload error:', err);
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
