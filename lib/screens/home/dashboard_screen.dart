import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:ui';
import 'dart:math' as math;

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../viewmodels/dashboard_viewmodel.dart';
import '../../models/banking_models.dart';
import '../transfer/transfer_screen.dart';
import '../analytics/analytics_screen.dart';
import '../qr/qr_screen.dart';
import '../bills/bills_screen.dart';
import '../recharge/recharge_screen.dart';
import '../transactions/transactions_screen.dart';
import 'notifications_screen.dart';
import '../tickets/tickets_list_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardViewModel>().load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final p = context.watch<AppProvider>();
    final vm = context.watch<DashboardViewModel>();
    final dk = p.themeMode == ThemeMode.dark;
    final fg = dk ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight;
    final mt = dk ? AppTheme.textMutedDark : AppTheme.textMutedLight;
    final cd = Theme.of(context).cardColor;
    final bd = dk ? AppTheme.borderDark : AppTheme.borderLight;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: RefreshIndicator(
        onRefresh: vm.refresh,
        color: AppTheme.electricBlue,
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
          slivers: [
            if (vm.error != null)
              SliverToBoxAdapter(child: _ErrorBanner(
                error: vm.error!,
                onRetry: vm.error == 'Session expirée. Veuillez vous reconnecter.'
                    ? () {
                        final app = context.read<AppProvider>();
                        app.handleSessionExpired(context);
                      }
                    : vm.load,
                dk: dk, fg: fg, mt: mt,
                isSessionExpired: vm.error == 'Session expirée. Veuillez vous reconnecter.',
              )),
            if (vm.error == null) ...[
              // ── HEADER ─────────────────────────────────────────────────────
              SliverToBoxAdapter(child: _Header(dk: dk, fg: fg, mt: mt, cd: cd, bd: bd, p: p, vm: vm)),
              // ── BALANCE HERO ───────────────────────────────────────────────
              SliverToBoxAdapter(child: _BalanceHero(vm: vm, dk: dk)),
              // ── QUICK ACTIONS ──────────────────────────────────────────────
              SliverToBoxAdapter(child: _SectionHeader(title: 'Actions Rapides', fg: fg)),
              SliverToBoxAdapter(child: _QuickActions(dk: dk, fg: fg, cd: cd, bd: bd, mt: mt)),
              // ── EXPENSE ANALYTICS ──────────────────────────────────────────
              SliverToBoxAdapter(child: _SectionHeader(title: 'Analyse des Depenses', fg: fg, action: 'Voir tout', onAction: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AnalyticsScreen())))),
              SliverToBoxAdapter(child: _ExpenseAnalyticsCard(vm: vm, dk: dk, fg: fg, mt: mt, cd: cd, bd: bd)),
              // ── ACTIVITY TIMELINE ──────────────────────────────────────────
              SliverToBoxAdapter(child: _SectionHeader(
                title: "Historique d'activité", fg: fg, action: 'Voir tout',
                onAction: () => Navigator.push(context, MaterialPageRoute(
                  builder: (_) => const TransactionsScreen())), // We can keep linking to Transactions for full history for now
              )),
              if (vm.activityTimeline.isEmpty)
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 20),
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(color: cd, borderRadius: BorderRadius.circular(16), border: Border.all(color: bd)),
                    child: Center(child: Text("Aucune activité récente", style: AppTheme.body(mt))),
                  ),
                ),
              SliverList(delegate: SliverChildBuilderDelegate(
                (ctx, i) => _ActivityTile(activity: vm.activityTimeline[i], dk: dk, fg: fg, mt: mt, cd: cd, bd: bd),
                childCount: vm.activityTimeline.length,
              )),
            ],
            const SliverToBoxAdapter(child: SizedBox(height: 120)),
          ],
        ),
      ),
    );
  }
}

// ── HEADER ────────────────────────────────────────────────────────────────────
class _ErrorBanner extends StatelessWidget {
  final String error; final VoidCallback onRetry; final bool dk; final Color fg, mt; final bool isSessionExpired;
  const _ErrorBanner({required this.error, required this.onRetry, required this.dk, required this.fg, required this.mt, this.isSessionExpired = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFFEF4444).withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.25)),
      ),
      child: Row(
        children: [
          Icon(isSessionExpired ? Icons.lock_rounded : Icons.wifi_off_rounded, color: const Color(0xFFEF4444), size: 22),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              isSessionExpired ? 'Session expirée. Veuillez vous reconnecter.' : (error.length > 80 ? '${error.substring(0, 80)}...' : error),
              style: TextStyle(color: const Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ),
          GestureDetector(
            onTap: () {
              HapticFeedback.mediumImpact();
              onRetry();
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(isSessionExpired ? 'Se connecter' : 'Réessayer', style: const TextStyle(color: Color(0xFFEF4444), fontSize: 11, fontWeight: FontWeight.w800)),
            ),
          ),
        ],
      ),
    );
  }
}

// ── HEADER ────────────────────────────────────────────────────────────────────
class _Header extends StatelessWidget {
  final bool dk; final Color fg, mt, cd, bd;
  final AppProvider p; final DashboardViewModel vm;
  const _Header({required this.dk, required this.fg, required this.mt, required this.cd, required this.bd, required this.p, required this.vm});

  void _takeScreenshot(BuildContext context) async {
    HapticFeedback.mediumImpact();
    // Find the RepaintBoundary key from ancestor
    final boundary = context.findRenderObject();
    if (boundary == null) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(children: [
          const Icon(Icons.screenshot_monitor_rounded, color: Colors.white, size: 18),
          const SizedBox(width: 10),
          const Text('Capture sécurisée enregistrée', style: TextStyle(fontWeight: FontWeight.w700)),
        ]),
        backgroundColor: AppTheme.electricBlue,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        duration: const Duration(milliseconds: 2000),
      ),
    );
  }

  String _getGreeting(AppProvider p) {
    final hour = DateTime.now().hour;
    final key = hour < 18 ? 'good_morning' : 'good_evening';
    return p.translate(key).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: Column(
        children: [
          // ── STB Logo Banner ──────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(
                  'public/Logo_STB.png',
                  height: 28,
                  fit: BoxFit.contain,
                ).animate().fadeIn(duration: 500.ms),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // ── Main Header Row ───────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () {
                    HapticFeedback.lightImpact();
                    context.findRootAncestorStateOfType<ScaffoldState>()?.openDrawer();
                  },
                  child: _CircleIcon(icon: Icons.menu_rounded, fg: fg, cd: cd, bd: bd, dk: dk),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_getGreeting(p), style: AppTheme.label(mt)),
                      Text(
                        '${p.userProfile?['prenom'] ?? ''} ${p.userProfile?['nom'] ?? 'Collaborateur'}',
                        style: AppTheme.headline(fg),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                // Screenshot / Security capture icon
                GestureDetector(
                  onTap: () => _takeScreenshot(context),
                  child: _CircleIcon(icon: Icons.screenshot_monitor_rounded, fg: fg, cd: cd, bd: bd, dk: dk),
                ),
                const SizedBox(width: 10),
                // Notification icon
                GestureDetector(
                  onTap: () {
                    HapticFeedback.lightImpact();
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()));
                  },
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      _CircleIcon(icon: Icons.notifications_outlined, fg: fg, cd: cd, bd: bd, dk: dk),
                      Positioned(
                        right: 10, top: 10,
                        child: Container(
                          width: 9, height: 9,
                          decoration: BoxDecoration(
                            color: AppTheme.coralRed,
                            shape: BoxShape.circle,
                            border: Border.all(color: cd, width: 1.5),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.15),
          ),
        ],
      ),
    );
  }
}

class _CircleIcon extends StatelessWidget {
  final IconData icon; final Color fg, cd, bd; final bool dk;
  const _CircleIcon({required this.icon, required this.fg, required this.cd, required this.bd, required this.dk});
  @override
  Widget build(BuildContext context) => Container(
    width: 46, height: 46,
    decoration: BoxDecoration(
      color: cd, shape: BoxShape.circle, border: Border.all(color: bd),
      boxShadow: AppTheme.cardShadow(dk),
    ),
    child: Icon(icon, color: fg, size: 22),
  );
}

// ── BALANCE HERO ──────────────────────────────────────────────────────────────
class _BalanceHero extends StatefulWidget {
  final DashboardViewModel vm; final bool dk;
  const _BalanceHero({required this.vm, required this.dk});

  @override
  State<_BalanceHero> createState() => _BalanceHeroState();
}

class _BalanceHeroState extends State<_BalanceHero> {
  bool _hidden = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(32),
          boxShadow: [
            BoxShadow(color: AppTheme.royalBlue.withValues(alpha: 0.3), blurRadius: 30, offset: const Offset(0, 15)),
            if (widget.dk) BoxShadow(color: Colors.black.withValues(alpha: 0.4), blurRadius: 15, offset: const Offset(0, 6)),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(32),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F172A), Color(0xFF1E3A8A), Color(0xFF1E40AF)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                border: Border.all(color: Colors.white.withValues(alpha: 0.15), width: 1.5),
              ),
              child: Stack(
                children: [
                  // Animated fluid glow mesh in background
                  Positioned(
                    right: -50,
                    top: -50,
                    child: Container(
                      width: 180,
                      height: 180,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [AppTheme.turquoise.withValues(alpha: 0.25), Colors.transparent],
                        ),
                      ),
                    ).animate(onPlay: (c) => c.repeat(reverse: true))
                     .scale(begin: const Offset(0.8, 0.8), end: const Offset(1.2, 1.2), duration: 4.seconds),
                  ),
                  Positioned(
                    left: -40,
                    bottom: -60,
                    child: Container(
                      width: 160,
                      height: 160,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [AppTheme.violet.withValues(alpha: 0.2), Colors.transparent],
                        ),
                      ),
                    ).animate(onPlay: (c) => c.repeat(reverse: true))
                     .scale(begin: const Offset(1, 1), end: const Offset(1.3, 1.3), duration: 5.seconds),
                  ),
                  
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'SOLDE TOTAL',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.6),
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 2.0,
                            ),
                          ),
                          const Spacer(),
                          GestureDetector(
                            onTap: () {
                              HapticFeedback.lightImpact();
                              setState(() => _hidden = !_hidden);
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    _hidden ? Icons.visibility_off_outlined : Icons.remove_red_eye_outlined,
                                    color: Colors.white.withValues(alpha: 0.8),
                                    size: 13,
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    _hidden ? 'Afficher' : 'Masquer',
                                    style: TextStyle(
                                      color: Colors.white.withValues(alpha: 0.8),
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      widget.vm.isLoading
                          ? _Shimmer(width: 200, height: 42, radius: 12)
                          : _hidden
                              ? const Text("••••••••", style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900, letterSpacing: 4))
                              : Row(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Flexible(
                                      child: Builder(
                                        builder: (context) {
                                          final profile = context.watch<AppProvider>().userProfile;
                                          final fallbackBalance = (profile?['compteSolde'] as num?)?.toDouble() ?? 0.0;
                                          final displayBalance = widget.vm.totalBalance > 0 ? widget.vm.totalBalance : fallbackBalance;
                                          final formatted = '${displayBalance.toStringAsFixed(3)} TND';
                                          return Text(
                                            formatted.split(' ')[0],
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 38,
                                              fontWeight: FontWeight.w900,
                                              letterSpacing: -1.0,
                                              height: 1,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          );
                                        }
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    Padding(
                                      padding: const EdgeInsets.only(bottom: 4),
                                      child: Text(
                                        'TND',
                                        style: const TextStyle(
                                          color: AppTheme.turquoise,
                                          fontSize: 18,
                                          fontWeight: FontWeight.w900,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                      const SizedBox(height: 6),
                      if (!_hidden)
                        Row(
                          children: [
                            Text(
                              widget.vm.isLoading 
                                  ? '' 
                                  : widget.vm.primaryAccount != null 
                                      ? 'Compte Courant · **** ${widget.vm.primaryAccount!.iban.length >= 4 ? widget.vm.primaryAccount!.iban.substring(widget.vm.primaryAccount!.iban.length - 4) : widget.vm.primaryAccount!.iban}'
                                      : 'Aucun compte',
                              style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.5),
                            ),
                            const Spacer(),
                            Icon(Icons.nfc_rounded, color: Colors.white.withValues(alpha: 0.4), size: 16),
                          ],
                        ),
                      const SizedBox(height: 28),
                      Row(
                        children: [
                          _BalancePill(label: 'Entrant', amount: widget.vm.monthlyIncome, color: AppTheme.emerald, icon: Icons.arrow_downward_rounded),
                          const SizedBox(width: 14),
                          _BalancePill(label: 'Sortant', amount: widget.vm.monthlyExpenses, color: AppTheme.coralRed, icon: Icons.arrow_upward_rounded),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ).animate().fadeIn(delay: 100.ms, duration: 600.ms).scale(begin: const Offset(0.98, 0.98), curve: Curves.easeOutBack),
    );
  }
}

class _GlassOrb extends StatelessWidget {
  final double size, opacity;
  const _GlassOrb({required this.size, required this.opacity});
  @override
  Widget build(BuildContext context) => Container(
    width: size, height: size,
    decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withValues(alpha: opacity)),
  );
}

class _BalancePill extends StatelessWidget {
  final String label; final double amount; final Color color; final IconData icon;
  const _BalancePill({required this.label, required this.amount, required this.color, required this.icon});
  @override
  Widget build(BuildContext context) => Expanded(
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Row(children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(color: color.withValues(alpha: 0.15), shape: BoxShape.circle),
          child: Icon(icon, color: color, size: 14),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Colors.white60, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.5)),
              const SizedBox(height: 2),
              Text(
                '${amount.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}.000 TND',
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ]),
    ),
  );
}

// ── SECTION HEADER ────────────────────────────────────────────────────────────
class _SectionHeader extends StatelessWidget {
  final String title; final Color fg; final String? action; final VoidCallback? onAction;
  const _SectionHeader({required this.title, required this.fg, this.action, this.onAction});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(20, 28, 20, 12),
    child: Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: AppTheme.title(fg)),
        if (action != null)
          GestureDetector(
            onTap: () { HapticFeedback.lightImpact(); onAction?.call(); },
            child: Text(action!, style: AppTheme.body(AppTheme.electricBlue).copyWith(fontWeight: FontWeight.w700)),
          ),
      ],
    ),
  );
}

// ── QUICK ACTIONS ─────────────────────────────────────────────────────────────
class _QuickActions extends StatelessWidget {
  final bool dk; final Color fg, cd, bd, mt;
  const _QuickActions({required this.dk, required this.fg, required this.cd, required this.bd, required this.mt});

  static const _actions = [
    {'icon': Icons.swap_horiz_rounded, 'label': 'Virement', 'color': AppTheme.royalBlue},
    {'icon': Icons.qr_code_scanner_rounded, 'label': 'Scan QR', 'color': AppTheme.turquoise},
    {'icon': Icons.phone_iphone_rounded, 'label': 'Recharge', 'color': AppTheme.emerald},
    {'icon': Icons.receipt_long_rounded, 'label': 'Factures', 'color': AppTheme.coralRed},
    {'icon': Icons.headset_mic_rounded, 'label': 'Support', 'color': AppTheme.amber},
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 104,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
        physics: const BouncingScrollPhysics(),
        itemCount: _actions.length,
        separatorBuilder: (_, __) => const SizedBox(width: 16),
        itemBuilder: (context, i) {
          final a = _actions[i];
          final color = a['color'] as Color;
          return GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              if (a['label'] == 'Virement') {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const TransferScreen()));
              } else if (a['label'] == 'Scan QR') {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const QRScreen()));
              } else if (a['label'] == 'Support') {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const TicketsListScreen()));
              } else if (a['label'] == 'Recharge') {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const RechargeScreen()));
              } else if (a['label'] == 'Factures') {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const BillsScreen()));
              }
            },
            child: Column(
              children: [
                Container(
                  width: 60, height: 60,
                  decoration: BoxDecoration(
                    color: dk ? color.withValues(alpha: 0.12) : color.withValues(alpha: 0.08),
                    shape: BoxShape.circle,
                    border: Border.all(color: color.withValues(alpha: dk ? 0.35 : 0.25), width: 1.5),
                    boxShadow: [
                      BoxShadow(
                        color: color.withValues(alpha: dk ? 0.25 : 0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(30),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                      child: Icon(a['icon'] as IconData, color: color, size: 24),
                    ),
                  ),
                ).animate().scale(delay: (50 * i).ms, duration: 400.ms, curve: Curves.easeOutBack),
                const SizedBox(height: 8),
                Text(
                  _t(context, a['label'] as String),
                  style: TextStyle(
                    color: dk ? Colors.white70 : const Color(0xFF0F172A),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  String _t(BuildContext context, String key) {
    final prov = Provider.of<AppProvider>(context, listen: false);
    switch (key) {
      case 'Virement': return prov.translate('transfer');
      case 'Analyses': return prov.translate('analytics');
      case 'Scan QR': return prov.translate('pay_qr');
      case 'Recharge': return prov.translate('recharge');
      case 'Factures': return prov.translate('pay_bills');
      case 'Support': return 'Support';
      default: return key;
    }
  }
}

// ── EXPENSE ANALYTICS CARD (WOW GLASSMORPHISM) ────────────────────────────────
class _ExpenseAnalyticsCard extends StatefulWidget {
  final DashboardViewModel vm;
  final bool dk;
  final Color fg, mt, cd, bd;
  const _ExpenseAnalyticsCard({required this.vm, required this.dk, required this.fg, required this.mt, required this.cd, required this.bd});

  @override
  State<_ExpenseAnalyticsCard> createState() => _ExpenseAnalyticsCardState();
}

class _ExpenseAnalyticsCardState extends State<_ExpenseAnalyticsCard> with SingleTickerProviderStateMixin {
  int _tab = 0; // 0 = Bar chart, 1 = Donut
  int? _touchedIndex;

  static const _catColors = [
    Color(0xFF2962FF),
    Color(0xFF7C3AED),
    Color(0xFF00BFA5),
    Color(0xFF10B981),
    Color(0xFFF59E0B),
  ];

  List<String> get _dynamicMonthLabels {
    final months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
    final now = DateTime.now();
    List<String> labels = [];
    for (int i = 5; i >= 0; i--) {
      int m = now.month - i;
      if (m <= 0) m += 12;
      labels.add(months[m - 1]);
    }
    return labels;
  }


  @override
  Widget build(BuildContext context) {
    if (widget.vm.isLoading) {
      return _Shimmer(width: double.infinity, height: 380, radius: 28, margin: const EdgeInsets.symmetric(horizontal: 20));
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: (widget.dk ? AppTheme.royalBlue : AppTheme.electricBlue).withValues(alpha: 0.15),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: widget.dk
                    ? [const Color(0xFF0F172A).withValues(alpha: 0.9), const Color(0xFF1E293B).withValues(alpha: 0.85)]
                    : [Colors.white.withValues(alpha: 0.95), Colors.white.withValues(alpha: 0.9)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              border: Border.all(
                color: widget.dk ? Colors.white.withValues(alpha: 0.08) : AppTheme.electricBlue.withValues(alpha: 0.12),
                width: 1.5,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Premium Tab Toggle with Icon ─────────────────────────
                Container(
                  height: 46,
                  padding: const EdgeInsets.all(5),
                  decoration: BoxDecoration(
                    color: widget.dk ? Colors.white.withValues(alpha: 0.06) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: widget.dk ? Colors.white.withValues(alpha: 0.03) : Colors.black.withValues(alpha: 0.03),
                    ),
                  ),
                  child: Stack(
                    children: [
                      AnimatedAlign(
                        alignment: _tab == 0 ? Alignment.centerLeft : Alignment.centerRight,
                        duration: const Duration(milliseconds: 350),
                        curve: Curves.easeOutCubic,
                        child: FractionallySizedBox(
                          widthFactor: 0.5,
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: AppTheme.primaryGradient,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.electricBlue.withValues(alpha: 0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Row(
                        children: [
                          _tabBtn('Mensuel', 0, Icons.bar_chart_rounded),
                          _tabBtn('Categories', 1, Icons.donut_large_rounded),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),

                // ── Stats Summary Row (NEW) ──────────────────────────────
                if (_tab == 0) ...[
                  Row(
                    children: [
                      _StatPill(
                        label: 'Plus haut',
                        value: '${widget.vm.monthlyHistory.isNotEmpty ? widget.vm.monthlyHistory.reduce(math.max).toInt() : 0} TND',
                        icon: Icons.trending_up_rounded,
                        color: AppTheme.emerald,
                        dk: widget.dk,
                      ),
                      const SizedBox(width: 12),
                      _StatPill(
                        label: 'Moyenne',
                        value: '${widget.vm.monthlyHistory.isNotEmpty ? (widget.vm.monthlyHistory.reduce((a, b) => a + b) / widget.vm.monthlyHistory.length).toInt() : 0} TND',
                        icon: Icons.show_chart_rounded,
                        color: AppTheme.electricBlue,
                        dk: widget.dk,
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                ],

          // ── Chart area ──────────────────────────────────────────────────
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 700),
            switchInCurve: Curves.easeOutExpo,
            switchOutCurve: Curves.easeInExpo,
            transitionBuilder: (child, anim) {
              final isBar = child.key == const ValueKey('bar');
              final slideAnim = Tween<Offset>(
                begin: Offset(isBar ? -0.08 : 0.08, 0),
                end: Offset.zero,
              ).animate(CurvedAnimation(parent: anim, curve: Curves.easeOutCubic));
              return FadeTransition(
                opacity: anim,
                child: SlideTransition(position: slideAnim, child: child),
              );
            },
            layoutBuilder: (currentChild, previousChildren) {
              return Stack(
                alignment: Alignment.center,
                children: <Widget>[
                  ...previousChildren,
                  if (currentChild != null) currentChild,
                ],
              );
            },
            child: _tab == 0 ? _buildBarChart() : _buildDonutChart(),
          ),

          // ── Legend ──────────────────────────────────────────────────────
          if (_tab == 1) ...[
            const SizedBox(height: 20),
            Wrap(
              spacing: 14,
              runSpacing: 10,
              children: widget.vm.spending.asMap().entries.map((e) {
                final color = _catColors[e.key % _catColors.length];
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: color.withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 7),
                      Text(e.value.label, style: TextStyle(color: widget.fg, fontSize: 11, fontWeight: FontWeight.w700)),
                      const SizedBox(width: 5),
                      Text('${(e.value.percentage * 100).toInt()}%', style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w900)),
                    ],
                  ),
                ).animate(delay: (e.key * 50).ms).fadeIn().scale(begin: const Offset(0.8, 0.8));
              }).toList(),
            ),
          ],
        ],
      ),
    ),
  ),
),
    ).animate().fadeIn(delay: 200.ms).scale(begin: const Offset(0.97, 0.97), curve: Curves.easeOutBack);
  }

  Widget _tabBtn(String label, int idx, IconData icon) {
    final active = _tab == idx;
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          if (_tab == idx) return;
          HapticFeedback.mediumImpact();
          setState(() => _tab = idx);
        },
        child: Container(
          alignment: Alignment.center,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                color: active ? Colors.white : widget.mt.withValues(alpha: 0.6),
                size: 16,
              ),
              const SizedBox(width: 6),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 250),
                style: TextStyle(
                  color: active ? Colors.white : widget.mt.withValues(alpha: 0.6),
                  fontSize: 12,
                  fontFamily: 'Inter',
                  fontWeight: active ? FontWeight.w900 : FontWeight.w600,
                ),
                child: Text(label),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBarChart() {
    final maxHistoryValue = widget.vm.monthlyHistory.isEmpty ? 1000.0 : widget.vm.monthlyHistory.reduce(math.max);
    final chartMaxY = maxHistoryValue < 1000 ? 1000.0 : maxHistoryValue * 1.15;

    return SizedBox(
      key: const ValueKey('bar'),
      height: 200,
      child: BarChart(
        BarChartData(
          alignment: BarChartAlignment.spaceAround,
          maxY: chartMaxY,
          barTouchData: BarTouchData(
            enabled: true,
            touchTooltipData: BarTouchTooltipData(
              getTooltipColor: (_) => AppTheme.electricBlue,
              tooltipBorderRadius: BorderRadius.circular(12),
              tooltipPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              getTooltipItem: (group, groupIndex, rod, rodIndex) => BarTooltipItem(
                '${_dynamicMonthLabels[groupIndex]}\n${rod.toY.toInt()} TND',
                const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800, height: 1.4),
              ),
            ),
          ),
          titlesData: FlTitlesData(
            show: true,
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (val, meta) => Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(
                    _dynamicMonthLabels[val.toInt() % _dynamicMonthLabels.length],
                    style: TextStyle(color: widget.mt, fontSize: 11, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ),
            leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          ),
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: chartMaxY / 4,
            getDrawingHorizontalLine: (_) => FlLine(
              color: widget.dk ? Colors.white.withValues(alpha: 0.05) : Colors.black.withValues(alpha: 0.04),
              strokeWidth: 1,
              dashArray: [4, 4],
            ),
          ),
          borderData: FlBorderData(show: false),
          barGroups: widget.vm.monthlyHistory.asMap().entries.map((e) {
            final isHighest = e.value == widget.vm.monthlyHistory.reduce(math.max);
            return BarChartGroupData(
              x: e.key,
              barRods: [
                BarChartRodData(
                  toY: e.value,
                  width: 28,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
                  gradient: LinearGradient(
                    colors: isHighest
                        ? [AppTheme.turquoise, AppTheme.electricBlue]
                        : [
                            AppTheme.electricBlue.withValues(alpha: 0.6),
                            AppTheme.royalBlue.withValues(alpha: 0.4),
                          ],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                  backDrawRodData: BackgroundBarChartRodData(
                    show: true,
                    toY: chartMaxY,
                    color: widget.dk ? Colors.white.withValues(alpha: 0.03) : const Color(0xFFF8FAFC),
                  ),
                ),
              ],
            );
          }).toList(),
        ),
        duration: const Duration(milliseconds: 1400),
        curve: Curves.elasticOut,
      ),
    );
  }

  Widget _buildDonutChart() {
    final sections = widget.vm.spending.asMap().entries.map((e) {
      final color = _catColors[e.key % _catColors.length];
      final isTouched = _touchedIndex == e.key;
      final isAnyTouched = _touchedIndex != null;
      final opacity = isAnyTouched && !isTouched ? 0.35 : 1.0;

      return PieChartSectionData(
        value: e.value.percentage * 100,
        color: color.withValues(alpha: opacity),
        radius: isTouched ? 72 : 58,
        title: isTouched ? '${(e.value.percentage * 100).toInt()}%' : '',
        titleStyle: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w900, shadows: [
          Shadow(color: Colors.black26, blurRadius: 4),
        ]),
        badgeWidget: isTouched
            ? Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [color, color.withValues(alpha: 0.8)]),
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(color: color.withValues(alpha: 0.4), blurRadius: 8, offset: const Offset(0, 2)),
                  ],
                ),
                child: Text(e.value.label, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900)),
              )
            : null,
        badgePositionPercentageOffset: 1.4,
      );
    }).toList();

    final total = widget.vm.spending.fold(0.0, (s, c) => s + c.amount);

    return SizedBox(
      key: const ValueKey('donut'),
      height: 220,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Animated glow behind donut
          Container(
            width: 130,
            height: 130,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppTheme.electricBlue.withValues(alpha: 0.15),
                  Colors.transparent,
                ],
              ),
            ),
          ).animate(onPlay: (c) => c.repeat(reverse: true)).scale(
            begin: const Offset(0.9, 0.9),
            end: const Offset(1.1, 1.1),
            duration: 2.5.seconds,
          ),
          PieChart(
            PieChartData(
              sections: sections,
              sectionsSpace: 4,
              centerSpaceRadius: 62,
              pieTouchData: PieTouchData(
                touchCallback: (event, response) {
                  setState(() {
                    if (!event.isInterestedForInteractions || response?.touchedSection == null) {
                      _touchedIndex = null;
                      return;
                    }
                    HapticFeedback.selectionClick();
                    _touchedIndex = response!.touchedSection!.touchedSectionIndex;
                  });
                },
              ),
            ),
            duration: const Duration(milliseconds: 1200),
            curve: Curves.easeOutBack,
          ),
          TweenAnimationBuilder<double>(
            tween: Tween(begin: 0.0, end: 1.0),
            duration: const Duration(milliseconds: 900),
            curve: Curves.easeOutBack,
            builder: (context, val, child) => Transform.scale(
              scale: val,
              child: Opacity(
                opacity: val.clamp(0.0, 1.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      '${total.toInt()}',
                      style: TextStyle(
                        color: widget.fg,
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.8,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'TND',
                      style: TextStyle(
                        color: AppTheme.electricBlue,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Total depenses',
                      style: TextStyle(
                        color: widget.mt,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── ACTIVITY TILE (PREMIUM ENHANCED) ──────────────────────────────────────────
class _ActivityTile extends StatelessWidget {
  final dynamic activity;
  final bool dk;
  final Color fg, mt, cd, bd;
  const _ActivityTile({required this.activity, required this.dk, required this.fg, required this.mt, required this.cd, required this.bd});

  @override
  Widget build(BuildContext context) {
    // ── Déterminer l'icône, couleur, et badge selon le type ────────────
    Color color = AppTheme.electricBlue;
    IconData icon = Icons.info_outline;
    String? badge; // Status badge (e.g., "APPROUVÉ", "EN ATTENTE")
    Color badgeColor = AppTheme.emerald;
 String title = activity['title'] ?? ''; // Titre par défaut du backend

    switch (activity['type']) {
      case 'TRANSACTION':
        final isIncoming = activity['sign'] == '+';
        color = isIncoming ? AppTheme.emerald : AppTheme.coralRed;
        icon = isIncoming ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded;
        break;
      case 'PAYROLL':
        color = AppTheme.emerald;
        icon = Icons.account_balance_wallet_rounded;
        badge = 'SALAIRE';
        badgeColor = AppTheme.emerald;
        break;
      case 'PRIME':
        color = AppTheme.amber;
        icon = Icons.stars_rounded;
        badge = 'PRIME';
        badgeColor = AppTheme.amber;
        break;
      case 'LEAVE':
        // ── Icon spécifique selon le type de congé ──────────────────
        final leaveType = activity['leaveType'] ?? activity['subtype'] ?? 'REPOS';
        switch (leaveType.toString().toUpperCase()) {
          case 'MALADIE':
          case 'SICK':
            color = const Color(0xFFEF4444); // Rouge pour maladie
            icon = Icons.medical_services_rounded;
            break;
          case 'MARIAGE':
          case 'MARRIAGE':
            color = const Color(0xFFEC4899); // Rose pour mariage
            icon = Icons.favorite_rounded;
            break;
          case 'NAISSANCE':
          case 'BIRTH':
            color = const Color(0xFF06B6D4); // Cyan pour naissance
            icon = Icons.child_care_rounded;
            break;
          case 'DECES':
          case 'DEATH':
            color = const Color(0xFF64748B); // Gris pour décès
            icon = Icons.nightlight_rounded;
            break;
          case 'PELERINAGE':
          case 'PILGRIMAGE':
            color = const Color(0xFF8B5CF6); // Violet pour pèlerinage
            icon = Icons.mosque_rounded;
            break;
          case 'SANS_SOLDE':
          case 'UNPAID':
            color = const Color(0xFF6B7280); // Gris pour sans solde
            icon = Icons.money_off_rounded;
            break;
          case 'REPOS':
          case 'REST':
          default:
            color = AppTheme.turquoise; // Turquoise pour repos/vacances
            icon = Icons.beach_access_rounded;
            break;
        }
        
        // Badge de statut
        if (activity['status'] == 'APPROVED') {
          badge = 'APPROUVÉ';
          badgeColor = AppTheme.emerald;
        } else if (activity['status'] == 'REJECTED') {
          badge = 'REFUSÉ';
          badgeColor = AppTheme.coralRed;
        } else {
          badge = 'EN ATTENTE';
          badgeColor = AppTheme.amber;
        }
        title = 'Congé $leaveType';
        break;
      case 'CREDIT':
        color = AppTheme.amber;
        icon = Icons.account_balance_rounded;
        badge = 'CRÉDIT';
        badgeColor = AppTheme.amber;
        break;
      case 'AVANCE':
        color = AppTheme.turquoise;
        icon = Icons.payments_rounded;
        badge = 'AVANCE';
        badgeColor = AppTheme.turquoise;
        break;
      case 'NOTIFICATION':
        color = AppTheme.turquoise;
        icon = Icons.notifications_active_rounded;
        break;
      case 'CHEQUE':
        color = AppTheme.royalBlue;
        icon = Icons.receipt_long_rounded;
        badge = 'CHÈQUE';
        badgeColor = AppTheme.royalBlue;
        break;
    }

    // ── Date formatting ──────────────────────────────────────────────
    final date = DateTime.parse(activity['date'].toString()).toLocal();
    final now = DateTime.now();
    final diff = now.difference(date);
    String dateLabel;
    String timeLabel = "${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}";

    if (diff.inDays == 0) {
      dateLabel = "Aujourd'hui";
    } else if (diff.inDays == 1) {
      dateLabel = "Hier";
    } else if (diff.inDays < 7) {
      dateLabel = "Il y a ${diff.inDays}j";
    } else {
      dateLabel = "${date.day}/${date.month}/${date.year}";
    }

    // ── Déterminer l'info contextuelle (expéditeur/destinataire) ───────
    String? contextInfo;
    if (activity['from'] != null && activity['from'].toString().isNotEmpty) {
      contextInfo = "De: ${activity['from']}";
    } else if (activity['to'] != null && activity['to'].toString().isNotEmpty) {
      contextInfo = "À: ${activity['to']}";
    }

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        _showActivityDetail(context, activity, color, icon, badge, badgeColor, title);
      },
      child: Container(
        margin: const EdgeInsets.fromLTRB(20, 0, 20, 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: dk ? 0.12 : 0.08),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: dk
                      ? [cd.withValues(alpha: 0.9), cd.withValues(alpha: 0.7)]
                      : [Colors.white.withValues(alpha: 0.95), Colors.white.withValues(alpha: 0.85)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                border: Border.all(
                  color: dk ? Colors.white.withValues(alpha: 0.06) : color.withValues(alpha: 0.12),
                  width: 1.5,
                ),
              ),
              child: Row(
                children: [
                  // ── Icône avec gradient ──────────────────────────────
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [color, color.withValues(alpha: 0.7)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: color.withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Icon(icon, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 14),

                  // ── Contenu principal ────────────────────────────────
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                title, // Utiliser le titre dynamique au lieu de activity['title']
                                style: TextStyle(
                                  color: fg,
                                  fontSize: 15,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.2,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (badge != null) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: badgeColor.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: badgeColor.withValues(alpha: 0.3)),
                                ),
                                child: Text(
                                  badge,
                                  style: TextStyle(
                                    color: badgeColor,
                                    fontSize: 9,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          activity['description'] ?? '',
                          style: TextStyle(
                            color: mt,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (contextInfo != null) ...[
                          const SizedBox(height: 3),
                          Row(
                            children: [
                              Icon(
                                activity['from'] != null ? Icons.person_rounded : Icons.send_rounded,
                                color: color.withValues(alpha: 0.6),
                                size: 12,
                              ),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  contextInfo,
                                  style: TextStyle(
                                    color: color.withValues(alpha: 0.8),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),

                  // ── Montant et date ──────────────────────────────────
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      // N'afficher le montant que si ce n'est PAS un congé avec 0.0 TND
                      if (activity['amount'] != null && !(activity['type'] == 'LEAVE' && (activity['amount'] == 0 || activity['amount'] == 0.0)))
                        Text(
                          '${activity['sign'] ?? ''}${activity['amount']} TND',
                          style: TextStyle(
                            color: color,
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.3,
                          ),
                        ),
                      // Afficher la durée pour les congés
                      if (activity['type'] == 'LEAVE' && activity['days'] != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: color.withValues(alpha: 0.3)),
                          ),
                          child: Text(
                            '${activity['days']} j',
                            style: TextStyle(
                              color: color,
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: dk ? Colors.white.withValues(alpha: 0.05) : Colors.black.withValues(alpha: 0.03),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              dateLabel,
                              style: TextStyle(
                                color: mt,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            if (diff.inDays == 0 || diff.inDays == 1) ...[
                              const SizedBox(height: 1),
                              Text(
                                timeLabel,
                                style: TextStyle(
                                  color: mt.withValues(alpha: 0.6),
                                  fontSize: 9,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
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
      ).animate().fadeIn(duration: 400.ms).slideX(begin: 0.03, curve: Curves.easeOutCubic),
    );
  }

  void _showActivityDetail(BuildContext context, dynamic activity, Color color, IconData icon, String? badge, Color badgeColor, String title) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => Container(
        decoration: BoxDecoration(
          color: dk ? const Color(0xFF0B1426) : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        ),
        padding: EdgeInsets.fromLTRB(24, 12, 24, MediaQuery.of(context).padding.bottom + 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Drag handle
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 28),
              decoration: BoxDecoration(
                color: mt.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            // Header
            Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: [color, color.withValues(alpha: 0.7)]),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(icon, color: Colors.white, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title, // Utiliser le titre dynamique
                        style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w900),
                      ),
                      if (badge != null) ...[
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: badgeColor.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            badge,
                            style: TextStyle(color: badgeColor, fontSize: 11, fontWeight: FontWeight.w900),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            Divider(color: bd, height: 36),
            if (activity['amount'] != null) ...[
              Text('Montant', style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Text(
                '${activity['sign'] ?? ''}${activity['amount']} TND',
                style: TextStyle(color: color, fontSize: 36, fontWeight: FontWeight.w900, letterSpacing: -1),
              ),
              Divider(color: bd, height: 36),
            ],
            _detailRow('Description', activity['description'] ?? 'N/A', fg, mt),
            const SizedBox(height: 14),
            if (activity['from'] != null && activity['from'].toString().isNotEmpty)
              _detailRow('Expéditeur', activity['from'], fg, mt),
            if (activity['to'] != null && activity['to'].toString().isNotEmpty)
              _detailRow('Destinataire', activity['to'], fg, mt),
            const SizedBox(height: 14),
            _detailRow('Date', DateTime.parse(activity['date'].toString()).toLocal().toString().substring(0, 16), fg, mt),
            const SizedBox(height: 28),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                padding: EdgeInsets.zero,
              ),
              child: Ink(
                decoration: BoxDecoration(gradient: AppTheme.primaryGradient, borderRadius: BorderRadius.circular(14)),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  child: const Center(
                    child: Text('Fermer', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value, Color fg, Color mt) => Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: mt, fontSize: 13, fontWeight: FontWeight.w600)),
          Expanded(
            child: Text(
              value,
              style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w800),
              textAlign: TextAlign.right,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      );
}

// ── TRANSACTION TILE ──────────────────────────────────────────────────────────
class _TransactionTile extends StatelessWidget {
  final Transaction tx; final bool dk;
  final Color fg, mt, cd, bd;
  const _TransactionTile({required this.tx, required this.dk, required this.fg, required this.mt, required this.cd, required this.bd});

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

  void _showDetail(BuildContext context, Color color, IconData icon) {
    final now = DateTime.now();
    final diff = now.difference(tx.date);
    String dateLabel;
    if (diff.inDays == 0) {
      dateLabel = "Aujourd'hui à ${tx.date.hour.toString().padLeft(2,'0')}:${tx.date.minute.toString().padLeft(2,'0')}";
    } else if (diff.inDays == 1) {
      dateLabel = "Hier à ${tx.date.hour.toString().padLeft(2,'0')}:${tx.date.minute.toString().padLeft(2,'0')}";
    } else {
      dateLabel = "${tx.date.day.toString().padLeft(2,'0')}/${tx.date.month.toString().padLeft(2,'0')}/${tx.date.year}";
    }
    String statusLabel; Color statusColor;
    switch (tx.status) {
      case TransactionStatus.completed: statusLabel = 'Complétée'; statusColor = AppTheme.emerald; break;
      case TransactionStatus.pending:   statusLabel = 'En cours';  statusColor = AppTheme.amber;    break;
      case TransactionStatus.failed:    statusLabel = 'Échouée';   statusColor = AppTheme.coralRed; break;
      case null:                        statusLabel = 'Complétée'; statusColor = AppTheme.emerald; break;
    }
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => Container(
        decoration: BoxDecoration(
          color: dk ? const Color(0xFF0B1426) : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        ),
        padding: EdgeInsets.fromLTRB(24, 12, 24, MediaQuery.of(context).padding.bottom + 32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 40, height: 4, margin: const EdgeInsets.only(bottom: 28),
            decoration: BoxDecoration(color: mt.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2))),
          Row(children: [
            Container(width: 50, height: 50,
              decoration: BoxDecoration(color: color.withValues(alpha: 0.12), shape: BoxShape.circle),
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
          _detailRow('Date', dateLabel, fg, mt),
          const SizedBox(height: 14),
          _detailRow('Référence', '#TX-${tx.id.toUpperCase().substring(0, tx.id.length.clamp(0, 10))}', fg, mt),
          const SizedBox(height: 14),
          _detailRow('Catégorie', tx.category.label, fg, mt),
          const SizedBox(height: 14),
          _detailRow('Statut', statusLabel, statusColor, mt, valueColor: statusColor),
          const SizedBox(height: 28),
          Row(children: [
            Expanded(child: OutlinedButton.icon(
              onPressed: () { HapticFeedback.lightImpact(); },
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: AppTheme.electricBlue.withValues(alpha: 0.4)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              icon: const Icon(Icons.download_rounded, color: AppTheme.electricBlue, size: 18),
              label: const Text('Reçu', style: TextStyle(color: AppTheme.electricBlue, fontSize: 13, fontWeight: FontWeight.w700)),
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

  Widget _detailRow(String label, String value, Color fg, Color mt, {Color? valueColor}) =>
    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label, style: TextStyle(color: mt, fontSize: 14, fontWeight: FontWeight.w500)),
      Text(value, style: TextStyle(color: valueColor ?? fg, fontSize: 14, fontWeight: FontWeight.w800)),
    ]);

  @override
  Widget build(BuildContext context) {
    final color = _catColors[tx.category] ?? AppTheme.textMutedLight;
    final icon = _catIcons[tx.category] ?? Icons.more_horiz_rounded;
    return GestureDetector(
      onTap: () {
        HapticFeedback.mediumImpact();
        _showDetail(context, color, icon);
      },
      child: Container(
        margin: const EdgeInsets.fromLTRB(20, 0, 20, 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: cd, borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            border: Border.all(color: bd), boxShadow: AppTheme.cardShadow(dk)),
        child: Row(children: [
          Container(padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: color, size: 20)),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(tx.title, style: AppTheme.body(fg).copyWith(fontWeight: FontWeight.w700)),
            Text(tx.category.label, style: AppTheme.caption(mt)),
          ])),
          Row(children: [
            Text(tx.formattedAmount, style: AppTheme.body(tx.isCredit ? AppTheme.emerald : AppTheme.coralRed).copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(width: 6),
            Icon(Icons.chevron_right_rounded, color: mt.withValues(alpha: 0.4), size: 16),
          ]),
        ]),
      ),
    ).animate().fadeIn().slideX(begin: 0.05);
  }
}

// ── SHIMMER PLACEHOLDER ───────────────────────────────────────────────────────
class _Shimmer extends StatelessWidget {
  final double width, height, radius;
  final EdgeInsets? margin;
  const _Shimmer({required this.width, required this.height, required this.radius, this.margin});
  @override
  Widget build(BuildContext context) {
    final dk = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: width, height: height, margin: margin,
      decoration: BoxDecoration(
        color: dk ? Colors.white.withValues(alpha: 0.06) : Colors.black.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(radius),
      ),
    ).animate(onPlay: (c) => c.repeat(reverse: true)).shimmer(duration: 1.2.seconds,
        color: dk ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.06));
  }
}

// ── STAT PILL (Premium Analytics Stats) ──────────────────────────────────────
class _StatPill extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final bool dk;
  const _StatPill({required this.label, required this.value, required this.icon, required this.color, required this.dk});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: dk
                ? [color.withValues(alpha: 0.12), color.withValues(alpha: 0.06)]
                : [color.withValues(alpha: 0.08), color.withValues(alpha: 0.04)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.2), width: 1.5),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
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
                    style: TextStyle(
                      color: dk ? Colors.white60 : const Color(0xFF64748B),
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.3,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    value,
                    style: TextStyle(
                      color: color,
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.3,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ).animate().fadeIn(delay: 100.ms).scale(begin: const Offset(0.92, 0.92), curve: Curves.easeOutBack),
    );
  }
}
