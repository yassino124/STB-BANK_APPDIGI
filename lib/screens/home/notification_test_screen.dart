import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../services/auth_api_service.dart';
import '../../theme/app_theme.dart';

/// 🔔 Notification Test Screen - Tests OneSignal push notifications
class NotificationTestScreen extends StatefulWidget {
  const NotificationTestScreen({super.key});
  @override
  State<NotificationTestScreen> createState() => _NotificationTestScreenState();
}

class _NotificationTestScreenState extends State<NotificationTestScreen> {
  final _titleCtrl = TextEditingController(text: 'STB Alert 🔔');
  final _bodyCtrl = TextEditingController(text: 'Ceci est un test de notification OneSignal !');
  final _empIdCtrl = TextEditingController();
  String _selectedType = 'SYSTEM';
  bool _sendToAll = false;
  bool _isLoading = false;
  String? _lastResult;
  bool _lastSuccess = false;

  final List<Map<String, dynamic>> _notifTypes = [
    {'value': 'SYSTEM', 'label': 'Système', 'icon': Icons.settings_rounded, 'color': Color(0xFF6C63FF)},
    {'value': 'HR_REQUEST', 'label': 'RH', 'icon': Icons.people_rounded, 'color': Color(0xFF00BFA5)},
    {'value': 'TRANSACTION', 'label': 'Transaction', 'icon': Icons.attach_money_rounded, 'color': Color(0xFFFF6B35)},
    {'value': 'WARNING', 'label': 'Avertissement', 'icon': Icons.warning_rounded, 'color': Color(0xFFF59E0B)},
    {'value': 'SUCCESS', 'label': 'Succès', 'icon': Icons.check_circle_rounded, 'color': Color(0xFF10B981)},
  ];

  final List<Map<String, String>> _quickTests = [
    {'title': '🎉 Bienvenue !', 'body': 'Bienvenue sur STB Omni ! Votre compte est activé.', 'type': 'SUCCESS'},
    {'title': '💰 Virement reçu', 'body': 'Vous avez reçu un virement de 500 TND sur votre compte.', 'type': 'TRANSACTION'},
    {'title': '⚠️ Sécurité', 'body': 'Nouvelle connexion détectée depuis un appareil inconnu.', 'type': 'WARNING'},
    {'title': '🏖️ Congé approuvé', 'body': 'Votre demande de congé du 20 au 25 août a été approuvée.', 'type': 'HR_REQUEST'},
    {'title': '📄 Document disponible', 'body': 'Votre fiche de paie d\'août 2026 est disponible.', 'type': 'SYSTEM'},
  ];

  @override
  void dispose() {
    _titleCtrl.dispose();
    _bodyCtrl.dispose();
    _empIdCtrl.dispose();
    super.dispose();
  }

  Future<void> _sendNotification() async {
    if (_titleCtrl.text.trim().isEmpty || _bodyCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Titre et message requis !'), backgroundColor: Colors.red),
      );
      return;
    }
    setState(() { _isLoading = true; _lastResult = null; });

    final result = await AuthApiService.sendTestNotification(
      employeeId: _sendToAll ? null : _empIdCtrl.text.trim(),
      title: _titleCtrl.text.trim(),
      body: _bodyCtrl.text.trim(),
      type: _selectedType,
    );

    setState(() {
      _isLoading = false;
      _lastSuccess = result.isSuccess;
      _lastResult = result.isSuccess
          ? '✅ Notification envoyée avec succès !\n${_sendToAll ? "→ Envoyée à TOUS les employés" : "→ Envoyée à l\'employé ciblé"}'
          : '❌ Erreur : ${result.error}';
    });
  }

  void _applyQuickTest(Map<String, String> test) {
    setState(() {
      _titleCtrl.text = test['title']!;
      _bodyCtrl.text = test['body']!;
      _selectedType = test['type']!;
    });
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final isDark = p.themeMode == ThemeMode.dark;
    final bg = isDark ? const Color(0xFF0A1628) : const Color(0xFFF0F4FF);
    final cardBg = isDark ? const Color(0xFF0E1827) : Colors.white;
    final border = isDark ? const Color(0xFF1C2D44) : const Color(0xFFE2E8FF);
    final textPrimary = isDark ? Colors.white : const Color(0xFF1E293B);
    final textMuted = isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF0A1628) : const Color(0xFFF0F4FF),
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Test Notifications', style: GoogleFonts.inter(color: textPrimary, fontSize: 17, fontWeight: FontWeight.w700)),
            Text('OneSignal Push Test', style: GoogleFonts.inter(color: textMuted, fontSize: 12)),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withOpacity(0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 6, height: 6,
                  decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                ),
                const SizedBox(width: 5),
                Text('OneSignal', style: GoogleFonts.inter(color: const Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ─── Quick Tests ───────────────────────────────────
            _sectionTitle('⚡ Tests Rapides', textPrimary).animate().fadeIn(delay: 100.ms).slideX(begin: -0.1),
            const SizedBox(height: 12),
            SizedBox(
              height: 52,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _quickTests.length,
                separatorBuilder: (_, __) => const SizedBox(width: 10),
                itemBuilder: (_, i) {
                  final test = _quickTests[i];
                  return GestureDetector(
                    onTap: () => _applyQuickTest(test),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: border),
                      ),
                      child: Text(
                        test['title']!.split(' ').take(2).join(' '),
                        style: GoogleFonts.inter(color: textPrimary, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ),
                  );
                },
              ),
            ).animate().fadeIn(delay: 150.ms),
            const SizedBox(height: 24),

            // ─── Type selector ─────────────────────────────────
            _sectionTitle('📌 Type de notification', textPrimary).animate().fadeIn(delay: 200.ms),
            const SizedBox(height: 12),
            SizedBox(
              height: 56,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _notifTypes.length,
                separatorBuilder: (_, __) => const SizedBox(width: 10),
                itemBuilder: (_, i) {
                  final t = _notifTypes[i];
                  final selected = _selectedType == t['value'];
                  return GestureDetector(
                    onTap: () => setState(() => _selectedType = t['value'] as String),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: selected ? (t['color'] as Color).withOpacity(0.15) : cardBg,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: selected ? (t['color'] as Color) : border,
                          width: selected ? 1.5 : 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(t['icon'] as IconData, color: selected ? t['color'] as Color : textMuted, size: 16),
                          const SizedBox(width: 6),
                          Text(t['label'] as String,
                            style: GoogleFonts.inter(
                              color: selected ? t['color'] as Color : textMuted,
                              fontSize: 12, fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ).animate().fadeIn(delay: 250.ms),
            const SizedBox(height: 24),

            // ─── Form card ─────────────────────────────────────
            Container(
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: border),
                boxShadow: [
                  BoxShadow(
                    color: (isDark ? Colors.black : Colors.blue).withOpacity(0.06),
                    blurRadius: 20, offset: const Offset(0, 6),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _sectionTitle('✏️ Composez votre notification', textPrimary),
                  const SizedBox(height: 16),
                  _buildField(
                    controller: _titleCtrl,
                    label: 'Titre',
                    hint: 'Ex: STB Alert 🔔',
                    icon: Icons.title_rounded,
                    isDark: isDark,
                    textPrimary: textPrimary,
                    textMuted: textMuted,
                    border: border,
                  ),
                  const SizedBox(height: 14),
                  _buildField(
                    controller: _bodyCtrl,
                    label: 'Message',
                    hint: 'Entrez votre message ici...',
                    icon: Icons.message_rounded,
                    maxLines: 3,
                    isDark: isDark,
                    textPrimary: textPrimary,
                    textMuted: textMuted,
                    border: border,
                  ),
                ],
              ),
            ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.1),
            const SizedBox(height: 16),

            // ─── Target card ───────────────────────────────────
            Container(
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: border),
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _sectionTitle('🎯 Destinataire', textPrimary),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Envoyer à tous les employés',
                          style: GoogleFonts.inter(color: textPrimary, fontSize: 14, fontWeight: FontWeight.w500),
                        ),
                      ),
                      Switch(
                        value: _sendToAll,
                        onChanged: (v) => setState(() => _sendToAll = v),
                        activeColor: AppTheme.electricBlue,
                      ),
                    ],
                  ),
                  if (!_sendToAll) ...[
                    const SizedBox(height: 12),
                    _buildField(
                      controller: _empIdCtrl,
                      label: 'ID Employé (MongoDB ObjectId)',
                      hint: 'Ex: 64abc123def456...',
                      icon: Icons.person_pin_rounded,
                      isDark: isDark,
                      textPrimary: textPrimary,
                      textMuted: textMuted,
                      border: border,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.info_outline_rounded, size: 13, color: textMuted),
                        const SizedBox(width: 5),
                        Expanded(
                          child: Text(
                            'Laissez vide pour envoyer à vous-même',
                            style: GoogleFonts.inter(color: textMuted, fontSize: 11),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ).animate().fadeIn(delay: 350.ms).slideY(begin: 0.1),
            const SizedBox(height: 20),

            // ─── Result Banner ─────────────────────────────────
            if (_lastResult != null)
              Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: (_lastSuccess ? const Color(0xFF10B981) : const Color(0xFFEF4444)).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: (_lastSuccess ? const Color(0xFF10B981) : const Color(0xFFEF4444)).withOpacity(0.4),
                  ),
                ),
                child: Text(
                  _lastResult!,
                  style: GoogleFonts.inter(
                    color: _lastSuccess ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                    fontSize: 13, fontWeight: FontWeight.w600, height: 1.5,
                  ),
                ),
              ).animate().fadeIn().scale(begin: const Offset(0.95, 0.95)),

            // ─── Send Button ───────────────────────────────────
            SizedBox(
              width: double.infinity,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF6C63FF), Color(0xFF4F46E5)],
                  ),
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF6C63FF).withOpacity(0.4),
                      blurRadius: 20, offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _sendNotification,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 22, height: 22,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                            const SizedBox(width: 10),
                            Text(
                              _sendToAll ? 'Envoyer à tous 📢' : 'Envoyer la notification 🚀',
                              style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700),
                            ),
                          ],
                        ),
                ),
              ),
            ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.2),
            const SizedBox(height: 30),

            // ─── Info box ──────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF6C63FF).withOpacity(0.08),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF6C63FF).withOpacity(0.25)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    const Icon(Icons.lightbulb_outline_rounded, color: Color(0xFF6C63FF), size: 16),
                    const SizedBox(width: 6),
                    Text('Comment ça marche', style: GoogleFonts.inter(color: const Color(0xFF6C63FF), fontSize: 13, fontWeight: FontWeight.w700)),
                  ]),
                  const SizedBox(height: 10),
                  ...[
                    '1️⃣ Le Backend appelle l\'API OneSignal',
                    '2️⃣ OneSignal envoie la notif push au téléphone ciblé',
                    '3️⃣ La notif apparaît même si l\'app est fermée',
                    '4️⃣ La notification est aussi sauvegardée en DB',
                  ].map((t) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text(t, style: GoogleFonts.inter(color: textMuted, fontSize: 12, height: 1.5)),
                  )),
                ],
              ),
            ).animate().fadeIn(delay: 450.ms),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String text, Color color) {
    return Text(text, style: GoogleFonts.inter(color: color, fontSize: 14, fontWeight: FontWeight.w700));
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    int maxLines = 1,
    required bool isDark,
    required Color textPrimary,
    required Color textMuted,
    required Color border,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(color: textMuted, fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF0A1628) : const Color(0xFFF8FAFF),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: border),
          ),
          child: TextField(
            controller: controller,
            maxLines: maxLines,
            style: GoogleFonts.inter(color: textPrimary, fontSize: 13),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: GoogleFonts.inter(color: textMuted, fontSize: 13),
              prefixIcon: Icon(icon, color: textMuted, size: 18),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            ),
          ),
        ),
      ],
    );
  }
}
