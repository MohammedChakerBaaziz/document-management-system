import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { userService, departmentService } from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  
  // Department assignment dialog
  const [openDeptDialog, setOpenDeptDialog] = useState(false);
  const [userForDept, setUserForDept] = useState(null);
  const [userDepartments, setUserDepartments] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userService.getAllUsers();
        setUsers(response.data);
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await departmentService.getAllDepartments();
        setDepartments(response.data);
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };

    fetchUsers();
    fetchDepartments();
  }, []);

  const handleOpenDialog = (type, user = null) => {
    setDialogType(type);
    setSelectedUser(user);
    
    if (type === 'edit' && user) {
      setUsername(user.username);
      setEmail(user.email);
      setPassword('');
      setIsAdmin(user.roles.includes('ROLE_ADMIN'));
    } else {
      // Reset form for create
      setUsername('');
      setEmail('');
      setPassword('');
      setIsAdmin(false);
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
  };

  const handleSubmit = async () => {
    // Validation
    if (!username || !email || (dialogType === 'create' && !password)) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const userData = {
        username,
        email,
        roles: isAdmin ? ['admin', 'user'] : ['user']
      };
      
      if (password) {
        userData.password = password;
      }
      
      let response;
      
      if (dialogType === 'create') {
        response = await userService.createUser(userData);
        setSuccess('User created successfully');
      } else {
        response = await userService.updateUser(selectedUser.id, userData);
        setSuccess('User updated successfully');
      }
      
      // Refresh user list
      const usersResponse = await userService.getAllUsers();
      setUsers(usersResponse.data);
      
      handleCloseDialog();
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.detail || 
        'Failed to save user'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        await userService.deleteUser(userId);
        
        // Refresh user list
        const response = await userService.getAllUsers();
        setUsers(response.data);
        
        setSuccess('User deleted successfully');
      } catch (err) {
        setError('Failed to delete user');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenDeptDialog = async (user) => {
    try {
      setLoading(true);
      setUserForDept(user);
      
      // Get user's departments
      const response = await userService.getUserDepartments(user.id);
      setUserDepartments(response.data.map(dept => dept.id));
      
      setOpenDeptDialog(true);
    } catch (err) {
      setError('Failed to load user departments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDeptDialog = () => {
    setOpenDeptDialog(false);
    setUserForDept(null);
    setUserDepartments([]);
  };

  const handleDepartmentChange = (event) => {
    setUserDepartments(event.target.value);
  };

  const handleSaveDepartments = async () => {
    try {
      setLoading(true);
      
      await userService.assignDepartments(userForDept.id, userDepartments);
      
      setSuccess('Departments assigned successfully');
      handleCloseDeptDialog();
    } catch (err) {
      setError('Failed to assign departments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Users</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('create')}
        >
          Add User
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.roles.map((role) => (
                    <Chip
                      key={role}
                      label={role.replace('ROLE_', '')}
                      color={role === 'ROLE_ADMIN' ? 'primary' : 'default'}
                      size="small"
                      sx={{ mr: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton color="primary" onClick={() => handleOpenDialog('edit', user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleOpenDeptDialog(user)}>
                      <Chip label="Departments" size="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* User Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogType === 'create' ? 'Add New User' : 'Edit User'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required={dialogType === 'create'}
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText={dialogType === 'edit' ? 'Leave blank to keep current password' : ''}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
            }
            label="Admin Role"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Department Assignment Dialog */}
      <Dialog open={openDeptDialog} onClose={handleCloseDeptDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Departments</DialogTitle>
        <DialogContent>
          {userForDept && (
            <Typography variant="subtitle1" gutterBottom>
              User: {userForDept.username}
            </Typography>
          )}
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Departments</InputLabel>
            <Select
              multiple
              value={userDepartments}
              onChange={handleDepartmentChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const dept = departments.find(d => d.id === value);
                    return <Chip key={value} label={dept ? dept.name : value} />;
                  })}
                </Box>
              )}
            >
              {departments.map((department) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeptDialog}>Cancel</Button>
          <Button onClick={handleSaveDepartments} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
