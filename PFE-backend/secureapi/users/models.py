from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import FileExtensionValidator, RegexValidator
from django.core.exceptions import ValidationError
from datetime import timedelta
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model

class GestionnaireUtilisateur(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'adresse e-mail est obligatoire.")
        email = self.normalize_email(email)

        # Déplacer is_active dans extra_fields pour éviter le conflit
        extra_fields.setdefault('is_active', False)
        
        # Générer le jeton avant la création de l'utilisateur
        jeton = get_random_string(64)
        expiration = timezone.now() + timedelta(hours=24)

        utilisateur = self.model(
            email=email,
            jeton_verification=jeton,
            expiration_jeton_verification=expiration,
            **extra_fields
        )
        utilisateur.set_password(password)
        utilisateur.save(using=self._db)
        return utilisateur

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('type_utilisateur', 'administrateur')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Le superutilisateur doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Le superutilisateur doit avoir is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

    def creer_utilisateur_inactif(self, email, password, nom_complet, numero_telephone, photo_profil=None, type_utilisateur='client'):
        return self.create_user(
            email=email,
            password=password,
            nom_complet=nom_complet,
            numero_telephone=numero_telephone,
            photo_profil=photo_profil,
            type_utilisateur=type_utilisateur,
            is_active=False
        )

class Utilisateur(AbstractBaseUser, PermissionsMixin):
    TYPE_UTILISATEUR_CHOICES = (
        ('client', 'Client'),
        ('freelancer', 'Freelancer'),
        ('administrateur', 'Administrateur'),
    )

    email = models.EmailField(unique=True, verbose_name="Adresse email")
    nom_complet = models.CharField(max_length=100, verbose_name="Nom complet")
    numero_telephone = models.CharField(
        max_length=20,
        verbose_name="Numéro de téléphone",
        validators=[
            RegexValidator(
                regex=r'^(\+?\d{8,15}|\(\+?\d{1,3}\)\d{7,14}|\+\d{1,3}\d{7,14})$',
                message="Le numéro doit être au format: '44076356', '+(222)44076356' ou '+22244076356'."
            )
        ]
    )
    photo_profil = models.ImageField(
        upload_to='photos_profil/',
        null=True,
        blank=True,
        verbose_name="Photo de profil"
    )
    jeton_verification = models.CharField(
        max_length=64,
        blank=True,
        null=True,
        verbose_name="Jeton de vérification"
    )
    expiration_jeton_verification = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Expiration du jeton"
    )
    type_utilisateur = models.CharField(
        max_length=20,
        choices=TYPE_UTILISATEUR_CHOICES,
        default='client',
        verbose_name="Type d'utilisateur"
    )
    
    # Champs standards attendus par Django
    is_active = models.BooleanField(
        default=False,  # False jusqu'à vérification email
        verbose_name="Compte vérifié et actif"
    )
    is_staff = models.BooleanField(default=False, verbose_name="Équipe admin")

    date_creation = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    
    jeton_reinitialisation = models.CharField(
        max_length=64,
        blank=True,
        null=True,
        verbose_name="Jeton de réinitialisation"
    )
    expiration_jeton_reinitialisation = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Expiration du jeton de réinitialisation"
    )

    def generer_jeton_reinitialisation(self):
        self.jeton_reinitialisation = get_random_string(64)
        self.expiration_jeton_reinitialisation = timezone.now() + timedelta(hours=1)
        self.save()
        return self.jeton_reinitialisation
    
    objects = GestionnaireUtilisateur()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom_complet', 'numero_telephone']
    
    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
    
    def __str__(self):
        return f"{self.nom_complet} ({self.email})"

class Client(Utilisateur):
    class Meta:
        proxy = True
        verbose_name = "Client"
        verbose_name_plural = "Clients"
    
    def enregistrer_compte(self):
        self.type_utilisateur = 'client'
        self.save()
    
    def publier_projet(self, titre, description, budget_min, budget_max, echeance):
        # Implémentation spécifique au client
        pass

class Freelancer(Utilisateur):
    cv = models.FileField(
        upload_to='cvs_freelancers/',
        validators=[FileExtensionValidator(['pdf', 'doc', 'docx'])],
        blank=True,
        null=True,
        verbose_name="Curriculum Vitae"
    )
    specialisation = models.CharField(
        max_length=100,
        blank=False,
        verbose_name="Spécialisation principale"
    )
    intitule_poste = models.CharField(
        max_length=100,
        blank=False,
        verbose_name="Intitulé de poste"
    )
    competences = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Liste des compétences"
    )
    
    class Meta:
        verbose_name = "Freelancer"
        verbose_name_plural = "Freelancers"
    
    def enregistrer_compte(self):
        self.type_utilisateur = 'freelancer'
        self.save()
    
    def postuler_projet(self, projet, message_motivation=None):
        # Implémentation spécifique au freelancer
        pass

class Administrateur(Utilisateur):
    class Meta:
        proxy = True
        verbose_name = "Administrateur"
        verbose_name_plural = "Administrateurs"
    
    def enregistrer_compte(self):
        self.type_utilisateur = 'administrateur'
        self.is_staff = True  # Utilisation du champ is_staff standard
        self.save()
    
    def gerer_utilisateurs(self):
        # Implémentation spécifique à l'admin
        pass
      
class Projet(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='projets')
    titre = models.CharField(max_length=100)
    description = models.TextField()
    budget_min = models.DecimalField(max_digits=10, decimal_places=2)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2)
    deadline = models.DateField()
    competences_requises = models.JSONField(default=list)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_creation']

    def __str__(self):
        return self.titre

class Postulation(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('accepte', 'Accepté'),
        ('refuse', 'Refusé'),
    ]

    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='postulations')
    freelancer = models.ForeignKey(Freelancer, on_delete=models.CASCADE, related_name='postulations')
    message = models.TextField()
    date_postulation = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')

    class Meta:
        unique_together = ('projet', 'freelancer')
        ordering = ['-date_postulation']

    def __str__(self):
        return f"{self.freelancer} -> {self.projet}"

class Evaluation(models.Model):
    freelancer = models.ForeignKey(Freelancer, on_delete=models.CASCADE, related_name='evaluations')
    note = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_creation']
        verbose_name = "Évaluation"
        verbose_name_plural = "Évaluations"

    def save(self, *args, **kwargs):
        # Calcul de la moyenne si évaluation existante
        if self.pk:
            ancienne_note = Evaluation.objects.get(pk=self.pk).note
            self.note = (ancienne_note + self.note) / 2
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.note}/5 - {self.freelancer}"

Utilisateur = get_user_model()

class Notification(models.Model):
    TYPE_CHOICES = [
        ('projet_publie', 'Projet publié'),
        ('nouvelle_candidature', 'Nouvelle candidature'),
        ('freelancer_selectionne', 'Freelancer sélectionné'),
        ('postulation_acceptee', 'Postulation acceptée'),
        ('postulation_refusee', 'Postulation refusée'),
    ]

    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='notifications')
    type_notification = models.CharField(max_length=30, choices=TYPE_CHOICES)
    date_creation = models.DateTimeField(auto_now_add=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['-date_creation']
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"

    @property
    def message(self):
        if not self.content_object:
            return "Ce contenu ne peut pas être récupéré car il est lié à un projet qui a été annulé ou terminé."
            
        if self.type_notification == 'projet_publie':
            return f"Votre projet {self.content_object.titre} a été publié avec succès"
            
        elif self.type_notification == 'nouvelle_candidature':
            return f"Nouvelle candidature reçue pour votre projet {self.content_object.projet.titre}"
            
        elif self.type_notification == 'freelancer_selectionne':
            return f"Vous avez été sélectionné pour le projet {self.content_object.projet.titre}"
            
        elif self.type_notification == 'postulation_acceptee':
            return f"Votre candidature au projet {self.content_object.projet.titre} a été acceptée"
            
        elif self.type_notification == 'postulation_refusee':
            return f"Votre candidature au projet {self.content_object.projet.titre} a été refusée"
            
        return "Ce contenu ne peut pas être récupéré car il est lié à un projet qui a été annulé ou terminé."

    def __str__(self):
        return f"{self.get_type_notification_display()} - {self.utilisateur.nom_complet}"