import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../tickets/tickets_list_screen.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  final TextEditingController _subjectCtrl = TextEditingController();
  final TextEditingController _msgCtrl = TextEditingController();
  String _selectedCategory = 'Assistance';
  bool _isSubmitting = false;

  final _categories = [
    {'icon': Icons.help_outline_rounded, 'label': 'Assistance', 'color': AppTheme.royalBlue},
    {'icon': Icons.report_problem_rounded, 'label': 'Réclamation', 'color': AppTheme.coralRed},
    {'icon': Icons.bug_report_rounded, 'label': 'Bug', 'color': AppTheme.emerald},
    {'icon': Icons.lightbulb_outline_rounded, 'label': 'Feedback', 'color': AppTheme.amber},
  ];

  void _submitTicket() {
    if (_subjectCtrl.text.trim().isEmpty || _msgCtrl.text.trim().isEmpty) {
      HapticFeedback.heavyImpact();
      return;
    }
    setState(() => _isSubmitting = true);
    HapticFeedback.mediumImpact();
    
    // Simulate network delay for WOW effect
    Future.delayed(const Duration(milliseconds: 2000), () {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      HapticFeedback.heavyImpact();
      _showSuccessModal();
    });
  }

  void _showSuccessModal() {
    final dk = Theme.of(context).brightness == Brightness.dark;
    final fg = dk ? Colors.white : const Color(0xFF0F172A);
    final cd = Theme.of(context).cardColor;
    
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: cd,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 48, height: 4, decoration: BoxDecoration(color: Colors.grey.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 32),
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(color: AppTheme.emerald.withValues(alpha: 0.1), shape: BoxShape.circle),
              child: const Icon(Icons.check_circle_rounded, color: AppTheme.emerald, size: 42),
            ).animate().scale(delay: 100.ms, duration: 400.ms, curve: Curves.easeOutBack),
            const SizedBox(height: 24),
            Text("Ticket Envoyé !", style: TextStyle(color: fg, fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
            const SizedBox(height: 12),
            Text(
              "Notre équipe de support a bien reçu votre demande. Nous vous répondrons dans les plus brefs délais.",
              textAlign: TextAlign.center,
              style: TextStyle(color: fg.withValues(alpha: 0.6), fontSize: 14, height: 1.5),
            ),
            const SizedBox(height: 32),
            GestureDetector(
              onTap: () {
                Navigator.pop(context);
                Navigator.pop(context); // Go back to dashboard
              },
              child: Container(
                height: 56, width: double.infinity,
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, 6))],
                ),
                child: const Center(child: Text("Retour à l'accueil", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700))),
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
    // Redirect to new tickets system
    Future.microtask(() {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const TicketsListScreen()),
      );
    });

    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(color: AppTheme.electricBlue),
      ),
    );
  }
}
