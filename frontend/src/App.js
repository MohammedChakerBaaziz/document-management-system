import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, CircularProgress, Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';

// Eagerly loaded pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Lazily loaded pages
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const DepartmentsPage = lazy(() => import('./pages/admin/DepartmentsPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const TestScenarioPage = lazy(() => import('./pages/TestScenarioPage'));

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Loading fallback component
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
    <CircularProgress />
  </Box>
);

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/documents" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <DocumentsPage />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <UploadPage />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/categories" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <CategoriesPage />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/departments" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <DepartmentsPage />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <UsersPage />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/test-scenario" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <TestScenarioPage />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            
            {/* Default routes */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
