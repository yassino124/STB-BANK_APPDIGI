# 🔐 Fix Biométrie - Étapes à Suivre

## Pourquoi ça ne marche toujours pas?
Les permissions dans `Info.plist` (iOS) et `AndroidManifest.xml` (Android) ont été ajoutées, **MAIS** l'app doit être **complètement rebuild** pour que ces changements prennent effet.

---

## ✅ Étapes pour Android (Samsung A336E)

### 1. **Clean complet**
```bash
cd /Users/mohamedyassineouertani/Downloads/stb_mobile
flutter clean
```

### 2. **Supprimer l'app du téléphone**
Sur ton Samsung:
- Settings > Apps > STB App > Uninstall
- OU maintenir l'icône de l'app > Désinstaller

### 3. **Rebuild et install**
```bash
flutter run -d <device-id>
```

Pour trouver ton device ID:
```bash
flutter devices
```

### 4. **Tester la biométrie**
1. Ouvrir l'app STB
2. Sur l'écran login, cliquer sur l'icône **empreinte digitale** 👆
3. Android va afficher popup: "Allow STB to use fingerprint?"
4. Cliquer **Allow** / **Autoriser**
5. Poser ton doigt sur le capteur
6. ✅ Devrait fonctionner!

---

## ✅ Étapes pour iOS (iPhone/Simulateur)

### 1. **Clean complet**
```bash
cd /Users/mohamedyassineouertani/Downloads/stb_mobile
flutter clean
```

### 2. **Rebuild iOS**
```bash
# Pour simulateur
flutter run -d "iPhone 15 Pro"

# Pour iPhone physique
flutter run -d <device-id>
```

### 3. **Tester Face ID**
1. Ouvrir l'app STB
2. Sur l'écran login, cliquer sur l'icône **Face ID** 😊
3. iOS va afficher popup: "Allow STB to use Face ID?"
4. Cliquer **OK**
5. Face ID va scanner (ou simuler sur simulateur)
6. ✅ Devrait fonctionner!

**Sur simulateur iOS:**
- Features > Face ID > Enrolled (pour activer Face ID)
- Features > Face ID > Matching Face (pour simuler succès)

---

## 🔍 Diagnostic si ça ne marche toujours pas

### Vérifier les permissions (après rebuild)

#### Android:
```bash
# Vérifier que les permissions sont dans l'APK
unzip -p build/app/outputs/flutter-apk/app-debug.apk AndroidManifest.xml | grep -i biometric
```

Devrait afficher:
```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC"/>
<uses-permission android:name="android.permission.USE_FINGERPRINT"/>
```

#### iOS:
```bash
# Vérifier Info.plist
cat ios/Runner/Info.plist | grep -A1 "NSFaceIDUsageDescription"
```

Devrait afficher:
```xml
<key>NSFaceIDUsageDescription</key>
<string>STB utilise Face ID pour sécuriser votre accès rapide à votre compte bancaire.</string>
```

---

## ⚠️ Erreurs Possibles et Solutions

### Erreur: "Aucune biométrie configurée sur cet appareil"
**Cause:** Le device n'a pas Face ID/Empreinte configurée

**Solution Android:**
1. Settings > Security > Fingerprint
2. Ajouter au moins une empreinte

**Solution iOS:**
1. Settings > Face ID & Passcode
2. Configurer Face ID
3. Sur simulateur: Features > Face ID > Enrolled

---

### Erreur: "Authentification biométrique annulée ou échouée"
**Cause:** User a cliqué Cancel ou biométrie pas reconnue

**Solution:** 
- Réessayer
- Vérifier que le doigt/visage est enregistré dans le device

---

### Erreur: "Appareil non reconnu. Veuillez utiliser votre mot de passe"
**Cause:** Backend ne reconnaît pas le deviceUUID

**Solution:**
1. Se connecter d'abord avec **mot de passe**
2. Lors du premier login, l'app propose "Activer la biométrie?" → Cliquer **Activer**
3. Le device est maintenant enregistré dans MongoDB
4. La prochaine fois, la biométrie fonctionnera

---

## 🧪 Test Complet (Checklist)

### Préparation
- [ ] `flutter clean` exécuté
- [ ] App désinstallée du device
- [ ] Device a biométrie configurée (Settings)

### Installation
- [ ] `flutter run` terminé avec succès
- [ ] App installée sur device
- [ ] Permissions demandées lors du premier login

### Test Biométrie
- [ ] Login avec **mot de passe** une première fois
- [ ] Popup "Activer la biométrie?" → Cliquer **Activer**
- [ ] Se déconnecter
- [ ] Sur login screen, cliquer icône biométrie
- [ ] Popup permission system → Accepter
- [ ] Scanner biométrie
- [ ] ✅ Login réussi = BIOMÉTRIE FONCTIONNE!

---

## 📱 Commande Rapide (Copy-Paste)

```bash
# ANDROID - Rebuild complet
cd /Users/mohamedyassineouertani/Downloads/stb_mobile
flutter clean
flutter pub get
flutter run

# iOS - Rebuild complet  
cd /Users/mohamedyassineouertani/Downloads/stb_mobile
flutter clean
flutter pub get
cd ios && pod install && cd ..
flutter run
```

---

## 🎯 Résumé Ultra-Rapide

1. **flutter clean**
2. **Désinstaller l'app du téléphone**
3. **flutter run** (rebuild)
4. **Tester**: Login password → Activer biométrie → Logout → Login biométrie

---

## 📄 Fichiers Modifiés (Déjà fait ✅)

- ✅ `ios/Runner/Info.plist` - NSFaceIDUsageDescription ajoutée
- ✅ `android/app/src/main/AndroidManifest.xml` - Permissions USE_BIOMETRIC ajoutées
- ✅ `lib/screens/auth/login_screen.dart` - Code biométrie déjà fonctionnel (ligne 142)

**Il ne reste plus qu'à rebuild!**

---

**Date:** 2026-08-15  
**Status:** Permissions OK ✅ - Rebuild Nécessaire 🔄
