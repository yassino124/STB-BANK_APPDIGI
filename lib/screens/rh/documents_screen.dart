import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../viewmodels/rh_viewmodel.dart';
import '../../models/rh_models.dart';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import '../../services/auth_api_service.dart';

// ═══════════════════════════════════════════════════════════════════════════
//  DOCUMENTS SCREEN — MVVM + Premium UI
// ═══════════════════════════════════════════════════════════════════════════

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});
  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> with SingleTickerProviderStateMixin {
  int _selectedYear = DateTime.now().year;
  int? _expandedIndex;

  final Map<String, Map<String, dynamic>> _documentTypes = {
    'PAYSLIP': {'icon': Icons.receipt_long_rounded, 'color': 0xFF2962FF},
    'WORK_CERTIFICATE': {'icon': Icons.work_rounded, 'color': 0xFF8B5CF6},
    'SALARY_CERTIFICATE': {'icon': Icons.attach_money_rounded, 'color': 0xFF10B981},
    'TAX_DECLARATION': {'icon': Icons.account_balance_rounded, 'color': 0xFFF59E0B},
    'CNSS_DECLARATION': {'icon': Icons.health_and_safety_rounded, 'color': 0xFFEF4444},
    'CONTRACT': {'icon': Icons.description_rounded, 'color': 0xFF3B82F6},
    'ID_DOCUMENT': {'icon': Icons.badge_rounded, 'color': 0xFF6366F1},
    'OTHER': {'icon': Icons.insert_drive_file_rounded, 'color': 0xFF94A3B8},
  };

  @override
  void initState() {
    super.initState();
    _selectedYear = DateTime.now().year;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final vm = context.read<RhViewModel>();
      vm.loadPayrolls();
      vm.loadRhDocuments();
      vm.startPolling(payrolls: true, documents: true);
    });
  }

  Future<void> _downloadDoc(Map<String, dynamic> doc) async {
    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator()),
      );
      final fileUrl = doc['fileUrl'] ?? '';
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/${doc['fileName'] ?? 'document.pdf'}');

      if (fileUrl.startsWith('http')) {
        // ✅ Download from Cloudinary URL using http package (follows redirects)
        final token = await AuthApiService.getAccessToken() ?? '';
        final response = await http.get(
          Uri.parse(fileUrl),
          headers: {'Authorization': 'Bearer $token'},
        );
        if (response.statusCode == 200) {
          await file.writeAsBytes(response.bodyBytes);
        } else {
          throw Exception('Erreur HTTP: ${response.statusCode}');
        }
      } else if (fileUrl.contains(',')) {
        // Legacy base64
        final bytes = base64Decode(fileUrl.split(',').last);
        await file.writeAsBytes(bytes);
      } else {
        throw Exception('Format URL non supporté');
      }

      await AuthApiService.markDocumentAsRead(doc['_id']);
      if (mounted) Navigator.pop(context);
      await OpenFile.open(file.path);
      if (mounted) context.read<RhViewModel>().loadRhDocuments(silent: true);
    } catch (e) {
      if (mounted) Navigator.pop(context);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
    }
  }


  Future<void> _downloadFiche(PayrollDocument fiche) async {
    if (fiche.pdfUrl == null || fiche.pdfUrl!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Document non disponible')));
      return;
    }
    try {
      showDialog(context: context, barrierDismissible: false, builder: (_) => const Center(child: CircularProgressIndicator()));
      final pdfUrl = fiche.pdfUrl!;
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/Fiche_Paie_${fiche.mois}_${fiche.annee}.pdf');

      if (pdfUrl.startsWith('http')) {
        // ✅ Download from Cloudinary URL using http package (follows redirects)
        final token = await AuthApiService.getAccessToken() ?? '';
        final response = await http.get(
          Uri.parse(pdfUrl),
          headers: {'Authorization': 'Bearer $token'},
        );
        if (response.statusCode == 200) {
          await file.writeAsBytes(response.bodyBytes);
        } else {
          throw Exception('Erreur HTTP: ${response.statusCode}');
        }
      } else {
        // Legacy base64
        final bytes = base64Decode(pdfUrl.split(',').last);
        await file.writeAsBytes(bytes);
      }

      if (mounted) Navigator.pop(context);
      await OpenFile.open(file.path);

    } catch (e) {
      if (mounted) Navigator.pop(context);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
    }
  }

  @override
  void dispose() {
    context.read<RhViewModel>().stopPolling();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = context.watch<AppProvider>();
    final vm = context.watch<RhViewModel>();
    final dk = p.themeMode == ThemeMode.dark;
    final fg = Theme.of(context).colorScheme.onSurface;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.07) : Colors.black.withValues(alpha: 0.04);

    final allPayrolls = vm.payrolls;
    final yearsInData = allPayrolls
        .map((pay) => pay.annee)
        .where((y) => y > 0)
        .toSet()
        .toList()
        ..sort((a, b) => b.compareTo(a));
    final years = yearsInData.isNotEmpty ? yearsInData : [DateTime.now().year, DateTime.now().year - 1, DateTime.now().year - 2];
    
    final filteredPayrolls = allPayrolls
        .where((pay) => pay.annee == _selectedYear)
        .toList()
      ..sort((a, b) => b.mois.compareTo(a.mois));

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(fg, mt, cd, bd, dk),
            Expanded(
              child: CustomScrollView(
                physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                slivers: [
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
                    sliver: SliverList(delegate: SliverChildListDelegate([
                      _buildSummaryCard(fg, mt, dk, p, filteredPayrolls),
                      const SizedBox(height: 24),
                      _buildYearSelector(fg, mt, cd, bd, dk, years),
                      const SizedBox(height: 16),
                      Text('Fiches de Paie', style: GoogleFonts.outfit(color: fg, fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: -0.3)),
                      const SizedBox(height: 12),
                      
                      if (vm.payrollsLoading && allPayrolls.isEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          child: Center(child: Column(
                            children: [
                              const CircularProgressIndicator(),
                              const SizedBox(height: 12),
                              Text('Chargement des fiches...', style: TextStyle(color: mt, fontSize: 13)),
                            ],
                          )),
                        )
                      else if (filteredPayrolls.isEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          child: Center(child: Text(
                            'Aucune fiche pour $_selectedYear',
                            style: TextStyle(color: mt, fontSize: 13),
                          )),
                        )
                      else
                        ...filteredPayrolls.asMap().entries.map((e) => _buildFicheCard(e.key, e.value, fg, mt, cd, bd, dk)),
                        
                      const SizedBox(height: 24),
                      Text('Documents RH', style: GoogleFonts.outfit(color: fg, fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: -0.3)),
                      const SizedBox(height: 12),
                      
                      if (vm.rhDocsLoading && vm.rhDocuments.isEmpty)
                        const Padding(
                          padding: EdgeInsets.all(20),
                          child: Center(child: CircularProgressIndicator()),
                        )
                      else if (vm.rhDocuments.isEmpty)
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: Center(child: Text('Aucun document RH', style: TextStyle(color: mt, fontSize: 13))),
                        )
                      else
                        ...vm.rhDocuments.asMap().entries.map((e) => _buildDocCard(e.key, e.value, fg, mt, cd, bd, dk)),
                        
                      const SizedBox(height: 80),
                    ])),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(Color fg, Color mt, Color cd, Color bd, bool dk) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Row(
        children: [
          GestureDetector(
            onTap: () { HapticFeedback.lightImpact(); Navigator.pop(context); },
            child: Container(
              width: 44, height: 44,
              decoration: BoxDecoration(color: cd, shape: BoxShape.circle, border: Border.all(color: bd), boxShadow: AppTheme.cardShadow(dk)),
              child: Icon(Icons.arrow_back_rounded, color: fg, size: 20),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Mes Documents', style: GoogleFonts.outfit(color: fg, fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
                Text('Fiches de paie & attestations', style: GoogleFonts.inter(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          Consumer<RhViewModel>(builder: (_, vm, __) {
            final syncing = vm.payrollsLoading;
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: (syncing ? const Color(0xFFF59E0B) : const Color(0xFF10B981)).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: (syncing ? const Color(0xFFF59E0B) : const Color(0xFF10B981)).withValues(alpha: 0.3)),
              ),
              child: Row(children: [
                if (syncing)
                  const SizedBox(width: 10, height: 10, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFF59E0B)))
                else
                  Container(width: 6, height: 6,
                    decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle))
                      .animate(onPlay: (c) => c.repeat(reverse: true))
                      .scale(begin: const Offset(0.7, 0.7), end: const Offset(1.3, 1.3), duration: 900.ms),
                const SizedBox(width: 6),
                Text(syncing ? 'Sync...' : 'Synchronisé', 
                     style: GoogleFonts.inter(color: syncing ? const Color(0xFFF59E0B) : const Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.w800)),
              ]),
            );
          }),
        ],
      ).animate().fadeIn(),
    );
  }

  Widget _buildSummaryCard(Color fg, Color mt, bool dk, AppProvider p, List<PayrollDocument> fiches) {
    final name = '${p.userProfile?['prenom'] ?? 'Collaborateur'} ${p.userProfile?['nom'] ?? ''}'.trim();
    final poste = p.userProfile?['poste'] as String? ?? 'Collaborateur';
    final salaireBase = (p.userProfile?['salaireBase'] as num?)?.toDouble() ?? 0.0;
    
    final latestFiche = fiches.isNotEmpty ? fiches.first : null;
    final brut = latestFiche != null && latestFiche.salaireBrut > 0 ? latestFiche.salaireBrut : salaireBase;
    final net = latestFiche != null && latestFiche.salaireNet > 0 ? latestFiche.salaireNet : salaireBase * 0.75; // Approx net si la fiche est vide
    
    final netDisplay = net > 0 ? net.toStringAsFixed(3) : '0.000';
    final brutDisplay = brut > 0 ? brut.toStringAsFixed(3) : '0.000';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: LinearGradient(
          colors: dk
              ? [const Color(0xFF0B2447), const Color(0xFF19376D)]
              : [const Color(0xFF1565C0), const Color(0xFF2962FF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1), width: 1.5),
        boxShadow: [BoxShadow(color: const Color(0xFF2962FF).withValues(alpha: 0.3), blurRadius: 24, offset: const Offset(0, 10))],
      ),
      child: Stack(children: [
        Positioned(right: -30, bottom: -30, child: Container(
          width: 150, height: 150,
          decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withValues(alpha: 0.04)),
        )),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(14)),
              child: const Icon(Icons.person_rounded, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(name, style: GoogleFonts.outfit(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
                Text(poste, style: GoogleFonts.inter(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500)),
              ]),
            ),
          ]),
          const SizedBox(height: 20),
          Row(children: [
            Expanded(child: _summaryStatItem(_formatCompact(net), 'TND Net/mois', Colors.white)),
            Container(width: 1, height: 40, color: Colors.white.withValues(alpha: 0.2), margin: const EdgeInsets.symmetric(horizontal: 10)),
            Expanded(child: _summaryStatItem(_formatCompact(brut), 'TND Brut/mois', Colors.white70)),
            Container(width: 1, height: 40, color: Colors.white.withValues(alpha: 0.2), margin: const EdgeInsets.symmetric(horizontal: 10)),
            _summaryStatItem('${fiches.length}', 'Fiches', const Color(0xFF93C5FD)),
          ]),
        ]),
      ]),
    ).animate().fadeIn(delay: 80.ms).slideY(begin: 0.04);
  }

  String _formatCompact(double value) {
    if (value >= 1000000) return '${(value / 1000000).toStringAsFixed(1)}M';
    if (value >= 1000) return '${(value / 1000).toStringAsFixed(3)}';
    return value.toStringAsFixed(3);
  }

  Widget _summaryStatItem(String value, String label, Color c) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(value, style: GoogleFonts.outfit(color: c, fontSize: 17, fontWeight: FontWeight.w900, letterSpacing: -0.5), overflow: TextOverflow.ellipsis, maxLines: 1),
      const SizedBox(height: 2),
      Text(label, style: GoogleFonts.inter(color: c.withValues(alpha: 0.7), fontSize: 9, fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis, maxLines: 1),
    ]);
  }

  Widget _buildYearSelector(Color fg, Color mt, Color cd, Color bd, bool dk, List<int> years) {
    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: years.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (_, i) {
          final selected = years[i] == _selectedYear;
          return GestureDetector(
            onTap: () { HapticFeedback.selectionClick(); setState(() => _selectedYear = years[i]); },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeOutCubic,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 9),
              decoration: BoxDecoration(
                color: selected ? AppTheme.electricBlue : cd,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: selected ? AppTheme.electricBlue : bd, width: selected ? 0 : 1),
                boxShadow: selected ? [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 4))] : null,
              ),
              child: Text(
                '${years[i]}',
                style: GoogleFonts.outfit(
                  color: selected ? Colors.white : mt,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFicheCard(int index, PayrollDocument fiche, Color fg, Color mt, Color cd, Color bd, bool dk) {
    final isExpanded = _expandedIndex == index;
    return GestureDetector(
      onTap: () { HapticFeedback.selectionClick(); setState(() => _expandedIndex = isExpanded ? null : index); },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeOutCubic,
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cd,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: isExpanded ? AppTheme.electricBlue.withValues(alpha: 0.4) : bd),
          boxShadow: isExpanded
              ? [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.12), blurRadius: 20, offset: const Offset(0, 6))]
              : AppTheme.cardShadow(dk),
        ),
        child: Column(children: [
          Row(children: [
            Container(
              width: 46, height: 46,
              decoration: BoxDecoration(
                color: AppTheme.electricBlue.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.electricBlue.withValues(alpha: 0.2)),
              ),
              child: const Icon(Icons.receipt_long_rounded, color: AppTheme.electricBlue, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('${fiche.moisLabel} ${fiche.annee}', style: GoogleFonts.outfit(color: fg, fontSize: 15, fontWeight: FontWeight.w800)),
              Text('Net: ${fiche.salaireNet > 0 ? fiche.salaireNet.toStringAsFixed(3) : (fiche.salaireBrut > 0 ? (fiche.salaireBrut * 0.75).toStringAsFixed(3) : '---')} TND', style: GoogleFonts.inter(color: const Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.w700)),
            ])),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('Disponible', style: GoogleFonts.inter(color: const Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.w700)),
            ),
            const SizedBox(width: 8),
            AnimatedRotation(
              duration: const Duration(milliseconds: 280),
              turns: isExpanded ? 0.5 : 0,
              child: Icon(Icons.expand_more_rounded, color: mt, size: 22),
            ),
          ]),
          AnimatedCrossFade(
            firstChild: const SizedBox.shrink(),
            secondChild: Padding(
              padding: const EdgeInsets.only(top: 16),
              child: Column(children: [
                Divider(color: bd, height: 1),
                const SizedBox(height: 14),
                _detailRow('Brut', '${fiche.salaireBrut > 0 ? fiche.salaireBrut.toStringAsFixed(3) : '---'} TND', fg, mt),
                _detailRow('CNSS', '${fiche.cotisations > 0 ? '-' + fiche.cotisations.toStringAsFixed(3) : '---'} TND', fg, const Color(0xFFEF4444)),
                _detailRow('Net', '${fiche.salaireNet > 0 ? fiche.salaireNet.toStringAsFixed(3) : (fiche.salaireBrut > 0 ? (fiche.salaireBrut * 0.75).toStringAsFixed(3) : '---')} TND', fg, const Color(0xFF10B981)),
                _detailRow('Date édition', '${DateTime(fiche.annee, fiche.mois + 1, 0).day}/${fiche.mois.toString().padLeft(2,'0')}/${fiche.annee}', fg, mt),
                const SizedBox(height: 14),
                Row(children: [
                  Expanded(child: _actionBtn('Télécharger', Icons.download_rounded, AppTheme.electricBlue, onTap: () => _downloadFiche(fiche))),
                  const SizedBox(width: 10),
                  Expanded(child: _actionBtn('Aperçu', Icons.visibility_rounded, const Color(0xFF8B5CF6), onTap: () => _downloadFiche(fiche))),
                ]),
              ]),
            ),
            crossFadeState: isExpanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 280),
          ),
        ]),
      ).animate().fadeIn(delay: (index * 60).ms).slideY(begin: 0.04),
    );
  }

  Widget _buildDocCard(int index, Map<String, dynamic> doc, Color fg, Color mt, Color cd, Color bd, bool dk) {
    final typeInfo = _documentTypes[doc['type']] ?? _documentTypes['OTHER']!;
    final color = Color(typeInfo['color']);
    final icon = typeInfo['icon'] as IconData;
    final isNew = !(doc['isRead'] ?? false);
    
    // Format date
    final dateStr = doc['createdAt'] != null ? doc['createdAt'].toString().substring(0, 10) : '';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: cd,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: bd),
        boxShadow: AppTheme.cardShadow(dk),
      ),
      child: Row(children: [
        Container(
          width: 44, height: 44,
          decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(14)),
          child: Icon(icon, color: color, size: 22),
        ),
        const SizedBox(width: 14),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(
            children: [
              Expanded(child: Text(doc['title'] ?? 'Document', style: GoogleFonts.outfit(color: fg, fontSize: 14, fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis)),
              if (isNew)
                Container(
                  margin: const EdgeInsets.only(left: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(6)),
                  child: const Text('Nouveau', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                ),
            ],
          ),
          Text('Ajouté le $dateStr • ${(doc['fileSize'] ?? 0) ~/ 1024} KB', style: GoogleFonts.inter(color: mt, fontSize: 11, fontWeight: FontWeight.w500)),
        ])),
        const SizedBox(width: 8),
        GestureDetector(
          onTap: () {
            HapticFeedback.lightImpact();
            _downloadDoc(doc);
          },
          child: Container(
            width: 36, height: 36,
            decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
            child: Icon(Icons.download_rounded, color: color, size: 18),
          ),
        ),
      ]),
    ).animate().fadeIn(delay: (index * 60 + 300).ms).slideX(begin: 0.05);
  }

  Widget _detailRow(String label, String value, Color fg, Color vc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: GoogleFonts.inter(color: fg.withValues(alpha: 0.55), fontSize: 13, fontWeight: FontWeight.w500)),
        Text(value, style: GoogleFonts.inter(color: vc, fontSize: 13, fontWeight: FontWeight.w700)),
      ]),
    );
  }

  Widget _actionBtn(String label, IconData icon, Color color, {VoidCallback? onTap}) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.mediumImpact();
        if (onTap != null) onTap();
      },
      child: Container(
        height: 42,
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.25)),
        ),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(icon, color: color, size: 16),
          const SizedBox(width: 6),
          Text(label, style: GoogleFonts.outfit(color: color, fontSize: 13, fontWeight: FontWeight.w700)),
        ]),
      ),
    );
  }
}
