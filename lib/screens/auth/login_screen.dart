import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:local_auth/local_auth.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_api_service.dart';
import '../../services/websocket_service.dart';
import '../main_screen.dart';
import 'forgot_password_screen.dart';
import 'dart:ui';
import 'dart:math';

// ── Guest Demo Screens ────────────────────────────────────────────────────────
class GuestDashboardScreen extends StatelessWidget {
  const GuestDashboardScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return const MainScreen();
  }
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _userCtrl = TextEditingController(); // Empty by default so user types real ID
  final _passCtrl = TextEditingController();
  bool _loading = false;
  bool _scanning = false;
  bool _obscure = true;
  String? _errorMsg;
  String _loadingMsg = 'Connexion en cours...';
  final _localAuth = LocalAuthentication();

  String _deviceUUID = '';
  String _deviceName = 'Mobile Device';

  @override
  void initState() {
    super.initState();
    // 🏓 Warm up the Render backend silently as soon as login screen opens
    AuthApiService.pingServer();
    _initDevice();
  }

  Future<void> _initDevice() async {
    String? savedId = await AuthApiService.getDeviceUUID();
    if (savedId == null) {
      savedId = 'dev-${DateTime.now().millisecondsSinceEpoch}-${Random().nextInt(999999)}';
      await AuthApiService.saveDeviceUUID(savedId);
    }
    if (mounted) setState(() => _deviceUUID = savedId!);
  }

  @override
  void dispose() {
    _userCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  void _navigateToMain() {
    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const MainScreen(),
        transitionDuration: const Duration(milliseconds: 700),
        transitionsBuilder: (_, a, __, c) => FadeTransition(
          opacity: a,
          child: ScaleTransition(
            scale: Tween(begin: 0.97, end: 1.0).animate(
              CurvedAnimation(parent: a, curve: Curves.easeOutCubic),
            ),
            child: c,
          ),
        ),
      ),
    );
  }

  Future<void> _login() async {
    if (_userCtrl.text.trim().isEmpty || _passCtrl.text.isEmpty) {
      setState(() => _errorMsg = 'Matricule et mot de passe requis.');
      return;
    }
    setState(() { _loading = true; _errorMsg = null; _loadingMsg = 'Connexion en cours...'; });
    HapticFeedback.mediumImpact();

    // Show a secondary message after 8s in case Render is still waking up
    Future.delayed(const Duration(seconds: 8), () {
      if (mounted && _loading) {
        setState(() => _loadingMsg = 'Démarrage du serveur... ⏳');
      }
    });
    Future.delayed(const Duration(seconds: 25), () {
      if (mounted && _loading) {
        setState(() => _loadingMsg = 'Presque prêt... 🔄');
      }
    });

    final result = await AuthApiService.login(
      matricule: _userCtrl.text.trim(),
      password: _passCtrl.text,
      deviceUUID: _deviceUUID,
      deviceName: _deviceName,
    );

    if (!mounted) return;

    if (result.isSuccess && result.data != null) {
      await AuthApiService.saveTokens(
        accessToken: result.data!.accessToken,
        refreshToken: result.data!.refreshToken,
      );
      await AuthApiService.saveMatricule(_userCtrl.text.trim());
      await AuthApiService.saveDeviceUUID(_deviceUUID);

      if (result.data!.employee != null && mounted) {
        await context.read<AppProvider>().setProfileFromLogin(result.data!.employee!);
      }

      if (mounted) {
        final shouldEnable = await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            backgroundColor: Theme.of(ctx).cardColor,
            title: Text('Activer la biométrie?', style: TextStyle(color: Theme.of(ctx).colorScheme.onSurface)),
            content: Text('Voulez-vous activer Face ID / empreinte pour une connexion plus rapide?', style: TextStyle(color: Theme.of(ctx).colorScheme.onSurface.withValues(alpha: 0.7))),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Plus tard')),
              TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Activer')),
            ],
          ),
        );
        if (shouldEnable == true) {
          try {
            await AuthApiService.enableBiometrics(
              accessToken: result.data!.accessToken,
              type: 'BOTH',
              deviceUUID: _deviceUUID,
            );
            await AuthApiService.saveBiometricEnabled(true);
          } catch (_) {}
        }
      }

      setState(() => _loading = false);

      try {
        final ws = context.read<WebSocketService>();
        await ws.connect();
        ws.subscribeToChannel('notifications');
        ws.subscribeToChannel('messages');
        ws.subscribeToChannel('transactions');
      } catch (_) {}

      _navigateToMain();
    } else {
      setState(() {
        _loading = false;
        _errorMsg = result.error ?? 'Connexion échouée.';
      });
    }
  }

  Future<void> _biometric(String type) async {
    // Try real device biometrics via local_auth
    bool didAuthenticate = false;
    try {
      final available = await _localAuth.getAvailableBiometrics();
      if (available.isEmpty) {
        if (!mounted) return;
        setState(() => _errorMsg = 'Aucune biométrie configurée sur cet appareil. Utilisez votre mot de passe.');
        return;
      }
      
      didAuthenticate = await _localAuth.authenticate(
        localizedReason: type == 'faceid'
            ? 'Identifiez-vous avec Face ID pour STB'
            : 'Identifiez-vous avec votre empreinte pour STB',
        options: const AuthenticationOptions(stickyAuth: true, biometricOnly: true),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _errorMsg = 'Erreur biométrique: Veuillez utiliser votre mot de passe.');
      return;
    }

    if (!mounted) return;

    if (!didAuthenticate) {
      setState(() => _errorMsg = 'Authentification biométrique annulée ou échouée.');
      return;
    }

    HapticFeedback.heavyImpact();
    setState(() { _scanning = true; _errorMsg = null; });

    final matricule = (await AuthApiService.getMatricule()) ?? _userCtrl.text.trim();
    if (matricule.isEmpty) {
      setState(() {
        _scanning = false;
        _errorMsg = 'Veuillez entrer votre matricule d\'abord, ou vous connecter par mot de passe pour activer la biométrie.';
      });
      return;
    }

    final biometricType = type == 'faceid' ? 'FACE_ID' : 'FINGERPRINT';
    final result = await AuthApiService.biometricLogin(
      matricule: matricule,
      deviceUUID: _deviceUUID,
      biometricType: biometricType,
    );

    if (!mounted) return;
    setState(() => _scanning = false);

    if (result.isSuccess && result.data != null) {
      await AuthApiService.saveTokens(
        accessToken: result.data!.accessToken,
        refreshToken: result.data!.refreshToken,
      );
      _navigateToMain();
    } else {
      setState(() => _errorMsg = result.error ?? 'Appareil non reconnu. Veuillez utiliser votre mot de passe.');
    }
  }

  void _exploreGuest(String type) {
    HapticFeedback.mediumImpact();
    Navigator.pop(context);
    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const MainScreen(),
        transitionDuration: const Duration(milliseconds: 700),
        transitionsBuilder: (_, a, __, c) => FadeTransition(opacity: a, child: c),
      ),
    );
  }

  void _showGuestSheet() {
    final p = Provider.of<AppProvider>(context, listen: false);
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) {
        final dk = Theme.of(context).brightness == Brightness.dark;
        final bg = dk ? const Color(0xFF0D1829) : Colors.white;
        final fg = dk ? Colors.white : const Color(0xFF0F172A);
        final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
        final bd = dk ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.05);

        return Container(
          padding: EdgeInsets.fromLTRB(24, 28, 24, MediaQuery.of(context).padding.bottom + 32),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(36)),
            border: Border.all(color: bd),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 44, height: 4,
                decoration: BoxDecoration(
                  color: mt.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 28),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.electricBlue.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.explore_rounded, color: AppTheme.electricBlue, size: 32),
              ),
              const SizedBox(height: 18),
              Text(p.translate('explore_title'), style: TextStyle(color: fg, fontSize: 22, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Text(
                p.translate('explore_subtitle'),
                textAlign: TextAlign.center,
                style: TextStyle(color: mt, fontSize: 13, height: 1.5),
              ),
              const SizedBox(height: 28),

              // Particulier card
              _guestCard(
                icon: Icons.person_rounded,
                title: p.translate('particular'),
                subtitle: p.translate('particular_desc'),
                color: AppTheme.electricBlue,
                fg: fg, mt: mt, bd: bd,
                onTap: () => _exploreGuest('particulier'),
              ),
              const SizedBox(height: 14),

              // Entreprise card
              _guestCard(
                icon: Icons.business_center_rounded,
                title: p.translate('company'),
                subtitle: p.translate('company_desc'),
                color: const Color(0xFF7C3AED),
                fg: fg, mt: mt, bd: bd,
                onTap: () => _exploreGuest('entreprise'),
              ),
              const SizedBox(height: 20),

              Text(
                p.translate('demo_mode'),
                style: TextStyle(color: mt.withValues(alpha: 0.6), fontSize: 10, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _guestCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required Color fg,
    required Color mt,
    required Color bd,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          border: Border.all(color: color.withValues(alpha: 0.3), width: 1.5),
          borderRadius: BorderRadius.circular(22),
          color: color.withValues(alpha: 0.05),
        ),
        child: Row(
          children: [
            Container(
              width: 52, height: 52,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(icon, color: color, size: 26),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(color: fg, fontSize: 16, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 3),
                  Text(subtitle, style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w500)),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios_rounded, color: color, size: 16),
          ],
        ),
      ),
    );
  }

  Widget _langBtn(String label, String code, String current, AppProvider p) {
    final active = current == code;
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        p.setLanguage(code);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: active ? AppTheme.electricBlue.withValues(alpha: 0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: active ? AppTheme.electricBlue : (Theme.of(context).brightness == Brightness.dark ? Colors.white54 : Colors.black54),
            fontSize: 11,
            fontWeight: active ? FontWeight.w900 : FontWeight.w700,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final fg = Theme.of(context).colorScheme.onSurface;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.04);

    final bgGrad = dk
        ? const LinearGradient(
            colors: [Color(0xFF030B1A), Color(0xFF060F22), Color(0xFF020917)],
            begin: Alignment.topCenter, end: Alignment.bottomCenter)
        : const LinearGradient(
            colors: [Color(0xFFF0F5FF), Color(0xFFEBF2FF), Color(0xFFE4EEF8)],
            begin: Alignment.topCenter, end: Alignment.bottomCenter);

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(gradient: bgGrad),
        child: Stack(
          children: [
            // BG orbs
            Positioned(
              top: -80, left: -80,
              child: Container(
                width: 300, height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.electricBlue.withValues(alpha: dk ? 0.18 : 0.07),
                ),
              ).animate(onPlay: (c) => c.repeat(reverse: true))
               .scale(begin: const Offset(1,1), end: const Offset(1.2,1.2), duration: 4.seconds)
               .blur(begin: const Offset(60,60), end: const Offset(90,90)),
            ),
            Positioned(
              bottom: 100, right: -60,
              child: Container(
                width: 240, height: 240,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.turquoise.withValues(alpha: dk ? 0.12 : 0.05),
                ),
              ).animate(onPlay: (c) => c.repeat(reverse: true))
               .scale(begin: const Offset(1,1), end: const Offset(1.15,1.15), duration: 5.seconds)
               .blur(begin: const Offset(50,50), end: const Offset(80,80)),
            ),

            SafeArea(
              child: Column(
                children: [
                  // ── SCROLLABLE BODY ─────────────────────────────────────────
                  Expanded(
                    child: CustomScrollView(
                      physics: const BouncingScrollPhysics(),
                      slivers: [
                        SliverFillRemaining(
                          hasScrollBody: false,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                            child: Column(
                              children: [
                                const SizedBox(height: 16),

                                // ── LOGO + TITLE ─────────────────────────────
                                _buildHeader(fg, mt, dk, cd, bd, p),

                                const SizedBox(height: 28),

                                // ── LOGIN CARD ───────────────────────────────
                                _buildLoginCard(fg, mt, cd, bd, dk, p),

                                const SizedBox(height: 20),

                                // ── BIOMETRICS ───────────────────────────────
                                _buildBiometrics(mt, cd, bd, p),

                                const Spacer(),

                                // ── GUEST MODE ───────────────────────────────
                                _buildGuestButton(mt, p),

                                const SizedBox(height: 16),

                                // ── QUICK UTILS ──────────────────────────────
                                _buildQuickUtils(mt, cd, bd, dk),

                                const SizedBox(height: 20),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // ── PREMIUM LANGUAGE SELECTOR ─────────────────────────────────────
            Positioned(
              top: MediaQuery.of(context).padding.top + 10,
              right: 20,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                decoration: BoxDecoration(
                  color: dk ? Colors.white.withValues(alpha: 0.04) : Colors.black.withValues(alpha: 0.02),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: bd),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _langBtn('FR', 'fr', p.currentLanguage, p),
                    const SizedBox(width: 2),
                    _langBtn('EN', 'en', p.currentLanguage, p),
                    const SizedBox(width: 2),
                    _langBtn('AR', 'ar', p.currentLanguage, p),
                  ],
                ),
              ),
            ),

            // Biometric overlay
            if (_scanning) _buildBiometricOverlay(p),
          ],
        ),
      ),
    );
  }

  // ── HEADER ──────────────────────────────────────────────────────────────────
  Widget _buildHeader(Color fg, Color mt, bool dk, Color cd, Color bd, AppProvider p) {
    return Column(
      children: [
        Image.asset(
          'public/logo for splash.png',
          height: 80,
          fit: BoxFit.contain,
          errorBuilder: (_, __, ___) => Container(
            width: 76, height: 76,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              gradient: const LinearGradient(colors: [AppTheme.royalBlue, AppTheme.electricBlue]),
              boxShadow: [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.35), blurRadius: 20, offset: const Offset(0, 8))],
            ),
            child: const Icon(Icons.shield_rounded, color: Colors.white, size: 38),
          ),
        ).animate().scale(duration: 600.ms, curve: Curves.easeOutBack),
        const SizedBox(height: 14),
        Text(p.translate('login_title'), style: TextStyle(color: fg, fontSize: 22, fontWeight: FontWeight.w900, letterSpacing: 3))
            .animate().fadeIn(delay: 150.ms),
        const SizedBox(height: 4),
        Text('Espace Collaborateur', style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600))
            .animate().fadeIn(delay: 250.ms),
      ],
    );
  }

  // ── LOGIN CARD ──────────────────────────────────────────────────────────────
  Widget _buildLoginCard(Color fg, Color mt, Color cd, Color bd, bool dk, AppProvider p) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: cd,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: bd),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: dk ? 0.2 : 0.04), blurRadius: 24, offset: const Offset(0, 10))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(p.translate('client_space'), style: TextStyle(color: mt, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
          const SizedBox(height: 16),

          // Username
          _inputField(
            controller: _userCtrl,
            label: p.translate('username'),
            icon: Icons.person_outline_rounded,
            obscure: false,
            fg: fg, mt: mt, bd: bd, dk: dk,
          ),
          const SizedBox(height: 12),

          // Password
          _inputField(
            controller: _passCtrl,
            label: p.translate('password'),
            icon: Icons.lock_outline_rounded,
            obscure: _obscure,
            fg: fg, mt: mt, bd: bd, dk: dk,
            suffix: IconButton(
              icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined, color: mt, size: 20),
              onPressed: () => setState(() => _obscure = !_obscure),
            ),
          ),
          const SizedBox(height: 8),

          Align(
            alignment: Alignment.centerRight,
            child: GestureDetector(
              onTap: () {
                HapticFeedback.lightImpact();
                Navigator.push(context, MaterialPageRoute(builder: (_) => const ForgotPasswordScreen()));
              },
              child: Text(p.translate('forgot_password'), style: TextStyle(color: AppTheme.electricBlue, fontSize: 12, fontWeight: FontWeight.w700)),
            ),
          ),
          const SizedBox(height: 16),

          // Login button
          GestureDetector(
            onTap: _loading ? null : _login,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              height: 54,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: _loading
                      ? [AppTheme.electricBlue.withValues(alpha: 0.6), AppTheme.royalBlue.withValues(alpha: 0.6)]
                      : [AppTheme.electricBlue, AppTheme.royalBlue],
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.35), blurRadius: 14, offset: const Offset(0, 5))],
              ),
              child: Center(
                child: _loading
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
                          const SizedBox(width: 10),
                          Text(_loadingMsg, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                        ],
                      )
                    : Text(p.translate('sign_in'), style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
              ),
            ),
          ),
          if (_errorMsg != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    const Icon(Icons.error_outline_rounded, color: Color(0xFFEF4444), size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _errorMsg!,
                        style: const TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ]),
                  if (_errorMsg!.contains('démarre') || _errorMsg!.contains('Impossible')) ...[
                    const SizedBox(height: 8),
                    GestureDetector(
                      onTap: _loading ? null : _login,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppTheme.electricBlue.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Row(mainAxisSize: MainAxisSize.min, children: [
                          Icon(Icons.refresh_rounded, color: AppTheme.electricBlue, size: 14),
                          SizedBox(width: 5),
                          Text('Réessayer', style: TextStyle(color: AppTheme.electricBlue, fontSize: 12, fontWeight: FontWeight.w700)),
                        ]),
                      ),
                    ),
                  ],
                ],
              ),
            ).animate().fadeIn().shakeX(duration: 400.ms),
          ],
        ],
      ),
    ).animate().fadeIn(delay: 200.ms);
  }

  Widget _inputField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required bool obscure,
    required Color fg,
    required Color mt,
    required Color bd,
    required bool dk,
    Widget? suffix,
  }) {
    return Container(
      height: 54,
      decoration: BoxDecoration(
        color: dk ? Colors.white.withValues(alpha: 0.03) : Colors.black.withValues(alpha: 0.01),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: bd),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscure,
        style: TextStyle(color: fg, fontSize: 14, fontWeight: FontWeight.w700),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: mt, fontSize: 13, fontWeight: FontWeight.w600),
          prefixIcon: Icon(icon, color: AppTheme.electricBlue, size: 20),
          suffixIcon: suffix,
          border: InputBorder.none,
          floatingLabelBehavior: FloatingLabelBehavior.auto,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        ),
      ),
    );
  }

  // ── BIOMETRICS ──────────────────────────────────────────────────────────────
  Widget _buildBiometrics(Color mt, Color cd, Color bd, AppProvider p) {
    return Column(
      children: [
        Text(p.translate('or_biometric'),
            style: TextStyle(color: mt, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _bioBtn(Icons.fingerprint_rounded, cd, bd, () => _biometric('fingerprint')),
            const SizedBox(width: 24),
            _bioBtn(Icons.face_unlock_rounded, cd, bd, () => _biometric('faceid')),
          ],
        ),
      ],
    ).animate().fadeIn(delay: 300.ms);
  }

  Widget _bioBtn(IconData icon, Color cd, Color bd, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 60, height: 60,
        decoration: BoxDecoration(color: cd, shape: BoxShape.circle, border: Border.all(color: bd)),
        child: Icon(icon, color: AppTheme.electricBlue, size: 28),
      ),
    );
  }

  // ── GUEST BUTTON ────────────────────────────────────────────────────────────
  Widget _buildGuestButton(Color mt, AppProvider p) {
    return GestureDetector(
      onTap: _showGuestSheet,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        decoration: BoxDecoration(
          border: Border.all(color: AppTheme.turquoise.withValues(alpha: 0.4), width: 1.5),
          borderRadius: BorderRadius.circular(18),
          color: AppTheme.turquoise.withValues(alpha: 0.05),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.explore_outlined, color: AppTheme.turquoise, size: 20),
            const SizedBox(width: 10),
            Text(
              p.translate('explore_guest'),
              style: const TextStyle(color: AppTheme.turquoise, fontSize: 13, fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: 400.ms);
  }

  // ── QUICK UTILS ─────────────────────────────────────────────────────────────
  Widget _buildQuickUtils(Color mt, Color cd, Color bd, bool dk) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: [
          _util(Icons.location_on_outlined, 'Agences', mt, cd, bd, () => _showAgencesSheet(dk, cd, bd, mt)),
          const SizedBox(width: 12),
          _util(Icons.phone_in_talk_outlined, 'Contact', mt, cd, bd, () => _showContactSheet(dk, cd, bd, mt)),
          const SizedBox(width: 12),
          _util(Icons.calculate_outlined, 'Simulateur', mt, cd, bd, () => _showSimulateurSheet(dk, cd, bd, mt)),
          const SizedBox(width: 12),
          _util(Icons.currency_exchange_outlined, 'Convertisseur', mt, cd, bd, () => _showConvertisseurSheet(dk, cd, bd, mt)),
          const SizedBox(width: 12),
          _util(Icons.info_outline_rounded, 'À Propos', mt, cd, bd, () => _showAboutSheet(dk, cd, bd, mt)),
        ],
      ),
    ).animate().fadeIn(delay: 500.ms);
  }

  Widget _util(IconData icon, String label, Color mt, Color cd, Color bd, VoidCallback onTap) {
    return GestureDetector(
      onTap: () { HapticFeedback.lightImpact(); onTap(); },
      child: Column(
        children: [
          Container(
            width: 52, height: 52,
            decoration: BoxDecoration(color: cd, shape: BoxShape.circle, border: Border.all(color: bd),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 4))]),
            child: Icon(icon, color: AppTheme.electricBlue, size: 22),
          ),
          const SizedBox(height: 6),
          Text(label, style: TextStyle(color: mt, fontSize: 10, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  Widget _utilSmall(IconData icon, String label, Color mt, Color cd, Color bd, VoidCallback onTap) {
    return GestureDetector(
      onTap: () { HapticFeedback.lightImpact(); onTap(); },
      child: Column(
        children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(color: cd, shape: BoxShape.circle, border: Border.all(color: bd),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 4))]),
            child: Icon(icon, color: AppTheme.electricBlue, size: 18),
          ),
          const SizedBox(height: 5),
          Text(label, style: TextStyle(color: mt, fontSize: 9, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  // ── QUICK UTILS MODAL SHEETS ──────────────────────────────────────────────────

  // 1. AGENCES (MAP + LIST)
  void _showAgencesSheet(bool dk, Color cd, Color bd, Color mt) {
    final fg = dk ? Colors.white : const Color(0xFF0F172A);
    final bg = dk ? const Color(0xFF0D1829) : Colors.white;
    final Map<String, dynamic> tunisSiege = {
      'name': 'Siege Social Tunis',
      'address': 'Rue Hedi Nouira, Tunis',
      'phone': '71 116 000',
      'lat': 0.35, 'lng': 0.42,
      'hours': '08:00 - 14:00',
    };
    final List<Map<String, dynamic>> agencies = [
      tunisSiege,
      {
        'name': 'Agence Les Berges du Lac 2',
        'address': 'Rue de la Feuille d\'Erable, Tunis',
        'phone': '71 960 100',
        'lat': 0.45, 'lng': 0.52,
        'hours': '08:00 - 14:00',
      },
      {
        'name': 'Agence Sousse Corniche',
        'address': 'Boulevard 14 Janvier, Sousse',
        'phone': '73 224 500',
        'lat': 0.65, 'lng': 0.60,
        'hours': '08:00 - 14:00',
      },
      {
        'name': 'Agence Sfax El Boustan',
        'address': 'Avenue de la Liberté, Sfax',
        'phone': '74 440 200',
        'lat': 0.78, 'lng': 0.55,
        'hours': '08:00 - 14:00',
      },
    ];

    int selectedIndex = 0;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => StatefulBuilder(builder: (ctx, setSheet) {
        final activeAgency = agencies[selectedIndex];
        return DraggableScrollableSheet(
          initialChildSize: 0.85,
          maxChildSize: 0.95,
          minChildSize: 0.6,
          builder: (_, scrollCtrl) {
            return Container(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              decoration: BoxDecoration(
                color: bg,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(36)),
                border: Border.all(color: bd),
              ),
              child: ListView(
                controller: scrollCtrl,
                children: [
                  Center(child: Container(width: 44, height: 4, decoration: BoxDecoration(color: mt.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2)))),
                  const SizedBox(height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Agences STB & Distributeurs', style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w900)),
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(color: cd, shape: BoxShape.circle, border: Border.all(color: bd)),
                          child: Icon(Icons.close_rounded, color: fg, size: 18),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Search Bar
                  Container(
                    height: 48,
                    decoration: BoxDecoration(
                      color: dk ? Colors.white.withValues(alpha: 0.04) : Colors.black.withValues(alpha: 0.02),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: bd),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    child: Row(
                      children: [
                        Icon(Icons.search_rounded, color: mt, size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w600),
                            decoration: InputDecoration(
                              hintText: 'Rechercher une agence...',
                              hintStyle: TextStyle(color: mt.withValues(alpha: 0.5), fontSize: 13),
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Map Canvas
                  Container(
                    height: 220,
                    decoration: BoxDecoration(
                      color: dk ? const Color(0xFF070E1A) : const Color(0xFFEDF2F7),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: bd),
                    ),
                    child: Stack(
                      children: [
                        // Map grid background
                        Positioned.fill(
                          child: CustomPaint(
                            painter: _MapGridPainter(dk),
                          ),
                        ),
                        // Neon path connecting agencies
                        Positioned.fill(
                          child: CustomPaint(
                            painter: _MapPathPainter(agencies, selectedIndex),
                          ),
                        ),
                        // Agency pins
                        ...agencies.asMap().entries.map((e) {
                          final i = e.key;
                          final a = e.value;
                          final active = i == selectedIndex;
                          return Positioned(
                            left: 200 * (a['lat'] as double),
                            top: 220 * (a['lng'] as double),
                            child: GestureDetector(
                              onTap: () {
                                HapticFeedback.selectionClick();
                                setSheet(() => selectedIndex = i);
                              },
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  if (active)
                                    Container(
                                      width: 24, height: 24,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: AppTheme.electricBlue.withValues(alpha: 0.3),
                                      ),
                                    ).animate(onPlay: (c) => c.repeat(reverse: true))
                                     .scale(begin: const Offset(0.8, 0.8), end: const Offset(1.6, 1.6), duration: 1.seconds),
                                  Container(
                                    width: 12, height: 12,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: active ? AppTheme.electricBlue : Colors.redAccent,
                                      border: Border.all(color: Colors.white, width: 2),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Selected Agency Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: cd,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: bd),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44, height: 44,
                          decoration: BoxDecoration(
                            color: AppTheme.electricBlue.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.pin_drop_rounded, color: AppTheme.electricBlue, size: 22),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(activeAgency['name'] as String, style: TextStyle(color: fg, fontSize: 14, fontWeight: FontWeight.w800)),
                              const SizedBox(height: 4),
                              Text(activeAgency['address'] as String, style: TextStyle(color: mt, fontSize: 11, fontWeight: FontWeight.w600)),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.access_time_rounded, color: AppTheme.emerald, size: 12),
                                  const SizedBox(width: 4),
                                  Text(activeAgency['hours'] as String, style: const TextStyle(color: AppTheme.emerald, fontSize: 11, fontWeight: FontWeight.w700)),
                                ],
                              ),
                            ],
                          ),
                        ),
                        GestureDetector(
                          onTap: () => Clipboard.setData(ClipboardData(text: activeAgency['phone'] as String)),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: AppTheme.electricBlue.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Text('Appeler', style: TextStyle(color: AppTheme.electricBlue, fontSize: 11, fontWeight: FontWeight.w800)),
                          ),
                        ),
                      ],
                    ),
                  ).animate(key: ValueKey(selectedIndex)).fadeIn(duration: 200.ms),
                  const SizedBox(height: 18),

                  // Agencies List
                  ...agencies.asMap().entries.map((e) {
                    final i = e.key;
                    final a = e.value;
                    final sel = i == selectedIndex;
                    return GestureDetector(
                      onTap: () {
                        HapticFeedback.lightImpact();
                        setSheet(() => selectedIndex = i);
                      },
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: sel ? AppTheme.electricBlue.withValues(alpha: 0.04) : Colors.transparent,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: sel ? AppTheme.electricBlue.withValues(alpha: 0.3) : bd),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.location_on_rounded, color: sel ? AppTheme.electricBlue : mt.withValues(alpha: 0.6), size: 18),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(a['name'] as String, style: TextStyle(color: fg, fontSize: 12, fontWeight: sel ? FontWeight.w800 : FontWeight.w600)),
                            ),
                            Icon(Icons.chevron_right_rounded, color: mt, size: 16),
                          ],
                        ),
                      ),
                    );
                  }),
                  const SizedBox(height: 32),
                ],
              ),
            );
          },
        );
      }),
    );
  }

  // 2. CONTACT
  void _showContactSheet(bool dk, Color cd, Color bd, Color mt) {
    final fg = dk ? Colors.white : const Color(0xFF0F172A);
    final bg = dk ? const Color(0xFF0D1829) : Colors.white;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) {
        return Container(
          padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).padding.bottom + 24),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(36)),
            border: Border.all(color: bd),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(width: 44, height: 4, decoration: BoxDecoration(color: mt.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Relation Client STB', style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w800)),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(color: cd, shape: BoxShape.circle, border: Border.all(color: bd)),
                      child: Icon(Icons.close_rounded, color: fg, size: 18),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              _contactCard(Icons.phone_rounded, 'Centre de relation client', '71 116 000', fg, mt, cd, bd),
              const SizedBox(height: 10),
              _contactCard(Icons.alternate_email_rounded, 'Adresse E-mail', 'relations.client@stb.com.tn', fg, mt, cd, bd),
              const SizedBox(height: 10),
              _contactCard(Icons.chat_bubble_outline_rounded, 'WhatsApp', '+216 29 116 000', fg, mt, cd, bd),

              const SizedBox(height: 20),
              Text('Notre support client est disponible 24h/7.', style: TextStyle(color: mt, fontSize: 11, fontWeight: FontWeight.w600)),
            ],
          ),
        );
      },
    );
  }

  Widget _contactCard(IconData icon, String label, String value, Color fg, Color mt, Color cd, Color bd) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cd,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: bd),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: AppTheme.electricBlue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: AppTheme.electricBlue, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(color: mt, fontSize: 10, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(value, style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w800)),
              ],
            ),
          ),
          GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              Clipboard.setData(ClipboardData(text: value));
            },
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: AppTheme.electricBlue.withValues(alpha: 0.1), shape: BoxShape.circle),
              child: const Icon(Icons.copy_rounded, color: AppTheme.electricBlue, size: 14),
            ),
          ),
        ],
      ),
    );
  }

  // 3. CREDIT SIMULATOR
  void _showSimulateurSheet(bool dk, Color cd, Color bd, Color mt) {
    final fg = dk ? Colors.white : const Color(0xFF0F172A);
    final bg = dk ? const Color(0xFF0D1829) : Colors.white;

    double amount = 20000;
    int duration = 36;
    String type = 'consommation'; // consommation, auto, immobilier

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => StatefulBuilder(builder: (ctx, setSheet) {
        double rate = 0.095; // Auto
        if (type == 'consommation') rate = 0.11;
        if (type == 'immobilier') rate = 0.082;

        final monthlyRate = rate / 12;
        final monthlyPayment = (amount * monthlyRate) / (1 - pow(1 + monthlyRate, -duration));
        final totalRepayment = monthlyPayment * duration;
        final totalInterest = totalRepayment - amount;

        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
          child: Container(
            padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).padding.bottom + 24),
            decoration: BoxDecoration(
              color: bg,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(36)),
              border: Border.all(color: bd),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(child: Container(width: 44, height: 4, decoration: BoxDecoration(color: mt.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2)))),
                const SizedBox(height: 18),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Simulateur de Crédit', style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w800)),
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(color: cd, shape: BoxShape.circle, border: Border.all(color: bd)),
                        child: Icon(Icons.close_rounded, color: fg, size: 18),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),

                // Type selector
                Row(
                  children: [
                    _typeTab('Consommation', 'consommation', type, cd, bd, setSheet),
                    const SizedBox(width: 8),
                    _typeTab('Auto', 'auto', type, cd, bd, setSheet),
                    const SizedBox(width: 8),
                    _typeTab('Immobilier', 'immobilier', type, cd, bd, setSheet),
                  ],
                ),
                const SizedBox(height: 24),

                // Live output panel
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [AppTheme.royalBlue, AppTheme.electricBlue]),
                    borderRadius: BorderRadius.circular(22),
                    boxShadow: [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.3), blurRadius: 14, offset: const Offset(0, 6))],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('MENSUALITÉ ESTIMÉE', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 9, fontWeight: FontWeight.w900)),
                          const SizedBox(height: 4),
                          Text('${monthlyPayment.toStringAsFixed(2)} TND', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
                        child: Text('Taux ${rate * 100}%', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Amount slider
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Montant de crédit', style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w800)),
                    Text('${amount.toInt().toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]} ')} TND', style: const TextStyle(color: AppTheme.electricBlue, fontSize: 14, fontWeight: FontWeight.w900)),
                  ],
                ),
                Slider(
                  value: amount,
                  min: 5000,
                  max: 150000,
                  divisions: 145,
                  activeColor: AppTheme.electricBlue,
                  inactiveColor: mt.withValues(alpha: 0.15),
                  onChanged: (v) => setSheet(() => amount = v),
                ),
                const SizedBox(height: 16),

                // Duration slider
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Durée de remboursement', style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w800)),
                    Text('$duration mois', style: const TextStyle(color: AppTheme.electricBlue, fontSize: 14, fontWeight: FontWeight.w900)),
                  ],
                ),
                Slider(
                  value: duration.toDouble(),
                  min: 12,
                  max: 84,
                  divisions: 6,
                  activeColor: AppTheme.electricBlue,
                  inactiveColor: mt.withValues(alpha: 0.15),
                  onChanged: (v) => setSheet(() => duration = v.toInt()),
                ),
                const SizedBox(height: 20),

                // Summary details
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Total des intérêts', style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
                    Text('${totalInterest.toStringAsFixed(2)} TND', style: TextStyle(color: fg, fontSize: 12, fontWeight: FontWeight.w800)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Remboursement total', style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
                    Text('${totalRepayment.toStringAsFixed(2)} TND', style: TextStyle(color: fg, fontSize: 12, fontWeight: FontWeight.w800)),
                  ],
                ),
              ],
            ),
          ),
        );
      }),
    );
  }

  Widget _typeTab(String label, String code, String current, Color cd, Color bd, StateSetter setSheet) {
    final active = code == current;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          HapticFeedback.lightImpact();
          setSheet(() => current = code);
        },
        child: Container(
          height: 40,
          decoration: BoxDecoration(
            color: active ? AppTheme.electricBlue.withValues(alpha: 0.12) : cd,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: active ? AppTheme.electricBlue : bd),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                color: active ? AppTheme.electricBlue : Colors.grey,
                fontSize: 12,
                fontWeight: active ? FontWeight.w800 : FontWeight.w600,
              ),
            ),
          ),
        ),
      ),
    );
  }

  // 4. CURRENCY CONVERTER
  void _showConvertisseurSheet(bool dk, Color cd, Color bd, Color mt) {
    final fg = dk ? Colors.white : const Color(0xFF0F172A);
    final bg = dk ? const Color(0xFF0D1829) : Colors.white;

    double amountTnd = 100;
    final ctrl = TextEditingController(text: '100');

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => StatefulBuilder(builder: (ctx, setSheet) {
        final usdVal = amountTnd / 3.12;
        final eurVal = amountTnd / 3.38;
        final gbpVal = amountTnd / 3.95;

        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
          child: Container(
            padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).padding.bottom + 24),
            decoration: BoxDecoration(
              color: bg,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(36)),
              border: Border.all(color: bd),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(child: Container(width: 44, height: 4, decoration: BoxDecoration(color: mt.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2)))),
                const SizedBox(height: 18),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Convertisseur de Devises', style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w800)),
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(color: cd, shape: BoxShape.circle, border: Border.all(color: bd)),
                        child: Icon(Icons.close_rounded, color: fg, size: 18),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Base Input (TND)
                Container(
                  height: 54,
                  decoration: BoxDecoration(
                    color: dk ? Colors.white.withValues(alpha: 0.03) : Colors.black.withValues(alpha: 0.01),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: bd),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      const Text('🇹🇳', style: TextStyle(fontSize: 22)),
                      const SizedBox(width: 10),
                      const Text('TND', style: TextStyle(color: AppTheme.electricBlue, fontWeight: FontWeight.w900, fontSize: 14)),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextField(
                          controller: ctrl,
                          keyboardType: TextInputType.number,
                          style: TextStyle(color: fg, fontSize: 16, fontWeight: FontWeight.w800),
                          decoration: const InputDecoration(border: InputBorder.none),
                          onChanged: (v) {
                            final val = double.tryParse(v) ?? 0;
                            setSheet(() => amountTnd = val);
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Conversions
                _rateCard('🇺🇸', 'USD', 'Dollar Américain', usdVal, 3.12, fg, mt, cd, bd),
                const SizedBox(height: 10),
                _rateCard('🇪🇺', 'EUR', 'Euro', eurVal, 3.38, fg, mt, cd, bd),
                const SizedBox(height: 10),
                _rateCard('🇬🇧', 'GBP', 'Livre Sterling', gbpVal, 3.95, fg, mt, cd, bd),
              ],
            ),
          ),
        );
      }),
    );
  }

  Widget _rateCard(String flag, String code, String label, double amount, double rate, Color fg, Color mt, Color cd, Color bd) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cd,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: bd),
      ),
      child: Row(
        children: [
          Text(flag, style: const TextStyle(fontSize: 22)),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(code, style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w800)),
                Text(label, style: TextStyle(color: mt, fontSize: 10, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('${amount.toStringAsFixed(2)} $code', style: const TextStyle(color: AppTheme.emerald, fontSize: 14, fontWeight: FontWeight.w900)),
              Text('1 $code = $rate TND', style: TextStyle(color: mt, fontSize: 9, fontWeight: FontWeight.w600)),
            ],
          ),
        ],
      ),
    );
  }

  // ── BIOMETRIC SCAN OVERLAY ──────────────────────────────────────────────────
  Widget _buildBiometricOverlay(AppProvider p) {
    return Positioned.fill(
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
          child: Container(
            color: Colors.black.withValues(alpha: 0.6),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 130, height: 130,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.electricBlue.withValues(alpha: 0.5), width: 2.5),
                      color: AppTheme.electricBlue.withValues(alpha: 0.1),
                    ),
                    child: const Icon(Icons.fingerprint_rounded, color: Colors.white, size: 65)
                        .animate(onPlay: (c) => c.repeat())
                        .shimmer(duration: 1.5.seconds, color: AppTheme.turquoise),
                  ),
                  const SizedBox(height: 24),
                  Text(p.translate('biometric_validation'), style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 6),
                  Text(p.translate('place_finger'), style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ),
        ),
      ).animate().fadeIn(duration: 250.ms),
    );
  }

  // ── ABOUT STB BANK SHEET ────────────────────────────────────────────────────
  void _showAboutSheet(bool dk, Color cd, Color bd, Color mt) {
    final fg = dk ? Colors.white : const Color(0xFF0F172A);
    final bg = dk ? const Color(0xFF0D1829) : Colors.white;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        maxChildSize: 0.95,
        minChildSize: 0.5,
        builder: (_, scrollCtrl) => Container(
          decoration: BoxDecoration(
            color: bg,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(36)),
            border: Border.all(color: bd),
          ),
          child: ListView(
            controller: scrollCtrl,
            padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).padding.bottom + 32),
            children: [
              Center(child: Container(width: 44, height: 4, decoration: BoxDecoration(color: mt.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 24),

              // Header with logo
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.royalBlue, Color(0xFF1644D4)],
                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(28),
                ),
                child: Column(
                  children: [
                    Container(
                      width: 72, height: 72,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white.withValues(alpha: 0.3), width: 2),
                      ),
                      child: const Icon(Icons.account_balance_rounded, color: Colors.white, size: 36),
                    ),
                    const SizedBox(height: 16),
                    const Text('STB BANK', style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900, letterSpacing: 3)),
                    const SizedBox(height: 6),
                    Text('Société Tunisienne de Banque', style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 13, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text('Fondée en 1957 · Banque publique', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Key Stats
              Row(
                children: [
                  _aboutStat('150+', 'Agences', Icons.location_city_rounded, AppTheme.electricBlue, cd, bd, fg, mt),
                  const SizedBox(width: 12),
                  _aboutStat('600+', 'GABs', Icons.credit_card_rounded, AppTheme.turquoise, cd, bd, fg, mt),
                  const SizedBox(width: 12),
                  _aboutStat('2M+', 'Clients', Icons.people_rounded, AppTheme.emerald, cd, bd, fg, mt),
                ],
              ),
              const SizedBox(height: 24),

              // Description
              _aboutSection(
                icon: Icons.history_edu_rounded,
                title: 'Notre Histoire',
                body: 'La Société Tunisienne de Banque (STB) est une banque publique tunisienne créée en 1957. Elle est l\'une des plus grandes banques de Tunisie, offrant des services bancaires complets aux particuliers, entreprises et institutionnels.',
                color: AppTheme.royalBlue, fg: fg, mt: mt, cd: cd, bd: bd,
              ),
              const SizedBox(height: 14),
              _aboutSection(
                icon: Icons.star_rounded,
                title: 'Notre Mission',
                body: 'Accompagner nos clients dans leurs projets de vie et de développement en offrant des solutions financières innovantes, sécurisées et accessibles à travers toute la Tunisie.',
                color: AppTheme.turquoise, fg: fg, mt: mt, cd: cd, bd: bd,
              ),
              const SizedBox(height: 14),
              _aboutSection(
                icon: Icons.phone_rounded,
                title: 'Centre d\'Appels STB',
                body: 'Disponible 24h/24, 7j/7\nNuméro vert : 71 116 000\nEmail : contact@stb.com.tn',
                color: AppTheme.emerald, fg: fg, mt: mt, cd: cd, bd: bd,
              ),
              const SizedBox(height: 24),

              // Visit Website button
              Container(
                height: 54,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [AppTheme.royalBlue, AppTheme.electricBlue]),
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.25), blurRadius: 12, offset: const Offset(0, 5))],
                ),
                child: const Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.language_rounded, color: Colors.white, size: 18),
                      SizedBox(width: 8),
                      Text('Visiter stb.com.tn', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700)),
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

  Widget _aboutStat(String value, String label, IconData icon, Color color, Color cd, Color bd, Color fg, Color mt) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cd,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: bd),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 8),
            Text(value, style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w900)),
            const SizedBox(height: 2),
            Text(label, style: TextStyle(color: mt, fontSize: 10, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _aboutSection({required IconData icon, required String title, required String body, required Color color, required Color fg, required Color mt, required Color cd, required Color bd}) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cd,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: bd),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(color: fg, fontSize: 14, fontWeight: FontWeight.w800)),
                const SizedBox(height: 6),
                Text(body, style: TextStyle(color: mt, fontSize: 12, height: 1.5, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── SÉCURITÉ SHEET ──────────────────────────────────────────────────────────
  void _showSecuriteSheet(bool dk, Color cd, Color bd, Color mt) {
    final fg = dk ? Colors.white : const Color(0xFF0F172A);
    final bg = dk ? const Color(0xFF0D1829) : Colors.white;

    final tips = [
      {
        'icon': Icons.lock_rounded,
        'color': AppTheme.electricBlue,
        'title': 'Mot de Passe Sécurisé',
        'body': 'Utilisez un mot de passe fort combinant lettres majuscules, minuscules, chiffres et symboles. Ne le partagez jamais.',
      },
      {
        'icon': Icons.fingerprint_rounded,
        'color': AppTheme.turquoise,
        'title': 'Authentification Biométrique',
        'body': 'Activez l\'empreinte digitale ou Face ID pour sécuriser l\'accès à votre compte bancaire en un instant.',
      },
      {
        'icon': Icons.sms_rounded,
        'color': AppTheme.emerald,
        'title': 'Alertes SMS en Temps Réel',
        'body': 'Recevez instantanément une notification SMS à chaque mouvement sur votre compte pour détecter toute fraude.',
      },
      {
        'icon': Icons.phishing_rounded,
        'color': Colors.orange,
        'title': 'Attention au Phishing',
        'body': 'STB ne vous demandera jamais vos identifiants par email ou SMS. Signalez tout message suspect au 71 116 000.',
      },
      {
        'icon': Icons.wifi_off_rounded,
        'color': AppTheme.coralRed,
        'title': 'Évitez les Wi-Fi Publics',
        'body': 'N\'accédez jamais à votre compte bancaire via un réseau Wi-Fi public non sécurisé. Utilisez votre données mobiles.',
      },
      {
        'icon': Icons.update_rounded,
        'color': const Color(0xFF7C3AED),
        'title': 'Mises à Jour Régulières',
        'body': 'Gardez toujours l\'application STB Mobile et votre système d\'exploitation à jour pour bénéficier des derniers correctifs de sécurité.',
      },
    ];

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        maxChildSize: 0.95,
        minChildSize: 0.5,
        builder: (_, scrollCtrl) => Container(
          decoration: BoxDecoration(
            color: bg,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(36)),
            border: Border.all(color: bd),
          ),
          child: ListView(
            controller: scrollCtrl,
            padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).padding.bottom + 32),
            children: [
              Center(child: Container(width: 44, height: 4, decoration: BoxDecoration(color: mt.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 24),

              // Hero header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppTheme.coralRed.withValues(alpha: 0.8), const Color(0xFF7C3AED)],
                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(28),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.shield_rounded, color: Colors.white, size: 34),
                    ),
                    const SizedBox(width: 18),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Votre Sécurité', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
                          const SizedBox(height: 4),
                          Text('6 conseils essentiels pour protéger votre compte STB', style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 12, height: 1.4)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Security tips list
              ...tips.asMap().entries.map((entry) {
                final i = entry.key;
                final tip = entry.value;
                return Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: cd,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: bd),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Step number badge
                      Container(
                        width: 28, height: 28,
                        decoration: BoxDecoration(
                          color: (tip['color'] as Color).withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text('${i + 1}', style: TextStyle(color: tip['color'] as Color, fontSize: 12, fontWeight: FontWeight.w900)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      // icon
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: (tip['color'] as Color).withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(tip['icon'] as IconData, color: tip['color'] as Color, size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(tip['title'] as String, style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w800)),
                            const SizedBox(height: 5),
                            Text(tip['body'] as String, style: TextStyle(color: mt, fontSize: 11, height: 1.5, fontWeight: FontWeight.w500)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: (i * 80).ms).slideY(begin: 0.1);
              }),

              const SizedBox(height: 8),

              // Emergency banner
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppTheme.coralRed.withValues(alpha: 0.07),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.coralRed.withValues(alpha: 0.25)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: AppTheme.coralRed.withValues(alpha: 0.12), shape: BoxShape.circle),
                      child: const Icon(Icons.emergency_rounded, color: AppTheme.coralRed, size: 20),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Urgence Bancaire ?', style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w800)),
                          const SizedBox(height: 3),
                          Text('Bloquez votre carte immédiatement\n📞 71 116 000 — 24h/24', style: TextStyle(color: mt, fontSize: 11, height: 1.4)),
                        ],
                      ),
                    ),
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

// ── CUSTOM MAP PAINTERS ───────────────────────────────────────────────────────
class _MapGridPainter extends CustomPainter {
  final bool dk;
  _MapGridPainter(this.dk);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = dk ? Colors.white.withValues(alpha: 0.04) : Colors.black.withValues(alpha: 0.03)
      ..strokeWidth = 1;

    const spacing = 20.0;
    for (double x = 0; x < size.width; x += spacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += spacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _MapPathPainter extends CustomPainter {
  final List<Map<String, dynamic>> agencies;
  final int selectedIndex;
  _MapPathPainter(this.agencies, this.selectedIndex);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppTheme.electricBlue.withValues(alpha: 0.2)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final path = Path();
    if (agencies.isNotEmpty) {
      path.moveTo(200 * (agencies[0]['lat'] as double), 220 * (agencies[0]['lng'] as double));
      for (int i = 1; i < agencies.length; i++) {
        path.lineTo(200 * (agencies[i]['lat'] as double), 220 * (agencies[i]['lng'] as double));
      }
    }
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _MapPathPainter oldDelegate) => oldDelegate.selectedIndex != selectedIndex;
}

