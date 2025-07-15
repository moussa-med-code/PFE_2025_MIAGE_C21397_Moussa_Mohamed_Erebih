from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers
from .models import Utilisateur
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password', '')

        print(f"=== DEBUG BACKEND ===\nEmail reçu: {email}\nPassword reçu: {bool(password)}")  # Debug

        user = Utilisateur.objects.filter(email=email).first()
        if not user:
            print("Utilisateur non trouvé")  # Debug
            raise serializers.ValidationError("Identifiants incorrects")
        
        if not user.check_password(password):
            raise serializers.ValidationError("Identifiants incorrects")
            
        if not user.is_active:
            raise serializers.ValidationError("Compte non activé")

        refresh = self.get_token(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user_type': user.type_utilisateur,
            'user_data': {
                'id': user.id,
                'email': user.email
            }
        }

    def get_token(self, user):
        token = RefreshToken.for_user(user)
        token['type_utilisateur'] = user.type_utilisateur
        return token
      
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer