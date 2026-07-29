import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../data/repositories/banking_repository.dart';
import '../../models/banking_models.dart';
import '../transactions/transactions_screen.dart';
import 'account_detail_screen.dart';

class AccountsScreen extends StatefulWidget {
  const AccountsScreen({super.key});

  @override
  State<AccountsScreen> createState() => _AccountsScreenState();
}

class _AccountsScreenState extends State<AccountsScreen> {
  int _selectedAccount = 0;
  List<BankAccount> _accounts = [];
  List<Transaction> _transactions = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final repo = BankingRepository.instance;
      final results = await Future.wait([
        repo.getAccounts(),
        repo.getRecentTransactions(),
      ]);
      if (mounted) {
        setState(() {
          _accounts = results[0] as List<BankAccount>;
          _transactions = results[1] as List<Transaction>;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }
  
  // ✅ Calculate total revenues from transactions (positive amounts)
  double _calculateRevenues() {
    final now = DateTime.now();
    final currentMonth = now.month;
    final currentYear = now.year;
    
    return _transactions
        .where((tx) => tx.date.month == currentMonth && tx.date.year == currentYear && tx.amount > 0)
        .fold(0.0, (sum, tx) => sum + tx.amount);
  }
  
  // ✅ Calculate total expenses from transactions (negative amounts)
  double _calculateExpenses() {
    final now = DateTime.now();
    final currentMonth = now.month;
    final currentYear = now.year;
    
    return _transactions
        .where((tx) => tx.date.month == currentMonth && tx.date.year == currentYear && tx.amount < 0)
        .fold(0.0, (sum, tx) => sum + tx.amount.abs());
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final fg = Theme.of(context).colorScheme.onSurface;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.04);

    if (_loading) {
      return Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        body: const Center(child: CircularProgressIndicator(color: AppTheme.electricBlue)),
      );
    }

    if (_error != null || _accounts.isEmpty) {
      return Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.account_balance_wallet_rounded, size: 64, color: dk ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.1)),
                const SizedBox(height: 16),
                Text(_error != null ? 'Erreur: $_error' : 'Aucun compte', style: TextStyle(color: mt, fontSize: 16, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                ElevatedButton.icon(onPressed: _fetchData, icon: const Icon(Icons.refresh_rounded), label: const Text('Réessayer')),
              ],
            ),
          ),
        ),
      );
    }

    final acc = _accounts[_selectedAccount];

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // ── CUSTOM HEADER ────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      HapticFeedback.lightImpact();
                      Navigator.pop(context);
                    },
                    child: Container(
                      width: 44, height: 44,
                      decoration: BoxDecoration(
                        color: cd, shape: BoxShape.circle, border: Border.all(color: bd),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: dk ? 0.2 : 0.02), blurRadius: 10, offset: const Offset(0, 4)),
                        ],
                      ),
                      child: Icon(Icons.arrow_back_ios_new_rounded, color: fg, size: 16),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        p.translate('accounts'),
                        style: TextStyle(color: fg, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                      ),
                      Text(
                        "Gérer vos actifs financiers",
                        style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const Spacer(),
                  Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(
                      color: cd, shape: BoxShape.circle, border: Border.all(color: bd),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withValues(alpha: dk ? 0.2 : 0.02), blurRadius: 10, offset: const Offset(0, 4)),
                      ],
                    ),
                    child: Icon(Icons.add_card_rounded, color: fg, size: 20),
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.only(bottom: 40),
                child: Column(
                  children: [
                    const SizedBox(height: 16),

                    // ── ACCOUNT SELECTOR (CAROUSEL) ───────────────────────────
                    SizedBox(
                      height: 200,
                      child: PageView.builder(
                        itemCount: _accounts.length,
                        controller: PageController(viewportFraction: 0.88, initialPage: _selectedAccount),
                        onPageChanged: (idx) {
                          HapticFeedback.selectionClick();
                          setState(() => _selectedAccount = idx);
                        },
                        itemBuilder: (context, index) {
                          final item = _accounts[index];
                          final isSelected = index == _selectedAccount;
                          final List<Color> grad = [AppTheme.royalBlue, AppTheme.electricBlue];
                          if (item.type == AccountType.savings) {
                            grad[0] = AppTheme.emerald;
                            grad[1] = AppTheme.turquoise;
                          }
                          void onCardTap() {
                            if (isSelected) {
                              HapticFeedback.mediumImpact();
                              Navigator.push(context, PageRouteBuilder(
                                pageBuilder: (_, __, ___) => AccountDetailScreen(account: {
                                  'type': item.type == AccountType.savings ? 'Compte Épargne' : 'Compte Courant',
                                  'label': item.label,
                                  'number': item.iban,
                                  'balance': item.balance.toStringAsFixed(2),
                                  'currency': 'TND',
                                }),
                                transitionDuration: const Duration(milliseconds: 400),
                                transitionsBuilder: (_, a, __, c) => FadeTransition(opacity: a,
                                  child: SlideTransition(position: Tween<Offset>(begin: const Offset(0, 0.04), end: Offset.zero).animate(CurvedAnimation(parent: a, curve: Curves.easeOutCubic)), child: c)),
                              ));
                            }
                          }

                          return GestureDetector(
                            onTap: isSelected ? onCardTap : () { HapticFeedback.selectionClick(); setState(() => _selectedAccount = index); },
                            child: AnimatedScale(
                            scale: isSelected ? 1.0 : 0.95,
                            duration: 300.ms,
                            curve: Curves.easeOutQuart,
                            child: Container(
                              margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: grad,
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                borderRadius: BorderRadius.circular(30),
                                boxShadow: [
                                  BoxShadow(
                                    color: (grad[1]).withValues(alpha: isSelected ? 0.35 : 0.1),
                                    blurRadius: isSelected ? 24 : 10,
                                    offset: isSelected ? const Offset(0, 12) : const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Stack(
                                children: [
                                  Positioned(
                                    right: -30,
                                    bottom: -30,
                                    child: Icon(
                                      Icons.account_balance_wallet_rounded,
                                      size: 130,
                                      color: Colors.white.withValues(alpha: 0.08),
                                    ),
                                  ),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                item.type == AccountType.savings ? 'COMPTE ÉPARGNE' : 'COMPTE COURANT',
                                                style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 0.5),
                                              ),
                                              const SizedBox(height: 2),
                                              Text(
                                                item.label,
                                                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900),
                                              ),
                                            ],
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: Colors.white.withValues(alpha: 0.15),
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            child: Text(
                                              '${item.balance.toStringAsFixed(0)} TND',
                                              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
                                            ),
                                          ),
                                        ],
                                      ),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            "${item.balance.toStringAsFixed(2)} TND",
                                            style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            item.iban,
                                            style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 11, fontFamily: 'monospace', letterSpacing: 1),
                                          ),
                                        ],
                                      )
                                    ],
                                  ),
                                ],
                              ),
                             ),
                            ),
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 24),

                    // ── CASH FLOW WIDGET (INCOME VS EXPENSE) ───────────────────
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Container(
                        padding: const EdgeInsets.all(22),
                        decoration: BoxDecoration(
                          color: dk ? Colors.white.withValues(alpha: 0.03) : Colors.white,
                          borderRadius: BorderRadius.circular(28),
                          border: Border.all(color: bd),
                          boxShadow: [
                            if (!dk) BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 20, offset: const Offset(0, 10)),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "FLUX MENSUEL",
                              style: TextStyle(color: mt, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.5),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                Expanded(
                                  child: _flowCard(
                                    label: 'Revenus',
                                    amount: _calculateRevenues().toStringAsFixed(2), // ✅ Calculate from real transactions
                                    currency: 'TND',
                                    color: AppTheme.emerald,
                                    icon: Icons.arrow_downward_rounded,
                                    dk: dk,
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: _flowCard(
                                    label: 'Dépenses',
                                    amount: _calculateExpenses().toStringAsFixed(2), // ✅ Calculate from real transactions
                                    currency: 'TND',
                                    color: AppTheme.coralRed,
                                    icon: Icons.arrow_upward_rounded,
                                    dk: dk,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // ── INTERACTIVE ANALYTICS CARD ────────────────────────────
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Container(
                        padding: const EdgeInsets.all(22),
                        decoration: BoxDecoration(
                          color: dk ? Colors.white.withValues(alpha: 0.03) : Colors.white,
                          borderRadius: BorderRadius.circular(28),
                          border: Border.all(color: bd),
                          boxShadow: [
                            if (!dk) BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 20, offset: const Offset(0, 10)),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  "ANALYSES DES TRANSACTIONS",
                                  style: TextStyle(color: mt, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.5),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppTheme.electricBlue.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    "Ce Mois",
                                    style: TextStyle(color: AppTheme.electricBlue, fontSize: 10, fontWeight: FontWeight.w800),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),
                            // Simple visual trend bars
                            SizedBox(
                              height: 120,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: List.generate(7, (idx) {
                                  final double h1 = (20 + (idx * 15) % 80).toDouble();
                                  final double h2 = (10 + (idx * 25) % 65).toDouble();
                                  final isLast = idx == 6;

                                  return Column(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      Row(
                                        crossAxisAlignment: CrossAxisAlignment.end,
                                        children: [
                                          Container(
                                            width: 6,
                                            height: h1,
                                            decoration: BoxDecoration(
                                              color: AppTheme.emerald.withValues(alpha: isLast ? 1.0 : 0.4),
                                              borderRadius: BorderRadius.circular(3),
                                            ),
                                          ),
                                          const SizedBox(width: 4),
                                          Container(
                                            width: 6,
                                            height: h2,
                                            decoration: BoxDecoration(
                                              color: AppTheme.coralRed.withValues(alpha: isLast ? 1.0 : 0.4),
                                              borderRadius: BorderRadius.circular(3),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][idx],
                                        style: TextStyle(color: mt, fontSize: 9, fontWeight: FontWeight.w700),
                                      ),
                                    ],
                                  );
                                }),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // ── RECENT TRANSACTIONS HEADER ────────────────────────────
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "Transactions Récentes",
                            style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w800),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const TransactionsScreen()));
                            },
                            child: const Text("Voir Tout", style: TextStyle(color: AppTheme.electricBlue, fontWeight: FontWeight.w700, fontSize: 13)),
                          ),
                        ],
                      ),
                    ),

                    // ── TRANSACTIONS LIST ─────────────────────────────────────
                    _buildTransactionsList(dk, fg, mt, bd),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _flowCard({
    required String label,
    required String amount,
    required String currency,
    required Color color,
    required IconData icon,
    required bool dk,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: dk ? Colors.white.withValues(alpha: 0.02) : Colors.black.withValues(alpha: 0.01),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: dk ? Colors.white.withValues(alpha: 0.05) : Colors.black.withValues(alpha: 0.02)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(color: dk ? Colors.white54 : Colors.black54, fontSize: 11, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                Text(
                  "+$amount",
                  style: TextStyle(color: color, fontSize: 14, fontWeight: FontWeight.w800, letterSpacing: -0.2),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionsList(bool dk, Color fg, Color mt, Color bd) {
    final txList = _transactions.take(5).toList();

    if (txList.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: Text('Aucune transaction récente', style: TextStyle(color: mt, fontSize: 14, fontWeight: FontWeight.w600)),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: txList.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, i) {
        final tx = txList[i];
        final isIncome = tx.amount > 0;
        final catColor = AppTheme.electricBlue;

        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: dk ? Colors.white.withValues(alpha: 0.02) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: bd),
            boxShadow: [
              if (!dk) BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4)),
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  color: catColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(isIncome ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded, color: catColor, size: 20),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tx.title,
                      style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      tx.date.toString().substring(0, 10),
                      style: TextStyle(color: mt, fontSize: 11, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
              Text(
                '${isIncome ? '+' : ''}${tx.amount.toStringAsFixed(2)} TND',
                style: TextStyle(
                  color: isIncome ? AppTheme.emerald : fg,
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.2,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
