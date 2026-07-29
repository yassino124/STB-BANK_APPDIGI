import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../theme/app_theme.dart';
import '../../models/banking_models.dart';
import '../../services/auth_api_service.dart';

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});
  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  TransactionCategory? _filter;
  List<Transaction> _transactions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTransactions();
  }

  Future<void> _loadTransactions() async {
    setState(() => _isLoading = true);
    final res = await AuthApiService.getMyTransactions();
    
    if (res.isSuccess && res.data != null && mounted) {
      final list = res.data!.map((d) {
        
        // Determine if it's income or expense based on 'sens' field
        final sens = d['sens'] as String?;
        final isCredit = sens == 'CREDIT'; // CREDIT means incoming money
        
        final amount = (d['montant'] as num?)?.toDouble() ?? 0.0;
        final displayAmount = isCredit ? amount : -amount; // Negative for debit
        
        return Transaction(
          id: d['_id']?.toString() ?? 'unknown',
          title: d['motif'] ?? d['description'] ?? 'Transaction',
          subtitle: d['type'] ?? 'Opération bancaire',
          amount: displayAmount,
          date: d['dateOperation'] != null 
              ? DateTime.parse(d['dateOperation']) 
              : (d['date'] != null ? DateTime.parse(d['date']) : DateTime.now()),
          category: _mapCategory(d['type']),
          isDebit: !isCredit,
          status: TransactionStatus.completed,
        );
      }).toList();
      
      setState(() {
        _transactions = list;
        _isLoading = false;
      });
    } else {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  TransactionCategory _mapCategory(String? type) {
    if (type == 'SALARY') return TransactionCategory.income;
    if (type == 'CREDIT_DEBIT') return TransactionCategory.bills;
    if (type == 'TRANSFER') return TransactionCategory.transfer;
    return TransactionCategory.other;
  }

  static const _catColors = {
    TransactionCategory.income: AppTheme.emerald,
    TransactionCategory.food: Colors.orange,
    TransactionCategory.shopping: AppTheme.electricBlue,
    TransactionCategory.entertainment: AppTheme.violet,
    TransactionCategory.bills: AppTheme.amber,
    TransactionCategory.transfer: AppTheme.turquoise,
    TransactionCategory.transport: AppTheme.turquoise,
    TransactionCategory.other: AppTheme.textMutedLight,
  };
  static const _catIcons = {
    TransactionCategory.income: Icons.arrow_downward_rounded,
    TransactionCategory.food: Icons.shopping_basket_rounded,
    TransactionCategory.shopping: Icons.shopping_bag_rounded,
    TransactionCategory.entertainment: Icons.movie_filter_rounded,
    TransactionCategory.bills: Icons.receipt_rounded,
    TransactionCategory.transfer: Icons.swap_horiz_rounded,
    TransactionCategory.transport: Icons.directions_car_rounded,
    TransactionCategory.other: Icons.more_horiz_rounded,
  };

  List<Transaction> get _filtered => _filter == null
      ? _transactions
      : _transactions.where((t) => t.category == _filter).toList();

  void _showDetail(BuildContext context, Transaction tx, Color color, IconData icon) {
    final dk = Theme.of(context).brightness == Brightness.dark;
    final bg = dk ? const Color(0xFF0B1426) : Colors.white;
    final fg = dk ? Colors.white : const Color(0xFF0F172A);
    final mt = dk ? const Color(0xFF64748B) : const Color(0xFF94A3B8);
    final bd = dk ? Colors.white.withValues(alpha: 0.06) : Colors.black.withValues(alpha: 0.06);

    final now = DateTime.now();
    final diff = now.difference(tx.date);
    String dateLabel;
    if (diff.inDays == 0) {
      dateLabel = "Aujourd'hui a ${tx.date.hour.toString().padLeft(2,'0')}:${tx.date.minute.toString().padLeft(2,'0')}";
    } else if (diff.inDays == 1) {
      dateLabel = "Hier a ${tx.date.hour.toString().padLeft(2,'0')}:${tx.date.minute.toString().padLeft(2,'0')}";
    } else {
      dateLabel = "${tx.date.day.toString().padLeft(2,'0')}/${tx.date.month.toString().padLeft(2,'0')}/${tx.date.year}";
    }

    String statusLabel; Color statusColor;
    switch (tx.status) {
      case TransactionStatus.completed: statusLabel = 'Complete'; statusColor = AppTheme.emerald; break;
      case TransactionStatus.pending:   statusLabel = 'En cours'; statusColor = AppTheme.amber; break;
      case TransactionStatus.failed:    statusLabel = 'Echoue';   statusColor = AppTheme.coralRed; break;
      case null:                        statusLabel = 'Complete'; statusColor = AppTheme.emerald; break;
    }

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => Container(
        decoration: BoxDecoration(color: bg, borderRadius: const BorderRadius.vertical(top: Radius.circular(32))),
        padding: EdgeInsets.fromLTRB(24, 12, 24, MediaQuery.of(context).padding.bottom + 32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 40, height: 4, margin: const EdgeInsets.only(bottom: 28),
            decoration: BoxDecoration(color: mt.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2))),
          Row(children: [
            Container(width: 50, height: 50, decoration: BoxDecoration(color: color.withValues(alpha: 0.12), shape: BoxShape.circle),
              child: Icon(icon, color: color, size: 24)),
            const SizedBox(width: 16),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(tx.title, style: TextStyle(color: fg, fontSize: 17, fontWeight: FontWeight.w800)),
              const SizedBox(height: 2),
              Text(tx.category.label, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w600)),
            ])),
          ]),
          Divider(color: bd, height: 36),
          Text('Montant de la transaction', style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w500)),
          const SizedBox(height: 8),
          Text(tx.formattedAmount, style: TextStyle(
            color: tx.isCredit ? AppTheme.emerald : AppTheme.coralRed,
            fontSize: 36, fontWeight: FontWeight.w900, letterSpacing: -1,
          )),
          Divider(color: bd, height: 36),
          _row('Date', dateLabel, fg, mt),
          const SizedBox(height: 14),
          _row('Reference', '#TX-${tx.id.toUpperCase().substring(0, tx.id.length.clamp(0, 10))}', fg, mt),
          const SizedBox(height: 14),
          _row('Categorie', tx.category.label, fg, mt),
          const SizedBox(height: 14),
          _row('Statut', statusLabel, statusColor, mt, valueColor: statusColor),
          const SizedBox(height: 28),
          // Actions row
          Row(children: [
            Expanded(child: OutlinedButton.icon(
              onPressed: () { HapticFeedback.lightImpact(); },
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: AppTheme.electricBlue.withValues(alpha: 0.4)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              icon: const Icon(Icons.download_rounded, color: AppTheme.electricBlue, size: 18),
              label: const Text('Recu', style: TextStyle(color: AppTheme.electricBlue, fontSize: 13, fontWeight: FontWeight.w700)),
            )),
            const SizedBox(width: 12),
            Expanded(child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)), padding: EdgeInsets.zero),
              child: Ink(
                decoration: BoxDecoration(gradient: AppTheme.primaryGradient, borderRadius: BorderRadius.circular(14)),
                child: const Padding(padding: EdgeInsets.symmetric(vertical: 14),
                  child: Center(child: Text('Fermer', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800)))),
              ),
            )),
          ]),
        ]),
      ),
    );
  }

  Widget _row(String label, String value, Color fg, Color mt, {Color? valueColor}) =>
    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label, style: TextStyle(color: mt, fontSize: 14, fontWeight: FontWeight.w500)),
      Text(value, style: TextStyle(color: valueColor ?? fg, fontSize: 14, fontWeight: FontWeight.w800)),
    ]);

  @override
  Widget build(BuildContext context) {
    final dk = Theme.of(context).brightness == Brightness.dark;
    final fg = dk ? Colors.white : const Color(0xFF0F172A);
    final mt = dk ? const Color(0xFF64748B) : const Color(0xFF94A3B8);
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.05);

    final categories = TransactionCategory.values;

    return Scaffold(
      drawerEnableOpenDragGesture: false,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(child: Column(children: [
        // Header
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
          child: Row(children: [
            GestureDetector(
              onTap: () { HapticFeedback.lightImpact(); Navigator.pop(context); },
              child: Container(width: 46, height: 46, decoration: BoxDecoration(color: cd, shape: BoxShape.circle, border: Border.all(color: bd), boxShadow: AppTheme.cardShadow(dk)),
                child: Icon(Icons.arrow_back_ios_new_rounded, color: fg, size: 18)),
            ),
            const SizedBox(width: 16),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Toutes les Transactions', style: TextStyle(color: fg, fontSize: 20, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
              Text('${_filtered.length} transactions', style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
            ])),
          ]).animate().fadeIn(duration: 300.ms),
        ),
        const SizedBox(height: 16),
        // Filter chips
        SizedBox(
          height: 38,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            physics: const BouncingScrollPhysics(),
            children: [
              _chip('Tout', null, fg, mt, cd, bd),
              ...categories.map((c) => _chip(c.label, c, fg, mt, cd, bd)),
            ],
          ),
        ),
        const SizedBox(height: 12),
        // AI Insights Banner
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF0F172A), Color(0xFF1E293B)]),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [BoxShadow(color: const Color(0xFF1E293B).withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 4))],
              border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
            ),
            child: Row(
              children: [
                Container(
                  width: 42, height: 42,
                  decoration: BoxDecoration(
                    color: AppTheme.electricBlue.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                    border: Border.all(color: AppTheme.electricBlue.withValues(alpha: 0.5)),
                  ),
                  child: const Icon(Icons.psychology_rounded, color: AppTheme.electricBlue, size: 22),
                ).animate(onPlay: (c) => c.repeat(reverse: true)).scale(begin: const Offset(0.95, 0.95), end: const Offset(1.05, 1.05), duration: 1.seconds),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text("AI Insight Détecté", style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: AppTheme.coralRed.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(6)),
                            child: const Text("Alerte", style: TextStyle(color: AppTheme.coralRed, fontSize: 9, fontWeight: FontWeight.w700)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "Dépenses 'Food' en hausse de +25% par rapport au mois dernier. Voulez-vous ajuster le budget ?",
                        style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 11, fontWeight: FontWeight.w500, height: 1.3),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(delay: 400.ms).slideY(begin: -0.1),
        ),
        const SizedBox(height: 12),
        // Transactions list
        Expanded(
          child: _isLoading 
              ? const Center(child: CircularProgressIndicator(color: AppTheme.electricBlue))
              : _filtered.isEmpty
                  ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                      Icon(Icons.receipt_long_rounded, color: mt.withValues(alpha: 0.3), size: 52),
                      const SizedBox(height: 12),
                      Text('Aucune transaction', style: TextStyle(color: mt, fontSize: 15, fontWeight: FontWeight.w600)),
                    ]))
                  : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 80),
                  physics: const BouncingScrollPhysics(),
                  itemCount: _filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (_, i) {
                    final tx = _filtered[i];
                    final color = _catColors[tx.category] ?? AppTheme.textMutedLight;
                    final icon = _catIcons[tx.category] ?? Icons.more_horiz_rounded;
                    return GestureDetector(
                      onTap: () { HapticFeedback.mediumImpact(); _showDetail(context, tx, color, icon); },
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(color: cd, borderRadius: BorderRadius.circular(20), border: Border.all(color: bd), boxShadow: AppTheme.cardShadow(dk)),
                        child: Row(children: [
                          Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                            child: Icon(icon, color: color, size: 20)),
                          const SizedBox(width: 14),
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(tx.title, style: TextStyle(color: fg, fontSize: 14, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 2),
                            Text(tx.category.label, style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w500)),
                          ])),
                          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                            Text(tx.formattedAmount, style: TextStyle(color: tx.isCredit ? AppTheme.emerald : AppTheme.coralRed, fontSize: 14, fontWeight: FontWeight.w800)),
                            const SizedBox(height: 3),
                            Icon(Icons.chevron_right_rounded, color: mt.withValues(alpha: 0.4), size: 16),
                          ]),
                        ]),
                      ),
                    ).animate().fadeIn(delay: (i * 30).ms).slideX(begin: 0.04);
                  },
                ),
        ),
      ])),
    );
  }

  Widget _chip(String label, TransactionCategory? cat, Color fg, Color mt, Color cd, Color bd) {
    final sel = _filter == cat;
    return GestureDetector(
      onTap: () { HapticFeedback.selectionClick(); setState(() => _filter = cat); },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: sel ? AppTheme.electricBlue : cd,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: sel ? AppTheme.electricBlue : bd),
        ),
        alignment: Alignment.center,
        child: Text(label, style: TextStyle(color: sel ? Colors.white : mt, fontSize: 12, fontWeight: FontWeight.w700)),
      ),
    );
  }
}
