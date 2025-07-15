import React, { useState } from 'react';
import {
  TextField, Button, Card, CardHeader, CardContent,
  Alert, Box, Typography, InputAdornment,
  IconButton, MenuItem, Select, FormControl,
  InputLabel, Stepper, Step, StepLabel
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Description as DescriptionIcon,
  Work as WorkIcon
} from '@mui/icons-material';

const FormulaireInscription = () => {
  const [etapeActive, setEtapeActive] = useState(0);
  const [typeUtilisateur, setTypeUtilisateur] = useState('client');
  const [donneesFormulaire, setDonneesFormulaire] = useState({
    nom_complet: '',
    email: '',
    password: '',
    numero_telephone: '',
    photo_profil: null,
    type_utilisateur: 'client',
    cv: null,
    specialisation: '',
    intitule_poste: '',
    competences: []
  });
  const [erreur, setErreur] = useState('');
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [enChargement, setEnChargement] = useState(false);
  const [inscriptionReussie, setInscriptionReussie] = useState(false);
  const [emailInscrit, setEmailInscrit] = useState('');
  const [erreursValidation, setErreursValidation] = useState({
    password: '',
    email: '',
    numero_telephone: '',
    cv: '',
    photo_profil: ''
  });

  const etapes = ['Informations de base', 'Informations complémentaires', 'Confirmation'];

  // Fonctions de validation
  const validerMotDePasse = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!password) return "Le mot de passe est requis";
    if (password.length < minLength) return "Doit contenir au moins 8 caractères";
    if (!hasUpperCase) return "Doit contenir au moins une majuscule";
    if (!hasLowerCase) return "Doit contenir au moins une minuscule";
    if (!hasNumber) return "Doit contenir au moins un chiffre";
    if (!hasSpecialChar) return "Doit contenir au moins un caractère spécial";
    return "";
  };

  const validerEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "L'email est requis";
    if (!emailRegex.test(email)) return "Veuillez entrer une adresse email valide";
    return "";
  };

  const validerTelephone = (numero) => {
    const phoneRegex = /^(\+?\d{8,15}|\(\+?\d{1,3}\)\d{7,14}|\+\d{1,3}\d{7,14})$/;
    if (!numero) return "Le numéro de téléphone est requis";
    if (!phoneRegex.test(numero)) return "Format invalide. Ex: 44076356, +(222)44076356, +22244076356";
    return "";
  };

  const validerFichierCV = (file) => {
    if (typeUtilisateur === 'freelancer' && !file) return "Un CV est requis";
    if (!file) return "";
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) return "Le fichier doit être un PDF ou DOC/DOCX";
    if (file.size > maxSize) return "Le fichier ne doit pas dépasser 5MB";
    return "";
  };

  const validerPhotoProfil = (file) => {
    if (!file) return "";
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (!validTypes.includes(file.type)) return "L'image doit être au format JPEG, PNG ou GIF";
    if (file.size > maxSize) return "L'image ne doit pas dépasser 2MB";
    return "";
  };

  const calculerForceMotDePasse = (password) => {
    let score = 0;
    if (!password) return 0;
    
    if (password.length > 8) score += 1;
    if (password.length > 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    return Math.min(5, score);
  };

  const IndicateurForceMotDePasse = ({ password }) => {
    const force = calculerForceMotDePasse(password);
    const couleurs = ['#ff0000', '#ff4000', '#ff8000', '#ffbf00', '#80ff00', '#00ff00'];
    
    return (
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" display="block">
          Force du mot de passe:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, height: 8 }}>
          {[1, 2, 3, 4, 5].map((niveau) => (
            <Box 
              key={niveau}
              sx={{ 
                flex: 1, 
                backgroundColor: niveau <= force ? couleurs[force] : '#e0e0e0',
                borderRadius: 1
              }}
            />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary">
          {force < 2 && "Très faible"}
          {force === 2 && "Faible"}
          {force === 3 && "Moyen"}
          {force === 4 && "Fort"}
          {force === 5 && "Très fort"}
        </Typography>
      </Box>
    );
  };

  const gererChangement = (e) => {
    const { name, value } = e.target;
    setDonneesFormulaire({ ...donneesFormulaire, [name]: value });
    
    if (name === 'password') {
      setErreursValidation({
        ...erreursValidation,
        password: validerMotDePasse(value)
      });
    }
    if (name === 'email') {
      setErreursValidation({
        ...erreursValidation,
        email: validerEmail(value)
      });
    }
    if (name === 'numero_telephone') {
      setErreursValidation({
        ...erreursValidation,
        numero_telephone: validerTelephone(value)
      });
    }
  };

  const gererFichier = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      let erreurFile = '';
      
      if (e.target.name === 'cv') {
        erreurFile = validerFichierCV(file);
        setErreursValidation({
          ...erreursValidation,
          cv: erreurFile
        });
      } else if (e.target.name === 'photo_profil') {
        erreurFile = validerPhotoProfil(file);
        setErreursValidation({
          ...erreursValidation,
          photo_profil: erreurFile
        });
      }
      
      if (!erreurFile) {
        setDonneesFormulaire({ ...donneesFormulaire, [e.target.name]: file });
      }
    }
  };

  const validerEtape = (etape) => {
    const erreurs = {};
    let hasError = false;

    if (etape === 0) {
      if (!donneesFormulaire.nom_complet) {
        erreurs.nom_complet = "Le nom complet est requis";
        hasError = true;
      }
      
      const emailError = validerEmail(donneesFormulaire.email);
      if (emailError) {
        erreurs.email = emailError;
        hasError = true;
      }
      
      const passwordError = validerMotDePasse(donneesFormulaire.password);
      if (passwordError) {
        erreurs.password = passwordError;
        hasError = true;
      }
      
      const phoneError = validerTelephone(donneesFormulaire.numero_telephone);
      if (phoneError) {
        erreurs.numero_telephone = phoneError;
        hasError = true;
      }
    }

    if (etape === 1 && typeUtilisateur === 'freelancer') {
      const cvError = validerFichierCV(donneesFormulaire.cv);
      if (cvError) {
        erreurs.cv = cvError;
        hasError = true;
      }
      
      if (!donneesFormulaire.specialisation) {
        erreurs.specialisation = "La spécialisation est requise";
        hasError = true;
      }
      
      if (!donneesFormulaire.intitule_poste) {
        erreurs.intitule_poste = "L'intitulé de poste est requis";
        hasError = true;
      }
    }

    if (hasError) {
      setErreursValidation({ ...erreursValidation, ...erreurs });
      setErreur("Veuillez corriger les erreurs avant de continuer");
      return false;
    }

    return true;
  };

  const etapeSuivante = () => {
    if (!validerEtape(etapeActive)) return;
    
    setErreur('');
    setEtapeActive(etapeActive + 1);
  };

  const etapePrecedente = () => {
    setEtapeActive(etapeActive - 1);
    setErreur('');
  };

  const soumettreFormulaire = async (e) => {
    e.preventDefault();
    
    // Validation finale de toutes les étapes
    for (let i = 0; i <= etapeActive; i++) {
      if (!validerEtape(i)) {
        setEtapeActive(i);
        return;
      }
    }
    
    setErreur('');
    setEnChargement(true);

    try {
      const donneesAEnvoyer = new FormData();
      
      // Champs de base pour tous les utilisateurs
      donneesAEnvoyer.append('email', donneesFormulaire.email);
      donneesAEnvoyer.append('password', donneesFormulaire.password);
      donneesAEnvoyer.append('nom_complet', donneesFormulaire.nom_complet);
      donneesAEnvoyer.append('numero_telephone', donneesFormulaire.numero_telephone);
      donneesAEnvoyer.append('type_utilisateur', typeUtilisateur);
      
      if (donneesFormulaire.photo_profil) {
        donneesAEnvoyer.append('photo_profil', donneesFormulaire.photo_profil);
      }
      
      // Champs spécifiques au freelancer
      if (typeUtilisateur === 'freelancer') {
        donneesAEnvoyer.append('cv', donneesFormulaire.cv);
        donneesAEnvoyer.append('specialisation', donneesFormulaire.specialisation);
        donneesAEnvoyer.append('intitule_poste', donneesFormulaire.intitule_poste);
        donneesAEnvoyer.append('competences', donneesFormulaire.competences.join(','));
      }

      console.log('Données envoyées au serveur:');
      for (let [key, value] of donneesAEnvoyer.entries()) {
        console.log(key, value);
      }

      const reponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/utilisateur/inscription/`, {
        method: 'POST',
        body: donneesAEnvoyer,
      });

      if (!reponse.ok) {
        const data = await reponse.json();
        const messagesErreur = Object.entries(data)
          .filter(([, valeur]) => valeur)
          .map(([cle, valeur]) => `${cle}: ${valeur}`)
          .join('\n');
        
        setErreur(messagesErreur || "Erreur lors de l'inscription.");
        return;
      }

      setEmailInscrit(donneesFormulaire.email);
      setInscriptionReussie(true);
      setErreur('');
      
    } catch (error) {
      console.error('Erreur:', error);
      setErreur("Une erreur est survenue lors de la connexion au serveur.");
    } finally {
      setEnChargement(false);
    }
  };

  const renvoyerEmailVerification = async () => {
    setEnChargement(true);
    setErreur('');
    try {
      const reponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/utilisateur/renvoyer-verification/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailInscrit }),
      });

      const data = await reponse.json();
      
      if (!reponse.ok) {
        setErreur(data.detail || "Erreur lors de l'envoi de l'email.");
        return;
      }

      setErreur(data.detail);
    } catch (error) {
      console.error('Erreur:', error);
      setErreur("Une erreur est survenue lors de la connexion au serveur.");
    } finally {
      setEnChargement(false);
    }
  };

  const contenuEtape = (etape) => {
    switch (etape) {
      case 0:
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type d'utilisateur</InputLabel>
              <Select
                value={typeUtilisateur}
                onChange={(e) => setTypeUtilisateur(e.target.value)}
                label="Type d'utilisateur"
                autoComplete="user-type"
              >
                <MenuItem value="client">Client</MenuItem>
                <MenuItem value="freelancer">Freelancer</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Nom Complet"
              name="nom_complet"
              fullWidth
              required
              value={donneesFormulaire.nom_complet}
              onChange={gererChangement}
              margin="normal"
              autoComplete="name"
              error={!!erreursValidation.nom_complet}
              helperText={erreursValidation.nom_complet}
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              required
              value={donneesFormulaire.email}
              onChange={gererChangement}
              margin="normal"
              autoComplete="email"
              error={!!erreursValidation.email}
              helperText={erreursValidation.email}
            />

            <TextField
              label="Mot de passe"
              name="password"
              autoComplete="new-password"
              type={afficherMotDePasse ? 'text' : 'password'}
              fullWidth
              required
              value={donneesFormulaire.password}
              onChange={gererChangement}
              margin="normal"
              error={!!erreursValidation.password}
              helperText={erreursValidation.password || "Doit contenir 8+ caractères, majuscule, minuscule, chiffre et caractère spécial"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
                      edge="end"
                    >
                      {afficherMotDePasse ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <IndicateurForceMotDePasse password={donneesFormulaire.password} />

            <TextField
              label="Numéro de Téléphone"
              name="numero_telephone"
              type="tel"
              fullWidth
              required
              value={donneesFormulaire.numero_telephone}
              onChange={gererChangement}
              margin="normal"
              autoComplete="tel"
              error={!!erreursValidation.numero_telephone}
              helperText={erreursValidation.numero_telephone || "Formats acceptés: 44076356, +(222)44076356, +22244076356"}
            />

            <Box sx={{ my: 2 }}>
              <input
                type="file"
                id="photo_profil"
                name="photo_profil"
                accept="image/*"
                onChange={gererFichier}
                style={{ display: 'none' }}
                autoComplete="photo"
              />
              <label htmlFor="photo_profil">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AddPhotoAlternateIcon />}
                  fullWidth
                  color={erreursValidation.photo_profil ? "error" : "primary"}
                >
                  {donneesFormulaire.photo_profil ? (
                    <>
                      {donneesFormulaire.photo_profil.name}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {(donneesFormulaire.photo_profil.size / 1024).toFixed(1)} KB
                      </Typography>
                    </>
                  ) : 'Photo de Profil (optionnelle, max 2MB)'}
                </Button>
              </label>
              {erreursValidation.photo_profil && (
                <Typography color="error" variant="caption" display="block">
                  {erreursValidation.photo_profil}
                </Typography>
              )}
            </Box>
          </>
        );
      case 1:
        if (typeUtilisateur === 'freelancer') {
          return (
            <>
              <Box sx={{ my: 2 }}>
                <input
                  type="file"
                  id="cv"
                  name="cv"
                  accept=".pdf,.doc,.docx"
                  onChange={gererFichier}
                  style={{ display: 'none' }}
                  autoComplete="cv"
                />
                <label htmlFor="cv">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<DescriptionIcon />}
                    fullWidth
                    color={erreursValidation.cv ? "error" : "primary"}
                  >
                    {donneesFormulaire.cv ? (
                      <>
                        {donneesFormulaire.cv.name}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {(donneesFormulaire.cv.size / 1024).toFixed(1)} KB
                        </Typography>
                      </>
                    ) : 'Téléverser votre CV (PDF ou DOC, max 5MB)'}
                  </Button>
                </label>
                {erreursValidation.cv && (
                  <Typography color="error" variant="caption" display="block">
                    {erreursValidation.cv}
                  </Typography>
                )}
              </Box>

              <TextField
                label="Spécialisation"
                name="specialisation"
                autoComplete="specialization"
                fullWidth
                required
                value={donneesFormulaire.specialisation}
                onChange={gererChangement}
                margin="normal"
                error={!!erreursValidation.specialisation}
                helperText={erreursValidation.specialisation}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Intitulé de poste"
                name="intitule_poste"
                fullWidth
                required
                value={donneesFormulaire.intitule_poste}
                onChange={gererChangement}
                margin="normal"
                autoComplete="job-title"
                error={!!erreursValidation.intitule_poste}
                helperText={erreursValidation.intitule_poste}
              />

              <TextField
                label="Compétences (séparées par des virgules)"
                value={donneesFormulaire.competences.join(',')}
                autoComplete="skills"
                onChange={(e) => {
                  const competences = e.target.value.split(',').map(c => c.trim());
                  setDonneesFormulaire({...donneesFormulaire, competences});
                }}
                margin="normal"
                fullWidth
              />
            </>
          );
        } else {
          return (
            <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
              Aucune information supplémentaire requise pour les clients.
            </Typography>
          );
        }
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Vérifiez vos informations
            </Typography>
            <Typography>
              <strong>Type:</strong> {typeUtilisateur === 'client' ? 'Client' : 'Freelancer'}
            </Typography>
            <Typography>
              <strong>Nom:</strong> {donneesFormulaire.nom_complet}
            </Typography>
            <Typography>
              <strong>Email:</strong> {donneesFormulaire.email}
            </Typography>
            <Typography>
              <strong>Téléphone:</strong> {donneesFormulaire.numero_telephone}
            </Typography>
            
            {typeUtilisateur === 'freelancer' && (
              <>
                <Typography>
                  <strong>Spécialisation:</strong> {donneesFormulaire.specialisation}
                </Typography>
                <Typography>
                  <strong>Intitulé de poste:</strong> {donneesFormulaire.intitule_poste}
                </Typography>
                <Typography>
                  <strong>Compétences:</strong> {donneesFormulaire.competences.join(', ')}
                </Typography>
              </>
            )}
          </Box>
        );
      default:
        return 'Étape inconnue';
    }
  };

  if (inscriptionReussie) {
    return (
      <Box sx={{ maxWidth: '800px', margin: 'auto', p: 3 }}>
        <Card elevation={24} sx={{ borderRadius: 2 }}>
          <CardHeader
            title="Inscription réussie!"
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              py: 2,
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }}
          />
          <CardContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Un email de vérification a été envoyé à {emailInscrit}. 
              Veuillez cliquer sur le lien dans l'email pour activer votre compte.
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              Vous n'avez pas reçu l'email?
            </Typography>
            
            <Button
              variant="contained"
              onClick={renvoyerEmailVerification}
              disabled={enChargement}
              sx={{ mb: 2 }}
            >
              {enChargement ? 'Envoi en cours...' : 'Renvoyer l\'email'}
            </Button>
            
            {erreur && (
              <Alert severity={erreur.includes('envoyé') ? "success" : "error"} sx={{ mt: 2 }}>
                {erreur}
              </Alert>
            )}
            
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              <Button href="/login" color="primary">
                Aller à la page de connexion
              </Button>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '800px', margin: 'auto', p: 3 }}>
      <Card elevation={24} sx={{ borderRadius: 2 }}>
        <CardHeader
          title={
            <Typography variant="h5" component="h1" align="center">
              Créer un compte
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
          <Stepper activeStep={etapeActive} alternativeLabel sx={{ mb: 4 }}>
            {etapes.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {erreur && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erreur}
              {Object.values(erreursValidation).filter(e => e).length > 0 && (
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {Object.values(erreursValidation)
                    .filter(e => e)
                    .map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                </ul>
              )}
            </Alert>
          )}

          <Box component="form" onSubmit={soumettreFormulaire} noValidate>
            {contenuEtape(etapeActive)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={etapePrecedente}
                disabled={etapeActive === 0}
              >
                Retour
              </Button>
              
              {etapeActive < etapes.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={etapeSuivante}
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={enChargement}
                >
                  {enChargement ? 'Enregistrement...' : 'Confirmer et créer le compte'}
                </Button>
              )}
            </Box>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Vous avez déjà un compte ?{' '}
            <Button href="/login" color="primary">
              Se connecter
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FormulaireInscription;