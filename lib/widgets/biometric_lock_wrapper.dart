import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../services/auth_api_service.dart';

class BiometricLockWrapper extends StatefulWidget {
  final Widget child;

  const BiometricLockWrapper({super.key, required this.child});

  @override
  State<BiometricLockWrapper> createState() => _BiometricLockWrapperState();
}

class _BiometricLockWrapperState extends State<BiometricLockWrapper> with WidgetsBindingObserver {
  bool _isLocked = false;
  final LocalAuthentication _localAuth = LocalAuthentication();
  bool _hasBiometrics = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _checkBiometrics();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  Future<void> _checkBiometrics() async {
    try {
      final isBiometricsEnabled = await AuthApiService.getBiometricEnabled();
      if (isBiometricsEnabled) {
        final canCheck = await _localAuth.canCheckBiometrics;
        final isDeviceSupported = await _localAuth.isDeviceSupported();
        setState(() {
          _hasBiometrics = canCheck || isDeviceSupported;
        });
      }
    } catch (e) {
      debugPrint('Biometrics check error: $e');
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      // App went to background
      _checkAndLock();
    } else if (state == AppLifecycleState.resumed) {
      // App came to foreground
      if (_isLocked) {
        _authenticate();
      }
    }
  }

  Future<void> _checkAndLock() async {
    final isLoggedIn = await AuthApiService.isLoggedIn();
    if (!isLoggedIn) return;

    final isBiometricsEnabled = await AuthApiService.getBiometricEnabled();
    if (isBiometricsEnabled && _hasBiometrics) {
      setState(() {
        _isLocked = true;
      });
    }
  }

  Future<void> _authenticate() async {
    try {
      final authenticated = await _localAuth.authenticate(
        localizedReason: 'Déverrouillez STB Mobile pour continuer',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: false,
        ),
      );

      if (authenticated && mounted) {
        setState(() {
          _isLocked = false;
        });
      }
    } catch (e) {
      debugPrint('Authentication error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        if (_isLocked) _buildLockScreen(),
      ],
    );
  }

  Widget _buildLockScreen() {
    return Positioned.fill(
      child: ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
          child: Container(
            color: Colors.black.withValues(alpha: 0.8),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [Color(0xFF4F46E5), Color(0xFF0EA5E9)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF4F46E5).withValues(alpha: 0.5),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.lock_rounded, color: Colors.white, size: 36),
                  ).animate().scale(duration: 400.ms, curve: Curves.easeOutBack).fadeIn(),
                  const SizedBox(height: 24),
                  const Text(
                    'Application Verrouillée',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      decoration: TextDecoration.none,
                    ),
                  ).animate().slideY(begin: 0.2).fadeIn(delay: 100.ms),
                  const SizedBox(height: 12),
                  Text(
                    'Utilisez FaceID / TouchID pour accéder',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.6),
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      decoration: TextDecoration.none,
                    ),
                  ).animate().slideY(begin: 0.2).fadeIn(delay: 200.ms),
                  const SizedBox(height: 48),
                  GestureDetector(
                    onTap: _authenticate,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                      ),
                      child: const Text(
                        'Déverrouiller',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          decoration: TextDecoration.none,
                        ),
                      ),
                    ),
                  ).animate().scale(delay: 300.ms),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
