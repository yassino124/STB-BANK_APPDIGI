import 'dart:math' as math;
import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import 'conge_screen.dart';
import 'avance_screen.dart';
import 'credit_screen.dart';
import 'carte_screen.dart';
import '../analytics/analytics_screen.dart';
import 'amicale_screen.dart';
import 'documents_screen.dart';
import '../../core/navigation/app_router.dart';

/// ─────────────────────────────────────────────────────────────────────────
/// DESIGN TOKENS
/// A restrained, "private bank" palette: deep navy + brushed gold as the
/// identity, graphite for the premium credit surface, and a small set of
/// muted accent hues used only as icon tints — never as full card fills.
/// This keeps the screen coherent instead of reading as a rainbow of
/// unrelated gradients.
/// ─────────────────────────────────────────────────────────────────────────
class _Palette {
  static const navyDeep = Color(0xFF041021);
  static const navyMid = Color(0xFF0A2540);
  static const navySoft = Color(0xFF143B66);
  static const stbBlue = Color(0xFF0055A5);
  static const stbCyan = Color(0xFF00A3E0);
  static const gold = Color(0xFFD4AF37);
  static const goldLight = Color(0xFFF7E7B4);
  static const graphite = Color(0xFF1A1C23);
  static const graphiteSoft = Color(0xFF282B36);
  static const teal = Color(0xFF00BFA5);
  static const violet = Color(0xFF5C6BC0);
  static const amber = Color(0xFFFFA000);
  static const rose = Color(0xFFE91E63);
  static const emerald = Color(0xFF10B981);
}

class RHHubScreen extends StatefulWidget {
  const RHHubScreen({super.key});
  @override
  State<RHHubScreen> createState() => _RHHubScreenState();
}

class _RHHubScreenState extends State<RHHubScreen> with TickerProviderStateMixin {
  late AnimationController _pulseCtrl;
  late AnimationController _floatCtrl;
  static final Map<String, Uint8List> _avatarBytesCache = {};

  ImageProvider? _getAvatarImageProvider(String? avatarUrl) {
    if (avatarUrl == null || avatarUrl.isEmpty) return null;
    try {
      if (avatarUrl.startsWith('data:image')) {
        final base64String = avatarUrl.split(',')[1];
        Uint8List bytes;
        if (_avatarBytesCache.containsKey(base64String)) {
          bytes = _avatarBytesCache[base64String]!;
        } else {
          bytes = base64Decode(base64String);
          _avatarBytesCache[base64String] = bytes;
        }
        return MemoryImage(bytes);
      }
      return NetworkImage(avatarUrl);
    } catch (_) {
      return null;
    }
  }

  String _formatCreditAmount(List<dynamic> credits) {
    if (credits.isEmpty) return '0';
    double total = 0.0;
    for (var credit in credits) {
      if (credit['status'] == 'ACTIVE') {
        final amount = (credit['montantRestant'] as num?)?.toDouble() ?? 0.0;
        total += amount;
      }
    }
    // Format in K for thousands (e.g., 10000 → 10K) with proper rounding
    if (total >= 1000) {
      return '${(total / 1000).round()}K';
    }
    return total.round().toString();
  }

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 4))..repeat(reverse: true);
    _floatCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 6))..repeat(reverse: true);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final p = context.read<AppProvider>();
      p.fetchProfile();
      p.fetchCredits();
    });
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _floatCtrl.dispose();
    super.dispose();
  }

  void _goto(Widget screen, {bool modal = false}) {
    if (modal) {
      AppRouter.pushModal(context, screen);
    } else {
      AppRouter.push(context, screen);
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final fg = Theme.of(context).colorScheme.onSurface;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.08) : const Color(0xFFE2E8F0);

    return Scaffold(
      backgroundColor: dk ? _Palette.navyDeep : const Color(0xFFF4F7FA),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(child: _buildHeader(dk)),
          SliverToBoxAdapter(child: _buildStatsRow(dk, fg, mt, cd, bd)),
          SliverToBoxAdapter(child: _buildSectionTitle("Services RH", fg, mt)),
          SliverToBoxAdapter(child: _buildServiceGrid(dk, fg, mt, cd, bd)),
          SliverToBoxAdapter(child: _buildInfoSection(
            dk: dk, fg: fg, mt: mt, cd: cd, bd: bd,
            accent: _Palette.gold,
            icon: Icons.workspace_premium_rounded,
            image: 'public/capital_humain_banner.png',
            title: "Gestion du Capital Humain",
            subtitle: "Du recrutement à la retraite",
            body: "Le suivi complet de votre parcours professionnel : congés, "
                "autorisations, avancement et paie, traités en ligne de bout en bout.",
            chips: const [
              ('Congés & Autorisations', Icons.beach_access_rounded, _Palette.teal),
              ('Avancement & Mutations', Icons.trending_up_rounded, _Palette.stbBlue),
              ('Gestion de la Paie', Icons.account_balance_wallet_rounded, _Palette.amber),
            ],
            ctaLabel: "Gérer mon cursus en ligne",
            ctaIcon: Icons.arrow_forward_rounded,
            ctaGradient: const [_Palette.navyMid, _Palette.stbBlue],
          )),
          SliverToBoxAdapter(child: _buildInfoSection(
            dk: dk, fg: fg, mt: mt, cd: cd, bd: bd,
            accent: _Palette.emerald,
            icon: Icons.volunteer_activism_rounded,
            image: 'public/bien_etre_social_banner.png',
            title: "Bien-être Social",
            subtitle: "Actions sociales & épanouissement",
            body: "Des solutions concrètes pour améliorer votre quotidien au travail : "
                "prêts sociaux, couverture santé et accompagnement familial.",
            chips: const [
              ('Prêts Sociaux', Icons.handshake_rounded, _Palette.emerald),
              ('Santé & Assurance', Icons.health_and_safety_rounded, _Palette.rose),
              ('Aide Familiale', Icons.family_restroom_rounded, _Palette.amber),
            ],
            ctaLabel: "Accéder aux avantages sociaux",
            ctaIcon: Icons.favorite_rounded,
            ctaGradient: const [Color(0xFF059669), _Palette.emerald],
          )),
          SliverToBoxAdapter(child: _buildSectionTitle(
            "Amicale STB · Voyages & Offres", fg, mt,
            actionLabel: "Voir tout",
            onAction: () => _goto(const AmicaleScreen()),
          )),
          SliverToBoxAdapter(child: _AmicaleCarousel(dk: dk, mt: mt)),
          SliverToBoxAdapter(child: _buildSectionTitle("Activité Récente", fg, mt)),
          SliverToBoxAdapter(child: _buildActivityFeed(dk, fg, mt, cd, bd)),
          const SliverToBoxAdapter(child: SizedBox(height: 110)),
        ],
      ),
    );
  }

  // ── HERO HEADER ──────────────────────────────────────────────────────────
  Widget _buildHeader(bool dk) {
    final p = Provider.of<AppProvider>(context);
    final user = p.userProfile;

    return Column(
      children: [
        SafeArea(
          bottom: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                GestureDetector(
                  onTap: () {
                    HapticFeedback.lightImpact();
                    context.findRootAncestorStateOfType<ScaffoldState>()?.openDrawer();
                  },
                  child: _glassIconButton(Icons.menu_rounded, dk),
                ),
                Image.asset('public/Logo_STB.png', height: 26, fit: BoxFit.contain),
                _glassIconButton(Icons.notifications_outlined, dk, dot: true),
              ],
            ),
          ),
        ),
        Container(
          margin: const EdgeInsets.fromLTRB(16, 14, 16, 18),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(32),
            border: Border.all(color: _Palette.gold.withValues(alpha: 0.35), width: 1.2),
            boxShadow: [
              BoxShadow(color: _Palette.navyDeep.withValues(alpha: 0.4), blurRadius: 36, offset: const Offset(0, 16)),
              BoxShadow(color: _Palette.gold.withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, 4)),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(32),
            child: Stack(
              children: [
                Positioned.fill(
                  child: Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [_Palette.navyDeep, Color(0xFF0C2B54), _Palette.navyMid],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                  ),
                ),
                // Subtle engraved STB geometrical line art
                Positioned.fill(
                  child: AnimatedBuilder(
                    animation: _floatCtrl,
                    builder: (_, __) => CustomPaint(painter: _EngravedLinesPainter(_floatCtrl.value)),
                  ),
                ),
                // STB Emblem watermark top right
                Positioned(
                  right: -10, top: -10,
                  child: Container(
                    width: 140, height: 140,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withValues(alpha: 0.03),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(22, 22, 22, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          _buildAvatar(user),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  user != null ? "${user['prenom']} ${user['nom']}" : "Chargement…",
                                  style: GoogleFonts.outfit(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800, letterSpacing: -0.4),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    Expanded(
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withValues(alpha: 0.1),
                                          borderRadius: BorderRadius.circular(8),
                                          border: Border.all(color: _Palette.gold.withValues(alpha: 0.4), width: 1),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            const Icon(Icons.verified_user_rounded, color: _Palette.gold, size: 12),
                                            const SizedBox(width: 5),
                                            Expanded(
                                              child: Text(
                                                user != null ? "${user['matricule']} · ${user['poste'] ?? 'Employé'}" : "···",
                                                style: GoogleFonts.inter(color: _Palette.goldLight, fontSize: 10.5, fontWeight: FontWeight.w700, letterSpacing: 0.2),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          // STB Bank Badge Button
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: _Palette.gold.withValues(alpha: 0.4)),
                            ),
                            child: const Icon(Icons.account_balance_rounded, color: _Palette.gold, size: 22),
                          ),
                        ],
                      ).animate().fadeIn(duration: 450.ms),
                      const SizedBox(height: 20),
                      Container(height: 1, color: Colors.white.withValues(alpha: 0.1)),
                      const SizedBox(height: 16),
                      // Mini stats in clean glass cards
                      Row(
                        children: [
                          _miniStat("${user?['soldeConges'] ?? 0} j", "Congé", Icons.beach_access_rounded, _Palette.teal),
                          const SizedBox(width: 8),
                          _miniStat(
                            "${_formatCreditAmount(p.credits)} TND", 
                            "Crédits", 
                            Icons.account_balance_wallet_rounded, 
                            _Palette.amber
                          ),
                          const SizedBox(width: 8),
                          _miniStat("${user?['prime'] ?? 0} TND", "Prime", Icons.star_rounded, _Palette.gold),
                        ],
                      ).animate().fadeIn(delay: 100.ms),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ).animate().fadeIn(duration: 550.ms).slideY(begin: -0.03),
      ],
    );
  }

  Widget _glassIconButton(IconData icon, bool dk, {bool dot = false}) {
    return Container(
      width: 44, height: 44,
      decoration: BoxDecoration(
        color: dk ? Colors.white.withValues(alpha: 0.08) : Colors.white,
        shape: BoxShape.circle,
        border: Border.all(color: dk ? Colors.white.withValues(alpha: 0.12) : const Color(0xFFE2E8F0)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: dk ? 0.25 : 0.06), blurRadius: 12, offset: const Offset(0, 3))],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Icon(icon, color: dk ? Colors.white : const Color(0xFF0F172A), size: 20),
          if (dot)
            Positioned(
              top: 11, right: 12,
              child: Container(
                width: 8, height: 8,
                decoration: BoxDecoration(color: _Palette.rose, shape: BoxShape.circle, border: Border.all(color: dk ? _Palette.navyDeep : Colors.white, width: 1.5)),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildAvatar(Map<String, dynamic>? user) {
    final avatarProvider = _getAvatarImageProvider(user?['avatar']);
    final initials = user != null && user['prenom'] != null && user['nom'] != null
        ? '${user['prenom'][0]}${user['nom'][0]}'.toUpperCase()
        : '?';

    Widget fallback() => Container(
          width: 58, height: 58,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(colors: [_Palette.gold, Color(0xFFB4924A)]),
          ),
          child: Center(
            child: Text(initials, style: GoogleFonts.outfit(color: _Palette.navyDeep, fontSize: 20, fontWeight: FontWeight.w800)),
          ),
        );

    return Stack(
      children: [
        Container(
          padding: const EdgeInsets.all(2.5),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(colors: [_Palette.gold, _Palette.stbCyan]),
            boxShadow: [BoxShadow(color: _Palette.gold.withValues(alpha: 0.3), blurRadius: 10)],
          ),
          child: avatarProvider == null
              ? fallback()
              : ClipOval(
                  child: SizedBox(
                    width: 58, height: 58,
                    child: Image(
                      key: ValueKey(user?['avatar']?.hashCode ?? 0),
                      image: avatarProvider,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => fallback(),
                    ),
                  ),
                ),
        ),
        Positioned(
          bottom: 2, right: 2,
          child: Container(
            width: 13, height: 13,
            decoration: BoxDecoration(
              color: _Palette.emerald,
              shape: BoxShape.circle,
              border: Border.all(color: _Palette.navyDeep, width: 2),
            ),
          ),
        ),
      ],
    );
  }

  Widget _miniStat(String value, String label, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 11),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, color: color, size: 16),
                Container(
                  width: 5, height: 5,
                  decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(value, style: GoogleFonts.outfit(color: Colors.white, fontSize: 14.5, fontWeight: FontWeight.w800, letterSpacing: -0.2)),
            const SizedBox(height: 1),
            Text(label, style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.65), fontSize: 10, fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }

  // ── STATS ROW ──────────────────────────────────────────────────────────
  Widget _buildStatsRow(bool dk, Color fg, Color mt, Color cd, Color bd) {
    final p = Provider.of<AppProvider>(context);
    final solde = p.compteSolde;
    
    // ✅ Calculate total encours from REAL credits collection
    double totalEncours = 0.0;
    for (var credit in p.credits) {
      if (credit['status'] == 'ACTIVE') {
        totalEncours += (credit['montantRestant'] as num?)?.toDouble() ?? 0.0;
      }
    }
    
    final items = [
      {'label': 'Compte Chèque', 'value': solde >= 0 ? '+${solde.toStringAsFixed(3)}' : solde.toStringAsFixed(3), 'unit': 'TND', 'color': solde >= 0 ? _Palette.emerald : _Palette.rose, 'icon': Icons.account_balance_rounded},
      {'label': 'Total Encours', 'value': totalEncours.toStringAsFixed(3), 'unit': 'TND', 'color': _Palette.amber, 'icon': Icons.pie_chart_rounded},
      {'label': 'Solde Congés', 'value': '${p.soldeConges}', 'unit': 'j', 'color': _Palette.teal, 'icon': Icons.beach_access_rounded},
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 4),
      child: Row(
        children: items.asMap().entries.map((e) {
          final item = e.value;
          final color = item['color'] as Color;
          return Expanded(
            child: Container(
              margin: EdgeInsets.only(right: e.key < 2 ? 10 : 0),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: cd,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: bd),
                boxShadow: [BoxShadow(color: dk ? Colors.black.withValues(alpha: 0.25) : Colors.black.withValues(alpha: 0.03), blurRadius: 18, offset: const Offset(0, 8))],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(item['icon'] as IconData, color: color, size: 17),
                  const SizedBox(height: 10),
                  RichText(text: TextSpan(children: [
                    TextSpan(text: item['value'] as String, style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w800)),
                    TextSpan(text: " ${item['unit']}", style: TextStyle(color: mt, fontSize: 8, fontWeight: FontWeight.w700)),
                  ])),
                  const SizedBox(height: 2),
                  Text(item['label'] as String, style: TextStyle(color: mt, fontSize: 9, fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis),
                ],
              ),
            ).animate().fadeIn(delay: (e.key * 80).ms).slideY(begin: 0.06),
          );
        }).toList(),
      ),
    );
  }

  // ── SECTION TITLE ────────────────────────────────────────────────────────
  Widget _buildSectionTitle(String title, Color fg, Color mt, {String? actionLabel, VoidCallback? onAction}) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 26, 20, 14),
      child: Row(children: [
        Container(
          width: 3, height: 18,
          decoration: BoxDecoration(color: _Palette.gold, borderRadius: BorderRadius.circular(2)),
        ),
        const SizedBox(width: 10),
        Expanded(child: Text(title, style: TextStyle(color: fg, fontSize: 17, fontWeight: FontWeight.w800, letterSpacing: -0.3))),
        if (actionLabel != null && onAction != null)
          GestureDetector(
            onTap: onAction,
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Text(actionLabel, style: const TextStyle(color: AppTheme.electricBlue, fontSize: 12.5, fontWeight: FontWeight.w700)),
              const Icon(Icons.chevron_right_rounded, color: AppTheme.electricBlue, size: 16),
            ]),
          ),
      ]),
    );
  }

  // ── SERVICE GRID ─────────────────────────────────────────────────────────
  // Two feature tiles carry the color story (navy + gold, graphite);
  // the remaining utilities stay on clean neutral surfaces with a single
  // tinted icon chip — the vocabulary international bank apps use for
  // secondary actions, so the grid doesn't compete with the hero.
  Widget _buildServiceGrid(bool dk, Color fg, Color mt, Color cd, Color bd) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(children: [
        Row(children: [
          Expanded(
            child: _FeatureCard(
              title: 'Mes Congés',
              subtitle: '60 jours restants',
              icon: Icons.beach_access_rounded,
              gradient: const [_Palette.teal, Color(0xFF0B7873)],
              height: 138,
              onTap: () => _goto(const CongeScreen()),
            ).animate().fadeIn(delay: 100.ms).scale(begin: const Offset(0.95, 0.95)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _FeatureCard(
              title: 'Avance',
              subtitle: 'Salaire · Prime · Aïd',
              icon: Icons.payments_rounded,
              gradient: const [_Palette.violet, Color(0xFF4B3EA8)],
              height: 138,
              onTap: () => _goto(const AvanceScreen()),
            ).animate().fadeIn(delay: 160.ms).scale(begin: const Offset(0.95, 0.95)),
          ),
        ]),
        const SizedBox(height: 12),
        _CreditFeaturedCard(onTap: () => _goto(const CreditScreen())).animate().fadeIn(delay: 220.ms).slideY(begin: 0.05),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(
            child: _UtilityCard(
              title: 'Carte & Certif',
              subtitle: 'Badge numérique',
              icon: Icons.badge_rounded,
              color: _Palette.navySoft,
              cd: cd, bd: bd, dk: dk, fg: fg, mt: mt,
              onTap: () => _goto(const CarteScreen()),
            ).animate().fadeIn(delay: 280.ms).slideY(begin: 0.06),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _UtilityCard(
              title: 'Analytics',
              subtitle: 'Dépenses & IA',
              icon: Icons.insights_rounded,
              color: _Palette.rose,
              cd: cd, bd: bd, dk: dk, fg: fg, mt: mt,
              onTap: () => _goto(const AnalyticsScreen()),
            ).animate().fadeIn(delay: 340.ms).slideY(begin: 0.06),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _UtilityCard(
              title: 'Documents',
              subtitle: 'Fiches de paie',
              icon: Icons.description_rounded,
              color: _Palette.emerald,
              cd: cd, bd: bd, dk: dk, fg: fg, mt: mt,
              onTap: () => _goto(const DocumentsScreen()),
            ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.06),
          ),
        ]),
      ]),
    );
  }

  // ── SHARED INFO SECTION (Capital Humain / Bien-être) ────────────────────
  Widget _buildInfoSection({
    required bool dk,
    required Color fg,
    required Color mt,
    required Color cd,
    required Color bd,
    required Color accent,
    required IconData icon,
    required String image,
    required String title,
    required String subtitle,
    required String body,
    required List<(String, IconData, Color)> chips,
    required String ctaLabel,
    required IconData ctaIcon,
    required List<Color> ctaGradient,
  }) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Container(
        decoration: BoxDecoration(
          color: cd,
          borderRadius: BorderRadius.circular(26),
          border: Border.all(color: bd),
          boxShadow: [BoxShadow(color: dk ? Colors.black.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.035), blurRadius: 20, offset: const Offset(0, 10))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 14),
              child: Row(children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: accent.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(14)),
                  child: Icon(icon, color: accent, size: 19),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: GoogleFonts.outfit(color: fg, fontSize: 15.5, fontWeight: FontWeight.w800, letterSpacing: -0.3)),
                      const SizedBox(height: 2),
                      Text(subtitle, style: GoogleFonts.inter(color: mt, fontSize: 10, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ]),
            ),
            Padding(padding: const EdgeInsets.symmetric(horizontal: 20), child: Divider(color: bd, height: 1)),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.asset(image, width: 88, height: 88, fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(width: 88, height: 88, color: accent.withValues(alpha: 0.1))),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(body, style: GoogleFonts.inter(color: mt, fontSize: 12, fontWeight: FontWeight.w500, height: 1.55)),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Wrap(
                spacing: 8, runSpacing: 8,
                children: chips.map((c) => _featurePill(c.$1, c.$2, c.$3, dk)).toList(),
              ),
            ),
            const SizedBox(height: 18),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: InkWell(
                onTap: () => HapticFeedback.lightImpact(),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: ctaGradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: ctaGradient.last.withValues(alpha: 0.32), blurRadius: 14, offset: const Offset(0, 7))],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(ctaIcon, color: Colors.white, size: 15),
                      const SizedBox(width: 8),
                      Text(ctaLabel, style: GoogleFonts.outfit(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _featurePill(String label, IconData icon, Color color, bool dk) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: dk ? 0.14 : 0.09),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, color: color, size: 12),
        const SizedBox(width: 5),
        Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w700)),
      ]),
    );
  }

  // ── ACTIVITY FEED ──────────────────────────────────────────
  Widget _buildActivityFeed(bool dk, Color fg, Color mt, Color cd, Color bd) {
    final p = Provider.of<AppProvider>(context);
    final requests = p.myRequests.take(5).toList();

    if (!p.rhDataLoaded) {
      return const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()));
    }

    if (requests.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(color: cd, borderRadius: BorderRadius.circular(24), border: Border.all(color: bd)),
          child: Column(children: [
            Icon(Icons.inbox_rounded, color: mt, size: 36),
            const SizedBox(height: 12),
            Text('Aucune activité récente', style: TextStyle(color: mt, fontSize: 13, fontWeight: FontWeight.w600)),
          ]),
        ),
      );
    }

    // ── Type Configuration avec icons dynamiques pour les congés ──────────
    Map<String, (IconData, Color, String)> typeConfig = {
      'CONGE': (Icons.beach_access_rounded, _Palette.teal, 'Demande Congé'),
      'AVANCE': (Icons.payments_rounded, _Palette.violet, 'Avance Salaire'),
      'CREDIT': (Icons.account_balance_wallet_rounded, _Palette.amber, 'Crédit'),
      'PRIME': (Icons.star_rounded, _Palette.gold, 'Prime'),
      'DOCUMENT': (Icons.description_rounded, _Palette.stbBlue, 'Document'),
      'CARTE': (Icons.credit_card_rounded, _Palette.emerald, 'Carte'),
    };
    
    const statusConfig = <String, (String, Color)>{
      'EN_ATTENTE': ('En attente', _Palette.amber),
      'APPROUVE': ('Approuvée', _Palette.emerald),
      'REFUSE': ('Refusée', _Palette.rose),
      'EN_COURS': ('En cours', _Palette.stbBlue),
      'ANNULE': ('Annulée', Color(0xFF94A3B8)),
      'DEBITEE': ('Débitée', _Palette.rose),
      'CREDITEE': ('Créditée', _Palette.emerald),
    };

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: requests.asMap().entries.map((e) {
          final req = e.value as Map<String, dynamic>;
          final type = req['type'] as String? ?? 'CONGE';
          final status = req['status'] as String? ?? 'EN_ATTENTE';
          final payload = req['payload'] as Map<String, dynamic>? ?? {};
          
          // ── Icons dynamiques pour les congés selon le type ──────────────
          if (type == 'CONGE') {
            final leaveType = payload['type'] ?? payload['leaveType'] ?? 'REPOS';
            switch (leaveType.toString().toUpperCase()) {
              case 'MALADIE':
              case 'SICK':
                typeConfig['CONGE'] = (Icons.medical_services_rounded, const Color(0xFFEF4444), 'Congé Maladie');
                break;
              case 'MARIAGE':
              case 'MARRIAGE':
                typeConfig['CONGE'] = (Icons.favorite_rounded, const Color(0xFFEC4899), 'Congé Mariage');
                break;
              case 'NAISSANCE':
              case 'BIRTH':
                typeConfig['CONGE'] = (Icons.child_care_rounded, const Color(0xFF06B6D4), 'Congé Naissance');
                break;
              case 'DECES':
              case 'DEATH':
                typeConfig['CONGE'] = (Icons.nightlight_rounded, const Color(0xFF64748B), 'Congé Décès');
                break;
              case 'PELERINAGE':
              case 'PILGRIMAGE':
                typeConfig['CONGE'] = (Icons.mosque_rounded, const Color(0xFF8B5CF6), 'Congé Pèlerinage');
                break;
              case 'SANS_SOLDE':
              case 'UNPAID':
                typeConfig['CONGE'] = (Icons.money_off_rounded, const Color(0xFF6B7280), 'Congé Sans Solde');
                break;
              case 'REPOS':
              case 'REST':
              default:
                typeConfig['CONGE'] = (Icons.beach_access_rounded, _Palette.teal, 'Congé Repos');
                break;
            }
          }
          
          final cfg = typeConfig[type] ?? typeConfig['CONGE']!;
          final sCfg = statusConfig[status] ?? statusConfig['EN_ATTENTE']!;
          final color = cfg.$2;
          final sColor = sCfg.$2;

          String dateStr = '';
          try {
            final createdAt = req['createdAt'] as String?;
            if (createdAt != null) {
              final dt = DateTime.parse(createdAt);
              dateStr = '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
            }
          } catch (_) {}

          String desc = payload['motif'] as String? ?? payload['type'] as String? ?? '';
          if (payload['amount'] != null) desc = '${payload['amount']} TND';
          if (payload['days'] != null) desc = '${payload['days']} jours';
          if (desc.isEmpty) desc = cfg.$3;

          return GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              _showRequestDetail(context, req, cfg, sCfg, dk, cd, bd);
            },
            child: Container(
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: cd,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: bd),
                boxShadow: [
                  BoxShadow(color: dk ? Colors.black.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.03), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: IntrinsicHeight(
                  child: Row(
                    children: [
                      // Elegant left indicator bar
                      Container(
                        width: 4.5,
                        color: color,
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          child: Row(
                            children: [
                              Container(
                                width: 44, height: 44,
                                decoration: BoxDecoration(
                                  color: color.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(cfg.$1, color: color, size: 20),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      cfg.$3,
                                      style: GoogleFonts.outfit(color: fg, fontSize: 14.5, fontWeight: FontWeight.w700),
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      desc,
                                      style: GoogleFonts.inter(color: mt.withValues(alpha: 0.8), fontSize: 11, fontWeight: FontWeight.w500),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: sColor.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Container(
                                          width: 5, height: 5,
                                          decoration: BoxDecoration(color: sColor, shape: BoxShape.circle),
                                        ),
                                        const SizedBox(width: 5),
                                        Text(
                                          sCfg.$1,
                                          style: GoogleFonts.inter(color: sColor, fontSize: 9.5, fontWeight: FontWeight.w800),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 5),
                                  Text(
                                    dateStr,
                                    style: GoogleFonts.inter(color: mt.withValues(alpha: 0.6), fontSize: 10.5, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                              const SizedBox(width: 6),
                              Icon(Icons.chevron_right_rounded, color: mt.withValues(alpha: 0.5), size: 20),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                    ],
                  ),
                ),
              ),
            ).animate().fadeIn(delay: (300 + e.key * 60).ms).slideX(begin: 0.03),
          );
        }).toList(),
      ),
    );
  }

  void _showRequestDetail(BuildContext context, Map<String, dynamic> req, (IconData, Color, String) cfg, (String, Color) sCfg, bool dk, Color cd, Color bd) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) {
        final sheetBg = dk ? const Color(0xFF111827) : Colors.white;
        final fg2 = dk ? Colors.white : const Color(0xFF0F172A);
        final mt2 = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
        final color = cfg.$2;
        final sColor = sCfg.$2;
        final payload = req['payload'] as Map<String, dynamic>? ?? {};

        String dateStr = '';
        try {
          final createdAt = req['createdAt'] as String?;
          if (createdAt != null) {
            final dt = DateTime.parse(createdAt);
            dateStr = '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
          }
        } catch (_) {}

        final rawId = req['_id'] as String? ?? '';
        final id = rawId.length >= 8 ? rawId.substring(0, 8) : rawId;

        return Container(
          margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
          decoration: BoxDecoration(
            color: sheetBg,
            borderRadius: BorderRadius.circular(30),
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.25), blurRadius: 30, offset: const Offset(0, -8))],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(margin: const EdgeInsets.only(top: 14, bottom: 8), width: 38, height: 4,
                  decoration: BoxDecoration(color: mt2.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 10),
              Container(
                width: 60, height: 60,
                decoration: BoxDecoration(color: color.withValues(alpha: 0.12), shape: BoxShape.circle),
                child: Icon(cfg.$1, color: color, size: 28),
              ),
              const SizedBox(height: 14),
              Text(cfg.$3, style: TextStyle(color: fg2, fontSize: 19, fontWeight: FontWeight.w800, letterSpacing: -0.3)),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(color: sColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                child: Text(sCfg.$1, style: TextStyle(color: sColor, fontSize: 12, fontWeight: FontWeight.w800)),
              ),
              const SizedBox(height: 22),
              Divider(color: mt2.withValues(alpha: 0.15), indent: 24, endIndent: 24),
              const SizedBox(height: 10),
              _detailRow('Date', dateStr.isEmpty ? '—' : dateStr, fg2, mt2),
              _detailRow('Référence', '#${id.toUpperCase()}', fg2, mt2),
              _detailRow('Type', cfg.$3, fg2, mt2),
              if (payload['amount'] != null) _detailRow('Montant', '${payload['amount']} TND', fg2, mt2),
              if (payload['days'] != null) _detailRow('Durée', '${payload['days']} jours', fg2, mt2),
              if (payload['motif'] != null) _detailRow('Motif', payload['motif'] as String, fg2, mt2),
              _detailRow('Statut', sCfg.$1, fg2, mt2, statusColor: sColor),
              const SizedBox(height: 16),
              Divider(color: mt2.withValues(alpha: 0.15), indent: 24, endIndent: 24),
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 28),
                child: SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: mt2.withValues(alpha: 0.25)),
                      foregroundColor: fg2,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                    ),
                    child: const Text('Fermer', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _detailRow(String label, String value, Color fg, Color mt, {Color? statusColor}) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 14),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: mt, fontSize: 13, fontWeight: FontWeight.w600)),
          Text(value, style: TextStyle(color: statusColor ?? fg, fontSize: 13, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}

// ── ENGRAVED LINE-WORK PAINTER (hero card texture) ──────────────────────────
// A subtle, restrained substitute for the previous glowing "orbs": thin
// diagonal lines with a soft opacity ramp — reminiscent of the fine
// guilloché line-work on a banknote or premium card, not an app icon.
class _EngravedLinesPainter extends CustomPainter {
  final double t;
  _EngravedLinesPainter(this.t);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.035)
      ..strokeWidth = 1;
    final offset = t * 40;
    for (double x = -size.height; x < size.width + size.height; x += 14) {
      canvas.drawLine(Offset(x + offset, 0), Offset(x + offset - size.height, size.height), paint);
    }
    final goldPaint = Paint()
      ..color = const Color(0xFFC9A961).withValues(alpha: 0.05)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 60);
    canvas.drawCircle(Offset(size.width * 0.85, size.height * 0.15), 90, goldPaint);
  }

  @override
  bool shouldRepaint(covariant _EngravedLinesPainter old) => old.t != t;
}

// ── FEATURE CARD (hero grid — navy/violet/teal identity) ───────────────────
class _FeatureCard extends StatefulWidget {
  final String title, subtitle;
  final IconData icon;
  final List<Color> gradient;
  final double height;
  final VoidCallback? onTap;

  const _FeatureCard({required this.title, required this.subtitle, required this.icon, required this.gradient, required this.height, required this.onTap});

  @override
  State<_FeatureCard> createState() => _FeatureCardState();
}

class _FeatureCardState extends State<_FeatureCard> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 150));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _ctrl.forward(),
      onTapUp: (_) { _ctrl.reverse(); widget.onTap?.call(); },
      onTapCancel: () => _ctrl.reverse(),
      child: AnimatedBuilder(
        animation: _ctrl,
        builder: (_, child) => Transform.scale(scale: 1.0 - 0.03 * _ctrl.value, child: child),
        child: Container(
          height: widget.height,
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: widget.gradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(color: widget.gradient[0].withValues(alpha: 0.35), blurRadius: 20, offset: const Offset(0, 10)),
            ],
          ),
          child: Stack(
            children: [
              Positioned(
                right: -20, bottom: -20,
                child: Container(
                  width: 96, height: 96,
                  decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withValues(alpha: 0.08)),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 42, height: 42,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                      ),
                      child: Icon(widget.icon, color: Colors.white, size: 21),
                    ),
                    const Spacer(),
                    Text(widget.title, style: GoogleFonts.outfit(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800, letterSpacing: -0.2), maxLines: 1, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 3),
                    Text(widget.subtitle, style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.8), fontSize: 11, fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── UTILITY CARD (secondary grid — neutral surface + tinted icon) ──────────
class _UtilityCard extends StatelessWidget {
  final String title, subtitle;
  final IconData icon;
  final Color color;
  final Color cd, bd, mt, fg;
  final bool dk;
  final VoidCallback? onTap;

  const _UtilityCard({
    required this.title, required this.subtitle, required this.icon, required this.color,
    required this.cd, required this.bd, required this.dk, required this.fg, required this.mt,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () { HapticFeedback.lightImpact(); onTap?.call(); },
      child: Container(
        height: 124,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: cd,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: bd),
          boxShadow: [
            BoxShadow(color: dk ? Colors.black.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.04), blurRadius: 16, offset: const Offset(0, 6)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: color, size: 18),
            ),
            const Spacer(),
            Text(
              title,
              style: GoogleFonts.outfit(color: fg, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: -0.1),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: GoogleFonts.inter(color: mt, fontSize: 9.5, fontWeight: FontWeight.w500),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

// ── CREDIT FEATURED CARD (real STB Private Titanium Card composition) ───────
class _CreditFeaturedCard extends StatelessWidget {
  final VoidCallback onTap;
  const _CreditFeaturedCard({required this.onTap});

  String _formatAmountSpace(double val) {
    final s = val.toStringAsFixed(0);
    final pattern = RegExp(r'\B(?=(\d{3})+(?!\d))');
    return s.replaceAll(pattern, ' ');
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final credits = p.credits; // ✅ Fetches from credits collection via fetchCredits()

    double total = 0.0;
    double paid = 0.0;
    double monthly = 0.0;

    // ✅ Calculate from REAL credits collection data
    if (credits.isNotEmpty) {
      for (var credit in credits) {
        if (credit['status'] == 'ACTIVE' || credit['status'] == 'CLOSED') {
          final montantInitial = (credit['montantInitial'] as num?)?.toDouble() ?? 0.0;
          final montantRestant = (credit['montantRestant'] as num?)?.toDouble() ?? 0.0;
          final mens = (credit['mensualite'] as num?)?.toDouble() ?? 0.0;
          
          total += montantInitial;
          paid += (montantInitial - montantRestant);
          if (credit['status'] == 'ACTIVE') {
            monthly += mens;
          }
        }
      }
    }

    final pct = total > 0 ? (paid / total).clamp(0.0, 1.0) : 0.0;
    final remaining = total - paid;

    return GestureDetector(
      onTap: () { HapticFeedback.lightImpact(); onTap(); },
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(28),
          gradient: const LinearGradient(
            colors: [_Palette.graphite, Color(0xFF272A36), _Palette.graphiteSoft],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          border: Border.all(color: _Palette.gold.withValues(alpha: 0.35), width: 1.2),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 24, offset: const Offset(0, 12)),
            BoxShadow(color: _Palette.gold.withValues(alpha: 0.08), blurRadius: 16, offset: const Offset(0, 2)),
          ],
        ),
        child: Stack(
          children: [
            Positioned(
              right: -30, top: -30,
              child: Container(
                width: 130, height: 130,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.03),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(22),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          // Gold EMV Chip
                          Container(
                            width: 36, height: 26,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(colors: [_Palette.goldLight, _Palette.gold]),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: Colors.black.withValues(alpha: 0.2)),
                            ),
                            child: Center(
                              child: Icon(Icons.qr_code_2_rounded, size: 16, color: Colors.black.withValues(alpha: 0.5)),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Icon(Icons.wifi_rounded, color: Colors.white.withValues(alpha: 0.4), size: 20),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: _Palette.gold.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: _Palette.gold.withValues(alpha: 0.4)),
                        ),
                        child: Text(
                          "STB CRÉDITS",
                          style: GoogleFonts.outfit(color: _Palette.goldLight, fontSize: 10.5, fontWeight: FontWeight.w800, letterSpacing: 1.5),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Text(
                    total > 0 ? "${_formatAmountSpace(total)} TND" : "Aucun crédit actif",
                    style: GoogleFonts.outfit(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900, letterSpacing: -0.4),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    monthly > 0 ? "Mensualité : ${_formatAmountSpace(monthly)} TND / mois" : "Demandez un crédit personnel ou immobilier en ligne",
                    style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.65), fontSize: 12.5, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 18),
                  if (total > 0) ...[
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: pct,
                        minHeight: 7,
                        backgroundColor: Colors.white.withValues(alpha: 0.1),
                        valueColor: const AlwaysStoppedAnimation(_Palette.gold),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text("${(pct * 100).toStringAsFixed(0)}% remboursé", style: GoogleFonts.inter(color: _Palette.goldLight, fontSize: 11.5, fontWeight: FontWeight.w700)),
                        Text("Reste : ${_formatAmountSpace(remaining)} TND", style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.5), fontSize: 11.5, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ] else
                    Row(
                      children: [
                        Text("Découvrir les formules de crédit", style: GoogleFonts.inter(color: _Palette.goldLight, fontSize: 12.5, fontWeight: FontWeight.w700)),
                        const SizedBox(width: 6),
                        const Icon(Icons.arrow_forward_rounded, color: _Palette.goldLight, size: 15),
                      ],
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── AMICALE CAROUSEL ─────────────────────────────────────────────────────
class _AmicaleCarousel extends StatefulWidget {
  final bool dk;
  final Color mt;
  const _AmicaleCarousel({required this.dk, required this.mt});

  @override
  State<_AmicaleCarousel> createState() => _AmicaleCarouselState();
}

class _AmicaleCarouselState extends State<_AmicaleCarousel> {
  late PageController _pageCtrl;
  Timer? _timer;
  int _currentFeatured = 0;

  final offres = const [
    {'title': 'Istanbul 7 Jours', 'sub': 'Hôtel 5* + Vol Tunisair', 'img': 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80', 'price': '1250 TND', 'tag': 'Voyage', 'color': _Palette.violet},
    {'title': 'La Badira, Hammamet', 'sub': 'Week-end en amoureux', 'img': 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', 'price': '350 TND', 'tag': 'Hôtel', 'color': _Palette.teal},
    {'title': 'Club Gym & Spa', 'sub': 'Abonnement Annuel VIP', 'img': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', 'price': '450 TND', 'tag': 'Bien-être', 'color': _Palette.amber},
  ];

  @override
  void initState() {
    super.initState();
    _pageCtrl = PageController(viewportFraction: 0.88);
    _timer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (_pageCtrl.hasClients) {
        final next = (_pageCtrl.page!.round() + 1) % offres.length;
        _pageCtrl.animateToPage(next, duration: const Duration(milliseconds: 800), curve: Curves.fastOutSlowIn);
      }
    });
  }

  @override
  void dispose() {
    _pageCtrl.dispose();
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 232,
          child: PageView.builder(
            controller: _pageCtrl,
            onPageChanged: (idx) => setState(() => _currentFeatured = idx),
            physics: const BouncingScrollPhysics(),
            itemCount: offres.length,
            itemBuilder: (context, i) {
              final o = offres[i];
              final color = o['color'] as Color;
              final isActive = _currentFeatured == i;

              return AnimatedScale(
                duration: const Duration(milliseconds: 380),
                curve: Curves.easeOutCubic,
                scale: isActive ? 1.0 : 0.93,
                child: GestureDetector(
                  onTap: () {
                    HapticFeedback.mediumImpact();
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const AmicaleScreen()));
                  },
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(22),
                      boxShadow: isActive ? [BoxShadow(color: color.withValues(alpha: 0.22), blurRadius: 18, offset: const Offset(0, 8))] : [],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(22),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          Image.network(o['img'] as String, fit: BoxFit.cover, errorBuilder: (_, __, ___) => Container(color: color.withValues(alpha: 0.3))),
                          Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(colors: [Colors.black.withValues(alpha: 0.05), Colors.black.withValues(alpha: 0.82)], begin: Alignment.topCenter, end: Alignment.bottomCenter),
                            ),
                          ),
                          Positioned(
                            top: 14, right: 14,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(color: color.withValues(alpha: 0.9), borderRadius: BorderRadius.circular(12)),
                              child: Text(o['tag'] as String, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
                            ),
                          ),
                          Positioned(
                            bottom: 16, left: 16, right: 16,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(o['title'] as String, style: const TextStyle(color: Colors.white, fontSize: 15.5, fontWeight: FontWeight.w800, letterSpacing: -0.2)),
                                const SizedBox(height: 2),
                                Text(o['sub'] as String, style: TextStyle(color: Colors.white.withValues(alpha: 0.72), fontSize: 11, fontWeight: FontWeight.w500)),
                                const SizedBox(height: 10),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(o['price'] as String, style: const TextStyle(color: _Palette.goldLight, fontSize: 14, fontWeight: FontWeight.w800)),
                                    Container(
                                      padding: const EdgeInsets.all(6),
                                      decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.16), shape: BoxShape.circle),
                                      child: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 13),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ).animate().fadeIn(delay: 150.ms),
        ),
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(offres.length, (i) => AnimatedContainer(
            duration: const Duration(milliseconds: 320),
            curve: Curves.easeOutExpo,
            margin: const EdgeInsets.symmetric(horizontal: 4),
            width: _currentFeatured == i ? 18 : 6,
            height: 6,
            decoration: BoxDecoration(
              color: _currentFeatured == i ? _Palette.gold : widget.mt.withValues(alpha: 0.28),
              borderRadius: BorderRadius.circular(3),
            ),
          )),
        ),
      ],
    );
  }
}