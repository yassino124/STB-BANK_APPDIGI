import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../providers/app_provider.dart';
import '../../../widgets/settings_layout.dart';

class DevicesSettingsScreen extends StatelessWidget {
  const DevicesSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<AppProvider>();
    final dk = prov.themeMode == ThemeMode.dark;
    final textCol = dk ? Colors.white : const Color(0xFF1E293B);

    return SettingsLayout(
      title: 'Appareils Connectés',
      headerIcon: const Icon(Icons.devices_rounded, size: 64, color: Color(0xFF3B82F6)),
      children: [
        Text(
          'Vos Appareils Actifs',
          style: TextStyle(
            color: textCol,
            fontSize: 22,
            fontWeight: FontWeight.w800,
          ),
          textAlign: TextAlign.center,
        ).animate().fadeIn().slideY(begin: 0.2),
        const SizedBox(height: 12),
        Text(
          'Gérez les appareils qui ont actuellement accès à votre compte STB Mobile.',
          style: TextStyle(
            color: dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
            fontSize: 14,
            fontWeight: FontWeight.w500,
            height: 1.5,
          ),
          textAlign: TextAlign.center,
        ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.2),
        const SizedBox(height: 40),
        _buildDeviceItem(
          context,
          icon: Icons.phone_iphone_rounded,
          name: 'iPhone 17 Pro',
          location: 'Tunis, Tunisie',
          lastActive: 'Actif maintenant',
          isCurrent: true,
          dk: dk,
        ).animate().fadeIn(delay: 200.ms).slideX(begin: 0.2),
        const SizedBox(height: 16),
        _buildDeviceItem(
          context,
          icon: Icons.laptop_mac_rounded,
          name: 'MacBook Pro M4',
          location: 'Tunis, Tunisie',
          lastActive: 'Dernière activité hier',
          isCurrent: false,
          dk: dk,
        ).animate().fadeIn(delay: 300.ms).slideX(begin: 0.2),
      ],
    );
  }

  Widget _buildDeviceItem(BuildContext context, {
    required IconData icon,
    required String name,
    required String location,
    required String lastActive,
    required bool isCurrent,
    required bool dk,
  }) {
    final cardBg = dk ? const Color(0xFF1E293B).withValues(alpha: 0.5) : Colors.white;
    final cardBorder = dk ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final textCol = dk ? Colors.white : const Color(0xFF1E293B);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: cardBorder),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isCurrent ? const Color(0xFF10B981).withValues(alpha: 0.1) : (dk ? const Color(0xFF334155) : const Color(0xFFF1F5F9)),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: isCurrent ? const Color(0xFF10B981) : (dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B))),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      name,
                      style: TextStyle(
                        color: textCol,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    if (isCurrent) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'ACTUEL',
                          style: TextStyle(
                            color: Color(0xFF10B981),
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  location,
                  style: TextStyle(
                    color: dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  lastActive,
                  style: TextStyle(
                    color: isCurrent ? const Color(0xFF10B981) : (dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          if (!isCurrent)
            IconButton(
              icon: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444)),
              onPressed: () {
                HapticFeedback.mediumImpact();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('$name déconnecté avec succès.')),
                );
              },
            ),
        ],
      ),
    );
  }
}
