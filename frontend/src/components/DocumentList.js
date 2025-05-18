import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { documentService, categoryService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DocumentList = ({ userDepartments, userId }) => {
  const { isAdmin } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        let response;
        
        if (isAdmin()) {
          // Admin can see all documents
          response = await documentService.getAllDocuments();
        } else if (userDepartments && userDepartments.length > 0) {
          // User can only see documents from their departments
          const departmentIds = userDepartments.map(dept => dept.id);
          response = await documentService.getDocumentsByDepartments(departmentIds);
        } else {
          // User without departments can only see their own documents
          response = await documentService.getDocumentsByUser(userId);
        }
        
        setDocuments(response.data);
      } catch (err) {
        setError('Failed to load documents');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };

    fetchDocuments();
    fetchCategories();
  }, [isAdmin, userDepartments, userId]);

  const handleDownload = async (fileKey) => {
    try {
      window.open(fileKey, '_blank');
    } catch (err) {
      setError('Failed to download document');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentService.deleteDocument(id);
        setDocuments(documents.filter(doc => doc.id !== id));
      } catch (err) {
        setError('Failed to delete document');
        console.error(err);
      }
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      let response;
      
      if (searchTerm) {
        if (isAdmin()) {
          response = await documentService.searchDocuments(searchTerm);
        } else {
          const departmentIds = userDepartments.map(dept => dept.id);
          response = await documentService.searchDocumentsByDepartments(searchTerm, departmentIds);
        }
      } else {
        // If search term is empty, reset to original list
        if (isAdmin()) {
          response = await documentService.getAllDocuments();
        } else {
          const departmentIds = userDepartments.map(dept => dept.id);
          response = await documentService.getDocumentsByDepartments(departmentIds);
        }
      }
      
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to search documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (categoryId) => {
    try {
      setLoading(true);
      setSelectedCategory(categoryId);
      
      if (categoryId) {
        const response = await documentService.getDocumentsByCategory(categoryId);
        setDocuments(response.data);
      } else {
        // Reset to original list
        if (isAdmin()) {
          const response = await documentService.getAllDocuments();
          setDocuments(response.data);
        } else {
          const departmentIds = userDepartments.map(dept => dept.id);
          const response = await documentService.getDocumentsByDepartments(departmentIds);
          setDocuments(response.data);
        }
      }
    } catch (err) {
      setError('Failed to filter documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentFilter = async (departmentId) => {
    try {
      setLoading(true);
      setSelectedDepartment(departmentId);
      
      if (departmentId) {
        const response = await documentService.getDocumentsByDepartment(departmentId);
        setDocuments(response.data);
      } else {
        // Reset to original list
        if (isAdmin()) {
          const response = await documentService.getAllDocuments();
          setDocuments(response.data);
        } else {
          const departmentIds = userDepartments.map(dept => dept.id);
          const response = await documentService.getDocumentsByDepartments(departmentIds);
          setDocuments(response.data);
        }
      }
    } catch (err) {
      setError('Failed to filter documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Documents
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="Search Documents"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} edge="end">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        
        <FormControl size="small" sx={{ minWidth: '200px' }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Filter by Category"
            onChange={(e) => handleCategoryFilter(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {userDepartments && userDepartments.length > 0 && (
          <FormControl size="small" sx={{ minWidth: '200px' }}>
            <InputLabel>Filter by Department</InputLabel>
            <Select
              value={selectedDepartment}
              label="Filter by Department"
              onChange={(e) => handleDepartmentFilter(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {userDepartments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
      
      {documents.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          No documents found.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="documents table">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Spanish Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>{document.title}</TableCell>
                  <TableCell>{document.translatedTitle || 'Pending translation...'}</TableCell>
                  <TableCell>{document.categoryName}</TableCell>
                  <TableCell>{document.departmentName}</TableCell>
                  <TableCell>{document.createdByUsername}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleDownload(document.downloadUrl)}
                        disabled={!document.downloadUrl}
                      >
                        <DownloadIcon />
                      </IconButton>
                      
                      {(isAdmin() || document.createdBy === userId) && (
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(document.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default DocumentList;
