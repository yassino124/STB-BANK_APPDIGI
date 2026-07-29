import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';

class SettingsLayout extends StatelessWidget {
  final String title;
  final Widget headerIcon;
  final List<Widget> children;
  final Widget? floatingActionButton;

  const SettingsLayout({
    super.key,
    required this.title,
    required this.headerIcon,
    required this.children,
    this.floatingActionButton,
  });

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<AppProvider>();
    final dk = prov.themeMode == ThemeMode.dark;

    final bg = dk ? const Color(0xFF0A101A) : const Color(0xFFF8FAFC);
    final textCol = dk ? Colors.white : const Color(0xFF1E293B);

    return Scaffold(
      backgroundColor: bg,
      floatingActionButton: floatingActionButton,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        systemOverlayStyle: dk ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textCol, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          title,
          style: TextStyle(
            color: textCol,
            fontSize: 16,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.5,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 10),
            // Floating Header Icon with Glow
            Hero(
              tag: 'setting_icon_$title',
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: bg,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: textCol.withValues(alpha: 0.05),
                      blurRadius: 20,
                      spreadRadius: 5,
                    ),
                    BoxShadow(
                      color: dk ? Colors.white.withValues(alpha: 0.02) : Colors.black.withValues(alpha: 0.02),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: headerIcon,
              ),
            ),
            const SizedBox(height: 32),
            ...children,
          ],
        ),
      ),
    );
  }
}
