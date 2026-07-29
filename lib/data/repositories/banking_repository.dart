import 'package:flutter/foundation.dart';
import '../../models/banking_models.dart';
import '../../services/auth_api_service.dart';

/// Single source of truth for all mock banking data.
/// In production: replace method bodies with API calls.
class BankingRepository {
  BankingRepository._();
  static final BankingRepository instance = BankingRepository._();

  // ── ACCOUNTS ───────────────────────────────────────────────────────────────
  Future<List<BankAccount>> getAccounts() async {
    try {
      final res = await AuthApiService.getMyAccounts();
      
      if (res.isSuccess && res.data != null && res.data!.isNotEmpty) {
        final accounts = res.data!.map((json) {
          return BankAccount(
            id: json['_id'].toString(),
            iban: json['iban'] ?? '',
            label: json['type'] == 'EPARGNE' ? 'Compte Épargne' : 'Compte Courant',
            balance: (json['solde'] as num?)?.toDouble() ?? 0.0,
            type: json['type'] == 'EPARGNE' ? AccountType.savings : AccountType.current,
          );
        }).toList();
        return accounts;
      }
      
      return [];
    } catch (e) {
      return [];
    }
  }

  // ── CARDS ──────────────────────────────────────────────────────────────────
  Future<List<BankCard>> getCards() async {
    try {
      final res = await AuthApiService.getMyCards();
      
      if (res.isSuccess && res.data != null && res.data!.isNotEmpty) {
        // Fetch accounts to get the actual balance
        final accounts = await getAccounts();
        
        final cards = res.data!.map((json) {
          
          // Extract the PAN (card number) safely
          final pan = json['pan']?.toString() ?? '****0000';
          final lastFour = pan.length >= 4 ? pan.substring(pan.length - 4) : '0000';
          
          // Find the account associated with this card
          final accountId = json['accountId']?.toString();
          double cardBalance = 0.0;
          
          if (accountId != null && accounts.isNotEmpty) {
            final associatedAccount = accounts.firstWhere(
              (acc) => acc.id == accountId,
              orElse: () => accounts.first,
            );
            cardBalance = associatedAccount.balance;
          } else if (accounts.isNotEmpty) {
            // Fallback: use first account balance
            cardBalance = accounts.first.balance;
          }
          
          return BankCard(
            id: json['_id'].toString(),
            holderName: json['holderName'] ?? 'COLLABORATEUR STB',
            lastFour: lastFour,
            expiry: json['expiryDate'] ?? '12/29',
            tier: CardTier.platinum,
            isDefault: true,
            balance: cardBalance,
          );
        }).toList();
        return cards;
      }
      
      return [];
    } catch (e) {
      return [];
    }
  }

  // ── TRANSACTIONS ───────────────────────────────────────────────────────────
  Future<List<Transaction>> getRecentTransactions() async {
    try {
      final res = await AuthApiService.getMyTransactions();
      
      if (!res.isSuccess) {
        return [];
      }
      
      if (res.data == null || res.data!.isEmpty) {
        return [];
      }
      
      return res.data!.map((json) {
        // Use the 'sens' field from backend (DEBIT or CREDIT)
        final sens = json['sens'] as String? ?? '';
        final bool isDebit = sens == 'DEBIT';
        
        final amount = (json['montant'] as num?)?.toDouble() ?? 0.0;
        final displayAmount = isDebit ? -amount.abs() : amount.abs();
        
        // Extract from/to information for display
        final from = json['from'];
        final to = json['to'];
        
        // Get the other party's name
        String title;
        String subtitle = json['type'] ?? 'Virement';
        
        if (isDebit && to is Map) {
          final prenom = to['prenom'] ?? '';
          final nom = to['nom'] ?? '';
          title = 'Virement vers $prenom $nom';
        } else if (!isDebit && from is Map) {
          final prenom = from['prenom'] ?? '';
          final nom = from['nom'] ?? '';
          title = 'Virement de $prenom $nom';
        } else {
          title = json['description'] ?? 'Transaction';
        }
        
        return Transaction(
          id: json['_id']?.toString() ?? 'tx_${DateTime.now().millisecondsSinceEpoch}',
          title: title,
          subtitle: subtitle,
          amount: displayAmount,
          date: json['date'] != null
              ? DateTime.parse(json['date'])
              : (json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now()),
          category: TransactionCategory.transfer,
          isDebit: isDebit,
        );
      }).toList();
    } catch (e, stackTrace) {
      debugPrint('Error loading transactions: $e');
      return [];
    }
  }

  // ── SPENDING BREAKDOWN ──────────────────────────────────────────────────────
  Future<List<SpendingCategory>> getSpendingBreakdown() async {
    final tx = await getRecentTransactions();
    if (tx.isEmpty) return [];
    final Map<String, double> totals = {};
    final Map<String, int> counts = {};
    for (var t in tx) {
      final cat = _categoryLabel(t.category);
      totals[cat] = (totals[cat] ?? 0) + t.amount.abs();
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    final total = totals.values.fold(0.0, (a, b) => a + b);
    if (total == 0) return [];
    return totals.entries.map((e) {
      final pct = e.value / total;
      return SpendingCategory(
        label: e.key,
        percentage: pct,
        amount: e.value,
      );
    }).toList()..sort((a, b) => b.percentage.compareTo(a.percentage));
  }

  static String _categoryLabel(TransactionCategory cat) {
    switch (cat) {
      case TransactionCategory.food:
        return 'Alimentation';
      case TransactionCategory.transport:
        return 'Transport';
      case TransactionCategory.shopping:
        return 'Shopping';
      case TransactionCategory.bills:
        return 'Factures';
      case TransactionCategory.income:
        return 'Revenus';
      case TransactionCategory.transfer:
        return 'Virements';
      default:
        return 'Autre';
    }
  }

  // ── CASHFLOW ──────────────────────────────────────────────────────────────
  Future<Map<String, double>> getMonthlyCashflow() async {
    final tx = await getRecentTransactions();
    double inc = 0, exp = 0;
    for (var t in tx) {
      if (t.amount > 0) inc += t.amount;
      else exp += t.amount.abs();
    }
    return {'income': inc, 'expenses': exp};
  }

  // ── NOTIFICATIONS ──────────────────────────────────────────────────────────
  Future<List<NotificationItem>> getNotifications() async {
    final res = await AuthApiService.getMyNotifications();
    if (res.isSuccess && res.data != null) {
      return res.data!.map((json) {
        final now = DateTime.now();
        return NotificationItem(
          id: json['_id']?.toString() ?? 'notif_${now.millisecondsSinceEpoch}',
          title: json['title'] ?? 'Notification',
          body: json['body'] ?? '',
          timestamp: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : now,
          category: NotificationCategory.general,
          isRead: json['isRead'] ?? false,
        );
      }).toList();
    }
    return [];
  }

  // ── CHEQUES ───────────────────────────────────────────────────────────────
  Future<List<Cheque>> getCheques() async {
    return [];
  }
}
