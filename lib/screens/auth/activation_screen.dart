import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:local_auth/local_auth.dart';
import '../../services/auth_api_service.dart';
import '../../theme/app_theme.dart';
import '../main_screen.dart';

class ActivationScreen extends StatefulWidget {
  const ActivationScreen({super.key});
  @override
  State<ActivationScreen> createState() => _ActivationScreenState();
}

class _ActivationScreenState extends State<ActivationScreen> {
  int _step = 0; // 0:identity 1:otp 2:password 3:pin 4:biometric
  bool _loading = false;
  String? _error;
  String _matricule = '';
  String _setupToken = '';
  String _accessToken = '';

  // Controllers
  final _matCtrl = TextEditingController();
  final _cinCtrl = TextEditingController();
  final _dobCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();
  final _pwdCtrl = TextEditingController();
  final _pwd2Ctrl = TextEditingController();
  final List<TextEditingController> _pinCtrls =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _pinFocus = List.generate(6, (_) => FocusNode());

  bool _pwdObscure = true;
  final _localAuth = LocalAuthentication();

  static const _deviceUUID = 'stb-demo-device-001';

  @override
  void dispose() {
    _matCtrl.dispose(); _cinCtrl.dispose(); _dobCtrl.dispose();
    _otpCtrl.dispose(); _pwdCtrl.dispose(); _pwd2Ctrl.dispose();
    for (final c in _pinCtrls) c.dispose();
    for (final f in _pinFocus) f.dispose();
    super.dispose();
  }

  void _setError(String? msg) => setState(() => _error = msg);
  void _setLoading(bool v) => setState(() => _loading = v);

  // ── Steps ────────────────────────────────────────────────────────

  Future<void> _submitIdentity() async {
    if (_matCtrl.text.trim().isEmpty || _cinCtrl.text.trim().isEmpty || _dobCtrl.text.trim().isEmpty) {
      _setError('Tous les champs sont obligatoires.'); return;
    }
    _setLoading(true); _setError(null);
    final result = await AuthApiService.requestActivation(
      matricule: _matCtrl.text.trim().toUpperCase(),
      cin: _cinCtrl.text.trim().toUpperCase(),
      dateNaissance: _dobCtrl.text.trim(),
    );
    _setLoading(false);
    if (!mounted) return;
    if (result.isSuccess) {
      _matricule = _matCtrl.text.trim().toUpperCase();
      setState(() => _step = 1);
    } else {
      _setError(result.error);
    }
  }

  Future<void> _submitOtp() async {
    if (_otpCtrl.text.length != 6) { _setError('Entrez le code à 6 chiffres.'); return; }
    _setLoading(true); _setError(null);
    final result = await AuthApiService.verifyOtp(
      matricule: _matricule, code: _otpCtrl.text.trim());
    _setLoading(false);
    if (!mounted) return;
    if (result.isSuccess) {
      _setupToken = result.data?['token'] ?? '';
      setState(() => _step = 2);
    } else {
      _setError(result.error);
    }
  }

  Future<void> _submitPassword() async {
    if (_pwdCtrl.text != _pwd2Ctrl.text) { _setError('Les mots de passe ne correspondent pas.'); return; }
    if (_pwdCtrl.text.length < 8) { _setError('Minimum 8 caractères.'); return; }
    _setLoading(true); _setError(null);
    final result = await AuthApiService.setPassword(
      matricule: _matricule, password: _pwdCtrl.text);
    _setLoading(false);
    if (!mounted) return;
    if (result.isSuccess) {
      setState(() => _step = 3);
    } else {
      _setError(result.error);
    }
  }

  Future<void> _submitPin() async {
    final pin = _pinCtrls.map((c) => c.text).join();
    if (pin.length != 6) { _setError('Entrez un PIN à 6 chiffres.'); return; }
    _setLoading(true); _setError(null);
    final result = await AuthApiService.setPin(matricule: _matricule, pin: pin);
    _setLoading(false);
    if (!mounted) return;
    if (result.isSuccess) {
      // Login to get token for biometric step
      final loginResult = await AuthApiService.login(
        matricule: _matricule, password: _pwdCtrl.text,
        deviceUUID: _deviceUUID, deviceName: 'STB Mobile App');
      if (loginResult.isSuccess && loginResult.data != null) {
        _accessToken = loginResult.data!.accessToken;
        await AuthApiService.saveTokens(
          accessToken: _accessToken,
          refreshToken: loginResult.data!.refreshToken);
        await AuthApiService.saveMatricule(_matricule);
        await AuthApiService.saveDeviceUUID(_deviceUUID);
      }
      setState(() => _step = 4);
    } else {
      _setError(result.error);
    }
  }

  Future<void> _enableBiometrics(String type) async {
    _setLoading(true); _setError(null);
    final token = _accessToken.isNotEmpty
        ? _accessToken
        : (await AuthApiService.getAccessToken() ?? '');
    await AuthApiService.enableBiometrics(
      accessToken: token, type: type, deviceUUID: _deviceUUID);
    await AuthApiService.saveBiometricEnabled(true);
    _setLoading(false);
    if (!mounted) return;
    _navigateToMain();
  }

  void _navigateToMain() {
    Navigator.of(context).pushAndRemoveUntil(
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const MainScreen(),
        transitionDuration: const Duration(milliseconds: 600),
        transitionsBuilder: (_, a, __, c) =>
            FadeTransition(opacity: a, child: c),
      ),
      (_) => false,
    );
  }

  // ── UI ───────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final dk = Theme.of(context).brightness == Brightness.dark;
    final fg = Theme.of(context).colorScheme.onSurface;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.07) : Colors.black.withValues(alpha: 0.04);

    final steps = ['Identité', 'Code OTP', 'Mot de passe', 'PIN', 'Biométrie'];

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: Column(children: [
          _buildHeader(fg, mt, cd, bd, dk, steps),
          Expanded(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 350),
                transitionBuilder: (child, anim) => FadeTransition(
                  opacity: anim,
                  child: SlideTransition(
                    position: Tween(begin: const Offset(0.05, 0), end: Offset.zero).animate(anim),
                    child: child,
                  ),
                ),
                child: _buildStep(fg, mt, cd, bd, dk),
              ),
            ),
          ),
        ]),
      ),
    );
  }

  Widget _buildHeader(Color fg, Color mt, Color cd, Color bd, bool dk, List<String> steps) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
      child: Column(children: [
        Row(children: [
          GestureDetector(
            onTap: () {
              if (_step > 0) { setState(() { _step--; _error = null; }); }
              else { Navigator.pop(context); }
            },
            child: Container(
              width: 40, height: 40,
              decoration: BoxDecoration(color: cd, shape: BoxShape.circle, border: Border.all(color: bd)),
              child: Icon(Icons.arrow_back_rounded, color: fg, size: 18),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Activation du compte', style: GoogleFonts.outfit(color: fg, fontSize: 18, fontWeight: FontWeight.w800)),
            Text('Étape ${_step + 1} sur 5', style: GoogleFonts.inter(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
          ])),
        ]),
        const SizedBox(height: 16),
        Row(children: List.generate(5, (i) {
          final done = i < _step;
          final active = i == _step;
          return Expanded(child: Container(
            margin: EdgeInsets.only(right: i < 4 ? 6 : 0),
            height: 4,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(2),
              color: done || active
                  ? (done ? const Color(0xFF10B981) : AppTheme.electricBlue)
                  : bd,
            ),
          ));
        })),
      ]),
    );
  }

  Widget _buildStep(Color fg, Color mt, Color cd, Color bd, bool dk) {
    switch (_step) {
      case 0: return _stepIdentity(fg, mt, cd, bd, dk, key: const ValueKey(0));
      case 1: return _stepOtp(fg, mt, cd, bd, dk, key: const ValueKey(1));
      case 2: return _stepPassword(fg, mt, cd, bd, dk, key: const ValueKey(2));
      case 3: return _stepPin(fg, mt, cd, bd, dk, key: const ValueKey(3));
      case 4: return _stepBiometric(fg, mt, cd, bd, dk, key: const ValueKey(4));
      default: return const SizedBox.shrink();
    }
  }

  // Step 0 — Identity
  Widget _stepIdentity(Color fg, Color mt, Color cd, Color bd, bool dk, {Key? key}) {
    return Column(key: key, crossAxisAlignment: CrossAxisAlignment.start, children: [
      _stepTitle('Vérification d\'identité', 'Entrez vos informations RH pour activer votre compte.', fg, mt),
      const SizedBox(height: 24),
      _field('Matricule', _matCtrl, Icons.badge_rounded, fg, mt, bd, dk, hint: 'ex: EMP001234'),
      const SizedBox(height: 14),
      _field('Numéro CIN', _cinCtrl, Icons.credit_card_rounded, fg, mt, bd, dk, hint: 'ex: 12345678'),
      const SizedBox(height: 14),
      _field('Date de naissance', _dobCtrl, Icons.cake_rounded, fg, mt, bd, dk,
        hint: 'AAAA-MM-JJ', keyboard: TextInputType.datetime),
      const SizedBox(height: 28),
      if (_error != null) _errorWidget(_error!),
      _primaryBtn('Continuer', _loading ? null : _submitIdentity, _loading),
    ]);
  }

  // Step 1 — OTP
  Widget _stepOtp(Color fg, Color mt, Color cd, Color bd, bool dk, {Key? key}) {
    return Column(key: key, crossAxisAlignment: CrossAxisAlignment.start, children: [
      _stepTitle('Code de vérification', 'Un code OTP a été envoyé à votre email professionnel STB.', fg, mt),
      const SizedBox(height: 28),
      Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppTheme.electricBlue.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.electricBlue.withValues(alpha: 0.2)),
        ),
        child: Row(children: [
          Container(width: 44, height: 44,
            decoration: BoxDecoration(color: AppTheme.electricBlue.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.mark_email_unread_rounded, color: AppTheme.electricBlue, size: 22)),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Code envoyé', style: GoogleFonts.outfit(color: fg, fontSize: 14, fontWeight: FontWeight.w700)),
            Text('Vérifiez votre boite mail ${_matricule.toLowerCase()}@stb.com.tn',
              style: GoogleFonts.inter(color: mt, fontSize: 11)),
          ])),
        ]),
      ),
      const SizedBox(height: 28),
      _field('Code OTP (6 chiffres)', _otpCtrl, Icons.pin_rounded, fg, mt, bd, dk,
        keyboard: TextInputType.number, maxLen: 6),
      const SizedBox(height: 28),
      if (_error != null) _errorWidget(_error!),
      _primaryBtn('Vérifier le code', _loading ? null : _submitOtp, _loading),
      const SizedBox(height: 14),
      Center(child: GestureDetector(
        onTap: () => _submitIdentity(),
        child: Text('Renvoyer le code', style: GoogleFonts.inter(
          color: AppTheme.electricBlue, fontSize: 13, fontWeight: FontWeight.w700)),
      )),
    ]);
  }

  // Step 2 — Password
  Widget _stepPassword(Color fg, Color mt, Color cd, Color bd, bool dk, {Key? key}) {
    return Column(key: key, crossAxisAlignment: CrossAxisAlignment.start, children: [
      _stepTitle('Créer votre mot de passe', 'Minimum 8 caractères, une majuscule, un chiffre et un symbole.', fg, mt),
      const SizedBox(height: 24),
      _field('Nouveau mot de passe', _pwdCtrl, Icons.lock_rounded, fg, mt, bd, dk,
        obscure: _pwdObscure, suffix: IconButton(
          icon: Icon(_pwdObscure ? Icons.visibility_outlined : Icons.visibility_off_outlined, color: mt, size: 18),
          onPressed: () => setState(() => _pwdObscure = !_pwdObscure),
        )),
      const SizedBox(height: 14),
      _field('Confirmer le mot de passe', _pwd2Ctrl, Icons.lock_clock_rounded, fg, mt, bd, dk, obscure: true),
      const SizedBox(height: 12),
      _pwdRules(fg, mt),
      const SizedBox(height: 24),
      if (_error != null) _errorWidget(_error!),
      _primaryBtn('Créer le mot de passe', _loading ? null : _submitPassword, _loading),
    ]);
  }

  Widget _pwdRules(Color fg, Color mt) {
    final pwd = _pwdCtrl.text;
    return Column(children: [
      _rule('8 caractères minimum', pwd.length >= 8, mt),
      _rule('Une lettre majuscule', pwd.contains(RegExp(r'[A-Z]')), mt),
      _rule('Un chiffre', pwd.contains(RegExp(r'[0-9]')), mt),
      _rule('Un symbole (@\$!%*?&)', pwd.contains(RegExp(r'[@$!%*?&]')), mt),
    ]);
  }

  Widget _rule(String text, bool ok, Color mt) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(children: [
        Icon(ok ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
          color: ok ? const Color(0xFF10B981) : mt, size: 14),
        const SizedBox(width: 8),
        Text(text, style: GoogleFonts.inter(color: ok ? const Color(0xFF10B981) : mt, fontSize: 12)),
      ]),
    );
  }

  // Step 3 — PIN
  Widget _stepPin(Color fg, Color mt, Color cd, Color bd, bool dk, {Key? key}) {
    return Column(key: key, crossAxisAlignment: CrossAxisAlignment.start, children: [
      _stepTitle('Créer votre PIN', 'Ce code à 6 chiffres servira de secours si la biométrie échoue.', fg, mt),
      const SizedBox(height: 32),
      Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(6, (i) {
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 5),
          width: 44, height: 54,
          decoration: BoxDecoration(
            color: cd,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: _pinFocus[i].hasFocus ? AppTheme.electricBlue : bd,
              width: _pinFocus[i].hasFocus ? 2 : 1,
            ),
          ),
          child: TextField(
            controller: _pinCtrls[i],
            focusNode: _pinFocus[i],
            textAlign: TextAlign.center,
            keyboardType: TextInputType.number,
            maxLength: 1,
            obscureText: true,
            style: GoogleFonts.outfit(color: fg, fontSize: 20, fontWeight: FontWeight.w800),
            decoration: const InputDecoration(border: InputBorder.none, counterText: ''),
            onChanged: (v) {
              if (v.isNotEmpty && i < 5) _pinFocus[i + 1].requestFocus();
              if (v.isEmpty && i > 0) _pinFocus[i - 1].requestFocus();
              setState(() {});
            },
          ),
        );
      })),
      const SizedBox(height: 32),
      if (_error != null) _errorWidget(_error!),
      _primaryBtn('Enregistrer le PIN', _loading ? null : _submitPin, _loading),
    ]);
  }

  // Step 4 — Biometric
  Widget _stepBiometric(Color fg, Color mt, Color cd, Color bd, bool dk, {Key? key}) {
    return Column(key: key, crossAxisAlignment: CrossAxisAlignment.center, children: [
      const SizedBox(height: 16),
      _stepTitle('Activer la biométrie', 'Choisissez comment vous authentifier rapidement.', fg, mt),
      const SizedBox(height: 40),
      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        _bioCard(Icons.face_rounded, 'Face ID', const Color(0xFF2962FF), cd, bd, fg, mt,
          () => _enableBiometrics('FACE_ID')),
        const SizedBox(width: 16),
        _bioCard(Icons.fingerprint_rounded, 'Empreinte', const Color(0xFF10B981), cd, bd, fg, mt,
          () => _enableBiometrics('FINGERPRINT')),
      ]),
      const SizedBox(height: 16),
      _bioCard(Icons.done_all_rounded, 'Face ID + Empreinte', const Color(0xFFD4AF37), cd, bd, fg, mt,
        () => _enableBiometrics('BOTH'), wide: true),
      const SizedBox(height: 32),
      if (_error != null) _errorWidget(_error!),
      if (_loading) const CircularProgressIndicator(),
      const SizedBox(height: 20),
      GestureDetector(
        onTap: _navigateToMain,
        child: Text('Ignorer pour l\'instant',
          style: GoogleFonts.inter(color: mt, fontSize: 13, fontWeight: FontWeight.w600)),
      ),
    ]);
  }

  Widget _bioCard(IconData icon, String label, Color color, Color cd, Color bd,
      Color fg, Color mt, VoidCallback onTap, {bool wide = false}) {
    return GestureDetector(
      onTap: () { HapticFeedback.mediumImpact(); onTap(); },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: wide ? double.infinity : 155,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.07),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: color.withValues(alpha: 0.35), width: 1.5),
        ),
        child: Column(children: [
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(color: color.withValues(alpha: 0.12), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 12),
          Text(label, style: GoogleFonts.outfit(color: fg, fontSize: 14, fontWeight: FontWeight.w800)),
        ]),
      ),
    ).animate().scale(begin: const Offset(0.94, 0.94), duration: 300.ms);
  }

  // ── Shared Widgets ───────────────────────────────────────────────

  Widget _stepTitle(String title, String sub, Color fg, Color mt) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: GoogleFonts.outfit(color: fg, fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.4)),
      const SizedBox(height: 6),
      Text(sub, style: GoogleFonts.inter(color: mt, fontSize: 13, height: 1.5)),
    ]);
  }

  Widget _field(String label, TextEditingController ctrl, IconData icon,
      Color fg, Color mt, Color bd, bool dk,
      {String? hint, bool obscure = false, Widget? suffix,
       TextInputType keyboard = TextInputType.text, int? maxLen}) {
    return Container(
      height: 54,
      decoration: BoxDecoration(
        color: dk ? Colors.white.withValues(alpha: 0.03) : Colors.black.withValues(alpha: 0.015),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: bd),
      ),
      child: TextField(
        controller: ctrl,
        obscureText: obscure,
        keyboardType: keyboard,
        maxLength: maxLen,
        onChanged: (_) => setState(() {}),
        style: TextStyle(color: fg, fontSize: 14, fontWeight: FontWeight.w700),
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          labelStyle: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600),
          hintStyle: TextStyle(color: mt.withValues(alpha: 0.5), fontSize: 12),
          prefixIcon: Icon(icon, color: AppTheme.electricBlue, size: 20),
          suffixIcon: suffix,
          border: InputBorder.none,
          counterText: '',
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        ),
      ),
    );
  }

  Widget _errorWidget(String msg) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFEF4444).withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
      ),
      child: Row(children: [
        const Icon(Icons.error_outline_rounded, color: Color(0xFFEF4444), size: 16),
        const SizedBox(width: 8),
        Expanded(child: Text(msg,
          style: GoogleFonts.inter(color: const Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.w600))),
      ]),
    ).animate().fadeIn().shakeX(duration: 400.ms);
  }

  Widget _primaryBtn(String label, VoidCallback? onTap, bool loading) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 54, width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: onTap == null
            ? [AppTheme.electricBlue.withValues(alpha: 0.5), AppTheme.royalBlue.withValues(alpha: 0.5)]
            : [AppTheme.electricBlue, AppTheme.royalBlue]),
          borderRadius: BorderRadius.circular(18),
          boxShadow: onTap != null
            ? [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.3), blurRadius: 14, offset: const Offset(0, 5))]
            : null,
        ),
        child: Center(child: loading
          ? const SizedBox(width: 22, height: 22,
              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
          : Text(label, style: GoogleFonts.outfit(
              color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800, letterSpacing: 0.3))),
      ),
    );
  }
}
