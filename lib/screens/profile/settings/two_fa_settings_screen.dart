import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../providers/app_provider.dart';
import '../../../widgets/settings_layout.dart';

class TwoFASettingsScreen extends StatefulWidget {
  const TwoFASettingsScreen({super.key});

  @override
  State<TwoFASettingsScreen> createState() => _TwoFASettingsScreenState();
}

class _TwoFASettingsScreenState extends State<TwoFASettingsScreen> {
  bool _smsEnabled = true;
  bool _appEnabled = false;

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<AppProvider>();
    final dk = prov.themeMode == ThemeMode.dark;
    final textCol = dk ? Colors.white : const Color(0xFF1E293B);

    return SettingsLayout(
      title: '2FA Authentication',
      headerIcon: const Icon(Icons.security_rounded, size: 64, color: Color(0xFF10B981)),
      children: [
        Text(
          'Double Vérification',
          style: TextStyle(
            color: textCol,
            fontSize: 22,
            fontWeight: FontWeight.w800,
          ),
          textAlign: TextAlign.center,
        ).animate().fadeIn().slideY(begin: 0.2),
        const SizedBox(height: 12),
        Text(
          'Ajoutez une couche de sécurité supplémentaire à votre compte pour empêcher tout accès non autorisé.',
          style: TextStyle(
            color: dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
            fontSize: 14,
            fontWeight: FontWeight.w500,
            height: 1.5,
          ),
          textAlign: TextAlign.center,
        ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.2),
        const SizedBox(height: 48),
        _buildToggleItem(
          icon: Icons.sms_rounded,
          title: 'SMS Authentification',
          subtitle: 'Recevez un code par SMS à chaque connexion',
          value: _smsEnabled,
          onChanged: (val) {
            HapticFeedback.mediumImpact();
            setState(() => _smsEnabled = val);
          },
          dk: dk,
        ).animate().fadeIn(delay: 200.ms).scale(),
        const SizedBox(height: 16),
        _buildToggleItem(
          icon: Icons.qr_code_scanner_rounded,
          title: 'Application Authenticator',
          subtitle: 'Utilisez Google Authenticator ou Authy',
          value: _appEnabled,
          onChanged: (val) {
            HapticFeedback.mediumImpact();
            setState(() => _appEnabled = val);
          },
          dk: dk,
        ).animate().fadeIn(delay: 300.ms).scale(),
      ],
    );
  }

  Widget _buildToggleItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    required bool dk,
  }) {
    final cardBg = dk ? const Color(0xFF1E293B).withValues(alpha: 0.5) : Colors.white;
    final cardBorder = dk ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final textCol = dk ? Colors.white : const Color(0xFF1E293B);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: cardBorder),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: const Color(0xFF10B981)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: textCol,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          Switch.adaptive(
            value: value,
            onChanged: onChanged,
            activeColor: const Color(0xFF10B981),
          ),
        ],
      ),
    );
  }
}
