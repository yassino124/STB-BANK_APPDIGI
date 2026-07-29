import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // ── BRAND PALETTE ─────────────────────────────────────────────────────────
  static const Color royalBlue    = Color(0xFF0D47A1);
  static const Color electricBlue = Color(0xFF2962FF);
  static const Color skyBlue      = Color(0xFF448AFF);
  static const Color turquoise    = Color(0xFF00BFA5);
  static const Color emerald      = Color(0xFF10B981);
  static const Color amber        = Color(0xFFF59E0B);
  static const Color coralRed     = Color(0xFFEF4444);
  static const Color violet       = Color(0xFF7C3AED);
  static const Color deepNavy     = Color(0xFF060D1A);

  // ── SEMANTIC LIGHT ────────────────────────────────────────────────────────
  static const Color bgPrimaryLight    = Color(0xFFF4F7FB);
  static const Color bgSecondaryLight  = Color(0xFFFFFFFF);
  static const Color bgLight           = bgPrimaryLight;
  static const Color borderLight       = Color(0xFFE8EDF5);
  static const Color textPrimaryLight  = Color(0xFF0F172A);
  static const Color textMutedLight    = Color(0xFF64748B);
  static const Color shadowLight       = Color(0x08000000);

  // ── SEMANTIC DARK ─────────────────────────────────────────────────────────
  static const Color bgPrimaryDark     = Color(0xFF060D1A);
  static const Color bgSecondaryDark   = Color(0xFF0E1827);
  static const Color bgDark            = bgPrimaryDark;
  static const Color borderDark        = Color(0xFF1C2D44);
  static const Color textPrimaryDark   = Color(0xFFF1F5F9);
  static const Color textMutedDark     = Color(0xFF64748B);
  static const Color shadowDark        = Color(0x40000000);

  // ── SEMANTIC ALIASES ──────────────────────────────────────────────────────
  static const Color danger = coralRed;

  // ── TEXT STYLE ALIASES ────────────────────────────────────────────────────
  static TextStyle get h1Dark => headline(textPrimaryDark);
  static TextStyle get h1Light => headline(textPrimaryLight);
  static TextStyle get bodyDark => body(textPrimaryDark);
  static TextStyle get bodyLight => body(textPrimaryLight);

  // ── SPACING SCALE ─────────────────────────────────────────────────────────
  static const double xs   = 4;
  static const double sm   = 8;
  static const double md   = 16;
  static const double lg   = 24;
  static const double xl   = 32;
  static const double xxl  = 48;

  // ── RADIUS SCALE ──────────────────────────────────────────────────────────
  static const double radiusSm   = 12;
  static const double radiusMd   = 18;
  static const double radiusLg   = 24;
  static const double radiusXl   = 32;
  static const double radiusCard = 28;

  // ── TEXT STYLES ───────────────────────────────────────────────────────────
  static TextStyle display(Color color) => TextStyle(
    fontSize: 36, fontWeight: FontWeight.w900,
    color: color, letterSpacing: -1.5, height: 1.1,
    fontFamily: GoogleFonts.poppins().fontFamily,
  );
  static TextStyle headline(Color color) => TextStyle(
    fontSize: 24, fontWeight: FontWeight.w800,
    color: color, letterSpacing: -0.5,
    fontFamily: GoogleFonts.poppins().fontFamily,
  );
  static TextStyle title(Color color) => TextStyle(
    fontSize: 18, fontWeight: FontWeight.w700,
    color: color, letterSpacing: -0.3,
    fontFamily: GoogleFonts.poppins().fontFamily,
  );
  static TextStyle body(Color color) => TextStyle(
    fontSize: 14, fontWeight: FontWeight.w500,
    color: color, letterSpacing: 0,
    fontFamily: GoogleFonts.poppins().fontFamily,
  );
  static TextStyle caption(Color color) => TextStyle(
    fontSize: 11, fontWeight: FontWeight.w600,
    color: color, letterSpacing: 0.2,
    fontFamily: GoogleFonts.poppins().fontFamily,
  );
  static TextStyle label(Color color) => TextStyle(
    fontSize: 10, fontWeight: FontWeight.w700,
    color: color, letterSpacing: 1.2,
    fontFamily: GoogleFonts.poppins().fontFamily,
  );

  // ── SHADOWS ───────────────────────────────────────────────────────────────
  static List<BoxShadow> cardShadow(bool dk) => [
    BoxShadow(
      color: dk ? shadowDark : shadowLight,
      blurRadius: 24, offset: const Offset(0, 8), spreadRadius: 0,
    ),
  ];
  static List<BoxShadow> primaryShadow = [
    BoxShadow(color: electricBlue.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6)),
  ];
  static List<BoxShadow> elevatedShadow(bool dk) => [
    BoxShadow(
      color: dk ? Colors.black.withValues(alpha: 0.4) : Colors.black.withValues(alpha: 0.06),
      blurRadius: 32, offset: const Offset(0, 12),
    ),
  ];

  // ── GRADIENTS ─────────────────────────────────────────────────────────────
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF1A56DB), Color(0xFF0D47A1)],
    begin: Alignment.topLeft, end: Alignment.bottomRight,
  );
  static const LinearGradient platinumGradient = LinearGradient(
    colors: [Color(0xFF2962FF), Color(0xFF0D47A1)],
    begin: Alignment.topLeft, end: Alignment.bottomRight,
  );
  static const LinearGradient blackEliteGradient = LinearGradient(
    colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
    begin: Alignment.topLeft, end: Alignment.bottomRight,
  );
  static const LinearGradient successGradient = LinearGradient(
    colors: [Color(0xFF10B981), Color(0xFF059669)],
    begin: Alignment.topLeft, end: Alignment.bottomRight,
  );

  // ── LIGHT THEME ───────────────────────────────────────────────────────────
  static ThemeData get lightTheme => ThemeData(
    brightness: Brightness.light,
    primaryColor: electricBlue,
    scaffoldBackgroundColor: bgPrimaryLight,
    cardColor: bgSecondaryLight,
    useMaterial3: true,
    colorScheme: const ColorScheme.light(
      primary: electricBlue,
      secondary: turquoise,
      surface: bgSecondaryLight,
      onSurface: textPrimaryLight,
      error: coralRed,
    ),
    textTheme: GoogleFonts.poppinsTextTheme(ThemeData.light().textTheme),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
    ),
    pageTransitionsTheme: const PageTransitionsTheme(
      builders: <TargetPlatform, PageTransitionsBuilder>{
        TargetPlatform.android: CupertinoPageTransitionsBuilder(),
        TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
      },
    ),
  );

  // ── DARK THEME ────────────────────────────────────────────────────────────
  static ThemeData get darkTheme => ThemeData(
    brightness: Brightness.dark,
    primaryColor: electricBlue,
    scaffoldBackgroundColor: bgPrimaryDark,
    cardColor: bgSecondaryDark,
    useMaterial3: true,
    colorScheme: const ColorScheme.dark(
      primary: electricBlue,
      secondary: turquoise,
      surface: bgSecondaryDark,
      onSurface: textPrimaryDark,
      error: coralRed,
    ),
    textTheme: GoogleFonts.poppinsTextTheme(ThemeData.dark().textTheme),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
    ),
    pageTransitionsTheme: const PageTransitionsTheme(
      builders: <TargetPlatform, PageTransitionsBuilder>{
        TargetPlatform.android: CupertinoPageTransitionsBuilder(),
        TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
      },
    ),
  );
}
