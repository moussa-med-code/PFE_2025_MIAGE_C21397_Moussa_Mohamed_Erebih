from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Utilisateur, Client, Freelancer, Administrateur, Projet, Postulation, Evaluation, Notification

class UtilisateurAdmin(UserAdmin):
    list_display = ('email', 'nom_complet', 'type_utilisateur', 'is_active', 'is_staff', 'date_creation')
    list_filter = ('type_utilisateur', 'is_active', 'is_staff')
    search_fields = ('email', 'nom_complet', 'numero_telephone')
    ordering = ('-date_creation',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations personnelles', {'fields': ('nom_complet', 'numero_telephone', 'photo_profil')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'type_utilisateur', 'groups', 'user_permissions'),
        }),
        ('Dates importantes', {'fields': ('last_login', 'date_creation')}),
        ('Jetons', {
            'fields': ('jeton_verification', 'expiration_jeton_verification', 
                      'jeton_reinitialisation', 'expiration_jeton_reinitialisation'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nom_complet', 'numero_telephone', 'password1', 'password2', 'type_utilisateur'),
        }),
    )

class ClientAdmin(admin.ModelAdmin):
    list_display = ('email', 'nom_complet', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('email', 'nom_complet')
    ordering = ('-date_creation',)
    
    def get_queryset(self, request):
        return self.model.objects.filter(type_utilisateur='client')

class FreelancerAdmin(admin.ModelAdmin):
    list_display = ('email', 'nom_complet', 'specialisation', 'is_active')
    list_filter = ('is_active', 'specialisation')
    search_fields = ('email', 'nom_complet', 'specialisation', 'intitule_poste')
    ordering = ('-date_creation',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations personnelles', {'fields': ('nom_complet', 'numero_telephone', 'photo_profil')}),
        ('Informations professionnelles', {
            'fields': ('cv', 'specialisation', 'intitule_poste', 'competences'),
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
    )
    
    def get_queryset(self, request):
        return self.model.objects.filter(type_utilisateur='freelancer')

class AdministrateurAdmin(admin.ModelAdmin):
    list_display = ('email', 'nom_complet', 'is_active', 'is_staff')
    list_filter = ('is_active', 'is_staff')
    search_fields = ('email', 'nom_complet')
    ordering = ('-date_creation',)
    
    def get_queryset(self, request):
        return self.model.objects.filter(type_utilisateur='administrateur')

class ProjetAdmin(admin.ModelAdmin):
    list_display = ('titre', 'client', 'budget_min', 'budget_max', 'deadline', 'date_creation')
    list_filter = ('client', 'deadline')
    search_fields = ('titre', 'description', 'client__nom_complet')
    raw_id_fields = ('client',)
    date_hierarchy = 'date_creation'
    ordering = ('-date_creation',)

class PostulationAdmin(admin.ModelAdmin):
    list_display = ('projet', 'freelancer', 'statut', 'date_postulation')
    list_filter = ('statut', 'date_postulation')
    search_fields = ('projet_titre', 'freelancer_nom_complet')
    raw_id_fields = ('projet', 'freelancer')
    date_hierarchy = 'date_postulation'
    ordering = ('-date_postulation',)

class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('freelancer', 'note', 'date_creation', 'date_mise_a_jour')
    list_filter = ('note', 'date_creation')
    search_fields = ('freelancer__nom_complet',)
    raw_id_fields = ('freelancer',)
    date_hierarchy = 'date_creation'
    ordering = ('-date_creation',)

class NotificationAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'type_notification', 'date_creation')
    list_filter = ('type_notification', 'date_creation')
    search_fields = ('utilisateur__nom_complet', 'type_notification')
    raw_id_fields = ('utilisateur',)
    date_hierarchy = 'date_creation'
    ordering = ('-date_creation',)

# Enregistrement des modèles
admin.site.register(Utilisateur, UtilisateurAdmin)
admin.site.register(Client, ClientAdmin)
admin.site.register(Freelancer, FreelancerAdmin)
admin.site.register(Administrateur, AdministrateurAdmin)
admin.site.register(Projet, ProjetAdmin)
admin.site.register(Postulation, PostulationAdmin)
admin.site.register(Evaluation, EvaluationAdmin)
admin.site.register(Notification, NotificationAdmin)