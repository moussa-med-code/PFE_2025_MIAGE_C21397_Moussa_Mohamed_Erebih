from rest_framework import serializers
from .models import Utilisateur, Client, Freelancer, Administrateur
from django.core.files.base import ContentFile
import base64
from django.db import connection
from .models import Projet, Postulation, Evaluation, Notification

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = [
            'id', 'email', 'nom_complet',
            'numero_telephone', 'photo_profil',
            'type_utilisateur'
        ]
        read_only_fields = ['id', 'type_utilisateur']

class FreelancerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Freelancer
        fields = [
            'id', 'email', 'nom_complet',
            'numero_telephone', 'photo_profil',
            'type_utilisateur',
            'cv', 'specialisation',
            'intitule_poste', 'competences'
        ]

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = []

class AdministrateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Administrateur
        fields = []

class InscriptionUtilisateurSerializer(serializers.ModelSerializer):
    cv = serializers.FileField(required=False, allow_null=True)
    specialisation = serializers.CharField(required=False)
    intitule_poste = serializers.CharField(required=False)
    competences = serializers.ListField(child=serializers.CharField() , required=False)

    class Meta:
        model = Utilisateur
        fields = [
            'email', 'password', 'nom_complet',
            'numero_telephone', 'photo_profil',
            'type_utilisateur', 'cv', 'specialisation',
            'intitule_poste', 'competences'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'photo_profil': {'required': False, 'allow_null': True}
        }
    
    def create(self, validated_data):
        # Extraction des données
        cv = validated_data.pop('cv', None)
        specialisation = validated_data.pop('specialisation', '')
        intitule_poste = validated_data.pop('intitule_poste', '')
        competences = validated_data.pop('competences', [])
        photo_profil = validated_data.pop('photo_profil', None)
        password = validated_data.pop('password')
        type_utilisateur = validated_data.get('type_utilisateur', 'client')

        if type_utilisateur == 'freelancer':
            # Création directe du Freelancer
            utilisateur = Freelancer.objects.create_user(
                cv=cv,
                specialisation=specialisation,
                intitule_poste=intitule_poste,
                competences=competences,
                **validated_data,
                password=password,
                is_active=False
            )
        else:
            # Création d'un utilisateur standard
            utilisateur = Utilisateur.objects.create_user(
                **validated_data,
                password=password,
                is_active=False
            )

        # Gestion de la photo de profil
        if photo_profil:
            utilisateur.photo_profil = photo_profil
            utilisateur.save()

        return utilisateur
      
class ProjetSerializer(serializers.ModelSerializer):
    client = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Projet
        fields = [
            'id', 'client', 'titre', 'description',
            'budget_min', 'budget_max', 'deadline',
            'competences_requises', 'date_creation'
        ]
        read_only_fields = ['id', 'client', 'date_creation']

class PostulationSerializer(serializers.ModelSerializer):
    projet = ProjetSerializer(read_only=True)
    freelancer = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Postulation
        fields = [
            'id', 'projet', 'freelancer', 'message',
            'date_postulation', 'statut'
        ]
        read_only_fields = ['id', 'date_postulation', 'statut']

class CreatePostulationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Postulation
        fields = ['message']

class EvaluationSerializer(serializers.ModelSerializer):
    freelancer = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Evaluation
        fields = ['id', 'freelancer', 'note', 'date_creation', 'date_mise_a_jour']
        read_only_fields = ['id', 'date_creation', 'date_mise_a_jour']

class NotificationSerializer(serializers.ModelSerializer):
    message = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_type_notification_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'type_notification', 'type_display',
            'message', 'date_creation',
            'content_type', 'object_id'
        ]
        read_only_fields = fields

    def get_message(self, obj):
        return obj.message