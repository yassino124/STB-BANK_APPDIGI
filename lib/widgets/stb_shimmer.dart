import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';

class StbShimmer extends StatefulWidget {
  final double width;
  final double height;
  final double borderRadius;

  const StbShimmer({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = 12.0,
  });

  @override
  State<StbShimmer> createState() => _StbShimmerState();
}

class _StbShimmerState extends State<StbShimmer> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500))..repeat();
    _anim = Tween<double>(begin: -2, end: 2).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOutSine));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dk = Provider.of<AppProvider>(context).themeMode == ThemeMode.dark;
    final baseColor = dk ? Colors.white.withValues(alpha: 0.05) : Colors.black.withValues(alpha: 0.05);
    final highlightColor = dk ? Colors.white.withValues(alpha: 0.15) : Colors.black.withValues(alpha: 0.15);

    return AnimatedBuilder(
      animation: _anim,
      builder: (context, child) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.borderRadius),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [baseColor, highlightColor, baseColor],
              stops: [0.0, _anim.value, 1.0],
            ),
          ),
        );
      },
    );
  }
}
