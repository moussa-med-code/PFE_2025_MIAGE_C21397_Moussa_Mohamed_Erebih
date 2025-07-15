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
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import StarIcon from '@mui/icons-material/Star';
import { fr } from 'date-fns/locale';

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

const DashboardContent = ({ userData }) => (
  <Box sx={{ width: '100%' }}>
    <Typography variant="h4" gutterBottom>🎉 Bienvenue {userData?.nom_complet} sur la plateforme !</Typography>
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
      <Box>
        <Typography variant="h6">
          Vous pouvez désormais publier un projet, consulter vos projets et sélectionner le freelancer idéal pour vos besoins.
        </Typography>
      </Box>
    </Stack>
  </Box>
);

DashboardContent.propTypes = {
  userData: PropTypes.object
};

const PublierProjet = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    budget_min: '',
    budget_max: '',
    deadline: null,
    competences_requises: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [competences, setCompetences] = useState([
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
]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      deadline: date
    }));
  };

  const handleCompetencesChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData(prev => ({
      ...prev,
      competences_requises: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/projets/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          deadline: formData.deadline?.toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la création du projet');
      }

      const data = await response.json();
      onSuccess(data);
      setFormData({
        titre: '',
        description: '',
        budget_min: '',
        budget_max: '',
        deadline: null,
        competences_requises: []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h5" gutterBottom>Publier un nouveau projet</Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Titre du projet"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              type="number"
              label="Budget minimum (MRU)"
              name="budget_min"
              value={formData.budget_min}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              type="number"
              label="Budget maximum (MRU)"
              name="budget_max"
              value={formData.budget_max}
              onChange={handleChange}
              inputProps={{ min: formData.budget_min || 0 }}
            />
          </Grid>
          <Grid item xs={12}>
          <TextField
              required
              fullWidth
              multiline
              rows={4}
              label="Description détaillée"
              name="description"
              value={formData.description}
              onChange={handleChange}
              sx={{
                '& .MuiInputBase-root': {
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                },
                '& .MuiInputBase-input': {
                  minWidth: '690px'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <DatePicker
            label="Date limite"
            value={formData.deadline}
            onChange={handleDateChange}
            minDate={new Date()}
            renderInput={(params) => <TextField {...params} fullWidth required />}
          />
        </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={{ minWidth: '210px' }}>
            <InputLabel
              sx={{
                '&.Mui-focused, &.MuiInputLabel-shrink': {
                  transform: 'translate(0, -20px) scale(0.75)',
                  // Styles supplémentaires pour améliorer l'apparence
                  backgroundColor: 'background.paper',
                  padding: '0 8px',
                  borderRadius: '1px',
                  // Pour éviter que le label ne chevauche les bordures
                  marginLeft: '-8px',
                  // Pour une transition plus douce
                  transition: 'transform 0.2s ease-out, color 0.2s ease-out'
                }
              }}
            >
              Compétences requises
            </InputLabel>
              <Select
                multiple
                value={formData.competences_requises}
                onChange={handleCompetencesChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {competences.map((competence) => (
                  <MenuItem key={competence} value={competence}>
                    {competence}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
            >
              Publier le projet
            </Button>
          </Grid>
        </Grid>
      </Box>
    </StyledPaper>
  );
};

PublierProjet.propTypes = {
  onSuccess: PropTypes.func.isRequired
};

const ConsulterProjets = ({ userId }) => {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [selectedProjet, setSelectedProjet] = useState(null);
  const [freelancer, setFreelancer] = useState(null);
  const [rating, setRating] = useState(0);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    const fetchProjets = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/utilisateurs/${userId}/projets/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des projets');
        }

        const data = await response.json();
        setProjets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjets();
  }, [userId]);

  const handleAnnuler = async (projetId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/projets/${projetId}/annuler/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'annulation du projet');
      }

      const updatedProjets = projets.filter(projet => projet.id !== projetId);
      setProjets(updatedProjets);

      setSnackbar({
        open: true,
        message: 'Projet annulé avec succès',
        severity: 'success'
      });

    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleTerminer = async (projetId) => {
    try {
      setSelectedProjet(projetId);
      const token = localStorage.getItem('accessToken');
      
      // Vérifier s'il y a un freelancer accepté
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/projets/${projetId}/freelancer-accepte/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Vous ne pouvez pas terminer un projet qui n'a pas commencer veuiller l'annuler si vous n'etes pas besoin de projet.");
      }

      const freelancerData = await response.json();
      setFreelancer(freelancerData);
      
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleRatingChange = (newValue) => {
    setRating(newValue);
  };

  const handleSubmitEvaluation = async () => {
    if (!rating || rating < 1 || rating > 5) {
      setSnackbar({
        open: true,
        message: 'Veuillez donner une note entre 1 et 5 étoiles',
        severity: 'error'
      });
      return;
    }

    try {
      setEvaluating(true);
      const token = localStorage.getItem('accessToken');
      
      // Envoyer l'évaluation
      const evalResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/freelancers/${freelancer.id}/evaluations/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({note: rating })
      });

      if (!evalResponse.ok) {
        throw new Error('Erreur lors de l\'évaluation du freelancer');
      }

      // Supprimer le projet après évaluation
      const deleteResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/projets/${selectedProjet}/supprimer/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!deleteResponse.ok) {
        throw new Error('Erreur lors de la suppression du projet');
      }

      // Mettre à jour l'état local
      const updatedProjets = projets.filter(projet => projet.id !== selectedProjet);
      setProjets(updatedProjets);
      
      setSnackbar({
        open: true,
        message: 'Évaluation effectuée avec succès et projet terminé',
        severity: 'success'
      });

      // Réinitialiser les états
      setFreelancer(null);
      setSelectedProjet(null);
      setRating(0);
      
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h5" gutterBottom>Mes projets</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ tableLayout: 'fixed' }}>
        <TableHead>
            <TableRow>
              <TableCell sx={{ width: '120px' }}>Titre</TableCell>
              <TableCell sx={{ width: '300px' }}>Description</TableCell>
              <TableCell sx={{ width: '100px' }}>Budget min</TableCell>
              <TableCell sx={{ width: '100px' }}>Budget max</TableCell>
              <TableCell sx={{ width: '90px' }}>Deadline</TableCell>
              <TableCell sx={{ width: '150px' }}>Compétences</TableCell>
              <TableCell sx={{ width: '90px' }}>Date création</TableCell>
              <TableCell sx={{ width: '150px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projets.map((projet) => (
              <TableRow key={projet.id}>
                <TableCell>{projet.titre}</TableCell>
                <TableCell>
                  {projet.description}
                </TableCell>
                <TableCell>{projet.budget_min} MRU</TableCell>
                <TableCell>{projet.budget_max} MRU</TableCell>
                <TableCell>{new Date(projet.deadline).toLocaleDateString()}</TableCell>
                <TableCell>
                  {projet.competences_requises.join(', ')}
                </TableCell>
                <TableCell>
                  {new Date(projet.date_creation).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button 
                    color="error" 
                    onClick={() => handleAnnuler(projet.id)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    color="success" 
                    onClick={() => handleTerminer(projet.id)}
                    sx={{ ml: 1 }}
                  >
                    Terminer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Card d'évaluation du freelancer */}
      {freelancer && (
        <Card sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Veuillez évaluer le freelancer pour terminer
            {console.log(freelancer)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              src={`${import.meta.env.VITE_BACKEND_URL}`+freelancer.photo_profil}
              alt={freelancer.nom_complet}
              sx={{ width: 56, height: 56, mr: 2 }}
            />
            <Typography variant="subtitle1">{freelancer.nom_complet}</Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Rating
              name="freelancer-rating"
              value={rating}
              onChange={(event, newValue) => handleRatingChange(newValue)}
              max={5}
              size="large"
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitEvaluation}
            disabled={evaluating}
          >
            {evaluating ? 'En cours...' : 'Évaluer'}
          </Button>
        </Card>
      )}

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
    </StyledPaper>
  );
};

const GererFreelancers = () => {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchProjets = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/client/mes-projets/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des projets');
        }
        const data = await response.json();
        setProjets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjets();
  }, []);

  const handleDownloadCV = (cvUrl) => {
    window.open(cvUrl, '_blank');
  };

  const handleAccept = async (postulationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/postulations/${postulationId}/accepter/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'acceptation de la postulation');
      }

      setProjets(prevProjets => prevProjets.map(projet => ({
        ...projet,
        postulations: projet.postulations.map(postulation => 
          postulation.id === postulationId 
            ? { ...postulation, statut: 'accepte' } 
            : postulation
        )
      })));

      setSnackbar({
        open: true,
        message: 'Postulation acceptée avec succès',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleReject = async (postulationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/postulations/${postulationId}/refuser/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du refus de la postulation');
      }

      setProjets(prevProjets => prevProjets.map(projet => ({
        ...projet,
        postulations: projet.postulations.map(postulation => 
          postulation.id === postulationId 
            ? { ...postulation, statut: 'refuse' } 
            : postulation
        )
      })));

      setSnackbar({
        open: true,
        message: 'Postulation refusée avec succès',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h5" gutterBottom>Gérer les freelancers</Typography>
      <Typography paragraph>
        Interface pour gérer vos interactions avec les freelancers postulant sur vos projets.
      </Typography>

      {projets.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          Vous n'avez aucun projet pour le moment.
        </Typography>
      ) : (
        projets.map((projet) => (
          <Box key={projet.id} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              Projet: {projet.titre}
            </Typography>
            
            {projet.postulations?.length > 0 ? (
              <Grid container spacing={3}>
                {projet.postulations.map((postulation) => (
                  <Grid item xs={12} md={6} key={postulation.id}>
                    <Card variant="outlined" sx={{
                      borderColor: postulation.statut === 'accepte' ? 'success.main' : 
                                  postulation.statut === 'refuse' ? 'error.main' : 'divider'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            src={postulation.freelancer?.photo_profil} 
                            alt={postulation.freelancer?.nom_complet}
                            sx={{ width: 56, height: 56, mr: 2 }}
                          />
                          <Box>
                            <Typography variant="subtitle1" component="div">
                              {postulation.freelancer?.nom_complet}
                              {postulation.statut === 'accepte' && (
                                <Chip 
                                  label="Accepté" 
                                  color="success" 
                                  size="small" 
                                  sx={{ ml: 1 }} 
                                />
                              )}
                              {postulation.statut === 'refuse' && (
                                <Chip 
                                  label="Refusé" 
                                  color="error" 
                                  size="small" 
                                  sx={{ ml: 1 }} 
                                />
                              )}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Rating 
                                value={postulation.freelancer?.moyenne_notes || 0} 
                                precision={0.5} 
                                readOnly 
                                size="small"
                              />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({postulation.freelancer?.moyenne_notes || 0}/5)
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Message:</strong> "{postulation.message}"
                        </Typography>

                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Spécialisation:</strong> {postulation.freelancer?.specialisation}
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {postulation.freelancer?.competences?.map((competence, index) => (
                            <Chip key={index} label={competence} size="small" />
                          ))}
                        </Box>

                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownloadCV(postulation.freelancer?.cv)}
                          sx={{ mb: 2 }}
                          fullWidth
                        >
                          Télécharger CV
                        </Button>
                      </CardContent>

                      <Divider />

                      <CardActions sx={{ justifyContent: 'flex-end' }}>
                        <Button 
                          color="error" 
                          startIcon={<CancelIcon />}
                          onClick={() => handleReject(postulation.id)}
                          disabled={postulation.statut !== 'en_attente'}
                        >
                          Refuser
                        </Button>
                        <Button 
                          color="success" 
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleAccept(postulation.id)}
                          disabled={postulation.statut !== 'en_attente'}
                        >
                          Accepter
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Aucun freelancer n'a postulé sur ce projet pour le moment.
              </Typography>
            )}
          </Box>
        ))
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({...prev, open: false}))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({...prev, open: false}))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StyledPaper>
  );
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

const ClientDashboard = () => {
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
        
        if (userData.type_utilisateur !== 'client') {
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

  const handlePublishSuccess = async(projectData) => {
    setSnackbarMessage(`Projet "${projectData.titre}" créé avec succès !`);
    setSnackbarOpen(true);
    await refreshNotifications();
    setActiveComponent('ConsulterProjets');
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const useCases = [
    { name: 'Dashboard', icon: <AssessmentIcon />, component: 'Dashboard' },
    { name: 'Publier un projet', icon: <WorkIcon />, component: 'PublierProjet' },
    { name: 'Consulter les projets', icon: <AssessmentIcon />, component: 'ConsulterProjets' },
    { name: 'Gérer les candidatures des freelancers', icon: <PeopleIcon />, component: 'GererFreelancers' },
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
      PublierProjet: <PublierProjet onSuccess={handlePublishSuccess} />,
      ConsulterProjets: <ConsulterProjets userId={userData?.id} />,
      GererFreelancers: <GererFreelancers />,
      VoirNotifications: (
        <VoirNotifications 
          notifications={notifications} 
          onDeleteNotification={handleDeleteNotification} 
        />
      ),
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
          {userData?.nom_complet?.charAt(0) || 'U'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">{userData?.nom_complet || 'Utilisateur'}</Typography>
          <Typography variant="body2" color="text.secondary">
            Client
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
      <ListItem
        onClick={() => {
          handleComponentChange('Dashboard');
          handleNavigation('/client/profile');
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
            DASHBOARD CLIENT
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

export default ClientDashboard;