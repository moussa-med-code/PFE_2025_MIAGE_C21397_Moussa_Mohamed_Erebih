import React from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';

function Footer() {
  const whatsappNumber = "https://api.whatsapp.com/send/?phone=22244076356&text&type=phone_number&app_absent=0";
  const emailAddress = "moussamedwedouderebih@gmail.com";

  const handleWhatsAppClick = () => {
    window.open(`${whatsappNumber}`, '_blank');
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${emailAddress}`;
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) => theme.palette.primary.main,
        color: (theme) => theme.palette.primary.contrastText,
        width: '100%'
      }}
    >
      <Container maxWidth={false} sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3 },
        margin: 0,
        maxWidth: 'none !important'
      }}>
        <Typography variant="body1">
          © 2025 Tous droits réservés
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
          <IconButton 
            color="inherit" 
            onClick={handleWhatsAppClick}
            aria-label="Contactez-nous sur WhatsApp"
          >
            <WhatsAppIcon fontSize="medium" />
          </IconButton>
          <IconButton 
            color="inherit" 
            onClick={handleEmailClick}
            aria-label="Envoyez-nous un email"
          >
            <EmailIcon fontSize="medium" />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;