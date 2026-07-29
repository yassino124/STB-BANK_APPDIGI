import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';

class StbBottomSheet extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  
  const StbBottomSheet({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.fromLTRB(24, 12, 24, 40),
  });

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);

    return Container(
      decoration: BoxDecoration(
        color: dk ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 40, offset: const Offset(0, -10))],
      ),
      padding: padding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Center(
            child: Container(
              width: 40, height: 5,
              decoration: BoxDecoration(color: mt.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2.5)),
            ),
          ),
          const SizedBox(height: 24),
          child,
        ],
      ),
    );
  }

  static void show(BuildContext context, Widget child, {bool isScrollControlled = true}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: isScrollControlled,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StbBottomSheet(child: child),
    );
  }
}
