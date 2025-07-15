import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, TextField, 
  Chip, CircularProgress, Alert, Avatar,
  InputLabel, Select, MenuItem, FormControl
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const EditFreelancerProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        console.log('Token in EditProfile:', token); // Debug
        
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

        if (!response.ok) throw new Error('Erreur lors du chargement du profil');
        
        const userData = await response.json();
        
        if (userData.type_utilisateur !== 'freelancer') {
          navigate(`/${userData.type_utilisateur}/profil`);
          return;
        }

        setUser(userData);
        setSkills(userData.competences || []);
      } catch (err) {
        console.error('Edit profile fetch error:', err); // Debug
        setError(err.message);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
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
    setUser(prev => ({ ...prev, [e.target.name]: e.target.files[0] }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      
      // Ajouter tous les champs modifiables
      formData.append('email', user.email);
      formData.append('nom_complet', user.nom_complet);
      formData.append('numero_telephone', user.numero_telephone);
      formData.append('specialisation', user.specialisation);
      formData.append('intitule_poste', user.intitule_poste);
      formData.append('competences', JSON.stringify(skills));
      
      if (user.photo_profil instanceof File) {
        formData.append('photo_profil', user.photo_profil);
      }
      
      if (user.cv instanceof File) {
        formData.append('cv', user.cv);
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/utilisateur/profil/`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      console.log('Update response status:', response.status); // Debug
      
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du profil');
      }

      const updatedData = await response.json();
      console.log('Updated data:', updatedData); // Debug
      
      // Mettre à jour le token si le backend en renvoie un nouveau
      if (updatedData.accessToken) {
        localStorage.setItem('accessToken', updatedData.accessToken);
      }

      setSuccess('Profil mis à jour avec succès! Déconnexion en cours...');
      setTimeout(() => {
        // Suppression des tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Redirection vers la page de login avec un message
        navigate('/login', { 
          replace: true,
          state: { 
            message: 'Votre profil a été mis à jour. Veuillez vous reconnecter.',
            email: user.email 
          }
        });
      }, 2000);
    } catch (err) {
      console.error('Update error:', err); // Debug
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

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Modifier le profil</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            src={user.photo_profil ? `${user.photo_profil}` : ''} 
            sx={{ width: 100, height: 100, mr: 3 }}
          />
          <Box>
            <InputLabel htmlFor="photo_profil">Photo de profil</InputLabel>
            <input
              id="photo_profil"
              name="photo_profil"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
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
        />
        
        <TextField
          label="Numéro de téléphone"
          name="numero_telephone"
          value={user.numero_telephone || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        
        <TextField
          label="Spécialisation"
          name="specialisation"
          value={user.specialisation || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        
        <TextField
          label="Intitulé de poste"
          name="intitule_poste"
          value={user.intitule_poste || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Compétences</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TextField
              label="Ajouter une compétence"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              size="small"
            />
            <Button variant="outlined" onClick={addSkill}>Ajouter</Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {skills.map((skill, index) => (
              <Chip 
                key={index} 
                label={skill} 
                onDelete={() => removeSkill(skill)}
              />
            ))}
          </Box>
        </Box>
        
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1" gutterBottom>CV</Typography>
          {user.cv && !(user.cv instanceof File) && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">CV actuel: {user.cv.split('/').pop()}</Typography>
            </Box>
          )}
          <input
            id="cv"
            name="cv"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button 
            variant="outlined" 
            startIcon={<CancelIcon />}
            onClick={() => navigate('/login', { replace: true })}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            type="submit"
            startIcon={<SaveIcon />}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Enregistrer'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default EditFreelancerProfile;