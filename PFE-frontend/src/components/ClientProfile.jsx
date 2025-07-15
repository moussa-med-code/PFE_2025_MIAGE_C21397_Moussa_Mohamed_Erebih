import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Avatar, Paper, Button, 
  CircularProgress, Alert 
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

const ClientProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/utilisateur/profil/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement du profil');
        }

        const userData = await response.json();
        
        // Vérifier que l'utilisateur est bien un client
        if (userData.type_utilisateur !== 'client') {
          navigate(`/${userData.type_utilisateur}/profile`);
          return;
        }

        setUser(userData);
      } catch (err) {
        setError(err.message);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userType');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar 
          src={user.photo_profil ? `${user.photo_profil}` : ''} 
          sx={{ width: 100, height: 100, mr: 3 }}
        />
        <Box>
          <Typography variant="h4">{user.nom_complet}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Client
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Informations personnelles</Typography>
        <Typography><strong>Email:</strong> {user.email}</Typography>
        <Typography><strong>Téléphone:</strong> {user.numero_telephone}</Typography>
      </Box>
      
      <Button 
        variant="outlined" 
        startIcon={<EditIcon />}
        onClick={() => navigate('/client/profil/edit')}
      >
        Modifier le profil
      </Button>
    </Paper>
  );
};

export default ClientProfile;