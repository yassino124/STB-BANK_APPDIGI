import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:math' as math;
import 'dart:convert';
import 'dart:io';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../theme/app_theme.dart';
import 'home/dashboard_screen.dart';
import 'cards/cards_screen.dart';
import 'accounts/accounts_screen.dart';
import 'copilot/copilot_screen.dart';
import 'profile/profile_screen.dart';
import 'analytics/analytics_screen.dart';
import 'rh/rh_hub_screen.dart';
import 'annuaire/annuaire_screen.dart';
import 'invest/invest_screen.dart';
import 'budget/budget_screen.dart';
import 'documents/documents_screen.dart';
import 'qr_payment/qr_payment_screen.dart';
import 'bills/bills_screen.dart';
import 'recharge/recharge_screen.dart';
import 'messages/messages_screen.dart';
import 'conversations/conversations_screen.dart';
import 'auth/login_screen.dart';
import 'analytics/bill_scanner_screen.dart';
import 'team/team_validation_screen.dart';
import 'absence/absence_request_screen.dart';
import 'dart:ui';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:speech_to_text/speech_recognition_result.dart';
import 'package:flutter_tts/flutter_tts.dart';
import '../services/ollama_api_service.dart';
import '../services/auth_api_service.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});
  @override
  State<MainScreen> createState() => MainScreenState();
}

class MainScreenState extends State<MainScreen> {
  static MainScreenState? _instance;
  int _index = 0;
  int _pendingTeamCount = 0;

  /// Global navigation — works from any screen (dialogs, pushed routes, etc.)
  static void navigateGlobal(int i) => _instance?.navigateTo(i);

  List<Widget> get _screens {
    final p = context.read<AppProvider>();
    final base = <Widget>[
      const DashboardScreen(),       // 0 - Accueil
      const RHHubScreen(),           // 1 - RH Hub
      const AnnuaireScreen(),        // 2 - Annuaire (Center)
      const CopilotScreen(),         // 3 - Copilot AI
      const ProfileScreen(),         // Profil (4 for non-managers)
      const BudgetsScreen(),         // 5 - Budgets
      const QrPaymentsScreen(),      // 6 - QR Payments
      const BillsScreen(),            // 7 - Bills
      const RechargeScreen(),         // 8 - Recharge
      const MessagesScreen(),         // 9 - Messages
      const ConversationsScreen(),    // 10 - Conversations
    ];

    // Direction (Manager) gets Team Validation + Absence tabs
    if (p.isManager) {
      base.insert(4, const TeamValidationScreen()); // 4 - Team Validation (shifts Profile to 5)
      base.insert(5, const AbsenceRequestScreen()); // 5 - Absence Request (shifts Budgets to 6)
    } else {
      base.insert(5, const AbsenceRequestScreen()); // 5 - Absence Request (all employees)
    }

    // Finance role gets Finance tab
    if (p.isFinance) {
      // Finance tabs: Dashboard, Payroll, Budgets, Investments, Avances
      // These are already accessible via the existing screens
    }

    // Agence role gets Agence tab
    if (p.isAgence) {
      // Agence tabs: Accounts, Cards, Credits, Risk Alerts
      // These are already accessible via the existing screens
    }

    return base;
  }

  void _navigate(int i) {
    HapticFeedback.selectionClick();
    setState(() => _index = i);
  }

  // Public alias for external callers (e.g. Copilot)
  void navigateTo(int i) => _navigate(i);

  // Public method to refresh pending team count (called from TeamValidationScreen after approval)
  void refreshTeamCount() => _loadPendingTeamCount();


  @override
  void initState() {
    super.initState();
    _instance = this;
    _loadPendingTeamCount();
  }

  Future<void> _loadPendingTeamCount() async {
    final p = context.read<AppProvider>();
    if (!p.isManager) return;
    
    try {
      final res = await AuthApiService.getPendingApprovals();
      if (res.isSuccess && res.data != null && mounted) {
        setState(() {
          _pendingTeamCount = (res.data as List).length;
        });
      }
    } catch (e) {
      debugPrint('Error loading pending team count: $e');
    }
  }

  @override
  void dispose() {
    if (_instance == this) _instance = null;
    super.dispose();
  }

  // Helper to decode base64 avatar or use URL
  DecorationImage? _getEmployeeAvatarImage(String? avatar) {
    if (avatar == null || avatar.isEmpty) {
      // Fallback to default pravatar
      return const DecorationImage(
        image: NetworkImage("https://i.pravatar.cc/150?img=11"),
        fit: BoxFit.cover,
      );
    }
    
    try {
      if (avatar.startsWith('data:image')) {
        // Base64 data URI
        final base64String = avatar.split(',')[1];
        final bytes = base64Decode(base64String);
        return DecorationImage(
          image: MemoryImage(bytes),
          fit: BoxFit.cover,
        );
      } else {
        // Regular URL
        return DecorationImage(
          image: NetworkImage(avatar),
          fit: BoxFit.cover,
        );
      }
    } catch (e) {
      debugPrint('Error loading avatar: $e');
      return const DecorationImage(
        image: NetworkImage("https://i.pravatar.cc/150?img=11"),
        fit: BoxFit.cover,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: dk ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Scaffold(
        extendBody: false, // Fixed solid bottom navigation
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        drawer: _buildDrawer(context, p, dk),
        body: AnimatedSwitcher(
          duration: const Duration(milliseconds: 350),
          switchInCurve: Curves.easeOutCubic,
          switchOutCurve: Curves.easeInCubic,
          transitionBuilder: (child, animation) {
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          },
          child: KeyedSubtree(
            key: ValueKey<int>(_index),
            child: _screens[_index],
          ),
        ),
        bottomNavigationBar: _buildSolidBottomNav(dk, p),
        floatingActionButton: _index == 0 
            ? Padding(
                padding: const EdgeInsets.only(bottom: 84.0),
                child: FloatingActionButton(
                  heroTag: 'main_voice_fab',
                  onPressed: () {
                    HapticFeedback.heavyImpact();
                    _showVoiceSiri(context, dk);
                  },
                  backgroundColor: AppTheme.electricBlue,
                  elevation: 10,
                  shape: const CircleBorder(),
                  child: const Icon(Icons.mic_rounded, color: Colors.white, size: 28),
                ).animate(onPlay: (c) => c.repeat(reverse: true)).scale(begin: const Offset(0.95, 0.95), end: const Offset(1.05, 1.05), duration: 1500.ms),
              )
            : null,
      ),
    );
  }

  Widget _buildSolidBottomNav(bool dk, AppProvider p) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    return Container(
      height: 72 + 20 + bottomPadding,
      color: Colors.transparent,
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.topCenter,
        children: [
          // Background glassmorphic pill bar
          Positioned(
            left: 12,
            right: 12,
            bottom: bottomPadding + 12,
            height: 72,
            child: Container(
              decoration: BoxDecoration(
                color: dk ? const Color(0xFF0B1426).withValues(alpha: 0.92) : Colors.white.withValues(alpha: 0.92),
                borderRadius: BorderRadius.circular(32),
                border: Border.all(
                  color: dk ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.05),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: dk ? 0.35 : 0.10),
                    blurRadius: 28,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(32),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                       children: [
                         _navItem(Icons.home_filled, Icons.home_outlined, 'Accueil', 0, dk),
                         _navItem(Icons.badge_rounded, Icons.badge_outlined, 'RH', 1, dk),
                         _navItem(Icons.people_rounded, Icons.people_outline_rounded, 'Annuaire', 2, dk, isCenter: true),
                         _navItem(Icons.psychology_rounded, Icons.psychology_outlined, 'Copilot', 3, dk),
                         if (p.isManager)
                           _navItem(Icons.groups_rounded, Icons.groups_outlined, 'Team', 4, dk, badgeCount: _pendingTeamCount),
                         _navItem(Icons.calendar_today_rounded, Icons.calendar_today_outlined, 'Absence', p.isManager ? 5 : 4, dk),
                         if (p.isFinance)
                           _navItem(Icons.account_balance_wallet_rounded, Icons.account_balance_wallet_outlined, 'Finance', p.isManager ? 6 : 5, dk),
                         if (p.isAgence)
                           _navItem(Icons.business_rounded, Icons.business_outlined, 'Agence', p.isManager ? (p.isFinance ? 7 : 6) : (p.isFinance ? 6 : 5), dk),
                         _navItem(Icons.person_rounded, Icons.person_outline_rounded, 'Profil', p.isManager ? (p.isFinance ? (p.isAgence ? 7 : 6) : 5) : (p.isFinance ? (p.isAgence ? 6 : 5) : 4), dk),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _navItem(IconData filledIcon, IconData outlinedIcon, String label, int i, bool dk, {bool isCenter = false, int? badgeCount}) {
    final active = _index == i;
    final activeColor = isCenter ? const Color(0xFF2962FF) : AppTheme.electricBlue;
    final inactiveColor = dk ? AppTheme.textMutedDark : AppTheme.textMutedLight;

    return Expanded(
      flex: active ? 3 : 2,
      child: GestureDetector(
        onTap: () => _navigate(i),
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOutCubic,
          height: double.infinity,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: active ? 42 : 36,
                height: active ? 32 : 36,
                decoration: BoxDecoration(
                  color: active ? AppTheme.electricBlue.withValues(alpha: 0.12) : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Icon(
                        active ? filledIcon : outlinedIcon,
                        color: active ? activeColor : inactiveColor,
                        size: active ? 20 : 22,
                      ),
                      if (badgeCount != null && badgeCount > 0)
                        Positioned(
                          top: -4, right: -6,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                            constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                            decoration: BoxDecoration(
                              color: AppTheme.coralRed,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: dk ? const Color(0xFF0B1426) : Colors.white,
                                width: 1.5,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.coralRed.withValues(alpha: 0.5),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Text(
                              badgeCount > 99 ? '99+' : '$badgeCount',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.w900,
                                height: 1,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              if (active) ...[
                const SizedBox(height: 4),
                Text(
                  label,
                  style: AppTheme.label(activeColor).copyWith(fontSize: 9),
                  maxLines: 1,
                  overflow: TextOverflow.visible,
                ).animate().fadeIn(duration: 200.ms).slideY(begin: 0.2),
              ],
            ],
          ),
        ),
      ),
    );
  }



  Widget _buildDrawer(BuildContext context, AppProvider p, bool dk) {
    final drawerBg = dk ? const Color(0xFF080D1E) : const Color(0xFFF1F5F9);
    final textCol = dk ? Colors.white : const Color(0xFF0F172A);
    final mutedCol = dk ? const Color(0xFF94A3B8) : const Color(0xFF475569);
    final cardBg = dk ? Colors.white.withValues(alpha: 0.03) : Colors.black.withValues(alpha: 0.02);
    final borderCol = dk ? Colors.white.withValues(alpha: 0.06) : Colors.black.withValues(alpha: 0.04);

    return Drawer(
      backgroundColor: drawerBg,
      child: Container(
        decoration: BoxDecoration(
          color: drawerBg,
          border: Border(right: BorderSide(color: borderCol)),
        ),
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Header Profile Card (Luxury look with Dynamic Data) ────────
              Padding(
                padding: const EdgeInsets.all(20),
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: dk 
                        ? [Colors.white.withValues(alpha: 0.05), Colors.white.withValues(alpha: 0.01)] 
                        : [Colors.black.withValues(alpha: 0.03), Colors.black.withValues(alpha: 0.01)],
                      begin: Alignment.topLeft, end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: dk ? const Color(0xFFD97706).withValues(alpha: 0.3) : const Color(0xFFD97706).withValues(alpha: 0.15), width: 1.5),
                    boxShadow: [
                      if (dk) BoxShadow(color: const Color(0xFFD97706).withValues(alpha: 0.05), blurRadius: 15, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          // Dynamic Employee Photo
                          Container(
                            width: 56,
                            height: 56,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: const Color(0xFFD97706), width: 2),
                              boxShadow: [
                                BoxShadow(color: const Color(0xFFD97706).withValues(alpha: 0.3), blurRadius: 10),
                              ],
                              image: _getEmployeeAvatarImage(p.userProfile?['avatar']),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "${p.userProfile?['prenom'] ?? ''} ${p.userProfile?['nom'] ?? 'User'}",
                                  style: TextStyle(color: textCol, fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: -0.2),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 5),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [Color(0xFFD97706), Color(0xFFF59E0B)],
                                      begin: Alignment.topLeft, end: Alignment.bottomRight,
                                    ),
                                    borderRadius: BorderRadius.circular(10),
                                    boxShadow: [
                                      BoxShadow(color: const Color(0xFFD97706).withValues(alpha: 0.3), blurRadius: 6, offset: const Offset(0, 2)),
                                    ],
                                  ),
                                  child: Text(
                                    (p.userProfile?['poste'] ?? 'Employee').toUpperCase(),
                                    style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 0.8),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      // Dynamic Account Details
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: dk ? Colors.white.withValues(alpha: 0.03) : Colors.black.withValues(alpha: 0.02),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: borderCol),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Icon(Icons.account_balance_wallet_rounded, color: AppTheme.turquoise, size: 16),
                                    const SizedBox(width: 8),
                                    Text(
                                      'Compte Courant',
                                      style: TextStyle(color: mutedCol, fontSize: 11, fontWeight: FontWeight.w600),
                                    ),
                                  ],
                                ),
                                Text(
                                  '**** ${(p.userProfile?['compteRIB'] ?? '8829').toString().substring((p.userProfile?['compteRIB'] ?? '8829').toString().length - 4)}',
                                  style: TextStyle(color: textCol, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Solde Disponible',
                                  style: TextStyle(color: mutedCol, fontSize: 10, fontWeight: FontWeight.w600),
                                ),
                                Text(
                                  '${(p.userProfile?['compteSolde'] ?? 7531.67).toStringAsFixed(3)} TND',
                                  style: TextStyle(
                                    color: AppTheme.emerald,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: -0.5,
                                  ),
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

              // ── Content Scrollable Area ────────────────────────────────────
              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Section: RH Services
                      _drawerSection("RH DIGI", mutedCol),
                      Container(
                        decoration: BoxDecoration(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(color: borderCol),
                        ),
                        child: Column(
                          children: [
                            _drawerItem(Icons.beach_access_rounded, "Mes Congés", "60 j", textCol, mutedCol, () {
                              Navigator.pop(context);
                              _navigate(1);
                            }),
                            _divider(borderCol),
                            _drawerItem(Icons.payments_rounded, "Avances & Primes", "New", textCol, mutedCol, () {
                              Navigator.pop(context);
                              _navigate(1);
                            }),
                            _divider(borderCol),
                            _drawerItem(Icons.account_balance_wallet_rounded, "Mes Crédits", "90K", textCol, mutedCol, () {
                              Navigator.pop(context);
                              _navigate(1);
                            }),
                            _divider(borderCol),
                            _drawerItem(Icons.badge_rounded, "Carte & Certif.", "", textCol, mutedCol, () {
                              Navigator.pop(context);
                              _navigate(1);
                            }),
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 24),
                      
                       // Section: Services Bancaires
                       _drawerSection("SERVICES BANCAIRES", mutedCol),
                       Container(
                         decoration: BoxDecoration(
                           color: cardBg,
                           borderRadius: BorderRadius.circular(22),
                           border: Border.all(color: borderCol),
                         ),
                         child: Column(
                           children: [
                             _drawerItem(Icons.account_balance_wallet_rounded, "Mon Compte", "Chèque", textCol, mutedCol, () {
                               Navigator.pop(context);
                               Navigator.push(context, _slide(const AccountsScreen()));
                             }),
                             _divider(borderCol),
                             _drawerItem(Icons.credit_card_rounded, "Mes Cartes", "", textCol, mutedCol, () {
                               Navigator.pop(context);
                               Navigator.push(context, _slide(const CardsScreen()));
                             }),
                             _divider(borderCol),
                             _drawerItem(Icons.receipt_long_rounded, "Bills", "", textCol, mutedCol, () {
                               Navigator.pop(context);
                               _navigate(7);
                             }),
                             _divider(borderCol),
                             _drawerItem(Icons.phone_android_rounded, "Recharge", "", textCol, mutedCol, () {
                               Navigator.pop(context);
                               _navigate(8);
                             }),
                           ],
                         ),
                       ),

                       const SizedBox(height: 24),

                       // Section: Finance Personnelle
                       _drawerSection("FINANCE PERSONNELLE", mutedCol),
                       Container(
                         decoration: BoxDecoration(
                           color: cardBg,
                           borderRadius: BorderRadius.circular(22),
                           border: Border.all(color: borderCol),
                         ),
                         child: Column(
                           children: [
                             _drawerItem(Icons.trending_up_rounded, "Investissements", "+12.4%", textCol, mutedCol, () {
                               Navigator.pop(context);
                               Navigator.push(context, _slide(const InvestmentsScreen()));
                             }),
                             _divider(borderCol),
                             _drawerItem(Icons.wallet_rounded, "Budgets", "", textCol, mutedCol, () {
                               Navigator.pop(context);
                               _navigate(5);
                             }),
                             _divider(borderCol),
                             _drawerItem(Icons.description_rounded, "Documents", "📄", textCol, mutedCol, () {
                               Navigator.pop(context);
                               Navigator.push(context, _slide(const DocumentsScreen()));
                             }),
                             _divider(borderCol),
                             _drawerItem(Icons.bar_chart_rounded, "Analytics", "IA", textCol, mutedCol, () {
                               Navigator.pop(context);
                               Navigator.push(context, _slide(const AnalyticsScreen()));
                             }),
                           ],
                         ),
                       ),

                       const SizedBox(height: 24),

                       // Section: Communication
                       _drawerSection("COMMUNICATION", mutedCol),
                       Container(
                         decoration: BoxDecoration(
                           color: cardBg,
                           borderRadius: BorderRadius.circular(22),
                           border: Border.all(color: borderCol),
                         ),
                         child: Column(
                           children: [
                             _drawerItem(Icons.psychology_rounded, "STB Copilot AI", "Chat", textCol, mutedCol, () {
                               Navigator.pop(context);
                               _navigate(3);
                             }),
                           ],
                         ),
                       ),

                      const SizedBox(height: 24),

                      // Elite promo card advertisement
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 18),
                                const SizedBox(width: 8),
                                Text(
                                  "STB METAL UPGRADE",
                                  style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              "Unlock exclusive privileges, airport lounge access & 5% cashback.",
                              style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600, height: 1.4),
                            ),
                          ],
                        ),
                      ).animate().fadeIn(delay: 200.ms),

                      const SizedBox(height: 24),
                      
                      // Section: Settings & Toggle
                      _drawerSection("MORE OPTIONS", mutedCol),
                      Container(
                        decoration: BoxDecoration(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(color: borderCol),
                        ),
                        child: Column(
                          children: [
                            _drawerItem(Icons.settings_rounded, "App Settings", "", textCol, mutedCol, () {
                              Navigator.pop(context);
                              _navigate(4);
                            }),
                            _divider(borderCol),
                             _drawerItem(
                               dk ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                               dk ? "Switch to Light Mode" : "Switch to Dark Mode",
                               "",
                               textCol,
                               mutedCol,
                               () {
                                 p.toggleTheme();
                                 Navigator.pop(context);
                               },
                             ),
                             _divider(borderCol),
                             _drawerItem(
                               Icons.logout_rounded,
                               "Déconnexion",
                               "",
                               AppTheme.coralRed,
                               mutedCol,
                               () async {
                                 Navigator.pop(context);
                                 HapticFeedback.mediumImpact();
                                 await p.logout();
                                 if (!mounted) return;
                                 if (Platform.isAndroid) {
                                   SystemNavigator.pop();
                                 } else {
                                   exit(0);
                                 }
                               },
                             ),
                           ],
                         ),
                       ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _drawerSection(String title, Color col) {
    return Padding(
      padding: const EdgeInsets.only(left: 6, bottom: 10),
      child: Text(
        title,
        style: TextStyle(color: col, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1.5),
      ),
    );
  }

  Widget _divider(Color col) => Divider(color: col, height: 1, indent: 16, endIndent: 16);

  Widget _drawerItem(
    IconData icon,
    String label,
    String trailing,
    Color textCol,
    Color mutedCol,
    VoidCallback onTap,
  ) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          HapticFeedback.lightImpact();
          onTap();
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Icon(icon, color: AppTheme.electricBlue, size: 22),
              const SizedBox(width: 14),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(color: textCol, fontSize: 14, fontWeight: FontWeight.w700),
                ),
              ),
              if (trailing.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: trailing == "New" 
                        ? AppTheme.turquoise.withValues(alpha: 0.15) 
                        : trailing == "Active"
                            ? AppTheme.emerald.withValues(alpha: 0.15)
                            : textCol.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    trailing,
                    style: TextStyle(
                      color: trailing == "New" 
                          ? AppTheme.turquoise 
                          : trailing == "Active"
                              ? AppTheme.emerald
                              : mutedCol,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              const SizedBox(width: 4),
              Icon(Icons.chevron_right_rounded, color: mutedCol.withValues(alpha: 0.5), size: 18),
            ],
          ),
        ),
      ),
    );
  }

  PageRouteBuilder _slide(Widget page) {
    return PageRouteBuilder(
      pageBuilder: (_, __, ___) => page,
      transitionDuration: const Duration(milliseconds: 350),
      transitionsBuilder: (_, a, __, c) => SlideTransition(position: Tween<Offset>(begin: const Offset(1, 0), end: Offset.zero).animate(CurvedAnimation(parent: a, curve: Curves.easeOutCubic)), child: c),
    );
  }

  void _showVoiceSiri(BuildContext context, bool dk) {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: "Siri",
      barrierColor: Colors.black.withValues(alpha: 0.75),
      transitionDuration: const Duration(milliseconds: 400),
      pageBuilder: (context, anim1, anim2) {
        return _VoiceSiriOverlay(dk: dk, mainState: this);
      },
      transitionBuilder: (context, anim1, anim2, child) {
        return BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 12 * anim1.value, sigmaY: 12 * anim1.value),
          child: FadeTransition(
            opacity: anim1,
            child: ScaleTransition(
              scale: Tween<double>(begin: 1.1, end: 1.0).animate(CurvedAnimation(parent: anim1, curve: Curves.easeOutCubic)),
              child: child,
            ),
          ),
        );
      },
    );
  }
}

class _VoiceSiriOverlay extends StatefulWidget {
  final bool dk;
  final MainScreenState mainState;
  const _VoiceSiriOverlay({required this.dk, required this.mainState});

  @override
  State<_VoiceSiriOverlay> createState() => _VoiceSiriOverlayState();
}

class _VoiceSiriOverlayState extends State<_VoiceSiriOverlay> with SingleTickerProviderStateMixin {
  late AnimationController _animCtrl;
  final stt.SpeechToText _speech = stt.SpeechToText();
  final FlutterTts _tts = FlutterTts();
  final TextEditingController _textCtrl = TextEditingController();

  String _statusText = "Appuyez pour parler...";
  String _recognizedText = "";
  String _aiResponse = "";
  bool _isListening = false;
  bool _isProcessing = false;
  bool _isDone = false;
  bool _speechAvailable = false;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500))..repeat();
    _initSpeech();
  }

  Future<void> _initSpeech() async {
    // Detect iOS Simulator - STT causes native crash on simulator
    final isSimulator = Platform.environment.containsKey('SIMULATOR_DEVICE_NAME') ||
        Platform.environment['SIMULATOR_RUNTIME_VERSION'] != null ||
        !Platform.isIOS || Platform.localHostname.contains('Mac');

    if (!isSimulator) {
      try {
        _speechAvailable = await _speech.initialize(
          onError: (e) { if (mounted) setState(() { _statusText = '🎙️ Micro non disponible'; }); },
          onStatus: (s) { if ((s == 'done' || s == 'notListening') && mounted) setState(() => _isListening = false); },
        );
      } catch (_) { _speechAvailable = false; }
    } else {
      _speechAvailable = false;
    }

    if (_speechAvailable && mounted) _startListening();
    // Init TTS (works fine on simulator)
    try {
      await _tts.setLanguage('fr-FR');
      await _tts.setSpeechRate(0.48);
      await _tts.setVolume(1.0);
    } catch (_) {}
  }

  Future<void> _startListening() async {
    if (!_speechAvailable) {
      if (mounted) setState(() { _statusText = 'Tapez votre commande ci-dessous ↓'; });
      return;
    }
    setState(() {
      _isListening = true;
      _statusText = 'Je vous écoute...';
      _recognizedText = '';
      _aiResponse = '';
      _isDone = false;
    });
    await _speech.listen(
      onResult: (SpeechRecognitionResult val) {
        if (mounted) setState(() => _recognizedText = val.recognizedWords);
        if (val.finalResult && val.recognizedWords.isNotEmpty) {
          _processWithAI(val.recognizedWords);
        }
      },
      localeId: 'fr_FR',
      listenFor: const Duration(seconds: 15),
      pauseFor: const Duration(seconds: 3),
      listenOptions: stt.SpeechListenOptions(partialResults: true, cancelOnError: false),
    );
  }

  Future<void> _processWithAI(String spokenText) async {
    await _speech.stop();
    if (!mounted) return;
    setState(() {
      _isListening = false;
      _isProcessing = true;
      _statusText = 'Analyse en cours...';
    });
    HapticFeedback.mediumImpact();

    final p = Provider.of<AppProvider>(context, listen: false);
    final response = _localVoiceResponse(spokenText, p);

    if (!mounted) return;
    setState(() {
      _isProcessing = false;
      _isDone = true;
      _aiResponse = response;
      _statusText = 'Réponse du Copilot AI';
    });
    HapticFeedback.mediumImpact();

    // TTS speak
    try {
      final clean = response.replaceAll(RegExp(r'[*_#~`•]'), '').replaceAll('TND', 'Dinars');
      await _tts.speak(clean);
    } catch (_) {}

    // Navigation intent
    _handleNavIntent(spokenText.toLowerCase());

    // Auto-close after 6 seconds
    Future.delayed(const Duration(seconds: 6), () {
      if (mounted) Navigator.pop(context);
    });
  }

  String _localVoiceResponse(String text, AppProvider p) {
    final ql = text.toLowerCase();
    final prenom = p.userProfile?['prenom'] ?? 'Collaborateur';
    final solde = p.compteSolde > 0 ? p.compteSolde : p.salaireBase;
    final conges = p.soldeConges;
    final maxAvance = p.salaireBase * 1.5;

    if (ql.contains('solde') || ql.contains('compte') || ql.contains('argent')) {
      return '💰 Votre solde est de ${solde.toStringAsFixed(3)} dinars, $prenom.';
    }
    if (ql.contains('cong')) {
      return '🌴 Vous avez $conges jours de congé disponibles.';
    }
    if (ql.contains('avance') || ql.contains('acompte')) {
      return '💵 Vous êtes éligible à une avance de ${maxAvance.toStringAsFixed(0)} dinars maximum.';
    }
    if (ql.contains('salaire') || ql.contains('paie')) {
      return '💼 Votre salaire brut est de ${p.salaireBase.toStringAsFixed(3)} dinars.';
    }
    if (ql.contains('accueil') || ql.contains('home')) {
      return '🏠 Navigation vers l\'accueil...';
    }
    if (ql.contains('rh') || ql.contains('ressource')) {
      return '📄 Navigation vers l\'espace RH...';
    }
    if (ql.contains('copilot') || ql.contains('assistant') || ql.contains('chat')) {
      return '🤖 Navigation vers le Copilot AI...';
    }
    return '🤖 Bonjour $prenom ! Je peux vous informer sur votre solde, vos congés, votre salaire ou votre avance.';
  }

  void _handleNavIntent(String ql) {
    int? tab;
    if (ql.contains('accueil') || ql.contains('home') || ql.contains('tableau')) tab = 0;
    else if (ql.contains('rh') || ql.contains('conge') || ql.contains('congé') || ql.contains('ressource')) tab = 1;
    else if (ql.contains('copilot') || ql.contains('assistant') || ql.contains('chat')) tab = 3;
    else if (ql.contains('profil') || ql.contains('compte')) tab = 4;
    else if (ql.contains('budget') || ql.contains('épargne') || ql.contains('epargne')) tab = 5;

    if (tab != null) {
      final targetTab = tab;
      Future.delayed(const Duration(milliseconds: 1800), () {
        if (!mounted) return;
        if (Navigator.canPop(context)) Navigator.pop(context);
        MainScreenState.navigateGlobal(targetTab);
      });
    }
  }


  @override
  void dispose() {
    _animCtrl.dispose();
    _tts.stop();
    _textCtrl.dispose();
    try { _speech.stop(); } catch (_) {}
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Waveform Siri Orb
              GestureDetector(
                onTap: _isListening ? null : (_isDone ? () => Navigator.pop(context) : _startListening),
                child: Container(
                  width: 140, height: 140,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: _isDone
                          ? [AppTheme.emerald, Colors.teal, Colors.transparent]
                          : _isListening
                              ? [AppTheme.electricBlue, Colors.purple, Colors.transparent]
                              : [Colors.blueGrey, Colors.grey, Colors.transparent],
                      radius: 0.85,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: (_isDone ? AppTheme.emerald : AppTheme.electricBlue).withValues(alpha: 0.5),
                        blurRadius: 32, spreadRadius: 4,
                      )
                    ],
                  ),
                  child: AnimatedBuilder(
                    animation: _animCtrl,
                    builder: (_, __) {
                      final scale = _isListening
                          ? 1.0 + 0.15 * math.sin(_animCtrl.value * 2 * math.pi)
                          : 1.0;
                      return Transform.scale(
                        scale: scale,
                        child: Center(
                          child: Container(
                            width: 80, height: 80,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.15),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                            ),
                            child: Icon(
                              _isDone ? Icons.check_rounded : (_isProcessing ? Icons.hourglass_top_rounded : Icons.mic_rounded),
                              color: Colors.white,
                              size: 36,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(height: 32),
              // Status text
              Text(
                _statusText,
                style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 14, fontWeight: FontWeight.w600, letterSpacing: 0.5),
              ),
              const SizedBox(height: 12),
              // Recognized spoken text
              if (_recognizedText.isNotEmpty)
                AnimatedSize(
                  duration: const Duration(milliseconds: 300),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                    ),
                    child: Text(
                      '"$_recognizedText"',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700, letterSpacing: -0.3),
                    ),
                  ),
                ),
              if (_aiResponse.isNotEmpty) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.emerald.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    _aiResponse,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600, height: 1.5),
                  ),
                ).animate().fadeIn().slideY(begin: 0.1),
              ],
              const SizedBox(height: 24),

              // ── Text fallback when STT not available (simulator) ──────────
              if (!_speechAvailable && !_isDone) ...[
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 0),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                  ),
                  child: Row(children: [
                    const Icon(Icons.keyboard_rounded, color: Colors.white54, size: 18),
                    const SizedBox(width: 10),
                    Expanded(child: TextField(
                      controller: _textCtrl,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      decoration: const InputDecoration(
                        hintText: 'Tapez votre commande...',
                        hintStyle: TextStyle(color: Colors.white38),
                        border: InputBorder.none,
                      ),
                      onSubmitted: (v) { if (v.isNotEmpty) { _textCtrl.clear(); _processWithAI(v); } },
                    )),
                    GestureDetector(
                      onTap: () { final v = _textCtrl.text.trim(); if (v.isNotEmpty) { _textCtrl.clear(); _processWithAI(v); } },
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: AppTheme.electricBlue, shape: BoxShape.circle),
                        child: const Icon(Icons.send_rounded, color: Colors.white, size: 16))),
                  ]),
                ),
                const SizedBox(height: 8),
                // Quick commands
                Wrap(alignment: WrapAlignment.center, spacing: 6, runSpacing: 6,
                  children: [
                    '💰 Mon solde',
                    '🌴 Mes congés',
                    '💼 Mon salaire',
                    '💵 Avance',
                    '🏠 Aller accueil',
                    '🤖 Copilot',
                  ].map((cmd) => GestureDetector(
                    onTap: () { _textCtrl.clear(); _processWithAI(cmd); },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                      ),
                      child: Text(cmd, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                    ),
                  )).toList()),
                const SizedBox(height: 16),
              ],

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                      ),
                      child: const Text("Annuler", style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                    ),
                  ),
                  if (_speechAvailable && !_isListening && !_isProcessing && !_isDone) ...[
                    const SizedBox(width: 12),
                    GestureDetector(
                      onTap: _startListening,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        decoration: BoxDecoration(
                          color: AppTheme.electricBlue.withValues(alpha: 0.3),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppTheme.electricBlue.withValues(alpha: 0.5)),
                        ),
                        child: const Text("🎙️ Parler", style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
