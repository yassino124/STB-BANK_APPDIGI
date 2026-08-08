# 🧪 Guide de Test - Système de Documents

## 1️⃣ Initialiser les Templates (Une seule fois)

### Backend Doit Être Démarré
```bash
cd stb-backend
npm run start:dev
```

### Initialiser les Templates
```bash
curl -X POST http://localhost:3000/api/v1/documents/init-templates \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Résultat attendu**:
```json
{
  "message": "Templates initialized successfully",
  "count": 3
}
```

## 2️⃣ Tester la Génération Automatique

### Créer un Nouvel Employé (Web Dashboard)
1. Se connecter en tant que **RH**
2. Aller sur **Employés** → **Nouveau**
3. Remplir le formulaire:
   ```
   Prénom: Mohamed
   Nom: Ouertani
   Matricule: STB2026001
   Email: m.ouertani@stb.com.tn
   Poste: Ingénieur IT
   Direction: IT
   Agence: Ariana
   Salaire Base: 2500.000
   ```
4. Cliquer **Créer**

### Vérifier les Logs Backend
Dans le terminal backend, vous devriez voir:
```
[EventListener] employee.created event received
[DocumentGenerator] Generating documents for employee STB2026001
[DocumentGenerator] Generated: CONTRAT_CDI
[DocumentGenerator] Generated: ATTESTATION_EMBAUCHE
```

### Vérifier les Documents Créés
```bash
curl -X GET "http://localhost:3000/api/v1/documents/employee/EMPLOYEE_ID" \
  -H "Authorization: Bearer YOUR_RH_TOKEN"
```

**Résultat attendu**:
```json
[
  {
    "_id": "...",
    "employeeId": "...",
    "templateType": "CONTRAT_CDI",
    "generatedAt": "2026-07-24T...",
    "pdfPath": "/uploads/documents/CONTRAT_CDI_STB2026001_1721836800000.pdf",
    "status": "GENERATED"
  },
  {
    "_id": "...",
    "employeeId": "...",
    "templateType": "ATTESTATION_EMBAUCHE",
    "generatedAt": "2026-07-24T...",
    "pdfPath": "/uploads/documents/ATTESTATION_EMBAUCHE_STB2026001_1721836800000.pdf",
    "status": "GENERATED"
  }
]
```

## 3️⃣ Tester la Génération Manuelle (Web)

### Dans le Dashboard RH
1. Aller sur **Documents**
2. Sélectionner un employé dans la liste de gauche
3. Cliquer sur **"Générer Auto"** (bouton violet)
4. Choisir un type de document (ex: Attestation Travail)
5. Cliquer **"Générer le Document"**

### Résultat Attendu
- Modal se ferme
- Toast de succès: "Document généré avec succès !"
- Nouveau document apparaît dans la liste
- Document est téléchargeable immédiatement

## 4️⃣ Tester le Téléchargement (Web)

### Dans la Liste de Documents
1. Trouver un document auto-généré
2. Cliquer sur **"Télécharger"**
3. Le PDF devrait s'ouvrir dans un nouvel onglet

### Vérifier le Contenu PDF
Le PDF devrait contenir:
- ✅ Logo STB en haut
- ✅ Couleurs STB (bleu électrique)
- ✅ Informations de l'employé (nom, prénom, matricule, poste)
- ✅ Date de génération
- ✅ Texte professionnel et formaté

## 5️⃣ Tester l'App Mobile

### Lancer l'App Flutter
```bash
cd stb_mobile
flutter run
```

### Test Complet Mobile
1. Se connecter avec un compte **Employé**
2. Aller dans **RH Hub** → **Mes Documents**
3. Vérifier que les documents apparaissent
4. Taper sur un document
5. Le PDF devrait se télécharger et s'ouvrir automatiquement
6. Badge "Nouveau" devrait disparaître après lecture

### Test des Filtres
1. Cliquer sur les chips de filtres en haut
2. Vérifier que la liste se filtre correctement
3. "Tous" devrait montrer tous les documents
4. Chaque type devrait montrer le bon badge de comptage

## 6️⃣ Tester les Types de Documents

### Types à Tester (Génération Manuelle)
Essayer de générer chaque type depuis le dashboard RH:

- [ ] CONTRAT_CDI
- [ ] CONTRAT_CDD
- [ ] ATTESTATION_EMBAUCHE
- [ ] ATTESTATION_TRAVAIL
- [ ] ATTESTATION_SALAIRE
- [ ] FICHE_PAIE
- [ ] AUTORISATION_CONGE
- [ ] DECISION_PRIME
- [ ] CONTRAT_CREDIT
- [ ] AVENANT_CONTRAT
- [ ] DECISION_PROMOTION
- [ ] DECISION_MUTATION

### Pour Chaque Type
- ✅ Génération réussie (pas d'erreur)
- ✅ PDF contient le bon contenu
- ✅ Icône correcte dans la liste
- ✅ Label correct affiché
- ✅ Téléchargeable sur web et mobile

## 🐛 Résolution de Problèmes

### Erreur: "Templates not initialized"
**Solution**: Exécuter la commande d'initialisation des templates (étape 1)

### Erreur: "Logo file not found"
**Solution**: Vérifier que `/public/logo for splash.png` existe dans stb-backend

### PDF Vide ou Corrompu
**Solution**: 
1. Vérifier les logs backend pour les erreurs pdfkit
2. S'assurer que le package `pdfkit` est installé: `npm install pdfkit`
3. Vérifier les permissions du dossier `/uploads/documents/`

### Documents ne s'affichent pas sur mobile
**Solution**:
1. Vérifier que l'API backend est accessible depuis le device
2. Sur Android Emulator: backend doit être sur `10.0.2.2:3000`
3. Sur iOS Simulator: backend doit être sur `127.0.0.1:3000`
4. Sur Device Réel: utiliser l'IP locale (ex: `192.168.1.100:3000`)

### Téléchargement échoue sur mobile
**Solution**:
1. Vérifier les permissions de stockage (Android)
2. Vérifier que le package `open_file` est installé
3. Tester avec un document simple d'abord

## ✅ Checklist de Validation Complète

### Backend
- [ ] Templates initialisés avec succès
- [ ] Documents auto-générés à la création d'employé
- [ ] PDFs stockés dans `/uploads/documents/`
- [ ] Endpoint `/documents/generate` fonctionne
- [ ] Endpoint `/documents/:id/download` retourne le PDF
- [ ] Logo STB chargé correctement

### Web Dashboard
- [ ] Page Documents charge la liste d'employés
- [ ] Sélection d'employé affiche ses documents
- [ ] Bouton "Générer Auto" ouvre le modal
- [ ] Génération manuelle réussie
- [ ] Téléchargement de PDF fonctionne
- [ ] Suppression de document fonctionne
- [ ] Design responsive et fluide

### Mobile App
- [ ] Page "Mes Documents" charge la liste
- [ ] Tous les types de documents affichés correctement
- [ ] Filtres fonctionnent
- [ ] Badge "Nouveau" s'affiche
- [ ] Téléchargement ouvre le PDF
- [ ] Badge "Nouveau" disparaît après lecture
- [ ] Animations fluides

## 🎯 Critères de Succès

Le système est considéré comme **prêt pour production** si:

1. ✅ **Auto-génération fonctionne** - Créer un employé génère automatiquement 2 documents
2. ✅ **Génération manuelle fonctionne** - RH peut générer n'importe quel type de document
3. ✅ **PDFs valides** - Tous les PDFs s'ouvrent correctement avec logo et contenu
4. ✅ **Mobile synchronisé** - Employé voit ses documents sur l'app dans les 5 secondes
5. ✅ **Performance OK** - Génération d'un document < 2 secondes
6. ✅ **UX fluide** - Aucun bug visuel, animations smooth, pas de crash
7. ✅ **Compatibilité** - Fonctionne sur iOS et Android

## 📊 Métriques de Performance

À surveiller:
- **Temps de génération PDF**: < 2s
- **Taille moyenne PDF**: 50-200 KB
- **Temps de téléchargement mobile**: < 3s (4G)
- **Temps de chargement liste**: < 1s

**Tout est prêt pour les tests! 🚀**
