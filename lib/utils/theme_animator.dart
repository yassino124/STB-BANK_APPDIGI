import 'dart:math' as math;
import 'package:flutter/material.dart';

class ThemeAnimator {
  static void animateThemeSwitch({
    required BuildContext context,
    required Offset center,
    required bool isCurrentlyDark,
    required VoidCallback onComplete,
  }) {
    final overlayState = Overlay.of(context);
    final size = MediaQuery.of(context).size;
    
    // The max radius needed to cover the entire screen from the tap point
    final maxRadius = math.sqrt(
      math.pow(math.max(center.dx, size.width - center.dx), 2) +
      math.pow(math.max(center.dy, size.height - center.dy), 2),
    );

    // New theme background color
    final newColor = isCurrentlyDark ? const Color(0xFFF8FAFC) : const Color(0xFF0A101A);

    OverlayEntry? overlayEntry;
    
    overlayEntry = OverlayEntry(
      builder: (context) {
        return _GoutteEauAnimation(
          center: center,
          maxRadius: maxRadius,
          color: newColor,
          onMidpoint: onComplete, // Trigger actual theme switch when screen is covered
          onDone: () {
            overlayEntry?.remove();
          },
        );
      },
    );

    overlayState.insert(overlayEntry);
  }
}

class _GoutteEauAnimation extends StatefulWidget {
  final Offset center;
  final double maxRadius;
  final Color color;
  final VoidCallback onMidpoint;
  final VoidCallback onDone;

  const _GoutteEauAnimation({
    required this.center,
    required this.maxRadius,
    required this.color,
    required this.onMidpoint,
    required this.onDone,
  });

  @override
  State<_GoutteEauAnimation> createState() => _GoutteEauAnimationState();
}

class _GoutteEauAnimationState extends State<_GoutteEauAnimation> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _radiusAnimation;
  late Animation<double> _opacityAnimation;
  bool _midpointTriggered = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 650),
    );

    _radiusAnimation = Tween<double>(begin: 0.0, end: widget.maxRadius).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.6, curve: Curves.easeInQuad)),
    );

    _opacityAnimation = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.6, 1.0, curve: Curves.easeOut)),
    );

    _controller.addListener(() {
      if (_controller.value >= 0.6 && !_midpointTriggered) {
        _midpointTriggered = true;
        widget.onMidpoint();
      }
    });

    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        widget.onDone();
      }
    });

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Positioned.fill(
          child: IgnorePointer(
            child: Opacity(
              opacity: _opacityAnimation.value,
              child: CustomPaint(
                painter: _CirclePainter(
                  center: widget.center,
                  radius: _radiusAnimation.value,
                  color: widget.color,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _CirclePainter extends CustomPainter {
  final Offset center;
  final double radius;
  final Color color;

  _CirclePainter({required this.center, required this.radius, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, radius, paint);
  }

  @override
  bool shouldRepaint(covariant _CirclePainter oldDelegate) {
    return radius != oldDelegate.radius || color != oldDelegate.color;
  }
}
