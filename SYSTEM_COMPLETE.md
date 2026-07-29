# 🏦 STB Omni-Roles — Système Complet

## Vue d'Ensemble

Le système STB Omni-Roles est un écosystème d'entreprise complet basé sur les rôles (RBAC) et les workflows hiérarchiques (N+1). Il comprend **4 rôles principaux** avec des interfaces dédiées pour le portail Web (React/Vite) et l'application mobile (Flutter).

---

## 👥 1. Les 4 Rôles et Leurs Responsabilités

### 🔵 Rôle 1 : RH (Ressources Humaines)

| Champ | Détail |
|-------|--------|
| **Plateforme** | 💻 Dashboard Web (React/Vite) |
| **Rôle Backend** | `RH` |
| **Responsabilité** | Gestion complète des employés, congés, documents, paie |

#### Interface Dashboard Web — Page d'accueil `/`
- Graphiques : employés en congé en ce moment (pie chart)
- Taux d'absentéisme (bar chart mensuel)
- Demandes d'avances validées par les managers → prêtes pour paiement
- Alertes : employés proches de la fin de leur contrat
- Liste des nouveaux employés du mois
- Compteur rapide : total employés, en congé, en attente, nouveaux

#### 📋 Gestion des Employés (`/employees`)
- Annuaire complet avec recherche
- Fiche employé détaillée (info perso, contrat, financier)
- **Création de compte** : le RH crée un compte employé avec un rôle assigné
  - Rôles disponibles : `EMPLOYEE`, `MANAGER`, `DIRECTEUR`, `DIRECTEUR_CENTRAL`, `CHEF_SERVICE`, `CHEF_SERVICE_PRINCIPAL`
  - Attribution automatique de la hiérarchie N+1 (managerId)
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
  - `PENDING_N1` → en attente du manager (direction)
  - `APPROVED_N1` → validée par le N+1, en attente RH
  - `APPROVED` → totalement validée
  - `REJECTED` → refusée (avec motif)
- Le RH **ne valide pas** les congés — elle/il voit juste le suivi
- Le RH peut **forcer la validation** si le manager est absent

#### 📊 Planning & Présence (`/attendance`)
- Vue calendrier des absences de tous les employés
- Taux d'absentéisme par département
- Jours de congé restants par employé
- Alertes : employés sans congé solde
- **Condition max 2H par mois** pour les absences (sans solde déduit)

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
- Configuration des règles d'autorisation (max 2H, max 30 jours/mois)

---

### 🟢 Rôle 2 : Finance

| Champ | Détail |
|-------|--------|
| **Plateforme** | 💻 Dashboard Web (React/Vite) |
| **Rôle Backend** | `FINANCE` |
| **Responsabilité** | Gestion financière globale, paie, budgets, comptes |

#### Interface Dashboard Web — `/finance`
- Vue d'ensemble financière de l'entreprise
- Graphiques: masse salariale, avances en cours, crédits actifs
- Alertes: paiements en retard, dépassements budgétaires
- Compteurs rapides: employés actifs, avances en attente, crédits approuvés

#### 💰 Gestion de la Paie (`/finance/payroll`)
- Liste de toutes les fiches de paie
- Génération mensuelle automatique
- Export PDF/Excel en masse
- Historique des paiements
- Détail par employé (salaire brut, net, déductions, primes)

#### 📊 Budgets (`/finance/budgets`)
- Suivi des budgets par département
- Alertes de dépassement
- Prévisions vs réelles
- Export rapports

#### 💳 Avances (`/finance/avances`)
- Validation des avances approuvées par les managers
- Décision: valider pour paiement ou refuser
- Historique des avances traitées

#### 📈 Investissements (`/finance/investments`)
- Suivi des investissements de l'entreprise
- Rendement des investissements
- Alertes de risque

#### 🏦 Comptes Bancaires (`/finance/accounts`)
- Liste de tous les comptes employés
- Création de nouveaux comptes
- Activation/désactivation
- Visualisation du solde par compte
- Historique des mouvements

---

### 🟠 Rôle 3 : Agence (Finance & Opérations)

| Champ | Détail |
|-------|--------|
| **Plateforme** | 💻 Dashboard Web (React/Vite) |
| **Rôle Backend** | `AGENCE` |
| **Responsabilité** | Gestion bancaire, financière, crédits au niveau de l'agence |

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
- Détail de la demande: montant, durée, score, justificatifs
- **Décision d'octroi** : Approuver / Refuser
- Historique des crédits par employé

#### 💰 Avances (`/agence/avances`)
- Liste des demandes d'avances
- Les avances validées par les managers arrivent ici pour validation finale
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

### 🔴 Rôle 4 : Direction (Manager / N+1)

| Champ | Détail |
|-------|--------|
| **Plateforme** | 📱 Application Mobile Flutter (principale) + 💻 Web (limité) |
| **Rôle Backend** | `MANAGER` + `EMPLOYEE` (dual role) |
| **Responsabilité** | Validation hiérarchique des demandes (congé, absence, avance) |

#### Types de Direction :
- **Directeur** : validation des demandes de son département
- **Directeur Central** : validation des demandes de toutes les agences
- **Chef de Service** : validation des demandes de son service
- **Chef de Service Principal** : validation des demandes de tous les chefs de service

#### Interface Mobile — Onglet "Team" (swipe-to-approve)
- Liste des demandes en attente (`PENDING_N1`)
  - Swipe → droite : ✅ Approuver (`APPROVED_N1`)
  - Swipe → gauche : ❌ Refuser (`REJECTED`) avec motif
- Historique des décisions
- Statistiques de l'équipe
- Notification badge sur l'onglet Team

#### Interface Mobile — Onglet "Absence"
- Liste des demandes d'absence en attente
- Swipe → droite : ✅ Approuver (max 2H, condition mensuelle)
- Swipe → gauche : ❌ Refuser avec motif
- Condition : max 2 heures par mois, pas de solde déduit

#### Interface Mobile — Onglet "RH Hub"
- Même fonctionnalités que l'employé standard
- Voir ses propres demandes de congé
- Voir ses propres avances
- Voir ses propres crédits
- Documents (fiches de paie, contrats, attestations)

#### Interface Mobile — Onglet "Profil"
- Infos perso
- Contrat (PDF)
- Fiches de paie
- Paramètres (langue, thème, biométrie)
- Déconnexion

#### Accès Web Dashboard (limité) :
- Tableau de bord RH simplifié : vue de son équipe uniquement
- Liste des demandes en attente de validation (`PENDING_N1`)
- Statistiques d'absence de son équipe
- Validation rapide depuis le web

---

## ⚙️ 2. Workflows Complets

### Workflow Congé (N+1)

```
┌──────────────────────────────────────────────────────────────────┐
│                    WORKFLOW CONGÉ N+1 COMPLET                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. EMPLOYÉ demande un congé (Mobile)                          │
│     → POST /leave                                                │
│     → Status: PENDING_N1                                         │
│     → managerId assigné automatiquement via la hiérarchie       │
│     → Notification push au manager (Direction)                   │
│                                                                  │
│  2. DIRECTION (N+1) reçoit la notification                      │
│     → Badge "N demandes en attente" sur l'app mobile            │
│     → Onglet "Team" → swipe pour valider                        │
│                                                                  │
│     a) Si APPROUVÉ → Status: APPROVED_N1                        │
│        → Notification push à l'employé                          │
│        → En attente de validation RH                             │
│                                                                  │
│     b) Si REFUSÉ → Status: REJECTED                             │
│        → Notification push à l'employé avec le motif            │
│        → Fin du workflow                                        │
│                                                                  │
│  3. RH valide la demande APPROVED_N1                            │
│     → GET /leave/pending-rh                                      │
│     → PATCH /leave/:id/handle-rh                                │
│     → Decision: APPROVED ou REJECTED                            │
│                                                                  │
│     a) Si APPROVED → Status: APPROVED                           │
│        → Solde de congé déduit automatiquement                   │
│        → Fiche de paie mise à jour (fin de mois)                │
│        → Notification push à l'employé                          │
│        → Document généré (attestation d'absence si demandé)     │
│                                                                  │
│     b) Si REFUSÉ → Status: REJECTED                             │
│        → Notification à l'employé                                │
│        → Fin du workflow                                        │
│                                                                  │
│  🔒 RÈGLES DE SÉCURITÉ:                                        │
│  - Seul le N+1 (managerId) peut approuver en étape N+1         │
│  - Seul RH/ADMIN/SUPER_ADMIN peut valider en étape RH           │
│  - Un manager ne peut PAS voir les demandes des autres managers │
│  - L'employé ne voit QUE ses propres demandes                   │
│  - Condition max: 30 jours de congé par mois                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Workflow Absence (Max 2H/mois, Max 30 jours/mois)

```
EMPLOYÉ demande absence (Mobile)
  → Status: PENDING_N1
  → Type: ABSENCE (différent de CONGE)
  → Condition: max 2H par mois, pas de solde déduit
  → Condition: max 30 jours d'absence par mois

DIRECTION approuve en swipe (Mobile)
  → Status: APPROVED_N1
  → Notification push à l'employé

RH valide (Web Dashboard)
  → Status: APPROVED
  → Aucune déduction de solde (c'est une absence, pas un congé)
  → Document généré: attestation d'absence
```

### Workflow Avance

```
EMPLOYÉ demande avance (Mobile)
  → Status: PENDING_MANAGER

DIRECTION approuve en swipe (Mobile)
  → Status: APPROVED_BY_MANAGER

RH valide pour paiement (Web Dashboard)
  → Status: APPROVED_BY_RH
  → Intégré à la fiche de paie du mois suivant
```

### Workflow Crédit (Agence)

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
📱 MainScreen (Bottom Nav - 6 onglets)
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
├── 📅 Absence (nouvel onglet)
│   ├── Ma demande d'absence en cours
│   ├── Historique des absences
│   └── Nouvelle demande d'absence (max 2H)
└── 👤 Profil
    ├── Infos perso
    ├── Contrat (PDF)
    ├── Fiches de paie
    ├── Paramètres (langue, thème, biométrie)
    └── Déconnexion
```

### Direction / Manager (N+1)
```
📱 MainScreen (Bottom Nav - 7 onglets)
├── 🏠 Accueil (Dashboard perso + badge notifications)
│   ├── Solde du compte
│   ├── 🔔 Badge : "X demandes en attente de votre équipe"
│   ├── Cartes actives
│   └── Widget Copilot IA
├── 👥 Team (⚠️ NOUVEL ONGLET - Managers uniquement)
│   ├── Liste des demandes de congé en attente (PENDING_N1)
│   │   └── Swipe → droite : ✅ Approuver
│   │   └── Swipe → gauche : ❌ Refuser (motif requis)
│   ├── Historique des décisions
│   ├── Statistiques de l'équipe
│   └── Notification badge sur l'onglet Team
├── 📋 RH Hub (même que Employé)
├── 👥 Annuaire
├── 🤖 Copilot IA
├── 📅 Absence (gestion des absences de l'équipe)
│   ├── Demandes en attente (swipe to approve)
│   ├── Max 2H par mois — condition affichée
│   └── Historique des décisions
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

### Layout Finance (`/finance` — Portail Finance)
```
┌─────────────────────────────────────────────────────────┐
│  🏦 STB Finance      🔔 notifs   👤 Finance | 🔄       │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  Sidebar │  Main Content Area                           │
│          │                                              │
│  Tableau │  ┌─────────────────────────────────────┐    │
│  de bord │  │  Dashboard Finance                  │    │
│          │  │  - Masse salariale                  │    │
│  - Paie   │  │  - Avances en attente              │    │
│    de bord│  │  - Crédits actifs                  │    │
│  - Avances│  │  - Budgets                         │    │
│  - Budgets│  └─────────────────────────────────────┘    │
│  - Invest.│  ┌─────────────────────────────────────┐    │
│  - Reports│  │  Dernières fiches de paie           │    │
│  - Params │  │  - Tableau avec status              │    │
│          │  └─────────────────────────────────────┘    │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### Layout Agence (`/agence` — Portail Agence)
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

## 🔐 5. Système d'Autorisation Complet

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

// Absence endpoints
@Post('absences')
@Roles(Role.EMPLOYEE)
createAbsence(@Request() req, @Body() dto) { ... }

@Get('absences/pending-manager')
@Roles(Role.MANAGER)
getPendingAbsencesForManager(@Request() req) { ... }

@Patch('absences/:id/handle-manager')
@Roles(Role.MANAGER)
handleAbsenceManagerApproval(@Param('id') id, @Request() req, body) { ... }

@Get('absences/pending-rh')
@Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
getPendingAbsencesRh() { ... }

@Patch('absences/:id/handle-rh')
@Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
handleAbsenceRhApproval(@Param('id') id, @Request() req, body) { ... }

// Finance endpoints
@Get('finance/payroll')
@Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
getAllPayrolls() { ... }

@Post('finance/payroll')
@Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
createPayroll() { ... }

@Get('finance/budgets')
@Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
getAllBudgets() { ... }

@Get('finance/avances/pending')
@Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.AGENCE)
getPendingAvances() { ... }

// Agence endpoints
@Get('accounts')
@Roles(Role.AGENCE, Role.ADMIN, Role.SUPER_ADMIN)
getAllAccounts() { ... }

@Get('cards')
@Roles(Role.AGENCE, Role.ADMIN, Role.SUPER_ADMIN)
getAllCards() { ... }

@Get('credits')
@Roles(Role.AGENCE, Role.ADMIN, Role.SUPER_ADMIN)
getAllCredits() { ... }

// RH endpoints (création employé + attribution rôle)
@Post('employees')
@Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
createEmployee() { ... }
// Le RH peut assigner les rôles: EMPLOYEE, MANAGER, DIRECTEUR, 
// DIRECTEUR_CENTRAL, CHEF_SERVICE, CHEF_SERVICE_PRINCIPAL
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
  managerId: ObjectId(EMP005),     // pointe vers son N+1
  departmentId: ObjectId(...),
  branchId: ObjectId(...),
  poste: "Directeur Central",      // titre hiérarchique
  ...
}

Hiérarchie des Rôles Direction:
{
  EMPLOYEE → MANAGER (N+1)
  MANAGER → DIRECTEUR
  DIRECTEUR → DIRECTEUR_CENTRAL
  DIRECTEUR_CENTRAL → CHEF_SERVICE_PRINCIPAL
  CHEF_SERVICE_PRINCIPAL → CHEF_SERVICE
}
```

### Règles d'Autorisation

| Règle | Description |
|-------|-------------|
| **Max 2H/mois** | Une absence ne peut pas dépasser 2 heures par mois |
| **Max 30 jours/mois** | Un congé ne peut pas dépasser 30 jours par mois |
| **N+1 hiérarchique** | Seul le manager direct peut approuver les demandes |
| **RH peut forcer** | Le RH peut forcer la validation si le manager est absent |
| **Finance contrôle** | La finance valide les avances et génère les fiches de paie |
| **Agence contrôle** | L'agence gère les comptes, cartes et crédits |

---

## 📊 6. Génération Automatique des Documents

### Déclencheurs
| Événement | Document Généré | Format |
|-----------|----------------|--------|
| Nouvel employé créé | Contrat de travail | PDF auto |
| Nouvel employé créé | Attestation d'embauche | PDF auto |
| Fin de chaque mois | Fiche de paie (tous employés) | PDF auto |
| Employé en congé approuvé | Attestation d'absence (sur demande) | PDF |
| Employé en absence approuvée | Attestation d'absence | PDF |
| Demande de congé refusée | Lettre de refus (optionnel) | PDF |

### Backend Endpoint
```
POST /documents/generate/:employeeId
Body: { type: 'CONTRACT' | 'ATTESTATION' | 'PAYSLIP' | 'LEAVE_CERT' | 'ABSENCE_CERT' }
→ Génère le PDF, le stocke, renvoie l'URL
→ Notifie l'employé sur l'app mobile (onglet Documents)
```

### Scheduler Auto-Generation
```typescript
// scheduler.service.ts — Déjà existant
@Cron('0 0 1 * *') // 1er de chaque mois
async handleMonthlyDocumentGeneration() {
  const employees = await this.employeeModel.find({ status: EmployeeStatus.ACTIVE });
  for (const emp of employees) {
    await this._generateEmployeeDocuments(emp);
  }
}
```

---

## 🗂️ 7. Structure des Fichiers Modifiés/Nouveaux

### Backend (`stb-backend/src/`)
```
absence/                              ➕ NOUVEAU
  ├── absence.schema.ts
  ├── absence.service.ts
  ├── absence.controller.ts
  ├── absence.module.ts
  └── dto/create-absence.dto.ts

finance/                              ➕ NOUVEAU
  ├── finance.schema.ts (Payroll, Budget, Investment)
  ├── finance.service.ts
  ├── finance.controller.ts
  ├── finance.module.ts
  └── dto/ (payroll.dto.ts, budget.dto.ts, investment.dto.ts)

documents/
  └── documents.service.ts            ➕ Ajouter generateDocument()

scheduler/
  └── scheduler.service.ts            ✅ Déjà avec génération auto

app.module.ts                         ✅ Mis à jour (AbsenceModule + FinanceModule)
```

### Mobile (`lib/`)
```
screens/absence/                      ➕ NOUVEAU
  └── absence_request_screen.dart

screens/team/
  └── team_validation_screen.dart     ✅ Mis à jour (avec onglet Absence)

services/
  └── auth_api_service.dart           ✅ Mis à jour (endpoints absence)

providers/
  └── app_provider.dart               ✅ Mis à jour (getters absence)

screens/main_screen.dart              ✅ Mis à jour (onglet Absence)
```

### Web Dashboard (`dashboard_web_stb/src/`)
```
pages/
  ├── FinanceDashboard.tsx            ➕ NOUVEAU
  ├── FinancePayroll.tsx              ➕ NOUVEAU
  ├── FinanceBudgets.tsx              ➕ NOUVEAU
  ├── FinanceAvances.tsx              ➕ NOUVEAU
  ├── Attendance.tsx                  ➕ NOUVEAU
  ├── Reports.tsx                     ➕ NOUVEAU
  ├── Settings.tsx                    ✅ Mis à jour
  └── ... (pages existants)

components/
  ├── ProtectedRoute.tsx              ✅ Mis à jour (tous les rôles)
  └── Sidebar.tsx                     ✅ Mis à jour (financeNavGroups)

context/
  └── AuthContext.tsx                 ✅ Mis à jour (FINANCE ajouté)

App.tsx                               ✅ Mis à jour (routes /finance/*, /attendance)
```

---

## 📝 8. Phases d'Implémentation Restantes

### Phase 1 : Backend — Core Modules ✅
- [x] Absence module (schema, service, controller, module)
- [x] Finance module (schema, service, controller, module)
- [x] Documents generate endpoint
- [x] Scheduler auto document generation

### Phase 2 : Web Dashboard ✅
- [x] FinanceDashboard, FinancePayroll, FinanceBudgets, FinanceAvances
- [x] Attendance page
- [x] Reports page
- [x] Settings page (enhanced)
- [x] AuthContext with FINANCE role
- [x] Sidebar with role-aware navigation
- [x] App.tsx with role-based routing
- [x] ProtectedRoute for all roles

### Phase 3 : Mobile App ✅
- [x] AbsenceRequestScreen
- [x] TeamValidationScreen with Absence tab
- [x] MainScreen with Absence tab
- [x] AuthApiService with absence endpoints
- [x] AppProvider with absence getters

### Phase 4 : Autorisation Complète
- [x] Backend guards (`@Roles()`)
- [x] Frontend route guards (React Router)
- [x] Mobile role-based navigation
- [x] Permission-based UI rendering
- [x] Role-permission mapping seed data

### Phase 5 : Tests & Déploiement
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
| POST | `/absences` | Soumettre demande d'absence |
| GET | `/absences/my` | Mes absences |

### Direction / Manager (`MANAGER`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/leave/pending-manager` | Mes demandes en attente (N+1) |
| GET | `/leave/my-team` | Toutes les demandes de mon équipe |
| PATCH | `/leave/:id/handle-manager` | Approuver/Refuser (N+1) |
| GET | `/hierarchy/:employeeId/chain` | Voir la chaîne hiérarchique |
| GET | `/employees/directory/search?q=` | Recherche dans son équipe |
| GET | `/absences/pending-manager` | Absences en attente de mon équipe |
| PATCH | `/absences/:id/handle-manager` | Approuver/Refuser absence (N+1) |

### RH (`RH`, `ADMIN`, `SUPER_ADMIN`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/employees` | Tous les employés |
| GET | `/employees/stats` | Statistiques |
| POST | `/employees` | Créer un employé + assigner rôle |
| GET | `/leave/all?status=PENDING_N1` | Demandes en attente N+1 |
| GET | `/leave/all?status=APPROVED_N1` | Demandes en attente RH |
| PATCH | `/leave/:id/handle-rh` | Valider/refuser (RH) |
| GET | `/documents` | Tous les documents |
| POST | `/documents/generate/:id` | Générer document PDF |
| GET | `/payroll` | Fiches de paie |
| GET | `/avances/pending` | Avances prêtes pour paiement |
| GET | `/departments` | Départements |
| GET | `/branches` | Agences/branches |
| GET | `/attendance` | Planning des absences |
| GET | `/reports/absenteeism` | Rapport absentéisme |

### Finance (`FINANCE`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/finance/payroll` | Toutes les fiches de paie |
| GET | `/finance/payroll/:id` | Fiche de paie détaillée |
| POST | `/finance/payroll` | Créer fiche de paie |
| PATCH | `/finance/payroll/:id/status` | Mettre à jour statut |
| GET | `/finance/budgets` | Tous les budgets |
| POST | `/finance/budgets` | Créer budget |
| PATCH | `/finance/budgets/:id/progress` | Mettre à jour progrès |
| PATCH | `/finance/budgets/:id/status` | Changer statut |
| GET | `/finance/investments` | Tous les investissements |
| POST | `/finance/investments` | Créer investissement |
| PATCH | `/finance/investments/:id/status` | Changer statut |
| GET | `/finance/dashboard/stats` | Stats dashboard finance |

### Agence (`AGENCE`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/accounts` | Tous les comptes |
| GET | `/cards` | Toutes les cartes |
| PATCH | `/cards/:id/status` | Activer/Bloquer carte |
| GET | `/credits` | Tous les crédits |
| PATCH | `/credits/:id/decision` | Approuver/Refuser crédit |
| GET | `/avances/pending` | Avances en attente |
| PATCH | `/avances/:id/decision` | Valider/Refuser avance |
| GET | `/risk-alerts` | Alertes de risque |
| GET | `/analytics` | Analytics financiers |

### Admin (`ADMIN`, `SUPER_ADMIN`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/admin/users` | Tous les utilisateurs |
| POST | `/admin/users` | Créer un utilisateur |
| PATCH | `/admin/users/:id/roles` | Modifier les rôles |
| GET | `/admin/roles` | Tous les rôles |
| GET | `/admin/permissions` | Toutes les permissions |
| GET | `/admin/audit-logs` | Logs d'audit |
| GET | `/admin/settings` | Paramètres système |
| PATCH | `/admin/settings` | Modifier les paramètres |
