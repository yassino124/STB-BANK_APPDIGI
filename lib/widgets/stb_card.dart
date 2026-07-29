import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../theme/app_theme.dart';

class StbCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? color;
  final double borderRadius;
  final Gradient? gradient;

  const StbCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.margin,
    this.color,
    this.borderRadius = 24.0,
    this.gradient,
  });

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.04);

    return Container(
      margin: margin,
      padding: padding,
      decoration: BoxDecoration(
        color: gradient == null ? (color ?? cd) : null,
        gradient: gradient,
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.all(color: gradient == null ? bd : Colors.transparent),
        boxShadow: gradient != null 
          ? [BoxShadow(color: (gradient!.colors.first as Color).withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))]
          : AppTheme.cardShadow(dk),
      ),
      child: child,
    );
  }
}
