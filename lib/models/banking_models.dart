// ═══════════════════════════════════════════════════════════════════════════
//                        STB BANK - BANKING MODELS
// ═══════════════════════════════════════════════════════════════════════════

/// Modèle de compte bancaire
class BankAccount {
  final String id;
  final String iban;
  final String label;
  final double balance;
  final AccountType type;
  final String currency;
  final bool isActive;

  const BankAccount({
    required this.id,
    required this.iban,
    required this.label,
    required this.balance,
    required this.type,
    this.currency = 'TND',
    this.isActive = true,
  });

  factory BankAccount.fromJson(Map<String, dynamic> json) => BankAccount(
        id: json['id'],
        iban: json['iban'],
        label: json['label'],
        balance: (json['balance'] as num).toDouble(),
        type: json['type'] == 'EPARGNE' ? AccountType.savings : AccountType.current,
        currency: json['currency'] ?? 'TND',
        isActive: json['is_active'] ?? true,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'iban': iban,
        'label': label,
        'balance': balance,
        'type': type == AccountType.savings ? 'EPARGNE' : 'COURANT',
        'currency': currency,
        'is_active': isActive,
      };
}

/// Type de compte
enum AccountType {
  current,
  savings,
}

/// Modèle de carte bancaire
class BankCard {
  final String id;
  final String holderName;
  final String lastFour;
  final String expiry;
  final CardTier tier;
  final String type;
  final bool isDefault;
  final double balance;
  final double dailyLimit;
  final double dailySpent;
  final double monthlyLimit;
  final double monthlySpent;
  final List<Map<String, dynamic>> recentTransactions;

  const BankCard({
    required this.id,
    required this.holderName,
    required this.lastFour,
    required this.expiry,
    required this.tier,
    this.type = 'VISA',
    this.isDefault = false,
    this.balance = 0.0,
    this.dailyLimit = 1000.0,
    this.dailySpent = 0.0,
    this.monthlyLimit = 5000.0,
    this.monthlySpent = 0.0,
    this.recentTransactions = const [],
  });

  factory BankCard.fromJson(Map<String, dynamic> json) => BankCard(
        id: json['id'],
        holderName: json['holder_name'],
        lastFour: json['last_four'],
        expiry: json['expiry'],
        tier: CardTier.values.firstWhere(
          (e) => e.name == json['tier'],
          orElse: () => CardTier.classic,
        ),
        type: json['type'] ?? 'VISA',
        isDefault: json['is_default'] ?? false,
        balance: (json['balance'] as num?)?.toDouble() ?? 0.0,
        dailyLimit: (json['daily_limit'] as num?)?.toDouble() ?? 1000.0,
        dailySpent: (json['daily_spent'] as num?)?.toDouble() ?? 0.0,
        monthlyLimit: (json['monthly_limit'] as num?)?.toDouble() ?? 5000.0,
        monthlySpent: (json['monthly_spent'] as num?)?.toDouble() ?? 0.0,
        recentTransactions: (json['recent_transactions'] as List<dynamic>?)
                ?.map((e) => e as Map<String, dynamic>)
                .toList() ??
            [],
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'holder_name': holderName,
        'last_four': lastFour,
        'expiry': expiry,
        'tier': tier.name,
        'type': type,
        'is_default': isDefault,
        'balance': balance,
        'daily_limit': dailyLimit,
        'daily_spent': dailySpent,
        'monthly_limit': monthlyLimit,
        'monthly_spent': monthlySpent,
        'recent_transactions': recentTransactions,
      };

  String get maskedNumber => '**** **** **** $lastFour';
}

/// Niveau de carte
enum CardTier {
  classic,
  gold,
  platinum,
  infinite,
}

/// Modèle de transaction
class Transaction {
  final String id;
  final String title;
  final String subtitle;
  final double amount;
  final DateTime date;
  final TransactionCategory category;
  final String? merchant;
  final String? reference;
  final bool isDebit;
  final TransactionStatus? status;

  const Transaction({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.amount,
    required this.date,
    required this.category,
    this.merchant,
    this.reference,
    this.isDebit = true,
    this.status,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) => Transaction(
        id: json['id'],
        title: json['title'],
        subtitle: json['subtitle'],
        amount: (json['amount'] as num).toDouble(),
        date: DateTime.parse(json['date']),
        category: TransactionCategory.values.firstWhere(
          (e) => e.name == json['category'],
          orElse: () => TransactionCategory.other,
        ),
        merchant: json['merchant'],
        reference: json['reference'],
        isDebit: json['is_debit'] ?? true,
        status: json['status'] != null
            ? TransactionStatus.values.firstWhere(
                (e) => e.name == json['status'],
                orElse: () => TransactionStatus.completed,
              )
            : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'subtitle': subtitle,
        'amount': amount,
        'date': date.toIso8601String(),
        'category': category.name,
        'merchant': merchant,
        'reference': reference,
        'is_debit': isDebit,
        'status': status?.name,
      };

  bool get isCredit => !isDebit;

  String get formattedAmount {
    final sign = isCredit ? '+' : '-';
    return '$sign${amount.abs().toStringAsFixed(3)} TND';
  }
}

/// Statut de transaction
enum TransactionStatus {
  completed,
  pending,
  failed,
}

/// Catégorie de transaction
enum TransactionCategory {
  transfer,
  payment,
  withdrawal,
  deposit,
  shopping,
  food,
  transport,
  entertainment,
  bills,
  salary,
  income,
  other,
}

/// Extension pour TransactionCategory
extension TransactionCategoryExt on TransactionCategory {
  String get label {
    switch (this) {
      case TransactionCategory.transfer:
        return 'Virement';
      case TransactionCategory.payment:
        return 'Paiement';
      case TransactionCategory.withdrawal:
        return 'Retrait';
      case TransactionCategory.deposit:
        return 'Dépôt';
      case TransactionCategory.shopping:
        return 'Shopping';
      case TransactionCategory.food:
        return 'Alimentation';
      case TransactionCategory.transport:
        return 'Transport';
      case TransactionCategory.entertainment:
        return 'Loisirs';
      case TransactionCategory.bills:
        return 'Factures';
      case TransactionCategory.salary:
        return 'Salaire';
      case TransactionCategory.income:
        return 'Revenu';
      case TransactionCategory.other:
        return 'Autre';
    }
  }
}

/// Modèle de catégorie de dépenses
class SpendingCategory {
  final String label;
  final double percentage;
  final double amount;

  const SpendingCategory({
    required this.label,
    required this.percentage,
    required this.amount,
  });

  factory SpendingCategory.fromJson(Map<String, dynamic> json) => SpendingCategory(
        label: json['label'],
        percentage: (json['percentage'] as num).toDouble(),
        amount: (json['amount'] as num).toDouble(),
      );

  Map<String, dynamic> toJson() => {
        'label': label,
        'percentage': percentage,
        'amount': amount,
      };
}

/// Modèle de notification
class NotificationItem {
  final String id;
  final String title;
  final String body;
  final DateTime timestamp;
  final NotificationCategory category;
  bool isRead;

  NotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.timestamp,
    required this.category,
    this.isRead = false,
  });

  factory NotificationItem.fromJson(Map<String, dynamic> json) => NotificationItem(
        id: json['id'],
        title: json['title'],
        body: json['body'],
        timestamp: DateTime.parse(json['timestamp']),
        category: NotificationCategory.values.firstWhere(
          (e) => e.name == json['category'],
          orElse: () => NotificationCategory.general,
        ),
        isRead: json['is_read'] ?? false,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'body': body,
        'timestamp': timestamp.toIso8601String(),
        'category': category.name,
        'is_read': isRead,
      };
}

/// Catégorie de notification
enum NotificationCategory {
  security,
  transaction,
  promotion,
  account,
  general,
}

/// Modèle de chèque
class Cheque {
  final String id;
  final String number;
  final double amount;
  final DateTime date;
  final ChequeStatus status;
  final String? beneficiary;

  const Cheque({
    required this.id,
    required this.number,
    required this.amount,
    required this.date,
    required this.status,
    this.beneficiary,
  });

  factory Cheque.fromJson(Map<String, dynamic> json) => Cheque(
        id: json['id'],
        number: json['number'],
        amount: (json['amount'] as num).toDouble(),
        date: DateTime.parse(json['date']),
        status: ChequeStatus.values.firstWhere(
          (e) => e.name == json['status'],
          orElse: () => ChequeStatus.pending,
        ),
        beneficiary: json['beneficiary'],
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'number': number,
        'amount': amount,
        'date': date.toIso8601String(),
        'status': status.name,
        'beneficiary': beneficiary,
      };
}

/// Statut du chèque
enum ChequeStatus {
  pending,
  cashed,
  rejected,
  cancelled,
}

extension ChequeStatusExt on ChequeStatus {
  String get label {
    switch (this) {
      case ChequeStatus.pending: return 'En attente';
      case ChequeStatus.cashed: return 'Encaissé';
      case ChequeStatus.rejected: return 'Rejeté';
      case ChequeStatus.cancelled: return 'Annulé';
    }
  }
}
