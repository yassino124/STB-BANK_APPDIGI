# Fix Biométrie STB Mobile 🔐

## Problème
La biométrie (Face ID / Empreinte digitale) ne fonctionnait pas au login.

## Cause
Les permissions nécessaires manquaient dans les fichiers de configuration iOS et Android.

## Solution Appliquée ✅

### iOS - Info.plist
Ajouté la clé `NSFaceIDUsageDescription` nécessaire pour Face ID:

```xml
<key>NSFaceIDUsageDescription</key>
<string>STB utilise Face ID pour sécuriser votre accès rapide à votre compte bancaire.</string>
```

### Android - AndroidManifest.xml
Ajouté les permissions biométriques:

```xml
<!-- Permissions for Biometric Authentication (Fingerprint / Face ID) -->
<uses-permission android:name="android.permission.USE_BIOMETRIC"/>
<uses-permission android:name="android.permission.USE_FINGERPRINT"/>
```

## Comment tester

### Sur iOS (iPhone avec Face ID)
1. Désinstaller l'app actuelle: `flutter clean`
2. Rebuild: `flutter run -d <your-ios-device>`
3. Au login, cliquer sur l'icône Face ID 😊
4. iOS va demander l'autorisation Face ID (pop-up système)
5. Accepter → Face ID devrait maintenant fonctionner

### Sur Android (Samsung avec empreinte)
1. Désinstaller l'app actuelle ou rebuild: `flutter clean`
2. Rebuild: `flutter run -d <your-android-device>`
3. Au login, cliquer sur l'icône empreinte digitale 🔒
4. Poser le doigt sur le capteur
5. Devrait s'authentifier instantanément

## Fichiers modifiés
- ✅ `ios/Runner/Info.plist` (ligne 32-33)
- ✅ `android/app/src/main/AndroidManifest.xml` (lignes 2-4)

## Notes importantes
- **iOS Simulator**: Face ID fonctionne sur simulateur (Features > Face ID > Enrolled)
- **Android Emulator**: L'empreinte fonctionne via Settings > Security > Fingerprint
- Le package `local_auth: ^2.3.0` est déjà installé dans `pubspec.yaml`
- Le code de `login_screen.dart` méthode `_biometric()` ligne 142 est déjà fonctionnel

## Workflow biométrie (existant dans le code)
1. Utilisateur clique sur icône Face ID ou Fingerprint
2. `_biometric(type)` est appelée ligne 142
3. Vérifie si device a biométrie configurée: `_localAuth.getAvailableBiometrics()`
4. Lance l'authentification biométrique: `_localAuth.authenticate()`
5. Si succès → Appelle backend `AuthApiService.biometricLogin()`
6. Backend valide device UUID + type biométrique
7. Retourne accessToken → Navigation vers MainScreen

## Statut
✅ Permissions iOS configurées
✅ Permissions Android configurées
🚀 Prêt à tester sur device réel

---
**Date:** 2026-08-15
**Fichier:** BIOMETRIC_FIX.md
