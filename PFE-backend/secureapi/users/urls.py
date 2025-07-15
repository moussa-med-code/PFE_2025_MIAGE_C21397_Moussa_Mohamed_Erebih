from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .authentication import CustomTokenObtainPairView
from . import views
from django.urls import re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from .swaggerDocumentation import *
from .views import *
from django.urls import path, include
from rest_framework.routers import DefaultRouter

schema_view = get_schema_view(
    openapi.Info(
        title="API de Mise en Relation Freelancers & Clients",
        default_version='v1',
        description="Cette API permet la gestion des utilisateurs, des projets, des candidatures, et des interactions entre clients et freelancers.",
        contact=openapi.Contact(email="moussamedwedouderebih@gmail.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('utilisateur/inscription/', VueInscription, name='inscription-utilisateur'),
    path('utilisateur/verifier/<str:jeton>/', VueVerificationEmailDocumentee, name='verifier-email'),
    path('utilisateur/profil/', VueProfilUtilisateur.as_view(), name='profil-utilisateur'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('utilisateur/renvoyer-verification/', VueRenvoyerEmail, name='renvoyer-verification'),
    path('mot-de-passe/demande-reinitialisation/', DocumentationPourVueDemandeReinitialisation, name='demande-reinitialisation'),
    path('mot-de-passe/reinitialiser/<str:jeton>/', DocumentationPourVueReinitialisationMotDePasse, name='reinitialiser-mot-de-passe'),
    path('swagger.<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    # Projets
    path('projets/', ProjetListCreateView.as_view(), name='projet-list-create'), # Publier un projet (Client) => Endpoint: POST /api/projets/ et # Recuperer tous les projets (Freelancer) => Endpoint: GET /api/projets/
    path('projets/<int:pk>/', ProjetDetailView.as_view(), name='projet-detail'),
    path('utilisateurs/<int:user_id>/projets/', ProjetsUtilisateurListView.as_view(), name='projets-utilisateur'), # Consulter les projets personnel (Client) => Endpoint: GET /api/utilisateurs/<int:user_id>/projets/
    path('projets/<int:projet_id>/annuler/', AnnulerProjetView.as_view(), name='annuler-projet'), # Annuler un projet (Client) => Endpoint: DELETE /api/projets/<int:projet_id>/annuler/'
    path('client/mes-projets/', ClientProjetsAvecPostulationsView.as_view(), name='client-projets-postulations'), # Recuperer tous les projets du client y compris les postulations sur ces projet (client) => Endpoint: GET /api/client/mes-projets/
    
    # Postulations
    path('projets/<int:projet_id>/postuler/', PostulationCreateView.as_view(), name='postuler-projet'), # Postuler a un projet (freelancer) => Endpoint: POST /api/projets/<projet_id>/postuler/
    path('postulations/<int:pk>/accepter/', PostulationAcceptView.as_view(), name='postulation-accept'), #
    path('postulations/<int:pk>/refuser/', PostulationRefuseView.as_view(), name='postulation-refuse'), #
    
    # Evaluations
    path('freelancers/<int:freelancer_id>/evaluations/', EvaluationCreateUpdateView.as_view(), name='evaluation-create'),
    path('projets/<int:projet_id>/freelancer-accepte/', FreelancerAccepteView.as_view(), name='freelancer-accepte'),
    
    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notification-list'), # Recuperer les notifications (Utilisateur) => Endpoint: GET /api/notifications/
    path('notifications/<int:pk>/', NotificationDestroyView.as_view(), name='notification-destroy'), # Supprimer une notification (Utilisateur) => Endpoint: DELETE /api/notifications/<int:pk>/
    
    #Supprimer un projet forcement en commencant par tous ces postulations utiliser dans le processus de termination d'un projet
    path('projets/<int:pk>/supprimer/', ProjetDeleteView.as_view(), name='projet-delete'),
    
    path('admin/statistiques/', AdminStatisticsDocumentation , name='admin-statistics'), #Retourne les nombres des clients,freelancers,admins,projects
    path('users/', ListeUtilisateursNonAdminDocumentation , name='admin-users-list'),
    path('users/<int:user_id>/', AdminUserDeleteDocumentation, name='admin-users-delete'),
]