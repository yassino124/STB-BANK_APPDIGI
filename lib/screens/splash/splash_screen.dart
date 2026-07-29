import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:async';
import '../../theme/app_theme.dart';
import '../../services/auth_api_service.dart';
import '../onboarding/onboarding_screen.dart';
import '../main_screen.dart';
import 'dart:ui';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _progressController;
  bool _navigating = false;

  @override
  void initState() {
    super.initState();

    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
      ),
    );

    _progressController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2600),
    )..forward();

    Future.delayed(const Duration(milliseconds: 3000), () {
      if (mounted && !_navigating) {
        _navigating = true;
        _routeNext();
      }
    });
  }

  Future<void> _routeNext() async {
    if (!mounted) return;
    
    try {
      // 🔒 ALWAYS force login on app restart per user request
      await AuthApiService.clearAll();
      bool loggedIn = false;
      
      final target = loggedIn ? const MainScreen() : const OnboardingScreen();
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => target,
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 700),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => const OnboardingScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 700),
        ),
      );
    }
  }

  @override
  void dispose() {
    _progressController.stop();
    _progressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: const Color(0xFF020B1A),
      body: SizedBox(
        width: size.width,
        height: size.height,
        child: Stack(
          children: [
            // ── Ambient glow top-left ────────────────────────────────────────
            Positioned(
              top: -120,
              left: -120,
              child: Container(
                width: 380,
                height: 380,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFF0D2C7A),
                ),
              ).animate().scale(begin: const Offset(0.92, 0.92), end: const Offset(1.0, 1.0), duration: 1800.ms, curve: Curves.easeOut).blur(begin: const Offset(70, 70), end: const Offset(110, 110)),
            ),
            // ── Ambient glow bottom-right ────────────────────────────────────
            Positioned(
              bottom: -100,
              right: -100,
              child: Container(
                width: 320,
                height: 320,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFF074A42),
                ),
              ).animate().scale(begin: const Offset(0.94, 0.94), end: const Offset(1.0, 1.0), duration: 2000.ms, curve: Curves.easeOut).blur(begin: const Offset(60, 60), end: const Offset(95, 95)),
            ),
            // ── Center glow pulse ────────────────────────────────────────────
            Positioned(
              top: size.height * 0.35,
              left: size.width / 2 - 120,
              child: Container(
                width: 240,
                height: 240,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.electricBlue.withValues(alpha: 0.06),
                ),
              ).animate().scale(begin: const Offset(0.85, 0.85), end: const Offset(1.0, 1.0), duration: 2200.ms, curve: Curves.easeOut).blur(begin: const Offset(40, 40), end: const Offset(65, 65)),
            ),

            // ── Main Content ─────────────────────────────────────────────────
            Positioned.fill(
              child: SafeArea(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const Spacer(flex: 3),

                    // ── Glassmorphic Logo Container ──────────────────────────
                    Column(
                      children: [
                        Container(
                          width: 160,
                          height: 160,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(44),
                            gradient: LinearGradient(
                              colors: [
                                Colors.white.withValues(alpha: 0.14),
                                Colors.white.withValues(alpha: 0.04),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.22),
                              width: 1.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.electricBlue.withValues(alpha: 0.25),
                                blurRadius: 40,
                                spreadRadius: 4,
                                offset: const Offset(0, 12),
                              ),
                              BoxShadow(
                                color: AppTheme.turquoise.withValues(alpha: 0.1),
                                blurRadius: 60,
                                spreadRadius: 8,
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(44),
                            child: BackdropFilter(
                              filter:
                                  ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                              child: Center(
                                child: Image.asset(
                                  'public/Logo_STB.png',
                                  width: 110,
                                  height: 110,
                                  fit: BoxFit.contain,
                                  errorBuilder: (ctx, err, st) => const Icon(
                                    Icons.account_balance,
                                    color: Colors.white,
                                    size: 56,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        )
                            .animate()
                            .fadeIn(duration: 900.ms, curve: Curves.easeOut)
                            .scale(
                                begin: const Offset(0.82, 0.82),
                                end: const Offset(1.0, 1.0),
                                duration: 1100.ms,
                                curve: Curves.easeOutBack),

                        const SizedBox(height: 32),

                        // Bank name
                        const Text(
                          "STB RH DIGI",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 3.5,
                          ),
                        ).animate().fadeIn(delay: 350.ms).slideY(begin: 0.15),

                        const SizedBox(height: 10),

                        // Tagline
                        Text(
                          "COLLABORATEUR  •  INNOVATION  •  FUTUR",
                          style: TextStyle(
                            color: AppTheme.turquoise.withValues(alpha: 0.85),
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.8,
                          ),
                        ).animate().fadeIn(delay: 550.ms).slideY(begin: 0.15),
                      ],
                    ),

                    const Spacer(flex: 3),

                    // ── Progress Bar ─────────────────────────────────────────
                    Padding(
                      padding: const EdgeInsets.only(bottom: 52),
                      child: Column(
                        children: [
                          SizedBox(
                            width: 220,
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: AnimatedBuilder(
                                animation: _progressController,
                                builder: (context, child) {
                                  return LinearProgressIndicator(
                                    value: _progressController.value,
                                    minHeight: 3,
                                    backgroundColor:
                                        Colors.white.withValues(alpha: 0.07),
                                    valueColor:
                                        AlwaysStoppedAnimation<Color>(
                                      AppTheme.electricBlue,
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                          const SizedBox(height: 14),
                          Text(
                            "Connexion sécurisée en cours...",
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.35),
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.4,
                            ),
                          ),
                        ],
                      ).animate().fadeIn(delay: 750.ms),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
