import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../theme/app_theme.dart';
import '../screens/transfer/transfer_screen.dart';
import 'dart:ui';

class BalanceCard extends StatefulWidget {
  const BalanceCard({super.key});
  @override
  State<BalanceCard> createState() => _BalanceCardState();
}

class _BalanceCardState extends State<BalanceCard> {
  bool _hidden = false;

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.3), blurRadius: 40, offset: const Offset(0, 20)),
          BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.royalBlue, AppTheme.electricBlue],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              border: Border.all(color: Colors.white.withValues(alpha: 0.2), width: 1.5),
            ),
            child: Stack(
              children: [
                // Abstract Premium Waves / Reflections
                Positioned(
                  right: -80,
                  top: -80,
                  child: Container(
                    width: 250,
                    height: 250,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [AppTheme.turquoise.withValues(alpha: 0.3), Colors.transparent],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  left: -50,
                  bottom: -50,
                  child: Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [Colors.white.withValues(alpha: 0.1), Colors.transparent],
                      ),
                    ),
                  ),
                ),
                
                // Content
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          p.translate('total_balance').toUpperCase(),
                          style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 13, fontWeight: FontWeight.w600, letterSpacing: 1.5),
                        ).animate().fadeIn(duration: 600.ms),
                        GestureDetector(
                          onTap: () {
                            HapticFeedback.lightImpact();
                            setState(() => _hidden = !_hidden);
                          },
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                            ),
                            child: Icon(_hidden ? Icons.visibility_off_rounded : Icons.visibility_rounded, color: Colors.white, size: 20),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Balance Display with count-up animation
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 400),
                      switchInCurve: Curves.easeOutBack,
                      switchOutCurve: Curves.easeIn,
                      child: _hidden
                          ? const Text("••••••••", key: ValueKey('hidden'), style: TextStyle(color: Colors.white, fontSize: 44, fontWeight: FontWeight.w900, letterSpacing: 4))
                          : Row(
                              key: const ValueKey('visible'),
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                TweenAnimationBuilder(
                                  tween: Tween<double>(begin: 0, end: 12450),
                                  duration: const Duration(milliseconds: 1500),
                                  curve: Curves.easeOutCubic,
                                  builder: (context, value, child) {
                                    return Text(
                                      value.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},'),
                                      style: const TextStyle(color: Colors.white, fontSize: 46, fontWeight: FontWeight.w800, letterSpacing: -1.5, height: 1),
                                    );
                                  },
                                ),
                                const Padding(
                                  padding: EdgeInsets.only(bottom: 6, left: 4),
                                  child: Text(".75", style: TextStyle(color: Colors.white70, fontSize: 24, fontWeight: FontWeight.w600)),
                                ),
                                const Padding(
                                  padding: EdgeInsets.only(bottom: 8, left: 8),
                                  child: Text("TND", style: TextStyle(color: AppTheme.turquoise, fontSize: 18, fontWeight: FontWeight.w700)),
                                ),
                              ],
                            ),
                    ),
                    const SizedBox(height: 12),
                    
                    // Analytics Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppTheme.emerald.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.5)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.trending_up_rounded, color: AppTheme.emerald, size: 16),
                          const SizedBox(width: 6),
                          const Text("+2.4% this month", style: TextStyle(color: AppTheme.emerald, fontSize: 12, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ).animate().fadeIn(delay: 500.ms).slideX(begin: -0.2),
                    
                    const SizedBox(height: 32),

                     // Actions
                    Row(
                      children: [
                        _actionBtn("Add Money", Icons.add_rounded, true, () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text("Add Money feature coming soon to STB partner accounts!"),
                              duration: Duration(milliseconds: 1500),
                            ),
                          );
                        }),
                        const SizedBox(width: 16),
                        _actionBtn("Transfer", Icons.arrow_outward_rounded, false, () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const TransferScreen()));
                        }),
                      ],
                    ).animate().fadeIn(delay: 700.ms).slideY(begin: 0.2),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _actionBtn(String label, IconData icon, bool primary, VoidCallback onTap) {
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            HapticFeedback.mediumImpact();
            onTap();
          },
          borderRadius: BorderRadius.circular(18),
          child: Container(
            height: 56,
            decoration: BoxDecoration(
              color: primary ? Colors.white : Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: primary ? Colors.white : Colors.white.withValues(alpha: 0.2)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: primary ? AppTheme.royalBlue : Colors.white, size: 22),
                const SizedBox(width: 8),
                Text(
                  label,
                  style: TextStyle(color: primary ? AppTheme.royalBlue : Colors.white, fontWeight: FontWeight.w700, fontSize: 15),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
