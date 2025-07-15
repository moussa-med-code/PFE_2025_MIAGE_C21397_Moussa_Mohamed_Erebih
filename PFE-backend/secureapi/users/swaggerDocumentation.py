from users.views import *
from users.serializers import *
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

# Configuration Swagger pour VueVerificationEmail
verification_response_schemas = {
    "200": openapi.Response(
        description="Redirection vers le frontend avec paramètres de statut",
        examples={
            "application/json": {
                "redirect": "FRONTEND_URL/verification-email?status=success&email=user@example.com"
            }
        }
    ),
    "400": openapi.Response(
        description="Jeton invalide ou expiré",
        examples={
            "application/json": {
                "error": "Invalid or expired token",
                "redirect": "FRONTEND_URL/verification-email?status=invalid_token"
            }
        }
    )
}

verification_manual_parameters = [
    openapi.Parameter(
        name='jeton',
        in_=openapi.IN_PATH,
        type=openapi.TYPE_STRING,
        required=True,
        description="Jeton de vérification envoyé par email",
        example="a1b2c3d4e5f6g7h8i9j0"
    )
]

# Appliquez la documentation Swagger à la vue
VueVerificationEmailDocumentee = swagger_auto_schema(
    method='get',
    operation_id="verify_email",
    operation_description="""
## Endpoint de vérification d'email

Cet endpoint valide l'adresse email d'un utilisateur à l'aide d'un jeton unique envoyé par email.

### Fonctionnement :
1. L'utilisateur clique sur le lien reçu par email
2. Le frontend redirige vers cet endpoint avec le jeton
3. Le serveur vérifie la validité du jeton
4. Redirection vers le frontend avec le résultat

### Scénarios possibles :
- **Succès** : Compte activé, redirection avec `status=success`
- **Jeton expiré** : Nouvel email envoyé, redirection avec `status=expired`
- **Jeton invalide** : Redirection avec `status=invalid_token`
- **Compte déjà vérifié** : Redirection avec `status=deja_verifie`
""",
    manual_parameters=verification_manual_parameters,
    responses=verification_response_schemas,
    tags=['Authentification'],
    security=[],
    deprecated=False
)(VueVerificationEmail.as_view())

# Définition des paramètres pour la documentation
inscription_params = [
    openapi.Parameter(
        name='nom_complet',
        in_=openapi.IN_FORM,
        type=openapi.TYPE_STRING,
        required=True,
        description="Nom complet de l'utilisateur"
    ),
    openapi.Parameter(
        name='email',
        in_=openapi.IN_FORM,
        type=openapi.TYPE_STRING,
        format=openapi.FORMAT_EMAIL,
        required=True,
        description="Email de l'utilisateur"
    ),
    openapi.Parameter(
        name='password',
        in_=openapi.IN_FORM,
        type=openapi.TYPE_STRING,
        format=openapi.FORMAT_PASSWORD,
        required=True,
        description="Mot de passe (minimum 8 caractères)"
    ),
    openapi.Parameter(
        name='numero_telephone',
        in_=openapi.IN_FORM,
        type=openapi.TYPE_STRING,
        required=False,
        description="Numéro de téléphone (optionnel)"
    ),
    openapi.Parameter(
        name='type_utilisateur',
        in_=openapi.IN_FORM,
        type=openapi.TYPE_STRING,
        enum=['client', 'freelancer'],
        required=True,
        description="Type d'utilisateur (client ou freelancer)"
    ),
    openapi.Parameter(
        name='photo_profil',
        in_=openapi.IN_FORM,
        type=openapi.TYPE_FILE,
        required=False,
        description="Photo de profil (optionnel)"
    )
]

# Définition des réponses possibles
inscription_responses = {
    201: openapi.Response(
        description="Inscription réussie",
        schema=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING),
                'nom_complet': openapi.Schema(type=openapi.TYPE_STRING),
                'message': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Message de confirmation"
                )
            }
        )
    ),
    400: openapi.Response(
        description="Données invalides",
        schema=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(type=openapi.TYPE_STRING),
                'details': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    description="Détails des erreurs de validation"
                )
            }
        )
    )
}

# Application de la documentation à la vue
VueInscription = swagger_auto_schema(
    method='post',
    operation_description="""
    Endpoint pour l'inscription d'un nouvel utilisateur.
    
    Crée un nouveau compte utilisateur et envoie un email de vérification.
    Le compte reste inactif jusqu'à la vérification de l'email.
    
    **Types d'utilisateurs**:
    - `client`: Utilisateur standard pouvant poster des projets
    - `freelancer`: Professionnel pouvant postuler aux projets
    
    **Format des données**: multipart/form-data (pour supporter l'upload de photo)
    """,
    manual_parameters=inscription_params,
    responses=inscription_responses,
    tags=['Authentification'],
    operation_summary="Inscription d'un nouvel utilisateur"
)(VueInscriptionUtilisateur.as_view())

EndpointDeRenvoiEmailDeVérification = """
## Renvoi d'email de vérification

Cette endpoint permet de demander un nouvel email de vérification lorsque:
- L'utilisateur n'a pas reçu le premier email
- Le lien de vérification a expiré (valable 24h)

### Fonctionnement:
1. L'utilisateur fournit son email
2. Le système vérifie que l'email correspond à un compte non vérifié
3. Un nouveau jeton est généré et un email est envoyé
4. Le nouveau lien est valable 24h à partir de l'envoi

### Codes de réponse:
- **200**: Email envoyé avec succès (même si l'email n'existe pas, pour éviter l'énumération)
- **400**: Requête invalide (email manquant ou compte déjà vérifié)
"""

# Décorateur pour documenter la vue
VueRenvoyerEmail = swagger_auto_schema(
    method='post',
    operation_description=EndpointDeRenvoiEmailDeVérification,
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['email'],
        properties={
            'email': openapi.Schema(
                type=openapi.TYPE_STRING,
                format='email',
                description="Email de l'utilisateur à vérifier",
                example="utilisateur@example.com"
            ),
        },
    ),
    responses={
        200: openapi.Response(
            description="Email envoyé ou compte déjà vérifié",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(
                        type=openapi.TYPE_STRING,
                        description="Message de confirmation"
                    )
                }
            )
        ),
        400: openapi.Response(
            description="Requête invalide",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(
                        type=openapi.TYPE_STRING,
                        description="Message d'erreur"
                    )
                }
            )
        ),
    },
    tags=['Authentification'],
    operation_summary="Renvoi d'email de vérification"
)(VueRenvoyerEmailVerification.as_view())

# Décorateur pour documenter la vue
DocumentationPourVueDemandeReinitialisation = swagger_auto_schema(
    method='post',
    operation_description="""
    Endpoint pour demander une réinitialisation de mot de passe.
    Un email contenant un lien de réinitialisation sera envoyé à l'adresse fournie.
    Le lien est valable pendant 1 heure.
    """,
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['email'],
        properties={
            'email': openapi.Schema(
                type=openapi.TYPE_STRING,
                format='email',
                description="Email de l'utilisateur pour la réinitialisation",
                example="utilisateur@example.com"
            ),
        },
    ),
    responses={
        200: openapi.Response(
            description="Email envoyé (ou message générique pour prévenir l'énumération)",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(
                        type=openapi.TYPE_STRING,
                        description="Message de confirmation générique"
                    )
                }
            )
        ),
        400: openapi.Response(
            description="Requête invalide",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'email': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(type=openapi.TYPE_STRING),
                        description="Erreurs de validation"
                    )
                }
            )
        ),
    },
    tags=['Authentification'],
    operation_summary="Demande de réinitialisation de mot de passe"
)(VueDemandeReinitialisation.as_view())

# Décorateur pour documenter la vue
DocumentationPourVueReinitialisationMotDePasse = swagger_auto_schema(
    method='post',
    operation_description="""
    Endpoint pour finaliser la réinitialisation du mot de passe.
    Nécessite un jeton valide obtenu via le lien envoyé par email.
    """,
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['password'],
        properties={
            'password': openapi.Schema(
                type=openapi.TYPE_STRING,
                format='password',
                description="Nouveau mot de passe",
                example="NouveauMotDePasse123!"
            ),
        },
    ),
    manual_parameters=[
        openapi.Parameter(
            name='jeton',
            in_='path',
            type=openapi.TYPE_STRING,
            required=True,
            description="Jeton de réinitialisation reçu par email",
            example="abc123def456"
        )
    ],
    responses={
        200: openapi.Response(
            description="Mot de passe réinitialisé avec succès",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(
                        type=openapi.TYPE_STRING,
                        description="Message de confirmation"
                    )
                }
            )
        ),
        400: openapi.Response(
            description="Requête invalide",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'jeton': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(type=openapi.TYPE_STRING),
                        description="Erreur de jeton invalide/expiré"
                    ),
                    'password': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(type=openapi.TYPE_STRING),
                        description="Erreurs de validation du mot de passe"
                    )
                }
            )
        ),
    },
    tags=['Authentification'],
    operation_summary="Finalisation de la réinitialisation du mot de passe"
)(VueReinitialisationMotDePasse.as_view())

ProjetDetailDocumentation = swagger_auto_schema(
    method='get',
    operation_description="""
## Détails d'un projet

Retourne les détails complets d'un projet spécifique.

### Permissions:
- Authentification requise
- Seul le client propriétaire peut modifier/supprimer
""",
    responses={
        200: openapi.Response(
            description="Détails du projet",
            schema=ProjetSerializer()
        ),
        404: openapi.Response(
            description="Projet non trouvé"
        )
    },
    tags=['Projets'],
    operation_summary="Détails d'un projet"
)(ProjetDetailView.as_view())

ProjetsUtilisateurDocumentation = swagger_auto_schema(
    method='get',
    operation_description="""
## Projets d'un utilisateur

Retourne les projets associés à un utilisateur spécifique.

### Pour les clients:
- Liste de leurs projets publiés

### Pour les freelancers:
- Liste des projets où ils ont postulé

### Permissions:
- Authentification requise
- Seul l'admin ou l'utilisateur lui-même peut voir ses projets
""",
    responses={
        200: openapi.Response(
            description="Liste des projets",
            schema=ProjetSerializer(many=True)
        ),
        403: openapi.Response(
            description="Accès non autorisé"
        )
    },
    tags=['Projets'],
    operation_summary="Projets d'un utilisateur"
)(ProjetsUtilisateurListView.as_view())

AnnulerProjetDocumentation = swagger_auto_schema(
    method='delete',
    operation_description="""
## Annuler un projet

Permet à un client d'annuler un projet s'il n'a pas de postulations.

### Comportement:
- Vérifie si le projet a des postulations
- Si oui: retourne une erreur
- Si non: supprime le projet

### Permissions:
- Authentification requise
- Seul le client propriétaire peut annuler
""",
    responses={
        200: openapi.Response(
            description="Projet annulé avec succès",
            examples={
                "application/json": {
                    "detail": "Projet annulé avec succès"
                }
            }
        ),
        400: openapi.Response(
            description="Le projet a des postulations",
            examples={
                "application/json": {
                    "detail": "Le projet ne peut pas être annulé car il possède des postulations"
                }
            }
        ),
        403: openapi.Response(
            description="Non autorisé"
        ),
        404: openapi.Response(
            description="Projet non trouvé"
        )
    },
    tags=['Projets'],
    operation_summary="Annuler un projet"
)(AnnulerProjetView.as_view())

# Documentation pour les endpoints Postulations
PostulerProjetDocumentation = swagger_auto_schema(
    method='post',
    operation_description="""
## Postuler à un projet

Permet à un freelancer de postuler à un projet avec un message de motivation.

### Permissions:
- Authentification requise
- Seuls les freelancers peuvent postuler
""",
    request_body=CreatePostulationSerializer,
    responses={
        201: openapi.Response(
            description="Postulation créée",
            schema=PostulationSerializer()
        ),
        400: openapi.Response(
            description="Requête invalide ou déjà postulé"
        ),
        403: openapi.Response(
            description="Non autorisé (pas un freelancer)"
        )
    },
    tags=['Postulations'],
    operation_summary="Postuler à un projet"
)(PostulationCreateView.as_view())

NotificationDestroyDocumentation = swagger_auto_schema(
    method='delete',
    operation_description="""
## Supprimer une notification

Permet de supprimer une notification spécifique.

### Permissions:
- Authentification requise
- Seul le propriétaire peut supprimer
""",
    responses={
        204: openapi.Response(
            description="Notification supprimée"
        ),
        403: openapi.Response(
            description="Non autorisé"
        ),
        404: openapi.Response(
            description="Notification non trouvée"
        )
    },
    tags=['Notifications'],
    operation_summary="Supprimer une notification"
)(NotificationDestroyView.as_view())

AdminStatisticsDocumentation = swagger_auto_schema(
    method='get',
    operation_description="""
## Statistiques administrateur

Retourne les statistiques globales de la plateforme. 
Uniquement accessible par les administrateurs.

### Statistiques incluses:
- Nombre de clients
- Nombre de freelancers
- Nombre d'administrateurs
- Nombre total de projets

### Permissions:
- Authentification requise
- Droits administrateur requis
""",
    responses={
        200: openapi.Response(
            description="Statistiques de la plateforme",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'clients': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'freelancers': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'admins': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'projects': openapi.Schema(type=openapi.TYPE_INTEGER),
                }
            )
        ),
        401: openapi.Response(
            description="Non authentifié"
        ),
        403: openapi.Response(
            description="Permission refusée (non administrateur)"
        ),
        500: openapi.Response(
            description="Erreur serveur interne",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        )
    },
    tags=['Administration'],
    operation_summary="Obtenir les statistiques de la plateforme"
)(AdminStatisticsView.as_view())

ListeUtilisateursNonAdminDocumentation = swagger_auto_schema(
    method='get',
    operation_description="""
## Liste des utilisateurs non administrateurs

Retourne les informations de base de tous les utilisateurs sauf les administrateurs.

### Informations retournées:
- ID de l'utilisateur
- Nom complet
- Email
- Type d'utilisateur (libellé)
- URL de la photo de profil (si disponible)
- Numéro de téléphone

### Permissions:
- Authentification requise
""",
    responses={
        200: openapi.Response(
            description="Liste des utilisateurs non administrateurs",
            schema=openapi.Schema(
                type=openapi.TYPE_ARRAY,
                items=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'nom_complet': openapi.Schema(type=openapi.TYPE_STRING),
                        'email': openapi.Schema(type=openapi.TYPE_STRING),
                        'type_utilisateur': openapi.Schema(type=openapi.TYPE_STRING),
                        'photo_profil': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_URI, nullable=True),
                        'numero_telephone': openapi.Schema(type=openapi.TYPE_STRING),
                    }
                )
            )
        ),
        401: openapi.Response(
            description="Non authentifié"
        )
    },
    tags=['Administration'],
    operation_summary="Liste des utilisateurs non administrateurs"
)(ListeUtilisateursNonAdminView.as_view())

AdminUserDeleteDocumentation = swagger_auto_schema(
    method='delete',
    operation_description="""
## Suppression d'un utilisateur par un administrateur

Permet à un administrateur de supprimer définitivement un utilisateur (client ou freelancer) ainsi que toutes ses relations associées en cascade.

### Permissions:
- Authentification requise
- Seuls les administrateurs peuvent effectuer cette action
- Impossible de supprimer un autre administrateur

### Comportement:
1. Vérifie que l'utilisateur demandeur est administrateur
2. Vérifie que l'utilisateur cible n'est pas un administrateur
3. Supprime l'utilisateur et toutes ses relations en cascade dans une transaction
""",
    responses={
        204: openapi.Response(
            description="Utilisateur supprimé avec succès",
            examples={
                "application/json": {
                    "detail": "L'utilisateur example@domain.com a été supprimé avec succès."
                }
            }
        ),
        401: openapi.Response(
            description="Non authentifié"
        ),
        403: openapi.Response(
            description="Permission refusée",
            examples={
                "application/json": {
                    "detail": "Vous n'avez pas les permissions nécessaires..."
                }
            }
        ),
        404: openapi.Response(
            description="Utilisateur non trouvé",
            examples={
                "application/json": {
                    "detail": "Utilisateur non trouvé."
                }
            }
        ),
        500: openapi.Response(
            description="Erreur interne du serveur",
            examples={
                "application/json": {
                    "detail": "Une erreur est survenue lors de la suppression..."
                }
            }
        )
    },
    tags=['Administration'],
    operation_summary="Suppression forcée d'un utilisateur par un admin",
    manual_parameters=[
        openapi.Parameter(
            name='user_id',
            in_=openapi.IN_PATH,
            description="ID de l'utilisateur à supprimer",
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ]
)(AdminUserDeleteView.as_view())