import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../widgets/stb_card.dart';
import '../../widgets/stb_button.dart';
import '../../widgets/stb_bottom_sheet.dart';
import '../../widgets/stb_chip.dart';
import 'dart:math' as math;
import '../../services/auth_api_service.dart';
import 'credit_detail_screen.dart';

class CreditScreen extends StatefulWidget {
  const CreditScreen({super.key});
  @override
  State<CreditScreen> createState() => _CreditScreenState();
}

class _CreditScreenState extends State<CreditScreen> with TickerProviderStateMixin {
  late AnimationController _gaugeCtrl;
  late AnimationController _counterCtrl;
  late Animation<double> _gaugeFill;
  late Animation<double> _counterAnim;
  int _expandedIndex = -1;

  List<Map<String, dynamic>> _credits = [];
  bool _isLoading = true;

  double get _totalMontant => _credits.fold(0.0, (sum, c) => sum + (c['montant'] as double));
  double get _totalEncours => _credits.fold(0.0, (sum, c) => sum + (c['encours'] as double));
  double get _totalPaye => _totalMontant - _totalEncours;
  double get _totalMensualite => _credits.fold(0.0, (sum, c) => sum + (c['mensualite'] as double));

  @override
  void initState() {
    super.initState();
    _gaugeCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400));
    _counterCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200));
    _gaugeFill = CurvedAnimation(parent: _gaugeCtrl, curve: Curves.easeOutExpo);
    _counterAnim = CurvedAnimation(parent: _counterCtrl, curve: Curves.easeOutExpo);
    _gaugeCtrl.forward();
    Future.delayed(const Duration(milliseconds: 200), () => _counterCtrl.forward());
    
    _loadCredits();
  }

  Future<void> _loadCredits() async {
    final res = await AuthApiService.getMyCredits();
    List<Map<String, dynamic>> list = [];
    if (res.isSuccess && res.data != null && res.data!.isNotEmpty) {
      list = res.data!.map((d) {
        final montantInitial = (d['montantInitial'] as num?)?.toDouble() ?? 0.0;
        final montantRestant = (d['montantRestant'] as num?)?.toDouble() ?? montantInitial;
        final dateDebut = d['dateDebut'] as String? ?? '';
        final dateFin = d['dateFin'] as String? ?? '';
        
        String formatDate(String iso) {
          try {
            if (iso.isEmpty) return 'N/A';
            final dt = DateTime.parse(iso);
            return '${dt.day.toString().padLeft(2,'0')}/${dt.month.toString().padLeft(2,'0')}/${dt.year}';
          } catch (_) { return iso; }
        }

        return {
          'title': d['title'] ?? 'Crédit Personnel',
          'montant': montantInitial,
          'encours': montantRestant,
          'mensualite': (d['mensualite'] as num?)?.toDouble() ?? 0.0,
          'debut': formatDate(dateDebut),
          'fin': formatDate(dateFin),
          'status': d['status'] ?? 'ACTIVE',
          'type': d['type'] ?? 'PERSONNEL',
          'tauxInteret': (d['tauxInteret'] as num?)?.toDouble() ?? 0.0,
          'nombreMois': (d['nombreMois'] as num?)?.toInt() ?? 0,
          'color': 0xFF2962FF,
          '_id': d['_id'],
        };
      }).toList();
    }
    // ✅ NO FALLBACK - Show empty state if no credits in backend

    if (mounted) {
      setState(() {
        _credits = list;
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _gaugeCtrl.dispose();
    _counterCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final bg = dk ? const Color(0xFF0A101A) : const Color(0xFFF8FAFC);
    final fg = dk ? Colors.white : const Color(0xFF0F172A);
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = dk ? const Color(0xFF131E30) : Colors.white;
    final bd = dk ? const Color(0xFF1C2D44) : const Color(0xFFE8EDF5);

    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
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
                        Text("Mes Crédits", style: GoogleFonts.outfit(color: fg, fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
                        Text("Vue d'ensemble & Détails", style: GoogleFonts.inter(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.emerald.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 6, height: 6,
                          decoration: const BoxDecoration(color: AppTheme.emerald, shape: BoxShape.circle),
                        ).animate(onPlay: (c) => c.repeat(reverse: true))
                         .scale(begin: const Offset(0.7, 0.7), end: const Offset(1.3, 1.3), duration: 800.ms),
                        const SizedBox(width: 6),
                        const Text("IA Normal", style: TextStyle(color: AppTheme.emerald, fontSize: 10, fontWeight: FontWeight.w800)),
                      ],
                    ),
                  ),
                ],
              ).animate().fadeIn(),
            ),

            const SizedBox(height: 20),

            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _credits.isEmpty
                      ? _buildEmptyState(fg, mt, cd, bd, dk)
                      : SingleChildScrollView(
                          physics: const BouncingScrollPhysics(),
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Column(
                            children: [
                              _buildGaugeCard(fg, mt, cd, bd, dk),
                              const SizedBox(height: 20),
                              _buildMensualiteCard(fg, mt, cd, bd, dk),
                              const SizedBox(height: 24),
                              StbCard(
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                                gradient: const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF4C1D95)]),
                                child: GestureDetector(
                                  onTap: () {
                                    HapticFeedback.mediumImpact();
                                    StbBottomSheet.show(context, const _SimulationSheet());
                                  },
                                  child: Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(10),
                                        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), shape: BoxShape.circle),
                                        child: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 20),
                                      ),
                                      const SizedBox(width: 16),
                                      const Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text("Simuler un crédit (IA)", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: -0.3)),
                                            SizedBox(height: 4),
                                            Text("Calcul intelligent du taux optimal", style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
                                          ],
                                        ),
                                      ),
                                      const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white54, size: 14),
                                    ],
                                  ),
                                ),
                              ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.05),
                              const SizedBox(height: 24),
                              Row(
                                children: [
                                  Text("Détails Crédits", style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: -0.3)),
                                  const Spacer(),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppTheme.electricBlue.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Text(
                                      "${_credits.length} crédit${_credits.length > 1 ? 's' : ''}",
                                      style: const TextStyle(color: AppTheme.electricBlue, fontSize: 11, fontWeight: FontWeight.w700),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 14),
                              ..._credits.asMap().entries.map((e) => _buildCreditCard(e.key, e.value, fg, mt, cd, bd, dk)),
                              const SizedBox(height: 20),
                            ],
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }



  Widget _buildEmptyState(Color fg, Color mt, Color cd, Color bd, bool dk) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: cd,
                shape: BoxShape.circle,
                border: Border.all(color: bd, width: 2),
                boxShadow: AppTheme.cardShadow(dk),
              ),
              child: Icon(
                Icons.credit_card_off_rounded,
                size: 64,
                color: mt.withValues(alpha: 0.5),
              ),
            ).animate().scale(delay: 100.ms),
            const SizedBox(height: 24),
            Text(
              "Aucun Crédit",
              style: GoogleFonts.outfit(
                color: fg,
                fontSize: 24,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.5,
              ),
            ).animate().fadeIn(delay: 200.ms),
            const SizedBox(height: 12),
            Text(
              "Vous n'avez pas de crédits actifs pour le moment.\nUtilisez le simulateur ci-dessous pour faire une demande.",
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                color: mt,
                fontSize: 14,
                fontWeight: FontWeight.w500,
                height: 1.5,
              ),
            ).animate().fadeIn(delay: 300.ms),
            const SizedBox(height: 32),
            StbCard(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              gradient: const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF4C1D95)]),
              child: GestureDetector(
                onTap: () {
                  HapticFeedback.mediumImpact();
                  StbBottomSheet.show(context, const _SimulationSheet());
                },
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 16),
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Simuler un crédit (IA)",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.3,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          "Calcul intelligent du taux optimal",
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.1),
          ],
        ),
      ),
    );
  }

  Widget _buildGaugeCard(Color fg, Color mt, Color cd, Color bd, bool dk) {
    final pct = _totalMontant > 0 ? (_totalPaye / _totalMontant).clamp(0.0, 1.0) : 0.0;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: cd,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: bd),
        boxShadow: AppTheme.cardShadow(dk),
      ),
      child: Column(
        children: [
          // Custom Gauge
          SizedBox(
            height: 160,
            child: AnimatedBuilder(
              animation: _gaugeFill,
              builder: (_, __) {
                return CustomPaint(
                  size: const Size(double.infinity, 160),
                  painter: _GaugePainter(
                    paidFraction: pct * _gaugeFill.value,
                    totalFraction: 1.0,
                    dk: dk,
                  ),
                  child: Align(
                    alignment: const Alignment(0, 0.6),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          "${(_totalMontant / 1000).toStringAsFixed(0)}K TND",
                          style: GoogleFonts.inter(color: mt, fontSize: 13, fontWeight: FontWeight.w800),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          // Legend
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _legendDot(AppTheme.electricBlue, "Payé"),
              const SizedBox(width: 20),
              _legendDot(AppTheme.coralRed, "Encours"),
            ],
          ),
          const SizedBox(height: 20),
          // Stats Row
          Row(
            children: [
              Expanded(
                child: _statPill(
                  "${_totalPaye.toStringAsFixed(0)} TND",
                  "Total Payé",
                  AppTheme.electricBlue,
                  dk,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _statPill(
                  "${_totalEncours.toStringAsFixed(0)} TND",
                  "Encours",
                  AppTheme.coralRed,
                  dk,
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: 100.ms);
  }

  Widget _legendDot(Color color, String label) {
    return Row(
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w700)),
      ],
    );
  }

  Widget _statPill(String value, String label, Color color, bool dk) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: color.withValues(alpha: 0.7), fontSize: 10, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(value, style: GoogleFonts.inter(color: color, fontSize: 16, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }

  Widget _buildMensualiteCard(Color fg, Color mt, Color cd, Color bd, bool dk) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: dk
              ? [const Color(0xFF1A0533), const Color(0xFF0A0217)]
              : [const Color(0xFF7C3AED), const Color(0xFF5B21B6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: const Color(0xFF7C3AED).withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 8)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 52, height: 52,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.calendar_month_rounded, color: Colors.white, size: 26),
          ),
          const SizedBox(width: 18),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Total Mensualité", style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 0.3)),
                const SizedBox(height: 6),
                AnimatedBuilder(
                  animation: _counterAnim,
                  builder: (_, __) {
                    final val = _totalMensualite * _counterAnim.value;
                    return Text(
                      "${val.toStringAsFixed(0)} TND/mois",
                      style: GoogleFonts.inter(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                    );
                  },
                ),
              ],
            ),
          ),
          // Digit display
          _buildRollerDisplay(_totalMensualite.round()),
        ],
      ),
    ).animate().fadeIn(delay: 150.ms).slideX(begin: 0.05);
  }

  Widget _buildRollerDisplay(int value) {
    final digits = value.toString().split('').map(int.parse).toList();
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: digits.map((d) => Container(
        margin: const EdgeInsets.only(left: 3),
        width: 24,
        height: 32,
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.25),
          borderRadius: BorderRadius.circular(7),
          border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
        ),
        child: Center(
          child: Text(
            '$d',
            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
          ),
        ),
      )).toList(),
    );
  }

  Widget _buildCreditCard(int index, Map<String, dynamic> credit, Color fg, Color mt, Color cd, Color bd, bool dk) {
    final isExpanded = _expandedIndex == index;
    final color = Color(credit['color'] as int);
    final montant = credit['montant'] as double;
    final encours = credit['encours'] as double;
    final encoursPct = montant > 0 ? (encours / montant).clamp(0.0, 1.0) : 0.0;

    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        setState(() => _expandedIndex = isExpanded ? -1 : index);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeOutCubic,
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: cd,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: isExpanded ? color.withValues(alpha: 0.4) : bd),
          boxShadow: isExpanded
              ? [BoxShadow(color: color.withValues(alpha: 0.15), blurRadius: 20, offset: const Offset(0, 8))]
              : AppTheme.cardShadow(dk),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(Icons.account_balance_wallet_rounded, color: color, size: 22),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        credit['title'] as String,
                        style: TextStyle(color: fg, fontSize: 12, fontWeight: FontWeight.w800),
                        maxLines: 2,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "${montant.toStringAsFixed(0)} TND",
                        style: TextStyle(color: color, fontSize: 15, fontWeight: FontWeight.w900),
                      ),
                    ],
                  ),
                ),
                AnimatedRotation(
                  duration: const Duration(milliseconds: 300),
                  turns: isExpanded ? 0.5 : 0,
                  child: Icon(Icons.expand_more_rounded, color: mt, size: 24),
                ),
              ],
            ),
            const SizedBox(height: 14),
            // Progress bar
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Encours: ${encours.toStringAsFixed(3)} TND", style: TextStyle(color: mt, fontSize: 10, fontWeight: FontWeight.w600)),
                    Text("${((1 - encoursPct) * 100).toStringAsFixed(0)}% payé", style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w700)),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: 1 - encoursPct,
                    minHeight: 6,
                    backgroundColor: AppTheme.coralRed.withValues(alpha: 0.2),
                    color: color,
                  ),
                ),
              ],
            ),
            // Expanded Details
            AnimatedCrossFade(
              firstChild: const SizedBox.shrink(),
              secondChild: Padding(
                padding: const EdgeInsets.only(top: 18),
                child: Column(
                  children: [
                    Divider(color: bd, height: 1),
                    const SizedBox(height: 16),
                    _detailRow("Mensualité", "${(credit['mensualite'] as double).toStringAsFixed(3)} TND", fg, mt),
                    if ((credit['tauxInteret'] as double? ?? 0) > 0)
                      _detailRow("Taux d'intérêt", "${credit['tauxInteret']}%", fg, mt),
                    if ((credit['nombreMois'] as int? ?? 0) > 0)
                      _detailRow("Durée", "${credit['nombreMois']} mois", fg, mt),
                    _detailRow("Date Début", credit['debut'] as String, fg, mt),
                    _detailRow("Date Fin", credit['fin'] as String, fg, mt),
                    _detailRow("Montant Payé", "${(montant - encours).toStringAsFixed(3)} TND", fg, color),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () {
                              HapticFeedback.mediumImpact();
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => CreditDetailScreen(credit: credit),
                                ),
                              );
                            },
                            child: Container(
                              height: 42,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(colors: [color, color.withValues(alpha: 0.7)]),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: const Center(
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.visibility_rounded, color: Colors.white, size: 18),
                                    SizedBox(width: 8),
                                    Text("Voir Détails", style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              crossFadeState: isExpanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
              duration: const Duration(milliseconds: 300),
            ),
          ],
        ),
      ).animate().fadeIn(delay: (index * 80).ms),
    );
  }

  Widget _detailRow(String label, String value, Color fg, Color vc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: fg.withValues(alpha: 0.6), fontSize: 13, fontWeight: FontWeight.w500)),
          Text(value, style: TextStyle(color: vc, fontSize: 13, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _GaugePainter extends CustomPainter {
  final double paidFraction;
  final double totalFraction;
  final bool dk;

  _GaugePainter({required this.paidFraction, required this.totalFraction, required this.dk});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height * 0.85);
    final radius = size.width * 0.38;
    const strokeW = 16.0;
    const startAngle = math.pi;
    const sweepAngle = math.pi;

    // Background track (Unpaid portion: Coral Red)
    final bgPaint = Paint()
      ..shader = LinearGradient(
        colors: dk 
            ? [const Color(0xFFEF4444).withValues(alpha: 0.25), const Color(0xFFB91C1C).withValues(alpha: 0.25)]
            : [const Color(0xFFEF4444).withValues(alpha: 0.15), const Color(0xFFFCA5A5).withValues(alpha: 0.15)],
      ).createShader(Rect.fromCircle(center: center, radius: radius))
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeW
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle, sweepAngle, false, bgPaint,
    );

    // Paid arc (Gradient: Electric Blue to Turquoise)
    final rect = Rect.fromCircle(center: center, radius: radius);
    final paidPaint = Paint()
      ..shader = const SweepGradient(
        colors: [Color(0xFF2962FF), Color(0xFF00BFA5)],
        startAngle: startAngle,
        endAngle: startAngle + sweepAngle,
      ).createShader(rect)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeW
      ..strokeCap = StrokeCap.round;

    // Glowing shadow underneath paid arc
    final shadowPaint = Paint()
      ..shader = const SweepGradient(
        colors: [Color(0xFF2962FF), Color(0xFF00BFA5)],
        startAngle: startAngle,
        endAngle: startAngle + sweepAngle,
      ).createShader(rect)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeW + 6
      ..strokeCap = StrokeCap.round;

    // Draw shadow first
    canvas.drawArc(
      rect,
      startAngle, sweepAngle * paidFraction, false, shadowPaint,
    );

    // Draw active arc
    canvas.drawArc(
      rect,
      startAngle, sweepAngle * paidFraction, false, paidPaint,
    );

    // Orb Pointer Knob at the end of the paid arc
    final knobAngle = startAngle + sweepAngle * paidFraction;
    final knobCenter = Offset(
      center.dx + radius * math.cos(knobAngle),
      center.dy + radius * math.sin(knobAngle),
    );

    // Glow for pointer knob
    final knobGlowPaint = Paint()
      ..color = const Color(0xFF00BFA5).withValues(alpha: 0.5)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);
    canvas.drawCircle(knobCenter, 12, knobGlowPaint);

    // Solid outer pointer knob
    canvas.drawCircle(knobCenter, 7, Paint()..color = Colors.white);
    canvas.drawCircle(knobCenter, 3.5, Paint()..color = const Color(0xFF00BFA5));

    // Center display backdrop
    final innerRadius = radius - strokeW / 2 - 8;
    final centerBackPaint = Paint()
      ..color = dk ? Colors.white.withValues(alpha: 0.03) : Colors.black.withValues(alpha: 0.015)
      ..style = PaintingStyle.fill;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: innerRadius),
      startAngle, sweepAngle, true, centerBackPaint,
    );

    // Paid percentage text in center of gauge
    final textPainter = TextPainter(
      text: TextSpan(
        text: "${(paidFraction * 100).toStringAsFixed(0)}%",
        style: GoogleFonts.inter(
          color: dk ? Colors.white : const Color(0xFF0F172A),
          fontSize: 32,
          fontWeight: FontWeight.w900,
          letterSpacing: -0.5,
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    textPainter.layout();
    textPainter.paint(
      canvas,
      Offset(center.dx - textPainter.width / 2, center.dy - textPainter.height - 20),
    );

    final subtextPainter = TextPainter(
      text: const TextSpan(
        text: "PAYÉ",
        style: TextStyle(
          color: Color(0xFF00BFA5),
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.5,
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    subtextPainter.layout();
    subtextPainter.paint(
      canvas,
      Offset(center.dx - subtextPainter.width / 2, center.dy - 10),
    );
  }

  @override
  bool shouldRepaint(covariant _GaugePainter oldDelegate) =>
      oldDelegate.paidFraction != paidFraction;
}

class _SimulationSheet extends StatefulWidget {
  const _SimulationSheet();

  @override
  State<_SimulationSheet> createState() => _SimulationSheetState();
}

class _SimulationSheetState extends State<_SimulationSheet> {
  double _montant = 15000;
  int _duree = 24;

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final fg = Theme.of(context).colorScheme.onSurface;
    final cd = Theme.of(context).cardColor;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final bd = dk
        ? Colors.white.withValues(alpha: 0.1)
        : Colors.black.withValues(alpha: 0.05);

    // Mock AI Calculation
    final taux = 7.5 - (_duree / 12) * 0.1;
    final monthly = (_montant * (1 + (taux / 100))) / _duree;

    return Container(
      decoration: BoxDecoration(
        color: dk ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 40,
            offset: const Offset(0, -10),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 40),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 5,
              decoration: BoxDecoration(
                color: mt.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(2.5),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF7C3AED).withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.auto_awesome_rounded,
                  color: Color(0xFF7C3AED),
                  size: 22,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Simulation IA",
                      style: TextStyle(
                        color: fg,
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.5,
                      ),
                    ),
                    Text(
                      "Optimisation personnalisée du taux",
                      style: TextStyle(
                        color: mt,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          Text(
            "Montant souhaité: ${_montant.toInt()} TND",
            style: TextStyle(
              color: fg,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          SliderTheme(
            data: SliderThemeData(
              activeTrackColor: const Color(0xFF7C3AED),
              inactiveTrackColor: const Color(
                0xFF7C3AED,
              ).withValues(alpha: 0.2),
              thumbColor: const Color(0xFF7C3AED),
              overlayColor: const Color(0xFF7C3AED).withValues(alpha: 0.1),
              trackHeight: 6,
            ),
            child: Slider(
              value: _montant,
              min: 1000,
              max: 50000,
              divisions: 49,
              onChanged: (v) => setState(() => _montant = v),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            "Durée: $_duree mois",
            style: TextStyle(
              color: fg,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          SliderTheme(
            data: SliderThemeData(
              activeTrackColor: AppTheme.electricBlue,
              inactiveTrackColor: AppTheme.electricBlue.withValues(alpha: 0.2),
              thumbColor: AppTheme.electricBlue,
              overlayColor: AppTheme.electricBlue.withValues(alpha: 0.1),
              trackHeight: 6,
            ),
            child: Slider(
              value: _duree.toDouble(),
              min: 6,
              max: 84,
              divisions: 78,
              onChanged: (v) => setState(() => _duree = v.toInt()),
            ),
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: cd,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: bd),
              boxShadow: AppTheme.cardShadow(dk),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Taux proposé (IA)",
                      style: TextStyle(
                        color: mt,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      "${taux.toStringAsFixed(2)}%",
                      style: GoogleFonts.inter(
                        color: AppTheme.emerald,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  child: Divider(height: 1),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Mensualité estimée",
                      style: TextStyle(
                        color: mt,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    TweenAnimationBuilder<double>(
                      tween: Tween<double>(begin: 0, end: monthly),
                      duration: const Duration(milliseconds: 600),
                      curve: Curves.easeOutExpo,
                      builder: (context, value, _) {
                        return Text(
                          "${value.toStringAsFixed(0)} TND",
                          style: GoogleFonts.inter(
                            color: fg,
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ],
            ),
          ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1),
          const SizedBox(height: 24),
          StbButton(
            label: "Demande Instantanée (IA)",
            icon: Icons.fingerprint_rounded,
            onTap: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text("Authentification biométrique réussie. Demande envoyée !"),
                  backgroundColor: AppTheme.emerald,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
