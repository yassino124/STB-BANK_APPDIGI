import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../viewmodels/rh_viewmodel.dart';
import '../../models/rh_models.dart';

// ═══════════════════════════════════════════════════════════════════════════
//  AVANCE SCREEN — MVVM + Premium UI
// ═══════════════════════════════════════════════════════════════════════════

class AvanceScreen extends StatefulWidget {
  const AvanceScreen({super.key});
  @override
  State<AvanceScreen> createState() => _AvanceScreenState();
}

class _AvanceScreenState extends State<AvanceScreen> with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  int _selectedTab = 0;
  double _requestAmount = 500;

  static const _tabs = [
    {'label': 'Salaire', 'icon': Icons.payments_rounded,    'apiValue': 'SALAIRE',   'color': 0xFF7C3AED},
    {'label': 'Prime',   'icon': Icons.star_rounded,         'apiValue': 'PRIME',     'color': 0xFFF59E0B},
    {'label': 'Prime Aïd','icon': Icons.celebration_rounded, 'apiValue': 'PRIME_AID', 'color': 0xFFEF4444},
  ];

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this)
      ..addListener(() {
        if (!_tabCtrl.indexIsChanging) {
          setState(() {
            _selectedTab = _tabCtrl.index;
            _clampAmount();
          });
        }
      });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final vm = context.read<RhViewModel>();
      vm.loadAvances();
      vm.startPolling(avances: true);
    });
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    context.read<RhViewModel>().stopPolling();
    super.dispose();
  }

  double _getMax(double salaire) {
    final maxes = [
      (salaire * 0.5).clamp(500, 5000).toDouble(),
      (salaire * 0.5).clamp(1000, 10000).toDouble(),
      (salaire * 0.25).clamp(500, 3000).toDouble(),
    ];
    return maxes[_selectedTab];
  }

  void _clampAmount() {
    final salaire = context.read<AppProvider>().salaireBase;
    final max = _getMax(salaire);
    if (_requestAmount > max) _requestAmount = (max * 0.5).clamp(100, max);
    if (_requestAmount < 100) _requestAmount = 100;
  }

  @override
  Widget build(BuildContext context) {
    final p = context.watch<AppProvider>();
    final dk = p.themeMode == ThemeMode.dark;
    final fg = Theme.of(context).colorScheme.onSurface;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.07) : Colors.black.withValues(alpha: 0.04);
    final tabColor = Color(_tabs[_selectedTab]['color'] as int);
    final salaire = p.salaireBase;
    final maxAmount = _getMax(salaire);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: Column(children: [
          _buildHeader(dk, fg, mt, cd, bd),
          const SizedBox(height: 20),
          _buildTabSelector(fg, mt, cd, bd, tabColor),
          const SizedBox(height: 16),
          Expanded(child: CustomScrollView(
            physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
            slivers: [
              SliverToBoxAdapter(child: _buildRequestCard(fg, mt, cd, bd, dk, tabColor, salaire, maxAmount)),
              SliverToBoxAdapter(child: const SizedBox(height: 20)),
              SliverToBoxAdapter(child: _buildPolicyCard(fg, mt, cd, bd, dk, tabColor, salaire)),
              SliverToBoxAdapter(child: const SizedBox(height: 24)),
              SliverToBoxAdapter(child: _buildHistoryHeader(fg, mt)),
              const SliverToBoxAdapter(child: SizedBox(height: 12)),
              _buildHistoryList(fg, mt, cd, bd, dk),
              const SliverToBoxAdapter(child: SizedBox(height: 120)),
            ],
          )),
        ]),
      ),
    );
  }

  // ── HEADER ──────────────────────────────────────────────────────────────
  Widget _buildHeader(bool dk, Color fg, Color mt, Color cd, Color bd) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Row(children: [
        GestureDetector(
          onTap: () { HapticFeedback.lightImpact(); Navigator.pop(context); },
          child: Container(
            width: 44, height: 44,
            decoration: BoxDecoration(color: cd, shape: BoxShape.circle, border: Border.all(color: bd), boxShadow: AppTheme.cardShadow(dk)),
            child: Icon(Icons.arrow_back_rounded, color: fg, size: 20),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Avances', style: GoogleFonts.outfit(color: fg, fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
          Text('Salaire · Prime · Aïd', style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
        ])),
      ]).animate().fadeIn(duration: 350.ms),
    );
  }

  // ── TAB SELECTOR ─────────────────────────────────────────────────────────
  Widget _buildTabSelector(Color fg, Color mt, Color cd, Color bd, Color tabColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        height: 52,
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(color: cd, borderRadius: BorderRadius.circular(18), border: Border.all(color: bd)),
        child: Row(children: _tabs.asMap().entries.map((e) {
          final tab = e.value;
          final sel = _selectedTab == e.key;
          final tc = Color(tab['color'] as int);
          return Expanded(child: GestureDetector(
            onTap: () { HapticFeedback.selectionClick(); _tabCtrl.animateTo(e.key); setState(() { _selectedTab = e.key; _clampAmount(); }); },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              decoration: BoxDecoration(
                color: sel ? tc : Colors.transparent,
                borderRadius: BorderRadius.circular(14),
                boxShadow: sel ? [BoxShadow(color: tc.withValues(alpha: 0.35), blurRadius: 8, offset: const Offset(0, 3))] : [],
              ),
              child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(tab['icon'] as IconData, color: sel ? Colors.white : mt, size: 15),
                const SizedBox(width: 5),
                Text(tab['label'] as String, style: TextStyle(color: sel ? Colors.white : mt, fontSize: 12, fontWeight: FontWeight.w700)),
              ]),
            ),
          ));
        }).toList()),
      ),
    ).animate().fadeIn(delay: 100.ms);
  }

  // ── REQUEST CARD ─────────────────────────────────────────────────────────
  Widget _buildRequestCard(Color fg, Color mt, Color cd, Color bd, bool dk, Color tabColor, double salaire, double maxAmount) {
    // Prime tabs = auto-distributed by Finance, not a request form
    if (_selectedTab == 1 || _selectedTab == 2) {
      return _buildPrimeInfoCard(fg, mt, cd, bd, dk, tabColor);
    }
    final labels = ['Avance sur Salaire', 'Prime de Rendement', 'Prime de l\'Aïd'];
    final descriptions = [
      'Max 50% salaire · Retenu sur fiche de paie',
      'Basée sur évaluation · Non répétable',
      'Versement exceptionnel · 1 fois par Aïd',
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [tabColor.withValues(alpha: dk ? 0.3 : 0.92), tabColor.withValues(alpha: dk ? 0.12 : 0.72)],
            begin: Alignment.topLeft, end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(28),
          boxShadow: [BoxShadow(color: tabColor.withValues(alpha: 0.3), blurRadius: 24, offset: const Offset(0, 10))],
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(
              width: 42, height: 42,
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(14)),
              child: Icon(_tabs[_selectedTab]['icon'] as IconData, color: Colors.white, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(labels[_selectedTab], style: GoogleFonts.outfit(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
              Text(descriptions[_selectedTab],
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 10, fontWeight: FontWeight.w500),
                  maxLines: 2, overflow: TextOverflow.ellipsis),
            ])),
          ]),
          const SizedBox(height: 28),

          // Amount display
          Text('Montant Demandé', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12, fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text(
              '${_requestAmount.round()}',
              style: GoogleFonts.outfit(color: Colors.white, fontSize: 40, fontWeight: FontWeight.w900, letterSpacing: -1.5),
            ),
            const Padding(
              padding: EdgeInsets.only(bottom: 6, left: 6),
              child: Text('TND', style: TextStyle(color: Colors.white70, fontSize: 16, fontWeight: FontWeight.w700)),
            ),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
              child: Text('Max ${maxAmount.round()} TND',
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
            ),
          ]),
          const SizedBox(height: 8),

          // Slider
          SliderTheme(
            data: SliderThemeData(
              activeTrackColor: Colors.white,
              inactiveTrackColor: Colors.white.withValues(alpha: 0.2),
              thumbColor: Colors.white,
              overlayColor: Colors.white.withValues(alpha: 0.15),
              trackHeight: 4,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 10),
            ),
            child: Slider(
              value: _requestAmount.clamp(100, maxAmount),
              min: 100, max: maxAmount,
              divisions: ((maxAmount - 100) / 100).round().clamp(1, 100),
              onChanged: (v) { HapticFeedback.selectionClick(); setState(() => _requestAmount = v); },
            ),
          ),

          // Percentage indicator
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('${((_requestAmount / salaire) * 100).round()}% du salaire',
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.65), fontSize: 11, fontWeight: FontWeight.w600)),
              Text('100 TND', style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 10)),
            ]),
          ),
          const SizedBox(height: 20),

          // Submit Button
          Consumer<RhViewModel>(builder: (_, vm, __) {
            return GestureDetector(
              onTap: vm.avanceSubmitting ? null : () => _submitAvance(vm),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                height: 54,
                decoration: BoxDecoration(
                  color: vm.avanceSubmitting ? Colors.grey.withValues(alpha: 0.25) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: vm.avanceSubmitting ? [] : [BoxShadow(color: tabColor.withValues(alpha: 0.4), blurRadius: 16, offset: const Offset(0, 8))],
                ),
                child: Center(child: vm.avanceSubmitting
                    ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5))
                    : Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Icon(Icons.fingerprint_rounded, color: tabColor, size: 22),
                        const SizedBox(width: 10),
                        Text('Demande Instantanée (IA)', style: TextStyle(color: tabColor, fontSize: 15, fontWeight: FontWeight.w900)),
                      ])),
              ),
            );
          }),
        ]),
      ),
    ).animate().fadeIn(delay: 150.ms).scale(begin: const Offset(0.97, 0.97));
  }

  // ── PRIME INFO CARD (Auto-distributed by Finance) ───────────────────
  Widget _buildPrimeInfoCard(Color fg, Color mt, Color cd, Color bd, bool dk, Color tabColor) {
    final isAid = _selectedTab == 2;
    final primeTitle = isAid ? 'Prime de l\'Aïd' : 'Prime de Rendement';
    final primeIcon = isAid ? Icons.celebration_rounded : Icons.star_rounded;
    final primeDesc = isAid
        ? 'Versement exceptionnel à l\'occasion de l\'Aïd'
        : 'Basée sur votre évaluation annuelle de performance';
    final criterias = isAid
        ? ['Versée automatiquement avant chaque Aïd', 'Aucune demande requise', 'Montant fixé par la Finance STB']
        : ['Calculée selon votre évaluation RH', 'Versée sur décision Finance', 'Ajoutée à votre fiche de paie'];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(children: [
        // Header gradient banner
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [tabColor.withValues(alpha: dk ? 0.28 : 0.88), tabColor.withValues(alpha: dk ? 0.10 : 0.65)],
              begin: Alignment.topLeft, end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(28),
            boxShadow: [BoxShadow(color: tabColor.withValues(alpha: 0.28), blurRadius: 24, offset: const Offset(0, 10))],
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Container(
                width: 48, height: 48,
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(16)),
                child: Icon(primeIcon, color: Colors.white, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(primeTitle, style: GoogleFonts.outfit(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800)),
                Text(primeDesc, style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 11), maxLines: 2),
              ])),
            ]),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
              ),
              child: Row(children: [
                const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 18),
                const SizedBox(width: 10),
                Expanded(child: Text(
                  'Distribution automatique par la Finance STB',
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                )),
              ]),
            ),
            const SizedBox(height: 16),
            ...criterias.map((c) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Container(
                  width: 6, height: 6,
                  margin: const EdgeInsets.only(top: 5, right: 10),
                  decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.8), shape: BoxShape.circle),
                ),
                Expanded(child: Text(c, style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 12, fontWeight: FontWeight.w600))),
              ]),
            )),
          ]),
        ).animate().fadeIn(delay: 150.ms).scale(begin: const Offset(0.97, 0.97)),
        const SizedBox(height: 16),
        // How it works info box
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: tabColor.withValues(alpha: dk ? 0.06 : 0.05),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: tabColor.withValues(alpha: 0.15)),
          ),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(Icons.info_outline_rounded, color: tabColor, size: 20),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Comment ça fonctionne ?', style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              Text(
                isAid
                    ? 'Votre prime d\'Aïd est automatiquement créditée sur votre compte STB avant chaque Aïd. Vous recevrez une notification push dès le virement.'
                    : 'Votre prime est calculée par la Finance selon vos objectifs et évaluations. Elle apparaît dans vos fiches de paie une fois validée.',
                style: TextStyle(color: mt, fontSize: 12, height: 1.5),
              ),
            ])),
          ]),
        ).animate().fadeIn(delay: 200.ms),
      ]),
    );
  }

  // ── POLICY CARD ───────────────────────────────────────────────────────────
  Widget _buildPolicyCard(Color fg, Color mt, Color cd, Color bd, bool dk, Color tabColor, double salaire) {
    final isPrime = _selectedTab == 1 || _selectedTab == 2;
    final policies = [
      [Icons.verified_user_rounded, 'Éligibilité', 'Après 1 an d\'ancienneté'],
      [
        isPrime ? Icons.card_giftcard_rounded : Icons.payment_rounded,
        isPrime ? 'Nature' : 'Remboursement',
        isPrime ? 'Bonus (Non remboursable)' : '3 mensualités égales'
      ],
      [
        Icons.schedule_rounded, 
        'Délai', 
        _selectedTab == 2 ? 'Avant le jour de l\'Aïd' : 'Ajouté à la paie / 3 jours'
      ],
    ];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: cd, borderRadius: BorderRadius.circular(24), border: Border.all(color: bd)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(width: 3, height: 16, decoration: BoxDecoration(color: tabColor, borderRadius: BorderRadius.circular(2))),
            const SizedBox(width: 10),
            Text('Conditions & Politique', style: TextStyle(color: fg, fontSize: 15, fontWeight: FontWeight.w800)),
          ]),
          const SizedBox(height: 16),
          ...policies.map((pol) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(children: [
              Container(
                width: 36, height: 36,
                decoration: BoxDecoration(color: tabColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                child: Icon(pol[0] as IconData, color: tabColor, size: 17),
              ),
              const SizedBox(width: 14),
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(pol[1] as String, style: TextStyle(color: mt, fontSize: 10, fontWeight: FontWeight.w600)),
                Text(pol[2] as String, style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w700)),
              ]),
            ]),
          )),
        ]),
      ),
    ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.04);
  }

  Widget _buildHistoryHeader(Color fg, Color mt) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(children: [
        Container(width: 3, height: 18, decoration: BoxDecoration(color: const Color(0xFF7C3AED), borderRadius: BorderRadius.circular(2))),
        const SizedBox(width: 10),
        Text('Historique des Avances', style: TextStyle(color: fg, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: -0.3)),
      ]),
    );
  }

  Widget _buildHistoryList(Color fg, Color mt, Color cd, Color bd, bool dk) {
    return Consumer<RhViewModel>(builder: (_, vm, __) {
      if (vm.avancesLoading) {
        return SliverList(delegate: SliverChildBuilderDelegate((_, i) => _ShimmerCard(dk: dk), childCount: 3));
      }
      if (vm.avances.isEmpty) {
        return SliverToBoxAdapter(child: Padding(
          padding: const EdgeInsets.all(20),
          child: Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(color: cd, borderRadius: BorderRadius.circular(20), border: Border.all(color: bd)),
            child: Column(children: [
              Icon(Icons.payments_rounded, color: mt, size: 36),
              const SizedBox(height: 12),
              Text('Aucune avance', style: TextStyle(color: mt, fontSize: 15, fontWeight: FontWeight.w700)),
            ]),
          ),
        ));
      }
      return SliverPadding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        sliver: SliverList(delegate: SliverChildBuilderDelegate(
          (_, i) => _AvanceTile(avance: vm.avances[i], fg: fg, mt: mt, cd: cd, bd: bd, dk: dk, index: i),
          childCount: vm.avances.length,
        )),
      );
    });
  }

  Future<void> _submitAvance(RhViewModel vm) async {
    HapticFeedback.heavyImpact();
    final error = await vm.submitAvance(
      type: _tabs[_selectedTab]['apiValue'] as String,
      montant: _requestAmount,
    );
    if (!mounted) return;
    final tabColor = Color(_tabs[_selectedTab]['color'] as int);
    if (error == null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Row(children: [
          Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
          SizedBox(width: 10),
          Text('Demande d\'avance soumise !', style: TextStyle(fontWeight: FontWeight.w700)),
        ]),
        backgroundColor: tabColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        duration: const Duration(milliseconds: 2500),
      ));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(error, style: const TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: AppTheme.coralRed,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ));
    }
  }
}

// ── AVANCE TILE ───────────────────────────────────────────────────────────────

class _AvanceTile extends StatelessWidget {
  final AvanceRequest avance;
  final Color fg, mt, cd, bd;
  final bool dk;
  final int index;

  const _AvanceTile({
    required this.avance, required this.fg, required this.mt,
    required this.cd, required this.bd, required this.dk, required this.index,
  });

  Color get _statusColor {
    switch (avance.status) {
      case RhStatus.approuve: return const Color(0xFF10B981);
      case RhStatus.rejete:   return const Color(0xFFEF4444);
      case RhStatus.traite:   return const Color(0xFF8B5CF6);
      case RhStatus.annule:   return const Color(0xFF64748B);
      default:                return const Color(0xFFF59E0B);
    }
  }

  IconData get _typeIcon {
    switch (avance.type) {
      case AvanceType.prime:    return Icons.star_rounded;
      case AvanceType.primeAid: return Icons.celebration_rounded;
      default:                  return Icons.payments_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cd, borderRadius: BorderRadius.circular(20),
        border: Border.all(color: bd), boxShadow: AppTheme.cardShadow(dk),
      ),
      child: Row(children: [
        Container(
          width: 44, height: 44,
          decoration: BoxDecoration(color: const Color(0xFF7C3AED).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(14)),
          child: Icon(_typeIcon, color: const Color(0xFF7C3AED), size: 22),
        ),
        const SizedBox(width: 14),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(avance.type.label, style: TextStyle(color: fg, fontSize: 14, fontWeight: FontWeight.w800)),
          const SizedBox(height: 3),
          Text('${avance.montant.toStringAsFixed(0)} TND · ${DateFormat('d MMM yyyy', 'fr').format(avance.createdAt)}',
              style: TextStyle(color: mt, fontSize: 11, fontWeight: FontWeight.w600)),
        ])),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: _statusColor.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10),
            border: Border.all(color: _statusColor.withValues(alpha: 0.3)),
          ),
          child: Text(avance.status.label, style: TextStyle(color: _statusColor, fontSize: 10, fontWeight: FontWeight.w800)),
        ),
      ]),
    ).animate().fadeIn(delay: (index * 60).ms).slideX(begin: 0.04);
  }
}

class _ShimmerCard extends StatefulWidget {
  final bool dk;
  const _ShimmerCard({required this.dk});
  @override
  State<_ShimmerCard> createState() => _ShimmerCardState();
}

class _ShimmerCardState extends State<_ShimmerCard> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;
  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..repeat();
    _anim = Tween<double>(begin: -1, end: 2).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }
  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    final base = widget.dk ? const Color(0xFF1C2D44) : const Color(0xFFE8EDF5);
    final shimmer = widget.dk ? const Color(0xFF243552) : const Color(0xFFF1F5F9);
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
      child: AnimatedBuilder(
        animation: _anim,
        builder: (_, __) => Container(
          height: 72,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: LinearGradient(
              begin: Alignment(_anim.value - 1, 0), end: Alignment(_anim.value, 0),
              colors: [base, shimmer, base],
            ),
          ),
        ),
      ),
    );
  }
}
