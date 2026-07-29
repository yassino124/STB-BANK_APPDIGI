import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';

enum StbButtonType { primary, secondary, outline }

class StbButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final StbButtonType type;
  final IconData? icon;
  final bool isLoading;

  const StbButton({
    super.key,
    required this.label,
    required this.onTap,
    this.type = StbButtonType.primary,
    this.icon,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isLoading ? null : () {
        if (type == StbButtonType.primary) {
          HapticFeedback.heavyImpact();
        } else {
          HapticFeedback.mediumImpact();
        }
        onTap();
      },
      child: Container(
        height: 54,
        decoration: _getDecoration(),
        child: Center(
          child: isLoading
              ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (icon != null) ...[
                      Icon(icon, color: _getTextColor(), size: 20),
                      const SizedBox(width: 10),
                    ],
                    Text(
                      label,
                      style: TextStyle(
                        color: _getTextColor(),
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  BoxDecoration _getDecoration() {
    switch (type) {
      case StbButtonType.primary:
        return BoxDecoration(
          gradient: const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF4C1D95)]),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: const Color(0xFF7C3AED).withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, 4))],
        );
      case StbButtonType.secondary:
        return BoxDecoration(
          color: AppTheme.electricBlue.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(16),
        );
      case StbButtonType.outline:
        return BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.electricBlue.withValues(alpha: 0.5)),
        );
    }
  }

  Color _getTextColor() {
    switch (type) {
      case StbButtonType.primary:
        return Colors.white;
      case StbButtonType.secondary:
      case StbButtonType.outline:
        return AppTheme.electricBlue;
    }
  }
}
