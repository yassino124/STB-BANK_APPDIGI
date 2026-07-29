import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../theme/app_theme.dart';

class QRScreen extends StatefulWidget {
  const QRScreen({super.key});
  @override
  State<QRScreen> createState() => _QRScreenState();
}

class _QRScreenState extends State<QRScreen> {
  bool _isScanning = false;
  bool _scanDone = false;
  int _tab = 0;

  void _startScan() {
    setState(() { _isScanning = true; _scanDone = false; });
    Future.delayed(const Duration(milliseconds: 2800), () {
      if (mounted) {
        setState(() { _isScanning = false; _scanDone = true; });
        HapticFeedback.heavyImpact();
        _showSuccess();
      }
    });
  }

  void _showSuccess() {
    final dk = Theme.of(context).brightness == Brightness.dark;
    final bg = dk ? const Color(0xFF0B1426) : Colors.white;
    final fg = dk ? Colors.white : const Color(0xFF0F172A);
    final mt = dk ? const Color(0xFF64748B) : const Color(0xFF94A3B8);
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => Container(
        decoration: BoxDecoration(color: bg, borderRadius: const BorderRadius.vertical(top: Radius.circular(32))),
        padding: const EdgeInsets.fromLTRB(24, 12, 24, 40),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 40, height: 4, margin: const EdgeInsets.only(bottom: 28), decoration: BoxDecoration(color: mt.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2))),
          Container(width: 64, height: 64, decoration: BoxDecoration(color: AppTheme.emerald.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: const Icon(Icons.check_circle_rounded, color: AppTheme.emerald, size: 36)).animate().scale(delay: 100.ms, duration: 400.ms, curve: Curves.easeOutBack),
          const SizedBox(height: 16),
          Text('QR Détecté !', style: TextStyle(color: fg, fontSize: 20, fontWeight: FontWeight.w800)),
          const SizedBox(height: 6),
          Text('Paiement vers Ahmed Karray', style: TextStyle(color: mt, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 24),
          Container(padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppTheme.emerald.withValues(alpha: 0.06), borderRadius: BorderRadius.circular(18), border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.2))),
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('Montant', style: TextStyle(color: mt, fontSize: 14)),
              Text('85.000 TND', style: TextStyle(color: fg, fontSize: 16, fontWeight: FontWeight.w800)),
            ])),
          const SizedBox(height: 24),
          SizedBox(width: double.infinity, height: 54,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), padding: EdgeInsets.zero),
              child: Ink(decoration: BoxDecoration(gradient: AppTheme.primaryGradient, borderRadius: BorderRadius.circular(16)),
                child: const Center(child: Text('Confirmer le paiement', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800)))),
            )),
        ]),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dk = Theme.of(context).brightness == Brightness.dark;
    final fg = dk ? Colors.white : const Color(0xFF0F172A);
    final mt = dk ? const Color(0xFF64748B) : const Color(0xFF94A3B8);
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.05);
    return Scaffold(
      drawerEnableOpenDragGesture: false,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(child: Column(children: [
        // Header
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
          child: Row(children: [
            GestureDetector(
              onTap: () { HapticFeedback.lightImpact(); Navigator.pop(context); },
              child: Container(width: 46, height: 46, decoration: BoxDecoration(color: cd, shape: BoxShape.circle, border: Border.all(color: bd), boxShadow: AppTheme.cardShadow(dk)),
                child: Icon(Icons.arrow_back_ios_new_rounded, color: fg, size: 18)),
            ),
            const SizedBox(width: 16),
            Text('Scan & Pay QR', style: TextStyle(color: fg, fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
          ]).animate().fadeIn(duration: 300.ms),
        ),
        const SizedBox(height: 20),
        // Tab
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(color: cd, borderRadius: BorderRadius.circular(20), border: Border.all(color: bd)),
            child: Row(children: [
              _tabBtn('Scanner', 0, fg, dk),
              _tabBtn('Mon QR Code', 1, fg, dk),
            ]),
          ),
        ),
        const SizedBox(height: 24),
        Expanded(child: _tab == 0 ? _buildScanner(fg, mt, cd, bd, dk) : _buildMyQR(fg, mt, cd, bd)),
      ])),
    );
  }

  Widget _tabBtn(String label, int idx, Color fg, bool dk) => Expanded(
    child: GestureDetector(
      onTap: () { HapticFeedback.selectionClick(); setState(() => _tab = idx); },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(color: _tab == idx ? AppTheme.electricBlue : Colors.transparent, borderRadius: BorderRadius.circular(16)),
        alignment: Alignment.center,
        child: Text(label, style: TextStyle(color: _tab == idx ? Colors.white : (dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B)), fontSize: 13, fontWeight: FontWeight.w700)),
      ),
    ),
  );

  Widget _buildScanner(Color fg, Color mt, Color cd, Color bd, bool dk) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 24),
    child: Column(children: [
      Expanded(
        child: Container(
          width: double.infinity,
          decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.85), borderRadius: BorderRadius.circular(32), border: Border.all(color: AppTheme.electricBlue.withValues(alpha: 0.3))),
          child: Stack(alignment: Alignment.center, children: [
            Positioned(top: 36, left: 36, child: _corner(true, true)),
            Positioned(top: 36, right: 36, child: _corner(true, false)),
            Positioned(bottom: 36, left: 36, child: _corner(false, true)),
            Positioned(bottom: 36, right: 36, child: _corner(false, false)),
            if (_isScanning)
              TweenAnimationBuilder<double>(
                tween: Tween(begin: 0.0, end: 1.0), duration: const Duration(milliseconds: 2800), curve: Curves.easeInOut,
                builder: (_, v, __) => Positioned(
                  top: 60 + v * 240, left: 40, right: 40,
                  child: Container(height: 2, decoration: BoxDecoration(color: AppTheme.turquoise, boxShadow: [BoxShadow(color: AppTheme.turquoise.withValues(alpha: 0.8), blurRadius: 8)])),
                ),
              ),
            if (!_isScanning && !_scanDone)
              Column(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.qr_code_scanner_rounded, color: Colors.white54, size: 52),
                const SizedBox(height: 12),
                Text('Pointez vers un QR code', style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 13, fontWeight: FontWeight.w600)),
              ]),
            if (_scanDone)
              Column(mainAxisSize: MainAxisSize.min, children: [
                Container(width: 64, height: 64, decoration: BoxDecoration(color: AppTheme.emerald.withValues(alpha: 0.15), shape: BoxShape.circle),
                  child: const Icon(Icons.check_rounded, color: AppTheme.emerald, size: 36)).animate().scale(duration: 350.ms, curve: Curves.easeOutBack),
                const SizedBox(height: 12),
                const Text('QR Scanné !', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800)),
              ]),
          ]),
        ),
      ),
      const SizedBox(height: 24),
      GestureDetector(
        onTap: _isScanning ? null : _startScan,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300), height: 64, width: 64,
          decoration: BoxDecoration(
            gradient: _isScanning ? null : AppTheme.primaryGradient,
            color: _isScanning ? AppTheme.electricBlue.withValues(alpha: 0.3) : null,
            shape: BoxShape.circle,
            boxShadow: _isScanning ? [] : [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 6))],
          ),
          child: _isScanning
              ? const Center(child: SizedBox(width: 28, height: 28, child: CircularProgressIndicator(color: AppTheme.electricBlue, strokeWidth: 3)))
              : const Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 28),
        ),
      ),
      const SizedBox(height: 8),
      Text(_isScanning ? 'Scan en cours...' : 'Appuyez pour scanner', style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
      const SizedBox(height: 28),
    ]),
  );

  Widget _buildMyQR(Color fg, Color mt, Color cd, Color bd) => SingleChildScrollView(
    padding: const EdgeInsets.symmetric(horizontal: 24),
    physics: const BouncingScrollPhysics(),
    child: Column(children: [
      Container(
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [Color(0xFF0D47A1), Color(0xFF1976D2)], begin: Alignment.topLeft, end: Alignment.bottomRight),
          borderRadius: BorderRadius.circular(28),
          boxShadow: [BoxShadow(color: AppTheme.royalBlue.withValues(alpha: 0.35), blurRadius: 24, offset: const Offset(0, 10))],
        ),
        child: Column(children: [
          const Text('Mon QR STB', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1)),
          const SizedBox(height: 20),
          Container(width: 180, height: 180, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)), padding: const EdgeInsets.all(16),
            child: const Icon(Icons.qr_code_2_rounded, size: 148, color: Colors.black)),
          const SizedBox(height: 20),
          const Text('Yassine Wertani', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text('STB ••• 7294', style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 13, fontWeight: FontWeight.w600)),
        ]),
      ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.08),
      const SizedBox(height: 24),
      SizedBox(width: double.infinity, height: 54,
        child: OutlinedButton.icon(
          onPressed: () => HapticFeedback.mediumImpact(),
          style: OutlinedButton.styleFrom(side: BorderSide(color: AppTheme.electricBlue.withValues(alpha: 0.4)), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
          icon: const Icon(Icons.share_rounded, color: AppTheme.electricBlue, size: 18),
          label: const Text('Partager mon QR', style: TextStyle(color: AppTheme.electricBlue, fontSize: 14, fontWeight: FontWeight.w700)),
        )),
      const SizedBox(height: 32),
    ]),
  );

  Widget _corner(bool top, bool left) => SizedBox(width: 28, height: 28,
    child: CustomPaint(painter: _CornerPainter(top: top, left: left)));
}

class _CornerPainter extends CustomPainter {
  final bool top, left;
  const _CornerPainter({required this.top, required this.left});
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()..color = AppTheme.turquoise..strokeWidth = 3..style = PaintingStyle.stroke..strokeCap = StrokeCap.round;
    final x = left ? 0.0 : size.width; final y = top ? 0.0 : size.height;
    final dx = left ? size.width : -size.width; final dy = top ? size.height : -size.height;
    canvas.drawLine(Offset(x, y), Offset(x + dx, y), p);
    canvas.drawLine(Offset(x, y), Offset(x, y + dy), p);
  }
  @override bool shouldRepaint(_) => false;
}
