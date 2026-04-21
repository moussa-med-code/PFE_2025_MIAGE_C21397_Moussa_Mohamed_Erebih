# Plateforme de Mise en Relation Freelancers & Clients - PFE 2025

Cette application web est une plateforme complète de mise en relation entre clients et freelancers, développée dans le cadre d'un Projet de Fin d'Études (PFE) pour la Licence MIAGE en 2025. Elle permet aux clients de publier des missions et aux freelancers de proposer leurs services, le tout supervisé par un administrateur.

## 🚀 Fonctionnalités Clés

### 👥 Gestion des Utilisateurs
- **Multi-rôles** : Espaces distincts pour Clients, Freelancers et Administrateurs.
- **Sécurité** : Authentification par JWT, vérification de compte par email et réinitialisation de mot de passe sécurisée.
- **Profils** : Gestion complète des informations personnelles, photos de profil et CV (pour les freelancers).

### 💼 Gestion des Projets
- **Publication** : Les clients peuvent poster des projets avec budget, deadline et compétences requises.
- **Postulation** : Les freelancers peuvent parcourir les offres et envoyer des candidatures motivées.
- **Sélection** : Les clients gèrent les candidatures (accepter/refuser) avec échange automatique de coordonnées par email.
- **Évaluation** : Système de notation des freelancers à la fin de chaque mission.

### 🔔 Système de Notifications
- Alertes en temps réel sur l'interface.
- Emails automatiques lors de la publication d'un projet, de la réception d'une candidature ou d'une sélection.

### 🛠️ Administration
- Tableau de bord avec statistiques globales.
- Gestion (visualisation et suppression) des comptes utilisateurs.

## 🛠️ Stack Technique

### Backend
- **Framework** : Django 5.2 & Django REST Framework (DRF).
- **Base de données** : PostgreSQL.
- **Sécurité** : SimpleJWT, Throttling (limitation de débit), Validation de fichiers.
- **Documentation** : Swagger et ReDoc intégrés.

### Frontend
- **Framework** : React 19 (Vite).
- **UI Libraries** : Material UI (MUI) & Ant Design.
- **Gestion d'état & Routage** : React Router DOM, Axios.

## ⚙️ Installation

### Prérequis
- Python 3.10+
- Node.js 18+
- PostgreSQL

### Configuration du Backend
1. Accédez au dossier : `cd PFE-backend`
2. Créez un environnement virtuel : `python -m venv venv`
3. Activez-le : `venv\Scripts\activate` (Windows) ou `source venv/bin/activate` (Linux/Mac)
4. Installez les dépendances : `pip install -r requirements.txt`
5. Configurez le fichier `.env` dans `PFE-backend/secureapi/` avec :
   - Informations de connexion PostgreSQL (`DB_NAME`, `DB_USER`, etc.)
   - Configuration SMTP Gmail pour les envois d'emails.
6. Appliquez les migrations : `python manage.py migrate`
7. Lancez le serveur : `python manage.py runserver`

### Configuration du Frontend
1. Accédez au dossier : `cd PFE-frontend`
2. Installez les dépendances : `npm install`
3. Configurez le fichier `.env` avec `VITE_BACKEND_URL=http://localhost:8000`
4. Lancez l'application : `npm run dev`

## 📂 Structure du Dépôt
- `/PFE-backend` : Code source Django.
- `/PFE-frontend` : Code source React.
- `/Rapport_PFE.pdf` : Rapport complet du projet.
- `/Présentation_du_Rapport_PFE.pptx` : Support de présentation.

---
**Développé par Moussa Mohamed Erebih** (2025)
