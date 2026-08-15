# Analyse Avatar Profile STB Mobile 📸

## ✅ Résumé Rapide
Les avatars **devraient fonctionner** car tout le code est en place. Le problème probable: **données manquantes dans la base de données**.

---

## 🔍 Analyse Technique Complète

### 1. Backend (NestJS) ✅

#### Schema Employee (`stb-backend/src/employees/employee.schema.ts`)
```typescript
@Prop({ type: String, default: null, trim: true })
avatar: string | null;  // ✅ Champ existe ligne 65
```

#### Auth Service Login (`stb-backend/src/auth/auth.service.ts`)
```typescript
// Ligne 316-317
const { passwordHash, pinHash, ...safeEmployee } = employee.toObject();

return {
  ...tokens,
  employee: safeEmployee,  // ✅ Retourne TOUS les champs incluant avatar
  isNewDevice,
  requiresDeviceVerification,
};
```

**✅ Le backend retourne bien l'avatar dans la réponse login**

---

### 2. Mobile (Flutter) ✅

#### AppProvider stocke le profil au login
**Fichier:** `lib/providers/app_provider.dart`

```dart
// Ligne 500-504
Future<void> setProfileFromLogin(Map<String, dynamic> employeeData) async {
  _userProfile = employeeData;  // ✅ Sauvegarde TOUT l'objet employee
  await AuthApiService.saveProfile(jsonEncode(employeeData));
  notifyListeners();
}
```

#### Profile Screen affiche l'avatar
**Fichier:** `lib/screens/profile/profile_screen.dart`

```dart
// Ligne 22-50: Méthode _getAvatarImage()
DecorationImage? _getAvatarImage(String? avatar) {
  if (avatar == null || avatar.isEmpty) return null;
  
  try {
    // Support base64 data URI
    if (avatar.startsWith('data:image')) {
      final base64String = avatar.split(',')[1];
      Uint8List bytes;
      if (_avatarBytesCache.containsKey(base64String)) {
        bytes = _avatarBytesCache[base64String]!;
      } else {
        bytes = base64Decode(base64String);
        _avatarBytesCache[base64String] = bytes;
      }
      return DecorationImage(
        image: MemoryImage(bytes),
        fit: BoxFit.cover,
      );
    } else {
      // Support URL directe
      return DecorationImage(
        image: NetworkImage(avatar),
        fit: BoxFit.cover,
      );
    }
  } catch (e) {
    print('Error loading avatar: $e');
    return null;
  }
}
```

#### Ligne 116-146: Avatar Container
```dart
Container(
  width: 76,
  height: 76,
  decoration: BoxDecoration(
    // ...
    image: _getAvatarImage(p.userProfile?['avatar']),  // ✅ Charge l'avatar
  ),
  child: (p.userProfile?['avatar'] == null || (p.userProfile?['avatar'] as String).isEmpty)
      ? Text(
          // Affiche initiales si pas d'avatar
          p.userProfile != null && p.userProfile!['prenom'] != null && p.userProfile!['nom'] != null
              ? '${p.userProfile!['prenom'][0]}${p.userProfile!['nom'][0]}'.toUpperCase()
              : 'U',
          style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
        )
      : null,  // Pas de child si avatar existe
),
```

**✅ Le code Flutter charge et affiche correctement les avatars**

---

## 🐛 Pourquoi l'avatar ne s'affiche pas?

### Diagnostic: 3 possibilités

#### 1. **Avatar NULL ou vide dans la base MongoDB** (PLUS PROBABLE)
```javascript
// MongoDB Document
{
  "_id": "...",
  "matricule": "EMP001",
  "nom": "Ouertani",
  "prenom": "Yassine",
  "avatar": null  // ❌ OU ""  OU champ absent
}
```

#### 2. **Format avatar incorrect**
L'avatar doit être soit:
- **Base64 data URI:** `data:image/png;base64,iVBORw0KGgo...`
- **URL complète:** `https://api.stb.tn/public/avatars/emp001.jpg`
- **URL relative:** `/avatars/emp001.jpg` (NE MARCHE PAS car NetworkImage nécessite URL complète)

#### 3. **Cache profil obsolète**
Le profil en cache local n'a pas l'avatar même si MongoDB l'a.

---

## 🛠️ Solutions

### Solution 1: Vérifier MongoDB
```bash
# Dans MongoDB Shell ou Compass
db.employees.findOne({ matricule: "EMP001" })

# Vérifier si avatar existe et son format
```

### Solution 2: Uploader avatars via Dashboard Web
**Fichier:** `dashboard_web_stb/src/pages/Employees.tsx` ou `NewEmployee.tsx`

Le dashboard web devrait avoir un upload d'avatar qui:
1. Upload fichier vers `/public/avatars/`
2. Sauvegarde chemin dans MongoDB: `avatar: "https://api.stb.tn/public/avatars/emp001.jpg"`

### Solution 3: Seeding avatars par défaut
Dans `stb-backend/src/seed.ts`:

```typescript
// Ajouter avatars aux employés de seed
{
  matricule: 'EMP001',
  nom: 'Ouertani',
  prenom: 'Yassine',
  avatar: 'https://i.pravatar.cc/150?img=12',  // Avatar temporaire
  // ...
}
```

### Solution 4: Clear cache + refetch
```dart
// Dans Flutter
await AuthApiService.clearProfile();  // Clear cache
await context.read<AppProvider>().fetchProfile();  // Refetch
```

---

## 🎯 Formats supportés

### ✅ Base64 (Recommandé pour upload depuis mobile)
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...
```

**Avantages:**
- Pas besoin serveur fichiers
- Stock directement dans MongoDB
- Pas de CORS issues

**Inconvénients:**
- Taille document MongoDB (limit 16MB)
- Performance si beaucoup d'employés

### ✅ URL complète (Recommandé pour production)
```
https://api.stb.tn/public/avatars/emp001.jpg
```

**Avantages:**
- Meilleure performance
- CDN possible
- Pas de limite taille

**Inconvénients:**
- Besoin serveur fichiers statiques
- CORS à configurer

### ❌ URL relative (NE MARCHE PAS)
```
/avatars/emp001.jpg  // ❌
public/avatars/emp001.jpg  // ❌
```

**NetworkImage** nécessite URL complète avec protocole.

---

## 📊 Test Checklist

### Backend Check
- [ ] MongoDB: Vérifier champ `avatar` existe et non-null
- [ ] API `/auth/login` retourne `employee.avatar` dans réponse
- [ ] API `/employees/me` retourne `avatar`
- [ ] Fichiers avatars existent dans `/public/avatars/`

### Mobile Check
- [ ] `AppProvider.userProfile['avatar']` contient valeur
- [ ] Pas d'erreur dans console: `Error loading avatar:`
- [ ] Network tab montre requête NetworkImage si URL
- [ ] Clear app data + relogin pour tester cache

### Dashboard Web Check
- [ ] Upload avatar fonctionnel dans NewEmployee.tsx
- [ ] Avatar affiché dans liste Employees.tsx
- [ ] Endpoint backend `/employees/:id/avatar` existe

---

## 🚀 Quick Fix (Temporaire)

Si tu veux tester immédiatement avec avatars aléatoires:

### Dans `profile_screen.dart` ligne 136-142:
```dart
DecorationImage? _getEmployeeAvatarImage(String? avatar) {
  if (avatar == null || avatar.isEmpty) {
    // ✅ Fallback temporaire pravatar
    final random = Random().nextInt(70) + 1;
    return DecorationImage(
      image: NetworkImage("https://i.pravatar.cc/150?img=$random"),
      fit: BoxFit.cover,
    );
  }
  // ... reste du code
}
```

**Ceci affichera toujours un avatar même si MongoDB n'en a pas.**

---

## 📝 Recommandation Finale

### Pour Production:
1. **Backend:** Ajouter endpoint upload avatar
   ```typescript
   @Post('employees/:id/avatar')
   @UseInterceptors(FileInterceptor('file'))
   async uploadAvatar(@Param('id') id: string, @UploadedFile() file) {
     const filename = `${id}-${Date.now()}.jpg`;
     // Sauver dans /public/avatars/
     const url = `${API_BASE_URL}/public/avatars/${filename}`;
     await this.employeesService.update(id, { avatar: url });
     return { avatar: url };
   }
   ```

2. **Dashboard Web:** Ajouter formulaire upload dans Employees.tsx

3. **Mobile:** Ajouter bouton "Changer photo" dans ProfileScreen avec ImagePicker

4. **Seed:** Ajouter avatars par défaut dans seed.ts pour démo

---

**Date:** 2026-08-15  
**Status:** Analyse complète — Code OK, probable problème données MongoDB
