import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, TextField, 
  CircularProgress, Alert, Avatar, InputLabel,
  Chip
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

const EditAdminProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement du profil');
        }

        const userData = await response.json();
        
        if (userData.type_utilisateur !== 'administrateur') {
          navigate(`/${userData.type_utilisateur}/profile`);
          return;
        }

        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setUser(prev => ({ 
      ...prev, 
      [e.target.name]: e.target.files[0],
      // Créer une URL temporaire pour prévisualiser l'image
      photoPreview: e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      
      // Ajouter tous les champs modifiables
      formData.append('email', user.email);
      formData.append('nom_complet', user.nom_complet);
      formData.append('numero_telephone', user.numero_telephone);
      
      if (user.photo_profil instanceof File) {
        formData.append('photo_profil', user.photo_profil);
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/utilisateur/profil/`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du profil');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setSuccess('Profil administrateur mis à jour avec succès!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error">Impossible de charger les données du profil</Alert>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Modifier le profil administrateur
        </Typography>
        <Chip 
          icon={<AdminIcon />}
          label="Administrateur"
          color="primary"
          variant="outlined"
        />
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar 
                src={user.photo_profil ? `${user.photo_profil}` : ''} 
                sx={{ width: 100, height: 100, mr: 3 }}
            />
          <Box>
            <InputLabel htmlFor="photo_profil" sx={{ mb: 1 }}>
              Photo de profil
            </InputLabel>
            <input
              id="photo_profil"
              name="photo_profil"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'block', marginBottom: '8px' }}
            />
            <Typography variant="caption" color="text.secondary">
              Formats supportés: JPG, PNG (max 5MB)
            </Typography>
          </Box>
        </Box>
        
        <TextField
          label="Nom complet"
          name="nom_complet"
          value={user.nom_complet || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          sx={{ mb: 2 }}
        />
        
        <TextField
          label="Email"
          name="email"
          value={user.email || ''}
          fullWidth
          margin="normal"
          disabled
          sx={{ mb: 2 }}
        />
        
        <TextField
          label="Numéro de téléphone"
          name="numero_telephone"
          value={user.numero_telephone || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 3,
          pt: 2,
          borderTop: '1px solid rgba(0, 0, 0, 0.12)'
        }}>
          <Typography variant="body2" color="text.secondary">
            Membre depuis: {new Date(user.date_creation).toLocaleDateString()}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<CancelIcon />}
              onClick={() => navigate('/login')}
              disabled={saving}
              color="error"
            >
              Annuler
            </Button>
            <Button 
              variant="contained" 
              type="submit"
              startIcon={<SaveIcon />}
              disabled={saving}
              color="primary"
            >
              {saving ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Enregistrement...
                </>
              ) : 'Enregistrer les modifications'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default EditAdminProfile;