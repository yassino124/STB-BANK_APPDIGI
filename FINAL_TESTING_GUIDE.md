# 🎯 Guide de Test Final - Système de Documents

## ✅ Corrections Appliquées

### 1. API Mobile corrigée
- **Avant**: `/documents/employee/:id` (nécessite rôle RH)
- **Après**: `/documents/my` (accessible à tous les employés)
- **Fichier**: `lib/services/auth_api_service.dart`

### 2. Endpoint Génération en Masse ajouté
- **Endpoint**: `POST /api/v1/documents/generate-all-onboarding`
- **Rôles**: RH, ADMIN, SUPER_ADMIN
- **Action**: Génère les documents manquants pour tous les employés

## 🚀 Test Complet

### Étape 1: Redémarrer l'App Flutter
```bash
# Kill l'app actuelle
flutter run
# ou press 'r' dans le terminal Flutter pour hot reload
```

### Étape 2: Générer les Documents pour Tous les Employés
Via Postman ou curl:

```bash
# 1. Se connecter en tant que RH/ADMIN
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "matricule": "VOTRE_MATRICULE_RH",
    "password": "VOTRE_PASSWORD"
  }'

# Récupérer le token de la réponse

# 2. Générer les documents
curl -X POST http://localhost:3000/api/v1/documents/generate-all-onboarding \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json"
```

**Réponse attendue**:
```json
{
  "total": 2,
  "generated": 4,
  "skipped": 0
}
```

### Étape 3: Tester dans l'App Mobile

1. **Se connecter avec TEST001**:
   ```
   Matricule: TEST001
   Password: Test123!
   ```

2. **Aller dans**: RH Hub → Mes Documents

3. **Tu devrais voir**:
   - 📋 Contrat CDI
   - 🎓 Attestation d'Embauche

4. **Tester le téléchargement**:
   - Tap sur un document
   - Le PDF devrait se télécharger et s'ouvrir
   - Badge "Nouveau" devrait disparaître

### Étape 4: Tester la Génération Manuelle (Web Dashboard)

1. **Ouvrir**: http://localhost:5173/documents
2. **Se connecter en RH**
3. **Sélectionner un employé**
4. **Cliquer**: "Générer Auto"
5. **Choisir**: Attestation Travail
6. **Cliquer**: "Générer le Document"
7. **Vérifier**: Document apparaît dans la liste

## 🔍 Debug

### Si l'app mobile ne montre toujours pas les documents:

1. **Vérifier les logs backend**:
```bash
tail -f /tmp/stb-backend-restart.log | grep "documents"
```

2. **Vérifier dans MongoDB**:
```bash
cd stb-backend
node << EOF
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/stb_bank').then(async () => {
  const docs = await mongoose.connection.db.collection('employeedocuments').find({}).toArray();
  console.log('Documents in DB:', docs.length);
  docs.forEach(d => console.log(' -', d.type, 'for', d.employeeId));
  await mongoose.disconnect();
});
EOF
```

3. **Tester l'API directement**:
```bash
# Avec le token de TEST001
curl -X GET http://localhost:3000/api/v1/documents/my \
  -H "Authorization: Bearer TOKEN_TEST001"
```

## 📝 Credentials de Test

```
RH/ADMIN:
- Vérifier dans ta base de données

Employé Test:
- Matricule: TEST001
- Password: Test123!
```

## ✨ Ce qui devrait fonctionner maintenant:

- ✅ Templates initialisés automatiquement au démarrage du backend
- ✅ Endpoint `/documents/my` accessible aux employés
- ✅ Génération en masse via `/generate-all-onboarding`
- ✅ Documents générés avec tous les champs requis (filename, filePath)
- ✅ PDFs créés avec logo STB et branding
- ✅ App mobile affiche les documents correctement
- ✅ Dashboard web permet génération manuelle

**Teste maintenant! 🚀**
