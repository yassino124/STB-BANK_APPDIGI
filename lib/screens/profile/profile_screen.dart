import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../auth/login_screen.dart';
import '../auth/forgot_password_screen.dart';
import 'settings/biometrics_settings_screen.dart';
import 'settings/devices_settings_screen.dart';
import 'settings/two_fa_settings_screen.dart';
import 'settings/pin_code_screen.dart';
import '../copilot/copilot_screen.dart';
import '../../widgets/ai_predictive_banner.dart';
import 'dart:convert';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  static final Map<String, Uint8List> _avatarBytesCache = {};

  // Helper to decode base64 avatar
  DecorationImage? _getAvatarImage(String? avatar) {
    if (avatar == null || avatar.isEmpty) return null;
    
    try {
      // Check if it's a base64 data URI
      if (avatar.startsWith('data:image')) {
        final base64String = avatar.split(',')[1];
        Uint8List bytes;
        if (_avatarBytesCache.containsKey(base64String)) {
          bytes = _avatarBytesCache[base64String]!;
        } else {
          bytes = base64Decode(base64String);
          _avatarBytesCache[base64String] = bytes;
        }
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
      print('Error loading avatar: $e');
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    
    // Dynamic theme colors
    final scaffoldBg = dk ? const Color(0xFF030712) : const Color(0xFFF3F4F6);
    final cardBg = dk ? const Color(0xFF0B0F19) : Colors.white;
    final cardBorder = dk ? Colors.white.withValues(alpha: 0.06) : Colors.black.withValues(alpha: 0.04);
    final textColor = dk ? Colors.white : const Color(0xFF0F172A);
    final subtextColor = dk ? const Color(0xFF64748B) : const Color(0xFF94A3B8);
    final labelColor = dk ? const Color(0xFF475569) : const Color(0xFF64748B);
    final dividerColor = dk ? Colors.white.withValues(alpha: 0.05) : Colors.black.withValues(alpha: 0.05);

    final lang = p.currentLanguage;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: scaffoldBg,
        body: Column(
          children: [
            // FIXED BLUE HEADER PORTION
            Container(
              width: double.infinity,
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 24,
                bottom: 28,
                left: 20,
                right: 20,
              ),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF0D47A1), Color(0xFF0A3D91)],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
              child: Stack(
                alignment: Alignment.topCenter,
                children: [
                  // Drawer Menu Icon
                  Positioned(
                    left: 0, top: 0,
                    child: GestureDetector(
                      onTap: () {
                        HapticFeedback.lightImpact();
                        context.findRootAncestorStateOfType<ScaffoldState>()?.openDrawer();
                      },
                      child: Container(
                        width: 44, height: 44,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                        ),
                        child: const Icon(Icons.menu_rounded, color: Colors.white, size: 22),
                      ),
                    ),
                  ),
                  
                  Column(
                    children: [
                      // Stylized Squircle Avatar - dynamic from backend
                      Container(
                    width: 76,
                    height: 76,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      gradient: (p.userProfile?['avatar'] == null || (p.userProfile?['avatar'] as String).isEmpty)
                          ? LinearGradient(
                              colors: [Colors.white.withValues(alpha: 0.18), Colors.white.withValues(alpha: 0.05)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            )
                          : null,
                      color: (p.userProfile?['avatar'] != null && (p.userProfile?['avatar'] as String).isNotEmpty) ? Colors.transparent : null,
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.25), width: 1.5),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.12),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                      image: _getAvatarImage(p.userProfile?['avatar']),
                    ),
                    child: (p.userProfile?['avatar'] == null || (p.userProfile?['avatar'] as String).isEmpty)
                        ? Text(
                            p.userProfile != null && p.userProfile!['prenom'] != null && p.userProfile!['nom'] != null
                                ? '${p.userProfile!['prenom'][0]}${p.userProfile!['nom'][0]}'.toUpperCase()
                                : 'U',
                            style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
                          )
                        : null,
                  ).animate().scale(delay: 50.ms, duration: 300.ms),
                  const SizedBox(height: 16),
                  
                  // User Name
                  Text(
                    p.userProfile != null ? "${p.userProfile!['prenom']} ${p.userProfile!['nom']}" : "Chargement...",
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ).animate().fadeIn(delay: 100.ms),
                  const SizedBox(height: 4),

                  // Subtitle
                  Text(
                    p.userProfile != null ? "${p.userProfile!['poste'] ?? 'Employé STB'}" : _t(lang, 'client_premium'),
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.6),
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ).animate().fadeIn(delay: 150.ms),
                  const SizedBox(height: 20),

                  // Banking Account Pills/Chips
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _accountChip(p.userProfile != null ? p.userProfile!['matricule'] : _t(lang, 'current_account')),
                      const SizedBox(width: 8),
                      _accountChip(p.userProfile != null ? p.userProfile!['departement'] ?? 'STB Bank' : _t(lang, 'saving_account')),
                    ],
                  ).animate().fadeIn(delay: 200.ms),
                ],
              ),
            ],
          ),
        ),

            // SCROLLABLE SETTINGS SECTION
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
                child: Column(
                  children: [
                    // STB Copilot Insight Card
                    AIPredictiveBanner(
                      currentBalance: 1220.0,
                      isDark: dk,
                    ).animate().fadeIn(delay: 80.ms),
                    const SizedBox(height: 20),

                    // Dark Mode Card
                    _darkModeCard(p, dk, cardBg, cardBorder, textColor, subtextColor)
                        .animate()
                        .fadeIn(delay: 100.ms),
                    const SizedBox(height: 20),

                    // Language Selector Card
                    _languageSelector(p, dk, cardBg, cardBorder)
                        .animate()
                        .fadeIn(delay: 150.ms),
                    const SizedBox(height: 24),

                    // Security Card
                    _groupSection(
                      _t(lang, 'security'),
                      [
                        _customRowItem(
                          icon: Icons.security_rounded,
                          iconColor: const Color(0xFF10B981),
                          iconBg: const Color(0xFF10B981).withValues(alpha: 0.12),
                          title: _t(lang, 'auth_2fa'),
                          subtitle: _t(lang, 'auth_2fa_sub'),
                          textColor: textColor,
                          subtextColor: subtextColor,
                          dividerColor: dividerColor,
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TwoFASettingsScreen())),
                        ),
                        _customRowItem(
                          icon: Icons.devices_rounded,
                          iconColor: const Color(0xFF3B82F6),
                          iconBg: const Color(0xFF3B82F6).withValues(alpha: 0.12),
                          title: _t(lang, 'active_devices'),
                          subtitle: _t(lang, 'active_devices_sub'),
                          textColor: textColor,
                          subtextColor: subtextColor,
                          dividerColor: dividerColor,
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DevicesSettingsScreen())),
                        ),
                        _customRowItem(
                          icon: Icons.fingerprint_rounded,
                          iconColor: const Color(0xFF6366F1),
                          iconBg: const Color(0xFF6366F1).withValues(alpha: 0.12),
                          title: _t(lang, 'biometrics'),
                          subtitle: _t(lang, 'biometrics_sub'),
                          textColor: textColor,
                          subtextColor: subtextColor,
                          dividerColor: dividerColor,
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const BiometricsSettingsScreen())),
                        ),
                        _customRowItem(
                          icon: Icons.lock_outline_rounded,
                          iconColor: const Color(0xFFF59E0B),
                          iconBg: const Color(0xFFF59E0B).withValues(alpha: 0.12),
                          title: _t(lang, 'pin_code'),
                          subtitle: _t(lang, 'pin_code_sub'),
                          textColor: textColor,
                          subtextColor: subtextColor,
                          dividerColor: dividerColor,
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PinCodeSettingsScreen())),
                        ),
                        _customRowItem(
                          icon: Icons.key_rounded,
                          iconColor: const Color(0xFFEF4444),
                          iconBg: const Color(0xFFEF4444).withValues(alpha: 0.10),
                          title: lang == 'ar' ? 'تغيير كلمة المرور' : (lang == 'fr' ? 'Changer le mot de passe' : 'Change Password'),
                          subtitle: lang == 'ar' ? 'إعادة تعيين كلمتك السرية' : (lang == 'fr' ? 'Réinitialiser votre mot de passe' : 'Reset your password'),
                          textColor: textColor,
                          subtextColor: subtextColor,
                          isLast: true,
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ForgotPasswordScreen())),
                        ),
                      ],
                      dk,
                      labelColor,
                      cardBg,
                      cardBorder,
                    ).animate().fadeIn(delay: 200.ms),
                    const SizedBox(height: 24),

                    // Support Card
                    _groupSection(
                      _t(lang, 'support'),
                      [
                        _customRowItem(
                          icon: Icons.help_outline_rounded,
                          iconColor: const Color(0xFFF97316),
                          iconBg: const Color(0xFFF97316).withValues(alpha: 0.12),
                          title: _t(lang, 'help_center'),
                          subtitle: _t(lang, 'help_center_sub'),
                          textColor: textColor,
                          subtextColor: subtextColor,
                          dividerColor: dividerColor,
                          onTap: () {},
                        ),
                        _customRowItem(
                          icon: Icons.chat_bubble_outline_rounded,
                          iconColor: const Color(0xFF10B981),
                          iconBg: const Color(0xFF10B981).withValues(alpha: 0.12),
                          title: _t(lang, 'live_chat'),
                          subtitle: _t(lang, 'live_chat_sub'),
                          textColor: textColor,
                          subtextColor: subtextColor,
                          dividerColor: dividerColor,
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CopilotScreen())),
                        ),
                        _customRowItem(
                          icon: Icons.star_outline_rounded,
                          iconColor: const Color(0xFFEAB308),
                          iconBg: const Color(0xFFEAB308).withValues(alpha: 0.12),
                          title: _t(lang, 'rate_app'),
                          subtitle: _t(lang, 'rate_app_sub'),
                          textColor: textColor,
                          subtextColor: subtextColor,
                          isLast: true,
                          onTap: () {},
                        ),
                      ],
                      dk,
                      labelColor,
                      cardBg,
                      cardBorder,
                    ).animate().fadeIn(delay: 250.ms),
                    const SizedBox(height: 32),

                    // Logout Button
                    GestureDetector(
                      onTap: () async {
                        HapticFeedback.mediumImpact();
                        await context.read<AppProvider>().logout();
                        if (context.mounted) {
                          Navigator.pushAndRemoveUntil(
                            context,
                            MaterialPageRoute(builder: (_) => const LoginScreen()),
                            (route) => false,
                          );
                        }
                      },
                      child: Container(
                        height: 54,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444).withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.15)),
                        ),
                        child: Center(
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 18),
                              const SizedBox(width: 8),
                              Text(
                                _t(lang, 'logout'),
                                style: const TextStyle(color: Color(0xFFEF4444), fontSize: 15, fontWeight: FontWeight.w700),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ).animate().fadeIn(delay: 300.ms),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _accountChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: Colors.white.withValues(alpha: 0.9),
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _darkModeCard(AppProvider prov, bool dk, Color cardBg, Color cardBorder, Color textColor, Color subtextColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: cardBorder),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: const Color(0xFF818CF8).withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.dark_mode_rounded,
              color: Color(0xFF818CF8),
              size: 20,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  prov.currentLanguage == 'ar' ? 'الوضع الداكن' : (prov.currentLanguage == 'fr' ? 'Mode sombre' : 'Dark Mode'),
                  style: TextStyle(
                    color: textColor,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  prov.currentLanguage == 'ar'
                      ? 'مظهر التطبيق'
                      : (prov.currentLanguage == 'fr' ? "Thème de l'application" : "Application Theme"),
                  style: TextStyle(
                    color: subtextColor,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          Switch.adaptive(
            value: prov.themeMode == ThemeMode.dark,
            onChanged: (_) {
              HapticFeedback.mediumImpact();
              prov.toggleTheme();
            },
            activeTrackColor: const Color(0xFF0D47A1).withValues(alpha: 0.5),
            activeThumbColor: const Color(0xFF0D47A1),
          ),
        ],
      ),
    );
  }

  Widget _languageSelector(AppProvider prov, bool dk, Color cardBg, Color cardBorder) {
    final current = prov.currentLanguage;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            "LANGUE / LANGUAGE / اللغة",
            style: TextStyle(
              color: dk ? const Color(0xFF475569) : const Color(0xFF64748B),
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: cardBorder),
          ),
          child: Row(
            children: [
              _langBtn(prov, 'fr', '🇫🇷 FR', current == 'fr', dk),
              const SizedBox(width: 6),
              _langBtn(prov, 'en', '🇺🇸 EN', current == 'en', dk),
              const SizedBox(width: 6),
              _langBtn(prov, 'ar', '🇹🇳 AR', current == 'ar', dk),
            ],
          ),
        ),
      ],
    );
  }

  Widget _langBtn(AppProvider prov, String code, String label, bool active, bool dk) {
    return Expanded(
      child: GestureDetector(
        onTap: () {
          if (prov.currentLanguage != code) {
            HapticFeedback.mediumImpact();
            prov.setLanguage(code);
          }
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeInOut,
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: active
                ? const Color(0xFF0D47A1)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(14),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              color: active ? Colors.white : (dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }

  Widget _groupSection(String title, List<Widget> items, bool dk, Color labelColor, Color cardBg, Color cardBorder) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            title.toUpperCase(),
            style: TextStyle(
              color: labelColor,
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: cardBorder),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Column(children: items),
          ),
        ),
      ],
    );
  }

  Widget _customRowItem({
    required IconData icon,
    required Color iconColor,
    required Color iconBg,
    required String title,
    required String subtitle,
    required Color textColor,
    required Color subtextColor,
    Widget? trailing,
    bool isLast = false,
    Color? dividerColor,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          HapticFeedback.lightImpact();
          onTap();
        },
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: iconBg,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, color: iconColor, size: 18),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: TextStyle(
                            color: textColor,
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          subtitle,
                          style: TextStyle(
                            color: subtextColor,
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  trailing ?? Icon(Icons.chevron_right_rounded, color: subtextColor.withValues(alpha: 0.7), size: 18),
                ],
              ),
            ),
            if (!isLast && dividerColor != null)
              Padding(
                padding: const EdgeInsets.only(left: 68, right: 16),
                child: Divider(height: 1, color: dividerColor),
              ),
          ],
        ),
      ),
    );
  }

  static String _t(String code, String key) {
    final dict = {
      'en': {
        'client_premium': 'Premium Client • Since 2022',
        'current_account': 'Current account ••7294',
        'saving_account': 'Savings ••1837',
        'security': 'Security',
        'preferences': 'Preferences',
        'support': 'Support',
        'auth_2fa': '2FA Authentication',
        'auth_2fa_sub': 'Double verification enabled',
        'active_devices': 'Connected Devices',
        'active_devices_sub': '2 authorized devices',
        'biometrics': 'Biometrics',
        'biometrics_sub': 'Face ID & Fingerprint',
        'pin_code': 'PIN Code',
        'pin_code_sub': 'Change your passcode',
        'help_center': 'Help Center',
        'help_center_sub': 'FAQ & Documentation',
        'live_chat': 'Live Chat Support',
        'live_chat_sub': '24/7 Assistance',
        'rate_app': 'Rate the App',
        'rate_app_sub': 'Give us feedback',
        'logout': 'Log Out Account',
      },
      'fr': {
        'client_premium': 'Client Premium • Depuis 2022',
        'current_account': 'Compte courant ••7294',
        'saving_account': 'Épargne ••1837',
        'security': 'Sécurité',
        'preferences': 'Préférences',
        'support': 'Support',
        'auth_2fa': 'Authentification 2FA',
        'auth_2fa_sub': 'Double vérification activée',
        'active_devices': 'Appareils connectés',
        'active_devices_sub': '2 appareils autorisés',
        'biometrics': 'Biométrie',
        'biometrics_sub': 'Face ID & Empreinte digitale',
        'pin_code': 'Code PIN',
        'pin_code_sub': 'Modifier votre code secret',
        'help_center': 'Centre d\'aide',
        'help_center_sub': 'FAQ et guides',
        'live_chat': 'Support en direct',
        'live_chat_sub': 'Assistance 24h/24 & 7j/7',
        'rate_app': 'Évaluer l\'application',
        'rate_app_sub': 'Donnez votre avis',
        'logout': 'Se déconnecter',
      },
      'ar': {
        'client_premium': 'حريف ممتاز • منذ 2022',
        'current_account': 'الحساب الجاري ••7294',
        'saving_account': 'حساب الإدخار ••1837',
        'security': 'الأمان',
        'preferences': 'التفضيلات',
        'support': 'الدعم المساعد',
        'auth_2fa': 'المصادقة الثنائية',
        'auth_2fa_sub': 'التحقق الثنائي مفعل',
        'active_devices': 'الأجهزة المتصلة',
        'active_devices_sub': 'جهازان مصرح بهما',
        'biometrics': 'المؤشرات الحيوية',
        'biometrics_sub': 'بصمة الوجه والإصبع',
        'pin_code': 'رمز PIN',
        'pin_code_sub': 'تغيير الرمز السري الخاص بك',
        'help_center': 'مركز المساعدة',
        'help_center_sub': 'الأسئلة الشائعة والأدلة',
        'live_chat': 'الدعم المباشر',
        'live_chat_sub': 'مساعدة 24/7',
        'rate_app': 'تقييم التطبيق',
        'rate_app_sub': 'أرسل لنا ملاحظاتك',
        'logout': 'تسجيل الخروج',
      }
    };
    return dict[code]?[key] ?? key;
  }
}
