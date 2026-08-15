# 🎨 Guide Configuration Logo STB

## ✅ Ce Qui a Été Fait

### 1. Logo Copié
```bash
Source: public/logo for splash.png (93 KB)
Destination: assets/images/stb_logo.png
```

### 2. Package Installé
- ✅ `flutter_launcher_icons` ajouté comme dev dependency
- Ce package génère automatiquement toutes les tailles d'icônes nécessaires

### 3. Fichier de Configuration Créé
- ✅ `flutter_launcher_icons.yaml` configuré
- Icône Android: Adaptive Icon avec fond bleu STB (#0D47A1)
- Icône iOS: Logo transparent optimisé

### 4. Génération des Icônes
```bash
flutter pub run flutter_launcher_icons
```

Cela génère automatiquement:
- **Android**: 
  - `mipmap-hdpi/ic_launcher.png` (72x72)
  - `mipmap-mdpi/ic_launcher.png` (48x48)
  - `mipmap-xhdpi/ic_launcher.png` (96x96)
  - `mipmap-xxhdpi/ic_launcher.png` (144x144)
  - `mipmap-xxxhdpi/ic_launcher.png` (192x192)
  - Adaptive icons (background + foreground)

- **iOS**:
  - `AppIcon.appiconset` avec toutes les tailles requises

## 🎯 Résultat

Sur ton téléphone, tu verras:
```
┌──────────────┐
│   🏦 STB     │  ← Logo avec fond bleu royal
│              │
│  Société     │
│  Tunisienne  │
│  de Banque   │
└──────────────┘
```

## 📱 Pour Voir le Logo sur le Téléphone

### Option 1: Build et Install
```bash
# Android
flutter build apk
flutter install

# iOS
flutter build ios
```

### Option 2: Run Direct (si assez d'espace)
```bash
flutter run
```

## 🎨 Personnalisation du Logo

Si tu veux changer les couleurs ou le style:

### 1. Changer la Couleur de Fond (Android)
Édite `flutter_launcher_icons.yaml`:
```yaml
adaptive_icon_background: "#0D47A1"  # Bleu STB actuel
# Essayer d'autres couleurs:
# "#FFFFFF" - Blanc
# "#1E293B" - Noir élégant
# "#2962FF" - Bleu électrique
```

### 2. Utiliser un Autre Logo
Remplace simplement:
```bash
cp ton_nouveau_logo.png assets/images/stb_logo.png
flutter pub run flutter_launcher_icons
```

## 📊 Spécifications Techniques

### Logo Source
- **Format**: PNG avec transparence
- **Taille recommandée**: 1024x1024 px minimum
- **Ton logo actuel**: 93 KB (excellente qualité!)

### Icônes Générées
- Android: Adaptive icons (API 26+) + legacy icons
- iOS: Toutes les tailles d'AppIcon requises
- Formats: PNG optimisés

## 🚀 Prochaines Étapes

1. ✅ Logo copié
2. ✅ Configuration créée
3. ⏳ Exécuter: `flutter pub run flutter_launcher_icons`
4. ⏳ Builder l'app
5. ⏳ Installer sur le téléphone
6. 🎉 Profiter du nouveau logo!

## ⚠️ Note Important

L'erreur "not enough space" sur ton Samsung A336E empêche l'installation.

**Solutions**:
1. Libère au moins 500 MB sur le téléphone
2. Désinstalle l'ancienne version de STB App
3. Utilise `flutter build apk --split-per-abi` pour un APK plus petit

---

**Créé le**: 15 Août 2026  
**Logo STB**: Société Tunisienne de Banque 🏦  
**Status**: ✅ Configuration prête, en attente d'installation
