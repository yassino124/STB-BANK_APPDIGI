# 🚀 STB Omni-Roles — Plan d'Implémentation Complet

## Vision Globale

Transformer l'application STB en un **écosystème d'entreprise complet** basé sur les rôles (RBAC) et les workflows hiérarchiques (N+1). Chaque rôle a une interface dédiée avec des fonctionnalités alignées sur ses responsabilités métier.

---

## 👥 1. Matrice des Rôles

### Rôle 1 : **Employé (Collaborateur)**
| Champ | Détail |
|-------|--------|
| **Plateforme** | 📱 Application Mobile Flutter |
| **Rôle Backend** | `EMPLOYEE` |
| **Rôle Web** | Ne se connecte pas au portail Web |
| **Accès** | Consulter ses données personnelles |

**Fonctionnalités Mobile :**
- Dashboard perso (solde, compte, cartes)
- Consulter ses congés passés et en cours
- **Demande de congé** → status `PENDING_N1`
- Consulter ses avances (demande + statut)
- Consulter ses crédits en cours
- Fiches de paie (documents générés auto)
- Contrat de travail / attestation
- Chat avec le Copilot IA
- Notifications push (approbation/décision manager)
- Profil et paramètres

**Fonctionnalités Web :** ❌ Aucun accès direct

---

### Rôle 2 : **Direction (Manager / N+1)**
| Champ | Détail |
|-------|--------|
| **Plateforme principale** | 📱 Application Mobile Flutter |
| **Rôle Backend** | `MANAGER` + `EMPLOYEE` (dual role) |
| **Rôle Web** | Accès limité au Dashboard RH |
| **Relation** | `employee.managerId` pointe vers lui |

**Fonctionnalités Mobile :**
- ✅ Toutes les fonctionnalités Employé (car il EST un employé)
- ✅ **Onglet "Team"** dans la barre de navigation (badge avec compteur de demandes en attente)
- ✅ **Swipe-to-Approve** : interface Tinder-style pour valider/refuser les congés de son équipe
  - Swipe → droite = Approuver (APPROVED_N1)
  - Swipe → gauche = Refuser (REJECTED) avec motif
- ✅ Notification push quand un subordonné demande un congé
- ✅ Voir le statut de chaque demande de son équipe
- ✅ Mot de passe Manager (pour le web dashboard RH)

**Accès Web Dashboard:**
- Tableau de bord RH simplifié : vue de son équipe uniquement
- Liste des demandes en attente de validation (PENDING_N1)
- Statistiques d'absence de son équipe
- Validation rapide depuis le web

---

### Rôle 3 : **Agent RH (Ressources Humaines)**
| Champ | Détail |
|-------|--------|
| **Plateforme principale** | 💻 Dashboard Web (React/Vite) |
| **Rôle Backend** | `RH` |
| **Rôle Mobile** | Accès limité (lecture seule) |
| **Responsabilité** | Gestion complète du cycle employé |

**Fonctionnalités Web Dashboard — Layout RH :**

#### Tableau de bord RH (Page d'accueil `/`)
- Graphiques : employés en congé en ce moment (pie chart)
- Taux d'absentéisme (bar chart mensuel)
- Demandes d'avances validées par les managers → prêtes pour paiement
- Alertes : employés proches de la fin de leur contrat
- Liste des nouveaux employés du mois
- Compteur rapide : total employés, en congé, en attente, nouveaux

#### 📋 Gestion des Employés (`/employees`)
- Annuaire complet avec recherche
- Fiche employé détaillée (info perso, contrat, financier)
- **Génération auto de documents** :
  - 📄 Contrat de travail (PDF) — généré dès l'ajout
  - 📄 Attestation de travail (PDF) — sur demande
  - 📄 Fiche de paie mensuelle (PDF) — générée auto fin de mois
- Export CSV/Excel
- Statut activation (pending/active/suspended)
- Attribution des rôles

#### 📝 Gestion des Demandes (`/requests`)
- Liste de TOUTES les demandes de congé (tous statuts)
- Filtres : par statut, par employé, par date, par type
- Détail d'une demande avec historique complet :
  - PENDING_N1 → en attente du manager
  - APPROVED_N1 → validée par le N+1, en attente RH
  - APPROVED → totalement validée
  - REJECTED → refusée (avec motif)
- Le RH **ne valide pas** les congés — elle/il voit juste le suivi
- Le RH peut **forcer la validation** si le manager est absent

#### 📊 Planning & Présence (`/attendance` ⚠️ À créer)
- Vue calendrier des absences de tous les employés
- Taux d'absentéisme par département
- Jours de congé restants par employé
- Alertes : employés sans congé solde

#### 💰 Gestion Financière RH (`/finance`)
- Validation des avances approuvées par les managers → prêtes pour paiement
- Génération automatique des fiches de paie mensuelles
- Envoi des fiches de paie vers le mobile de chaque employé (onglet Documents)
- Export masse des fiches de paie en PDF

#### 📂 Documents (`/documents`)
- Liste de tous les documents générés
- Contrats, attestations, fiches de paie
- Filtrage par employé, par type, par date

#### Rapports (`/reports`)
- Rapport d'absentéisme mensuel
- Rapport de congés par département
- Rapport financier (avances, primes)

#### Paramètres (`/settings`)
- Gestion des départements
- Gestion des agences/branches
- Configuration des types de congés
- Configuration des soldes de congés

---

### Rôle 4 : **Agence (Finance & Opérations)**
| Champ | Détail |
|-------|--------|
| **Plateforme principale** | 💻 Dashboard Web (React/Vite) |
| **Rôle Backend** | `AGENCE` |
| **Rôle Mobile** | Aucun accès dédié pour le moment |
| **Responsabilité** | Gestion bancaire, financière, crédits |

**Fonctionnalités Web Dashboard — Layout Agence :**

#### Tableau de bord Agence (`/agence`)
- Volume total des transactions du mois
- Alertes fraudes en cours
- Demandes de crédits en attente avec scores IA
- Cartes bancaires : actives vs bloquées
- Comptes bancaires : solde total géré
- Graphique des transactions par jour

#### 🏦 Comptes Bancaires (`/agence/accounts`)
- Liste de tous les comptes employés
- Création de nouveaux comptes
- Activation/désactivation
- Visualisation du solde par compte
- Historique des mouvements

#### 💳 Gestion des Cartes (`/agence/cards`)
- Liste des cartes émises
- Activation / Blocage / Destruction
- Type de carte (Débit / Crédit)
- Alertes: carte bloquée, carte expirée

#### 📊 Demandes de Crédits (`/agence/credits`)
- Liste des demandes avec **score IA**
- Filtres: en attente, approuvé, refusé
- Détail de la demande: montant, durée, score,justificatifs
- **Décision d'octroi** : Approuver / Refuser
- Historique des crédits par employé

#### 💰 Avances (`/agence/avances`)
- Liste des demandes d'avances
- Les advances validées par les managers arrivent ici pour validation finale
- Décision: valider pour paiement ou refuser
- Historique des avances traitées

#### Alertes & Fraude (`/agence/risk`)
- Alertes de transactions suspectes
- Score de risque par employé
- Historique des alertes

#### Rapports (`/agence/reports`)
- Rapport financier mensuel
- Export PDF/Excel

#### Paramètres (`/agence/settings`)
- Gestion des règles de scoring IA
- Limites de crédit par poste
- Paramètres des agences

---

## ⚙️ 2. Workflow Hiérarchique (Le Moteur)

### Cycle de Vie d'une Demande de Congé

```
┌──────────────────────────────────────────────────────────────────┐
│                    WORKFLOW N+1 COMPLET                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. EMPLOYÉ demande un congé                                    │
│     → POST /leave                                               │
│     → Status: PENDING_N1                                        │
│     → managerId assigné自动ement via la hiérarchie              │
│     → Notification push au manager                              │
│                                                                  │
│  2. MANAGER (N+1) reçoit la notification                       │
│     → Badge "N demandes en attente" sur l'app mobile           │
│     → Onglet "Team" → swipe pour valider                       │
│                                                                  │
│     a) Si APPROUVÉ → Status: APPROVED_N1                       │
│        → Notification push à l'employé                         │
│        → En attente de validation RH                           │
│                                                                  │
│     b) Si REFUSÉ → Status: REJECTED                            │
│        → Notification push à l'employé avec le motif           │
│        → Fin du workflow                                        │
│                                                                  │
│  3. RH valide la demande APPROVED_N1                           │
│     → GET /leave/pending-rh  (liste des demandes en attente)   │
│     → PATCH /leave/:id/handle-rh                                │
│     → Decision: APPROVED ou REJECTED                           │
│                                                                  │
│     a) Si APPROVED → Status: APPROVED                          │
│        → Solde de congé déduit automatiquement                  │
│        → Fiche de paie mise à jour (fin de mois)               │
│        → Notification push à l'employé                         │
│        → Document généré (attestation d'absence si demandé)    │
│                                                                  │
│     b) Si REFUSÉ → Status: REJECTED                            │
│        → Notification à l'employé                              │
│        → Fin du workflow                                        │
│                                                                  │
│  🔒 RÈGLES DE SÉCURITÉ:                                        │
│  - Seul le N+1 (managerId) peut approuver en étape N+1       │
│  - Seul RH/ADMIN/SUPER_ADMIN peut valider en étape RH         │
│  - Un manager ne peut PAS voir les demandes des autres managers│
│  - L'employé ne voit QUE ses propres demandes                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Workflow d'une Avance

```
EMPLOYÉ demande avance (Mobile)
  → Status: PENDING_MANAGER

MANAGER approuve en swipe (Mobile)
  → Status: APPROVED_BY_MANAGER

RH valide pour paiement (Web Dashboard)
  → Status: APPROVED_BY_RH
  → Intégré à la fiche de paie du mois suivant
```

### Workflow de Crédit (Agence)

```
EMPLOYÉ demande crédit (Mobile)
  → Score IA calculé automatiquement
  → Status: PENDING_AGENCE

AGENCE voit la demande (Web Dashboard)
  → Score IA affiché avec explication
  → Décision: APPROUVE ou REFUSÉ
  → Notification push à l'employé
```

---

## 📱 3. Application Mobile — Structure Par Rôle

### Employé (Standard)
```
📱 MainScreen (Bottom Nav - 5 onglets)
├── 🏠 Accueil (Dashboard perso)
│   ├── Solde du compte
│   ├── Cartes actives
│   ├── Dernières transactions
│   ├── Congés restants : X jours
│   └── Widget Copilot IA
├── 📋 RH Hub
│   ├── Mes demandes de congé (status + bouton nouvelle demande)
│   ├── Mes avances (demander + historique)
│   ├── Mes crédits en cours
│   ├── Mes primes
│   └── Documents (fiches de paie, contrats, attestations)
├── 👥 Annuaire
│   ├── Recherche collègues
│   └── Profil d'un collègue (public)
├── 🤖 Copilot IA
│   ├── Analyser mes dépenses
│   ├── Conseils d'épargne
│   └── Questions sur congés/avances
└── 👤 Profil
    ├── Infos perso
    ├── Contrat (PDF)
    ├── Fiches de paie
    ├── Paramètres (langue, thème, biométrie)
    └── Déconnexion
```

### Manager / Direction (N+1)
```
📱 MainScreen (Bottom Nav - 6 onglets)
├── 🏠 Accueil (Dashboard perso + badge notifications)
│   ├── Solde du compte
│   ├── 🔔 Badge : "X demandes en attente de votre équipe"
│   ├── Cartes actives
│   └── Widget Copilot IA
├── 👥 Team (⚠️ NOUVEL ONGLET - Managers uniquement)
│   ├── Liste des demandes en attente (PENDING_N1)
│   │   └── Swipe → droite : ✅ Approuver
│   │   └── Swipe → gauche : ❌ Refuser (motif requis)
│   ├── Historique des décisions
│   ├── Statistiques de l'équipe
│   └── Notification badge sur l'onglet Team
├── 📋 RH Hub (même que Employé)
├── 👥 Annuaire
├── 🤖 Copilot IA
└── 👤 Profil
```

### Agent RH (Mobile - Lecture seule)
```
📱 MainScreen (Bottom Nav - 5 onglets)
├── 🏠 Accueil (Dashboard RH simplifié)
│   ├── Statistiques: employés en congé aujourd'hui
│   ├── Demandes en attente de validation
│   ├── Alertes du mois
│   └── Widget: dernières activités
├── 📋 RH Hub (accès complet)
│   ├── Liste de tous les employés
│   ├── Toutes les demandes de congé
│   ├── Toutes les avances
│   ├── Gestion documents
│   └── Génération fiches de paie
├── 👥 Annuaire
├── 🤖 Copilot IA
└── 👤 Profil (compte RH)
```

### Agent Agence (Mobile - Aucun accès mobile pour le moment)
```
📱 Aucun accès mobile dédié pour le moment
→ Utilise uniquement le Dashboard Web Agence
```

---

## 💻 4. Dashboard Web — Structure Par Rôle

### Layout RH (`/` — Portail RH)
```
┌─────────────────────────────────────────────────────────┐
│  🏦 STB Portal RH        🔔 notifs   👤 Admin | 🔄     │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  Sidebar │  Main Content Area                           │
│          │                                              │
│  Tableau │  ┌─────────────────────────────────────┐    │
│  de bord │  │  Dashboard Accueil RH              │    │
│          │  │  - Graphique employés en congé      │    │
│  - Tableau│  │  - Taux absentéisme                │    │
│    de bord│  │  - Advances prêtes pour paiement   │    │
│  - Employés│  │  - Alertes employés               │    │
│  - Demande│  └─────────────────────────────────────┘    │
│    s      │  ┌─────────────────────────────────────┐    │
│  - Org.   │  │  Dernières demandes de congé       │    │
│  - Docs   │  │  - Tableau avec status colorisés   │    │
│  - Finance│  └─────────────────────────────────────┘    │
│  - Reports│                                              │
│  - Params │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### Layout Agence (`/agence` — Portail Finance)
```
┌─────────────────────────────────────────────────────────┐
│  🏦 STB Agence       🔔 alertes  👤 Financeur | 🔄     │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  Sidebar │  Main Content Area                           │
│  Agence  │                                              │
│          │  - Volume transactions du mois               │
│  - Comptes│  - Cartes actives/bloquées                 │
│  - Cartes │  - Alerts fraude                          │
│  - Crédits│  - Demandes en attente avec scores IA      │
│  - Avances│                                              │
│  - Alertes│                                              │
│  - Rapports│                                             │
│  - Params │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

---

## 🔐 5. Système de Sécurité & Permissions

### Contrôle d'accès backend (NestJS Guards)

```typescript
// Chaque endpoint est protégé par @Roles()
@Get('leave/pending-manager')
@Roles(Role.MANAGER) // Seuls les managers voient leurs demandes
getPendingForManager(@Request() req) { ... }

@Patch('leave/:id/handle-manager')
@Roles(Role.MANAGER)
handleManagerApproval(@Param('id') id, @Request() req, body) { ... }
// Vérifie que req.user.sub == request.managerId (N+1)

@Patch('leave/:id/handle-rh')
@Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
handleRhApproval(@Param('id') id, @Request() req, body) { ... }

@Get('employees')
@Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.AGENCE) // Agence voit la liste
findAll() { ... }

@Get('accounts')
@Roles(Role.AGENCE, Role.ADMIN, Role.SUPER_ADMIN) // Seule l'agence voit les comptes
getAllAccounts() { ... }
```

### Hiérarchie N+1 dans le modèle de données

```
Employee Schema:
{
  _id: ObjectId,
  matricule: "EMP001",
  nom: "Ouertani",
  prenom: "Yassine",
  roles: ["EMPLOYEE", "MANAGER"],  // dual role possible
  managerId: ObjectId(EMP005),     //指向 son N+1
  departmentId: ObjectId(...),
  branchId: ObjectId(...),
  ...
}

Hierarchy Schema:
{
  employeeId: ObjectId,
  managerId: ObjectId,
  level: 2,           // N+1=N+1, N+2=N+2, etc.
  isManager: true,
  directReports: [ObjectId(...)]
}
```

---

## 📊 6. Génération Automatique des Documents

### Déclencheurs
| Événement | Document Généré | Format |
|-----------|----------------|--------|
| Nouvel employé créé | Contrat de travail | PDF auto |
| Nouvel employé créé | Attestation d'embauche | PDF auto |
| Fin de chaque mois | Fiche de paie (tous employés) | PDF auto |
| Employé en congé approuvé | Attestation d'absence (sur demande) | PDF |
| Demande de congé refusée | Lettre de refus (optionnel) | PDF |

### Backend Endpoint
```
POST /documents/generate/:employeeId
Body: { type: 'CONTRACT' | 'ATTESTATION' | 'PAYSLIP' | 'LEAVE_CERT' }
→ Génère le PDF, le stocke, renvoie l'URL
→ Notifie l'employé sur l'app mobile (onglet Documents)
```

---

## 🗂️ 7. Structure des Fichiers Modifiés/Nouveaux

### Backend (`stb-backend/src/`)
```
hierarchy/
  ├── hierarchy.schema.ts          ✅ Nouveau
  ├── hierarchy.service.ts          ✅ Nouveau
  ├── hierarchy.controller.ts       ✅ Nouveau
  └── hierarchy.module.ts           ✅ Nouveau

documents/
  ├── documents.service.ts          ➕ Ajouter generatePDF()
  └── documents.controller.ts       ➕ Ajouter POST /generate

employees/
  ├── employees.service.ts          ➕ Ajouter generateOnboardingDocs()

scheduler/
  ├── scheduler.service.ts          ➕ Ajouter monthlyDocGeneration cron
  └── scheduler.module.ts           ➕ Ajouter DocumentsModule

leave/
  ├── leave.schema.ts               ✅ Mis à jour (N+1 statuses)
  ├── leave.service.ts              ✅ Mis à jour (N+1 validation)
  └── leave.controller.ts           ✅ Mis à jour (handle-manager + handle-rh)

app.module.ts                       ✅ Mis à jour (HierarchyModule)
```

### Mobile (`lib/`)
```
screens/team/
  └── team_validation_screen.dart   ✅ Nouveau (Swipe-to-Approve)

services/
  └── auth_api_service.dart         ✅ Mis à jour (manager API methods)

providers/
  └── app_provider.dart             ✅ Mis à jour (isManager/isRH/isFinance getters)

screens/main_screen.dart            ✅ Mis à jour (Team tab pour managers)
```

### Web Dashboard (`dashboard_web_stb/src/`)
```
pages/
  ├── AgenceDashboard.tsx           ✅ Nouveau (Finance Dashboard)
  ├── AgenceAccounts.tsx            ✅ Nouveau (Bank Accounts)
  ├── AgenceCards.tsx               ✅ Nouveau (Card Management)
  └── AgenceCredits.tsx             ✅ Nouveau (Credit Management)

components/
  ├── ProtectedRoute.tsx            ✅ Nouveau (Role-based guard)
  └── Sidebar.tsx                   ✅ Mis à jour (role-aware)

context/
  └── AuthContext.tsx               ✅ Mis à jour (ALLOWED_ROLES expanded)

App.tsx                             ✅ Mis à jour (role-based routing)
```

---

## 📝 8. Phases d'Implémentation Restantes

### Phase 4 : Web Dashboard RH — Pages Manquantes
- [ ] `/attendance` — Planning & présence
- [ ] `/finance` — Validation des avances + génération fiches de paie
- [ ] `/reports` — Rapports RH complets
- [ ] `/agence/accounts` — Gestion des comptes bancaires
- [ ] `/agence/cards` — Gestion des cartes
- [ ] `/agence/credits` — Gestion des crédits avec score IA

### Phase 5 : Mobile — Améliorations
- [ ] Notifications push pour N+1 (congés en attente)
- [ ] Notifications push pour RH (avances prêtes pour paiement)
- [ ] Onglet Documents enrichi (contrats + fiches de paie + attestations)
- [ ] Copilot IA — Suggestions de congés basées sur l'historique

### Phase 6 : Tests & Déploiement
- [ ] Tests unitaires pour le backend (hierarchy + leave state machine)
- [ ] Tests E2E pour les workflows N+1
- [ ] Tests d'accessibilité sur mobile
- [ ] Performance testing sur le dashboard web
- [ ] Déploiement staging → production

---

## 🎨 9. Design System & WOW Effects

### Mobile
- **Swipe-to-Approve** : Cards façon Tinder avec haptic feedback
- **Badge animations** : Compteur de demandes en attente pulsant
- **Gradient backgrounds** : Bleu électrique → Navy profond
- **Glassmorphism** : Cards avec backdrop-filter blur
- **Page transitions** : Slide + fade avec flutter_animate
- **Dark Mode** : Thème sombre avec accents dorés
- **Biometric lock** : Face ID / empreinte digitale

### Web Dashboard
- **Sidebar glass morphique** : Transparence + blur
- **Animated charts** : Recharts avec framer-motion
- **Dark/Light toggle** : Smooth transition
- **Responsive** : Desktop → Tablet → Mobile breakpoints
- **Glass cards** : Background blur + subtle borders
- **Micro-interactions** : Hover effects on all interactive elements
- **Loading skeletons** : Shimmer animations while loading

---

## 🔗 10. API Endpoints Par Rôle

### Employé (`EMPLOYEE`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/leave/my` | Mes demandes de congé |
| GET | `/leave/my-balance` | Mon solde de congés |
| POST | `/leave` | Soumettre nouvelle demande |
| GET | `/avances/my` | Mes avances |
| POST | `/avances` | Demander une avance |
| GET | `/credits/my` | Mes crédits |
| GET | `/documents/my` | Mes documents |
| GET | `/employees/me` | Mon profil |

### Direction / Manager (`MANAGER`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/leave/pending-manager` | Mes demandes en attente (N+1) |
| GET | `/leave/my-team` | Toutes les demandes de mon équipe |
| PATCH | `/leave/:id/handle-manager` | Approuver/Refuser (N+1) |
| GET | `/hierarchy/:employeeId/chain` | Voir la chaîne hiérarchique |
| GET | `/employees/directory/search?q=` | Recherche dans son équipe |

### RH (`RH`, `ADMIN`, `SUPER_ADMIN`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/employees` | Tous les employés |
| GET | `/employees/stats` | Statistiques |
| GET | `/leave/all?status=PENDING_N1` | Demandes en attente N+1 |
| GET | `/leave/all?status=APPROVED_N1` | Demandes en attente RH |
| PATCH | `/leave/:id/handle-rh` | Valider/refuser (RH) |
| GET | `/documents` | Tous les documents |
| POST | `/documents/generate/:id` | Générer document PDF |
| GET | `/payroll` | Fiches de paie |
| GET | `/avances/pending` | Avances prêtes pour paiement |
| GET | `/departments` | Départements |
| GET | `/branches` | Agences/branches |
| POST | `/employees` | Créer un employé |

### Agence (`AGENCE`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/accounts` | Tous les comptes |
| GET | `/cards` | Toutes les cartes |
| PATCH | `/cards/:id/status` | Activer/Bloquer carte |
| GET | `/credits` | Tous les crédits |
| PATCH | `/credits/:id/decision` | Approuver/Refuser crédit |
| GET | `/avances/pending` | Avances en attente de validation agence |
| GET | `/risk-alerts` | Alertes de risque |
| GET | `/analytics` | Analytics financiers |

