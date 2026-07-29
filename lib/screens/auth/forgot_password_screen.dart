import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../services/auth_api_service.dart';
import '../../theme/app_theme.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});
  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  int _step = 0;
  bool _loading = false;
  String? _error;
  String _matricule = '';
  String _maskedEmail = '';
  bool _pwdObscure = true;
  bool _pwd2Obscure = true;

  final _matCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();
  final _pwdCtrl = TextEditingController();
  final _pwd2Ctrl = TextEditingController();

  @override
  void dispose() {
    _matCtrl.dispose(); _otpCtrl.dispose(); _pwdCtrl.dispose(); _pwd2Ctrl.dispose();
    super.dispose();
  }

  void _setErr(String? e) => setState(() => _error = e);
  void _setLoad(bool v) => setState(() => _loading = v);

  Future<void> _requestOtp() async {
    if (_matCtrl.text.trim().isEmpty) { _setErr('Entrez votre matricule.'); return; }
    _setLoad(true); _setErr(null);
    final result = await AuthApiService.forgotPassword(matricule: _matCtrl.text.trim().toUpperCase());
    _setLoad(false);
    if (!mounted) return;
    if (result.isSuccess) {
      _matricule = _matCtrl.text.trim().toUpperCase();
      // Build masked email from matricule e.g. "y****@stb.com.tn"
      final mat = _matricule.toLowerCase();
      _maskedEmail = mat.length > 3 ? '${mat.substring(0, 2)}****@stb.com.tn' : '****@stb.com.tn';
      setState(() => _step = 1);
    } else {
      // Backend returns 200 even if not found for security — advance anyway so user can try
      _matricule = _matCtrl.text.trim().toUpperCase();
      _maskedEmail = '****@stb.com.tn';
      setState(() => _step = 1);
    }
  }

  Future<void> _verifyOtp() async {
    final code = _otpCtrl.text.trim();
    if (code.length != 6) { _setErr('Code OTP à 6 chiffres requis.'); return; }
    // The real OTP verification happens at resetPassword — move to step 2
    setState(() { _error = null; _step = 2; });
  }

  Future<void> _resetPassword() async {
    if (_pwdCtrl.text != _pwd2Ctrl.text) { _setErr('Les mots de passe ne correspondent pas.'); return; }
    if (_pwdCtrl.text.length < 8) { _setErr('Minimum 8 caractères.'); return; }
    _setLoad(true); _setErr(null);
    final result = await AuthApiService.resetPassword(
      matricule: _matricule,
      otpCode: _otpCtrl.text.trim(),
      newPassword: _pwdCtrl.text,
    );
    _setLoad(false);
    if (!mounted) return;
    if (result.isSuccess) {
      _showSuccess();
    } else {
      // OTP invalid — send back to step 1
      setState(() {
        _step = 1;
        _otpCtrl.clear();
        _error = result.error ?? 'Code OTP invalide ou expiré. Réessayez.';
      });
    }
  }

  void _showSuccess() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        backgroundColor: Theme.of(context).cardColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF059669)]),
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: const Color(0xFF10B981).withValues(alpha: 0.35), blurRadius: 20, offset: const Offset(0, 8))],
            ),
            child: const Icon(Icons.check_rounded, color: Colors.white, size: 42),
          ).animate().scale(duration: 500.ms, curve: Curves.easeOutBack),
          const SizedBox(height: 22),
          Text('Mot de passe réinitialisé !',
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(color: Theme.of(context).colorScheme.onSurface, fontSize: 20, fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          Text('Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 13, height: 1.6)),
          const SizedBox(height: 28),
          GestureDetector(
            onTap: () => Navigator.of(context).popUntil((r) => r.isFirst),
            child: Container(
              height: 54, width: double.infinity,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppTheme.electricBlue, AppTheme.royalBlue]),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.35), blurRadius: 14, offset: const Offset(0, 5))],
              ),
              child: Center(child: Text('Se connecter',
                style: GoogleFonts.outfit(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800))),
            ),
          ),
        ]),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dk = Theme.of(context).brightness == Brightness.dark;
    final fg = Theme.of(context).colorScheme.onSurface;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.07) : Colors.black.withValues(alpha: 0.04);
    final bg = dk ? const Color(0xFF030B1A) : const Color(0xFFF0F5FF);

    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: Column(children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: Row(children: [
              GestureDetector(
                onTap: () { HapticFeedback.lightImpact(); Navigator.pop(context); },
                child: Container(
                  width: 42, height: 42,
                  decoration: BoxDecoration(color: cd, shape: BoxShape.circle, border: Border.all(color: bd),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 10, offset: const Offset(0, 4))]),
                  child: Icon(Icons.arrow_back_rounded, color: fg, size: 18),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Mot de passe oublié', style: GoogleFonts.outfit(color: fg, fontSize: 20, fontWeight: FontWeight.w900)),
                  Text(_step == 0 ? 'Entrez votre matricule' : _step == 1 ? 'Vérification OTP' : 'Nouveau mot de passe',
                    style: GoogleFonts.inter(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
                ]),
              ),
            ]).animate().fadeIn(),
          ),
          const SizedBox(height: 16),
          // Progress bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(children: List.generate(3, (i) => Expanded(child: AnimatedContainer(
              duration: const Duration(milliseconds: 400),
              curve: Curves.easeInOut,
              margin: EdgeInsets.only(right: i < 2 ? 8 : 0),
              height: 4,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(2),
                gradient: i <= _step
                  ? const LinearGradient(colors: [AppTheme.electricBlue, AppTheme.royalBlue])
                  : null,
                color: i <= _step ? null : bd,
              ),
            )))),
          ),
          Expanded(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(24, 32, 24, 32),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 350),
                transitionBuilder: (child, anim) => FadeTransition(
                  opacity: anim,
                  child: SlideTransition(
                    position: Tween<Offset>(begin: const Offset(0.08, 0), end: Offset.zero).animate(anim),
                    child: child,
                  ),
                ),
                child: _step == 0 ? _buildStep0(fg, mt, cd, bd, dk)
                    : _step == 1 ? _buildStep1(fg, mt, cd, bd, dk)
                    : _buildStep2(fg, mt, cd, bd, dk),
              ),
            ),
          ),
        ]),
      ),
    );
  }

  Widget _buildStep0(Color fg, Color mt, Color cd, Color bd, bool dk) {
    return Column(key: const ValueKey(0), crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Icon hero
      Container(
        width: 72, height: 72,
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [AppTheme.electricBlue.withValues(alpha: 0.15), AppTheme.royalBlue.withValues(alpha: 0.08)]),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppTheme.electricBlue.withValues(alpha: 0.2)),
        ),
        child: const Icon(Icons.lock_reset_rounded, color: AppTheme.electricBlue, size: 34),
      ).animate().scale(duration: 500.ms, curve: Curves.easeOutBack),
      const SizedBox(height: 20),
      Text('Récupération de compte', style: GoogleFonts.outfit(color: fg, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -0.4)),
      const SizedBox(height: 8),
      Text('Entrez votre matricule pour recevoir un code de réinitialisation sur votre email STB.',
        style: GoogleFonts.inter(color: mt, fontSize: 13, height: 1.6)),
      const SizedBox(height: 32),
      _field('Matricule', _matCtrl, Icons.badge_rounded, fg, mt, bd, dk, hint: 'ex: EMP001234'),
      const SizedBox(height: 24),
      if (_error != null) _errorWidget(_error!),
      _btn('Envoyer le code OTP', _loading ? null : _requestOtp, _loading),
    ]);
  }

  Widget _buildStep1(Color fg, Color mt, Color cd, Color bd, bool dk) {
    return Column(key: const ValueKey(1), crossAxisAlignment: CrossAxisAlignment.start, children: [
      Container(
        width: 72, height: 72,
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [const Color(0xFF7C3AED).withValues(alpha: 0.15), const Color(0xFF5B21B6).withValues(alpha: 0.08)]),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: const Color(0xFF7C3AED).withValues(alpha: 0.2)),
        ),
        child: const Icon(Icons.mark_email_read_rounded, color: Color(0xFF7C3AED), size: 34),
      ).animate().scale(duration: 500.ms, curve: Curves.easeOutBack),
      const SizedBox(height: 20),
      Text('Code de vérification', style: GoogleFonts.outfit(color: fg, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -0.4)),
      const SizedBox(height: 8),
      Text('Un code OTP a été envoyé à votre email STB. Saisissez-le ci-dessous.',
        style: GoogleFonts.inter(color: mt, fontSize: 13, height: 1.6)),
      const SizedBox(height: 24),
      // Email chip — FIXED overflow
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF7C3AED).withValues(alpha: 0.07),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF7C3AED).withValues(alpha: 0.2)),
        ),
        child: Row(children: [
          const Icon(Icons.email_rounded, color: Color(0xFF7C3AED), size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              _maskedEmail,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.inter(color: const Color(0xFF7C3AED), fontSize: 13, fontWeight: FontWeight.w700),
            ),
          ),
        ]),
      ),
      const SizedBox(height: 20),
      _field('Code OTP (6 chiffres)', _otpCtrl, Icons.pin_rounded, fg, mt, bd, dk,
        keyboard: TextInputType.number, maxLen: 6),
      const SizedBox(height: 12),
      // Resend link
      GestureDetector(
        onTap: _loading ? null : () { _otpCtrl.clear(); setState(() { _step = 0; _error = null; }); },
        child: Text("Vous n'avez pas reçu le code ? Renvoyer",
          style: GoogleFonts.inter(color: AppTheme.electricBlue, fontSize: 12, fontWeight: FontWeight.w700)),
      ),
      const SizedBox(height: 24),
      if (_error != null) _errorWidget(_error!),
      _btn('Continuer', _loading ? null : _verifyOtp, _loading),
    ]);
  }

  Widget _buildStep2(Color fg, Color mt, Color cd, Color bd, bool dk) {
    return Column(key: const ValueKey(2), crossAxisAlignment: CrossAxisAlignment.start, children: [
      Container(
        width: 72, height: 72,
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [const Color(0xFF10B981).withValues(alpha: 0.15), const Color(0xFF059669).withValues(alpha: 0.08)]),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.2)),
        ),
        child: const Icon(Icons.shield_rounded, color: Color(0xFF10B981), size: 34),
      ).animate().scale(duration: 500.ms, curve: Curves.easeOutBack),
      const SizedBox(height: 20),
      Text('Nouveau mot de passe', style: GoogleFonts.outfit(color: fg, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -0.4)),
      const SizedBox(height: 8),
      Text('Choisissez un nouveau mot de passe sécurisé (minimum 8 caractères).',
        style: GoogleFonts.inter(color: mt, fontSize: 13, height: 1.6)),
      const SizedBox(height: 32),
      _field('Nouveau mot de passe', _pwdCtrl, Icons.lock_rounded, fg, mt, bd, dk,
        obscure: _pwdObscure, suffix: IconButton(
          icon: Icon(_pwdObscure ? Icons.visibility_outlined : Icons.visibility_off_outlined, color: mt, size: 18),
          onPressed: () => setState(() => _pwdObscure = !_pwdObscure),
        )),
      const SizedBox(height: 14),
      _field('Confirmer le mot de passe', _pwd2Ctrl, Icons.lock_clock_rounded, fg, mt, bd, dk,
        obscure: _pwd2Obscure, suffix: IconButton(
          icon: Icon(_pwd2Obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined, color: mt, size: 18),
          onPressed: () => setState(() => _pwd2Obscure = !_pwd2Obscure),
        )),
      const SizedBox(height: 24),
      if (_error != null) _errorWidget(_error!),
      _btn('Réinitialiser le mot de passe', _loading ? null : _resetPassword, _loading),
    ]);
  }

  Widget _field(String label, TextEditingController ctrl, IconData icon,
      Color fg, Color mt, Color bd, bool dk,
      {String? hint, bool obscure = false, Widget? suffix,
       TextInputType keyboard = TextInputType.text, int? maxLen}) {
    return Container(
      height: 56,
      decoration: BoxDecoration(
        color: dk ? Colors.white.withValues(alpha: 0.04) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: bd),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: dk ? 0.12 : 0.04), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: TextField(
        controller: ctrl, obscureText: obscure, keyboardType: keyboard, maxLength: maxLen,
        style: TextStyle(color: fg, fontSize: 14, fontWeight: FontWeight.w700),
        decoration: InputDecoration(
          labelText: label, hintText: hint,
          labelStyle: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600),
          prefixIcon: Icon(icon, color: AppTheme.electricBlue, size: 20),
          suffixIcon: suffix,
          border: InputBorder.none, counterText: '',
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        ),
      ),
    );
  }

  Widget _errorWidget(String msg) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFEF4444).withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
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

  Widget _btn(String label, VoidCallback? onTap, bool loading) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 56, width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: onTap == null
            ? [AppTheme.electricBlue.withValues(alpha: 0.5), AppTheme.royalBlue.withValues(alpha: 0.5)]
            : [AppTheme.electricBlue, AppTheme.royalBlue]),
          borderRadius: BorderRadius.circular(18),
          boxShadow: onTap != null
            ? [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 6))]
            : null,
        ),
        child: Center(child: loading
          ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
          : Text(label, style: GoogleFonts.outfit(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800))),
      ),
    );
  }
}
