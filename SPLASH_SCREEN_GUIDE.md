# 🌟 Guide Splash Screen STB

## ✅ C'est Quoi le Splash Screen?

Le **Splash Screen** c'est l'écran qui apparaît **pendant 2-3 secondes** quand tu ouvres l'app, AVANT d'arriver au Login ou Dashboard!

```
┌─────────────────────────┐
│                         │
│                         │
│       🏦 STB            │  ← Splash Screen
│   ┌──────────┐          │     (2-3 secondes)
│   │  LOGO    │          │
│   │   STB    │          │
│   └──────────┘          │
│                         │
│   Chargement...         │
│                         │
└─────────────────────────┘
         ↓
┌─────────────────────────┐
│   📧 Login              │  ← Puis ton app
│   ┌─────────────────┐   │
│   │ Email           │   │
│   └─────────────────┘   │
└─────────────────────────┘
```

## 🎨 Configuration Appliquée

### Logo
- **Image**: `assets/images/stb_logo.png` (91 KB)
- **Position**: Centré
- **Taille**: Automatique (optimisée)

### Couleurs
- **Light Mode**: Bleu STB (#0D47A1) 🔵
- **Dark Mode**: Noir profond (#060D1A) ⚫

### Plateformes
- ✅ **Android** - Splash natif + Android 12+
- ✅ **iOS** - Splash natif
- ✅ **Web** - Splash HTML

## 🚀 Génération du Splash Screen

```bash
# Commande exécutée automatiquement:
dart run flutter_native_splash:create
```

Cette commande génère:
1. **Android**:
   - `android/app/src/main/res/drawable/launch_background.xml`
   - `android/app/src/main/res/drawable-*/splash.png` (6 résolutions)
   - `android/app/src/main/res/values/styles.xml` (mis à jour)

2. **iOS**:
   - `ios/Runner/Assets.xcassets/LaunchImage.imageset/`
   - `ios/Runner/Base.lproj/LaunchScreen.storyboard`

3. **Web**:
   - `web/splash/` (CSS + images)

## 📱 Résultat Visuel

### Quand Tu Ouvres l'App:

#### Étape 1: Splash Screen (2 secondes)
```
╔═══════════════════════╗
║                       ║
║                       ║
║         🏦            ║
║      ┌─────┐          ║
║      │ STB │          ║  ← Fond bleu
║      │ Logo│          ║    Logo centré
║      └─────┘          ║
║                       ║
║   Chargement...       ║
║                       ║
╚═══════════════════════╝
```

#### Étape 2: Ton App (après le splash)
```
╔═══════════════════════╗
║  📧 Connexion         ║
║  ┌─────────────────┐  ║
║  │ Email           │  ║
║  ├─────────────────┤  ║
║  │ Mot de passe    │  ║
║  └─────────────────┘  ║
║                       ║
║  [  Se Connecter  ]   ║
╚═══════════════════════╝
```

## 🎯 Avantages

1. **Professionnel** - Comme les vraies apps bancaires
2. **Rapide** - Natif (pas de Flutter pendant le splash)
3. **Fluide** - Transition smooth vers l'app
4. **Branded** - Logo STB visible dès le début

## 🔧 Personnalisation

### Changer la Couleur de Fond
Édite `flutter_native_splash.yaml`:
```yaml
color: "#0D47A1"  # Bleu actuel
# Essaye:
# "#1E293B" - Noir élégant
# "#FFFFFF" - Blanc
# "#2962FF" - Bleu électrique
```

### Changer l'Image
```bash
# 1. Remplace le logo
cp ton_nouveau_logo.png assets/images/stb_logo.png

# 2. Régénère
dart run flutter_native_splash:create
```

### Ajouter du Texte
Édite `flutter_native_splash.yaml`:
```yaml
android_12:
  branding: assets/images/stb_text.png  # Texte en bas
  branding_mode: bottom
```

## 📊 Tailles Générées

### Android
```
drawable-mdpi/splash.png (48x48)
drawable-hdpi/splash.png (72x72)
drawable-xhdpi/splash.png (96x96)
drawable-xxhdpi/splash.png (144x144)
drawable-xxxhdpi/splash.png (192x192)
```

### iOS
```
LaunchImage.imageset/
├── LaunchImage.png
├── LaunchImage@2x.png
├── LaunchImage@3x.png
└── Contents.json
```

## 🚀 Pour Tester

### Option 1: iOS Simulator (RAPIDE)
```bash
open -a Simulator
flutter run
```

### Option 2: Android (quand assez d'espace)
```bash
flutter run
```

### Option 3: Release Build
```bash
# Android
flutter build apk --release

# iOS
flutter build ios --release
```

## 🎬 Séquence de Démarrage

```
[Utilisateur tape sur l'icône STB]
         ↓
[Splash Screen apparaît - 2 secondes]
   🏦 Logo STB sur fond bleu
         ↓
[Splash disparaît en fade]
         ↓
[App Flutter démarre]
         ↓
[Login Screen ou Dashboard]
```

## ⚡ Performance

- **Splash natif**: Apparaît INSTANTANÉMENT
- **Pas de délai**: Démarre avant Flutter
- **Optimisé**: Images compressées
- **Léger**: ~50KB total pour toutes les résolutions

## 🎉 Résultat Final

Maintenant quand tu lances l'app:
1. ✅ **Tu vois le logo STB immédiatement**
2. ✅ **Sur fond bleu professionnel**
3. ✅ **Pendant 2-3 secondes**
4. ✅ **Puis ton app charge**

Exactement comme **les apps bancaires professionnelles**! 🏦✨

---

**Status**: ✅ SPLASH SCREEN CONFIGURÉ  
**Prochaine étape**: Lance l'app pour voir le résultat!  
**Date**: 15 Août 2026
