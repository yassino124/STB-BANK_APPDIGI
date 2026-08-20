import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../viewmodels/dashboard_viewmodel.dart';
import 'ai_spending_screen.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});
  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen>
    with TickerProviderStateMixin {
  int _selectedPeriod = 1;
  late AnimationController _barAnim;
  late AnimationController _pulseAnim;
  int _activeIndex = -1;
  int _activeCat = -1;

  List<String> get _months {
    final months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    final now = DateTime.now();
    List<String> labels = [];
    for (int i = 5; i >= 0; i--) {
      int m = now.month - i;
      if (m <= 0) m += 12;
      labels.add(months[m - 1]);
    }
    return labels;
  }
  // Replaced static values with dynamic ones loaded from view model

  @override
  void initState() {
    super.initState();
    _barAnim = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..forward();
    _pulseAnim = AnimationController(vsync: this, duration: const Duration(milliseconds: 2000))
      ..repeat(reverse: true);
  }

  @override
  void dispose() {
    _barAnim.dispose();
    _pulseAnim.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final fg = dk ? const Color(0xFFF1F5F9) : const Color(0xFF0F172A);
    final mt = dk ? const Color(0xFF64748B) : const Color(0xFF94A3B8);
    final bg = dk ? const Color(0xFF060D1A) : const Color(0xFFF4F7FB);
    final cd = dk ? const Color(0xFF0E1827) : Colors.white;
    final bd = dk ? const Color(0xFF1C2D44) : const Color(0xFFE8EDF5);

    final vm = Provider.of<DashboardViewModel>(context);

    return Scaffold(
      backgroundColor: bg,
      body: Stack(
        children: [
          // Ambient background orbs
          if (dk) ...[
            Positioned(top: -60, right: -40, child: _ambientOrb(160, AppTheme.electricBlue, 0.08)),
            Positioned(top: 200, left: -50, child: _ambientOrb(120, AppTheme.violet, 0.06)),
          ],
          SafeArea(
            child: Column(
              children: [
                _buildHeader(fg, mt, cd, bd, dk),
                const SizedBox(height: 16),
                _buildPeriodSelector(mt, dk),
                const SizedBox(height: 20),
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildOverviewCard(vm, fg, mt, cd, bd, dk),
                        const SizedBox(height: 24),
                        _buildSpendingTrend(vm, fg, mt, cd, bd, dk),
                        const SizedBox(height: 24),
                        _buildCategorySection(vm, fg, mt, cd, bd, dk),
                        const SizedBox(height: 24),
                        _buildInsightsBanner(fg, mt, dk),
                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _ambientOrb(double size, Color color, double opacity) => Container(
    width: size, height: size,
    decoration: BoxDecoration(
      shape: BoxShape.circle,
      gradient: RadialGradient(colors: [color.withValues(alpha: opacity), Colors.transparent]),
    ),
  );

  Widget _buildHeader(Color fg, Color mt, Color cd, Color bd, bool dk) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Row(
        children: [
          GestureDetector(
            onTap: () { HapticFeedback.lightImpact(); Navigator.pop(context); },
            child: Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                color: cd, shape: BoxShape.circle,
                border: Border.all(color: bd),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
              ),
              child: Icon(Icons.arrow_back_rounded, color: fg, size: 20),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('ANALYTIQUES', style: GoogleFonts.inter(color: AppTheme.electricBlue, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 2)),
                Text('Tableau de bord', style: GoogleFonts.inter(color: fg, fontSize: 22, fontWeight: FontWeight.w900, letterSpacing: -0.5)),
              ],
            ),
          ),
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [AppTheme.royalBlue, AppTheme.electricBlue]),
              borderRadius: BorderRadius.circular(14),
              boxShadow: [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, 4))],
            ),
            child: const Icon(Icons.tune_rounded, color: Colors.white, size: 20),
          ),
        ],
      ).animate().fadeIn().slideY(begin: -0.1),
    );
  }

  Widget _buildPeriodSelector(Color mt, bool dk) {
    final labels = ['Semaine', 'Mois', 'Année'];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        height: 48,
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: dk ? const Color(0xFF0E1827) : Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: dk ? const Color(0xFF1C2D44) : const Color(0xFFE8EDF5)),
        ),
        child: Row(
          children: labels.asMap().entries.map((e) {
            final sel = _selectedPeriod == e.key;
            return Expanded(
              child: GestureDetector(
                onTap: () {
                  HapticFeedback.selectionClick();
                  setState(() { _selectedPeriod = e.key; _barAnim.forward(from: 0); });
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeOutExpo,
                  decoration: BoxDecoration(
                    gradient: sel ? const LinearGradient(colors: [AppTheme.royalBlue, AppTheme.electricBlue], begin: Alignment.topLeft, end: Alignment.bottomRight) : null,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: sel ? [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.35), blurRadius: 10, offset: const Offset(0, 3))] : [],
                  ),
                  child: Center(child: Text(e.value, style: GoogleFonts.inter(color: sel ? Colors.white : mt, fontSize: 13, fontWeight: FontWeight.w700))),
                ),
              ),
            );
          }).toList(),
        ),
      ).animate().fadeIn(delay: 100.ms),
    );
  }

  Widget _buildOverviewCard(DashboardViewModel vm, Color fg, Color mt, Color cd, Color bd, bool dk) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: dk
              ? [const Color(0xFF0D1B35), const Color(0xFF0A1628)]
              : [const Color(0xFF0D47A1), const Color(0xFF2962FF)],
          begin: Alignment.topLeft, end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: dk ? 0.2 : 0.35), blurRadius: 24, offset: const Offset(0, 8))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Text('Dépenses totales', style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.7), fontSize: 13, fontWeight: FontWeight.w600)),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.arrow_upward_rounded, color: Color(0xFFFF6B6B), size: 12),
                const SizedBox(width: 3),
                Text('8% ce mois', style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
              ]),
            ),
          ]),
          const SizedBox(height: 10),
          Text(vm.monthlyExpenses.toStringAsFixed(2).replaceAll('.', ','), style: GoogleFonts.inter(color: Colors.white, fontSize: 38, fontWeight: FontWeight.w900, letterSpacing: -1.5)),
          Text('TND', style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.6), fontSize: 14, fontWeight: FontWeight.w700)),
          const SizedBox(height: 20),
          Container(height: 1, color: Colors.white.withValues(alpha: 0.1)),
          const SizedBox(height: 20),
          Row(children: [
            Expanded(child: _overviewStat('Revenus', '${vm.monthlyIncome.toStringAsFixed(0)} TND', const Color(0xFF6EE7B7), Icons.arrow_downward_rounded)),
            Container(width: 1, height: 40, color: Colors.white.withValues(alpha: 0.1)),
            Expanded(child: _overviewStat('Épargne', '${(vm.monthlyIncome - vm.monthlyExpenses).clamp(0, double.infinity).toStringAsFixed(0)} TND', const Color(0xFF93C5FD), Icons.savings_rounded)),
            Container(width: 1, height: 40, color: Colors.white.withValues(alpha: 0.1)),
            Expanded(child: _overviewStat('Tx épargne', '${vm.monthlyIncome > 0 ? ((vm.monthlyIncome - vm.monthlyExpenses).clamp(0, double.infinity) / vm.monthlyIncome * 100).toStringAsFixed(0) : 0}%', const Color(0xFFFCD34D), Icons.trending_up_rounded)),
          ]),
        ],
      ),
    ).animate().fadeIn(delay: 150.ms).slideY(begin: 0.05);
  }

  Widget _overviewStat(String label, String value, Color color, IconData icon) => Column(
    children: [
      Row(mainAxisAlignment: MainAxisAlignment.center, mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, color: color, size: 14),
        const SizedBox(width: 4),
        Text(value, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800)),
      ]),
      const SizedBox(height: 4),
      Text(label, style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.55), fontSize: 10, fontWeight: FontWeight.w600)),
    ],
  );

   Widget _buildSpendingTrend(DashboardViewModel vm, Color fg, Color mt, Color cd, Color bd, bool dk) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          Text('Tendance des dépenses', style: GoogleFonts.inter(color: fg, fontSize: 17, fontWeight: FontWeight.w800, letterSpacing: -0.3)),
          const Spacer(),
          if (_activeIndex != -1 && _activeIndex < vm.monthlyHistory.length)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppTheme.electricBlue.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text('${vm.monthlyHistory[_activeIndex].round()} TND', style: GoogleFonts.inter(color: AppTheme.electricBlue, fontSize: 13, fontWeight: FontWeight.w800)),
            ).animate().fadeIn(duration: 150.ms),
        ]).animate().fadeIn(delay: 200.ms),
        const SizedBox(height: 16),
        LayoutBuilder(builder: (context, constraints) {
          return GestureDetector(
            onPanUpdate: (d) {
              final bw = constraints.maxWidth / vm.monthlyHistory.length;
              final i = (d.localPosition.dx / bw).floor().clamp(0, vm.monthlyHistory.length - 1);
              if (i != _activeIndex) { HapticFeedback.selectionClick(); setState(() => _activeIndex = i); }
            },
            onPanDown: (d) {
              final bw = constraints.maxWidth / vm.monthlyHistory.length;
              final i = (d.localPosition.dx / bw).floor().clamp(0, vm.monthlyHistory.length - 1);
              HapticFeedback.selectionClick();
              setState(() => _activeIndex = i);
            },
            onPanEnd: (_) => setState(() => _activeIndex = -1),
            child: Container(
              height: 200,
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
              decoration: BoxDecoration(
                color: cd,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: bd),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: dk ? 0.2 : 0.04), blurRadius: 20, offset: const Offset(0, 6))],
              ),
              child: AnimatedBuilder(
                animation: _barAnim,
                builder: (_, __) {
                  final maxV = vm.monthlyHistory.isNotEmpty ? vm.monthlyHistory.reduce((a, b) => a > b ? a : b) : 1.0;
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: vm.monthlyHistory.asMap().entries.map((e) {
                      final pct = maxV > 0 ? (e.value / maxV) * _barAnim.value : 0.0;
                      final isSel = _activeIndex == e.key;
                      final isMax = e.value == maxV && maxV > 0;
                      return Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          if (isSel)
                            Container(
                              margin: const EdgeInsets.only(bottom: 4),
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: AppTheme.electricBlue, borderRadius: BorderRadius.circular(6)),
                              child: Text('${e.value.round()}', style: GoogleFonts.inter(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800)),
                            ),
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeOutExpo,
                            width: 24,
                            height: (110 * pct).clamp(0, 110).toDouble(),
                            decoration: BoxDecoration(
                              gradient: isSel || isMax 
                                  ? const LinearGradient(colors: [AppTheme.royalBlue, AppTheme.electricBlue], begin: Alignment.bottomCenter, end: Alignment.topCenter)
                                  : null,
                              color: isSel || isMax ? null : (dk ? const Color(0xFF1C2D44) : const Color(0xFFE8EDF5)),
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: isSel || isMax ? [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.35), blurRadius: 8, offset: const Offset(0, -2))] : [],
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(e.key < _months.length ? _months[e.key] : '', style: GoogleFonts.inter(color: isSel ? AppTheme.electricBlue : mt, fontSize: 10, fontWeight: isSel ? FontWeight.w800 : FontWeight.w600)),
                        ],
                      );
                    }).toList(),
                  );
                },
              ),
            ),
          );
        }).animate().fadeIn(delay: 250.ms),
      ],
    );
  }

  Map<String, dynamic> _getCatMeta(String label) {
    final l = label.toLowerCase();
    if (l.contains('alim') || l.contains('rest')) return {'icon': Icons.restaurant_rounded, 'color': 0xFF3B82F6};
    if (l.contains('shop') || l.contains('achats')) return {'icon': Icons.shopping_bag_rounded, 'color': 0xFF00BFA5};
    if (l.contains('trans') || l.contains('auto')) return {'icon': Icons.directions_car_rounded, 'color': 0xFFF59E0B};
    if (l.contains('fact')) return {'icon': Icons.bolt_rounded, 'color': 0xFFEF4444};
    if (l.contains('sant') || l.contains('medic')) return {'icon': Icons.favorite_rounded, 'color': 0xFF10B981};
    return {'icon': Icons.category_rounded, 'color': 0xFF94A3B8};
  }

  Widget _buildCategorySection(DashboardViewModel vm, Color fg, Color mt, Color cd, Color bd, bool dk) {
    final total = vm.spending.fold(0.0, (s, c) => s + c.amount);
    
    // Map SpendingCategory to UI format
    final List<Map<String, dynamic>> mappedCategories = vm.spending.map((c) {
      final meta = _getCatMeta(c.label);
      return {
        'label': c.label,
        'amount': c.amount,
        'pct': c.percentage,
        'icon': meta['icon'],
        'color': meta['color'],
      };
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          Text('Par catégorie', style: GoogleFonts.inter(color: fg, fontSize: 17, fontWeight: FontWeight.w800, letterSpacing: -0.3)),
          const Spacer(),
          Text('${total.round()} TND total', style: GoogleFonts.inter(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
        ]).animate().fadeIn(delay: 300.ms),
        const SizedBox(height: 16),
        // Donut chart
        Center(
          child: SizedBox(
            width: 200, height: 200,
            child: Stack(
              alignment: Alignment.center,
              children: [
                CustomPaint(size: const Size(200, 200), painter: _DonutPainter(mappedCategories, _activeCat)),
                Column(mainAxisSize: MainAxisSize.min, children: [
                  Text(_activeCat == -1 ? 'Total' : (mappedCategories[_activeCat]['label'] as String),
                    style: GoogleFonts.inter(color: mt, fontSize: 11, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text(
                    _activeCat == -1 ? total.round().toString() : (mappedCategories[_activeCat]['amount'] as double).round().toString(),
                    style: GoogleFonts.inter(color: fg, fontSize: 26, fontWeight: FontWeight.w900, letterSpacing: -1),
                  ),
                  Text('TND', style: GoogleFonts.inter(color: AppTheme.electricBlue, fontSize: 12, fontWeight: FontWeight.w800)),
                ]),
              ],
            ),
          ),
        ).animate().fadeIn(delay: 350.ms).scale(begin: const Offset(0.85, 0.85), curve: Curves.easeOutBack),
        const SizedBox(height: 24),
        // Category rows
        ...(mappedCategories.asMap().entries.map((e) {
          final cat = e.value;
          final color = Color(cat['color'] as int);
          final isActive = _activeCat == e.key;
          return GestureDetector(
            onTap: () {
              HapticFeedback.selectionClick();
              setState(() => _activeCat = isActive ? -1 : e.key);
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeOutExpo,
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isActive ? color.withValues(alpha: dk ? 0.12 : 0.06) : cd,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: isActive ? color.withValues(alpha: 0.4) : bd, width: isActive ? 1.5 : 1),
                boxShadow: isActive ? [BoxShadow(color: color.withValues(alpha: 0.15), blurRadius: 16, offset: const Offset(0, 4))] : [],
              ),
              child: Row(children: [
                Container(
                  width: 46, height: 46,
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(cat['icon'] as IconData, color: color, size: 22),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(cat['label'] as String, style: GoogleFonts.inter(color: fg, fontWeight: FontWeight.w700, fontSize: 14)),
                          Text('${cat['amount']} TND', style: GoogleFonts.inter(color: fg, fontWeight: FontWeight.w800, fontSize: 14)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Stack(children: [
                        Container(height: 6, decoration: BoxDecoration(color: mt.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(3))),
                        AnimatedBuilder(
                          animation: _barAnim,
                          builder: (_, __) => FractionallySizedBox(
                            widthFactor: (cat['pct'] as double) * _barAnim.value,
                            child: Container(
                              height: 6,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(colors: [color.withValues(alpha: 0.7), color]),
                                borderRadius: BorderRadius.circular(3),
                              ),
                            ),
                          ),
                        ),
                      ]),
                      const SizedBox(height: 5),
                      Text('${((cat['pct'] as double) * 100).round()}% du total', style: GoogleFonts.inter(color: mt, fontSize: 10, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ]),
            ),
          ).animate().fadeIn(delay: (380 + e.key * 50).ms).slideX(begin: 0.04);
        })),
      ],
    );
  }

  Widget _buildInsightsBanner(Color fg, Color mt, bool dk) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.mediumImpact();
        Navigator.push(context, MaterialPageRoute(builder: (_) => const AISpendingScreen()));
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: dk
                ? [const Color(0xFF10B981).withValues(alpha: 0.15), const Color(0xFF059669).withValues(alpha: 0.08)]
                : [const Color(0xFFECFDF5), const Color(0xFFD1FAE5)],
          ),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.25)),
        ),
        child: Row(children: [
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(color: AppTheme.emerald.withValues(alpha: 0.15), shape: BoxShape.circle),
            child: const Icon(Icons.auto_awesome_rounded, color: AppTheme.emerald, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('STB Copilot AI Insights', style: GoogleFonts.inter(color: AppTheme.emerald, fontSize: 13, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
            const SizedBox(height: 4),
            Text("Appuyez pour générer une analyse détaillée de vos dépenses avec l'IA.", style: GoogleFonts.inter(color: fg, fontSize: 13, fontWeight: FontWeight.w600)),
          ])),
          const Icon(Icons.chevron_right_rounded, color: AppTheme.emerald),
        ]),
      ).animate().fadeIn(delay: 700.ms).slideY(begin: 0.05).scale(),
    );
  }
}

class _DonutPainter extends CustomPainter {
  final List<Map<String, dynamic>> data;
  final int activeIndex;
  _DonutPainter(this.data, this.activeIndex);

  @override
  void paint(Canvas canvas, Size size) {
    final c = Offset(size.width / 2, size.height / 2);
    const strokeW = 18.0;
    var startAngle = -math.pi / 2;
    for (int i = 0; i < data.length; i++) {
      final cat = data[i];
      final sweep = (cat['pct'] as double) * 2 * math.pi;
      final isActive = activeIndex == i;
      final r = size.width / 2 - 14 + (isActive ? 6.0 : 0.0);
      final paint = Paint()
        ..color = Color(cat['color'] as int).withValues(alpha: activeIndex == -1 || isActive ? 1.0 : 0.3)
        ..style = PaintingStyle.stroke
        ..strokeWidth = isActive ? strokeW + 4 : strokeW
        ..strokeCap = StrokeCap.round;
      canvas.drawArc(Rect.fromCircle(center: c, radius: r), startAngle + 0.05, sweep - 0.1, false, paint);
      startAngle += sweep;
    }
  }

  @override
  bool shouldRepaint(covariant _DonutPainter old) => old.activeIndex != activeIndex;
}
