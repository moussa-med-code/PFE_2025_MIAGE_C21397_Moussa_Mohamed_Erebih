from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.mail import send_mail
from django.urls import reverse
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.throttling import AnonRateThrottle
from datetime import timedelta
from django.utils.crypto import get_random_string
from rest_framework.permissions import AllowAny
from django.shortcuts import redirect
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view , permission_classes
from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework import generics, status, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Utilisateur, Freelancer , Administrateur , Projet, Postulation, Evaluation, Notification
from .serializers import *
User = get_user_model()
from django.db.models import Avg
from django.db import transaction
from rest_framework.decorators import action
from rest_framework import viewsets, permissions, status
from django.shortcuts import get_object_or_404
from .models import *
from rest_framework.permissions import IsAdminUser
import logging

class VueInscriptionUtilisateur(generics.CreateAPIView):
    queryset = Utilisateur.objects.all()
    serializer_class = InscriptionUtilisateurSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        utilisateur = serializer.save()
        
        # Vérifier que le jeton est bien généré
        if not utilisateur.jeton_verification:
            utilisateur.jeton_verification = get_random_string(64)
            utilisateur.expiration_jeton_verification = timezone.now() + timedelta(hours=24)
            utilisateur.save()
            
        lien_verification = self.request.build_absolute_uri(
            reverse('verifier-email', kwargs={'jeton': utilisateur.jeton_verification})
        )
        
        # Vérifier que le lien est correct
        print(f"Lien de vérification généré: {lien_verification}")  # Pour débogage
        
        sujet = "Merci de confirmer votre inscription"
        message = f"""
        Bonjour {utilisateur.nom_complet},
        
        Merci de vous être inscrit(e) sur notre plateforme,
        la plateforme de mise en relation entre clients et freelancers. Pour activer votre compte et commencer à découvrir nos services, veuillez cliquer sur le lien ci-dessous pour confirmer votre adresse email :
        
        {lien_verification}
        
        Ce lien est valable pendant 24 heures. Si vous rencontrez des difficultés ou si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email ou nous contacter à moussamedwedouderebih@gmail.com.
        
        Cordialement,
        Moussa Mohamed Erebih, administrateur système.
        
        Informations sur la confidentialité : Vos données sont stockées de manière sécurisée et ne seront utilisées que pour vous fournir nos services conformément à notre politique de confidentialité.
        """
        send_mail(
            sujet,
            message,
            settings.EMAIL_HOST_USER,
            [utilisateur.email],
            fail_silently=False,
        )
        
class VueVerificationEmail(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def get(self, request, jeton):
        try:
            utilisateur = Utilisateur.objects.get(jeton_verification=jeton)
        except Utilisateur.DoesNotExist:
            return redirect(f"{settings.FRONTEND_URL}/verification-email?status=invalid_token")

        if utilisateur.expiration_jeton_verification < timezone.now():
            utilisateur.jeton_verification = get_random_string(64)
            utilisateur.expiration_jeton_verification = timezone.now() + timedelta(hours=24)
            utilisateur.save()
            
            self.envoyer_email_verification(utilisateur)
            return redirect(f"{settings.FRONTEND_URL}/verification-email?status=expired&email={utilisateur.email}")

        if utilisateur.is_active:
            return redirect(f"{settings.FRONTEND_URL}/verification-email?status=deja_verifie&email={utilisateur.email}")

        # Activer le compte
        utilisateur.is_active = True
        utilisateur.jeton_verification = None
        utilisateur.expiration_jeton_verification = None
        utilisateur.save()

        # Gestion du profil freelancer
        if utilisateur.type_utilisateur == 'freelancer':
            try:
                # Vérifie si le profil freelancer existe déjà
                Freelancer.objects.get(utilisateur_ptr=utilisateur)
            except Freelancer.DoesNotExist:
                # Crée seulement si n'existe pas
                freelancer = Freelancer(utilisateur_ptr=utilisateur)
                freelancer.save_base(raw=True)  # Sauvegarde sans créer une nouvelle entrée utilisateur

        return redirect(f"{settings.FRONTEND_URL}/verification-email?status=success&email={utilisateur.email}")

    def envoyer_email_verification(self, utilisateur):
        lien_verification = (
            f"{settings.FRONTEND_URL}/verifier-email/{utilisateur.jeton_verification}/"
        )
        
        sujet = "Nouveau lien de vérification"
        message = f"""
        Bonjour {utilisateur.nom_complet},
        
        Votre précédent lien de vérification a expiré. Voici un nouveau lien:
        {lien_verification}
        
        Ce lien est valable pendant 24 heures.
        Cordialement,
        Moussa Mohamed Erebih, administrateur système.
        
        Informations sur la confidentialité : Vos données sont stockées de manière sécurisée 
        et ne seront utilisées que pour vous fournir nos services conformément à notre 
        politique de confidentialité.
        """
        
        send_mail(
            sujet,
            message,
            settings.EMAIL_HOST_USER,
            [utilisateur.email],
            fail_silently=False,
        )

    def creer_profil_freelancer(self, utilisateur):
        # Utilisation de get_or_create pour éviter les doublons
        Freelancer.objects.get_or_create(
            utilisateur_ptr=utilisateur,
            defaults={
                'cv': None,
                'specialisation': '',
                'intitule_poste': '',
                'competences': []
            }
        )
        
class VueProfilUtilisateur(generics.RetrieveUpdateAPIView):
    queryset = Utilisateur.objects.all()
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        utilisateur = self.get_object()
        if utilisateur.type_utilisateur == 'freelancer':
            return FreelancerSerializer
        return UtilisateurSerializer
    
    def get_object(self):
        if getattr(self, 'swagger_fake_view', False):
            return User()  # Retourne un objet User factice (sans accès à la DB)
        user = self.request.user
        # Logique normale pour les requêtes réelles
        if user.type_utilisateur == 'freelancer':
            return Freelancer.objects.get(utilisateur_ptr=user)
        elif user.type_utilisateur == 'administrateur':
            return user
        return user

class VueRenvoyerEmailVerification(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {'detail': 'Email requis'},  # Changé de 'erreur' à 'detail' pour cohérence
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            utilisateur = Utilisateur.objects.get(email=email)
        except Utilisateur.DoesNotExist:
            return Response(
                {'detail': 'Aucun compte trouvé avec cet email'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if utilisateur.is_active:
            return Response(
                {'detail': 'Ce compte est déjà vérifié'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Générer un nouveau jeton
        utilisateur.jeton_verification = get_random_string(64)
        utilisateur.expiration_jeton_verification = timezone.now() + timedelta(hours=24)
        utilisateur.save()
        
        lien_verification = request.build_absolute_uri(
            reverse('verifier-email', kwargs={'jeton': utilisateur.jeton_verification})
        )
        
        sujet = "Lien de vérification"
        message = f"""
        Bonjour {utilisateur.nom_complet},
        
        Voici votre lien de vérification:
        {lien_verification}
        
        Ce lien est valable pendant 24 heures.
        """
        send_mail(
            sujet,
            message,
            settings.EMAIL_HOST_USER,
            [utilisateur.email],
            fail_silently=False,
        )
        
        return Response({
            'detail': 'Un nouveau lien de vérification a été envoyé à votre adresse email.'
        }, status=status.HTTP_200_OK)

class VueDemandeReinitialisation(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        
        if not email:
            return Response(
                {'email': ['Ce champ est requis.']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = Utilisateur.objects.get(email=email)
        except Utilisateur.DoesNotExist:
            return Response(
                {'detail': 'Si cet email existe, un lien de réinitialisation a été envoyé.'},
                status=status.HTTP_200_OK
            )
        
        # Générer un jeton de réinitialisation
        jeton = user.generer_jeton_reinitialisation()
        
        # Construire le lien de réinitialisation
        lien_reinitialisation = request.build_absolute_uri(
            reverse('reinitialiser-mot-de-passe', kwargs={'jeton': jeton})
        )
        
        # Envoyer l'email
        sujet = "Réinitialisation de votre mot de passe"
        message = f"""
        Bonjour {user.nom_complet},
        
        Vous avez demandé à réinitialiser votre mot de passe. 
        Veuillez cliquer sur le lien suivant:
        
        {lien_reinitialisation}
        
        Ce lien est valable pendant 1 heure.
        
        Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.
        """
        
        send_mail(
            sujet,
            message,
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )
        
        return Response(
            {'detail': 'Si cet email existe, un lien de réinitialisation a été envoyé.'},
            status=status.HTTP_200_OK
        )

class VueReinitialisationMotDePasse(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def get(self, request, jeton):
        """Gère la requête GET quand l'utilisateur clique sur le lien dans l'email"""
        try:
            # Vérifie que le jeton existe et n'est pas expiré
            user = Utilisateur.objects.get(
                jeton_reinitialisation=jeton,
                expiration_jeton_reinitialisation__gt=timezone.now()
            )
            
            # Redirige vers la page frontend de réinitialisation avec le jeton
            frontend_url = f"{settings.FRONTEND_URL}/mot-de-passe/reinitialiser/{jeton}"
            return redirect(frontend_url)
            
        except Utilisateur.DoesNotExist:
            # Redirige vers la page frontend avec un statut d'erreur
            frontend_url = f"{settings.FRONTEND_URL}/mot-de-passe/reinitialiser/{jeton}?status=invalid_token"
            return redirect(frontend_url)

    def post(self, request, jeton):
        """Gère la soumission du nouveau mot de passe"""
        nouveau_password = request.data.get('password')
        
        try:
            user = Utilisateur.objects.get(
                jeton_reinitialisation=jeton,
                expiration_jeton_reinitialisation__gt=timezone.now()
            )
        except Utilisateur.DoesNotExist:
            return Response(
                {'detail': 'Jeton invalide ou expiré', 'status': 'invalid_token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not nouveau_password:
            raise ValidationError(
                {'password': ['Ce champ est requis.']},
                code='password_required'
            )
        
        # Mettre à jour le mot de passe
        user.set_password(nouveau_password)
        user.jeton_reinitialisation = None
        user.expiration_jeton_reinitialisation = None
        user.save()
        
        # Envoyer une confirmation
        sujet = "Confirmation de réinitialisation de mot de passe"
        message = f"""
        Bonjour {user.nom_complet},
        
        Votre mot de passe a été modifié avec succès.
        
        Si vous n'êtes pas à l'origine de cette modification, veuillez nous contacter immédiatement.
        """
        
        send_mail(
            sujet,
            message,
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )
        
        return Response(
            {'detail': 'Mot de passe réinitialisé avec succès.', 'status': 'success'},
            status=status.HTTP_200_OK
        )
        
# Helper functions for notifications
def create_notification(utilisateur, type_notif, content_object=None):
    Notification.objects.create(
        utilisateur=utilisateur,
        type_notification=type_notif,
        content_object=content_object
    )

# Projet Views
class ProjetListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Sous-requête pour les projets avec postulation acceptée
        projets_avec_acceptation = Projet.objects.filter(
            postulations__statut='accepte'
        ).distinct()
        
        # Retourne tous les projets sauf ceux avec acceptation
        return Projet.objects.exclude(
            id__in=projets_avec_acceptation
        ).order_by('-date_creation')

    def perform_create(self, serializer):
        if self.request.user.type_utilisateur != 'client':
            raise PermissionDenied("Seuls les clients peuvent créer des projets")
        projet = serializer.save(client=self.request.user)
        create_notification(self.request.user, 'projet_publie', projet)

class ProjetDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        if self.request.user != self.get_object().client:
            raise PermissionDenied("Vous ne pouvez modifier que vos propres projets")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user != instance.client:
            raise PermissionDenied("Vous ne pouvez supprimer que vos propres projets")
        # Suppression PHYSIQUE (pas de soft delete)
        instance.delete()  # Les postulations liées seront supprimées si on_delete=CASCADE

class ProjetsUtilisateurListView(generics.ListAPIView):
    serializer_class = ProjetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = get_object_or_404(Utilisateur, pk=user_id)
        
        # Seul l'admin ou l'utilisateur lui-même peut voir ses projets
        if not (self.request.user.type_utilisateur == 'administrateur' or self.request.user.id == user.id):
            raise PermissionDenied("Vous n'avez pas la permission de voir ces projets")
        
        if user.type_utilisateur == 'client':
            return Projet.objects.filter(client=user).order_by('-date_creation')
        else:
            # Pour les freelancers, on retourne les projets où ils ont postulé
            return Projet.objects.filter(
                postulations__freelancer=user
            ).distinct().order_by('-date_creation')

class AnnulerProjetView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, projet_id):
        try:
            projet = Projet.objects.get(pk=projet_id)
        except Projet.DoesNotExist:
            return Response(
                {"detail": "Projet non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Vérifier que l'utilisateur est bien le client propriétaire du projet
        if request.user != projet.client:
            return Response(
                {"detail": "Vous n'êtes pas autorisé à annuler ce projet"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Vérifier si le projet a une postulation acceptée
        if Postulation.objects.filter(projet=projet, statut='accepte').exists():
            return Response(
                {"detail": "Vous ne pouvez plus annuler ce projet car vous avez sélectionné un freelancer"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Si pas de postulation acceptée, supprimer toutes les postulations puis le projet
        with transaction.atomic():
            # Supprimer toutes les postulations du projet
            Postulation.objects.filter(projet=projet).delete()
            
            # Supprimer le projet
            projet.delete()
        
        return Response(
            {"detail": "Projet et toutes ses postulations ont été annulés avec succès"},
            status=status.HTTP_200_OK
        )
        
class ClientProjetsAvecPostulationsView(generics.ListAPIView):
    serializer_class = None  # Nous allons utiliser une méthode personnalisée pour la sérialisation
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Récupère uniquement les projets du client connecté avec les relations nécessaires
        return Projet.objects.filter(client=self.request.user).prefetch_related(
            'postulations',
            'postulations__freelancer',
            'postulations__freelancer__evaluations'
        )

    def list(self, request, *args, **kwargs):
        projets = self.get_queryset()
        
        result = []
        for projet in projets:
            projet_data = {
                'id': projet.id,
                'titre': projet.titre,
                'description': projet.description,
                'date_creation': projet.date_creation,
                'postulations': []
            }

            for postulation in projet.postulations.all():
                freelancer = postulation.freelancer
                
                # Calcul de la moyenne des notes
                moyenne_notes = freelancer.evaluations.aggregate(
                    moyenne=Avg('note')
                )['moyenne'] or 0

                # Construction de l'URL du CV si il existe
                cv_url = None
                if freelancer.cv:
                    cv_url = request.build_absolute_uri(freelancer.cv.url)

                postulation_data = {
                    'id': postulation.id,
                    'message': postulation.message,
                    'statut': postulation.statut,
                    'date_postulation': postulation.date_postulation,
                    'freelancer': {
                        'id': freelancer.id,
                        'nom_complet': freelancer.nom_complet,
                        'email': freelancer.email,
                        'numero_telephone': freelancer.numero_telephone,
                        'photo_profil': request.build_absolute_uri(freelancer.photo_profil.url) if freelancer.photo_profil else None,
                        'cv': cv_url,  # Ajout du champ CV
                        'specialisation': freelancer.specialisation,
                        'intitule_poste': freelancer.intitule_poste,  # Ajout de l'intitulé de poste
                        'moyenne_notes': round(moyenne_notes, 1),
                        'competences': freelancer.competences
                    }
                }
                projet_data['postulations'].append(postulation_data)

            result.append(projet_data)

        return Response(result)

# Postulation Views
class PostulationCreateView(generics.CreateAPIView):
    swagger_schema = None
    serializer_class = CreatePostulationSerializer
    permission_classes = [permissions.IsAuthenticated]
    def create(self, request, *args, **kwargs):
        try:
            projet = Projet.objects.get(pk=kwargs['projet_id'])
        except Projet.DoesNotExist:
            return Response(
                {"detail": "Projet non trouvé ou non actif"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Vérification que l'utilisateur est bien un freelancer
        try:
            freelancer = Freelancer.objects.get(utilisateur_ptr=request.user)
        except Freelancer.DoesNotExist:
            return Response(
                {"detail": "Seuls les freelancers peuvent postuler à des projets"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if Postulation.objects.filter(projet=projet, freelancer=freelancer).exists():
            return Response(
                {"detail": "Vous avez déjà postulé à ce projet"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        postulation = Postulation.objects.create(
            projet=projet,
            freelancer=freelancer,  # Utilisation de l'instance Freelancer
            message=serializer.validated_data['message']
        )
        
        create_notification(projet.client, 'nouvelle_candidature', postulation)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            PostulationSerializer(postulation).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

class PostulationAcceptView(generics.UpdateAPIView):
    swagger_schema = None
    queryset = Postulation.objects.all()
    serializer_class = PostulationSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        postulation = self.get_object()
        
        # Vérification des permissions
        if request.user != postulation.projet.client:
            raise PermissionDenied("Seul le client peut accepter une postulation")
        
        # Mise à jour du statut
        postulation.statut = 'accepte'
        postulation.save()
        
        # Notification au freelancer
        Notification.objects.create(
            utilisateur=postulation.freelancer,
            type_notification='postulation_acceptee',
            content_object=postulation
        )
        
        # Emails de confirmation
        self.envoyer_emails_confirmation(postulation)
        
        return Response(
            {"detail": "Postulation acceptée avec succès"},
            status=status.HTTP_200_OK
        )

    def envoyer_emails_confirmation(self, postulation):
        # Données pour les emails
        nom_client = postulation.projet.client.nom_complet
        nom_freelancer = postulation.freelancer.nom_complet
        nom_projet = postulation.projet.titre
        client_email = postulation.projet.client.email
        freelancer_email = postulation.freelancer.email
        client_numero = postulation.projet.client.numero_telephone
        freelancer_numero = postulation.freelancer.numero_telephone

        # Email au client
        sujet_client = f"Confirmation de la sélection du freelance {nom_freelancer} pour le projet {nom_projet}"
        message_client = f"""
        Bonjour {nom_client},
🎉 Vous avez sélectionné le freelance {nom_freelancer} pour réaliser le projet : {nom_projet}

📩 Contactez-le dès maintenant via :
• Email : {freelancer_email}
• Téléphone : {freelancer_numero}

✅ Nous vous recommandons de bien expliquer vos besoins au freelancer. Une fois le projet terminé, merci de le marquer comme "terminé" dans votre espace personnel.

⚠️ En cas de fraude ou de litige, merci d'envoyer un email à moussamedwedouderebih@gmail.com avec :
• Des captures d'écran ou enregistrements audio de la conversation.
• Un résumé du problème rencontré.

📌 Après vérification, le responsable supprimera tout utilisateur impliqué dans une fraude.
        """
        send_mail(
            sujet_client,
            message_client,
            settings.EMAIL_HOST_USER,
            [client_email],
            fail_silently=False,
        )

        # Email au freelancer
        sujet_freelancer = f"Nouveau projet assigné par {nom_client} – {nom_projet}"
        message_freelancer = f"""
        Bonjour {nom_freelancer},
💼 Vous avez été sélectionné par le client {nom_client} pour travailler sur le projet : {nom_projet}

📩 Contactez-le dès que possible via :
• Email : {client_email}
• Téléphone : {client_numero}

🤝 Merci de discuter avec le client pour analyser ses besoins et commencer votre travail dans les meilleurs délais.

⚠️ En cas de comportement suspect ou de tentative de fraude, envoyez un email à moussamedwedouderebih@gmail.com avec :
• Des preuves (captures d'écran, audio, etc.)
• Une description claire du litige

📌 Après vérification, toute fraude confirmée entraînera la suppression définitive de l'utilisateur responsable.
        """
        send_mail(
            sujet_freelancer,
            message_freelancer,
            settings.EMAIL_HOST_USER,
            [freelancer_email],
            fail_silently=False,
        )

class PostulationRefuseView(generics.UpdateAPIView):
    swagger_schema = None
    queryset = Postulation.objects.all()
    serializer_class = PostulationSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        postulation = self.get_object()
        
        # Vérification des permissions
        if request.user != postulation.projet.client:
            raise PermissionDenied("Seul le client peut refuser une postulation")
        
        # Mise à jour du statut
        postulation.statut = 'refuse'
        postulation.save()
        
        # Notification au freelancer
        Notification.objects.create(
            utilisateur=postulation.freelancer,
            type_notification='postulation_refusee',
            content_object=postulation
        )
        
        return Response(
            {"detail": "Postulation refusée avec succès"},
            status=status.HTTP_200_OK
        )

# Evaluation Views
class EvaluationCreateUpdateView(generics.CreateAPIView):
    swagger_schema = None
    serializer_class = EvaluationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        freelancer = get_object_or_404(Freelancer, pk=kwargs['freelancer_id'])
        
        # Vérification que l'utilisateur est un client
        if request.user.type_utilisateur != 'client':
            raise PermissionDenied("Seuls les clients peuvent évaluer des freelancers")
        
        # Vérification que le client a un projet accepté avec ce freelancer
        postulation = Postulation.objects.filter(
            projet__client=request.user,
            freelancer=freelancer,
            statut='accepte'
        ).first()
        
        if not postulation:
            raise PermissionDenied("Vous ne pouvez évaluer que les freelancers que vous avez engagés")
        
        # Validation de la note
        note = request.data.get('note')
        if not note or not (1 <= int(note) <= 5):
            return Response(
                {"note": "Une note valide entre 1 et 5 est requise"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Création ou mise à jour de l'évaluation
        evaluation, created = Evaluation.objects.update_or_create(
            freelancer=freelancer,
            defaults={'note': note}
        )
        
        # Création de la notification
        Notification.objects.create(
            utilisateur=freelancer,
            type_notification='evaluation_recue',
            content_object=evaluation
        )
        
        return Response(
            EvaluationSerializer(evaluation).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

class FreelancerAccepteView(generics.RetrieveAPIView):
    swagger_schema = None
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, projet_id):
        projet = get_object_or_404(Projet, pk=projet_id)
        
        if request.user != projet.client:
            raise PermissionDenied("Vous ne pouvez voir que les freelancers de vos projets")
        
        postulation = Postulation.objects.filter(
            projet=projet,
            statut='accepte'
        ).first()
        
        if not postulation:
            return Response(
                {"detail": "Vous ne pouvez pas terminer un projet qui n'a pas commencer veuiller l'annuler si vous n'etes pas besoin de projet"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = FreelancerSerializer(postulation.freelancer)
        return Response(serializer.data)

# Notification Views
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Notification.objects.none()  # Retourne un queryset vide pour Swagger
        return Notification.objects.filter(
            utilisateur=self.request.user
        ).order_by('-date_creation')

class NotificationDestroyView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(utilisateur=self.request.user)

#Supprimer un projet forcement en commencant par tous ces postulations utiliser dans le processus de termination d'un projet
class ProjetDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        projet_id = self.kwargs['pk']
        projet = get_object_or_404(Projet, pk=projet_id)
        
        # Vérifier que l'utilisateur est bien le client propriétaire du projet
        if request.user != projet.client:
            return Response(
                {"detail": "Vous n'êtes pas autorisé à supprimer ce projet"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Récupérer toutes les postulations liées à ce projet
        postulations = Postulation.objects.filter(projet=projet)
        
        # Supprimer toutes les postulations
        postulations.delete()
        
        # Supprimer le projet
        projet.delete()
        
        return Response(
            {"detail": "Projet et toutes ses postulations ont été supprimés avec succès"},
            status=status.HTTP_204_NO_CONTENT
        )
        
class AdminStatisticsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            # Compter les différents types d'utilisateurs en filtrant par type_utilisateur
            clients_count = Utilisateur.objects.filter(type_utilisateur='client').count()
            freelancers_count = Utilisateur.objects.filter(type_utilisateur='freelancer').count()
            admins_count = Utilisateur.objects.filter(type_utilisateur='administrateur').count()
            
            # Compter les projets
            projects_count = Projet.objects.count()

            statistics = {
                'clients': clients_count,
                'freelancers': freelancers_count,
                'admins': admins_count,
                'projects': projects_count
            }

            return Response(statistics, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
User = get_user_model()

class ListeUtilisateursNonAdminView(APIView):
    """
    Vue qui retourne les informations de base de tous les utilisateurs sauf les administrateurs
    """
    
    def get(self, request, format=None):
        Utilisateur = get_user_model()
        
        # Récupérer tous les utilisateurs sauf les administrateurs
        utilisateurs = Utilisateur.objects.exclude(type_utilisateur='administrateur')
        
        # Préparer les données à retourner
        data = []
        for utilisateur in utilisateurs:
            # Construire l'URL de la photo de profil si elle existe
            photo_profil_url = None
            if utilisateur.photo_profil:
                photo_profil_url = request.build_absolute_uri(utilisateur.photo_profil.url)
            
            data.append({
                'id': utilisateur.id,
                'nom_complet': utilisateur.nom_complet,
                'email': utilisateur.email,
                'type_utilisateur': utilisateur.get_type_utilisateur_display(),
                'photo_profil': photo_profil_url,
                'numero_telephone': utilisateur.numero_telephone,
            })
        
        return Response(data, status=status.HTTP_200_OK)

# Initialisation du logger
logger = logging.getLogger(__name__)

class AdminUserDeleteView(APIView):
    """
    Vue réservée aux administrateurs pour supprimer un utilisateur (client ou freelancer) de force.
    Supprime également toutes les relations associées en cascade.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id, format=None):
        # Vérifier que l'utilisateur est un administrateur
        if not request.user.is_superuser and request.user.type_utilisateur != 'administrateur':
            return Response(
                {"detail": "Vous n'avez pas les permissions nécessaires pour effectuer cette action."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Récupérer l'utilisateur à supprimer
            user_to_delete = Utilisateur.objects.get(id=user_id)
            
            # Empêcher la suppression d'un autre administrateur
            if user_to_delete.type_utilisateur == 'administrateur':
                return Response(
                    {"detail": "Vous ne pouvez pas supprimer un autre administrateur."},
                    status=status.HTTP_403_FORBORBIDDEN
                )

            # Utiliser une transaction pour garantir l'intégrité de la base de données
            with transaction.atomic():
                # Supprimer l'utilisateur (cela déclenchera le CASCADE sur les relations)
                user_to_delete.delete()

            return Response(
                {"detail": f"L'utilisateur {user_to_delete.email} a été supprimé avec succès."},
                status=status.HTTP_204_NO_CONTENT
            )

        except Utilisateur.DoesNotExist:
            return Response(
                {"detail": "Utilisateur non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": f"Une erreur est survenue lors de la suppression: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )