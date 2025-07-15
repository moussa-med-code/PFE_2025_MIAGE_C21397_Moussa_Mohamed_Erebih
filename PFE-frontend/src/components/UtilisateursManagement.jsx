import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Button,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const UtilisateursManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Mémoire des utilisateurs filtrés pour optimiser les performances
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    
    const searchLower = searchTerm.toLowerCase();
    return users.filter(user => {
      return (
        (user.nom_complet?.toLowerCase().includes(searchLower)) || 
        (user.email?.toLowerCase().includes(searchLower))
      );
    });
  }, [users, searchTerm]);

  // Fonction fetchUsers mémoïsée
  const fetchUsers = useCallback(async (token) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userType');
          throw new Error('Session expirée - Veuillez vous reconnecter');
        }
        throw new Error(`Erreur ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Session expirée')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Vérification du token et récupération des données
  useEffect(() => {
    const verifyTokenAndFetchUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const [userResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/utilisateur/profil/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetchUsers(token)
        ]);

        if (!userResponse.ok) {
          throw new Error('Erreur lors du chargement du profil');
        }

        const userData = await userResponse.json();
        
        if (userData.type_utilisateur !== 'administrateur') {
          navigate(`/${userData.type_utilisateur}/dashboard`);
          return;
        }

        setUserData(userData);
      } catch (err) {
        setError(err.message);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userType');
        navigate('/login');
      }
    };

    verifyTokenAndFetchUser();
  }, [navigate, fetchUsers]);

  // Gestion de la suppression d'un utilisateur
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userType');
          throw new Error('Session expirée - Veuillez vous reconnecter');
        }
        throw new Error(`Erreur ${response.status}: ${await response.text()}`);
      }

      setSnackbar({
        open: true,
        message: 'Utilisateur supprimé avec succès',
        severity: 'success'
      });
      
      // Mise à jour optimisée de la liste
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
      if (err.message.includes('Session expirée')) {
        navigate('/login');
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  const handleRetry = () => {
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUsers(token);
    } else {
      navigate('/login');
    }
  };

  if (loading && !userData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleRetry}>
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Utilisateurs
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '50px',
                paddingLeft: '12px'
              }
            }}
          />
        </Grid>
      </Grid>
      
      <TableContainer component={Paper} sx={{ borderRadius: '10px', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Photo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nom Complet</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Avatar 
                      src={user.photo_profil} 
                      alt={user.nom_complet}
                      sx={{ width: 40, height: 40 }}
                    />
                  </TableCell>
                  <TableCell>{user.nom_complet}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Box 
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: user.type_utilisateur === 'client' ? '#e8f5e9' : '#e3f2fd',
                        color: user.type_utilisateur === 'client' ? '#2e7d32' : '#1976d2',
                        fontWeight: 'medium'
                      }}
                    >
                      {user.type_utilisateur}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteUser(user.id)}
                      aria-label="supprimer"
                      sx={{ '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.08)' } }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    {users.length === 0 ? 'Aucun utilisateur disponible' : 'Aucun résultat trouvé'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%', boxShadow: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UtilisateursManagement;