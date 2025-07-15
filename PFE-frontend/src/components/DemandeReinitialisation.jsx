import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Snackbar
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const DemandeReinitialisation = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Pré-remplir l'email si venant de la page de login
  React.useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/mot-de-passe/demande-reinitialisation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || JSON.stringify(data));
      }

      setSuccess(true);
      setSnackbarMessage('Si cet email existe, un lien de réinitialisation a été envoyé.');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

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
              {success ? 'Email envoyé' : 'Réinitialisation du mot de passe'}
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
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Un email avec les instructions de réinitialisation a été envoyé à l'adresse {email}.
              </Alert>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Si vous ne recevez pas d'email, vérifiez votre dossier spam ou réessayez.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={handleBackToLogin}
                sx={{ mt: 2 }}
              >
                Retour à la connexion
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Entrez votre adresse email pour recevoir un lien de réinitialisation.
              </Typography>
              
              <TextField
                label="Adresse email"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{ 'data-testid': 'email-input' }}
              />
              
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{ mt: 2 }}
                data-testid="submit-button"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </Button>

              <Button 
                variant="text" 
                fullWidth 
                onClick={handleBackToLogin}
                startIcon={<ArrowBackIcon />}
                sx={{ mt: 2 }}
              >
                Retour à la connexion
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

export default DemandeReinitialisation;