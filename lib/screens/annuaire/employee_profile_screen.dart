import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_api_service.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';

class EmployeeProfileScreen extends StatefulWidget {
  final Map<String, dynamic> employee;
  const EmployeeProfileScreen({super.key, required this.employee});

  @override
  State<EmployeeProfileScreen> createState() => _EmployeeProfileScreenState();
}

class _EmployeeProfileScreenState extends State<EmployeeProfileScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;

  List<dynamic>? _userTransactions;
  bool _isLoadingTransactions = false;

  // Helper to decode base64 avatar
  ImageProvider? _getAvatarImageProvider(String? avatarUrl) {
    if (avatarUrl == null || avatarUrl.isEmpty) return null;
    
    try {
      if (avatarUrl.startsWith('data:image')) {
        final base64String = avatarUrl.split(',')[1];
        final bytes = base64Decode(base64String);
        return MemoryImage(bytes);
      } else {
        return NetworkImage(avatarUrl);
      }
    } catch (e) {
      print('Error loading avatar: $e');
      return null;
    }
  }

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadTransactionsIfNeeded();
    });
  }

  void _loadTransactionsIfNeeded() async {
    final p = Provider.of<AppProvider>(context, listen: false);
    final myMatricule = p.userProfile?['matricule'];
    final empMatricule = widget.employee['matricule'];
    
    // Only load if viewing own profile
    if (myMatricule != null && myMatricule == empMatricule) {
      setState(() => _isLoadingTransactions = true);
      try {
        final res = await AuthApiService.getMyTransactions();
        if (res.isSuccess && res.data != null) {
          setState(() => _userTransactions = res.data!);
        }
      } catch (e) {
        debugPrint("Error loading transactions: $e");
      } finally {
        if (mounted) setState(() => _isLoadingTransactions = false);
      }
    }
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final fg = Theme.of(context).colorScheme.onSurface;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.07) : Colors.black.withValues(alpha: 0.04);
    final emp = widget.employee;
    final avatarColor = AppTheme.electricBlue;
    final prenom = emp['prenom'] as String? ?? '';
    final nom = emp['nom'] as String? ?? '';
    final fullName = '$prenom $nom'.trim();
    final avatarUrl = emp['avatar'] as String?;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: NestedScrollView(
        physics: const BouncingScrollPhysics(),
        headerSliverBuilder: (_, __) => [
          // ── Hero Header Sliver ────────────────────────────────────────────
          SliverToBoxAdapter(
            child: _buildHeroHeader(context, emp, avatarColor, mt, dk, fullName, prenom, nom, avatarUrl),
          ),
          // ── Pinned Tab Bar ────────────────────────────────────────────────
          SliverPersistentHeader(
            pinned: true,
            delegate: _TabDelegate(
              child: _buildTabBar(dk, cd, bd, mt),
            ),
          ),
        ],
        body: TabBarView(
          controller: _tabCtrl,
          children: [
            _buildRHTab(emp, fg, mt, cd, bd, dk),
            _buildTransactionsTab(emp, fg, mt, cd, bd, dk),
            _buildCreditsTab(emp, fg, mt, cd, bd, dk),
          ],
        ),
      ),
    );
  }

  // ── HERO HEADER ─────────────────────────────────────────────────────────
  Widget _buildHeroHeader(BuildContext context, Map<String, dynamic> emp, Color avatarColor, Color mt, bool dk, String fullName, String prenom, String nom, String? avatarUrl) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: dk
              ? [const Color(0xFF0A1628), const Color(0xFF0D1F40)]
              : [const Color(0xFF0D47A1), const Color(0xFF0A3D91)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
          child: Column(
            children: [
              // Back + status
              Row(children: [
                GestureDetector(
                  onTap: () { HapticFeedback.lightImpact(); Navigator.pop(context); },
                  child: Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                    ),
                    child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppTheme.emerald.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.4)),
                  ),
                  child: const Row(children: [
                    Icon(Icons.circle, color: AppTheme.emerald, size: 7),
                    SizedBox(width: 5),
                    Text("Actif", style: TextStyle(color: AppTheme.emerald, fontSize: 11, fontWeight: FontWeight.w700)),
                  ]),
                ),
              ]),
              const SizedBox(height: 20),
              // Avatar
              Container(
                width: 90, height: 90,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: (avatarUrl == null || avatarUrl.isEmpty) ? avatarColor : null,
                  image: _getAvatarImageProvider(avatarUrl) != null
                      ? DecorationImage(
                          image: _getAvatarImageProvider(avatarUrl)!,
                          fit: BoxFit.cover,
                        )
                      : null,
                  border: Border.all(color: Colors.white.withValues(alpha: 0.5), width: 3),
                  boxShadow: [BoxShadow(color: avatarColor.withValues(alpha: 0.4), blurRadius: 20, offset: const Offset(0, 8))],
                ),
                child: (avatarUrl == null || avatarUrl.isEmpty)
                  ? Center(
                      child: Text(
                        fullName.isNotEmpty ? (prenom.isNotEmpty ? prenom[0] : '') + (nom.isNotEmpty ? nom[0] : '') : '?',
                        style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900),
                      ),
                    )
                  : null,
              ).animate().fadeIn().scale(begin: const Offset(0.85, 0.85)),
              const SizedBox(height: 14),
              Text(
                fullName,
                style: GoogleFonts.outfit(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -0.5),
              ),
              const SizedBox(height: 4),
              Text(
                emp['poste'] as String? ?? 'Employé',
                style: const TextStyle(color: Color(0xFFF3E5AB), fontSize: 13, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 12),
              // Badges
              Wrap(spacing: 8, runSpacing: 6, alignment: WrapAlignment.center, children: [
                _badge(emp['matricule']?.toString() ?? "N/A", Icons.badge_rounded),
                _badge(emp['departement'] as String? ?? "Général", Icons.business_rounded),
                _badge("Actif", Icons.access_time_rounded),
              ]),
              const SizedBox(height: 18),
              // Find My Colleague Action
              GestureDetector(
                onTap: () {
                  HapticFeedback.heavyImpact();
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [AppTheme.electricBlue, AppTheme.royalBlue]),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.4), blurRadius: 10, offset: const Offset(0, 4))],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                        _heroBadge(Icons.badge_rounded, emp['matricule'] as String? ?? 'N/A'),
                        const SizedBox(width: 8),
                        _heroBadge(Icons.business_rounded, emp['departement'] as String? ?? 'STB Bank'),
                    ],
                  ),
                ),
              ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1),
              const SizedBox(height: 20),
              // Stats row
              Container(
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
                ),
                child: Row(children: [
                  _heroStat("${((emp['salaireBase'] as num?) ?? 0).toStringAsFixed(0)} TND", "Salaire", AppTheme.emerald),
                  _divider(),
                  _heroStat("${emp['soldeConges'] ?? 0} j", "Congé", const Color(0xFF00BFA5)),
                  _divider(),
                  _heroStat("${((emp['creditsEnCours'] as num?) ?? 0).toStringAsFixed(0)} TND", "Crédits", AppTheme.coralRed),
                  _divider(),
                  _heroStat("${((emp['prime'] as num?) ?? 0).toStringAsFixed(0)} TND", "Primes", const Color(0xFFF59E0B)),
                ]),
              ),
          ]),
        ),
      ),
    );
  }

  Widget _badge(String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, color: Colors.white70, size: 11),
        const SizedBox(width: 5),
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
      ]),
    );
  }

  Widget _heroBadge(IconData icon, String label) {
    return Row(children: [
      Icon(icon, color: Colors.white, size: 14),
      const SizedBox(width: 4),
      Text(label, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
    ]);
  }

  Widget _heroStat(String value, String label, Color color) {
    return Expanded(
      child: Column(children: [
        Text(value, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w900)),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 9, fontWeight: FontWeight.w600)),
      ]),
    );
  }

  Widget _divider() => Container(width: 1, height: 28, color: Colors.white.withValues(alpha: 0.14));

  // ── TAB BAR ──────────────────────────────────────────────────────────────
  Widget _buildTabBar(bool dk, Color cd, Color bd, Color mt) {
    return Container(
      color: dk ? const Color(0xFF060D1A) : const Color(0xFFF0F4FB),
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
      child: Container(
        height: 46,
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: cd,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: bd),
        ),
        child: TabBar(
          controller: _tabCtrl,
          indicator: BoxDecoration(
            gradient: const LinearGradient(colors: [AppTheme.royalBlue, AppTheme.electricBlue]),
            borderRadius: BorderRadius.circular(12),
          ),
          indicatorSize: TabBarIndicatorSize.tab,
          dividerColor: Colors.transparent,
          labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
          unselectedLabelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          labelColor: Colors.white,
          unselectedLabelColor: mt,
          tabs: const [
            Tab(text: 'RH & Infos'),
            Tab(text: 'Transactions'),
            Tab(text: 'Crédits'),
          ],
        ),
      ),
    );
  }

  // ── TAB: RH & INFOS ─────────────────────────────────────────────────────
  Widget _buildRHTab(Map<String, dynamic> emp, Color fg, Color mt, Color cd, Color bd, bool dk) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      children: [
        _infoCard("Informations Personnelles", [
          [Icons.person_rounded, 'Nom Complet', "${emp['prenom'] ?? ''} ${emp['nom'] ?? ''}"],
          [Icons.badge_rounded, 'Matricule', emp['matricule']?.toString() ?? "N/A"],
          [Icons.work_rounded, 'Poste', emp['poste'] as String? ?? "Employé"],
          [Icons.business_rounded, 'Direction', emp['departement'] as String? ?? "STB"],
          [Icons.email_rounded, 'Email', emp['email'] as String? ?? "-"],
        ], fg, mt, cd, bd, dk, AppTheme.electricBlue),
        const SizedBox(height: 14),
        _infoCard("Compte & Rémunération", [
          [Icons.account_balance_rounded, 'RIB', emp['rib']?.toString() ?? "N/A"],
          [Icons.beach_access_rounded, 'Solde Congé', '${emp['soldeConges'] ?? 0} jours'],
          [Icons.payments_rounded, 'Salaire Net', '${((emp['salaireBase'] as num?) ?? 0).toStringAsFixed(3)} TND'],
          [Icons.star_rounded, 'Total Primes', '${((emp['prime'] as num?) ?? 0).toStringAsFixed(3)} TND'],
        ], fg, mt, cd, bd, dk, AppTheme.emerald),
      ],
    );
  }

  Widget _infoCard(String title, List<List<dynamic>> rows, Color fg, Color mt, Color cd, Color bd, bool dk, Color accent) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cd,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: bd),
        boxShadow: AppTheme.cardShadow(dk),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(width: 5, height: 18, decoration: BoxDecoration(color: accent, borderRadius: BorderRadius.circular(3))),
          const SizedBox(width: 10),
          Text(title, style: TextStyle(color: fg, fontSize: 14, fontWeight: FontWeight.w800)),
        ]),
        const SizedBox(height: 14),
        ...rows.map((row) => Padding(
          padding: const EdgeInsets.only(bottom: 11),
          child: Row(children: [
            Icon(row[0] as IconData, color: accent.withValues(alpha: 0.7), size: 15),
            const SizedBox(width: 10),
            Text(row[1] as String, style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w500)),
            const Spacer(),
            Flexible(child: Text(row[2] as String, style: TextStyle(color: fg, fontSize: 12, fontWeight: FontWeight.w700), textAlign: TextAlign.end)),
          ]),
        )),
      ]),
    );
  }

  // ── TAB: TRANSACTIONS ────────────────────────────────────────────────────
  Widget _buildTransactionsTab(Map<String, dynamic> emp, Color fg, Color mt, Color cd, Color bd, bool dk) {
    if (_isLoadingTransactions) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.electricBlue));
    }
    
    if (_userTransactions == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.lock_rounded, size: 64, color: AppTheme.electricBlue),
            const SizedBox(height: 16),
            Text("Secret Bancaire", style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            Text("Les transactions de ce collaborateur sont privées.", style: TextStyle(color: mt, fontSize: 13)),
          ],
        ),
      );
    }

    if (_userTransactions!.isEmpty) {
      return Center(child: Text("Aucune transaction.", style: TextStyle(color: mt)));
    }

    final totalDebit = _userTransactions!.where((t) => (t['montant'] as num) < 0).fold(0.0, (s, t) => s + (t['montant'] as num).abs());
    final totalCredit = _userTransactions!.where((t) => (t['montant'] as num) > 0).fold(0.0, (s, t) => s + (t['montant'] as num));

    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(children: [
        Row(children: [
          Expanded(child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: AppTheme.coralRed.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(18), border: Border.all(color: AppTheme.coralRed.withValues(alpha: 0.2))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text("Débits", style: TextStyle(color: AppTheme.coralRed, fontSize: 11, fontWeight: FontWeight.w700)),
              const SizedBox(height: 4),
              Text("${totalDebit.toStringAsFixed(3)} TND", style: const TextStyle(color: AppTheme.coralRed, fontSize: 15, fontWeight: FontWeight.w900)),
            ]),
          )),
          const SizedBox(width: 12),
          Expanded(child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: AppTheme.emerald.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(18), border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.2))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text("Crédits", style: TextStyle(color: AppTheme.emerald, fontSize: 11, fontWeight: FontWeight.w700)),
              const SizedBox(height: 4),
              Text("${totalCredit.toStringAsFixed(3)} TND", style: const TextStyle(color: AppTheme.emerald, fontSize: 15, fontWeight: FontWeight.w900)),
            ]),
          )),
        ]),
        const SizedBox(height: 14),
        ..._userTransactions!.asMap().entries.map((e) {
          final t = e.value;
          final amount = (t['montant'] as num).toDouble();
          final isCredit = amount > 0;
          final color = isCredit ? AppTheme.emerald : AppTheme.coralRed;
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: cd, borderRadius: BorderRadius.circular(18), border: Border.all(color: bd)),
            child: Row(children: [
              Container(
                width: 40, height: 40,
                decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                child: Icon(isCredit ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded, color: color, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(t['motif'] as String? ?? 'Transaction', style: TextStyle(color: fg, fontSize: 12, fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text(t['dateHeure'] as String? ?? '', style: TextStyle(color: mt, fontSize: 10, fontWeight: FontWeight.w500)),
              ])),
              Text("${isCredit ? '+' : ''}${amount.toStringAsFixed(3)} TND", style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w800)),
            ]),
          ).animate().fadeIn(delay: (e.key * 50).ms);
        }),
      ]),
    );
  }

  // ── TAB: CREDITS ─────────────────────────────────────────────────────────
  Widget _buildCreditsTab(Map<String, dynamic> emp, Color fg, Color mt, Color cd, Color bd, bool dk) {
    final totalCredits = (emp['creditsEnCours'] as num?)?.toDouble() ?? 0.0;
    final salaire = (emp['salaireBase'] as num?)?.toDouble() ?? 1200.0;
    final mensualite = totalCredits > 0 ? totalCredits / 24 : 0.0; // Estimate
    final hasCredits = totalCredits > 0;

    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(children: [
        if (!hasCredits)
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(color: cd, borderRadius: BorderRadius.circular(24), border: Border.all(color: bd)),
            child: Column(children: [
              const Icon(Icons.check_circle_rounded, color: AppTheme.emerald, size: 48),
              const SizedBox(height: 12),
              Text("Aucun crédit en cours", style: TextStyle(color: fg, fontSize: 16, fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              Text("Ce collaborateur n'a pas de crédit actif.", style: TextStyle(color: mt, fontSize: 12)),
            ]),
          )
        else ...[
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [AppTheme.royalBlue, AppTheme.electricBlue], begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: BorderRadius.circular(24),
              boxShadow: AppTheme.primaryShadow,
            ),
            child: Column(children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const Text("Total Crédits", style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                  child: const Text("Actif", style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                ),
              ]),
              const SizedBox(height: 10),
              Text("${totalCredits.toStringAsFixed(0)} TND", style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900, letterSpacing: -1)),
              const SizedBox(height: 16),
              // Progress bar
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: mensualite > 0 ? (mensualite / (salaire > 0 ? salaire : 1)).clamp(0.0, 1.0) : 0,
                  minHeight: 7,
                  backgroundColor: Colors.white.withValues(alpha: 0.2),
                  valueColor: const AlwaysStoppedAnimation(Colors.white),
                ),
              ),
              const SizedBox(height: 10),
              Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text("Mensualité", style: TextStyle(color: Colors.white60, fontSize: 11)),
                  Text("${mensualite.toStringAsFixed(0)} TND/mois", style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
                ])),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                  const Text("Ratio Salaire", style: TextStyle(color: Colors.white60, fontSize: 11)),
                  Text(
                    "${salaire > 0 ? ((mensualite / salaire) * 100).toStringAsFixed(0) : 0}%",
                    style: TextStyle(color: mensualite / (salaire > 0 ? salaire : 1) > 0.35 ? AppTheme.coralRed : AppTheme.emerald, fontSize: 14, fontWeight: FontWeight.w800),
                  ),
                ])),
              ]),
            ]),
          ),
        ],
      ]),
    );
  }
}

// ── PINNED HEADER DELEGATE ───────────────────────────────────────────────────
class _TabDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;
  _TabDelegate({required this.child});

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) => child;

  @override
  double get maxExtent => 66;
  @override
  double get minExtent => 66;
  @override
  bool shouldRebuild(covariant _TabDelegate old) => old.child != child;
}
