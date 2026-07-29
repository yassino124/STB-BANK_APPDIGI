import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../viewmodels/notifications_viewmodel.dart';

/// Auto-updating notification badge that shows unread count
class NotificationBadge extends StatelessWidget {
  final Widget child;
  final Color badgeColor;
  final Color textColor;
  
  const NotificationBadge({
    super.key,
    required this.child,
    this.badgeColor = Colors.red,
    this.textColor = Colors.white,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<NotificationsViewModel>(
      builder: (context, vm, _) {
        final unreadCount = vm.unreadCount;
        
        return Stack(
          clipBehavior: Clip.none,
          children: [
            child,
            if (unreadCount > 0)
              Positioned(
                right: -4,
                top: -4,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  constraints: const BoxConstraints(
                    minWidth: 18,
                    minHeight: 18,
                  ),
                  decoration: BoxDecoration(
                    color: badgeColor,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Theme.of(context).scaffoldBackgroundColor,
                      width: 2,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      unreadCount > 99 ? '99+' : '$unreadCount',
                      style: TextStyle(
                        color: textColor,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        height: 1,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}
