# 🔐 Biométrie Toggle Feature

## ✅ Ce qui a été ajouté

### 1. Toggle dans Profile Settings
**Localisation:** Profil > Sécurité > Biométrie

**Fonctionnalité:**
- Toggle ON/OFF pour activer/désactiver la biométrie
- État visible en temps réel (Activée ✓ / Désactivée)
- Check icon vert si activée, gray si désactivée

**Fichiers modifiés:**
- `lib/screens/profile/profile_screen.dart` (ligne 17-38, 271-290)

### 2. Login Screen Conditionnel
**Comportement:**
- Si biométrie **ACTIVÉE** → Icônes Face ID + Empreinte visibles au login
- Si biométrie **DÉSACTIVÉE** → Icônes cachées, login par password uniquement

**Fichiers modifiés:**
- `lib/screens/auth/login_screen.dart` (ligne 33-50, 445-449)

---

## 🎯 Workflow Utilisateur

### Activer la Biométrie
1. Ouvrir l'app → **Profil**
2. Section **Sécurité** → Cliquer **Biométrie**
3. Toggle **OFF → ON**
4. Popup système demande authentification biométrique
5. Scanner Face ID ou Empreinte
6. ✅ Biométrie **Activée**
7. Logout → Les icônes biométrie apparaissent au login

### Désactiver la Biométrie
1. Ouvrir l'app → **Profil**
2. Section **Sécurité** → Cliquer **Biométrie**
3. Toggle **ON → OFF**
4. ✅ Biométrie **Désactivée**
5. Logout → Les icônes biométrie disparaissent du login
6. Login uniquement par **mot de passe**

---

## 🔧 Implémentation Technique

### AppProvider State
Aucun changement requis dans AppProvider car on utilise `SharedPreferences` directement via `AuthApiService`:

```dart
// Sauvegarder état
await AuthApiService.saveBiometricEnabled(true);

// Lire état
final enabled = await AuthApiService.getBiometricEnabled();
```

### Profile Screen (StatefulWidget)
```dart
class _ProfileScreenState extends State<ProfileScreen> {
  bool _biometricEnabled = false;
  bool _isLoadingBiometric = true;

  @override
  void initState() {
    super.initState();
    _loadBiometricStatus();
  }

  Future<void> _loadBiometricStatus() async {
    final status = await AuthApiService.getBiometricEnabled();
    if (mounted) {
      setState(() {
        _biometricEnabled = status;
        _isLoadingBiometric = false;
      });
    }
  }
}
```

### Login Screen Check
```dart
class _LoginScreenState extends State<LoginScreen> {
  bool _biometricEnabled = false;
  bool _checkingBiometric = true;

  @override
  void initState() {
    super.initState();
    _checkBiometricStatus();
  }

  Future<void> _checkBiometricStatus() async {
    final status = await AuthApiService.getBiometricEnabled();
    if (mounted) {
      setState(() {
        _biometricEnabled = status;
        _checkingBiometric = false;
      });
    }
  }
}

// Dans le build()
if (_biometricEnabled && !_checkingBiometric)
  _buildBiometrics(mt, cd, bd, p),
```

---

## 📱 UI/UX

### Profile Screen - État Biométrie
```
┌─────────────────────────────────────┐
│ 🔒 Sécurité                         │
├─────────────────────────────────────┤
│ [👆] Biométrie                      │
│      ✓ Activée - Connexion rapide   │  ← Check vert si ON
│                              [→]    │
├─────────────────────────────────────┤
│ [👆] Biométrie                      │
│      ○ Désactivée - Mot de passe... │  ← Circle gray si OFF
│                              [→]    │
└─────────────────────────────────────┘
```

### Biometrics Settings Screen
```
┌─────────────────────────────────────┐
│           [👆 Icon]                 │
│                                     │
│   Sécurisez votre application       │
│                                     │
│   Utilisez Face ID ou Touch ID...   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [🔒] Verrouillage Biométrique   │ │
│ │      Activé / Désactivé         │ │
│ │                      [Toggle]   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Login Screen
```
Si Biométrie ACTIVÉE:
┌─────────────────────────────────────┐
│   [STB Logo]                        │
│   Username: _______                 │
│   Password: _______                 │
│   [Forgot password?]                │
│                                     │
│   ─── OU BIOMÉTRIE ───              │
│                                     │
│   [👆 Fingerprint]  [😊 Face ID]   │  ← VISIBLE
│                                     │
│   [Login Button]                    │
└─────────────────────────────────────┘

Si Biométrie DÉSACTIVÉE:
┌─────────────────────────────────────┐
│   [STB Logo]                        │
│   Username: _______                 │
│   Password: _______                 │
│   [Forgot password?]                │
│                                     │
│   [Login Button]                    │  ← Pas d'icônes biométrie
└─────────────────────────────────────┘
```

---

## 🌍 Traductions

### Français
- `biometrics_enabled`: "Activée - Connexion rapide"
- `biometrics_disabled`: "Désactivée - Mot de passe requis"
- `checking`: "Vérification..."

### English
- `biometrics_enabled`: "Active - Quick login enabled"
- `biometrics_disabled`: "Inactive - Use password"
- `checking`: "Checking..."

### Arabic
- `biometrics_enabled`: "مفعل - تسجيل دخول سريع"
- `biometrics_disabled`: "معطل - كلمة المرور مطلوبة"
- `checking`: "جاري التحقق..."

---

## 🧪 Testing

### Test Case 1: Activer Biométrie
1. Launch app (biométrie OFF par défaut)
2. Login avec password
3. Aller Profil > Sécurité > Biométrie
4. Vérifier status = "Désactivée"
5. Toggle ON → Scanner biométrie
6. Vérifier status = "Activée ✓"
7. Logout
8. Vérifier icônes biométrie **VISIBLES** au login
9. ✅ Test réussi

### Test Case 2: Désactiver Biométrie
1. Biométrie déjà activée
2. Login avec Face ID/Empreinte
3. Aller Profil > Sécurité > Biométrie
4. Vérifier status = "Activée ✓"
5. Toggle OFF
6. Vérifier status = "Désactivée"
7. Logout
8. Vérifier icônes biométrie **CACHÉES** au login
9. Login uniquement par password possible
10. ✅ Test réussi

### Test Case 3: Refresh Status
1. Aller Profil > Biométrie (status = OFF)
2. Ouvrir BiometricsSettingsScreen
3. Activer toggle
4. Retour au Profil
5. Vérifier status refresh automatiquement → "Activée ✓"
6. ✅ Test réussi

---

## 📊 Persistence

### SharedPreferences
```dart
// Key utilisé
const String _biometricEnabledKey = 'biometric_enabled';

// Méthodes dans AuthApiService
static Future<void> saveBiometricEnabled(bool enabled) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setBool(_biometricEnabledKey, enabled);
}

static Future<bool> getBiometricEnabled() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getBool(_biometricEnabledKey) ?? false;
}
```

**Default:** `false` (désactivée par défaut)

---

## 🔒 Security Notes

1. **Permission System:** Les permissions biométrie sont toujours présentes dans `Info.plist` et `AndroidManifest.xml`, mais l'app ne les utilise que si toggle = ON

2. **Backend Sync:** L'état ON/OFF est local (SharedPreferences). Si l'utilisateur réinstalle l'app, il devra réactiver.

3. **Device Trust:** Même si toggle = ON, le backend vérifie toujours que le `deviceUUID` est trusted avant d'accepter login biométrique

4. **Fallback:** Si biométrie échoue (scan raté, device non trusted), l'utilisateur peut toujours utiliser password

---

## 🎯 Avantages

✅ **Contrôle utilisateur:** L'utilisateur décide s'il veut la biométrie ou pas  
✅ **UI Propre:** Pas d'icônes biométrie inutiles si désactivées  
✅ **Performance:** Pas d'appel biométrique inutile au login si OFF  
✅ **Sécurité:** Option de désactiver si device compromis ou partagé  
✅ **UX claire:** État visible en temps réel dans Profil  

---

**Date:** 2026-08-15  
**Feature:** Biometric Toggle ON/OFF  
**Status:** ✅ Implémenté et fonctionnel
