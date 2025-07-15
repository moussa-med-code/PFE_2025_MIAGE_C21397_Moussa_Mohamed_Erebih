import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import { CheckCircle, Error, Send } from '@mui/icons-material';

const VerificationEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const statusParam = searchParams.get('status');
    const emailParam = searchParams.get('email');

    if (statusParam) {
      setStatus(statusParam);
      if (emailParam) setEmail(emailParam);
    } else {
      setStatus('invalid');
    }
  }, [searchParams]);

  const handleResendEmail = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/utilisateur/renvoyer-verification/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'envoi de l'email");
      }

      setStatus('resent');
    } catch (err) {
      setError(err.message);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6">Vérification en cours...</Typography>
          </Box>
        );
      
      case 'success':
        return (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <CheckCircle color="success" sx={{ fontSize: 60 }} />
            </Box>
            <Typography variant="h4" align="center" gutterBottom>
              Félicitations!
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 4 }}>
              Votre email {email} a été vérifié avec succès.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              href="/login"
              size="large"
            >
              Se connecter
            </Button>
          </>
        );
      
      case 'expired':
        return (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Error color="error" sx={{ fontSize: 60 }} />
            </Box>
            <Typography variant="h4" align="center" gutterBottom>
              Lien expiré
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 4 }}>
              Le lien de vérification a expiré. Veuillez demander un nouveau lien.
            </Typography>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleResendEmail}
              startIcon={<Send />}
              size="large"
            >
              Renvoyer l'email de vérification
            </Button>
          </>
        );
      
      case 'deja_verifie':
        return (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <CheckCircle color="info" sx={{ fontSize: 60 }} />
            </Box>
            <Typography variant="h4" align="center" gutterBottom>
              Email déjà vérifié
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 4 }}>
              Votre compte a déjà été vérifié. Vous pouvez vous connecter.
            </Typography>
            <Button 
              variant="contained" 
              fullWidth 
              href="/connexion"
              size="large"
            >
              Se connecter
            </Button>
          </>
        );
      
      case 'resent':
        return (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <CheckCircle color="success" sx={{ fontSize: 60 }} />
            </Box>
            <Typography variant="h4" align="center" gutterBottom>
              Email envoyé!
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 4 }}>
              Un nouveau lien de vérification a été envoyé à {email}.
            </Typography>
          </>
        );
      
      default:
        return (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Error color="error" sx={{ fontSize: 60 }} />
            </Box>
            <Typography variant="h4" align="center" gutterBottom>
              Lien invalide
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 4 }}>
              Le lien de vérification est invalide ou corrompu.
            </Typography>
          </>
        );
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      p: 2
    }}>
      <Card sx={{
        maxWidth: 500,
        width: '100%',
        p: 3,
        textAlign: 'center'
      }}>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {renderContent()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default VerificationEmailPage;