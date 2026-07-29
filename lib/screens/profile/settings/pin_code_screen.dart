import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../providers/app_provider.dart';
import '../../../widgets/settings_layout.dart';

class PinCodeSettingsScreen extends StatefulWidget {
  const PinCodeSettingsScreen({super.key});

  @override
  State<PinCodeSettingsScreen> createState() => _PinCodeSettingsScreenState();
}

class _PinCodeSettingsScreenState extends State<PinCodeSettingsScreen> {
  String _pin = '';

  void _onKeypadTap(String value) {
    HapticFeedback.lightImpact();
    if (value == 'backspace') {
      if (_pin.isNotEmpty) {
        setState(() => _pin = _pin.substring(0, _pin.length - 1));
      }
    } else {
      if (_pin.length < 4) {
        setState(() => _pin += value);
        if (_pin.length == 4) {
          _verifyPin();
        }
      }
    }
  }

  void _verifyPin() {
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Nouveau code PIN enregistré.')),
        );
        Navigator.pop(context);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<AppProvider>();
    final dk = prov.themeMode == ThemeMode.dark;
    final textCol = dk ? Colors.white : const Color(0xFF1E293B);

    return SettingsLayout(
      title: 'Code PIN',
      headerIcon: const Icon(Icons.lock_outline_rounded, size: 64, color: Color(0xFFF59E0B)),
      children: [
        Text(
          'Changer le code PIN',
          style: TextStyle(
            color: textCol,
            fontSize: 22,
            fontWeight: FontWeight.w800,
          ),
          textAlign: TextAlign.center,
        ).animate().fadeIn().slideY(begin: 0.2),
        const SizedBox(height: 12),
        Text(
          'Entrez votre nouveau code PIN à 4 chiffres.',
          style: TextStyle(
            color: dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
        ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.2),
        const SizedBox(height: 48),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(4, (index) {
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 12),
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _pin.length > index
                    ? const Color(0xFFF59E0B)
                    : (dk ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
              ),
            ).animate(target: _pin.length > index ? 1 : 0).scale();
          }),
        ).animate().fadeIn(delay: 200.ms),
        const SizedBox(height: 64),
        _buildKeypad(dk),
      ],
    );
  }

  Widget _buildKeypad(bool dk) {
    return Column(
      children: [
        for (var i = 0; i < 3; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                for (var j = 1; j <= 3; j++) _buildKeypadBtn('${i * 3 + j}', dk),
              ],
            ),
          ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            const SizedBox(width: 72), // Empty space
            _buildKeypadBtn('0', dk),
            _buildKeypadBtn('backspace', dk, icon: Icons.backspace_outlined),
          ],
        ),
      ].animate(interval: 50.ms).fadeIn(delay: 300.ms).slideY(begin: 0.2),
    );
  }

  Widget _buildKeypadBtn(String value, bool dk, {IconData? icon}) {
    final textCol = dk ? Colors.white : const Color(0xFF1E293B);
    return GestureDetector(
      onTap: () => _onKeypadTap(value),
      child: Container(
        width: 72,
        height: 72,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: dk ? const Color(0xFF1E293B) : Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        alignment: Alignment.center,
        child: icon != null
            ? Icon(icon, color: textCol, size: 28)
            : Text(
                value,
                style: TextStyle(
                  color: textCol,
                  fontSize: 28,
                  fontWeight: FontWeight.w600,
                ),
              ),
      ),
    );
  }
}
