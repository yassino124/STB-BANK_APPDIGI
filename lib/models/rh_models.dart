// ═══════════════════════════════════════════════════════════════════════════
//                    STB BANK — TYPED RH MODELS
// ═══════════════════════════════════════════════════════════════════════════

/// Solde de congés (Leave Balance)
class LeaveBalanceData {
  final int soldeAnnuel;
  final int soldeUtilise;
  final int soldeDisponible;

  const LeaveBalanceData({
    required this.soldeAnnuel,
    required this.soldeUtilise,
    required this.soldeDisponible,
  });

  factory LeaveBalanceData.fromJson(Map<String, dynamic> j) {
    final sAnnuel = (j['soldeAnnuel'] as num?)?.toInt() ?? 30;
    final sUtilise = (j['soldeUtilise'] as num?)?.toInt() ?? 0;
    return LeaveBalanceData(
      soldeAnnuel: sAnnuel,
      soldeUtilise: sUtilise,
      soldeDisponible: (j['soldeDisponible'] as num?)?.toInt() ?? (sAnnuel - sUtilise),
    );
  }
}

/// Statut générique pour toutes les demandes RH
enum RhStatus { enAttente, pendingManager, pendingRh, approuve, rejete, annule, traite }

extension RhStatusExt on RhStatus {
  String get label {
    switch (this) {
      case RhStatus.enAttente:     return 'En Attente';
      case RhStatus.pendingManager: return 'Attente Manager';
      case RhStatus.pendingRh:     return 'Attente Validation RH';
      case RhStatus.approuve:       return 'Approuvé';
      case RhStatus.rejete:         return 'Rejeté';
      case RhStatus.annule:         return 'Annulé';
      case RhStatus.traite:         return 'Traité';
    }
  }

  static RhStatus fromString(String? s) {
    switch ((s ?? '').toUpperCase()) {
      case 'APPROUVE':
      case 'APPROVED':
      case 'ACCEPTE':
        return RhStatus.approuve;
      case 'REJETE':
      case 'REJECTED':
        return RhStatus.rejete;
      case 'ANNULE':
      case 'CANCELLED':
        return RhStatus.annule;
      case 'TRAITE':
      case 'COMPLETED':
      case 'PAID':
        return RhStatus.traite;
      case 'PENDING_MANAGER':
      case 'PENDING_N1':
        return RhStatus.pendingManager;
      case 'PENDING_RH':
        return RhStatus.pendingRh;
      default:
        return RhStatus.enAttente;
    }
  }
}

// ── Congé ────────────────────────────────────────────────────────────────────

enum CongeType {
  repos, maladie, mariage, naissance, deces, pelerinage, sansSolde,
  absence, retard, delegation, mission
}

extension CongeTypeExt on CongeType {
  String get label {
    switch (this) {
      case CongeType.repos:      return 'Repos';
      case CongeType.maladie:    return 'Maladie';
      case CongeType.mariage:    return 'Mariage';
      case CongeType.naissance:  return 'Naissance';
      case CongeType.deces:      return 'Décès';
      case CongeType.pelerinage: return 'Pèlerinage';
      case CongeType.sansSolde:  return 'Sans Solde';
      case CongeType.absence:    return 'Absence';
      case CongeType.retard:     return 'Retard';
      case CongeType.delegation: return 'Délégation';
      case CongeType.mission:    return 'Mission';
    }
  }

  static CongeType fromString(String? s) {
    switch ((s ?? '').toUpperCase()) {
      case 'MALADIE':    return CongeType.maladie;
      case 'MARIAGE':    return CongeType.mariage;
      case 'NAISSANCE':  return CongeType.naissance;
      case 'DECES':      return CongeType.deces;
      case 'PELERINAGE': return CongeType.pelerinage;
      case 'SANS_SOLDE': return CongeType.sansSolde;
      case 'ABSENCE':    return CongeType.absence;
      case 'RETARD':     return CongeType.retard;
      case 'DELEGATION': return CongeType.delegation;
      case 'MISSION':    return CongeType.mission;
      default:           return CongeType.repos;
    }
  }
}

class CongeRequest {
  final String id;
  final CongeType type;
  final RhStatus status;
  final DateTime startDate;
  final DateTime endDate;
  final int dureeDays;
  final double nombreHeures;
  final String? motif;
  final DateTime createdAt;
  final List<dynamic> approvalHistory;
  final int approvalLevel; // how many levels approved so far
  final String rawStatus;

  const CongeRequest({
    required this.id,
    required this.type,
    required this.status,
    required this.startDate,
    required this.endDate,
    required this.dureeDays,
    this.nombreHeures = 0.0,
    this.motif,
    required this.createdAt,
    this.approvalHistory = const [],
    this.approvalLevel = 0,
    required this.rawStatus,
  });

  factory CongeRequest.fromJson(Map<String, dynamic> j) => CongeRequest(
        id:         j['_id'] as String? ?? j['id'] as String? ?? '',
        type:       CongeTypeExt.fromString(j['type'] as String?),
        status:     RhStatusExt.fromString(j['status'] as String?),
        startDate:  DateTime.tryParse(j['dateDebut'] as String? ?? '') ?? DateTime.now(),
        endDate:    DateTime.tryParse(j['dateFin'] as String? ?? '') ?? DateTime.now(),
        dureeDays:  (j['dureeDays'] as num?)?.toInt() ?? (j['nombreJours'] as num?)?.toInt() ?? 0,
        nombreHeures: (j['nombreHeures'] as num?)?.toDouble() ?? 0.0,
        motif:      j['motif'] as String?,
        createdAt:  DateTime.tryParse(
                      j['dateCreation'] as String? ??
                      j['createdAt'] as String? ?? '') ??
                    DateTime.now(),
        approvalHistory: (j['approvalHistory'] as List<dynamic>?) ?? [],
        approvalLevel: ((j['approvalHistory'] as List?)?.length ?? 0),
        rawStatus: j['status'] as String? ?? 'PENDING',
      );
}

// ── Avance ───────────────────────────────────────────────────────────────────

enum AvanceType { salaire, prime, primeAid }

extension AvanceTypeExt on AvanceType {
  String get label {
    switch (this) {
      case AvanceType.salaire:  return 'Avance Salaire';
      case AvanceType.prime:    return 'Prime Rendement';
      case AvanceType.primeAid: return 'Prime Aïd';
    }
  }

  String get apiValue {
    switch (this) {
      case AvanceType.salaire:  return 'SALAIRE';
      case AvanceType.prime:    return 'PRIME';
      case AvanceType.primeAid: return 'PRIME_AID';
    }
  }

  static AvanceType fromString(String? s) {
    switch ((s ?? '').toUpperCase()) {
      case 'PRIME':
      case 'PERFORMANCE': 
        return AvanceType.prime;
      case 'PRIME_AID':
      case 'AID':
        return AvanceType.primeAid;
      default:
        return AvanceType.salaire;
    }
  }
}

class AvanceRequest {
  final String id;
  final AvanceType type;
  final RhStatus status;
  final double montant;
  final String? motif;
  final DateTime createdAt;

  const AvanceRequest({
    required this.id,
    required this.type,
    required this.status,
    required this.montant,
    this.motif,
    required this.createdAt,
  });

  factory AvanceRequest.fromJson(Map<String, dynamic> j) => AvanceRequest(
        id:        j['_id'] as String? ?? j['id'] as String? ?? '',
        type:      AvanceTypeExt.fromString(j['type'] as String?),
        status:    RhStatusExt.fromString(j['statut'] as String? ?? j['status'] as String?),
        montant:   (j['montant'] as num?)?.toDouble() ?? 0.0,
        motif:     j['motif'] as String? ?? j['description'] as String?,
        createdAt: DateTime.tryParse(
                     j['dateCreation'] as String? ??
                     j['createdAt'] as String? ?? '') ??
                   DateTime.now(),
      );
}

// ── Payroll Document ──────────────────────────────────────────────────────────

class PayrollDocument {
  final String id;
  final int mois;
  final int annee;
  final double salaireBrut;
  final double salaireNet;
  final double cotisations;
  final String? pdfUrl;
  final DateTime createdAt;

  const PayrollDocument({
    required this.id,
    required this.mois,
    required this.annee,
    required this.salaireBrut,
    required this.salaireNet,
    required this.cotisations,
    this.pdfUrl,
    required this.createdAt,
  });

  factory PayrollDocument.fromJson(Map<String, dynamic> j) => PayrollDocument(
        id:          j['_id'] as String? ?? j['id'] as String? ?? '',
        mois:        (j['mois'] as num?)?.toInt() ??
                     (j['month'] as num?)?.toInt() ??
                     DateTime.tryParse(j['createdAt'] as String? ?? '')?.month ??
                     DateTime.now().month,
        annee:       (j['annee'] as num?)?.toInt() ??
                     (j['year'] as num?)?.toInt() ??
                     DateTime.tryParse(j['createdAt'] as String? ?? '')?.year ??
                     DateTime.now().year,
        salaireBrut: (j['salaireBrut'] as num?)?.toDouble() ?? 0.0,
        salaireNet:  (j['salaireNet'] as num?)?.toDouble() ?? 0.0,
        cotisations: (j['cotisationsCNSS'] as num?)?.toDouble() ??
                     (j['cotisations'] as num?)?.toDouble() ?? 0.0,
        pdfUrl:      j['pdfUrl'] as String? ?? j['fileUrl'] as String?,
        createdAt:   DateTime.tryParse(j['createdAt'] as String? ?? '') ?? DateTime.now(),
      );

  String get moisLabel {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    if (mois >= 1 && mois <= 12) return months[mois - 1];
    return 'Mois $mois';
  }
}
