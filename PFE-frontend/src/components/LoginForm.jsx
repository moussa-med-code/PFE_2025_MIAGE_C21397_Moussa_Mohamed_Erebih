import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField, 
  Button, 
  Card, 
  CardHeader, 
  CardContent,
  Alert, 
  Box, 
  Typography, 
  InputAdornment,
  IconButton, 
  Link,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon
} from '@mui/icons-material';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const formData = new FormData();
      formData.append('email', email.trim().toLowerCase());
      formData.append('password', password);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/token/`, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || JSON.stringify(responseData));
      }

      // Stockage des tokens
      localStorage.setItem('accessToken', responseData.access);
      localStorage.setItem('refreshToken', responseData.refresh);

      // Récupération du type d'utilisateur depuis la réponse
      const userType = responseData.user_type || 'client';
      
      setSnackbarMessage(`Connexion réussie en tant que ${userType}!`);
      setSnackbarOpen(true);
      
      navigate(`/${userType}/dashboard`, { 
        replace: true,
        state: { email: email.trim().toLowerCase() }
      });

    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message.includes('{') ? 'Email ou mot de passe incorrect' : err.message);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = () => {
    navigate('/mot-de-passe/demande-reinitialisation', { 
      state: { email: email.trim().toLowerCase() } 
    });
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
              Connexion à votre compte
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

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
            
            <TextField
              label="Mot de passe"
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
              inputProps={{ 'data-testid': 'password-input' }}
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
              sx={{ mt: 2 }}
              data-testid="login-button"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </Box>

          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            <Link 
              onClick={handlePasswordReset} 
              sx={{ cursor: 'pointer' }}
              color="secondary"
            >
              Mot de passe oublié?
            </Link>
          </Typography>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
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

export default LoginForm;