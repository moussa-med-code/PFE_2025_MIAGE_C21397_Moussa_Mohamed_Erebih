import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  TextField,
  Button,
  Card,
  CardHeader,
  CardContent,
  Alert,
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon
} from '@mui/icons-material';

const ReinitialisationMotDePasse = () => {
  const { jeton } = useParams();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();

  // Vérifier le statut au chargement du composant
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'invalid_token') {
      setError('Lien invalide ou expiré. Veuillez demander un nouveau lien.');
      setLoading(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/mot-de-passe/reinitialiser/${jeton}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || JSON.stringify(data));
      }

      setSuccess(true);
      setSnackbarMessage('Mot de passe réinitialisé avec succès!');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message.includes('jeton') ? 'Lien invalide ou expiré' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (error && error.includes('invalide ou expiré')) {
    return (
      <Box sx={{ maxWidth: '500px', margin: 'auto', p: 3, minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Card elevation={24} sx={{ borderRadius: 2, width: '100%' }}>
          <CardHeader
            title="Lien expiré"
            sx={{ 
              bgcolor: 'error.main',
              color: 'white',
              py: 2,
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }}
          />
          <CardContent>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/mot-de-passe/demande-reinitialisation')}
              sx={{ mt: 2 }}
            >
              Demander un nouveau lien
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: '500px', 
      margin: 'auto', 
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      justifyContent: 'center'
    }}>
      <Card elevation={24} sx={{ borderRadius: 2 }}>
        <CardHeader
          title={
            <Typography variant="h5" component="h1" align="center">
              {success ? 'Réinitialisation réussie' : 'Nouveau mot de passe'}
            </Typography>
          }
          sx={{ 
            bgcolor: 'primary.main',
            color: 'white',
            py: 2,
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }}
        />
        <CardContent>
          {error && !success && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Votre mot de passe a été réinitialisé avec succès.
              </Alert>
              <Button
                variant="contained"
                fullWidth
                onClick={handleLogin}
                startIcon={<LoginIcon />}
                sx={{ mt: 2 }}
              >
                Se connecter
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Veuillez entrer votre nouveau mot de passe.
              </Typography>
              
              <TextField
                label="Nouveau mot de passe"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Confirmer le mot de passe"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{ mt: 2 }}
              >
                {loading ? 'En cours...' : 'Réinitialiser le mot de passe'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReinitialisationMotDePasse;