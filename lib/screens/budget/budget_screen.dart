import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_api_service.dart';

// ── Category config ───────────────────────────────────────────────────────────
Map<String, dynamic> _catConfig(String cat) {
  const configs = {
    'TRAVEL':        {'icon': Icons.flight_takeoff_rounded,      'label': 'Voyage',       'g': [Color(0xFF0EA5E9), Color(0xFF2563EB)]},
    'SAVINGS':       {'icon': Icons.trending_up_rounded,          'label': 'Épargne',      'g': [Color(0xFF10B981), Color(0xFF059669)]},
    'EMERGENCY':     {'icon': Icons.shield_rounded,               'label': 'Urgence',      'g': [Color(0xFFEF4444), Color(0xFFB91C1C)]},
    'FOOD':          {'icon': Icons.restaurant_rounded,           'label': 'Alimentation', 'g': [Color(0xFFF59E0B), Color(0xFFD97706)]},
    'TRANSPORT':     {'icon': Icons.directions_car_rounded,       'label': 'Transport',    'g': [Color(0xFF8B5CF6), Color(0xFF7C3AED)]},
    'ENTERTAINMENT': {'icon': Icons.celebration_rounded,          'label': 'Loisirs',      'g': [Color(0xFFEC4899), Color(0xFFDB2777)]},
    'SHOPPING':      {'icon': Icons.shopping_bag_rounded,         'label': 'Shopping',     'g': [Color(0xFFF97316), Color(0xFFEA580C)]},
    'BILLS':         {'icon': Icons.receipt_long_rounded,         'label': 'Factures',     'g': [Color(0xFF64748B), Color(0xFF475569)]},
    'HOME':          {'icon': Icons.home_rounded,                 'label': 'Maison',       'g': [Color(0xFF06B6D4), Color(0xFF0891B2)]},
    'HEALTH':        {'icon': Icons.favorite_rounded,             'label': 'Santé',        'g': [Color(0xFFEF4444), Color(0xFFDB2777)]},
    'EDUCATION':     {'icon': Icons.school_rounded,               'label': 'Éducation',    'g': [Color(0xFF3B82F6), Color(0xFF1D4ED8)]},
    'OTHER':         {'icon': Icons.category_rounded,             'label': 'Autre',        'g': [Color(0xFF6B7280), Color(0xFF4B5563)]},
  };
  return configs[cat] ?? configs['OTHER']!;
}

class BudgetsScreen extends StatefulWidget {
  const BudgetsScreen({super.key});
  @override
  State<BudgetsScreen> createState() => _BudgetsScreenState();
}

class _BudgetsScreenState extends State<BudgetsScreen> {
  List<dynamic> _budgets = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _fetchBudgets(); }

  Future<void> _fetchBudgets() async {
    final res = await AuthApiService.getBudgets();
    if (mounted) setState(() { _budgets = res.data ?? []; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    final p  = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final bg = dk ? const Color(0xFF04111F) : const Color(0xFFF1F5F9);

    // Summary stats
    final totalGoal  = _budgets.fold<double>(0, (s, b) => s + ((b['amount'] ?? 0) as num).toDouble());
    final totalSaved = _budgets.where((b) => b['type'] == 'SAVINGS_GOAL').fold<double>(0, (s, b) => s + ((b['saved'] ?? 0) as num).toDouble());
    final completed  = _budgets.where((b) {
      final amt = ((b['amount'] ?? 0) as num).toDouble();
      final prg = b['type'] == 'SAVINGS_GOAL' ? ((b['saved'] ?? 0) as num).toDouble() : ((b['spent'] ?? 0) as num).toDouble();
      return amt > 0 && prg >= amt;
    }).length;

    return Scaffold(
      backgroundColor: bg,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () { HapticFeedback.mediumImpact(); _showAddGoalDialog(context, dk); },
        backgroundColor: AppTheme.electricBlue,
        elevation: 12,
        extendedPadding: const EdgeInsets.symmetric(horizontal: 24),
        icon: const Icon(Icons.add_rounded, color: Colors.white, size: 22),
        label: Text('Nouvel Objectif', style: GoogleFonts.outfit(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.electricBlue))
          : CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                // ── Header ───────────────────────────────────────────────────
                SliverToBoxAdapter(child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 60, 20, 0),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    // Back button
                    GestureDetector(
                      onTap: () {
                        HapticFeedback.lightImpact();
                        Navigator.pop(context);
                      },
                      child: Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: dk ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: dk ? Colors.white.withValues(alpha: 0.12) : Colors.black.withValues(alpha: 0.08),
                          ),
                        ),
                        child: Icon(
                          Icons.arrow_back_rounded,
                          color: dk ? Colors.white : const Color(0xFF0F172A),
                          size: 20,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('Budgets & Épargne', style: GoogleFonts.outfit(
                          color: dk ? Colors.white : const Color(0xFF0F172A),
                          fontSize: 28, fontWeight: FontWeight.w900)),
                        const SizedBox(height: 4),
                        Text('Suivez vos objectifs financiers', style: GoogleFonts.inter(
                          color: dk ? Colors.white.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.3), fontSize: 13)),
                      ]),
                      Container(
                        padding: const EdgeInsets.all(13),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [AppTheme.electricBlue, Color(0xFF7C3AED)]),
                          borderRadius: BorderRadius.circular(18),
                          boxShadow: [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.4), blurRadius: 14, offset: const Offset(0, 6))],
                        ),
                        child: const Icon(Icons.wallet_rounded, color: Colors.white, size: 24),
                      ),
                    ]),
                    const SizedBox(height: 24),

                    // ── Summary Card ─────────────────────────────────────────
                    if (_budgets.isNotEmpty)
                      _SummaryCard(totalGoal: totalGoal, totalSaved: totalSaved, completed: completed, total: _budgets.length, dk: dk)
                          .animate().fadeIn(duration: 400.ms).slideY(begin: 0.1),

                    const SizedBox(height: 20),
                  ]),
                )),

                // ── Budget list ───────────────────────────────────────────────
                if (_budgets.isEmpty)
                  SliverFillRemaining(child: _EmptyState(dk: dk, onAdd: () => _showAddGoalDialog(context, dk)))
                else
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    sliver: SliverList(delegate: SliverChildBuilderDelegate(
                      (ctx, i) => _BudgetCard(budget: _budgets[i], isDark: dk)
                          .animate().fadeIn(delay: (i * 70).ms).slideY(begin: 0.15),
                      childCount: _budgets.length,
                    )),
                  ),

                const SliverToBoxAdapter(child: SizedBox(height: 110)),
              ],
            ),
    );
  }

  void _showAddGoalDialog(BuildContext context, bool dk) {
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
      builder: (ctx) => _AddGoalSheet(isDark: dk, onCreated: _fetchBudgets),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Summary Card
// ══════════════════════════════════════════════════════════════════════════════
class _SummaryCard extends StatelessWidget {
  final double totalGoal, totalSaved;
  final int completed, total;
  final bool dk;
  const _SummaryCard({required this.totalGoal, required this.totalSaved, required this.completed, required this.total, required this.dk});

  @override
  Widget build(BuildContext context) {
    final pct = totalGoal > 0 ? (totalSaved / totalGoal).clamp(0.0, 1.0) : 0.0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0D47A1), Color(0xFF1565C0), Color(0xFF0A3D91)],
          begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.35), blurRadius: 20, offset: const Offset(0, 8))],
      ),
      child: Column(children: [
        Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Total épargné', style: GoogleFonts.inter(color: Colors.white60, fontSize: 11, fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            Text('${totalSaved.toStringAsFixed(3)} TND', style: GoogleFonts.outfit(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
            Text('sur ${totalGoal.toStringAsFixed(3)} TND', style: GoogleFonts.inter(color: Colors.white60, fontSize: 11)),
          ])),
          Row(children: [
            _summaryPill('$completed/${total}', 'Atteints', const Color(0xFF10B981)),
            const SizedBox(width: 8),
            _summaryPill('${(pct * 100).toInt()}%', 'Global', const Color(0xFF00B4FF)),
          ]),
        ]),
        const SizedBox(height: 16),
        ClipRRect(borderRadius: BorderRadius.circular(6), child: LinearProgressIndicator(
          value: pct, minHeight: 8,
          backgroundColor: Colors.white.withValues(alpha: 0.12),
          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
        )),
      ]),
    );
  }

  Widget _summaryPill(String val, String label, Color c) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
    decoration: BoxDecoration(color: c.withValues(alpha: 0.18), borderRadius: BorderRadius.circular(12), border: Border.all(color: c.withValues(alpha: 0.4))),
    child: Column(children: [
      Text(val, style: GoogleFonts.outfit(color: c, fontSize: 16, fontWeight: FontWeight.w900)),
      Text(label, style: GoogleFonts.inter(color: c.withValues(alpha: 0.8), fontSize: 9, fontWeight: FontWeight.w700)),
    ]),
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Budget Card — Premium Design
// ══════════════════════════════════════════════════════════════════════════════
class _BudgetCard extends StatefulWidget {
  final Map<String, dynamic> budget;
  final bool isDark;
  const _BudgetCard({required this.budget, required this.isDark});
  @override
  State<_BudgetCard> createState() => _BudgetCardState();
}

class _BudgetCardState extends State<_BudgetCard> with SingleTickerProviderStateMixin {
  late AnimationController _ac;
  late Animation<double> _prog;
  late double _currentSaved;
  late double _currentSpent;

  @override
  void initState() {
    super.initState();
    _currentSaved = ((widget.budget['saved'] ?? 0) as num).toDouble();
    _currentSpent = ((widget.budget['spent'] ?? 0) as num).toDouble();
    _ac = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200));
    final isSavings = widget.budget['type'] == 'SAVINGS_GOAL';
    final amount = ((widget.budget['amount'] ?? 0) as num).toDouble();
    final pct = amount > 0 ? ((isSavings ? _currentSaved : _currentSpent) / amount).clamp(0.0, 1.0) : 0.0;
    _prog = Tween<double>(begin: 0, end: pct).animate(CurvedAnimation(parent: _ac, curve: Curves.easeOutCubic));
    _ac.forward();
  }

  @override
  void dispose() { _ac.dispose(); super.dispose(); }

  void _animateTo(double newProg, bool isSavings) {
    final amount = ((widget.budget['amount'] ?? 0) as num).toDouble();
    setState(() { if (isSavings) _currentSaved = newProg; else _currentSpent = newProg; });
    final newPct = amount > 0 ? (newProg / amount).clamp(0.0, 1.0) : 0.0;
    _prog = Tween<double>(begin: _prog.value, end: newPct)
        .animate(CurvedAnimation(parent: _ac, curve: Curves.easeOutCubic));
    _ac.forward(from: 0);
  }

  @override
  Widget build(BuildContext context) {
    final name     = widget.budget['name'] ?? 'Objectif';
    final category = widget.budget['category'] ?? 'OTHER';
    final isSavings = widget.budget['type'] == 'SAVINGS_GOAL';
    final amount   = ((widget.budget['amount'] ?? 0) as num).toDouble();
    final progress = isSavings ? _currentSaved : _currentSpent;
    final pct      = amount > 0 ? (progress / amount * 100) : 0.0;
    final remaining = (amount - progress).clamp(0, double.infinity);
    final isComplete = pct >= 100;
    final cfg      = _catConfig(category);
    final gradient = (cfg['g'] as List).cast<Color>();
    final icon     = cfg['icon'] as IconData;
    final catLabel = cfg['label'] as String;
    final dk       = widget.isDark;

    // Progress color
    Color progressColor;
    if (isSavings) {
      progressColor = isComplete ? const Color(0xFF10B981) : gradient[0];
    } else {
      progressColor = pct >= 90 ? const Color(0xFFEF4444) : pct >= 70 ? const Color(0xFFF59E0B) : const Color(0xFF10B981);
    }

    return GestureDetector(
      onTap: () { HapticFeedback.lightImpact(); _showAddDialog(context, isSavings); },
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          color: dk ? const Color(0xFF0D1F35) : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isComplete && isSavings
                ? const Color(0xFF10B981).withValues(alpha: 0.4)
                : (dk ? Colors.white.withValues(alpha: 0.07) : Colors.black.withValues(alpha: 0.05)),
            width: isComplete && isSavings ? 1.5 : 1,
          ),
          boxShadow: [BoxShadow(
            color: isComplete && isSavings
                ? const Color(0xFF10B981).withValues(alpha: 0.18)
                : Colors.black.withValues(alpha: dk ? 0.2 : 0.05),
            blurRadius: 18, offset: const Offset(0, 6),
          )],
        ),
        child: Column(children: [
          // ── Top section with gradient accent ─────────────────────────────
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [gradient[0].withValues(alpha: 0.08), gradient[1].withValues(alpha: 0.03)],
                begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Row(children: [
              // Category icon with gradient ring
              Container(
                width: 52, height: 52,
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: gradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [BoxShadow(color: gradient[0].withValues(alpha: 0.4), blurRadius: 12, offset: const Offset(0, 4))],
                ),
                child: Icon(icon, color: Colors.white, size: 26),
              ),
              const SizedBox(width: 14),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(name, style: GoogleFonts.outfit(
                  color: dk ? Colors.white : const Color(0xFF0F172A),
                  fontSize: 17, fontWeight: FontWeight.w800)),
                const SizedBox(height: 5),
                Row(children: [
                  _chip(catLabel, gradient[0]),
                  const SizedBox(width: 6),
                  _chip(isSavings ? 'Épargne' : 'Dépense',
                    isSavings ? const Color(0xFF10B981) : const Color(0xFFF59E0B)),
                ]),
              ])),
              // Percentage badge
              Container(
                width: 52, height: 52,
                decoration: BoxDecoration(
                  color: progressColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: progressColor.withValues(alpha: 0.35)),
                ),
                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Text('${pct.clamp(0, 100).toStringAsFixed(0)}', style: GoogleFonts.outfit(color: progressColor, fontSize: 15, fontWeight: FontWeight.w900)),
                  Text('%', style: GoogleFonts.inter(color: progressColor.withValues(alpha: 0.7), fontSize: 9, fontWeight: FontWeight.w700)),
                ]),
              ),
            ]),
          ),

          // ── Stats row ────────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 4),
            child: Row(children: [
              _stat(isSavings ? 'Objectif' : 'Budget', '${amount.toStringAsFixed(3)}', dk),
              _vDivider(dk),
              _stat(isSavings ? 'Épargné' : 'Dépensé', '${progress.toStringAsFixed(3)}', dk,
                color: isSavings ? const Color(0xFF10B981) : progressColor),
              _vDivider(dk),
              _stat(isSavings ? 'Restant' : 'Disponible', '${remaining.toStringAsFixed(3)}', dk,
                color: remaining > 0
                    ? (isSavings ? AppTheme.electricBlue : const Color(0xFF10B981))
                    : const Color(0xFFEF4444)),
            ]),
          ),

          // ── Progress bar ─────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 8, 18, 0),
            child: AnimatedBuilder(
              animation: _prog,
              builder: (_, __) => Stack(children: [
                Container(height: 10, decoration: BoxDecoration(
                  color: dk ? Colors.white.withValues(alpha: 0.06) : Colors.black.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(8))),
                FractionallySizedBox(
                  widthFactor: _prog.value.clamp(0.0, 1.0),
                  child: Container(height: 10, decoration: BoxDecoration(
                    gradient: LinearGradient(colors: isSavings
                        ? [const Color(0xFF10B981), const Color(0xFF34D399)]
                        : [progressColor, progressColor.withValues(alpha: 0.7)]),
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [BoxShadow(color: progressColor.withValues(alpha: 0.4), blurRadius: 6, offset: const Offset(0, 2))],
                  ))),
              ]),
            ),
          ),

          // ── Footer ───────────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 10, 18, 16),
            child: isComplete && isSavings
                ? Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3))),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      const Icon(Icons.celebration_rounded, color: Color(0xFF10B981), size: 16),
                      const SizedBox(width: 8),
                      Text('🎉 Objectif atteint ! Félicitations',
                        style: GoogleFonts.outfit(color: const Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.w800)),
                    ]))
                : Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.add_circle_outline_rounded, size: 13,
                      color: dk ? Colors.white.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.25)),
                    const SizedBox(width: 5),
                    Text(
                      isSavings ? 'Appuyez pour ajouter de l\'épargne' : 'Appuyez pour enregistrer une dépense',
                      style: GoogleFonts.inter(
                        color: dk ? Colors.white.withValues(alpha: 0.35) : Colors.black.withValues(alpha: 0.3),
                        fontSize: 11, fontWeight: FontWeight.w600)),
                  ]),
          ),
        ]),
      ),
    );
  }

  Widget _chip(String label, Color color) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(6)),
    child: Text(label, style: GoogleFonts.outfit(color: color, fontSize: 9, fontWeight: FontWeight.w800)),
  );

  Widget _vDivider(bool dk) => Container(
    width: 1, height: 36, margin: const EdgeInsets.symmetric(horizontal: 4),
    color: dk ? Colors.white.withValues(alpha: 0.07) : Colors.black.withValues(alpha: 0.06));

  Widget _stat(String label, String value, bool dk, {Color? color}) => Expanded(child: Column(children: [
    Text(label, style: GoogleFonts.inter(color: dk ? Colors.white38 : Colors.black38, fontSize: 10, fontWeight: FontWeight.w600)),
    const SizedBox(height: 3),
    Text(value, style: GoogleFonts.outfit(
      color: color ?? (dk ? Colors.white : const Color(0xFF0F172A)),
      fontSize: 13, fontWeight: FontWeight.w800), overflow: TextOverflow.ellipsis, maxLines: 1),
    Text('TND', style: GoogleFonts.inter(color: dk ? Colors.white.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.3), fontSize: 9)),
  ]));

  void _showAddDialog(BuildContext context, bool isSavings) {
    final ctrl = TextEditingController();
    final dk = widget.isDark;
    final cfg = _catConfig(widget.budget['category'] ?? 'OTHER');
    final gradient = (cfg['g'] as List).cast<Color>();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: dk ? const Color(0xFF0D1F35) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(children: [
          Container(padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(gradient: LinearGradient(colors: gradient), borderRadius: BorderRadius.circular(14),
              boxShadow: [BoxShadow(color: gradient[0].withValues(alpha: 0.4), blurRadius: 10)]),
            child: Icon(cfg['icon'] as IconData, color: Colors.white, size: 22)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(isSavings ? 'Ajouter Épargne' : 'Enregistrer Dépense',
              style: GoogleFonts.outfit(color: dk ? Colors.white : const Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.w800)),
            Text(widget.budget['name'] ?? '', style: GoogleFonts.inter(color: dk ? Colors.white54 : Colors.black45, fontSize: 11)),
          ])),
        ]),
        content: TextField(
          controller: ctrl,
          keyboardType: TextInputType.number,
          autofocus: true,
          style: GoogleFonts.outfit(color: dk ? Colors.white : const Color(0xFF0F172A), fontSize: 18, fontWeight: FontWeight.w800),
          decoration: InputDecoration(
            labelText: 'Montant (TND)', hintText: '0.000',
            filled: true, fillColor: dk ? Colors.white.withValues(alpha: 0.05) : Colors.black.withValues(alpha: 0.03),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
            prefixIcon: Icon(Icons.attach_money_rounded, color: gradient[0]),
            suffixText: 'TND', suffixStyle: GoogleFonts.outfit(color: gradient[0], fontWeight: FontWeight.w700),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx),
            child: Text('Annuler', style: GoogleFonts.inter(color: dk ? Colors.white54 : Colors.black45, fontWeight: FontWeight.w600))),
          ElevatedButton(
            onPressed: () async {
              final amount = double.tryParse(ctrl.text.trim());
              if (amount == null || amount <= 0) return;
              Navigator.pop(ctx);
              final newProg = (isSavings ? _currentSaved : _currentSpent) + amount;
              _animateTo(newProg, isSavings);
              final res = await AuthApiService.updateBudgetProgress(widget.budget['_id'], amount, isSavings);
              if (res.isSuccess && context.mounted) {
                HapticFeedback.mediumImpact();
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                  content: Row(children: [
                    const Icon(Icons.check_circle_rounded, color: Colors.white),
                    const SizedBox(width: 12),
                    Text(isSavings ? '+${amount.toStringAsFixed(3)} TND épargné ✨' : '+${amount.toStringAsFixed(3)} TND dépensé'),
                  ]),
                  backgroundColor: isSavings ? const Color(0xFF10B981) : AppTheme.amber,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ));
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: gradient[0], foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)), elevation: 0),
            child: Text('Confirmer', style: GoogleFonts.outfit(fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Empty State
// ══════════════════════════════════════════════════════════════════════════════
class _EmptyState extends StatelessWidget {
  final bool dk;
  final VoidCallback onAdd;
  const _EmptyState({required this.dk, required this.onAdd});

  @override
  Widget build(BuildContext context) => Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
    Container(width: 100, height: 100,
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF0D47A1), Color(0xFF2962FF)]),
        shape: BoxShape.circle,
        boxShadow: [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.3), blurRadius: 24, offset: const Offset(0, 8))]),
      child: const Icon(Icons.savings_rounded, color: Colors.white, size: 44)),
    const SizedBox(height: 24),
    Text('Aucun objectif encore', style: GoogleFonts.outfit(
      color: dk ? Colors.white70 : Colors.black54, fontSize: 20, fontWeight: FontWeight.w800)),
    const SizedBox(height: 8),
    Text('Créez votre premier objectif d\'épargne\net commencez à suivre vos progrès !',
      textAlign: TextAlign.center,
      style: GoogleFonts.inter(color: dk ? Colors.white38 : Colors.black38, fontSize: 13, height: 1.5)),
    const SizedBox(height: 28),
    GestureDetector(onTap: onAdd,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [AppTheme.electricBlue, Color(0xFF1D4ED8)]),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.4), blurRadius: 16)]),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.add_rounded, color: Colors.white, size: 20),
          const SizedBox(width: 8),
          Text('Créer un objectif', style: GoogleFonts.outfit(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800)),
        ]))),
  ]));
}

// ══════════════════════════════════════════════════════════════════════════════
// Add Goal Bottom Sheet — Premium
// ══════════════════════════════════════════════════════════════════════════════
class _AddGoalSheet extends StatefulWidget {
  final bool isDark;
  final VoidCallback onCreated;
  const _AddGoalSheet({required this.isDark, required this.onCreated});
  @override
  State<_AddGoalSheet> createState() => _AddGoalSheetState();
}

class _AddGoalSheetState extends State<_AddGoalSheet> {
  final _nameCtrl   = TextEditingController();
  final _amountCtrl = TextEditingController();
  String _type     = 'SAVINGS_GOAL';
  String _category = 'SAVINGS';
  bool   _saving   = false;

  final _categories = {
    'SAVINGS':       'Épargne générale',
    'TRAVEL':        'Voyage',
    'EMERGENCY':     'Fonds urgence',
    'FOOD':          'Alimentation',
    'TRANSPORT':     'Transport',
    'ENTERTAINMENT': 'Loisirs',
    'SHOPPING':      'Shopping',
    'BILLS':         'Factures',
    'HOME':          'Maison',
    'HEALTH':        'Santé',
    'EDUCATION':     'Éducation',
    'OTHER':         'Autre',
  };

  @override
  void dispose() { _nameCtrl.dispose(); _amountCtrl.dispose(); super.dispose(); }

  Future<void> _submit() async {
    if (_nameCtrl.text.trim().isEmpty || _amountCtrl.text.trim().isEmpty) return;
    setState(() => _saving = true);
    final profileRes = await AuthApiService.getMe();
    if (!profileRes.isSuccess || profileRes.data == null) { setState(() => _saving = false); return; }
    final now = DateTime.now();
    final data = {
      'employeeId': profileRes.data!['_id'],
      'name': _nameCtrl.text.trim(),
      'category': _category,
      'type': _type,
      'amount': double.parse(_amountCtrl.text.trim()),
      'period': 'YEARLY',
      'startDate': now.toIso8601String(),
      'endDate': DateTime(now.year + 1, now.month, now.day).toIso8601String(),
      'saved': 0, 'spent': 0, 'isActive': true, 'alertThreshold': 80,
    };
    final res = await AuthApiService.createBudget(data);
    setState(() => _saving = false);
    if (res.isSuccess && mounted) {
      Navigator.pop(context);
      widget.onCreated();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Row(children: [
          const Icon(Icons.check_circle_rounded, color: Colors.white),
          const SizedBox(width: 12),
          Text('${_type == 'SAVINGS_GOAL' ? 'Objectif' : 'Budget'} créé avec succès ✨'),
        ]),
        backgroundColor: AppTheme.emerald, behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    final dk  = widget.isDark;
    final cfg = _catConfig(_category);
    final gradient = (cfg['g'] as List).cast<Color>();

    return Container(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      decoration: BoxDecoration(
        color: dk ? const Color(0xFF0D1F35) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32))),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Center(child: Container(width: 44, height: 4,
            decoration: BoxDecoration(color: dk ? Colors.white24 : Colors.black12, borderRadius: BorderRadius.circular(2)))),
          const SizedBox(height: 20),
          Row(children: [
            Container(padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(gradient: LinearGradient(colors: gradient), borderRadius: BorderRadius.circular(14),
                boxShadow: [BoxShadow(color: gradient[0].withValues(alpha: 0.4), blurRadius: 10)]),
              child: Icon(cfg['icon'] as IconData, color: Colors.white, size: 22)),
            const SizedBox(width: 12),
            Text('Créer un Objectif', style: GoogleFonts.outfit(
              color: dk ? Colors.white : const Color(0xFF0F172A), fontSize: 22, fontWeight: FontWeight.w900)),
          ]),
          const SizedBox(height: 24),

          // Type selector
          Row(children: [
            Expanded(child: _typeBtn('Objectif Épargne', Icons.trending_up_rounded, 'SAVINGS_GOAL')),
            const SizedBox(width: 12),
            Expanded(child: _typeBtn('Budget Dépense', Icons.receipt_long_rounded, 'SPENDING')),
          ]),
          const SizedBox(height: 20),

          // Name
          _field(_nameCtrl, 'Nom de l\'objectif', 'Ex: Voyage à Paris', Icons.edit_rounded, dk),
          const SizedBox(height: 14),
          _field(_amountCtrl, 'Montant cible (TND)', '0.000', Icons.attach_money_rounded, dk, isNum: true),
          const SizedBox(height: 20),

          // Category grid
          Text('Catégorie', style: GoogleFonts.outfit(color: dk ? Colors.white70 : Colors.black.withValues(alpha: 0.7), fontSize: 14, fontWeight: FontWeight.w800)),
          const SizedBox(height: 12),
          GridView.count(
            shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 4, mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 0.85,
            children: _categories.entries.map((e) {
              final selected = _category == e.key;
              final c = _catConfig(e.key);
              final g = (c['g'] as List).cast<Color>();
              return GestureDetector(
                onTap: () { HapticFeedback.selectionClick(); setState(() => _category = e.key); },
                child: AnimatedContainer(duration: const Duration(milliseconds: 200),
                  decoration: BoxDecoration(
                    gradient: selected ? LinearGradient(colors: g) : null,
                    color: selected ? null : (dk ? Colors.white.withValues(alpha: 0.05) : Colors.black.withValues(alpha: 0.04)),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: selected ? Colors.transparent : (dk ? Colors.white12 : Colors.black.withValues(alpha: 0.06))),
                    boxShadow: selected ? [BoxShadow(color: g[0].withValues(alpha: 0.4), blurRadius: 8)] : [],
                  ),
                  child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(c['icon'] as IconData, color: selected ? Colors.white : (dk ? Colors.white54 : Colors.black45), size: 22),
                    const SizedBox(height: 4),
                    Text(e.value, textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        color: selected ? Colors.white : (dk ? Colors.white60 : Colors.black54),
                        fontSize: 9, fontWeight: FontWeight.w700, height: 1.2)),
                  ])),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),

          // Submit
          SizedBox(width: double.infinity,
            child: ElevatedButton(
              onPressed: _saving ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: gradient[0], foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                elevation: 0),
              child: _saving
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text('Créer l\'objectif', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800)),
            )),
          const SizedBox(height: 8),
        ]),
      ),
    );
  }

  Widget _typeBtn(String label, IconData icon, String value) {
    final selected = _type == value;
    return GestureDetector(
      onTap: () { HapticFeedback.selectionClick(); setState(() => _type = value); },
      child: AnimatedContainer(duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: selected ? AppTheme.electricBlue.withValues(alpha: 0.15) : (widget.isDark ? Colors.white.withValues(alpha: 0.05) : Colors.black.withValues(alpha: 0.03)),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: selected ? AppTheme.electricBlue : Colors.transparent, width: 2)),
        child: Column(children: [
          Icon(icon, color: selected ? AppTheme.electricBlue : (widget.isDark ? Colors.white54 : Colors.black45), size: 26),
          const SizedBox(height: 6),
          Text(label, textAlign: TextAlign.center, style: GoogleFonts.inter(
            color: selected ? AppTheme.electricBlue : (widget.isDark ? Colors.white70 : Colors.black54),
            fontSize: 11, fontWeight: selected ? FontWeight.w800 : FontWeight.w600)),
        ])),
    );
  }

  Widget _field(TextEditingController ctrl, String label, String hint, IconData icon, bool dk, {bool isNum = false}) {
    return TextField(
      controller: ctrl,
      keyboardType: isNum ? TextInputType.number : TextInputType.text,
      style: GoogleFonts.inter(color: dk ? Colors.white : const Color(0xFF0F172A), fontWeight: FontWeight.w600),
      decoration: InputDecoration(
        labelText: label, hintText: hint,
        labelStyle: TextStyle(color: dk ? Colors.white54 : Colors.black45),
        hintStyle: TextStyle(color: dk ? Colors.white.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.3)),
        filled: true, fillColor: dk ? Colors.white.withValues(alpha: 0.05) : Colors.black.withValues(alpha: 0.03),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        prefixIcon: Icon(icon, color: AppTheme.electricBlue, size: 20),
      ),
    );
  }
}
