---
title: "Conception et Développement d'une Plateforme Omni-Banking pour la Société Tunisienne de Banque (STB)"
subtitle: "Rapport de Stage de Fin d'Études - Cycle Ingénieur"
author: "Mohamed Yassine Ouertani"
date: "Août 2026"
institution: "École Supérieure Privée d'Ingénierie et de Technologies (ESPRIT)"
company: "Société Tunisienne de Banque (STB)"
duration: "2 mois (Juillet - Août 2026)"
---

<div style="page-break-after: always;"></div>

# 📋 TABLE DES MATIÈRES

## PARTIE 1: PRÉSENTATION GÉNÉRALE
1. [Introduction Générale](#1-introduction-générale)
2. [Contexte du Projet](#2-contexte-du-projet)
3. [Organisme d'Accueil](#3-organisme-daccueil)
4. [Problématique](#4-problématique)
5. [Objectifs du Projet](#5-objectifs-du-projet)

## PARTIE 2: ÉTUDE PRÉALABLE
6. [Analyse de l'Existant](#6-analyse-de-lexistant)
7. [Critique de l'Existant](#7-critique-de-lexistant)
8. [Solution Proposée](#8-solution-proposée)
9. [Méthodologie de Développement](#9-méthodologie-de-développement)
10. [Planification du Projet](#10-planification-du-projet)

## PARTIE 3: CONCEPTION ET ARCHITECTURE
11. [Spécification des Besoins](#11-spécification-des-besoins)
12. [Diagrammes UML](#12-diagrammes-uml)
13. [Architecture Technique](#13-architecture-technique)
14. [Modèle de Données](#14-modèle-de-données)
15. [Design Patterns Utilisés](#15-design-patterns-utilisés)

## PARTIE 4: RÉALISATION
16. [Environnement de Développement](#16-environnement-de-développement)
17. [Backend - API RESTful](#17-backend-api-restful)
18. [Application Mobile](#18-application-mobile)
19. [Dashboard Web](#19-dashboard-web)
20. [Sécurité et Authentification](#20-sécurité-et-authentification)

## PARTIE 5: RÉSULTATS ET PERSPECTIVES
21. [Tests et Validation](#21-tests-et-validation)
22. [Captures d'Écran](#22-captures-décran)
23. [Difficultés Rencontrées](#23-difficultés-rencontrées)
24. [Conclusion Générale](#24-conclusion-générale)
25. [Perspectives d'Évolution](#25-perspectives-dévolution)

## ANNEXES
- [Annexe A: Glossaire](#annexe-a-glossaire)
- [Annexe B: Bibliographie](#annexe-b-bibliographie)
- [Annexe C: Code Source (Extraits)](#annexe-c-code-source)

<div style="page-break-after: always;"></div>

# PARTIE 1: PRÉSENTATION GÉNÉRALE

## 1. Introduction Générale

### 1.1 Contexte Global

Dans un monde de plus en plus digitalisé, la transformation numérique des institutions bancaires n'est plus une option mais une nécessité stratégique. Les banques traditionnelles font face à une pression croissante pour moderniser leurs systèmes d'information et offrir des services digitaux comparables à ceux des fintechs émergentes.

La Société Tunisienne de Banque (STB), établissement bancaire majeur en Tunisie, s'inscrit dans cette démarche de transformation digitale en cherchant à moderniser son système de gestion des ressources humaines et ses services bancaires internes.

### 1.2 Motivation du Projet

Ce projet s'inscrit dans le cadre de mon stage de fin d'études d'ingénieur à ESPRIT. Il représente une opportunité unique d'appliquer les connaissances théoriques acquises durant ma formation et de contribuer à un projet d'envergure ayant un impact réel sur l'efficacité opérationnelle d'une institution bancaire.

### 1.3 Objectif du Rapport

Ce rapport vise à documenter l'ensemble du processus de conception et de développement de la plateforme STB Omni-Banking, depuis l'analyse des besoins jusqu'à la mise en œuvre de la solution, en passant par les phases de conception, d'architecture et de réalisation.

<div style="page-break-after: always;"></div>

## 2. Contexte du Projet

### 2.1 Présentation du Projet

**Nom du Projet**: STB Omni-Banking Platform  
**Type**: Plateforme multi-canaux (Mobile + Web + Backend)  
**Domaine**: Banking & Human Resources Management  
**Durée**: 2 mois (8 semaines)  
**Date de réalisation**: Juillet - Août 2026

### 2.2 Cadre du Stage

Ce projet a été réalisé dans le cadre d'un stage de fin d'études au sein de la Direction des Systèmes d'Information de la STB. Le stage s'est déroulé sur une période de 2 mois, permettant une immersion complète dans l'environnement professionnel bancaire.

### 2.3 Équipe Projet

- **Stagiaire Ingénieur**: Mohamed Yassine Ouertani
- **Encadrant Académique**: [Nom de l'encadrant ESPRIT]
- **Encadrant Professionnel**: [Nom du responsable STB]
- **Direction**: Direction des Systèmes d'Information (DSI)

### 2.4 Positionnement Stratégique

Le projet s'inscrit dans le plan stratégique de transformation digitale de la STB pour la période 2025-2030, visant à:
- Moderniser les processus RH
- Digitaliser les services bancaires internes
- Améliorer l'expérience collaborateur
- Optimiser l'efficacité opérationnelle

<div style="page-break-after: always;"></div>

## 3. Organisme d'Accueil

### 3.1 Présentation de la STB

**Nom**: Société Tunisienne de Banque  
**Secteur**: Services Bancaires  
**Date de création**: 1958  
**Siège social**: Tunis, Tunisie  
**Effectif**: +2000 employés  
**Réseau**: 120+ agences à travers la Tunisie

### 3.2 Historique

La Société Tunisienne de Banque (STB) est l'une des plus anciennes institutions bancaires de Tunisie. Créée en 1958, elle joue un rôle majeur dans le financement de l'économie tunisienne et accompagne les particuliers, les professionnels et les entreprises dans leurs projets.

### 3.3 Activités Principales

- **Banque de détail**: Comptes courants, épargne, crédits particuliers
- **Banque des entreprises**: Financement PME/PMI, crédit d'investissement
- **Banque d'affaires**: Corporate banking, syndication
- **Banque digitale**: Services en ligne, mobile banking

### 3.4 Valeurs et Mission

**Mission**: Accompagner le développement économique de la Tunisie en offrant des solutions financières innovantes et accessibles.

**Valeurs**:
- Excellence opérationnelle
- Innovation et transformation digitale
- Proximité client
- Responsabilité sociale

### 3.5 Direction des Systèmes d'Information

La DSI de la STB compte environ 50 collaborateurs répartis en plusieurs pôles:
- **Développement et Intégration**
