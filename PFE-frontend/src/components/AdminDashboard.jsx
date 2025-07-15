import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Box, 
  CssBaseline, 
  Container,
  Paper,
  Grid,
  useMediaQuery,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import UtilisateursManagement from './UtilisateursManagement'
import { PieChart } from '@mui/x-charts';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  minHeight: '300px',
  display: 'flex',
  flexDirection: 'column',
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(30),
  },
}));

const drawerWidth = 240;

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeComponent, setActiveComponent] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    clients: 0,
    freelancers: 0,
    admins: 0,
    projects: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const userResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/utilisateur/profil/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Erreur lors du chargement du profil');
        }

        const userData = await userResponse.json();
        
        if (userData.type_utilisateur !== 'administrateur') {
          navigate(`/${userData.type_utilisateur}/dashboard`);
          return;
        }

        setUserData(userData);

        // Fetch statistics
        const statsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/statistiques/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

      } catch (err) {
        setError(err.message);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userType');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose('user')();
  };

  const handleComponentChange = (componentName) => {
    setActiveComponent(componentName);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const renderActiveComponent = () => {
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

    if (activeComponent === 'Dashboard') {
      const pieData = [
        { id: 0, value: stats.clients, label: 'Clients', color: '#4caf50' }, // Vert
        { id: 1, value: stats.freelancers, label: 'Freelancers', color: '#2196f3' }, // Bleu
        { id: 2, value: stats.admins, label: 'Administrateurs', color: '#607d8b' }, // Gris foncé
      ];
      return (
        <Box sx={{ width: '100%' }}>
          <Typography variant="h4" gutterBottom>
            🔐 Bienvenue sur l'espace d'administration
          </Typography>
          <Typography variant="h6" paragraph>
            Vous pouvez maintenant gérer les comptes utilisateurs, superviser l'activité de la plateforme et assurer son bon fonctionnement.
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {stats.clients}
                  </Typography>
                  <Typography color="text.secondary">
                    Clients
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {stats.freelancers}
                  </Typography>
                  <Typography color="text.secondary">
                    Freelancers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {stats.admins}
                  </Typography>
                  <Typography color="text.secondary">
                    Administrateurs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {stats.projects}
                  </Typography>
                  <Typography color="text.secondary">
                    Projets
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

        <Grid container justifyContent="center" sx={{ mt: 4, mb: 4 }}>
        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Répartition des utilisateurs
            </Typography>
            <Box sx={{ width: '100%', height: 400 }}>
            <PieChart
                series={[
                  {
                    data: pieData,
                    innerRadius: 30,
                    outerRadius: 100,
                    paddingAngle: 5,
                    cornerRadius: 5,
                  },
                ]}
                width={400}
                height={300}
              />
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>
        </Box>
      );
    }


    if (activeComponent === 'Utilisateurs') {
      return <UtilisateursManagement />;
    }

    if (activeComponent === 'Clients') {
      return (
        <StyledPaper elevation={3}>
          <Typography variant="h5" gutterBottom>Gestion des clients</Typography>
          {/* Ici vous intégrerez le composant pour gérer les clients */}
        </StyledPaper>
      );
    }

    if (activeComponent === 'Freelancers') {
      return (
        <StyledPaper elevation={3}>
          <Typography variant="h5" gutterBottom>Gestion des freelancers</Typography>
          {/* Ici vous intégrerez le composant pour gérer les freelancers */}
        </StyledPaper>
      );
    }

    if (activeComponent === 'Administrateurs') {
      return (
        <StyledPaper elevation={3}>
          <Typography variant="h5" gutterBottom>Gestion des administrateurs</Typography>
          {/* Ici vous intégrerez le composant pour gérer les administrateurs */}
        </StyledPaper>
      );
    }

    if (activeComponent === 'Projets') {
      return (
        <StyledPaper elevation={3}>
          <Typography variant="h5" gutterBottom>Gestion des projets</Typography>
          {/* Ici vous intégrerez le composant pour gérer les projets */}
        </StyledPaper>
      );
    }

    return null;
  };

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Avatar 
          src={userData?.photo_profil}
          sx={{ width: 56, height: 56, mr: 2 }}
        >
          {userData?.nom_complet?.charAt(0) || 'A'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">{userData?.nom_complet || 'Administrateur'}</Typography>
          <Typography variant="body2" color="text.secondary">
            Administrateur
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
      <ListItem
        onClick={() => {
          handleComponentChange('Dashboard');
          handleNavigation('/administrateur/profile');
        }}
        sx={{
          '&.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
          },
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
          cursor: 'pointer'
        }}
      >
        <ListItemIcon>
          <AccountCircleIcon />
        </ListItemIcon>
        <ListItemText primary="Mon profil" />
      </ListItem>
        <ListItem
          onClick={() => handleComponentChange('Dashboard')}
          selected={activeComponent === 'Dashboard'}
          sx={{
            '&.Mui-selected': {
              backgroundColor: theme.palette.action.selected,
            },
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            cursor: 'pointer'
          }}
        >
          <ListItemIcon>
            <AssessmentIcon />
          </ListItemIcon>
          <ListItemText primary="Tableau de bord" />
        </ListItem>
        <ListItem
          onClick={() => handleComponentChange('Utilisateurs')}
          selected={activeComponent === 'Utilisateurs'}
          sx={{
            '&.Mui-selected': {
              backgroundColor: theme.palette.action.selected,
            },
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            cursor: 'pointer'
          }}
        >
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Utilisateurs" />
        </ListItem>
        <ListItem 
          onClick={handleLogout}
          sx={{
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            cursor: 'pointer'
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Déconnexion" />
        </ListItem>
      </List>
    </div>
  );

  if (loading && !userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            ADMINISTRATION
          </Typography>
          
          <IconButton onClick={handleMenuOpen} sx={{ p: 0, ml: 2 }}>
            <Avatar alt="Admin" src={userData?.photo_profil}>
              {userData?.nom_complet?.charAt(0) || <AccountCircleIcon />}
            </Avatar>
          </IconButton>
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => handleNavigation('/client/profile')}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              Mon profil
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <MainContent>
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {renderActiveComponent()}
        </Container>
      </MainContent>
    </Box>
  );
};

export default AdminDashboard;