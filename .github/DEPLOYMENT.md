# Stratégie de Déploiement - AuroreIA Landing

## 📋 Vue d'ensemble

Ce projet utilise une stratégie de déploiement à 2 environnements avec Docker et GitHub Actions.

## 🏷️ Stratégie de Tagging Docker

### Production (branche `main`)
```
latest                      # Toujours la dernière version en production
prod                        # Tag stable production
prod-{sha}                  # Version spécifique (ex: prod-abc123f)
prod-{run_number}           # Numéro de build (ex: prod-42)
```

### Staging (branche `staging`)
```
staging                     # Dernière version staging
staging-{sha}               # Version spécifique
staging-{run_number}        # Numéro de build
```

## 🚀 Workflow de Déploiement

### 1. Développement
- Créer une branche feature depuis `main`
- Développer et tester localement
- Créer une Pull Request vers `staging`

### 2. Staging (Tests et validation)
```bash
git checkout staging
git merge feature/ma-fonctionnalité
git push origin staging
```
→ Déclenche automatiquement le déploiement sur l'environnement de staging
→ Tester et valider la fonctionnalité

### 3. Production (après validation OK)
```bash
git checkout main
git merge staging
git push origin main
```
→ Déclenche automatiquement le déploiement en production

## 🔄 Rollback en cas de problème

### Méthode 1 : Utiliser un tag spécifique
```bash
# Sur le serveur VPS
cd auroreia/landing/production/

# Modifier docker-compose.yml pour utiliser un tag spécifique
# image: username/auroreia-landing:prod-123

# Relancer
docker compose -p auroreia-landing-prod down
docker compose -p auroreia-landing-prod pull
docker compose -p auroreia-landing-prod up -d
```

### Méthode 2 : Revert Git
```bash
# Identifier le commit à annuler
git log --oneline

# Créer un commit de revert
git revert abc123f

# Pousser (déclenche un nouveau déploiement)
git push origin main
```

## 📦 Images Docker disponibles

Sur Docker Hub : `username/auroreia-landing`

Exemples d'images :
```
username/auroreia-landing:latest
username/auroreia-landing:prod
username/auroreia-landing:prod-a1b2c3d
username/auroreia-landing:prod-42
username/auroreia-landing:staging
username/auroreia-landing:staging-a1b2c3d
username/auroreia-landing:staging-42
```

## 🗂️ Structure des dossiers sur le VPS

```
auroreia/landing/
├── production/         # Environnement de production
│   ├── docker-compose.yml
│   └── .env
└── staging/           # Environnement de staging
    ├── docker-compose.yml
    └── .env
```

## 🔍 Commandes utiles

### Vérifier les images disponibles localement
```bash
docker images | grep auroreia-landing
```

### Voir les conteneurs en cours d'exécution
```bash
docker compose -p auroreia-landing-prod ps
docker compose -p auroreia-landing-staging ps
```

### Voir les logs
```bash
docker compose -p auroreia-landing-prod logs -f
```

### Nettoyer les anciennes images
```bash
docker image prune -f
```

## ⚠️ Bonnes pratiques

1. ✅ **Toujours tester en staging avant production**
2. ✅ **Ne jamais pusher directement sur `main`**
3. ✅ **Garder un historique des versions déployées**
4. ✅ **Tester les rollbacks régulièrement**
5. ❌ **Ne jamais supprimer le tag `latest` en production**
6. ❌ **Ne jamais utiliser `--force` sur les branches protégées**

## 📊 Exemple de cycle complet

```bash
# 1. Développement
git checkout -b feature/nouvelle-fonctionnalité
# ... développement ...
git commit -m "feat: ajout nouvelle fonctionnalité"

# 2. Test et validation en staging
git checkout staging
git merge feature/nouvelle-fonctionnalité
git push origin staging
# → Déploiement automatique sur staging
# → Tester et valider la fonctionnalité

# 3. Mise en production (après validation OK)
git checkout main
git merge staging
git push origin main
# → Déploiement automatique en production
```

## 🔐 Secrets GitHub requis

Les secrets suivants doivent être configurés dans GitHub :
- `DOCKERHUB_USERNAME` : Nom d'utilisateur Docker Hub
- `DOCKERHUB_PASSWORD` : Mot de passe ou token Docker Hub
- `VPS_HOST` : IP ou domaine du serveur VPS
- `VPS_USER` : Utilisateur SSH
- `VPS_SSH_PRIVATE_KEY` : Clé privée SSH
- `VPS_PORT` : Port SSH (généralement 22)
