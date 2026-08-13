import 'dart:ui';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
// import 'package:speech_to_text/speech_to_text.dart' as stt;  // Temporarily disabled
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/ai_api_service.dart';

class AILeavePlannerScreen extends StatefulWidget {
  final int remainingDays;
  const AILeavePlannerScreen({super.key, required this.remainingDays});

  @override
  State<AILeavePlannerScreen> createState() => _AILeavePlannerScreenState();
}

class _AILeavePlannerScreenState extends State<AILeavePlannerScreen>
    with SingleTickerProviderStateMixin {
  final TextEditingController _ctrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();
  // final stt.SpeechToText _speech = stt.SpeechToText();  // Temporarily disabled

  String? _planResult;
  bool _isLoading = false;
  bool _isListening = false;
  late AnimationController _pulseCtrl;

  final _suggestions = [
    "Je veux 5 jours en incluant un weekend",
    "Planifie mes congés pour la semaine prochaine",
    "Propose les meilleures dates pour juillet",
    "Je veux poser 2 semaines en août",
  ];

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500))
      ..repeat(reverse: true);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _scrollCtrl.dispose();
    _pulseCtrl.dispose();
    super.dispose();
  }

  Future<void> _generate() async {
    final text = _ctrl.text.trim();
    if (text.isEmpty) return;
    HapticFeedback.mediumImpact();
    setState(() { _isLoading = true; _planResult = null; });
    
    final result = await AiApiService.planLeave(widget.remainingDays, text);
    
    setState(() { _isLoading = false; _planResult = result; });
    Future.delayed(const Duration(milliseconds: 100), () {
      _scrollCtrl.animateTo(_scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 500), curve: Curves.easeOut);
    });
  }

  Future<void> _startListening() async {
    // final available = await _speech.initialize();  // Temporarily disabled
    final available = false;  // Temporarily disabled
    if (available) {
      setState(() => _isListening = true);
      // _speech.listen(
      //   onResult: (val) {
      //     setState(() { _ctrl.text = val.recognizedWords; });
      //     if (val.finalResult) {
      //       setState(() => _isListening = false);
      //     }
      //   },
      //   localeId: 'fr_FR',
      // );
    }
  }

  void _stopListening() {
    // _speech.stop();  // Temporarily disabled
    setState(() => _isListening = false);
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<AppProvider>();
    final dk = prov.themeMode == ThemeMode.dark;
    final bg = dk ? const Color(0xFF0A101A) : const Color(0xFFF0F4FF);
    final cardBg = dk ? const Color(0xFF1E293B) : Colors.white;
    final textCol = dk ? Colors.white : const Color(0xFF1E293B);

    return Scaffold(
      backgroundColor: bg,
      body: Stack(
        children: [
          // Background orbs
          if (dk) ...[
            Positioned(top: -60, right: -40,
              child: Container(width: 200, height: 200,
                decoration: BoxDecoration(shape: BoxShape.circle,
                  gradient: RadialGradient(colors: [AppTheme.violet.withValues(alpha: 0.12), Colors.transparent])),
              )),
          ],
          SafeArea(
            child: Column(
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                  child: Row(
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Container(
                          width: 44, height: 44,
                          decoration: BoxDecoration(color: cardBg, shape: BoxShape.circle,
                            border: Border.all(color: dk ? const Color(0xFF334155) : const Color(0xFFE2E8F0))),
                          child: Icon(Icons.arrow_back_ios_new_rounded, color: textCol, size: 18),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('✨ AI Leave Planner', style: TextStyle(color: textCol, fontSize: 18, fontWeight: FontWeight.w800)),
                            Text('${widget.remainingDays} jours disponibles', style: TextStyle(color: AppTheme.emerald, fontSize: 12, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                      // Remaining days badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppTheme.emerald.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.3)),
                        ),
                        child: Text('${widget.remainingDays}j', style: const TextStyle(color: AppTheme.emerald, fontSize: 16, fontWeight: FontWeight.w900)),
                      ),
                    ],
                  ).animate().fadeIn().slideY(begin: -0.1),
                ),
                const SizedBox(height: 20),
                // Results area
                Expanded(
                  child: SingleChildScrollView(
                    controller: _scrollCtrl,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    physics: const BouncingScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (_planResult == null && !_isLoading) ...[
                          // Welcome card
                          Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: dk
                                    ? [const Color(0xFF1E293B), const Color(0xFF0F172A)]
                                    : [const Color(0xFFF0F4FF), const Color(0xFFE8F0FE)],
                                begin: Alignment.topLeft, end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(color: AppTheme.violet.withValues(alpha: 0.25)),
                            ),
                            child: Column(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: AppTheme.violet.withValues(alpha: 0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.beach_access_rounded, color: AppTheme.violet, size: 40),
                                ).animate(onPlay: (c) => c.repeat(reverse: true))
                                 .scale(begin: const Offset(0.95, 0.95), end: const Offset(1.05, 1.05), duration: 2000.ms),
                                const SizedBox(height: 16),
                                Text('Votre Assistant Congés IA', style: TextStyle(color: textCol, fontSize: 18, fontWeight: FontWeight.w800)),
                                const SizedBox(height: 8),
                                Text(
                                  'Décrivez votre souhait de congé et je vais vous proposer les meilleures dates et rédiger votre lettre de demande.',
                                  style: TextStyle(color: dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B), fontSize: 13, height: 1.5),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ).animate().fadeIn(delay: 100.ms).scale(),
                          const SizedBox(height: 20),
                          // Suggestions
                          Text('💡 Suggestions rapides', style: TextStyle(color: textCol, fontSize: 14, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8, runSpacing: 8,
                            children: _suggestions.asMap().entries.map((e) {
                              return GestureDetector(
                                onTap: () {
                                  _ctrl.text = e.value;
                                  HapticFeedback.selectionClick();
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: cardBg,
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: AppTheme.violet.withValues(alpha: 0.25)),
                                  ),
                                  child: Text(e.value, style: TextStyle(color: textCol, fontSize: 12, fontWeight: FontWeight.w600)),
                                ),
                              ).animate().fadeIn(delay: (150 + e.key * 50).ms).slideX(begin: 0.1);
                            }).toList(),
                          ),
                        ],
                        if (_isLoading)
                          _buildLoadingCard(dk, textCol),
                        if (_planResult != null)
                          _buildResultCards(_planResult!, dk, textCol, cardBg),
                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                ),
                // Input Bar
                _buildInputBar(dk, textCol, cardBg),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingCard(bool dk, Color textCol) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: dk ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.violet.withValues(alpha: 0.25)),
      ),
      child: Column(
        children: [
          AnimatedBuilder(
            animation: _pulseCtrl,
            builder: (_, __) => Transform.scale(
              scale: 1.0 + 0.1 * math.sin(_pulseCtrl.value * math.pi),
              child: Container(
                width: 60, height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(colors: [AppTheme.violet.withValues(alpha: 0.3), Colors.transparent]),
                ),
                child: const Icon(Icons.psychology_rounded, color: AppTheme.violet, size: 30),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text('L\'IA planifie vos congés...', style: TextStyle(color: textCol, fontSize: 15, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Text('Analyse du calendrier et rédaction de votre lettre', style: TextStyle(color: dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B), fontSize: 12)),
          const SizedBox(height: 16),
          LinearProgressIndicator(
            backgroundColor: AppTheme.violet.withValues(alpha: 0.1),
            valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.violet),
          ).animate(onPlay: (c) => c.repeat()).shimmer(duration: 1000.ms),
        ],
      ),
    ).animate().fadeIn().scale();
  }

  Widget _buildResultCards(String result, bool dk, Color textCol, Color cardBg) {
    final parts = result.split('---');
    final conseil = parts.isNotEmpty ? parts[0].replaceFirst('CONSEIL:', '').trim() : result;
    final resume = parts.length > 1 ? parts[1].replaceFirst('RÉSUMÉ:', '').trim() : '';
    final lettre = parts.length > 2 ? parts[2].replaceFirst('LETTRE:', '').trim() : '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Résumé badge
        if (resume.isNotEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.emerald.withValues(alpha: dk ? 0.1 : 0.08),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: AppTheme.emerald, size: 20),
                const SizedBox(width: 12),
                Expanded(child: Text(resume, style: const TextStyle(color: AppTheme.emerald, fontSize: 13, fontWeight: FontWeight.w700))),
              ],
            ),
          ).animate().fadeIn().slideY(begin: 0.1),
        const SizedBox(height: 16),
        // Conseil card
        _resultSection('🗓️ Dates Recommandées', conseil, AppTheme.violet, dk, textCol, cardBg, 0),
        const SizedBox(height: 12),
        // Lettre card
        if (lettre.isNotEmpty)
          _resultSection('📄 Lettre Prête à Envoyer', lettre, AppTheme.electricBlue, dk, textCol, cardBg, 1),
      ],
    );
  }

  Widget _resultSection(String title, String content, Color accentColor, bool dk, Color textCol, Color cardBg, int delay) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: accentColor.withValues(alpha: 0.2)),
        boxShadow: [BoxShadow(color: accentColor.withValues(alpha: 0.05), blurRadius: 12)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(title, style: TextStyle(color: accentColor, fontSize: 14, fontWeight: FontWeight.w800)),
              const Spacer(),
              GestureDetector(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: content));
                  HapticFeedback.lightImpact();
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Copié !'), duration: const Duration(seconds: 1)));
                },
                child: Icon(Icons.copy_rounded, color: accentColor, size: 18),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(content, style: TextStyle(color: textCol, fontSize: 13, height: 1.6)),
        ],
      ),
    ).animate().fadeIn(delay: (delay * 150).ms).slideY(begin: 0.1);
  }

  Widget _buildInputBar(bool dk, Color textCol, Color cardBg) {
    final borderCol = dk ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    return Container(
      padding: EdgeInsets.fromLTRB(16, 12, 16, MediaQuery.of(context).padding.bottom + 12),
      decoration: BoxDecoration(
        color: dk ? const Color(0xFF0F172A) : Colors.white,
        border: Border(top: BorderSide(color: borderCol)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: dk ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: _isListening ? AppTheme.violet : borderCol),
              ),
              child: TextField(
                controller: _ctrl,
                style: TextStyle(color: textCol, fontSize: 14),
                maxLines: 2,
                minLines: 1,
                decoration: InputDecoration(
                  hintText: 'Décrivez votre souhait de congé...',
                  hintStyle: TextStyle(color: dk ? const Color(0xFF64748B) : const Color(0xFF94A3B8), fontSize: 13),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Mic button
          GestureDetector(
            onTap: _isListening ? _stopListening : _startListening,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              width: 48, height: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _isListening ? AppTheme.violet : AppTheme.violet.withValues(alpha: 0.1),
              ),
              child: Icon(
                _isListening ? Icons.stop_rounded : Icons.mic_rounded,
                color: _isListening ? Colors.white : AppTheme.violet,
                size: 22,
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Send button
          GestureDetector(
            onTap: _isLoading ? null : _generate,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              width: 48, height: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: _isLoading ? null : const LinearGradient(colors: [AppTheme.violet, AppTheme.electricBlue]),
                color: _isLoading ? (dk ? const Color(0xFF334155) : const Color(0xFFE2E8F0)) : null,
              ),
              child: Icon(
                _isLoading ? Icons.hourglass_top_rounded : Icons.auto_awesome_rounded,
                color: _isLoading ? (dk ? const Color(0xFF64748B) : const Color(0xFF94A3B8)) : Colors.white,
                size: 22,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
