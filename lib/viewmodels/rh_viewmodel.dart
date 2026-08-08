import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/rh_models.dart';
import '../services/auth_api_service.dart';

// ═══════════════════════════════════════════════════════════════════════════
//  RH VIEWMODEL — Unified MVVM layer for all RH screens
//  Screens: CongeScreen, AvanceScreen, DocumentsScreen
// ═══════════════════════════════════════════════════════════════════════════

class RhViewModel extends ChangeNotifier {
  // ── Congés ────────────────────────────────────────────────────────────────
  List<CongeRequest> _conges = [];
  bool _congesLoading = false;
  String? _congesError;
  bool _congeSubmitting = false;
  LeaveBalanceData? _leaveBalance;

  List<CongeRequest> get conges => _conges;
  bool get congesLoading => _congesLoading;
  String? get congesError => _congesError;
  bool get congeSubmitting => _congeSubmitting;
  LeaveBalanceData? get leaveBalance => _leaveBalance;

  // ── Clear All (Logout) ───────────────────────────────────────────────────
  void clearAll() {
    _conges.clear();
    _avances.clear();
    _payrolls.clear();
    _rhDocuments.clear();
    _leaveBalance = null;
    _congesError = null;
    _avancesError = null;
    _payrollsError = null;
    _rhDocsError = null;
    notifyListeners();
  }

  // ── Avances ───────────────────────────────────────────────────────────────
  List<AvanceRequest> _avances = [];
  bool _avancesLoading = false;
  String? _avancesError;
  bool _avanceSubmitting = false;

  List<AvanceRequest> get avances => _avances;
  bool get avancesLoading => _avancesLoading;
  String? get avancesError => _avancesError;
  bool get avanceSubmitting => _avanceSubmitting;

  // ── Documents / Payrolls ──────────────────────────────────────────────────
  List<PayrollDocument> _payrolls = [];
  bool _payrollsLoading = false;
  String? _payrollsError;

  List<PayrollDocument> get payrolls => _payrolls;
  bool get payrollsLoading => _payrollsLoading;
  String? get payrollsError => _payrollsError;

  // ── Documents RH ──────────────────────────────────────────────────────────
  List<dynamic> _rhDocuments = [];
  bool _rhDocsLoading = false;
  String? _rhDocsError;

  List<dynamic> get rhDocuments => _rhDocuments;
  bool get rhDocsLoading => _rhDocsLoading;
  String? get rhDocsError => _rhDocsError;

  // ── Polling Timer ─────────────────────────────────────────────────────────
  Timer? _refreshTimer;

  // ═════════════════════════════════════════════════════════════════════════
  //  CONGÉS
  // ═════════════════════════════════════════════════════════════════════════

  Future<void> loadConges({bool silent = false}) async {
    if (!silent) {
      _congesLoading = true;
      _congesError = null;
      notifyListeners();
    }
    try {
      final resConges = await AuthApiService.getMyConges();
      final resAbsences = await AuthApiService.getMyAbsences();

      List<CongeRequest> allRequests = [];
      if (resConges.isSuccess && resConges.data != null) {
        allRequests.addAll(resConges.data!
            .whereType<Map<String, dynamic>>()
            .map(CongeRequest.fromJson));
      } else if (!resConges.isSuccess) {
        _congesError = resConges.error;
      }
      
      if (resAbsences.isSuccess && resAbsences.data != null) {
        allRequests.addAll(resAbsences.data!
            .whereType<Map<String, dynamic>>()
            .map(CongeRequest.fromJson));
      }

      allRequests.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      _conges = allRequests;
      
      if (resConges.isSuccess || resAbsences.isSuccess) {
        _congesError = null;
      }
      
      // Load leave balance
      await _loadLeaveBalance();
    } catch (e) {
      _congesError = 'Erreur de chargement';
      debugPrint('RhViewModel.loadConges error: $e');
    } finally {
      _congesLoading = false;
      notifyListeners();
    }
  }

  Future<void> _loadLeaveBalance() async {
    try {
      final res = await AuthApiService.getMyLeaveBalance();
      if (res.isSuccess && res.data != null) {
        _leaveBalance = LeaveBalanceData.fromJson(res.data as Map<String, dynamic>);
      }
    } catch (e) {
      debugPrint('RhViewModel._loadLeaveBalance error: $e');
    }
  }

  Future<String?> submitConge({
    required String type,
    required String startDate,
    required String endDate,
    String? motif,
  }) async {
    _congeSubmitting = true;
    notifyListeners();
    try {
      final res = await AuthApiService.createConge(
        type: type,
        startDate: startDate,
        endDate: endDate,
        motif: motif,
      );
      if (res.isSuccess) {
        await loadConges(silent: true);
        return null; // success
      }
      return res.error ?? 'Erreur lors de la soumission';
    } catch (e) {
      return 'Erreur inattendue';
    } finally {
      _congeSubmitting = false;
      notifyListeners();
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  //  AVANCES
  // ═════════════════════════════════════════════════════════════════════════

  Future<void> loadAvances({bool silent = false}) async {
    if (!silent) {
      _avancesLoading = true;
      _avancesError = null;
      notifyListeners();
    }
    try {
      final resAvances = await AuthApiService.getMyAvances();
      final resPrimes = await AuthApiService.getMyPrimes();
      
      final List<AvanceRequest> allItems = [];
      
      if (resAvances.isSuccess && resAvances.data != null) {
        allItems.addAll(resAvances.data!
            .whereType<Map<String, dynamic>>()
            .map(AvanceRequest.fromJson));
      }
      
      if (resPrimes.isSuccess && resPrimes.data != null) {
        allItems.addAll(resPrimes.data!
            .whereType<Map<String, dynamic>>()
            .map(AvanceRequest.fromJson));
      }
      
      if (resAvances.isSuccess || resPrimes.isSuccess) {
        _avances = allItems..sort((a, b) => b.createdAt.compareTo(a.createdAt));
        _avancesError = null;
      } else {
        _avancesError = resAvances.error ?? resPrimes.error;
      }
    } catch (e) {
      _avancesError = 'Erreur de chargement';
      debugPrint('RhViewModel.loadAvances error: $e');
    } finally {
      _avancesLoading = false;
      notifyListeners();
    }
  }

  Future<String?> submitAvance({
    required String type,
    required double montant,
    String? motif,
  }) async {
    _avanceSubmitting = true;
    notifyListeners();
    try {
      final isPrime = type == 'PRIME' || type == 'PRIME_AID';
      final res = isPrime
          ? await AuthApiService.createPrime(
              type: type == 'PRIME_AID' ? 'AID' : 'PERFORMANCE',
              montant: montant,
              description: motif,
            )
          : await AuthApiService.createAvance(
              type: type,
              montant: montant,
              motif: motif,
            );
            
      if (res.isSuccess) {
        await loadAvances(silent: true);
        return null; // success
      }
      return res.error ?? 'Erreur lors de la soumission';
    } catch (e) {
      return 'Erreur inattendue';
    } finally {
      _avanceSubmitting = false;
      notifyListeners();
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  //  PAYROLLS / DOCUMENTS
  // ═════════════════════════════════════════════════════════════════════════

  Future<void> loadPayrolls({bool silent = false}) async {
    // Both payrolls and RH documents are now fetched together from the unified documents API
    // We delegate the fetch to loadRhDocuments to prevent race conditions and duplicate network calls.
    if (!silent) {
      _payrollsLoading = true;
      notifyListeners();
    }
    await loadRhDocuments(silent: silent);
    if (!silent) {
      _payrollsLoading = false;
      notifyListeners();
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  //  DOCUMENTS RH
  // ═════════════════════════════════════════════════════════════════════════

  Future<void> loadRhDocuments({bool silent = false}) async {
    if (!silent) {
      _rhDocsLoading = true;
      _rhDocsError = null;
      notifyListeners();
    }
    try {
      // 1. Fetch from RH documents API
      final resDocs = await AuthApiService.fetchMyDocuments();
      final allDocs = (resDocs.isSuccess && resDocs.data != null) 
          ? resDocs.data!.whereType<Map<String, dynamic>>().toList() 
          : <Map<String, dynamic>>[];
          
      _rhDocuments = allDocs.where((d) => d['type'] != 'PAYSLIP').toList()
          ..sort((a, b) => DateTime.parse(b['createdAt']).compareTo(DateTime.parse(a['createdAt'])));
          
      final documentPayrolls = allDocs
          .where((d) => d['type'] == 'PAYSLIP')
          .map(PayrollDocument.fromJson)
          .toList();

      // 2. Fetch from original Payrolls API
      final resPayrolls = await AuthApiService.getMyPayrolls();
      final backendPayrolls = (resPayrolls.isSuccess && resPayrolls.data != null)
          ? resPayrolls.data!.whereType<Map<String, dynamic>>().map(PayrollDocument.fromJson).toList()
          : <PayrollDocument>[];

      // 3. Merge them based on unique IDs
      final Map<String, PayrollDocument> merged = {};
      for (var p in backendPayrolls) merged[p.id] = p;
      for (var p in documentPayrolls) merged[p.id] = p;

      _payrolls = merged.values.toList()
        ..sort((a, b) {
          final aDate = DateTime(a.annee, a.mois);
          final bDate = DateTime(b.annee, b.mois);
          return bDate.compareTo(aDate);
        });

      _rhDocsError = resDocs.error;
    } catch (e) {
      _rhDocsError = 'Erreur de chargement';
      debugPrint('RhViewModel.loadRhDocuments error: $e');
    } finally {
      _rhDocsLoading = false;
      notifyListeners();
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  //  POLLING (smart auto-refresh — single timer for all RH data)
  // ═════════════════════════════════════════════════════════════════════════

  /// Start periodic silent refresh for a specific screen.
  /// Call [stopPolling] when screen is disposed.
  void startPolling({
    bool conges = false,
    bool avances = false,
    bool payrolls = false,
    bool documents = false,
    Duration interval = const Duration(seconds: 15),
  }) {
    _refreshTimer?.cancel();
    _refreshTimer = Timer.periodic(interval, (_) {
      if (conges)   loadConges(silent: true);
      if (avances)  loadAvances(silent: true);
      if (payrolls) loadPayrolls(silent: true);
      if (documents) loadRhDocuments(silent: true);
    });
  }

  void stopPolling() {
    _refreshTimer?.cancel();
    _refreshTimer = null;
  }

  @override
  void dispose() {
    stopPolling();
    super.dispose();
  }
}
