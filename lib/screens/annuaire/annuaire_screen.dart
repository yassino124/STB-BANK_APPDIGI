import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_api_service.dart';
import 'employee_profile_screen.dart';
import 'dart:convert';

class AnnuaireScreen extends StatefulWidget {
  const AnnuaireScreen({super.key});
  @override
  State<AnnuaireScreen> createState() => _AnnuaireScreenState();
}

class _AnnuaireScreenState extends State<AnnuaireScreen> {
  final _searchCtrl = TextEditingController();
  String _searchQuery = '';
  String _filterDir = 'Tous';
  bool _searchFocused = false;
  bool _isListening = false;
  bool _isLoading = true;

  final _directions = ['Tous', 'Dév. Digital', 'Finance', 'RH', 'Opérations', 'SI'];

  List<Map<String, dynamic>> _employees = [];

  // Helper to decode base64 avatar
  ImageProvider? _getAvatarImageProvider(String? avatarUrl) {
    if (avatarUrl == null || avatarUrl.isEmpty) return null;
    
    try {
      if (avatarUrl.startsWith('data:image')) {
        final base64String = avatarUrl.split(',')[1];
        final bytes = base64Decode(base64String);
        return MemoryImage(bytes);
      } else {
        return NetworkImage(avatarUrl);
      }
    } catch (e) {
      print('Error loading avatar: $e');
      return null;
    }
  }

  @override
  void initState() {
    super.initState();
    _fetchEmployees();
  }

  Future<void> _fetchEmployees() async {
    try {
      final res = await AuthApiService.searchDirectory('');
      if (res.isSuccess && res.data != null) {
        if (mounted) {
          setState(() {
            _employees = (res.data as List).map((e) => e as Map<String, dynamic>).toList();
            _isLoading = false;
          });
        }
      } else {
        if (mounted) setState(() => _isLoading = false);
      }
    } catch (e) {
      debugPrint("Error fetching directory: $e");
      if (mounted) setState(() => _isLoading = false);
    }
  }


  List<Map<String, dynamic>> get _filtered {
    return _employees.where((e) {
      final nom = (e['nom'] as String?)?.toLowerCase() ?? '';
      final prenom = (e['prenom'] as String?)?.toLowerCase() ?? '';
      final matricule = (e['matricule'] as String?)?.toLowerCase() ?? '';
      final poste = (e['poste'] as String?)?.toLowerCase() ?? '';
      final departement = (e['departement'] as String?) ?? 'Autre';
      
      final fullName = '$prenom $nom'.trim();
      
      final matchQuery = _searchQuery.isEmpty ||
          fullName.contains(_searchQuery.toLowerCase()) ||
          matricule.contains(_searchQuery.toLowerCase()) ||
          poste.contains(_searchQuery.toLowerCase());
          
      final matchDir = _filterDir == 'Tous' || departement == _filterDir;
      return matchQuery && matchDir;
    }).toList();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onVoiceSearch() {
    HapticFeedback.heavyImpact();
    setState(() => _isListening = !_isListening);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(children: [
          const Icon(Icons.mic_rounded, color: Colors.white),
          const SizedBox(width: 12),
          Text(_isListening ? "Écoute en cours (IA STB)..." : "Écoute terminée",
              style: const TextStyle(fontWeight: FontWeight.w700)),
        ]),
        backgroundColor: AppTheme.electricBlue,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
      ),
    );
    if (_isListening) {
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) setState(() => _isListening = false);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final fg = Theme.of(context).colorScheme.onSurface;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.07) : Colors.black.withValues(alpha: 0.04);
    final bg = Theme.of(context).scaffoldBackgroundColor;

    return Scaffold(
      backgroundColor: bg,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Gradient Header ──
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: dk
                    ? [const Color(0xFF0A1628), const Color(0xFF0D1F40)]
                    : [const Color(0xFF0D47A1), const Color(0xFF0A3D91)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        GestureDetector(
                          onTap: () {
                            HapticFeedback.lightImpact();
                            context.findRootAncestorStateOfType<ScaffoldState>()?.openDrawer();
                          },
                          child: Container(
                            width: 44, height: 44,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                            ),
                            child: const Icon(Icons.menu_rounded, color: Colors.white, size: 22),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text("Annuaire STB", style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
                              Text("${_employees.length} collaborateurs actifs", style: TextStyle(color: Colors.white.withValues(alpha: 0.65), fontSize: 12, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: AppTheme.emerald.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.4)),
                          ),
                          child: const Row(children: [
                            Icon(Icons.circle, color: AppTheme.emerald, size: 7),
                            SizedBox(width: 5),
                            Text("En ligne", style: TextStyle(color: AppTheme.emerald, fontSize: 10, fontWeight: FontWeight.w700)),
                          ]),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Search Bar with voice
                    Focus(
                      onFocusChange: (f) => setState(() => _searchFocused = f),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        height: 52,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: _searchFocused ? 0.22 : 0.14),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: Colors.white.withValues(alpha: _searchFocused ? 0.5 : 0.2)),
                          boxShadow: _searchFocused ? [BoxShadow(color: Colors.white.withValues(alpha: 0.1), blurRadius: 12)] : [],
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.search_rounded, color: Colors.white.withValues(alpha: 0.8), size: 20),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextField(
                                controller: _searchCtrl,
                                onChanged: (v) => setState(() => _searchQuery = v),
                                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600),
                                decoration: InputDecoration(
                                  hintText: 'Nom, matricule, poste...',
                                  hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 13),
                                  border: InputBorder.none,
                                  isDense: true,
                                  contentPadding: EdgeInsets.zero,
                                ),
                              ),
                            ),
                            if (_searchQuery.isNotEmpty)
                              GestureDetector(
                                onTap: () { _searchCtrl.clear(); setState(() => _searchQuery = ''); },
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  margin: const EdgeInsets.only(right: 6),
                                  decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), shape: BoxShape.circle),
                                  child: Icon(Icons.close_rounded, color: Colors.white.withValues(alpha: 0.9), size: 14),
                                ),
                              ),
                            // Voice button inside search bar
                            GestureDetector(
                              onTap: _onVoiceSearch,
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 300),
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: _isListening
                                      ? Colors.red.withValues(alpha: 0.3)
                                      : Colors.white.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: _isListening ? Colors.red.withValues(alpha: 0.6) : Colors.transparent,
                                  ),
                                ),
                                child: Icon(
                                  _isListening ? Icons.mic_rounded : Icons.mic_none_rounded,
                                  color: _isListening ? Colors.red : Colors.white,
                                  size: 20,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ).animate().fadeIn(),
              ),
            ),
          ),

          // ── Direction Filter (WOW version) ──
          Container(
            color: dk ? const Color(0xFF060D1A) : const Color(0xFFF0F4FB),
            padding: const EdgeInsets.fromLTRB(0, 14, 0, 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(left: 20, bottom: 10),
                  child: Row(children: [
                    Icon(Icons.filter_list_rounded, color: mt, size: 14),
                    const SizedBox(width: 6),
                    Text("FILTRER PAR DIRECTION", style: TextStyle(color: mt, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
                  ]),
                ),
                SizedBox(
                  height: 38,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    children: _directions.map((dir) {
                      final sel = _filterDir == dir;
                      return GestureDetector(
                        onTap: () { HapticFeedback.selectionClick(); setState(() => _filterDir = dir); },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          curve: Curves.easeOutExpo,
                          margin: const EdgeInsets.only(right: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
                          decoration: BoxDecoration(
                            gradient: sel ? const LinearGradient(colors: [AppTheme.electricBlue, AppTheme.royalBlue]) : null,
                            color: sel ? null : (dk ? const Color(0xFF0E1827) : Colors.white),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: sel ? Colors.transparent : (dk ? const Color(0xFF1C2D44) : const Color(0xFFE2E8F0))),
                            boxShadow: sel ? [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.35), blurRadius: 10, offset: const Offset(0, 3))] : [],
                          ),
                          child: Text(dir, style: TextStyle(color: sel ? Colors.white : mt, fontSize: 12, fontWeight: FontWeight.w700)),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),

          // Results count
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 8),
            child: Text("${_filtered.length} résultat${_filtered.length != 1 ? 's' : ''}", style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
          ),

          // ── Employee List ──
          Expanded(
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator())
              : _filtered.isEmpty
                ? Center(
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      Icon(Icons.search_off_rounded, color: mt, size: 52),
                      const SizedBox(height: 12),
                      Text("Aucun résultat trouvé", style: TextStyle(color: mt, fontSize: 14, fontWeight: FontWeight.w600)),
                    ]),
                  )
                : ListView.builder(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                    itemCount: _filtered.length,
                    itemBuilder: (_, i) => _buildEmployeeCard(_filtered[i], fg, mt, cd, bd, dk, i),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmployeeCard(Map<String, dynamic> emp, Color fg, Color mt, Color cd, Color bd, bool dk, int index) {
    final avatarColor = AppTheme.electricBlue;
    final prenom = emp['prenom'] as String? ?? '';
    final nom = emp['nom'] as String? ?? '';
    final fullName = '$prenom $nom'.trim();
    final initials = fullName.isNotEmpty ? (prenom.isNotEmpty ? prenom[0] : '') + (nom.isNotEmpty ? nom[0] : '') : '?';
    final avatarUrl = emp['avatar'] as String?;
    final poste = emp['poste'] as String? ?? 'Employé';
    final departement = emp['departement'] as String? ?? 'STB Bank';
    final matricule = emp['matricule'] as String? ?? 'N/A';
    final salaire = (emp['salaireBase'] as num?)?.toDouble() ?? 0.0;

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        Navigator.push(
          context,
          PageRouteBuilder(
            pageBuilder: (_, __, ___) => EmployeeProfileScreen(employee: emp),
            transitionDuration: const Duration(milliseconds: 400),
            transitionsBuilder: (_, a, __, c) => FadeTransition(
              opacity: a,
              child: SlideTransition(
                position: Tween<Offset>(begin: const Offset(0, 0.04), end: Offset.zero)
                    .animate(CurvedAnimation(parent: a, curve: Curves.easeOutCubic)),
                child: c,
              ),
            ),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cd,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: bd),
          boxShadow: AppTheme.cardShadow(dk),
        ),
        child: Row(
          children: [
            // Avatar with initials or image
            Stack(children: [
              Container(
                width: 54, height: 54,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: (avatarUrl == null || avatarUrl.isEmpty)
                      ? LinearGradient(
                          colors: [avatarColor, avatarColor.withValues(alpha: 0.7)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        )
                      : null,
                  boxShadow: [BoxShadow(color: avatarColor.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 4))],
                  image: _getAvatarImageProvider(avatarUrl) != null
                      ? DecorationImage(
                          image: _getAvatarImageProvider(avatarUrl)!,
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                child: (avatarUrl == null || avatarUrl.isEmpty)
                    ? Center(
                        child: Text(
                          initials.toUpperCase(),
                          style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                        ),
                      )
                    : null,
              ),
              Positioned(
                bottom: 1, right: 1,
                child: Container(
                  width: 14, height: 14,
                  decoration: BoxDecoration(
                    color: AppTheme.emerald,
                    shape: BoxShape.circle,
                    border: Border.all(color: cd, width: 2),
                  ),
                ),
              ),
            ]),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(fullName, style: TextStyle(color: fg, fontSize: 15, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 3),
                  Text(poste, style: TextStyle(color: mt, fontSize: 11, fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 7),
                  Row(children: [
                    _chip(matricule, avatarColor),
                    const SizedBox(width: 6),
                    Flexible(child: _chip(departement, AppTheme.electricBlue)),
                  ]),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text("${salaire.toStringAsFixed(0)} TND", style: TextStyle(color: AppTheme.emerald, fontSize: 13, fontWeight: FontWeight.w800)),
                const SizedBox(height: 3),
                Text("Salaire", style: TextStyle(color: mt, fontSize: 9, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Icon(Icons.arrow_forward_ios_rounded, color: mt.withValues(alpha: 0.4), size: 14),
              ],
            ),
          ],
        ),
      ).animate().fadeIn(delay: (index * 50).ms).slideY(begin: 0.05),
    );
  }

  Widget _chip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
      child: Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w800), maxLines: 1, overflow: TextOverflow.ellipsis),
    );
  }
}
