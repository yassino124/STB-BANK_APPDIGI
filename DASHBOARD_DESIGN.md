# 🎨 STB Omni-Roles — Dashboard Design Document

## Vue d'Ensemble

Ce document décrit le design complet du dashboard pour chaque rôle : RH, Finance, Agence, et Direction (Manager N+1). Il couvre le portail Web (React/Vite), l'application mobile (Flutter), et les connexions backend.

---

## 🔵 Rôle 1 : RH (Ressources Humaines)

### 🖥️ Dashboard Web — `/`

#### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  🏦 STB Portal RH     🔔 3 notifs   👤 RH | 🔄 Déconnexion   │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                       │
│  Sidebar │  Main Content                                        │
│          │                                                       │
│  Tableau │  ┌─────────────────────────────────────────────┐    │
│  de bord │  │  📊 Vue d'ensemble RH                    │    │
│          │  │                                             │    │
│  - Tableau│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐     │    │
│    de bord│  │ │ 58  │  │ 12% │  │  8  │  │ 3   │     │    │
│  - Employés│  │ │employés│ │absenté-│ │demandes│ │nouveaux│  │    │
│  - Demande│  │ │      │  │isme │  │en att.│ │mois  │     │    │
│    s      │  │ └─────┘  └─────┘  └─────┘  └─────┘     │    │
│  - Org.   │  │                                             │    │
│  - Docs   │  │  📈 Graphique: Congés par département     │    │
│  - Finance│  │  (bar chart mensuel)                       │    │
│  - Reports│  │                                             │    │
│  - Params │  │  📋 Demandes récentes                     │    │
│          │  │  - Table avec status colorisés              │    │
│          │  │  - Cliquer pour voir le détail              │    │
│          │  └─────────────────────────────────────────────┘    │
│          │                                                       │
└──────────┴──────────────────────────────────────────────────────┘
```

#### Design Tokens
- **Sidebar width**: 268px (expanded), 72px (collapsed)
- **Background**: `var(--bg-primary)` — dark navy `#0A0E1A`
- **Card background**: `rgba(255,255,255,0.03)` with glassmorphism
- **Accent color**: Electric blue `#2962FF`
- **Success**: Emerald `#10B981`
- **Warning**: Amber `#F59E0B`
- **Danger**: Coral Red `#EF4444`
- **Typography**: `var(--font-display)` for headings, system sans-serif for body
- **Border radius**: 12px (cards), 8px (buttons), 16px (modals)
- **Shadow**: `0 4px 24px rgba(0,0,0,0.3)` for cards
- **Animation**: `framer-motion` for page transitions, `flutter_animate` equivalent on mobile

#### Page: Tableau de bord (`/`)
- **Widgets**:
  - Card: "Employés en congé aujourd'hui" — nombre + avatar des employés
  - Card: "Taux d'absentéisme ce mois" — pourcentage + comparaison mois précédent
  - Card: "Demandes en attente" — nombre + bouton "Voir tout"
  - Card: "Nouveaux employés ce mois" — nombre + liste des noms
  - Graphique: Congés par département (bar chart)
  - Graphique: Absences par type (pie chart)
  - Liste: 5 dernières demandes avec status

#### Page: Employés (`/employees`)
- **Layout**: Table avec colonnes: Matricule, Nom, Prénom, Poste, Département, Agence, Status, Actions
- **Design**:
  - Search bar en haut avec icône 🔍
  - Filtres: Département, Agence, Status (actif/inactif/suspendu)
  - Bouton "Nouveau collaborateur" en haut à droite
  - Chaque ligne est cliquable → page de détail
  - Avatar circulaire avec initiales
  - Status badge: vert (actif), orange (en attente), rouge (suspendu)
- **Page de détail** (`/employees/:id`):
  - Header: Photo, Nom complet, Matricule, Poste, Status
  - Onglets: Info perso, Contrat, Financier, Historique
  - Boutons: Modifier, Générer document, Envoyer notification

#### Page: Nouveau collaborateur (`/employees/new`)
- **Layout**: Formulaire en 2 colonnes
- **Design**:
  - Section "Informations personnelles": Nom, Prénom, CIN, Date de naissance, Email, Téléphone
  - Section "Poste": Département, Agence, Poste, Manager (dropdown hiérarchique)
  - Section "Rôle": Multi-select avec les rôles disponibles (EMPLOYEE, MANAGER, DIRECTEUR, DIRECTEUR_CENTRAL, CHEF_SERVICE, CHEF_SERVICE_PRINCIPAL)
  - Section "Document": Upload du contrat (PDF)
  - Bouton "Créer le compte" en bas
  - Validation en temps réel avec messages d'erreur

#### Page: Demandes (`/requests`)
- **Layout**: Tableau avec filtres par statut
- **Design**:
  - Tabs: Tous | En attente N+1 | Validées N+1 | En attente RH | Approuvées | Rejetées
  - Chaque ligne: Employé, Type (CONGÉ/ABSENCE), Date début → Fin, Nombre de jours, Status badge
  - Status badge: orange (en attente), vert (approuvé), rouge (rejeté)
  - Cliquer → modal avec historique complet de la demande
  - Bouton "Forcer la validation" pour RH (si manager absent)

#### Page: Documents (`/documents`)
- **Layout**: Grille de cartes ou tableau
- **Design**:
  - Filtres: Par employé, par type (contrat, attestation, fiche de paie, certificat), par date
  - Chaque document: Icône type + nom + date + bouton télécharger
  - Bouton "Générer" pour créer un nouveau document
  - Progress bar si génération en cours

#### Page: Présence (`/attendance`)
- **Layout**: Vue calendrier + tableau
- **Design**:
  - Calendrier mensuel avec dots colorés (vert=présent, rouge=absent, orange=congé)
  - Cliquer sur un jour → liste des absences ce jour-là
  - Tableau: Employé, Jours de congé restants, Absences ce mois, Status
- **Condition max 2H/mois**: Badge jaune si employé proche de la limite

#### Page: Rapports (`/reports`)
- **Layout**: Graphiques + tableaux exportables
- **Design**:
  - Rapport d'absentéisme: Graphique en barres par département
  - Rapport de congés: Graphique circulaire par type
  - Rapport financier: Tableau avec totaux
  - Bouton "Exporter PDF" et "Exporter Excel"

#### Page: Paramètres (`/settings`)
- **Layout**: Formulaire organisé par sections
- **Design**:
  - Section "Départements": CRUD pour les départements
  - Section "Agences/Branches": CRUD pour les agences
  - Section "Types de congés": Configuration des types et soldes
  - Section "Règles d'autorisation": Max 2H pour absence, Max 30 jours congé/mois
  - Section "Rôles": Attribution de rôles aux employés

---

### 📱 Application Mobile — RH Hub

#### Onglet RH Hub (`/rh`)
```
📱 RH Hub Screen
┌─────────────────────────────────────┐
│  🏦 STB RH Hub                      │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  📊 Statistiques rapides    │    │
│  │  Employés: 58  |  En congé: 8│    │
│  │  En attente: 3  |  Nouveaux: 2│   │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─ Liste rapide ─────────────────┐ │
│  │ 👤 Ahmed Ben Ali — En congé    │ │
│  │ 👤 Fatma Kerroumi — En attente │ │
│  │ 👤 Mohamed Ouertani — Nouveau  │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─ Actions rapides ──────────────┐ │
│  │ 📝 Nouvelle demande de congé   │ │
│  │ 📄 Générer document            │ │
│  │ 📊 Voir rapports               │ │
│  │ 👥 Gérer employés              │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ───────────────────────────────────│
│  🏠 | RH Hub | Annuaire | Copilot | Absence | Profil │
└─────────────────────────────────────┘
```

#### Design Mobile Tokens
- **Primary color**: `#2962FF` (electric blue)
- **Background**: `#0A0E1A` (dark navy) in dark mode, `#F8FAFC` in light mode
- **Card background**: Glassmorphic with `backdrop-filter: blur(20px)`
- **Text primary**: White in dark, `#0F172A` in light
- **Text muted**: `#94A3B8` in dark, `#475569` in light
- **Border**: `rgba(255,255,255,0.06)` in dark, `rgba(0,0,0,0.04)` in light
- **Border radius**: 16px for cards, 12px for buttons, 24px for pills
- **Font size**: 14px body, 16px headings, 12px captions
- **Spacing**: 16px standard padding, 8px between elements
- **Animation**: `flutter_animate` with staggered delays
- **Haptic feedback**: Light impact on tap, medium on navigation

---

## 🟢 Rôle 2 : Finance

### 🖥️ Dashboard Web — `/finance`

#### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  🏦 STB Finance     🔔 2 alertes   👤 Finance | 🔄           │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                       │
│  Sidebar │  Main Content                                        │
│          │                                                       │
│  Finance │  ┌─────────────────────────────────────────────┐    │
│  Sidebar │  │  💰 Vue d'ensemble financière             │    │
│          │  │                                             │    │
│  - Paie   │  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐     │    │
│    de bord│  │ │4.2M │  │ 18  │  │  5  │  │ 2.1M│     │    │
│  - Avances│  │ │Masse  │ │Avances│ │Crédits│ │Dépenses│  │    │
│    de bord│  │ │salaire│ │en att.│ │actifs │ │mensuell│  │    │
│  - Budgets│  │ └─────┘  └─────┘  └─────┘  └─────┘     │    │
│  - Invest.│  │                                             │    │
│  - Reports│  │  📈 Graphique: Masse salariale (6 mois)   │    │
│  - Params │  │  (line chart avec tendance)                │    │
│          │  │                                             │    │
│          │  │  📋 Dernières fiches de paie               │    │
│          │  │  - Tableau avec statut                      │    │
│          │  └─────────────────────────────────────────────┘    │
│          │                                                       │
└──────────┴──────────────────────────────────────────────────────┘
```

#### Page: Tableau de bord Finance (`/finance`)
- **Widgets**:
  - Card: "Masse salariale mensuelle" — 4.2M TND + comparaison mois précédent
  - Card: "Avances en attente" — 18 demandes + bouton "Voir"
  - Card: "Crédits actifs" — 5 crédits en cours
  - Card: "Dépenses du mois" — 2.1M TND
  - Graphique: Masse salariale sur 6 mois (line chart)
  - Graphique: Répartition des dépenses (donut chart)
  - Alertes: Paiements en retard, dépassements budgétaires

#### Page: Fiches de Paie (`/finance/payroll`)
- **Layout**: Tableau + détails
- **Design**:
  - Filtres: Mois, Département, Statut
  - Tableau: Employé, Mois, Salaire brut, Déductions, Net, Statut
  - Statut badge: bleu (générée), vert (validée), orange (en attente)
  - Bouton "Générer" pour créer les fiches du mois
  - Bouton "Exporter PDF" en masse
  - Cliquer sur une ligne → modal avec le détail complet

#### Page: Budgets (`/finance/budgets`)
- **Layout**: Tableau + graphique
- **Design**:
  - Tableau: Département, Budget alloué, Dépensé, Restant, % utilisé
  - Barre de progression pour chaque département
  - Alerte rouge si >100% utilisé
  - Bouton "Créer un budget"
  - Graphique: Budget vs Réel (grouped bar chart)

#### Page: Avances (`/finance/avances`)
- **Layout**: Tableau avec actions
- **Design**:
  - Tableau: Employé, Montant, Date demande, Status manager, Status finance, Actions
  - Filtres: En attente, Approuvée, Refusée
  - Boutons: "Valider pour paiement" / "Refuser"
  - Historique des avances traitées

#### Page: Investissements (`/finance/investments`)
- **Layout**: Grille de cartes + tableau
- **Design**:
  - Carte par investissement: Nom, Montant, Rendement, Date début, Date fin
  - Rendement en pourcentage avec couleur (vert >0, rouge <0)
  - Alertes de risque

---

### 📱 Application Mobile — Finance (via RH Hub)

Les fonctionnalités Finance sont accessibles depuis l'onglet RH Hub sur mobile, avec des sections dédiées :

- **Section Paie**: Fiches de paie du mois en cours
- **Section Avances**: Avances en attente de validation
- **Section Budgets**: Vue des budgets par département
- **Section Investissements**: Rendement des investissements

---

## 🟠 Rôle 3 : Agence

### 🖥️ Dashboard Web — `/agence`

#### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  🏦 STB Agence    🔔 5 alertes   👤 Financeur | 🔄           │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                       │
│  Sidebar │  Main Content                                        │
│  Agence  │                                                       │
│  Sidebar │  ┌─────────────────────────────────────────────┐    │
│          │  │  🏦 Vue d'ensemble Agence                  │    │
│  - Compt.│  │                                             │    │
│  - Cartes │  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐     │    │
│    de bord│  │ │12.5 │  │  8  │  │  3  │  │  2  │     │    │
│  - Crédits│  │ │Mouve- │ │Cartes│ │Crédits│ │Alertes│    │    │
│    de bord│  │ │ments  │ │actives│ │en att.│ │fraude │    │    │
│  - Avances│  │ │mois   │ │       │ │       │ │       │    │    │
│  - Alertes│  │ └─────┘  └─────┘  └─────┘  └─────┘     │    │
│  - Rapports│  │                                             │    │
│  - Params │  │  📊 Graphique: Transactions par jour       │    │
│          │  │  (area chart)                                │    │
│          │  │                                             │    │
│          │  │  📋 Demandes de crédits en attente         │    │
│          │  │  - Avec score IA et décision rapide         │    │
│          │  └─────────────────────────────────────────────┘    │
│          │                                                       │
└──────────┴──────────────────────────────────────────────────────┘
```

#### Page: Tableau de bord Agence (`/agence`)
- **Widgets**:
  - Card: "Volume transactions ce mois" — 12.5M TND
  - Card: "Cartes actives" — 8 / 10 total
  - Card: "Crédits en attente" — 3 demandes avec scores IA
  - Card: "Alertes fraude" — 2 en cours
  - Graphique: Transactions par jour (area chart)
  - Liste: Demandes de crédits avec score IA
  - Alertes: Cartes bloquées, transactions suspectes

#### Page: Comptes Bancaires (`/agence/accounts`)
- **Layout**: Tableau + détail
- **Design**:
  - Tableau: Employé, IBAN, Solde, Type, Status, Actions
  - Status badge: vert (actif), rouge (bloqué), gris (fermé)
  - Boutons: Activer, Bloquer, Fermer
  - Cliquer → modal avec historique des mouvements

#### Page: Cartes (`/agence/cards`)
- **Layout**: Grille de cartes
- **Design**:
  - Chaque carte: Photo de la carte, Nom du titulaire, Type (Débit/Crédit), Status
  - Actions: Activer, Bloquer, Détruire
  - Alertes: Carte bloquée, carte expirée

#### Page: Crédits (`/agence/credits`)
- **Layout**: Tableau + détails
- **Design**:
  - Tableau: Employé, Montant, Durée, Score IA, Status, Actions
  - Score IA affiché avec code couleur: vert (bon), orange (moyen), rouge (risque)
  - Boutons: Approuver, Refuser
  - Détail: Justificatifs, historique de crédit

#### Page: Avances (`/agence/avances`)
- **Layout**: Tableau avec validation
- **Design**:
  - Tableau: Employé, Montant, Date, Status manager, Actions
  - Les avances validées par les managers arrivent ici pour validation finale
  - Boutons: Valider pour paiement, Refuser

#### Page: Alertes & Fraude (`/agence/risk`)
- **Layout**: Liste d'alertes + score de risque
- **Design**:
  - Alertes: Transaction suspecte, carte bloquée, connexion inhabituelle
  - Score de risque par employé (0-100)
  - Historique des alertes

---

### 📱 Application Mobile — Agence

Les fonctionnalités Agence sont accessibles depuis l'onglet dédié sur mobile :

- **Onglet Agence**: Vue d'ensemble avec compteurs
- **Section Comptes**: Liste des comptes bancaires
- **Section Cartes**: Gestion des cartes (activer/bloquer)
- **Section Crédits**: Demandes avec scores IA
- **Section Avances**: Validation des avances managers

---

## 🔴 Rôle 4 : Direction (Manager N+1)

### 📱 Application Mobile — Direction (Primary Platform)

#### Onglet Team (`/team`) — Swipe-to-Approve
```
📱 Team Validation Screen
┌─────────────────────────────────────┐
│  👥 Validation Équipe               │
│  ┌───┬──────────────────────────┐   │
│  │Congé│       Absence          │   │
│  └───┴──────────────────────────┘   │
│                                     │
│  🔵 3 demandes en attente           │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ┌─────────────────────────┐ │    │
│  │ │ 👤 Ahmed Ben Ali       │ │    │
│  │ │    EMP001 • Chef Tech   │ │    │
│  │ │    📅 01/08 → 05/08     │ │    │
│  │ │    5 jours • Congé maladie│ │   │
│  │ │    Solde restant: 25 jours│ │  │
│  │ │                         │ │    │
│  │ │  ← Refuser   Approuver →│ │    │
│  │ └─────────────────────────┘ │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ┌─────────────────────────┐ │    │
│  │ │ 👤 Fatma Kerroumi      │ │    │
│  │ │    EMP002 • Analyste    │ │    │
│  │ │    📅 15/08 → 15/08     │ │    │
│  │ │    1 jour • Congé repos │ │    │
│  │ │    Solde restant: 28 jours│ │  │
│  │ │                         │ │    │
│  │ │  ← Refuser   Approuver →│ │    │
│  │ └─────────────────────────┘ │    │
│  └─────────────────────────────┘    │
│                                     │
│  ───────────────────────────────────│
│  🏠 | RH Hub | Annuaire | Copilot | Team | Absence | Profil │
└─────────────────────────────────────┘
```

#### Onglet Absence (`/absence`) — Swipe-to-Approve
```
📱 Absence Validation Screen
┌─────────────────────────────────────┐
│  📅 Validation Absences             │
│  ┌───┬──────────────────────────┐   │
│  │Congé│      Absence           │   │
│  └───┴──────────────────────────┘   │
│                                     │
│  🟡 2 absences en attente           │
│  ⚠️ Max 2H/mois — Sans solde déduit│
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ┌─────────────────────────┐ │    │
│  │ │ 👤 Karim Hadjeri       │ │    │
│  │ │    EMP003 • Développeur │ │    │
│  │ │    📅 29/07 • 2H       │ │    │
│  │ │    Type: Retard         │ │    │
│  │ │    ⚠️ Reste: 1.5H ce mois│ │  │
│  │ │                         │ │    │
│  │ │  ← Refuser   Approuver →│ │    │
│  │ └─────────────────────────┘ │    │
│  └─────────────────────────────┘    │
│                                     │
│  ───────────────────────────────────│
│  🏠 | RH Hub | Annuaire | Copilot | Team | Absence | Profil │
└─────────────────────────────────────┘
```

#### Onglet RH Hub (`/rh`)
```
📱 RH Hub Screen (Direction)
┌─────────────────────────────────────┐
│  🏦 Direction RH Hub                │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  📊 Mon équipe              │    │
│  │  12 employés | 3 en congé   │    │
│  │  2 en attente de validation │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─ Mes demandes ──────────────────┐ │
│  │ 📋 Congé: 1 en attente         │ │
│  │ 💰 Avance: 0                   │ │
│  │ 📊 Crédit: 0                   │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─ Actions rapides ──────────────┐ │
│  │ 📝 Nouvelle demande de congé   │ │
│  │ 💵 Demander une avance         │ │
│  │ 📄 Mes documents               │ │
│  │ 📊 Mes crédits en cours        │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ───────────────────────────────────│
│  🏠 | RH Hub | Annuaire | Copilot | Team | Absence | Profil │
└─────────────────────────────────────┘
```

#### Onglet Profil (`/profile`)
```
📱 Profile Screen
┌─────────────────────────────────────┐
│  👤 Yassine Ouertani               │
│  Directeur Central • EMP005        │
│  Direction Générale                 │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 📄 Contrat de travail      │    │
│  │ 📊 Fiches de paie          │    │
│  │ 📋 Mes demandes de congé   │    │
│  │ 💰 Mes avances             │    │
│  │ 📊 Mes crédits             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─ Paramètres ───────────────────┐ │
│  │ 🌐 Langue: Français           │ │
│  │ 🌙 Thème: Sombre              │ │
│  │ 🔐 Biométrie: Activée         │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─ Déconnexion ──────────────────┐ │
│  │ 🚪 Se déconnecter             │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🔗 Connexions Backend par Page

### Backend API Endpoints

| Page Web | Endpoint Backend | Méthode | Rôle requis |
|----------|-----------------|---------|-------------|
| `/` (Dashboard) | `/employees/stats` | GET | RH, ADMIN, SUPER_ADMIN |
| `/` (Dashboard) | `/leave/stats` | GET | RH, ADMIN, SUPER_ADMIN |
| `/` (Dashboard) | `/avances/pending` | GET | RH, ADMIN, SUPER_ADMIN, FINANCE |
| `/employees` | `/employees` | GET | RH, ADMIN, SUPER_ADMIN |
| `/employees/new` | `/employees` | POST | RH, ADMIN, SUPER_ADMIN |
| `/employees/:id` | `/employees/:id` | GET | RH, ADMIN, SUPER_ADMIN |
| `/requests` | `/leave/all` | GET | RH, ADMIN, SUPER_ADMIN |
| `/requests` | `/leave/pending-rh` | GET | RH, ADMIN, SUPER_ADMIN |
| `/requests/:id/handle-rh` | `/leave/:id/handle-rh` | PATCH | RH, ADMIN, SUPER_ADMIN |
| `/documents` | `/documents` | GET | RH, ADMIN, SUPER_ADMIN |
| `/documents/generate/:id` | `/documents/generate/:id` | POST | RH, ADMIN, SUPER_ADMIN |
| `/attendance` | `/absences` | GET | RH, ADMIN, SUPER_ADMIN, FINANCE |
| `/reports` | `/reports/absenteeism` | GET | RH, ADMIN, SUPER_ADMIN |
| `/settings` | `/settings` | GET/PUT | RH, ADMIN, SUPER_ADMIN |
| `/finance` | `/finance/dashboard` | GET | FINANCE, RH, ADMIN |
| `/finance/payroll` | `/finance/payroll` | GET | FINANCE, RH, ADMIN |
| `/finance/payroll` | `/finance/payroll` | POST | FINANCE, RH, ADMIN |
| `/finance/budgets` | `/finance/budgets` | GET | FINANCE, RH, ADMIN |
| `/finance/avances` | `/finance/avances/pending` | GET | FINANCE, RH, ADMIN |
| `/finance/avances/:id` | `/finance/avances/:id` | PATCH | FINANCE, RH, ADMIN |
| `/agence` | `/agence/dashboard` | GET | AGENCE, ADMIN |
| `/agence/accounts` | `/accounts` | GET | AGENCE, ADMIN |
| `/agence/cards` | `/cards` | GET | AGENCE, ADMIN |
| `/agence/credits` | `/credits` | GET | AGENCE, ADMIN |
| `/agence/credits/:id` | `/credits/:id/decision` | PATCH | AGENCE, ADMIN |
| `/agence/avances` | `/avances/pending` | GET | AGENCE, ADMIN |
| `/agence/avances/:id` | `/avances/:id/decision` | PATCH | AGENCE, ADMIN |

### Mobile API Endpoints (AuthApiService)

| Fonction Mobile | Endpoint | Méthode | Rôle requis |
|----------------|----------|---------|-------------|
| `getPendingApprovals()` | `/leave/pending-manager` | GET | MANAGER |
| `getTeamRequests()` | `/leave/my-team` | GET | MANAGER |
| `handleLeaveApproval()` | `/leave/:id/handle-manager` | PATCH | MANAGER |
| `getPendingAbsencesForManager()` | `/absences/pending-manager` | GET | MANAGER |
| `handleAbsenceManagerApproval()` | `/absences/:id/handle-manager` | PATCH | MANAGER |
| `createAbsence()` | `/absences` | POST | EMPLOYEE |
| `getMyAbsences()` | `/absences/my` | GET | EMPLOYEE |
| `cancelAbsence()` | `/absences/:id/cancel` | PATCH | EMPLOYEE |
| `getMyConges()` | `/conges/my` | GET | EMPLOYEE |
| `createConge()` | `/conges` | POST | EMPLOYEE |
| `getMyAvances()` | `/avances/my` | GET | EMPLOYEE |
| `createAvance()` | `/avances` | POST | EMPLOYEE |
| `getMyPayrolls()` | `/payroll/my` | GET | EMPLOYEE |
| `getMyCredits()` | `/credits/my` | GET | EMPLOYEE |
| `getMyAccounts()` | `/accounts/my` | GET | EMPLOYEE |
| `getMyCards()` | `/cards/my` | GET | EMPLOYEE |
| `getMyDocuments()` | `/documents/my` | GET | EMPLOYEE |
| `getMyPrimes()` | `/primes/my` | GET | EMPLOYEE |
| `getMyRequests()` | `/requests/my-requests` | GET | EMPLOYEE |

---

## 🎨 Design System Commun

### Couleurs

| Token | Valeur | Utilisation |
|-------|--------|-------------|
| `--stb-blue-700` | `#1A3A6B` | Sidebar background |
| `--stb-blue-600` | `#2962FF` | Active nav, buttons |
| `--stb-electric` | `#4DABF7` | Accent, highlights |
| `--bg-primary` | `#0A0E1A` | Main background (dark) |
| `--bg-sidebar` | `#0D1B2A` | Sidebar background |
| `--text-primary` | `#FFFFFF` | Primary text |
| `--text-secondary` | `#94A3B8` | Secondary text |
| `--text-muted` | `#64748B` | Muted text |
| `--emerald` | `#10B981` | Success, approved |
| `--coral-red` | `#EF4444` | Danger, rejected |
| `--amber` | `#F59E0B` | Warning, pending |
| `--border` | `rgba(255,255,255,0.06)` | Border color |

### Typography

| Token | Valeur | Utilisation |
|-------|--------|-------------|
| `--font-display` | `Inter, sans-serif` | Headings, titles |
| `--text-xs` | `0.75rem` | Captions, labels |
| `--text-sm` | `0.875rem` | Body text |
| `--text-base` | `1rem` | Paragraphs |
| `--text-lg` | `1.125rem` | Subheadings |
| `--text-xl` | `1.25rem` | Card titles |
| `--text-2xl` | `1.5rem` | Page titles |
| `--font-weight-bold` | `700` | Headings |
| `--font-weight-semibold` | `600` | Subheadings |

### Spacing

| Token | Valeur | Utilisation |
|-------|--------|-------------|
| `--space-xs` | `4px` | Small gaps |
| `--space-sm` | `8px` | Element spacing |
| `--space-md` | `16px` | Standard padding |
| `--space-lg` | `24px` | Section spacing |
| `--space-xl` | `32px` | Page padding |
| `--r-md` | `12px` | Border radius medium |
| `--r-lg` | `16px` | Border radius large |
| `--r-xl` | `24px` | Border radius extra large |

### Animations

| Token | Valeur | Utilisation |
|-------|--------|-------------|
| `--transition-fast` | `150ms` | Hover states |
| `--transition-normal` | `300ms` | Page transitions |
| `--transition-slow` | `500ms` | Modal appearances |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Smooth animations |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Balanced animations |

### Mobile Design Tokens (Flutter)

| Token | Valeur | Utilisation |
|-------|--------|-------------|
| `AppTheme.electricBlue` | `Color(0xFF2962FF)` | Primary accent |
| `AppTheme.emerald` | `Color(0xFF10B981)` | Success |
| `AppTheme.coralRed` | `Color(0xFFEF4444)` | Danger |
| `AppTheme.textPrimaryDark` | `Color(0xFFFFFFFF)` | Dark mode text |
| `AppTheme.textPrimaryLight` | `Color(0xFF0F172A)` | Light mode text |
| `AppTheme.textMutedDark` | `Color(0xFF94A3B8)` | Dark mode muted |
| `AppTheme.textMutedLight` | `Color(0xFF475569)` | Light mode muted |
| `AppTheme.cardDark` | `Color(0xFF1A1A2E)` | Dark card bg |
| `AppTheme.cardLight` | `Color(0xFFF8FAFC)` | Light card bg |

---

## 📱 Flux Utilisateur par Rôle

### Flux Employé (Standard)
```
Login → Dashboard (solde, compte, cartes)
  → RH Hub (mes demandes, avances, crédits, documents)
  → Annuaire (recherche collègues)
  → Copilot IA (analyse dépenses, conseils)
  → Absence (nouvelle demande max 2H)
  → Profil (contrat, fiches de paie, paramètres)
```

### Flux Direction / Manager (N+1)
```
Login → Dashboard (badge notifications)
  → Team (swipe-to-approve congés + absences)
  → RH Hub (mes demandes, avances, crédits)
  → Annuaire (recherche dans équipe)
  → Copilot IA
  → Absence (gestion absences équipe, max 2H)
  → Profil
```

### Flux RH
```
Login → Dashboard (statistiques globales)
  → Employés (annuaire, création, rôles)
  → Demandes (suivi tous statuts)
  → Documents (génération, téléchargement)
  → Présence (calendrier, taux absentéisme)
  → Finance (validation avances, fiches paie)
  → Rapports (export PDF/Excel)
  → Paramètres (départements, règles)
```

### Flux Finance
```
Login → Finance Dashboard (vue d'ensemble)
  → Paie (fiches, génération, export)
  → Budgets (suivi par département)
  → Avances (validation pour paiement)
  → Investissements (suivi rendement)
  → Rapports financiers
```

### Flux Agence
```
Login → Agence Dashboard (vue d'ensemble)
  → Comptes (gestion comptes employés)
  → Cartes (activation/blocage)
  → Crédits (décisions avec score IA)
  → Avances (validation finale)
  → Alertes & Fraude
  → Rapports
```

---

## 🔐 Règles d'Autorisation

### Backend Guards
```
@Roles(Role.EMPLOYEE)  → Accès aux endpoints personnels
@Roles(Role.MANAGER)   → Accès aux endpoints N+1 (validation)
@Roles(Role.RH)        → Accès complet RH
@Roles(Role.FINANCE)   → Accès aux endpoints financiers
@Roles(Role.AGENCE)    → Accès aux endpoints agence
@Roles(Role.ADMIN)     → Accès à tout
@Roles(Role.SUPER_ADMIN) → Accès à tout + paramètres système
```

### Frontend Guards
```
ProtectedRoute allowedRoles={['RH', 'ADMIN', 'SUPER_ADMIN']}
  → Seuls les rôles autorisés peuvent accéder à la page

Sidebar navGroups = isAgence ? agenceNavGroups 
                   : isFinance ? financeNavGroups 
                   : isDirection ? directionNavGroups 
                   : rhNavGroups
  → Navigation adaptée au rôle
```

### Règles métier
| Règle | Description |
|-------|-------------|
| Max 2H/mois | Une absence ne peut pas dépasser 2 heures par mois |
| Max 30 jours/mois | Un congé ne peut pas dépasser 30 jours par mois |
| N+1 hiérarchique | Seul le manager direct peut approuver les demandes |
| RH peut forcer | Le RH peut forcer la validation si le manager est absent |
| Finance contrôle | La finance valide les avances et génère les fiches de paie |
| Agence contrôle | L'agence gère les comptes, cartes et crédits |
| Score IA | L'agence utilise le score IA pour les décisions de crédit |
