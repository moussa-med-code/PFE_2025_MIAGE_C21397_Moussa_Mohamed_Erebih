import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Badge, 
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
  Stack,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CardActions,
  Rating,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Message as MessageIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AlertTitle from '@mui/material/AlertTitle';

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

const ProjectCard = ({ project, onApply }) => {
  const [expanded, setExpanded] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applicationDetails, setApplicationDetails] = useState("");

  const handleApplyClick = () => {
    setShowApplyForm(true);
  };

  const handleSubmitApplication = () => {
    onApply(project, applicationDetails);
    setShowApplyForm(false);
    setApplicationDetails("");
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {project.titre}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Budget: {project.budget_min} MRU - {project.budget_max} MRU
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Deadline: {new Date(project.deadline).toLocaleDateString()}
          </Typography>
        </Stack>
        <Typography variant="body2" paragraph>
          {expanded ? project.description : `${project.description.substring(0, 150)}...`}
        </Typography>
        <Button size="small" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Voir moins' : 'Voir plus'}
        </Button>
        <Box sx={{ mt: 2 }}>
          {project.competences_requises.map((skill, index) => (
            <Chip key={index} label={skill} size="small" sx={{ mr: 1, mb: 1 }} />
          ))}
        </Box>
      </CardContent>
      <CardActions>
        {!showApplyForm ? (
          <Button 
            size="small" 
            variant="contained" 
            onClick={handleApplyClick}
            startIcon={<DescriptionIcon />}
          >
            Postuler
          </Button>
        ) : (
          <Box sx={{ width: '100%', p: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Entrer les détails de la postulation"
              value={applicationDetails}
              onChange={(e) => setApplicationDetails(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                onClick={handleSubmitApplication}
                disabled={!applicationDetails.trim()}
              >
                Envoyer
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setShowApplyForm(false);
                  setApplicationDetails("");
                }}
              >
                Annuler
              </Button>
            </Stack>
          </Box>
        )}
      </CardActions>
    </Card>
  );
};

ProjectCard.propTypes = {
  project: PropTypes.object.isRequired,
  onApply: PropTypes.func.isRequired
};

const DashboardContent = ({ userData }) => (
  <Box sx={{ width: '100%' }}>
    <Typography variant="h4" gutterBottom>👋 Bonjour et bienvenue {userData?.nom_complet} sur la plateforme !</Typography>
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
      <Box>
        <Typography variant="h6">
        Accédez aux projets disponibles, postulez avec vos meilleures propositions et suivez votre activité depuis votre tableau de bord.
        </Typography>
      </Box>
    </Stack>
  </Box>
);

DashboardContent.propTypes = {
  userData: PropTypes.object
};

const BrowseProjects = ({ onApply }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [snackbar, setSnackbar] = useState({
      open: false,
      message: '',
      severity: 'success'
    });

  const skills = [
    'Développement Web',
    'Développement Mobile',
    'Design Graphique',
    'Rédaction',
    'Marketing Digital',
    'SEO',
    'Data Science',
    'Gestion de Projet',
    'Réseaux Sociaux',
    'Développement de Logiciels',
    'Intelligence Artificielle',
    'Test et Assurance Qualité',
    'Administration Système',
    'Gestion de Base de Données',
    'Analyse de Données',
    'UX/UI Design',
    'Photographie',
    'Vidéo et Montage',
    'Formation et Coaching',
    'Consultation',
    'Support Technique'
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/projets/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des projets');
        }

        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleApply = async (project, message) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/projets/${project.id}/postuler/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la candidature');
      }

      setProjects(prev => prev.filter(p => p.id !== project.id));
      onApply();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkills = selectedSkills.length === 0 || 
                          selectedSkills.every(skill => 
                          project.competences_requises.includes(skill));
    
    return matchesSearch && matchesSkills;
  });

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <StyledPaper elevation={3}>
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={() => setSnackbar(prev => ({...prev, open: false}))}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              sx={{
                '& .MuiSnackbarContent-root': {
                  justifyContent: 'center',
                }
              }}
            >
              <Alert 
                severity={snackbar.severity} 
                onClose={() => setSnackbar(prev => ({...prev, open: false}))}
                sx={{ width: '100%' }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
      <Typography variant="h5" gutterBottom>Trouver des projets</Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher des projets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth sx={{ minWidth: '210px' }}>
            <InputLabel>Filtrer par compétences</InputLabel>
            <Select
              multiple
              value={selectedSkills}
              onChange={(e) => setSelectedSkills(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {skills.map((skill) => (
                <MenuItem key={skill} value={skill}>
                  {skill}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {filteredProjects.length === 0 ? (
        <Alert severity="info">Aucun projet ne correspond à vos critères de recherche.</Alert>
      ) : (
        filteredProjects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onApply={handleApply} 
          />
        ))
      )}
    </StyledPaper>
  );
};

BrowseProjects.propTypes = {
  onApply: PropTypes.func.isRequired
};

const VoirNotifications = ({ notifications, onDeleteNotification }) => {
  const handleDelete = async (notificationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${notificationId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        onDeleteNotification(notificationId);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la notification:", error);
    }
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h5" gutterBottom>Notifications</Typography>
      <List>
        {notifications.map((notification) => (
          <ListItem 
            key={notification.id}
            secondaryAction={
              <IconButton 
                edge="end" 
                aria-label="supprimer"
                onClick={() => handleDelete(notification.id)}
              >
                <CloseIcon />
              </IconButton>
            }
          >
            <ListItemText 
              primary={notification.message} 
              secondary={new Date(notification.date_creation).toLocaleString()} 
            />
          </ListItem>
        ))}
      </List>
    </StyledPaper>
  );
};

VoirNotifications.propTypes = {
  notifications: PropTypes.array.isRequired,
  onDeleteNotification: PropTypes.func.isRequired
};

const drawerWidth = 240;

const FreelancerDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState({
    user: null,
    notif: null,
    msg: null
  });
  const [activeComponent, setActiveComponent] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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
        
        if (userData.type_utilisateur !== 'freelancer') {
          navigate(`/${userData.type_utilisateur}/dashboard`);
          return;
        }

        setUserData(userData);

        try {
          const notifResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (notifResponse.ok) {
            const notifData = await notifResponse.json();
            setNotifications(notifData);
          }
        } catch (notifError) {
          console.warn('Could not fetch notifications', notifError);
          setNotifications([]);
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

  const handleMenuOpen = (menu) => (event) => {
    setAnchorEl({ ...anchorEl, [menu]: event.currentTarget });
  };

  const handleMenuClose = (menu) => () => {
    setAnchorEl({ ...anchorEl, [menu]: null });
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose('user')();
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const handleComponentChange = (componentName) => {
    setActiveComponent(componentName);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const refreshNotifications = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleDeleteNotification = async(notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    await refreshNotifications();
  };

  const handleApplySuccess = () => {
    setSnackbarMessage('Candidature envoyée avec succès !');
    setSnackbarOpen(true);
    refreshNotifications();
  };

  const useCases = [
    { name: 'Dashboard', icon: <AssessmentIcon />, component: 'Dashboard' },
    { name: 'Trouver des projets', icon: <SearchIcon />, component: 'BrowseProjects' },
  ];

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

    const components = {
      Dashboard: <DashboardContent userData={userData} />,
      BrowseProjects: <BrowseProjects onApply={handleApplySuccess} />,
      VoirNotifications: (
        <VoirNotifications 
          notifications={notifications} 
          onDeleteNotification={handleDeleteNotification} 
        />
      )
    };

    return components[activeComponent] || <DashboardContent userData={userData} />;
  };

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Avatar 
          src={userData?.photo_profil}
          sx={{ width: 56, height: 56, mr: 2 }}
        >
          {userData?.nom_complet?.charAt(0) || 'F'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">{userData?.nom_complet || 'Freelancer'}</Typography>
          <Typography variant="body2" color="text.secondary">
              Freelancer
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        <ListItem
                onClick={() => {
                  handleComponentChange('Dashboard');
                  handleNavigation('/freelancer/profile');
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
        {useCases.map((item) => (
          <ListItem 
            key={item.name}
            onClick={() => handleComponentChange(item.component)}
            selected={activeComponent === item.component}
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
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
        <ListItem 
                onClick={handleLogout}
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
            DASHBOARD FREELANCER
          </Typography>
          
          <IconButton color="inherit" onClick={handleMenuOpen('notif')}>
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            id="notif-menu"
            anchorEl={anchorEl.notif}
            keepMounted
            open={Boolean(anchorEl.notif)}
            onClose={handleMenuClose('notif')}
          >
            {notifications.slice(0, 5).map((notification) => (
              <MenuItem 
                key={notification.id} 
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('accessToken');
                    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${notification.id}/`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      }
                    });
                    handleDeleteNotification(notification.id);
                  } catch (error) {
                    console.error("Erreur lors de la suppression:", error);
                  }
                  handleMenuClose('notif')();
                }}
              >
                <ListItemText 
                  primary={notification.message}
                  secondary={new Date(notification.date_creation).toLocaleString()}
                />
                <IconButton edge="end" size="small">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </MenuItem>
            ))}
            <Divider />
            <MenuItem onClick={() => {
              handleMenuClose('notif')();
              setActiveComponent('VoirNotifications');
            }}>
              Voir toutes les notifications
            </MenuItem>
          </Menu>
          <IconButton onClick={handleMenuOpen('user')} sx={{ p: 0, ml: 2 }}>
            <Avatar alt="User" src={userData?.photo_profil}>
              {userData?.nom_complet?.charAt(0) || <AccountCircleIcon />}
            </Avatar>
          </IconButton>
          <Menu
            id="user-menu"
            anchorEl={anchorEl.user}
            keepMounted
            open={Boolean(anchorEl.user)}
            onClose={handleMenuClose('user')}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => handleNavigation('/freelancer/profile')}>
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FreelancerDashboard;