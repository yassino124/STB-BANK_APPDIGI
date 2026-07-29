import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../auth/login_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<Map<String, String>> _pages = [
    {
      "title": "Bienvenue sur\nSTB RH Digi",
      "subtitle": "Votre portail collaborateur 100% digital.\nToutes vos démarches RH à portée de main, de manière sécurisée et rapide.",
      "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "tag": "INNOVATION RH"
    },
    {
      "title": "Gérez Vos\nDemandes & Crédits",
      "subtitle": "Simulez vos crédits, demandez vos congés et suivez l'état de vos requêtes en temps réel avec une interface pensée pour vous.",
      "image": "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80",
      "tag": "SERVICES STB"
    },
    {
      "title": "Connecté Avec\nVos Collègues",
      "subtitle": "Annuaire intelligent, offres amicales exclusives et IA intégrée (STB Copilot) pour vous assister au quotidien.",
      "image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
      "tag": "STB COPILOT"
    },
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeOutExpo,
      );
    } else {
      _finish();
    }
  }

  void _finish() {
    HapticFeedback.heavyImpact();
    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const LoginScreen(),
        transitionsBuilder: (_, a, __, c) => FadeTransition(opacity: a, child: c),
        transitionDuration: const Duration(milliseconds: 800),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Background Images PageView
          PageView.builder(
            controller: _pageController,
            onPageChanged: (int page) {
              HapticFeedback.lightImpact();
              setState(() => _currentPage = page);
            },
            itemCount: _pages.length,
            itemBuilder: (context, index) {
              return Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    _pages[index]["image"]!,
                    fit: BoxFit.cover,
                  ),
                  // Gradient overlay to make text readable
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.15),
                          Colors.black.withValues(alpha: 0.5),
                          Colors.black.withValues(alpha: 0.95),
                        ],
                        stops: const [0.0, 0.4, 1.0],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
          
          // Content Overlay
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28.0, vertical: 20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Logo STB and Skip Button
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: BackdropFilter(
                            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                            child: Image.asset(
                              'public/Logo_STB.png',
                              width: 36,
                              height: 36,
                              errorBuilder: (ctx, err, st) => const Icon(Icons.account_balance, color: Colors.white, size: 24),
                            ),
                          ),
                        ),
                      ).animate().fadeIn(duration: 800.ms).slideY(begin: -0.2),
                      
                      // Skip button
                      if (_currentPage < _pages.length - 1)
                        GestureDetector(
                          onTap: _finish,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text(
                              "Passer",
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13),
                            ),
                          ),
                        ).animate().fadeIn(),
                    ],
                  ),
                  
                  const Spacer(),
                  
                  // Text Content
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 400),
                    child: Column(
                      key: ValueKey<int>(_currentPage),
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Glassmorphic tag
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppTheme.electricBlue.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.electricBlue.withValues(alpha: 0.5)),
                          ),
                          child: Text(
                            _pages[_currentPage]["tag"]!,
                            style: const TextStyle(color: AppTheme.turquoise, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1.5),
                          ),
                        ).animate().fadeIn(delay: 200.ms).slideX(begin: -0.1),
                        
                        const SizedBox(height: 24),
                        
                        Text(
                          _pages[_currentPage]["title"]!,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 38,
                            fontWeight: FontWeight.w900,
                            height: 1.15,
                            letterSpacing: -1,
                          ),
                        ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.1),
                        
                        const SizedBox(height: 16),
                        
                        Text(
                          _pages[_currentPage]["subtitle"]!,
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.75),
                            fontSize: 15,
                            fontWeight: FontWeight.w500,
                            height: 1.5,
                          ),
                        ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.1),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 48),
                  
                  // Bottom controls (Dots + Button)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Dots
                      Row(
                        children: List.generate(
                          _pages.length,
                          (index) => AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            margin: const EdgeInsets.only(right: 6),
                            height: 6,
                            width: _currentPage == index ? 24 : 8,
                            decoration: BoxDecoration(
                              color: _currentPage == index ? AppTheme.electricBlue : Colors.white.withValues(alpha: 0.3),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                      ).animate().fadeIn(delay: 500.ms),
                      
                      // Next / Start Button
                      GestureDetector(
                        onTap: _nextPage,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          padding: EdgeInsets.symmetric(
                            horizontal: _currentPage == _pages.length - 1 ? 24 : 18,
                            vertical: 16,
                          ),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [AppTheme.electricBlue, AppTheme.royalBlue],
                            ),
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.electricBlue.withValues(alpha: 0.4),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _currentPage == _pages.length - 1 ? "Commencer" : "Suivant",
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 15,
                                ),
                              ),
                              if (_currentPage < _pages.length - 1) ...[
                                const SizedBox(width: 8),
                                const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 20),
                              ]
                            ],
                          ),
                        ),
                      ).animate().fadeIn(delay: 600.ms).scale(begin: const Offset(0.8, 0.8)),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
