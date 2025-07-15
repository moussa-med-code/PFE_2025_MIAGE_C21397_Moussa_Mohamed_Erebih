import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, TextField, 
  CircularProgress, Alert, Avatar, InputLabel
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const EditClientProfile = () => {
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
        
        if (userData.type_utilisateur !== 'client') {
          navigate(`/${userData.type_utilisateur}/profil`);
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
      // Garder l'ancienne URL en cas d'annulation
      previousPhoto: prev.photo_profil instanceof File ? prev.previousPhoto : prev.photo_profil
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
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du profil');
      }

      setSuccess('Profil mis à jour avec succès!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
      // Revenir à la photo précédente en cas d'erreur
      if (user.previousPhoto) {
        setUser(prev => ({ ...prev, photo_profil: prev.previousPhoto }));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Revenir à la photo précédente si elle existe
    if (user.previousPhoto) {
      setUser(prev => ({ ...prev, photo_profil: prev.previousPhoto }));
    }
    navigate('/login');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Modifier le profil client</Typography>
      
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
              style={{ display: 'block' }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Formats supportés: JPG, PNG (max 2MB)
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
          label="Numéro de téléphone"
          name="numero_telephone"
          value={user.numero_telephone || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          sx={{ mb: 2 }}
          inputProps={{
            pattern: "^(\\+?\\d{8,15})|(\\(\\+?\\d{1,3}\\)\\d{7,14})|\\+\\d{1,3}\\d{7,14}$",
            title: "Format: '44076356', '+(222)44076356' ou '+22244076356'"
          }}
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
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button 
            variant="outlined" 
            startIcon={<CancelIcon />}
            onClick={handleCancel}
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
            {saving ? <CircularProgress size={24} /> : 'Enregistrer'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default EditClientProfile;