import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/ollama_api_service.dart';

class AIPredictiveBanner extends StatefulWidget {
  final double currentBalance;
  final bool isDark;

  const AIPredictiveBanner({
    super.key,
    required this.currentBalance,
    required this.isDark,
  });

  @override
  State<AIPredictiveBanner> createState() => _AIPredictiveBannerState();
}

class _AIPredictiveBannerState extends State<AIPredictiveBanner> {
  String? _insight;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchInsight();
  }

  Future<void> _fetchInsight() async {
    final insight = await OllamaApiService.getPredictiveInsight(widget.currentBalance);
    if (mounted) {
      setState(() {
        _insight = insight;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 0, vertical: 0),
      decoration: BoxDecoration(
        color: widget.isDark 
            ? const Color(0xFF0F172A).withValues(alpha: 0.95)
            : Colors.white.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: widget.isDark 
              ? Colors.white.withValues(alpha: 0.08)
              : Colors.black.withValues(alpha: 0.06),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // AI Icon Avatar
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.electricBlue.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.auto_awesome_rounded, color: AppTheme.electricBlue, size: 22),
              ),
              
              const SizedBox(width: 16),
              
              // AI Text Area
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'STB Copilot Insight',
                      style: TextStyle(
                        color: widget.isDark ? Colors.white70 : const Color(0xFF64748B),
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    if (_isLoading)
                      Row(
                        children: [
                          const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.electricBlue),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Analyse prédictive en cours...',
                            style: TextStyle(
                              color: widget.isDark ? Colors.white : const Color(0xFF1E293B),
                              fontSize: 13,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ],
                      )
                    else
                      Text(
                        _insight ?? '',
                        style: TextStyle(
                          color: widget.isDark ? Colors.white : const Color(0xFF1E293B),
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          height: 1.4,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
