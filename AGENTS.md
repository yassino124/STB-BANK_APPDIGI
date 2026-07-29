# STB Omni-Roles — Agent Memory

## Architecture Overview

### Backend (NestJS/MongoDB)
- `stb-backend/` — NestJS backend with modules for all features
- Key modules: auth, employees, leave, hierarchy, avances, credits, payroll
- Role enum: `src/common/enums/role.enum.ts` — EMPLOYEE, MANAGER, RH, AGENCE, FINANCE, ADMIN, SUPER_ADMIN
- Hierarchy: Employee schema has `managerId` field (N+1 tree)
- State machine: Leave statuses flow PENDING_N1 → APPROVED_N1 → PENDING_RH → APPROVED

### Mobile (Flutter)
- `lib/` — Flutter app with role-aware navigation
- Manager tab: `lib/screens/team/team_validation_screen.dart` — Swipe-to-approve cards (TODO)
- AppProvider: role getters (`isManager`, `isRH`, `isFinance`)
- AuthApiService: manager endpoints `getPendingApprovals()`, `getTeamRequests()`, `handleLeaveApproval()` (TODO)

### Web Dashboard (React/Vite)
- `dashboard_web_stb/` — React web portal
- AuthContext supports roles: RH, ADMIN, SUPER_ADMIN, AGENCE, MANAGER, FINANCE
- Sidebar is role-aware: shows different nav for RH vs AGENCE vs FINANCE
- NewEmployee form: RH can assign roles + select manager (N+1)
- Agence Dashboard: `src/pages/AgenceDashboard.tsx`
- ProtectedRoute: `src/components/ProtectedRoute.tsx`

## Key Files Changed
- `stb-backend/src/employees/employee.schema.ts` — Has `roles: Role[]` and `managerId: ObjectId`
- `dashboard_web_stb/src/pages/NewEmployee.tsx` — Added role selection + manager (N+1) dropdown
- `dashboard_web_stb/src/components/Sidebar.tsx` — Role-aware sidebar (RH, AGENCE, FINANCE, MANAGER views)
- `dashboard_web_stb/src/App.tsx` — Role-based routing

## N+1 Workflow State Machine (Leave) - TODO
1. Employee submits → PENDING_N1 (assigned to managerId)
2. Manager approves via swipe → APPROVED_N1
3. RH validates → APPROVED (balance deducted)
4. Manager or RH can reject at any step → REJECTED

## Roles & Access

| Role | Dashboard Web | Mobile App | Permissions |
|------|--------------|------------|-------------|
| **EMPLOYEE** | ❌ No access | ✅ Full app | View own data, submit requests |
| **MANAGER** | ✅ Limited | ✅ Full app + Team tab | Approve team leaves (swipe UI) |
| **RH** | ✅ Full RH | ✅ Full app | Manage employees, view all requests |
| **AGENCE** | ✅ Finance portal | ❌ No mobile | Manage accounts, cards, credits |
| **FINANCE** | ✅ Finance portal | ❌ No mobile | Manage payroll, budgets, avances |
| **ADMIN** | ✅ Full access | ✅ Full app | All permissions |

## Implementation Status

### ✅ Complete
- Backend employee schema with `roles` and `managerId`
- Web dashboard role-based sidebar
- NewEmployee form with role + manager selection
- Role enum: EMPLOYEE, MANAGER, RH, AGENCE, FINANCE, ADMIN, SUPER_ADMIN
- Documents module (upload/download)
- Budgets & savings goals

### 🚧 TODO (Phase 2)
- [ ] Mobile: Manager team validation screen (swipe-to-approve)
- [ ] Backend: Leave approval workflow with N+1 state machine
- [ ] Backend: Notifications for managers when leaves are pending
- [ ] Mobile: Show "Team" tab only if user has MANAGER role
- [ ] Backend: Hierarchy service to get all subordinates of a manager

### 📝 Next Steps
1. Create `HierarchyModule` in backend to handle N+1 tree queries
2. Update `LeaveSchema` to have N+1 statuses (PENDING_N1, APPROVED_N1, etc.)
3. Create mobile `TeamValidationScreen` with swipe cards
4. Add manager API endpoints: `GET /leave/pending-team`, `PATCH /leave/:id/manager-approve`
5. Add role-aware navigation in mobile app (show Team tab if MANAGER)

---

## Plan d'Implémentation — STB Omni-Roles (Complet)

### Résumé Rapide des Rôles

| Rôle | Plateforme | Fonctionnalités Clés |
|------|-----------|---------------------|
| **Employé** | 📱 Mobile | Dashboard, demande congé, avances, documents, Copilot IA |
| **Manager (N+1)** | 📱 Mobile + 💻 Web limité | Toutes fonctions Employé + onglet Team avec swipe-to-approve |
| **RH** | 💻 Dashboard Web | Gestion employés, suivi demandes, docs auto, fiches de paie, rapports |
| **Agence** | 💻 Dashboard Web | Comptes bancaires, cartes, crédits (avec score IA), avances, fraude |
| **Finance** | 💻 Dashboard Web | Paie, budgets, investissements, avances, reporting financier |

### Workflow Congé (N+1) - TODO
1. Employé demande congé → PENDING_N1 (managerId auto-assigné)
2. Manager swipe → APPROVED_N1 ou REJECTED (notification push)
3. RH valide → APPROVED (solde déduit) ou REJECTED

### Fichiers Clés du Backend
- `stb-backend/src/employees/employee.schema.ts` — Schema with roles + managerId
- `stb-backend/src/common/enums/role.enum.ts` — Role enum
- `stb-backend/src/leave/` — Leave module (TODO: add N+1 workflow)
- `stb-backend/src/hierarchy/` — Hierarchy module (TODO)

### Fichiers Clés du Mobile
- `lib/screens/team/team_validation_screen.dart` — Swipe-to-Approve (TODO)
- `lib/providers/app_provider.dart` — isManager/isRH/isFinance getters
- `lib/services/auth_api_service.dart` — Manager API methods (TODO)

### Fichiers Clés du Web
- `dashboard_web_stb/src/pages/NewEmployee.tsx` — Role + Manager selection ✅
- `dashboard_web_stb/src/pages/AgenceDashboard.tsx` — Finance dashboard
- `dashboard_web_stb/src/pages/Documents.tsx` — Document management ✅
- `dashboard_web_stb/src/components/Sidebar.tsx` — Role-aware sidebar ✅
- `dashboard_web_stb/src/context/AuthContext.tsx` — Auth with roles ✅
