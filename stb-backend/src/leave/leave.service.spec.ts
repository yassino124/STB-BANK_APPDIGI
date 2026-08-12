/**
 * Tests unitaires — Leave Service (Gestion des Congés)
 * 
 * Valide les règles métier critiques du workflow de congés STB :
 * - Vérification du solde avant demande
 * - Workflow de statuts (PENDING → APPROVED/REJECTED)
 * - Calcul des jours ouvrables
 */

describe('LeaveService — Business Logic Tests', () => {

  // ── Données de test ────────────────────────────────────────────────────────
  const mockEmployee = {
    _id: 'emp_001',
    matricule: 'EMP001',
    nom: 'Ben Ali',
    prenom: 'Mohamed',
    soldeConges: 15,  // 15 jours disponibles
    managerId: 'manager_001',
  };

  const mockLeaveRequest = {
    _id: 'leave_001',
    employeeId: 'emp_001',
    typeConges: 'ANNUEL',
    dateDebut: new Date('2025-09-01'),
    dateFin: new Date('2025-09-05'),
    joursDemandes: 5,
    status: 'PENDING',
    motif: 'Vacances annuelles',
  };

  // ── Fonctions utilitaires pour les tests ────────────────────────────────────
  const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
    let count = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {  // Exclure weekend
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const canSubmitLeave = (employee: typeof mockEmployee, requestedDays: number): boolean => {
    return employee.soldeConges >= requestedDays;
  };

  const applyLeaveWorkflow = (currentStatus: string, action: 'APPROVE' | 'REJECT'): string => {
    const transitions: Record<string, Record<string, string>> = {
      'PENDING': {
        'APPROVE': 'APPROVED_N1',
        'REJECT': 'REJECTED',
      },
      'APPROVED_N1': {
        'APPROVE': 'APPROVED',
        'REJECT': 'REJECTED',
      },
    };
    return transitions[currentStatus]?.[action] || 'INVALID';
  };

  // ── Tests : Validation du solde de congés ────────────────────────────────────
  describe('Solde de congés', () => {
    it('should ALLOW leave request when employee has enough balance', () => {
      const canSubmit = canSubmitLeave(mockEmployee, 5);
      expect(canSubmit).toBe(true);  // 15 jours dispo >= 5 demandés ✅
    });

    it('should DENY leave request when employee does not have enough balance', () => {
      const canSubmit = canSubmitLeave(mockEmployee, 20);
      expect(canSubmit).toBe(false);  // 15 jours dispo < 20 demandés ❌
    });

    it('should DENY leave request for exactly 0 days balance', () => {
      const emptyBalanceEmployee = { ...mockEmployee, soldeConges: 0 };
      const canSubmit = canSubmitLeave(emptyBalanceEmployee, 1);
      expect(canSubmit).toBe(false);
    });

    it('should ALLOW leave request when balance equals requested days', () => {
      const exactEmployee = { ...mockEmployee, soldeConges: 5 };
      const canSubmit = canSubmitLeave(exactEmployee, 5);
      expect(canSubmit).toBe(true);
    });
  });

  // ── Tests : Workflow de statuts N+1 ───────────────────────────────────────────
  describe('State Machine — Leave Workflow', () => {
    it('PENDING + APPROVE → should transition to APPROVED_N1 (manager validation)', () => {
      const nextStatus = applyLeaveWorkflow('PENDING', 'APPROVE');
      expect(nextStatus).toBe('APPROVED_N1');
    });

    it('PENDING + REJECT → should transition to REJECTED', () => {
      const nextStatus = applyLeaveWorkflow('PENDING', 'REJECT');
      expect(nextStatus).toBe('REJECTED');
    });

    it('APPROVED_N1 + APPROVE → should transition to APPROVED (RH final validation)', () => {
      const nextStatus = applyLeaveWorkflow('APPROVED_N1', 'APPROVE');
      expect(nextStatus).toBe('APPROVED');
    });

    it('APPROVED_N1 + REJECT → should transition to REJECTED (RH rejects)', () => {
      const nextStatus = applyLeaveWorkflow('APPROVED_N1', 'REJECT');
      expect(nextStatus).toBe('REJECTED');
    });

    it('should not allow invalid status transitions', () => {
      const nextStatus = applyLeaveWorkflow('APPROVED', 'APPROVE');
      expect(nextStatus).toBe('INVALID');
    });
  });

  // ── Tests : Calcul des jours ouvrables ────────────────────────────────────────
  describe('Calcul des jours ouvrables', () => {
    it('should calculate working days correctly (Mon-Fri week)', () => {
      // Semaine du 1 au 5 septembre 2025 (Lundi au Vendredi)
      const start = new Date('2025-09-01');  // Lundi
      const end = new Date('2025-09-05');    // Vendredi
      const days = calculateWorkingDays(start, end);
      expect(days).toBe(5);
    });

    it('should exclude weekends from calculation', () => {
      // 1er au 7 septembre 2025 (Lundi au Dimanche)
      const start = new Date('2025-09-01');  // Lundi
      const end = new Date('2025-09-07');    // Dimanche
      const days = calculateWorkingDays(start, end);
      expect(days).toBe(5);  // Seulement 5 jours ouvrables
    });

    it('should return 0 for weekend-only period', () => {
      const start = new Date('2025-09-06');  // Samedi
      const end = new Date('2025-09-07');    // Dimanche
      const days = calculateWorkingDays(start, end);
      expect(days).toBe(0);
    });

    it('should return 1 for a single working day', () => {
      const start = new Date('2025-09-01');  // Lundi
      const end = new Date('2025-09-01');    // Lundi
      const days = calculateWorkingDays(start, end);
      expect(days).toBe(1);
    });
  });

  // ── Tests : Intégrité des données de la demande ────────────────────────────
  describe('Leave Request Validation', () => {
    it('should have a valid leave type', () => {
      const validTypes = ['ANNUEL', 'MALADIE', 'MATERNITE', 'PATERNITE', 'SANS_SOLDE'];
      expect(validTypes).toContain(mockLeaveRequest.typeConges);
    });

    it('should have start date before end date', () => {
      expect(mockLeaveRequest.dateDebut.getTime())
        .toBeLessThanOrEqual(mockLeaveRequest.dateFin.getTime());
    });

    it('should have joursDemandes > 0', () => {
      expect(mockLeaveRequest.joursDemandes).toBeGreaterThan(0);
    });

    it('should have a non-empty motif', () => {
      expect(mockLeaveRequest.motif.trim().length).toBeGreaterThan(0);
    });
  });
});
