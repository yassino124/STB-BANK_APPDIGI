<div align="center">

<img src="https://img.shields.io/badge/STB-Digital%20Banking%20Platform-0055A4?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTI1NiA0OEw0ODAgMTkydjI0MEgzMlYxOTJ6Ii8+PC9zdmc+" alt="STB Banking"/>

# 🏦 STB Digital Banking Platform

**Plateforme Bancaire Numérique Complète — Projet de Fin d'Études (PFE)**
*Société Tunisienne de Banque*

[![NestJS](https://img.shields.io/badge/Backend-NestJS%20v10-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com)
[![Flutter](https://img.shields.io/badge/Mobile-Flutter%203-02569B?style=flat-square&logo=flutter)](https://flutter.dev)
[![React](https://img.shields.io/badge/Dashboard-React%20+%20Vite-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%207-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Cache-Redis%207-DC382D?style=flat-square&logo=redis)](https://redis.io)
[![Cloudinary](https://img.shields.io/badge/CDN-Cloudinary-3448C5?style=flat-square&logo=cloudinary)](https://cloudinary.com)
[![Docker](https://img.shields.io/badge/Infrastructure-Docker-2496ED?style=flat-square&logo=docker)](https://docker.com)
[![Render](https://img.shields.io/badge/Hosting-Render-000000?style=flat-square&logo=render)](https://render.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-26%20Passing-brightgreen?style=flat-square&logo=jest)](stb-backend/src)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=flat-square&logo=github-actions)](https://github.com/yassino124/STB-BANK_APPDIGI/actions)

</div>

---

## 📋 Table des Matières

- [À Propos](#-à-propos)
- [Architecture](#-architecture-système)
- [Fonctionnalités par Rôle](#-fonctionnalités-par-rôle)
- [Stack Technique](#-stack-technique)
- [Sécurité](#-sécurité)
- [CI/CD & DevOps](#️-cicd--devops)
- [Tests](#-tests)
- [Démarrage Rapide](#-démarrage-rapide)
- [Structure du Projet](#-structure-du-projet)
- [API Documentation](#-api-documentation)
- [Auteur](#-auteur)

---

## 🎯 À Propos

STB Digital Banking est une **plateforme bancaire numérique de niveau entreprise** développée dans le cadre d'un Projet de Fin d'Études à la **Société Tunisienne de Banque (STB)**.

Le système couvre l'ensemble du cycle de vie bancaire RH & Finance à travers **3 interfaces complémentaires** :

| Interface | Technologie | Utilisateurs |
|-----------|------------|--------------|
| 📱 **Application Mobile** | Flutter | Employés, Managers |
| 💻 **Dashboard Web RH** | React + Vite | RH, Managers, Finance |
| 🔧 **Backend API** | NestJS + MongoDB | Système |

---

## 🏗️ Architecture Système

```
                        ┌─────────────────────────────────────┐
                        │           CLIENTS LAYER              │
                        │                                      │
                   ┌────┴────┐              ┌─────────────────┐│
                   │📱 Mobile│              │  💻 Web Dashboard││
                   │ Flutter │              │  React + Vite   ││
                   └────┬────┘              └────────┬────────┘│
                        └──────────────┬─────────────┘         │
                                       │ HTTPS / REST API       │
                        ┌──────────────▼─────────────┐         │
                        │      🔐 Auth Gateway        │         │
                        │   JWT + Roles + Throttle    │         │
                        └──────────────┬──────────────┘         │
                                       │                         │
               ┌───────────────────────┼───────────────────────┐│
               │                       │                       ││
    ┌──────────▼──────────┐ ┌──────────▼──────────┐ ┌────────▼─┴───────┐
    │   👥 HR Modules      │ │  🏦 Banking Modules  │ │  🤖 AI & Support  │
    │  Leave · Payroll     │ │ Accounts · Cards     │ │  Copilot Gemini  │
    │  Avances · Credits   │ │ Transfer · Cheques   │ │  Notifications   │
    └──────────┬──────────┘ └──────────┬──────────┘ └──────────┬───────┘
               └───────────────────────┼───────────────────────┘
                                       │
               ┌───────────────────────┼───────────────────────┐
               │                       │                       │
      ┌────────▼────────┐    ┌─────────▼────────┐   ┌─────────▼────────┐
      │  🗄️ MongoDB 7    │    │  ⚡ Redis Cache   │   │  📊 Audit Logs   │
      │  Primary Store   │    │  Rate Limiting   │   │  Activity Trail  │
      └─────────────────┘    └──────────────────┘   └──────────────────┘
```

---

## 👥 Fonctionnalités par Rôle

### 📱 Application Mobile (Flutter)

<details>
<summary><b>👤 Employé</b></summary>

- 🔐 Authentification multi-facteur (OTP + PIN + Biométrie)
- 📊 Dashboard personnel (solde congés, avances, paie)
- 📅 Demande de congés avec workflow N+1
- 💰 Demande d'avances sur salaire
- 🏦 Consultation comptes bancaires & historique transactions
- 💳 Gestion carte bancaire (freeze/unfreeze, limites)
- 🤖 Copilot IA (Gemini) — assistant bancaire intelligent
- 📄 Téléchargement documents officiels (bulletins, attestations)
- 🔔 Notifications push temps réel

</details>

<details>
<summary><b>👔 Manager (N+1)</b></summary>

- Toutes les fonctionnalités Employé
- 🗂️ Onglet **Team** : Validation des congés par swipe (approve/reject)
- 📈 Vue équipe : soldes, absences, demandes en attente
- 🔔 Alertes instantanées pour les demandes de l'équipe

</details>

---

### 💻 Dashboard Web (React)

<details>
<summary><b>👩‍💼 RH (Ressources Humaines)</b></summary>

- 👥 Gestion complète des employés (CRUD + rôles + manager N+1)
- ✅ Validation finale des congés (après approbation manager)
- 💵 Gestion des avances et crédits
- 📊 Fiches de paie automatiques
- 📁 Gestion documentaire (upload/download/génération PDF)
- 🔍 Audit logs : traçabilité complète de toutes les actions
- 📈 Rapports et analytics RH

</details>

<details>
<summary><b>🏛️ Agence Bancaire</b></summary>

- 🏦 Gestion des comptes bancaires (création, freeze, dépôts)
- 💳 Gestion des cartes (émission, activation, blocage)
- 💸 Gestion des chèques
- 🤖 Score crédit IA pour l'évaluation des demandes
- 🚨 Détection de fraude et alertes de risque
- 📋 Gestion des bénéficiaires et virements

</details>

<details>
<summary><b>💰 Finance</b></summary>

- 💵 Gestion de la paie mensuelle
- 📊 Budgets et objectifs d'épargne
- 📈 Suivi des investissements
- 💰 Traitement des avances et crédits
- 📉 Reporting financier et KPIs

</details>

---

## ⚡ Stack Technique

### Backend — NestJS

| Module | Technologie | Rôle |
|--------|------------|------|
| API Framework | NestJS v10 (Node.js) | Architecture modulaire |
| Base de données | MongoDB 7 + Mongoose | Stockage principal |
| Cache & Queues | Redis 7 + BullMQ | Performance & jobs async |
| Fichiers & Médias | Cloudinary | CDN pour PDF et Images |
| Authentification | JWT (Access + Refresh) | Sécurité stateless |
| Logging | Winston (JSON structuré) | Observabilité production |
| Temps réel | Socket.io | Notifications live |
| IA | Google Gemini 1.5 | Copilot bancaire |
| Docs | Swagger / OpenAPI | Documentation auto |
| Tests | Jest | 26 tests unitaires |

### Infrastructure

```yaml
Services Cloud & Déploiement:
  - Render.com         → Hébergement API Cloud (Infrastructure as Code)
  - MongoDB Atlas      → Base de données Cloud
  - Cloudinary         → Stockage des documents et avatars

Services Docker Locaux:
  - MongoDB 7          → Base de données locale
  - Redis 7-alpine     → Cache + Rate Limiting + Queues
  - NestJS Backend     → API (multi-stage build optimisé)
  - React Dashboard    → Interface web (Nginx)
```

---

## 🔐 Sécurité

Le système implémente une **défense en profondeur** contre les menaces OWASP Top 10 :

| Faille OWASP | Notre Protection |
|---|---|
| **A01 - Broken Access Control (IDOR/BOLA)** | RolesGuard + ownership check sur chaque ressource |
| **A02 - Cryptographic Failures** | bcrypt pour mots de passe, JWT signé RS256 |
| **A03 - Injection** | ValidationPipe whitelist strict, Mongoose ODM |
| **A04 - Insecure Design** | Architecture RBAC multi-couches |
| **A05 - Security Misconfiguration** | Security Headers (X-Frame, XSS, CORS strict) |
| **A07 - Auth Failures** | Rate Limiting (Throttler), Brute-force protection |
| **A09 - Logging Failures** | AuditModule : chaque action tracée avec IP + DeviceID |

### Roles & Permissions

```
SUPER_ADMIN > ADMIN > RH > MANAGER > FINANCE > AGENCE > EMPLOYEE
```

Chaque endpoint API est protégé par `@Roles()` decorator + `RolesGuard` :
- Un **EMPLOYEE** ne peut voir que ses propres données
- Un **MANAGER** voit son équipe uniquement  
- **RH/ADMIN** ont accès complet avec traçabilité totale

---

## ⚙️ CI/CD & DevOps

### Pipelines GitHub Actions

```
git push origin main
      │
      ▼
┌─────────────────────────────────────────────────────┐
│                   CI PIPELINE                        │
│                                                      │
│  ① Lint & Tests (Jest — 26 cas)                     │
│  ② Security Audit (npm audit)                       │
│  ③ Build Docker Image (multi-stage)                 │
│  ④ Push → Docker Hub                               │
│  ⑤ Deploy → Staging Server                         │
└─────────────────────────────────────────────────────┘
      │
      ▼ (Pour l'app mobile)
┌─────────────────────────────────────────────────────┐
│               FLUTTER PIPELINE                       │
│                                                      │
│  ① flutter test                                     │
│  ② flutter build appbundle --release                │
│  ③ Signature cryptographique (Keystore)             │
│  ④ Upload → Google Play Internal Testing            │
└─────────────────────────────────────────────────────┘
```

### Infrastructure as Code

Tout le système démarre en **une seule commande** :

```bash
docker compose up -d
```

### Résilience — Circuit Breaker

- **TimeoutInterceptor global** : coupe toute requête > 10 secondes
- Si l'API Gemini tombe → fallback gracieux, le reste de la banque continue
- **Health Endpoint** : `GET /api/v1/health` surveille MongoDB + RAM + Disque
- **Backup automatisé** : dump MongoDB chiffré chaque nuit (rétention 7 jours)

---

## 🧪 Tests

### Résultats des Tests Unitaires

```
PASS  src/auth/auth.service.spec.ts
PASS  src/leave/leave.service.spec.ts

Test Suites : 2 passed
Tests        : 26 passed ✅
Time         : 0.525s
```

### Couverture des Tests Métier

| Scénario Testé | Résultat |
|---|---|
| Login avec mauvais mot de passe (bcrypt) | ✅ Bloqué |
| EMPLOYEE accède à route RH | ✅ 403 Forbidden |
| Demande congé > solde disponible | ✅ Refusé |
| Calcul jours ouvrables (exclusion weekends) | ✅ Correct |
| Workflow N+1 : PENDING → APPROVED_N1 → APPROVED | ✅ Validé |
| Token JWT expiré | ✅ 401 Unauthorized |

---

## 🚀 Démarrage Rapide

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (pour le mobile)
- [Node.js 20+](https://nodejs.org/) (pour le développement)

### 1. Cloner le projet

```bash
git clone https://github.com/yassino124/STB-BANK_APPDIGI.git
cd STB-BANK_APPDIGI
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
# Modifie les valeurs dans .env selon ton environnement
```

### 3. Lancer toute l'infrastructure

```bash
docker compose up -d
```

Vérifie que tout tourne :
```bash
docker ps
# ✅ stb_mongodb   Up
# ✅ stb_redis     Up  
# ✅ stb_backend   Up
```

### 4. Accéder aux interfaces

| Service | URL |
|---------|-----|
| 🔧 API Backend | http://localhost:3000 |
| 📚 Swagger Docs | http://localhost:3000/docs |
| ❤️ Health Check | http://localhost:3000/api/v1/health |
| 💻 Web Dashboard | http://localhost:8080 |

### 5. Lancer les tests

```bash
cd stb-backend
npx jest --testPathPatterns="spec" --no-coverage
```

---

## 📁 Structure du Projet

```
STB-BANK_APPDIGI/
│
├── 📱 lib/                          # Application Flutter
│   ├── screens/                     # Écrans (Dashboard, Congés, Comptes...)
│   ├── providers/                   # State management
│   └── services/                    # API services
│
├── 🔧 stb-backend/                  # API NestJS
│   ├── src/
│   │   ├── auth/                    # JWT + Guards + Strategies
│   │   ├── employees/               # Gestion employés
│   │   ├── leave/                   # Congés + workflow N+1
│   │   ├── accounts/                # Comptes bancaires
│   │   ├── audit/                   # Traçabilité complète
│   │   ├── health/                  # Monitoring endpoint
│   │   └── common/                  # Guards, Interceptors, Filters
│   └── Dockerfile                   # Multi-stage optimisé
│
├── 💻 dashboard_web_stb/            # Dashboard React
│   ├── src/
│   │   ├── pages/                   # RH, Finance, Agence...
│   │   ├── components/              # Composants réutilisables
│   │   └── context/                 # Auth + Role context
│   └── Dockerfile
│
├── 🐳 docker-compose.yml            # Infrastructure complète
├── 🔁 .github/workflows/            # CI/CD Pipelines
│   ├── backend-ci.yml               # Backend CI/CD
│   ├── web-ci.yml                   # Dashboard CI/CD
│   └── flutter-deploy.yml           # Mobile → Play Store
├── 📊 load-tests/k6-basic.js        # Tests de charge
└── 💾 scripts/backup.sh             # Backup MongoDB automatisé
```

---

## 📚 API Documentation

La documentation complète de l'API est disponible via **Swagger UI** :

```
http://localhost:3000/docs
```

L'API expose **+80 endpoints** organisés par modules :

- 🔐 **Auth** : Login, OTP, Refresh Token, Biométrie
- 👥 **Employees** : CRUD complet + rôles + hiérarchie
- 📅 **Leave** : Workflow congés N+1 complet
- 🏦 **Accounts** : Comptes, transactions, historique
- 💳 **Cards** : Cartes bancaires, limites, blocage
- 💰 **Finance** : Avances, crédits, paie, budgets
- 🤖 **AI Copilot** : Chat Gemini, analyse financière
- 📊 **Audit** : Logs complets, rapports de sécurité

---

## 👨‍💻 Auteur

**Mohamed Yassine Ouertani**
*Étudiant Ingénieur — Projet de Fin d'Études STB*

[![GitHub](https://img.shields.io/badge/GitHub-yassino124-181717?style=flat-square&logo=github)](https://github.com/yassino124)

---

<div align="center">

**🏦 STB Digital Banking Platform v2.0.0**

*Développé avec ❤️ pour moderniser l'expérience bancaire tunisienne*

</div>
