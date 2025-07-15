import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, Typography, Avatar, Paper, Button, Chip,
  CircularProgress, Alert 
} from '@mui/material';
import { Edit as EditIcon, Work as WorkIcon, School as SchoolIcon } from '@mui/icons-material';

const FreelancerProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        console.log('Token in FreelancerProfile:', token); // Debug
        
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/utilisateur/profil/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Erreur lors du chargement du profil');
        }

        const userData = await response.json();
        console.log('User data received:', userData); // Debug
        
        if (userData.type_utilisateur !== 'freelancer') {
          navigate(`/${userData.type_utilisateur}/profile`);
          return;
        }

        setUser(userData);
      } catch (err) {
        console.error('Fetch error:', err); // Debug
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
  }, [navigate, location]); // Ajout de location comme dépendance

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
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar 
          src={user.photo_profil ? `${user.photo_profil}` : ''} 
          sx={{ width: 100, height: 100, mr: 3 }}
        />
        <Box>
          <Typography variant="h4">{user.nom_complet}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Freelancer
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Informations professionnelles</Typography>
        <Typography sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <WorkIcon sx={{ mr: 1 }} /> <strong>Poste:</strong> {user.intitule_poste}
        </Typography>
        <Typography sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SchoolIcon sx={{ mr: 1 }} /> <strong>Spécialisation:</strong> {user.specialisation}
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Compétences:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {user.competences && user.competences.map((competence, index) => (
              <Chip key={index} label={competence} />
            ))}
          </Box>
        </Box>
        
        {user.cv && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>CV:</Typography>
            <Button 
              variant="outlined" 
              component="a" 
              href={`${user.cv}`} 
              target="_blank"
            >
              Télécharger le CV
            </Button>
          </Box>
        )}
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Coordonnées</Typography>
        <Typography><strong>Email:</strong> {user.email}</Typography>
        <Typography><strong>Téléphone:</strong> {user.numero_telephone}</Typography>
      </Box>
      
      <Button 
        variant="contained" 
        startIcon={<EditIcon />}
        onClick={() => navigate('/freelancer/profil/edit')}
        sx={{ mr: 2 }}
      >
        Modifier le profil
      </Button>
    </Paper>
  );
};

export default FreelancerProfile;