import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_api_service.dart';

// ─────────────────────────────────────────────────────────────────────────────
//  Biller model
// ─────────────────────────────────────────────────────────────────────────────
class _Biller {
  final String id;
  final String name;
  final String emoji;
  final String subtitle;
  final List<Color> gradient;
  final Color glow;

  const _Biller({
    required this.id,
    required this.name,
    required this.emoji,
    required this.subtitle,
    required this.gradient,
    required this.glow,
  });
}

const _billers = [
  _Biller(
    id: 'STEG',
    name: 'STEG',
    emoji: '⚡',
    subtitle: 'Électricité & Gaz',
    gradient: [Color(0xFFFFC107), Color(0xFFFF8F00)],
    glow: Color(0xFFFFC107),
  ),
  _Biller(
    id: 'SONEDE',
    name: 'SONEDE',
    emoji: '💧',
    subtitle: 'Eau potable',
    gradient: [Color(0xFF0288D1), Color(0xFF0D47A1)],
    glow: Color(0xFF0288D1),
  ),
  _Biller(
    id: 'TOPNET',
    name: 'Topnet',
    emoji: '🌐',
    subtitle: 'Internet & Fibre',
    gradient: [Color(0xFF7C3AED), Color(0xFF4C1D95)],
    glow: Color(0xFF7C3AED),
  ),
  _Biller(
    id: 'TELECOM',
    name: 'Tunisie Telecom',
    emoji: '📡',
    subtitle: 'Téléphonie fixe',
    gradient: [Color(0xFF1A56DB), Color(0xFF0D47A1)],
    glow: Color(0xFF1A56DB),
  ),
  _Biller(
    id: 'TGM',
    name: 'TGM',
    emoji: '🚇',
    subtitle: 'Transport / Metro',
    gradient: [Color(0xFF10B981), Color(0xFF059669)],
    glow: Color(0xFF10B981),
  ),
];

// ─────────────────────────────────────────────────────────────────────────────
//  Screen
// ─────────────────────────────────────────────────────────────────────────────
class BillsScreen extends StatefulWidget {
  const BillsScreen({super.key});

  @override
  State<BillsScreen> createState() => _BillsScreenState();
}

class _BillsScreenState extends State<BillsScreen>
    with SingleTickerProviderStateMixin {
  List<dynamic> _bills = [];
  bool _loading = true;
  late AnimationController _bgAnim;

  @override
  void initState() {
    super.initState();
    _bgAnim = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 9),
    )..repeat(reverse: true);
    _fetchBills();
  }

  Future<void> _fetchBills() async {
    final res = await AuthApiService.getBills();
    if (mounted) {
      setState(() {
        _bills = res.data ?? [];
        _loading = false;
      });
    }
  }

  @override
  void dispose() {
    _bgAnim.dispose();
    super.dispose();
  }

  void _showPayDialog(BuildContext context, _Biller biller, bool dk) {
    HapticFeedback.mediumImpact();
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => _PayDialog(biller: biller, isDark: dk),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;

    return Scaffold(
      backgroundColor: dk ? AppTheme.bgDark : AppTheme.bgLight,
      body: Stack(
        children: [
          _AmbientBg(anim: _bgAnim, isDark: dk),
          SafeArea(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(
                        color: AppTheme.electricBlue))
                : CustomScrollView(
                    physics: const BouncingScrollPhysics(),
                    slivers: [
                      // ── Header
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                          child: _Header(isDark: dk)
                              .animate()
                              .fadeIn(duration: 500.ms)
                              .slideY(
                                  begin: -0.15, curve: Curves.easeOut),
                        ),
                      ),

                      // ── Biller category cards
                      SliverToBoxAdapter(
                        child: Padding(
                          padding:
                              const EdgeInsets.fromLTRB(20, 24, 20, 0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Payez vos factures',
                                style: AppTheme.caption(dk
                                    ? Colors.white54
                                    : AppTheme.textMutedLight),
                              ),
                              const SizedBox(height: 14),
                              // Row 1: first 3
                              Row(
                                children: List.generate(3, (i) {
                                  return Expanded(
                                    child: Padding(
                                      padding: EdgeInsets.only(
                                          right: i < 2 ? 10 : 0),
                                      child: _BillerCard(
                                        biller: _billers[i],
                                        isDark: dk,
                                        onTap: () => _showPayDialog(
                                            context, _billers[i], dk),
                                      )
                                          .animate()
                                          .fadeIn(
                                              delay: (i * 100).ms,
                                              duration: 400.ms)
                                          .scale(
                                              begin:
                                                  const Offset(0.8, 0.8),
                                              curve: Curves.easeOut),
                                    ),
                                  );
                                }),
                              ),
                              const SizedBox(height: 10),
                              // Row 2: last 2
                              Row(
                                children: List.generate(2, (i) {
                                  final idx = i + 3;
                                  return Expanded(
                                    child: Padding(
                                      padding: EdgeInsets.only(
                                          right: i < 1 ? 10 : 0),
                                      child: _BillerCard(
                                        biller: _billers[idx],
                                        isDark: dk,
                                        onTap: () => _showPayDialog(
                                            context, _billers[idx], dk),
                                      )
                                          .animate()
                                          .fadeIn(
                                              delay:
                                                  ((idx) * 100).ms,
                                              duration: 400.ms)
                                          .scale(
                                              begin:
                                                  const Offset(0.8, 0.8),
                                              curve: Curves.easeOut),
                                    ),
                                  );
                                }),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // ── History header
                      SliverToBoxAdapter(
                        child: Padding(
                          padding:
                              const EdgeInsets.fromLTRB(20, 32, 20, 12),
                          child: Row(
                            children: [
                              Text(
                                'Historique des paiements',
                                style: AppTheme.title(dk
                                    ? AppTheme.textPrimaryDark
                                    : AppTheme.textPrimaryLight),
                              ),
                              const Spacer(),
                              if (_bills.isNotEmpty)
                                Text(
                                  '${_bills.length} factures',
                                  style: AppTheme.caption(
                                      AppTheme.electricBlue),
                                ),
                            ],
                          ).animate().fadeIn(delay: 600.ms),
                        ),
                      ),

                      // ── Bills list or empty placeholder
                      if (_bills.isEmpty)
                        SliverPadding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 20),
                          sliver: SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (context, i) => _PlaceholderBillCard(
                                biller: _billers[i % _billers.length],
                                isDark: dk,
                              )
                                  .animate()
                                  .fadeIn(
                                      delay: (i * 100 + 700).ms)
                                  .slideX(begin: 0.1),
                              childCount: 4,
                            ),
                          ),
                        )
                      else
                        SliverPadding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 20),
                          sliver: SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (context, index) {
                                final bill = _bills[index]
                                    as Map<String, dynamic>;
                                return _BillHistoryCard(
                                  bill: bill,
                                  isDark: dk,
                                )
                                    .animate()
                                    .fadeIn(
                                        delay: (index * 80 + 700).ms,
                                        duration: 400.ms)
                                    .slideY(begin: 0.15);
                              },
                              childCount: _bills.length,
                            ),
                          ),
                        ),

                      const SliverToBoxAdapter(
                          child: SizedBox(height: 110)),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Ambient Bg
// ─────────────────────────────────────────────────────────────────────────────
class _AmbientBg extends StatelessWidget {
  final AnimationController anim;
  final bool isDark;
  const _AmbientBg({required this.anim, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: anim,
      builder: (_, __) {
        final t = anim.value;
        return Stack(
          children: [
            Positioned(
              top: -50 + t * 40,
              left: -50 + t * 25,
              child: Container(
                width: 260,
                height: 260,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      AppTheme.amber
                          .withValues(alpha: isDark ? 0.14 : 0.08),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 150 + t * 35,
              right: -60 + t * 30,
              child: Container(
                width: 230,
                height: 230,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      AppTheme.emerald
                          .withValues(alpha: isDark ? 0.13 : 0.07),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            Positioned(
              top: 350 + t * 20,
              left: 80,
              child: Container(
                width: 180,
                height: 180,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      AppTheme.violet
                          .withValues(alpha: isDark ? 0.10 : 0.05),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Header with Back Button
// ─────────────────────────────────────────────────────────────────────────────
class _Header extends StatelessWidget {
  final bool isDark;
  const _Header({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Back Button Row
        Row(
          children: [
            GestureDetector(
              onTap: () {
                HapticFeedback.lightImpact();
                Navigator.pop(context);
              },
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.08)
                      : Colors.white.withValues(alpha: 0.85),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.12)
                        : Colors.black.withValues(alpha: 0.06),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: isDark ? 0.15 : 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Icon(
                  Icons.arrow_back_ios_new_rounded,
                  color: isDark ? Colors.white : AppTheme.textPrimaryLight,
                  size: 18,
                ),
              ),
            ),
            const Spacer(),
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFFC107), Color(0xFFFF8F00)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.amber.withValues(alpha: 0.40),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  )
                ],
              ),
              child: const Icon(Icons.receipt_long_rounded,
                  color: Colors.white, size: 26),
            ),
          ],
        ),
        const SizedBox(height: 24),
        // Title Section
        ShaderMask(
          shaderCallback: (b) => const LinearGradient(
            colors: [AppTheme.amber, AppTheme.electricBlue],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ).createShader(b),
          child: Text(
            'Factures',
            style: AppTheme.display(Colors.white)
                .copyWith(fontSize: 36, height: 1.1, fontWeight: FontWeight.w900),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Payez vos services en quelques secondes',
          style: AppTheme.body(isDark
              ? Colors.white.withValues(alpha: 0.5)
              : AppTheme.textMutedLight).copyWith(fontSize: 15),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Biller Category Card - Improved Design
// ─────────────────────────────────────────────────────────────────────────────
class _BillerCard extends StatelessWidget {
  final _Biller biller;
  final bool isDark;
  final VoidCallback onTap;
  const _BillerCard(
      {required this.biller, required this.isDark, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.mediumImpact();
        onTap();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 10),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: biller.gradient
                .map((c) => c.withValues(alpha: isDark ? 0.20 : 0.12))
                .toList(),
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(
            color: biller.gradient.first.withValues(alpha: 0.3),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: biller.glow.withValues(alpha: 0.15),
              blurRadius: 16,
              spreadRadius: 0,
              offset: const Offset(0, 6),
            ),
            BoxShadow(
              color: biller.glow.withValues(alpha: 0.08),
              blurRadius: 28,
              spreadRadius: 0,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 54,
              height: 54,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: biller.gradient,
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: biller.glow.withValues(alpha: 0.5),
                    blurRadius: 14,
                    spreadRadius: 1,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Center(
                child: Text(biller.emoji,
                    style: const TextStyle(fontSize: 26)),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              biller.name,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w900,
                color: isDark 
                    ? Colors.white.withValues(alpha: 0.90) 
                    : AppTheme.textPrimaryLight,
                letterSpacing: 0.3,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              biller.subtitle,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: isDark 
                    ? Colors.white.withValues(alpha: 0.45) 
                    : AppTheme.textMutedLight,
                height: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Bill History Card - Enhanced Design
// ─────────────────────────────────────────────────────────────────────────────
class _BillHistoryCard extends StatelessWidget {
  final Map<String, dynamic> bill;
  final bool isDark;
  const _BillHistoryCard(
      {required this.bill, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final billerName =
        (bill['billerName'] ?? 'Facture').toString();
    final billType =
        (bill['billType'] ?? bill['type'] ?? 'OTHER').toString().toUpperCase();
    final amount = (bill['amount'] as num?)?.toDouble() ?? 0;
    final status =
        (bill['status'] ?? 'PENDING').toString().toUpperCase();
    final dueDate = bill['dueDate'] != null
        ? DateTime.tryParse(bill['dueDate'].toString()) ??
            DateTime.now()
        : DateTime.now();

    final biller = _billers.firstWhere(
      (b) => b.id == billType || b.name == billerName,
      orElse: () => _billers[0],
    );

    Color statusColor;
    String statusLabel;
    IconData statusIcon;
    switch (status) {
      case 'PAID':
        statusColor = AppTheme.emerald;
        statusLabel = 'Payée';
        statusIcon = Icons.check_circle_rounded;
        break;
      case 'PENDING':
        statusColor = AppTheme.amber;
        statusLabel = 'En attente';
        statusIcon = Icons.schedule_rounded;
        break;
      case 'OVERDUE':
        statusColor = AppTheme.coralRed;
        statusLabel = 'En retard';
        statusIcon = Icons.warning_amber_rounded;
        break;
      default:
        statusColor = AppTheme.textMutedLight;
        statusLabel = status;
        statusIcon = Icons.info_outline_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.06)
                  : Colors.white.withValues(alpha: 0.85),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.10)
                    : Colors.black.withValues(alpha: 0.06),
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.12 : 0.04),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: biller.gradient,
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: biller.glow.withValues(alpha: 0.35),
                        blurRadius: 12,
                        spreadRadius: 1,
                        offset: const Offset(0, 4),
                      )
                    ],
                  ),
                  child: Center(
                    child: Text(biller.emoji,
                        style: const TextStyle(fontSize: 26)),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        billerName,
                        style: AppTheme.body(isDark
                                ? AppTheme.textPrimaryDark
                                : AppTheme.textPrimaryLight)
                            .copyWith(
                                fontWeight: FontWeight.w900,
                                fontSize: 16,
                                letterSpacing: 0.2),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        biller.subtitle,
                        style: AppTheme.caption(isDark
                            ? Colors.white.withValues(alpha: 0.5)
                            : AppTheme.textMutedLight).copyWith(fontSize: 11),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Icon(Icons.calendar_today_rounded, 
                            size: 10, 
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.3)
                                : Colors.black.withValues(alpha: 0.35)),
                          const SizedBox(width: 4),
                          Text(
                            '${dueDate.day}/${dueDate.month}/${dueDate.year}',
                            style: AppTheme.caption(isDark
                                ? Colors.white.withValues(alpha: 0.35)
                                : Colors.black.withValues(alpha: 0.4))
                                .copyWith(fontSize: 10, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${amount.toStringAsFixed(3)} TND',
                      style: AppTheme.body(AppTheme.electricBlue)
                          .copyWith(
                              fontWeight: FontWeight.w900,
                              fontSize: 16,
                              letterSpacing: 0.3),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            statusColor.withValues(alpha: 0.15),
                            statusColor.withValues(alpha: 0.08),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: statusColor.withValues(alpha: 0.3),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(statusIcon,
                              size: 11, color: statusColor),
                          const SizedBox(width: 4),
                          Text(
                            statusLabel,
                            style: TextStyle(
                              color: statusColor,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Placeholder Bill Card - Enhanced Skeleton Design
// ─────────────────────────────────────────────────────────────────────────────
class _PlaceholderBillCard extends StatelessWidget {
  final _Biller biller;
  final bool isDark;
  const _PlaceholderBillCard(
      {required this.biller, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  isDark
                      ? Colors.white.withValues(alpha: 0.05)
                      : Colors.white.withValues(alpha: 0.80),
                  isDark
                      ? Colors.white.withValues(alpha: 0.03)
                      : Colors.white.withValues(alpha: 0.70),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.08)
                    : Colors.black.withValues(alpha: 0.05),
                width: 1.5,
              ),
            ),
            child: Row(
              children: [
                // Icon container with gradient
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: biller.gradient
                          .map((c) => c.withValues(alpha: 0.25))
                          .toList(),
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: biller.glow.withValues(alpha: 0.15),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      )
                    ],
                  ),
                  child: Center(
                    child: Text(
                      biller.emoji,
                      style: TextStyle(
                        fontSize: 24,
                        color: Colors.white.withValues(alpha: isDark ? 0.3 : 0.4),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Shimmer bar for title
                      Container(
                        height: 14,
                        width: double.infinity,
                        constraints: const BoxConstraints(maxWidth: 140),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              isDark
                                  ? Colors.white.withValues(alpha: 0.10)
                                  : Colors.black.withValues(alpha: 0.08),
                              isDark
                                  ? Colors.white.withValues(alpha: 0.05)
                                  : Colors.black.withValues(alpha: 0.04),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(7),
                        ),
                      ),
                      const SizedBox(height: 8),
                      // Subtitle
                      Text(
                        biller.subtitle,
                        style: AppTheme.caption(isDark
                            ? Colors.white.withValues(alpha: 0.25)
                            : Colors.black.withValues(alpha: 0.30))
                            .copyWith(fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 8),
                      // Date placeholder
                      Row(
                        children: [
                          Icon(
                            Icons.calendar_today_rounded,
                            size: 9,
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.15)
                                : Colors.black.withValues(alpha: 0.20),
                          ),
                          const SizedBox(width: 4),
                          Container(
                            height: 8,
                            width: 60,
                            decoration: BoxDecoration(
                              color: isDark
                                  ? Colors.white.withValues(alpha: 0.08)
                                  : Colors.black.withValues(alpha: 0.06),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    // Amount placeholder
                    Container(
                      height: 16,
                      width: 85,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            isDark
                                ? Colors.white.withValues(alpha: 0.10)
                                : Colors.black.withValues(alpha: 0.08),
                            isDark
                                ? Colors.white.withValues(alpha: 0.05)
                                : Colors.black.withValues(alpha: 0.04),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    const SizedBox(height: 10),
                    // Status badge placeholder
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.06)
                            : Colors.black.withValues(alpha: 0.04),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.08)
                              : Colors.black.withValues(alpha: 0.05),
                          width: 1,
                        ),
                      ),
                      child: Text(
                        'Aucune facture',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.20)
                              : Colors.black.withValues(alpha: 0.25),
                          letterSpacing: 0.2,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    )
        .animate(onPlay: (c) => c.repeat(reverse: true))
        .shimmer(
          duration: 2000.ms,
          color: isDark
              ? Colors.white.withValues(alpha: 0.08)
              : Colors.white.withValues(alpha: 0.20),
          angle: 0,
        );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Pay Dialog (Bottom Sheet)
// ─────────────────────────────────────────────────────────────────────────────
class _PayDialog extends StatefulWidget {
  final _Biller biller;
  final bool isDark;
  const _PayDialog({required this.biller, required this.isDark});

  @override
  State<_PayDialog> createState() => _PayDialogState();
}

class _PayDialogState extends State<_PayDialog> {
  final _refController = TextEditingController();
  final _amountController = TextEditingController();
  bool _paying = false;
  bool _success = false;

  @override
  void dispose() {
    _refController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _pay() async {
    final ref = _refController.text.trim();
    final amount =
        double.tryParse(_amountController.text.trim()) ?? 0;
    if (ref.isEmpty) {
      _showSnack('Veuillez entrer une référence.');
      return;
    }
    if (amount <= 0) {
      _showSnack('Montant invalide.');
      return;
    }
    
    setState(() => _paying = true);
    
    // Call backend API
    final res = await AuthApiService.payBill(
      widget.biller.id,
      ref,
      amount,
      widget.biller.name,
    );
    
    if (mounted) {
      setState(() => _paying = false);
      
      if (res.isSuccess) {
        setState(() => _success = true);
      } else {
        _showSnack(res.error ?? 'Erreur de paiement');
      }
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: const TextStyle(color: Colors.white)),
        backgroundColor: AppTheme.coralRed,
        behavior: SnackBarBehavior.floating,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final biller = widget.biller;
    final dk = widget.isDark;

    return Padding(
      padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        margin:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(32),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Container(
              padding: const EdgeInsets.fromLTRB(24, 28, 24, 36),
              decoration: BoxDecoration(
                color: dk
                    ? const Color(0xFF0E1827).withValues(alpha: 0.92)
                    : Colors.white.withValues(alpha: 0.95),
                borderRadius: BorderRadius.circular(32),
                border: Border.all(
                  color: dk
                      ? Colors.white.withValues(alpha: 0.10)
                      : Colors.black.withValues(alpha: 0.07),
                ),
              ),
              child: _success
                  ? _SuccessContent(biller: biller)
                  : _FormContent(
                      biller: biller,
                      dk: dk,
                      refController: _refController,
                      amountController: _amountController,
                      paying: _paying,
                      onPay: _pay,
                      onCancel: () => Navigator.pop(context),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}

class _FormContent extends StatelessWidget {
  final _Biller biller;
  final bool dk;
  final TextEditingController refController;
  final TextEditingController amountController;
  final bool paying;
  final VoidCallback onPay;
  final VoidCallback onCancel;

  const _FormContent({
    required this.biller,
    required this.dk,
    required this.refController,
    required this.amountController,
    required this.paying,
    required this.onPay,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Biller header
        Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: biller.gradient,
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: biller.glow.withValues(alpha: 0.35),
                    blurRadius: 14,
                    offset: const Offset(0, 5),
                  )
                ],
              ),
              child: Center(
                child: Text(biller.emoji,
                    style: const TextStyle(fontSize: 26)),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    biller.name,
                    style: AppTheme.title(dk
                        ? AppTheme.textPrimaryDark
                        : AppTheme.textPrimaryLight),
                  ),
                  Text(
                    biller.subtitle,
                    style: AppTheme.caption(dk
                        ? Colors.white38
                        : AppTheme.textMutedLight),
                  ),
                ],
              ),
            ),
            GestureDetector(
              onTap: onCancel,
              child: Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: dk
                      ? Colors.white.withValues(alpha: 0.08)
                      : Colors.black.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.close_rounded,
                    size: 18,
                    color: dk ? Colors.white54 : Colors.black45),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Reference field
        Text(
          'Référence / N° de contrat',
          style: AppTheme.caption(
              dk ? Colors.white54 : AppTheme.textMutedLight),
        ),
        const SizedBox(height: 8),
        _DialogInput(
          controller: refController,
          dk: dk,
          hint: 'Ex: TN-2024-000123',
          icon: Icons.tag_rounded,
        ),
        const SizedBox(height: 16),

        // Amount field
        Text(
          'Montant à payer (TND)',
          style: AppTheme.caption(
              dk ? Colors.white54 : AppTheme.textMutedLight),
        ),
        const SizedBox(height: 8),
        _DialogInput(
          controller: amountController,
          dk: dk,
          hint: '0.000',
          icon: Icons.payments_rounded,
          keyboardType: const TextInputType.numberWithOptions(
              decimal: true),
        ),
        const SizedBox(height: 28),

        // Pay button
        SizedBox(
          width: double.infinity,
          height: 54,
          child: ElevatedButton(
            onPressed: paying ? null : onPay,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              shadowColor: Colors.transparent,
              padding: EdgeInsets.zero,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18)),
            ),
            child: Ink(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: biller.gradient,
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: biller.glow.withValues(alpha: 0.35),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Center(
                child: paying
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2.5),
                      )
                    : Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.payment_rounded,
                              color: Colors.white, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Payer maintenant',
                            style: AppTheme.title(Colors.white)
                                .copyWith(fontSize: 15),
                          ),
                        ],
                      ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _DialogInput extends StatelessWidget {
  final TextEditingController controller;
  final bool dk;
  final String hint;
  final IconData icon;
  final TextInputType? keyboardType;

  const _DialogInput({
    required this.controller,
    required this.dk,
    required this.hint,
    required this.icon,
    this.keyboardType,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
        child: Container(
          decoration: BoxDecoration(
            color: dk
                ? Colors.white.withValues(alpha: 0.07)
                : Colors.black.withValues(alpha: 0.04),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: dk
                  ? Colors.white.withValues(alpha: 0.10)
                  : Colors.black.withValues(alpha: 0.06),
            ),
          ),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            style: AppTheme.body(dk
                    ? AppTheme.textPrimaryDark
                    : AppTheme.textPrimaryLight)
                .copyWith(fontWeight: FontWeight.w600),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: AppTheme.body(
                  dk ? Colors.white24 : Colors.black26),
              prefixIcon: Icon(icon,
                  color: AppTheme.electricBlue.withValues(alpha: 0.7),
                  size: 20),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 14),
            ),
          ),
        ),
      ),
    );
  }
}

class _SuccessContent extends StatelessWidget {
  final _Biller biller;
  const _SuccessContent({required this.biller});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 90,
          height: 90,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: AppTheme.successGradient,
            boxShadow: [
              BoxShadow(
                color: AppTheme.emerald.withValues(alpha: 0.45),
                blurRadius: 28,
                spreadRadius: 4,
              )
            ],
          ),
          child: const Icon(Icons.check_rounded,
              color: Colors.white, size: 50),
        )
            .animate()
            .scale(
                begin: const Offset(0, 0),
                duration: 600.ms,
                curve: Curves.elasticOut)
            .fadeIn(),
        const SizedBox(height: 22),
        Text(
          'Paiement Réussi!',
          style: AppTheme.title(Colors.white)
              .copyWith(fontSize: 22, fontWeight: FontWeight.w900),
        )
            .animate()
            .fadeIn(delay: 350.ms)
            .slideY(begin: 0.2),
        const SizedBox(height: 8),
        Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            gradient:
                LinearGradient(colors: biller.gradient),
            borderRadius: BorderRadius.circular(50),
            boxShadow: [
              BoxShadow(
                color: biller.glow.withValues(alpha: 0.3),
                blurRadius: 12,
                offset: const Offset(0, 4),
              )
            ],
          ),
          child: Text(
            '${biller.emoji}  ${biller.name}',
            style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w700,
                fontSize: 13),
          ),
        )
            .animate()
            .fadeIn(delay: 450.ms)
            .scale(begin: const Offset(0.8, 0.8)),
        const SizedBox(height: 6),
        Text(
          'Votre facture a été réglée avec succès.',
          textAlign: TextAlign.center,
          style: AppTheme.body(Colors.white54),
        ).animate().fadeIn(delay: 500.ms),
        const SizedBox(height: 28),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.electricBlue,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18)),
              elevation: 0,
            ),
            child: Text(
              'Parfait!',
              style: AppTheme.title(Colors.white)
                  .copyWith(fontSize: 15),
            ),
          ),
        ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.3),
      ],
    );
  }
}
