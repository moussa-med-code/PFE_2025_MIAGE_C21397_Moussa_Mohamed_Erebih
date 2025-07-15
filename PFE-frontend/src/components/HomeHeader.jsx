import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';

function HomeHeader() {
  return (
    <AppBar  sx={{ width: '100%' }}>
      <Container maxWidth={false} sx={{
        margin: 0,
        maxWidth: 'none !important' // Force le full width
      }}>
        <Toolbar >
          <Typography variant="h6" component="header" sx={{ flexGrow: 1 }} />
          <Button color="inherit" sx={{ mr: 2 }} variant="outlined" component={Link} to="/login">
            Login
          </Button>
          <Button color="inherit" variant="outlined" component={Link} to="/signup">
            Sign Up
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default HomeHeader;