import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../viewmodels/notifications_viewmodel.dart';
import '../../models/banking_models.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationsViewModel>().load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<NotificationsViewModel>();
    final dk = Theme.of(context).brightness == Brightness.dark;
    final fg = dk ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight;
    final mt = dk ? AppTheme.textMutedDark : AppTheme.textMutedLight;
    final cd = Theme.of(context).cardColor;
    final bd = dk ? AppTheme.borderDark : AppTheme.borderLight;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ────────────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 16),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () { HapticFeedback.lightImpact(); Navigator.pop(context); },
                    child: Container(
                      width: 48, height: 48,
                      decoration: BoxDecoration(
                        color: dk ? Colors.white.withValues(alpha: 0.05) : Colors.white,
                        shape: BoxShape.circle, 
                        border: Border.all(color: dk ? Colors.white.withValues(alpha: 0.1) : AppTheme.borderLight),
                        boxShadow: AppTheme.cardShadow(dk),
                      ),
                      child: Icon(Icons.arrow_back_ios_new_rounded, color: fg, size: 20),
                    ),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Notifications", style: AppTheme.headline(fg).copyWith(fontSize: 28, letterSpacing: -0.5)),
                        if (vm.unreadCount > 0)
                          Text("${vm.unreadCount} non lues", style: AppTheme.caption(AppTheme.electricBlue).copyWith(fontWeight: FontWeight.w700, letterSpacing: 0.2)),
                      ],
                    ),
                  ),
                  if (vm.items.isNotEmpty)
                    GestureDetector(
                      onTap: () {
                        HapticFeedback.heavyImpact();
                        vm.clearAll();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Text("Toutes les notifications supprimées"), 
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            backgroundColor: dk ? const Color(0xFF2C2C2E) : Colors.black87,
                          ),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: AppTheme.coralRed.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.coralRed.withValues(alpha: 0.2)),
                        ),
                        child: Text("Effacer", style: AppTheme.caption(AppTheme.coralRed).copyWith(fontWeight: FontWeight.w800)),
                      ),
                    ),
                ],
              ).animate().fadeIn(duration: 400.ms, curve: Curves.easeOut).slideY(begin: -0.2, curve: Curves.easeOut),
            ),

            // ── List ──────────────────────────────────────────────────────────
            Expanded(
              child: vm.isLoading
                  ? const Center(child: CircularProgressIndicator(color: AppTheme.electricBlue))
                  : vm.items.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(32),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: dk ? Colors.white.withValues(alpha: 0.03) : AppTheme.electricBlue.withValues(alpha: 0.05),
                                ),
                                child: Icon(Icons.notifications_off_rounded, color: mt.withValues(alpha: 0.5), size: 72),
                              ).animate().scale(delay: 200.ms, duration: 400.ms, curve: Curves.easeOutBack),
                              const SizedBox(height: 24),
                              Text("Aucune notification", style: AppTheme.title(fg).copyWith(fontSize: 22, fontWeight: FontWeight.w800)),
                              const SizedBox(height: 8),
                              Text("Vous êtes à jour !", style: AppTheme.body(mt).copyWith(fontSize: 16)),
                            ],
                          ).animate().fadeIn(duration: 500.ms),
                        )
                      : ListView.builder(
                          physics: const BouncingScrollPhysics(),
                          padding: const EdgeInsets.fromLTRB(20, 8, 20, 40),
                          itemCount: vm.items.length,
                          itemBuilder: (ctx, index) {
                            final item = vm.items[index];
                            final isUnread = !item.isRead;
                            
                            Color iconColor;
                            IconData iconData;
                            switch (item.category) {
                              case NotificationCategory.security: 
                                iconColor = AppTheme.coralRed; 
                                iconData = Icons.gpp_maybe_rounded; 
                                break;
                              case NotificationCategory.transaction: 
                                iconColor = AppTheme.emerald; 
                                iconData = Icons.swap_horiz_rounded; 
                                break;
                              case NotificationCategory.promotion: 
                                iconColor = AppTheme.turquoise; 
                                iconData = Icons.auto_awesome_rounded; 
                                break;
                              default: 
                                iconColor = AppTheme.electricBlue; 
                                iconData = Icons.info_outline_rounded;
                            }

                            return Dismissible(
                              key: Key(item.id),
                              direction: DismissDirection.endToStart,
                              onDismissed: (_) {
                                HapticFeedback.lightImpact();
                                vm.dismiss(item.id);
                              },
                              background: Container(
                                alignment: Alignment.centerRight,
                                padding: const EdgeInsets.only(right: 28),
                                margin: const EdgeInsets.only(bottom: 16),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [AppTheme.coralRed.withValues(alpha: 0.8), AppTheme.coralRed],
                                    begin: Alignment.centerLeft,
                                    end: Alignment.centerRight,
                                  ),
                                  borderRadius: BorderRadius.circular(24),
                                ),
                                child: const Icon(Icons.delete_sweep_rounded, color: Colors.white, size: 32),
                              ),
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 16),
                                padding: const EdgeInsets.all(20),
                                decoration: BoxDecoration(
                                  color: isUnread
                                      ? (dk ? AppTheme.electricBlue.withValues(alpha: 0.12) : AppTheme.electricBlue.withValues(alpha: 0.06))
                                      : (dk ? Colors.white.withValues(alpha: 0.03) : Colors.white),
                                  borderRadius: BorderRadius.circular(24),
                                  border: Border.all(
                                    color: isUnread 
                                        ? AppTheme.electricBlue.withValues(alpha: 0.3) 
                                        : (dk ? Colors.white.withValues(alpha: 0.05) : bd.withValues(alpha: 0.5)),
                                    width: isUnread ? 1.5 : 1,
                                  ),
                                  boxShadow: [
                                    if (!dk && !isUnread)
                                      BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4)),
                                    if (isUnread)
                                      BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.15), blurRadius: 24, offset: const Offset(0, 8)),
                                  ],
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: isUnread ? iconColor.withValues(alpha: 0.15) : iconColor.withValues(alpha: 0.1), 
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(iconData, color: iconColor, size: 24),
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Expanded(
                                                child: Text(
                                                  item.title,
                                                  style: AppTheme.body(fg).copyWith(
                                                    fontWeight: isUnread ? FontWeight.w800 : FontWeight.w700, 
                                                    fontSize: 15,
                                                    letterSpacing: -0.2,
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              Text(
                                                '${DateTime.now().difference(item.timestamp).inMinutes}m', 
                                                style: AppTheme.label(mt).copyWith(
                                                  fontSize: 11, 
                                                  fontWeight: FontWeight.w600,
                                                  color: isUnread ? AppTheme.electricBlue : mt,
                                                )
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 6),
                                          Text(
                                            item.body,
                                            style: AppTheme.caption(mt).copyWith(
                                              fontWeight: isUnread ? FontWeight.w600 : FontWeight.w500, 
                                              height: 1.5,
                                              fontSize: 13,
                                              color: isUnread ? fg.withValues(alpha: 0.8) : mt,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    if (isUnread) ...[
                                      const SizedBox(width: 12),
                                      Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          const SizedBox(height: 6),
                                          Container(
                                            width: 10, height: 10,
                                            decoration: BoxDecoration(
                                              color: AppTheme.electricBlue, 
                                              shape: BoxShape.circle,
                                              boxShadow: [
                                                BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.6), blurRadius: 8, spreadRadius: 2),
                                              ],
                                            ),
                                          ).animate(onPlay: (controller) => controller.repeat(reverse: true))
                                           .scale(begin: const Offset(1, 1), end: const Offset(1.2, 1.2), duration: 1.seconds),
                                        ],
                                      ),
                                    ],
                                  ],
                                ),
                              ).animate().fadeIn(delay: (index * 50).ms, duration: 400.ms).slideX(begin: 0.1, curve: Curves.easeOut),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
