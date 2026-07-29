import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../rh/ai_leave_planner_screen.dart';
import '../analytics/ai_spending_screen.dart';
import '../analytics/bill_scanner_screen.dart';
import 'copilot_chat_screen.dart';
import 'ai_predictions_screen.dart';

class CopilotScreen extends StatefulWidget {
  const CopilotScreen({super.key});

  @override
  State<CopilotScreen> createState() => _CopilotScreenState();
}

class _CopilotScreenState extends State<CopilotScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;

  // 'screen' key removed — built dynamically in _onFeatureTap so we can pass real provider data
  final List<Map<String, dynamic>> _features = [
    {
      'icon': Icons.event_available_rounded,
      'gradient': [const Color(0xFF10B981), const Color(0xFF059669)],
      'title': 'Planificateur de Congés',
      'subtitle': 'Optimisez vos dates avec l\'IA',
      'tag': 'Actif',
      'tagColor': const Color(0xFF10B981),
      'index': 0,
    },
    {
      'icon': Icons.insights_rounded,
      'gradient': [const Color(0xFF00E5FF), const Color(0xFF00B4DB)],
      'title': 'Analyse des Dépenses',
      'subtitle': 'Insights prédictifs sur vos finances',
      'tag': 'Actif',
      'tagColor': const Color(0xFF00B4DB),
      'index': 1,
    },
    {
      'icon': Icons.psychology_rounded,
      'gradient': [const Color(0xFF2962FF), const Color(0xFF1D4ED8)],
      'title': 'Chat Assistant RH & Financier',
      'subtitle': 'Posez vos questions en temps réel',
      'tag': 'Actif',
      'tagColor': const Color(0xFF2962FF),
      'index': 2,
    },
    {
      'icon': Icons.document_scanner_rounded,
      'gradient': [const Color(0xFFF59E0B), const Color(0xFFD97706)],
      'title': 'Scan de Documents',
      'subtitle': 'Scan OCR & extrait de factures',
      'tag': 'Actif',
      'tagColor': const Color(0xFFF59E0B),
      'index': 3,
    },
    {
      'icon': Icons.trending_up_rounded,
      'gradient': [const Color(0xFFEF4444), const Color(0xFFDC2626)],
      'title': 'Prédictions Financières',
      'subtitle': 'Anticipez vos dépenses futures',
      'tag': 'Actif',
      'tagColor': const Color(0xFFEF4444),
      'index': 4,
    },
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _onFeatureTap(int index) {
    HapticFeedback.lightImpact();
    final p = Provider.of<AppProvider>(context, listen: false);
    final Widget screen;
    switch (index) {
      case 0:
        screen = AILeavePlannerScreen(remainingDays: p.soldeConges);
        break;
      case 1:
        screen = const AISpendingScreen();
        break;
      case 2:
        screen = const CopilotChatScreen();
        break;
      case 3:
        screen = const BillScannerScreen();
        break;
      case 4:
      default:
        screen = const AIPredictionsScreen();
        break;
    }
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<AppProvider>();
    final dk = prov.themeMode == ThemeMode.dark;

    return Scaffold(
      body: Stack(
        children: [
          // Background Gradient
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: dk
                      ? [
                          const Color(0xFF020617),
                          const Color(0xFF0A1930),
                          const Color(0xFF020617),
                        ]
                      : [
                          const Color(0xFFF8FAFC),
                          const Color(0xFFE2E8F0).withValues(alpha: 0.5),
                          const Color(0xFFF8FAFC),
                        ],
                ),
              ),
            ),
          ),
          // Subtle STB watermark
          Positioned(
            right: -100,
            bottom: -50,
            child: Icon(
              Icons.account_balance_rounded,
              size: 450,
              color: dk 
                  ? Colors.white.withValues(alpha: 0.02)
                  : const Color(0xFF0D47A1).withValues(alpha: 0.03),
            ),
          ),
          CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              // ── HERO HEADER (FIXED OVERFLOW) ──────────────────────────────
          SliverToBoxAdapter(
            child: _buildHeroHeader(dk),
          ),

          // ── STATS BANNER ─────────────────────────────────────────────
          SliverToBoxAdapter(
            child: _buildStatsBanner(dk).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2),
          ),

          // ── SECTION TITLE ────────────────────────────────────────────
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
            sliver: SliverToBoxAdapter(
              child: Row(
                children: [
                  Container(
                    width: 4,
                    height: 20,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF2962FF), Color(0xFFF59E0B)],
                      ),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Assistants Intelligents',
                    style: TextStyle(
                      fontSize: 19,
                      fontWeight: FontWeight.w800,
                      color: dk ? Colors.white : const Color(0xFF0F172A),
                      letterSpacing: -0.4,
                    ),
                  ),
                ],
              ).animate().fadeIn(delay: 300.ms),
            ),
          ),

          // ── FEATURES LIST (ALL ACTIVE) ───────────────────────────────
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (ctx, i) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _buildFeatureCard(dk, _features[i])
                      .animate()
                      .fadeIn(delay: Duration(milliseconds: 350 + i * 70))
                      .slideY(begin: 0.15),
                ),
                childCount: _features.length,
              ),
            ),
          ),

          // ── ABOUT CARD ───────────────────────────────────────────────
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
            sliver: SliverToBoxAdapter(
              child: _buildAboutCard(dk)
                  .animate()
                  .fadeIn(delay: 700.ms)
                  .slideY(begin: 0.15),
            ),
          ),
        ],
      ),
      ],
      ),
    );
  }

  // ── HERO HEADER (NO OVERFLOW) ───────────────────────────────────────────────
  Widget _buildHeroHeader(bool dk) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 20,
        left: 20,
        right: 20,
        bottom: 30,
      ),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF0D47A1), Color(0xFF2962FF), Color(0xFF060D1A)],
          stops: [0.0, 0.6, 1.0],
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(36),
          bottomRight: Radius.circular(36),
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2962FF).withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            right: -40,
            top: -20,
            child: Icon(
              Icons.account_balance_rounded,
              size: 160,
              color: Colors.white.withValues(alpha: 0.05),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
            children: [
              AnimatedBuilder(
                animation: _pulseController,
                builder: (_, __) {
                  return Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF00E5FF).withValues(
                              alpha: 0.2 + _pulseController.value * 0.4),
                          blurRadius: 20,
                          spreadRadius: 4,
                        ),
                        BoxShadow(
                          color: const Color(0xFFF59E0B).withValues(
                              alpha: 0.15 + _pulseController.value * 0.3),
                          blurRadius: 30,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(8),
                    child: Center(
                      child: Image.asset(
                        'public/logo for splash.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(width: 14),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'STB Copilot',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'AI Powered',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text(
            'Votre assistant intelligent\npour les décisions bancaires & RH',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white70,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.12),
              ),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 14),
                SizedBox(width: 8),
                Text(
                  'Système opérationnel · 5 Modèles IA actifs',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      ],
      ),
    );
  }

  // ── STATS BANNER ─────────────────────────────────────────────────────────
  Widget _buildStatsBanner(bool dk) {
    final stats = [
      {'label': 'Assistants', 'value': '5', 'icon': Icons.smart_toy_rounded},
      {'label': 'Actifs', 'value': '5', 'icon': Icons.check_circle_rounded},
      {'label': 'Précision', 'value': '98%', 'icon': Icons.gps_fixed_rounded},
    ];
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: BoxDecoration(
        color: dk ? const Color(0xFF0F1B2D) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFFF59E0B).withValues(alpha: 0.4),
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: stats.map((s) {
          final isLast = s == stats.last;
          return Expanded(
            child: Container(
              decoration: isLast
                  ? null
                  : BoxDecoration(
                      border: Border(
                        right: BorderSide(
                          color: dk
                              ? Colors.white.withValues(alpha: 0.08)
                              : const Color(0xFFE2E8F0),
                        ),
                      ),
                    ),
              child: Column(
                children: [
                  Icon(s['icon'] as IconData,
                      color: const Color(0xFF2962FF), size: 20),
                  const SizedBox(height: 4),
                  Text(
                    s['value'] as String,
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: dk ? Colors.white : const Color(0xFF0F172A),
                    ),
                  ),
                  Text(
                    s['label'] as String,
                    style: TextStyle(
                      fontSize: 11,
                      color: dk ? Colors.white54 : Colors.black45,
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ── FEATURE CARD ─────────────────────────────────────────────────────────
  Widget _buildFeatureCard(bool dk, Map<String, dynamic> f) {
    final gradient = f['gradient'] as List<Color>;

    return GestureDetector(
      onTap: () => _onFeatureTap(f['index'] as int),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: dk ? const Color(0xFF0F1B2D) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: gradient[0].withValues(alpha: 0.4),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: gradient[0].withValues(alpha: dk ? 0.2 : 0.12),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: gradient,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: gradient[0].withValues(alpha: 0.35),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Icon(
                f['icon'] as IconData,
                color: Colors.white,
                size: 26,
              ),
            ),
            const SizedBox(width: 14),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          f['title'] as String,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: dk ? Colors.white : const Color(0xFF0F172A),
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: (f['tagColor'] as Color).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          f['tag'] as String,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: f['tagColor'] as Color,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    f['subtitle'] as String,
                    style: TextStyle(
                      fontSize: 12,
                      color: dk ? Colors.white54 : Colors.black45,
                    ),
                  ),
                ],
              ),
            ),

            Icon(
              Icons.arrow_forward_ios_rounded,
              color: gradient[0],
              size: 16,
            ),
          ],
        ),
      ),
    );
  }

  // ── ABOUT CARD ────────────────────────────────────────────────────────────
  Widget _buildAboutCard(bool dk) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: dk ? const Color(0xFF0F1B2D) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFF2962FF).withValues(alpha: 0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF2962FF).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.auto_awesome_rounded,
                  color: Color(0xFF2962FF),
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'À propos de STB Copilot',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: dk ? Colors.white : const Color(0xFF0F172A),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'STB Copilot est votre assistant IA personnel pour vos opérations bancaires et RH. Il analyse vos données en temps réel pour vous aider à prendre les meilleures décisions.',
            style: TextStyle(
              fontSize: 12,
              color: dk ? Colors.white60 : Colors.black54,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ['Privé & Sécurisé', 'Temps réel', 'ML Intégré'].map((tag) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF2962FF).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFF2962FF).withValues(alpha: 0.2),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.check_circle_rounded,
                        color: Color(0xFF2962FF), size: 12),
                    const SizedBox(width: 4),
                    Text(
                      tag,
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF2962FF),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
