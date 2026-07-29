import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_api_service.dart';

class CreateTicketScreen extends StatefulWidget {
  const CreateTicketScreen({super.key});

  @override
  State<CreateTicketScreen> createState() => _CreateTicketScreenState();
}

class _CreateTicketScreenState extends State<CreateTicketScreen> {
  final _subjectCtrl = TextEditingController();
  final _msgCtrl = TextEditingController();
  String _selectedType = 'ASSISTANCE';
  String _selectedPriority = 'MEDIUM';
  bool _submitting = false;

  final _types = [
    {
      'value': 'ASSISTANCE',
      'icon': Icons.help_outline_rounded,
      'label': 'Assistance',
      'color': AppTheme.electricBlue
    },
    {
      'value': 'RECLAMATION',
      'icon': Icons.report_problem_rounded,
      'label': 'Réclamation',
      'color': AppTheme.coralRed
    },
    {
      'value': 'BUG',
      'icon': Icons.bug_report_rounded,
      'label': 'Bug',
      'color': AppTheme.amber
    },
    {
      'value': 'FEEDBACK',
      'icon': Icons.lightbulb_outline_rounded,
      'label': 'Feedback',
      'color': AppTheme.emerald
    },
  ];

  @override
  void dispose() {
    _subjectCtrl.dispose();
    _msgCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final subject = _subjectCtrl.text.trim();
    final message = _msgCtrl.text.trim();

    if (subject.isEmpty || message.isEmpty) {
      _showSnack('Veuillez remplir tous les champs', AppTheme.coralRed);
      return;
    }

    setState(() => _submitting = true);

    final res = await AuthApiService.createTicket(
      type: _selectedType,
      subject: subject,
      message: message,
      priority: _selectedPriority,
    );

    if (mounted) {
      setState(() => _submitting = false);
      if (res.isSuccess) {
        _showSuccessModal();
      } else {
        _showSnack(res.error ?? 'Erreur lors de la création', AppTheme.coralRed);
      }
    }
  }

  void _showSnack(String msg, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: const TextStyle(color: Colors.white)),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    );
  }

  void _showSuccessModal() {
    final p = Provider.of<AppProvider>(context, listen: false);
    final dk = p.themeMode == ThemeMode.dark;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => Container(
        padding: const EdgeInsets.all(32),
        margin: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: dk ? const Color(0xFF0E1827).withValues(alpha: 0.95) : Colors.white.withValues(alpha: 0.98),
          borderRadius: BorderRadius.circular(32),
          border: Border.all(
            color: dk ? Colors.white.withValues(alpha: 0.10) : Colors.black.withValues(alpha: 0.07),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                gradient: AppTheme.successGradient,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.emerald.withValues(alpha: 0.4),
                    blurRadius: 24,
                    spreadRadius: 2,
                  )
                ],
              ),
              child: const Icon(Icons.check_rounded, color: Colors.white, size: 42),
            ).animate().scale(delay: 100.ms, duration: 400.ms, curve: Curves.easeOutBack),
            const SizedBox(height: 24),
            Text(
              'Ticket Créé!',
              style: TextStyle(
                color: dk ? Colors.white : AppTheme.textPrimaryLight,
                fontSize: 24,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Notre équipe de support a reçu votre demande et vous répondra rapidement.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: dk ? Colors.white.withValues(alpha: 0.6) : AppTheme.textMutedLight,
                fontSize: 14,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),
            GestureDetector(
              onTap: () {
                Navigator.pop(context);
                Navigator.pop(context, true); // Return true to refresh list
              },
              child: Container(
                height: 56,
                width: double.infinity,
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.electricBlue.withValues(alpha: 0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 6),
                    )
                  ],
                ),
                child: const Center(
                  child: Text(
                    'Parfait!',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
            SizedBox(height: MediaQuery.of(context).padding.bottom),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;

    return Scaffold(
      backgroundColor: dk ? AppTheme.bgDark : AppTheme.bgLight,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      HapticFeedback.lightImpact();
                      Navigator.pop(context);
                    },
                    child: Container(
                      width: 46,
                      height: 46,
                      decoration: BoxDecoration(
                        color: dk
                            ? Colors.white.withValues(alpha: 0.08)
                            : Colors.white.withValues(alpha: 0.85),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: dk
                              ? Colors.white.withValues(alpha: 0.10)
                              : Colors.black.withValues(alpha: 0.05),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: dk ? 0.15 : 0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Icon(Icons.arrow_back_ios_new_rounded,
                          color: dk ? Colors.white : AppTheme.textPrimaryLight,
                          size: 18),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Text(
                    'Nouveau Ticket',
                    style: TextStyle(
                      color: dk ? Colors.white : AppTheme.textPrimaryLight,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ),
                ],
              ).animate().fadeIn(duration: 300.ms),
            ),

            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 32, 20, 120),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Type de demande',
                      style: TextStyle(
                        color: dk ? Colors.white : AppTheme.textPrimaryLight,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ).animate().fadeIn(delay: 100.ms),
                    const SizedBox(height: 16),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 2.2,
                      ),
                      itemCount: _types.length,
                      itemBuilder: (context, i) {
                        final type = _types[i];
                        final isSel = _selectedType == type['value'];
                        final color = type['color'] as Color;
                        return GestureDetector(
                          onTap: () {
                            HapticFeedback.selectionClick();
                            setState(() => _selectedType = type['value'] as String);
                          },
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 250),
                            decoration: BoxDecoration(
                              color: isSel
                                  ? color.withValues(alpha: 0.1)
                                  : (dk
                                      ? Colors.white.withValues(alpha: 0.06)
                                      : Colors.white.withValues(alpha: 0.85)),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isSel
                                    ? color.withValues(alpha: 0.5)
                                    : (dk
                                        ? Colors.white.withValues(alpha: 0.10)
                                        : Colors.black.withValues(alpha: 0.06)),
                                width: isSel ? 2 : 1,
                              ),
                              boxShadow: isSel
                                  ? [
                                      BoxShadow(
                                        color: color.withValues(alpha: 0.2),
                                        blurRadius: 12,
                                        offset: const Offset(0, 4),
                                      )
                                    ]
                                  : [],
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(type['icon'] as IconData,
                                    color: isSel ? color : (dk ? Colors.white.withValues(alpha: 0.4) : AppTheme.textMutedLight),
                                    size: 18),
                                const SizedBox(width: 8),
                                Text(
                                  type['label'] as String,
                                  style: TextStyle(
                                    color: isSel
                                        ? color
                                        : (dk ? Colors.white.withValues(alpha: 0.7) : AppTheme.textPrimaryLight),
                                    fontSize: 13,
                                    fontWeight: isSel ? FontWeight.w700 : FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ).animate().fadeIn(delay: 150.ms).slideY(begin: 0.05),

                    const SizedBox(height: 24),

                    // Priority
                    Text(
                      'Priorité',
                      style: TextStyle(
                        color: dk ? Colors.white : AppTheme.textPrimaryLight,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ).animate().fadeIn(delay: 200.ms),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _PriorityChip(
                          label: 'Normale',
                          value: 'MEDIUM',
                          selected: _selectedPriority,
                          onTap: (v) => setState(() => _selectedPriority = v),
                          isDark: dk,
                        ),
                        const SizedBox(width: 10),
                        _PriorityChip(
                          label: 'Haute',
                          value: 'HIGH',
                          selected: _selectedPriority,
                          onTap: (v) => setState(() => _selectedPriority = v),
                          isDark: dk,
                        ),
                        const SizedBox(width: 10),
                        _PriorityChip(
                          label: 'Urgente',
                          value: 'URGENT',
                          selected: _selectedPriority,
                          onTap: (v) => setState(() => _selectedPriority = v),
                          isDark: dk,
                          color: AppTheme.coralRed,
                        ),
                      ],
                    ).animate().fadeIn(delay: 250.ms),

                    const SizedBox(height: 32),

                    // Subject
                    Text(
                      'Sujet',
                      style: TextStyle(
                        color: dk ? Colors.white : AppTheme.textPrimaryLight,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ).animate().fadeIn(delay: 300.ms),
                    const SizedBox(height: 12),
                    _InputField(
                      controller: _subjectCtrl,
                      hint: 'Ex: Problème de virement',
                      isDark: dk,
                    ).animate().fadeIn(delay: 350.ms),

                    const SizedBox(height: 24),

                    // Message
                    Text(
                      'Description',
                      style: TextStyle(
                        color: dk ? Colors.white : AppTheme.textPrimaryLight,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ).animate().fadeIn(delay: 400.ms),
                    const SizedBox(height: 12),
                    _InputField(
                      controller: _msgCtrl,
                      hint: 'Décrivez votre demande en détail...',
                      maxLines: 6,
                      isDark: dk,
                    ).animate().fadeIn(delay: 450.ms),

                    const SizedBox(height: 48),

                    // Submit
                    GestureDetector(
                      onTap: _submitting ? null : _submit,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        height: 60,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          gradient: _submitting ? null : AppTheme.primaryGradient,
                          color: _submitting
                              ? (dk ? Colors.white.withValues(alpha: 0.06) : Colors.white.withValues(alpha: 0.85))
                              : null,
                          borderRadius: BorderRadius.circular(20),
                          border: _submitting
                              ? Border.all(
                                  color: dk ? Colors.white.withValues(alpha: 0.10) : Colors.black.withValues(alpha: 0.06))
                              : null,
                          boxShadow: _submitting
                              ? []
                              : [
                                  BoxShadow(
                                    color: AppTheme.electricBlue.withValues(alpha: 0.4),
                                    blurRadius: 20,
                                    offset: const Offset(0, 8),
                                  )
                                ],
                        ),
                        child: Center(
                          child: _submitting
                              ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                    color: AppTheme.electricBlue,
                                    strokeWidth: 3,
                                  ),
                                )
                              : const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.send_rounded, color: Colors.white, size: 20),
                                    SizedBox(width: 12),
                                    Text(
                                      'Créer le ticket',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 16,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  ],
                                ),
                        ),
                      ),
                    ).animate().fadeIn(delay: 500.ms).slideY(begin: 0.1, curve: Curves.easeOutBack),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PriorityChip extends StatelessWidget {
  final String label;
  final String value;
  final String selected;
  final void Function(String) onTap;
  final bool isDark;
  final Color? color;

  const _PriorityChip({
    required this.label,
    required this.value,
    required this.selected,
    required this.onTap,
    required this.isDark,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final isSel = selected == value;
    final chipColor = color ?? AppTheme.electricBlue;

    return Expanded(
      child: GestureDetector(
        onTap: () {
          HapticFeedback.selectionClick();
          onTap(value);
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSel
                ? chipColor.withValues(alpha: 0.1)
                : (isDark ? Colors.white.withValues(alpha: 0.06) : Colors.white.withValues(alpha: 0.85)),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSel
                  ? chipColor.withValues(alpha: 0.5)
                  : (isDark ? Colors.white.withValues(alpha: 0.10) : Colors.black.withValues(alpha: 0.06)),
              width: isSel ? 2 : 1,
            ),
            boxShadow: isSel
                ? [
                    BoxShadow(
                      color: chipColor.withValues(alpha: 0.2),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    )
                  ]
                : [],
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isSel ? chipColor : (isDark ? Colors.white.withValues(alpha: 0.7) : AppTheme.textPrimaryLight),
              fontSize: 13,
              fontWeight: isSel ? FontWeight.w800 : FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}

class _InputField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final int maxLines;
  final bool isDark;

  const _InputField({
    required this.controller,
    required this.hint,
    required this.isDark,
    this.maxLines = 1,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
        child: Container(
          decoration: BoxDecoration(
            color: isDark ? Colors.white.withValues(alpha: 0.06) : Colors.white.withValues(alpha: 0.85),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? Colors.white.withValues(alpha: 0.10) : Colors.black.withValues(alpha: 0.06),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.12 : 0.04),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: TextField(
            controller: controller,
            maxLines: maxLines,
            style: TextStyle(
              color: isDark ? Colors.white : AppTheme.textPrimaryLight,
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: TextStyle(
                color: isDark ? Colors.white.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.3),
                fontSize: 15,
              ),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.all(16),
            ),
          ),
        ),
      ),
    );
  }
}
