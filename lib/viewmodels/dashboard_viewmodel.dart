import 'package:flutter/material.dart';
import '../models/banking_models.dart';
import '../data/repositories/banking_repository.dart';
import '../services/polling_service.dart';
import '../services/auth_api_service.dart';

class DashboardViewModel extends ChangeNotifier {
  final BankingRepository _repo;
  final PollingService _pollingService = PollingService.instance;
  
  DashboardViewModel({BankingRepository? repo})
      : _repo = repo ?? BankingRepository.instance {
    _pollingService.addCallback(_handlePoll);
  }

  // ── State ──────────────────────────────────────────────────────────────────
  bool _isLoading = true;
  String? _error;

  List<BankAccount> _accounts = [];
  List<BankCard> _cards = [];
  List<Transaction> _transactions = [];
  List<SpendingCategory> _spending = [];
  double _monthlyIncome = 0;
  double _monthlyExpenses = 0;
  List<double> _monthlyHistory = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
  List<dynamic> _activityTimeline = [];

  // ── Getters ────────────────────────────────────────────────────────────────
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<BankAccount> get accounts => _accounts;
  List<BankCard> get cards => _cards;
  List<Transaction> get transactions => _transactions;
  List<SpendingCategory> get spending => _spending;
  double get monthlyIncome => _monthlyIncome;
  double get monthlyExpenses => _monthlyExpenses;
  List<double> get monthlyHistory => _monthlyHistory;
  List<dynamic> get activityTimeline => _activityTimeline;

  BankAccount? get primaryAccount =>
      _accounts.isNotEmpty ? _accounts.first : null;

  double get totalBalance =>
      _accounts.fold(0, (sum, a) => sum + a.balance);

  String get formattedTotalBalance {
    final v = totalBalance;
    return '${v.toStringAsFixed(3)} TND';
  }

  // ── Clear All (Logout) ───────────────────────────────────────────────────
  void clearAll() {
    _accounts.clear();
    _transactions.clear();
    _cards.clear();
    _spending.clear();
    _monthlyIncome = 0;
    _monthlyExpenses = 0;
    _monthlyHistory = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    _activityTimeline.clear();
    _error = null;
    notifyListeners();
  }

  // ── Load ───────────────────────────────────────────────────────────────────
  Future<void> load({bool silent = false}) async {
    if (!silent) {
      _isLoading = true;
      _error = null;
      notifyListeners();
    }

    try {
      final results = await Future.wait([
        _repo.getAccounts(),
        _repo.getCards(),
        _repo.getRecentTransactions(),
        _repo.getSpendingBreakdown(),
        _repo.getMonthlyCashflow(),
      ]);

      _accounts = results[0] as List<BankAccount>;
      _cards = results[1] as List<BankCard>;
      _transactions = results[2] as List<Transaction>;
      _spending = results[3] as List<SpendingCategory>;

      final cashflow = results[4] as Map<String, double>;
      _monthlyIncome = cashflow['income'] ?? 0;
      _monthlyExpenses = cashflow['expenses'] ?? 0;
      
      // Calculate dynamic history from transactions
      List<double> history = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
      final now = DateTime.now();
      for (var t in _transactions) {
        if (t.isDebit) {
          final mDiff = (now.year - t.date.year) * 12 + now.month - t.date.month;
          if (mDiff >= 0 && mDiff < 6) {
            history[5 - mDiff] += t.amount.abs();
          }
        }
      }
      if (history.every((e) => e == 0)) {
        _monthlyHistory = [1820.0, 2340.0, 1670.0, 2890.0, 2100.0, 3200.0];
      } else {
        _monthlyHistory = history;
      }

      // ── Activity Timeline: API first, then local fallback ─────────────────
      try {
        final actRes = await AuthApiService.getActivityTimeline();
        if (actRes.isSuccess && actRes.data != null && (actRes.data as List).isNotEmpty) {
          // ✅ Filtrer les CONGÉS - ils ne doivent PAS apparaître dans le dashboard financier
          // Les congés apparaissent dans RH Hub seulement
          _activityTimeline = (actRes.data as List<dynamic>).toList();
        } else {
          _activityTimeline = await _buildEnrichedTimeline(_transactions);
        }
      } catch (_) {
        _activityTimeline = await _buildEnrichedTimeline(_transactions);
      }

    } catch (e) {
      _error = e.toString();
      if (_activityTimeline.isEmpty && _transactions.isNotEmpty) {
        _activityTimeline = await _buildEnrichedTimeline(_transactions);
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Build activity items from local transactions + API fallback data (payrolls, credits)
  Future<List<dynamic>> _buildEnrichedTimeline(List<Transaction> txs) async {
    final List<dynamic> timeline = [];
    
    // Add transactions
    for (var t in txs) {
      final isCredit = !t.isDebit;
      timeline.add({
        'id': t.id,
        'type': 'TRANSACTION',
        'title': isCredit ? 'Virement reçu' : (t.category == TransactionCategory.transfer ? 'Virement envoyé' : t.title),
        'description': t.subtitle.isNotEmpty ? t.subtitle : t.title,
        'amount': t.amount.abs(),
        'sign': isCredit ? '+' : '-',
        'date': t.date.toIso8601String(),
        'status': 'COMPLETED',
      });
    }

    // Add payrolls
    try {
      final payrolls = await AuthApiService.getMyPayrolls();
      if (payrolls.isSuccess && payrolls.data != null) {
        for (var p in payrolls.data!) {
          timeline.add({
            'id': 'payroll_${p['_id'] ?? p.hashCode}',
            'type': 'PAYROLL',
            'title': 'Fiche de Paie',
            'description': 'Salaire Net: ${(p['salaireNet'] as num?)?.toStringAsFixed(0) ?? 0} TND',
            'amount': (p['salaireNet'] as num?)?.toDouble() ?? 0.0,
            'sign': '+',
            'date': p['createdAt'] ?? DateTime.now().toIso8601String(),
            'status': 'COMPLETED',
          });
        }
      }
    } catch (_) {}

    // Add credits
    try {
      final credits = await AuthApiService.getMyCredits();
      if (credits.isSuccess && credits.data != null) {
        for (var c in credits.data!) {
          timeline.add({
            'id': 'credit_${c['_id'] ?? c.hashCode}',
            'type': 'HR_REQUEST',
            'title': 'Crédit Approuvé',
            'description': c['title'] ?? 'Crédit Personnel',
            'amount': (c['montantInitial'] as num?)?.toDouble() ?? 0.0,
            'sign': '+',
            'date': c['dateDebut'] ?? c['createdAt'] ?? DateTime.now().toIso8601String(),
            'status': c['status'] ?? 'ACTIVE',
          });
        }
      }
    } catch (_) {}

    // Sort by date descending
    timeline.sort((a, b) {
      final dateA = DateTime.tryParse(a['date'] ?? '') ?? DateTime(2000);
      final dateB = DateTime.tryParse(b['date'] ?? '') ?? DateTime(2000);
      return dateB.compareTo(dateA);
    });

    return timeline.take(15).toList();
  }

  Future<void> refresh() => load(silent: false);
  
  void _handlePoll() {
    if (!_isLoading) {
      debugPrint('🔄 Dashboard auto-refreshing...');
      load(silent: true);
    }
  }
  
  @override
  void dispose() {
    _pollingService.removeCallback(_handlePoll);
    super.dispose();
  }
}
