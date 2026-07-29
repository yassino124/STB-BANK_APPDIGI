import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// ═══════════════════════════════════════════════════════════════════════════
//  APP ROUTER — Centralized premium navigation transitions
//  Usage:  AppRouter.push(context, MyScreen())
//          AppRouter.pushModal(context, MyForm())   ← slide from bottom
//          AppRouter.pushFade(context, DetailScreen())
// ═══════════════════════════════════════════════════════════════════════════

class AppRouter {
  AppRouter._();

  // ── Standard Push — Native slide (like iOS) ─────────────────────────
  static Future<T?> push<T>(BuildContext context, Widget screen, {bool haptic = true}) {
    if (haptic) HapticFeedback.lightImpact();
    return Navigator.of(context).push<T>(MaterialPageRoute(builder: (_) => screen));
  }

  // ── Modal Push — Slide from bottom (forms, demandes) ────────────────────
  static Future<T?> pushModal<T>(BuildContext context, Widget screen, {bool haptic = true}) {
    if (haptic) HapticFeedback.mediumImpact();
    return Navigator.of(context).push<T>(MaterialPageRoute(builder: (_) => screen, fullscreenDialog: true));
  }

  // ── Fade Push — (Fallback to standard push for performance) ────────────
  static Future<T?> pushFade<T>(BuildContext context, Widget screen, {bool haptic = false}) {
    if (haptic) HapticFeedback.lightImpact();
    return Navigator.of(context).push<T>(MaterialPageRoute(builder: (_) => screen));
  }

  // ── Scale + Fade Push — (Fallback to standard push for performance) ─────
  static Future<T?> pushScale<T>(BuildContext context, Widget screen) {
    HapticFeedback.selectionClick();
    return Navigator.of(context).push<T>(MaterialPageRoute(builder: (_) => screen));
  }

  // ── Replace — Full screen replacement ───────────────────────────────────
  static Future<T?> pushReplacement<T, TO>(BuildContext context, Widget screen) {
    return Navigator.of(context).pushReplacement<T, TO>(MaterialPageRoute(builder: (_) => screen));
  }

  // ── Push and clear stack (after login, after logout) ────────────────────
  static Future<T?> pushAndRemoveAll<T>(BuildContext context, Widget screen) {
    return Navigator.of(context).pushAndRemoveUntil<T>(
      MaterialPageRoute(builder: (_) => screen),
      (_) => false,
    );
  }
}
