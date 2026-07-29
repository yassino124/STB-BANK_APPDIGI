import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../providers/app_provider.dart';
import '../../../services/auth_api_service.dart';
import '../../../widgets/settings_layout.dart';
import 'package:local_auth/local_auth.dart';

class BiometricsSettingsScreen extends StatefulWidget {
  const BiometricsSettingsScreen({super.key});

  @override
  State<BiometricsSettingsScreen> createState() => _BiometricsSettingsScreenState();
}

class _BiometricsSettingsScreenState extends State<BiometricsSettingsScreen> {
  bool _isEnabled = false;
  bool _isChecking = true;
  final LocalAuthentication _localAuth = LocalAuthentication();

  @override
  void initState() {
    super.initState();
    _loadStatus();
  }

  Future<void> _loadStatus() async {
    final status = await AuthApiService.getBiometricEnabled();
    setState(() {
      _isEnabled = status;
      _isChecking = false;
    });
  }

  Future<void> _toggle(bool value) async {
    HapticFeedback.mediumImpact();
    if (value) {
      final canCheck = await _localAuth.canCheckBiometrics;
      if (!canCheck) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Aucun système biométrique détecté sur cet appareil.')),
          );
        }
        return;
      }
      final authenticated = await _localAuth.authenticate(
        localizedReason: 'Confirmez votre identité pour activer le verrouillage biométrique',
        options: const AuthenticationOptions(biometricOnly: true),
      );
      if (!authenticated) return;
    }
    
    await AuthApiService.saveBiometricEnabled(value);
    setState(() {
      _isEnabled = value;
    });
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<AppProvider>();
    final dk = prov.themeMode == ThemeMode.dark;
    final cardBg = dk ? const Color(0xFF1E293B).withValues(alpha: 0.5) : Colors.white;
    final cardBorder = dk ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final textCol = dk ? Colors.white : const Color(0xFF1E293B);

    return SettingsLayout(
      title: 'Biométrie',
      headerIcon: const Icon(Icons.fingerprint_rounded, size: 64, color: Color(0xFF6366F1)),
      children: [
        Text(
          'Sécurisez votre application',
          style: TextStyle(
            color: textCol,
            fontSize: 22,
            fontWeight: FontWeight.w800,
          ),
          textAlign: TextAlign.center,
        ).animate().fadeIn().slideY(begin: 0.2),
        const SizedBox(height: 12),
        Text(
          'Utilisez Face ID ou Touch ID pour déverrouiller STB Mobile rapidement et en toute sécurité.',
          style: TextStyle(
            color: dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
            fontSize: 14,
            fontWeight: FontWeight.w500,
            height: 1.5,
          ),
          textAlign: TextAlign.center,
        ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.2),
        const SizedBox(height: 48),
        if (!_isChecking)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: cardBorder),
              boxShadow: [
                BoxShadow(
                  color: (dk ? Colors.black : const Color(0xFF64748B)).withValues(alpha: 0.05),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.security_rounded, color: Color(0xFF6366F1)),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Verrouillage Biométrique',
                        style: TextStyle(
                          color: textCol,
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _isEnabled ? 'Activé' : 'Désactivé',
                        style: TextStyle(
                          color: _isEnabled ? const Color(0xFF10B981) : const Color(0xFF64748B),
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                Switch.adaptive(
                  value: _isEnabled,
                  onChanged: _toggle,
                  activeColor: const Color(0xFF6366F1),
                ),
              ],
            ),
          ).animate().fadeIn(delay: 200.ms).scale(),
      ],
    );
  }
}
