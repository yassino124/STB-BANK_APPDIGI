import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../providers/app_provider.dart';
import '../../services/auth_api_service.dart';
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'dart:io';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:speech_to_text/speech_to_text.dart' as stt;

class AccountDetailScreen extends StatefulWidget {
  final Map<String, dynamic> account;
  const AccountDetailScreen({super.key, required this.account});

  @override
  State<AccountDetailScreen> createState() => _AccountDetailScreenState();
}

class _AccountDetailScreenState extends State<AccountDetailScreen>
    with TickerProviderStateMixin {
  final _searchCtrl = TextEditingController();
  String _query = '';
  String _typeFilter = 'Tout';
  String _periodFilter = 'Ce mois';
  bool _searchFocused = false;
  bool _isListening = false;
  late AnimationController _micAnim;
  final stt.SpeechToText _speech = stt.SpeechToText();
  
  // ✅ Dynamic data from backend
  List<Map<String, dynamic>> _allTx = [];
  bool _isLoading = true;
  bool _isDownloading = false;

  final _types = ['Tout', 'Crédit', 'Débit'];
  final _periods = ['Aujourd\'hui', 'Cette semaine', 'Ce mois', '3 mois', 'Année'];

  List<Map<String, dynamic>> get _filtered {
    return _allTx.where((t) {
      final amount = t['amount'] as double;
      final matchQuery = _query.isEmpty ||
          (t['desc'] as String).toLowerCase().contains(_query.toLowerCase()) ||
          (t['cat'] as String).toLowerCase().contains(_query.toLowerCase());
      final matchType = _typeFilter == 'Tout' ||
          (_typeFilter == 'Crédit' && amount > 0) ||
          (_typeFilter == 'Débit' && amount < 0);
      return matchQuery && matchType;
    }).toList();
  }

  double get _totalDebit => _filtered.where((t) => (t['amount'] as double) < 0).fold(0.0, (s, t) => s + (t['amount'] as double).abs());
  double get _totalCredit => _filtered.where((t) => (t['amount'] as double) > 0).fold(0.0, (s, t) => s + (t['amount'] as double));

  @override
  void initState() {
    super.initState();
    _micAnim = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _loadTransactions();
  }

  Future<void> _loadTransactions() async {
    setState(() => _isLoading = true);
    try {
      // Fetch transactions from API (employeeId is fetched internally)
      final res = await AuthApiService.getMyTransactions();
      if (res.isSuccess && res.data != null) {
        final List<dynamic> txData = res.data!; // ✅ data is already a List
        
        setState(() {
          _allTx = txData.map((t) {
            final amount = (t['montant'] as num?)?.toDouble() ?? 0.0;
            final sens = t['sens'] as String? ?? '';
            final type = t['type'] as String? ?? '';
            
            // Determine amount sign based on sens
            double finalAmount = amount;
            if (sens == 'DEBIT') {
              finalAmount = -amount.abs();
            } else if (sens == 'CREDIT') {
              finalAmount = amount.abs();
            }
            
            // Format dates
            final date = DateTime.tryParse(t['date'] ?? '') ?? DateTime.now();
            final dateStr = '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
            
            // Map category
            String category = 'Autre';
            if (type.contains('TRANSFER') || type.contains('VIREMENT')) {
              category = 'Virement';
            } else if (type.contains('SALARY') || type.contains('SALAIRE')) {
              category = 'Salaire';
            } else if (type.contains('CREDIT_PAYMENT')) {
              category = 'Crédit';
            } else if (type.contains('AVANCE')) {
              category = 'Avance';
            } else if (type.contains('CONGE')) {
              category = 'Congé';
            }
            
            return {
              'desc': (t['description'] as String?) ?? 'Transaction',
              'dateOp': dateStr,
              'dateVal': dateStr,
              'amount': finalAmount,
              'cat': category,
            };
          }).toList();
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      debugPrint('Error loading transactions: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _micAnim.dispose();
    super.dispose();
  }

  Future<void> _downloadExtrait() async {
    setState(() => _isDownloading = true);
    HapticFeedback.mediumImpact();

    try {
      final p = context.read<AppProvider>();
      final pdf = pw.Document();
      
      // Get account and user info
      final acc = widget.account;
      final userName = "${p.userProfile?['prenom'] ?? ''} ${p.userProfile?['nom'] ?? 'User'}".trim();
      final accountType = acc['type'] as String? ?? 'Compte Courant';
      final balance = acc['balance'] as String? ?? '0.00';
      final iban = acc['number'] as String? ?? '';
      
      pdf.addPage(
        pw.Page(
          build: (context) => pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              // Header
              pw.Container(
                padding: const pw.EdgeInsets.all(20),
                decoration: pw.BoxDecoration(
                  color: PdfColors.blue900,
                  borderRadius: const pw.BorderRadius.all(pw.Radius.circular(10)),
                ),
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text(
                      'STB Mobile',
                      style: pw.TextStyle(
                        fontSize: 24,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColors.white,
                      ),
                    ),
                    pw.SizedBox(height: 10),
                    pw.Text(
                      'Extrait de Compte',
                      style: const pw.TextStyle(
                        fontSize: 16,
                        color: PdfColors.white,
                      ),
                    ),
                  ],
                ),
              ),
              pw.SizedBox(height: 20),
              
              // Account Info
              pw.Container(
                padding: const pw.EdgeInsets.all(15),
                decoration: pw.BoxDecoration(
                  border: pw.Border.all(color: PdfColors.grey300),
                  borderRadius: const pw.BorderRadius.all(pw.Radius.circular(8)),
                ),
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Row(
                      mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                      children: [
                        pw.Text('Titulaire:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.Text(userName),
                      ],
                    ),
                    pw.SizedBox(height: 8),
                    pw.Row(
                      mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                      children: [
                        pw.Text('Type de compte:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.Text(accountType),
                      ],
                    ),
                    pw.SizedBox(height: 8),
                    pw.Row(
                      mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                      children: [
                        pw.Text('IBAN:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.Text(iban),
                      ],
                    ),
                    pw.SizedBox(height: 8),
                    pw.Row(
                      mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                      children: [
                        pw.Text('Solde disponible:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 14)),
                        pw.Text('$balance TND', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 14, color: PdfColors.green700)),
                      ],
                    ),
                  ],
                ),
              ),
              pw.SizedBox(height: 20),
              
              // Transactions Table
              pw.Text(
                'Opérations',
                style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold),
              ),
              pw.SizedBox(height: 10),
              pw.Table.fromTextArray(
                headers: ['Date', 'Description', 'Catégorie', 'Montant'],
                data: _filtered.map((t) => [
                  t['dateOp'],
                  t['desc'],
                  t['cat'],
                  '${(t['amount'] as double).toStringAsFixed(3)} TND',
                ]).toList(),
                headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold),
                headerDecoration: const pw.BoxDecoration(color: PdfColors.grey300),
                cellHeight: 30,
                cellAlignments: {
                  0: pw.Alignment.centerLeft,
                  1: pw.Alignment.centerLeft,
                  2: pw.Alignment.center,
                  3: pw.Alignment.centerRight,
                },
              ),
              pw.SizedBox(height: 20),
              
              // Summary
              pw.Container(
                padding: const pw.EdgeInsets.all(15),
                decoration: pw.BoxDecoration(
                  color: PdfColors.grey100,
                  borderRadius: const pw.BorderRadius.all(pw.Radius.circular(8)),
                ),
                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceAround,
                  children: [
                    pw.Column(
                      children: [
                        pw.Text('Total Débits', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.SizedBox(height: 5),
                        pw.Text('-${_totalDebit.toStringAsFixed(3)} TND', style: const pw.TextStyle(color: PdfColors.red)),
                      ],
                    ),
                    pw.Column(
                      children: [
                        pw.Text('Total Crédits', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.SizedBox(height: 5),
                        pw.Text('+${_totalCredit.toStringAsFixed(3)} TND', style: const pw.TextStyle(color: PdfColors.green)),
                      ],
                    ),
                    pw.Column(
                      children: [
                        pw.Text('Opérations', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.SizedBox(height: 5),
                        pw.Text('${_filtered.length} txn'),
                      ],
                    ),
                  ],
                ),
              ),
              
              pw.Spacer(),
              
              // Footer
              pw.Center(
                child: pw.Text(
                  'Document généré le ${DateTime.now().day.toString().padLeft(2, '0')}/${DateTime.now().month.toString().padLeft(2, '0')}/${DateTime.now().year} à ${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
                  style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey),
                ),
              ),
            ],
          ),
        ),
      );

      // Save PDF
      final output = await getApplicationDocumentsDirectory();
      final file = File('${output.path}/extrait_compte_${DateTime.now().millisecondsSinceEpoch}.pdf');
      await file.writeAsBytes(await pdf.save());
      
      setState(() => _isDownloading = false);
      
      // Show success and open PDF
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('✅ Extrait téléchargé avec succès!'),
            backgroundColor: AppTheme.emerald,
            action: SnackBarAction(
              label: 'Ouvrir',
              textColor: Colors.white,
              onPressed: () => OpenFile.open(file.path),
            ),
          ),
        );
        
        // Auto-open PDF
        await OpenFile.open(file.path);
      }
    } catch (e) {
      debugPrint('Error generating PDF: $e');
      setState(() => _isDownloading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('❌ Erreur lors de la génération du PDF'),
            backgroundColor: AppTheme.coralRed,
          ),
        );
      }
    }
  }

  void _toggleVoice() async {
    HapticFeedback.mediumImpact();
    
    if (!_isListening) {
      bool available = await _speech.initialize(
        onStatus: (status) {
          if (status == 'done' || status == 'notListening') {
            if (mounted) {
              setState(() => _isListening = false);
              _micAnim.stop();
              _micAnim.reset();
            }
          }
        },
        onError: (error) {
          if (mounted) {
            setState(() => _isListening = false);
            _micAnim.stop();
            _micAnim.reset();
          }
        },
      );
      
      if (available) {
        setState(() => _isListening = true);
        _micAnim.repeat(reverse: true);
        
        _speech.listen(
          onResult: (val) {
            setState(() {
              _searchCtrl.text = val.recognizedWords;
              _query = val.recognizedWords;
            });
          },
          localeId: 'fr_FR',
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text("Le microphone n'est pas accessible."),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    } else {
      setState(() => _isListening = false);
      _micAnim.stop();
      _micAnim.reset();
      _speech.stop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final dk = Theme.of(context).brightness == Brightness.dark;
    final fg = dk ? Colors.white : const Color(0xFF0F172A);
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = dk ? const Color(0xFF0E1827) : Colors.white;
    final bd = dk ? Colors.white.withValues(alpha: 0.07) : Colors.black.withValues(alpha: 0.04);
    final bg = dk ? const Color(0xFF060D1A) : const Color(0xFFF4F7FB);
    final acc = widget.account;
    
    // ✅ FIX: Provide default gradient if not in account data
    final List<Color> grad = (acc['gradient'] as List<Color>?) ?? [AppTheme.royalBlue, AppTheme.electricBlue];

    return Scaffold(
      backgroundColor: bg,
      body: Column(
        children: [
          // ── HERO HEADER ────────────────────────────────────────────────────
          _buildHero(acc, grad, mt, dk),
          // ── SEARCH + FILTERS ──────────────────────────────────────────────
          _buildSearchBar(cd, bd, mt, fg, dk),
          _buildTypeFilters(cd, bd, mt, dk),
          // ── STATS ROW ─────────────────────────────────────────────────────
          _buildStats(cd, bd, mt, dk),
          // ── LIST ──────────────────────────────────────────────────────────
          Expanded(child: _buildList(fg, mt, cd, bd, dk)),
        ],
      ),
    );
  }

  Widget _buildHero(Map<String, dynamic> acc, List<Color> grad, Color mt, bool dk) {
    final p = Provider.of<AppProvider>(context, listen: false);
    final userName = "${p.userProfile?['prenom'] ?? ''} ${p.userProfile?['nom'] ?? 'User'}".trim().toUpperCase();
    final balance = acc['balance'] as String;
    final currency = acc['currency'] as String;
    final type = acc['type'] as String;
    final number = acc['number'] as String;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: grad, begin: Alignment.topLeft, end: Alignment.bottomRight),
      ),
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () { HapticFeedback.lightImpact(); Navigator.pop(context); },
                    child: Container(
                      width: 42, height: 42,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                      ),
                      child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                    ),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: _isDownloading ? null : _downloadExtrait,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: _isDownloading ? 0.08 : 0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                      ),
                      child: Row(children: [
                        if (_isDownloading)
                          const SizedBox(
                            width: 14, height: 14,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        else
                          const Icon(Icons.download_rounded, color: Colors.white, size: 14),
                        const SizedBox(width: 6),
                        Text(
                          _isDownloading ? "Génération..." : "Extrait",
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                        ),
                      ]),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            // Big Account Card
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(userName, style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1)),
                          const SizedBox(height: 2),
                          Text(type, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800)),
                        ]),
                        Container(
                          width: 44, height: 44,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Center(
                            child: Text(
                              type.substring(0, 1),
                              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text("$balance $currency",
                      style: const TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w900, letterSpacing: -1)),
                    const SizedBox(height: 4),
                    Text("solde disponible", style: TextStyle(color: Colors.white.withValues(alpha: 0.55), fontSize: 11, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 10),
                    Text(number, style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 11, fontFamily: 'monospace', letterSpacing: 1.5)),
                  ],
                ),
              ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.05),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar(Color cd, Color bd, Color mt, Color fg, bool dk) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      child: Focus(
        onFocusChange: (f) => setState(() => _searchFocused = f),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: cd,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: _searchFocused ? AppTheme.electricBlue.withValues(alpha: 0.6) : bd,
              width: _searchFocused ? 1.5 : 1,
            ),
            boxShadow: _searchFocused
                ? [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.12), blurRadius: 12, offset: const Offset(0, 4))]
                : [],
          ),
          child: Row(children: [
            Icon(Icons.search_rounded, color: _searchFocused ? AppTheme.electricBlue : mt, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                controller: _searchCtrl,
                onChanged: (v) => setState(() => _query = v),
                style: TextStyle(color: fg, fontSize: 14, fontWeight: FontWeight.w600),
                decoration: InputDecoration(
                  hintText: 'Rechercher une transaction...',
                  hintStyle: TextStyle(color: mt, fontSize: 13),
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ),
            if (_query.isNotEmpty)
              GestureDetector(
                onTap: () { _searchCtrl.clear(); setState(() => _query = ''); },
                child: Icon(Icons.close_rounded, color: mt, size: 18),
              ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: _toggleVoice,
              child: AnimatedBuilder(
                animation: _micAnim,
                builder: (_, __) => Container(
                  width: 36, height: 36,
                  decoration: BoxDecoration(
                    color: _isListening
                        ? AppTheme.electricBlue.withValues(alpha: 0.1 + 0.15 * _micAnim.value)
                        : AppTheme.electricBlue.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: _isListening
                          ? AppTheme.electricBlue.withValues(alpha: 0.5 + 0.5 * _micAnim.value)
                          : AppTheme.electricBlue.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Icon(
                    _isListening ? Icons.graphic_eq_rounded : Icons.mic_rounded,
                    color: AppTheme.electricBlue,
                    size: 18,
                  ),
                ),
              ),
            ),
          ]),
        ),
      ),
    );
  }

  Widget _buildTypeFilters(Color cd, Color bd, Color mt, bool dk) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 10, 0, 0),
      child: SizedBox(
        height: 36,
        child: ListView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          children: [
            ..._types.map((t) {
              final sel = _typeFilter == t;
              return GestureDetector(
                onTap: () { HapticFeedback.selectionClick(); setState(() => _typeFilter = t); },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  decoration: BoxDecoration(
                    gradient: sel ? const LinearGradient(colors: [AppTheme.electricBlue, AppTheme.royalBlue]) : null,
                    color: sel ? null : cd,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: sel ? Colors.transparent : bd),
                    boxShadow: sel ? AppTheme.primaryShadow : [],
                  ),
                  child: Text(t, style: TextStyle(color: sel ? Colors.white : mt, fontSize: 12, fontWeight: FontWeight.w700)),
                ),
              );
            }),
            ..._periods.map((p) {
              final sel = _periodFilter == p;
              return GestureDetector(
                onTap: () { HapticFeedback.selectionClick(); setState(() => _periodFilter = p); },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: sel ? AppTheme.electricBlue.withValues(alpha: 0.1) : cd,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: sel ? AppTheme.electricBlue.withValues(alpha: 0.5) : bd),
                  ),
                  child: Text(p, style: TextStyle(color: sel ? AppTheme.electricBlue : mt, fontSize: 12, fontWeight: FontWeight.w700)),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildStats(Color cd, Color bd, Color mt, bool dk) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
      child: Row(children: [
        Expanded(child: _statCard("Total Débits", "-${_totalDebit.toStringAsFixed(3)} TND", AppTheme.coralRed, Icons.arrow_upward_rounded, cd, bd, dk)),
        const SizedBox(width: 10),
        Expanded(child: _statCard("Total Crédits", "+${_totalCredit.toStringAsFixed(3)} TND", AppTheme.emerald, Icons.arrow_downward_rounded, cd, bd, dk)),
        const SizedBox(width: 10),
        Expanded(child: _statCard("Opérations", "${_filtered.length} txn", AppTheme.electricBlue, Icons.receipt_long_rounded, cd, bd, dk)),
      ]),
    );
  }

  Widget _statCard(String label, String value, Color color, IconData icon, Color cd, Color bd, bool dk) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cd,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: bd),
        boxShadow: AppTheme.cardShadow(dk),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, color: color, size: 14),
        const SizedBox(height: 6),
        Text(value, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w900), maxLines: 1, overflow: TextOverflow.ellipsis),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(color: color.withValues(alpha: 0.6), fontSize: 9, fontWeight: FontWeight.w600)),
      ]),
    );
  }

  Widget _buildList(Color fg, Color mt, Color cd, Color bd, bool dk) {
    if (_isLoading) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(color: AppTheme.electricBlue),
            const SizedBox(height: 16),
            Text("Chargement des transactions...", style: TextStyle(color: mt, fontSize: 14, fontWeight: FontWeight.w600)),
          ],
        ),
      );
    }
    
    final list = _filtered;
    if (list.isEmpty) {
      return Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.search_off_rounded, color: mt.withValues(alpha: 0.4), size: 52),
          const SizedBox(height: 12),
          Text("Aucune transaction trouvée", style: TextStyle(color: mt, fontSize: 15, fontWeight: FontWeight.w600)),
        ]),
      );
    }
    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
      itemCount: list.length,
      itemBuilder: (_, i) => _txItem(list[i], fg, mt, cd, bd, dk, i),
    );
  }

  Widget _txItem(Map<String, dynamic> t, Color fg, Color mt, Color cd, Color bd, bool dk, int index) {
    final amount = t['amount'] as double;
    final isCredit = amount > 0;
    final color = isCredit ? AppTheme.emerald : AppTheme.coralRed;

    final catIcons = {
      'Virement': Icons.swap_horiz_rounded,
      'Salaire': Icons.payments_rounded,
      'Carte': Icons.credit_card_rounded,
      'Crédit': Icons.account_balance_rounded,
      'Prime': Icons.star_rounded,
      'Facture': Icons.receipt_rounded,
      'Achat': Icons.shopping_bag_rounded,
      'DAB': Icons.local_atm_rounded,
      'Epargne': Icons.savings_rounded,
    };
    final icon = catIcons[t['cat']] ?? Icons.more_horiz_rounded;

    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        _showDetail(context, t, fg, mt, cd, bd, dk, color, icon);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cd,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: bd),
          boxShadow: AppTheme.cardShadow(dk),
        ),
        child: Row(children: [
          Container(
            width: 46, height: 46,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: color.withValues(alpha: 0.2)),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(t['desc'] as String,
              style: TextStyle(color: fg, fontSize: 12, fontWeight: FontWeight.w700),
              maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 4),
            Row(children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(t['cat'] as String, style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.w800)),
              ),
              const SizedBox(width: 6),
              Text("Op: ${t['dateOp']}", style: TextStyle(color: mt, fontSize: 10)),
            ]),
          ])),
          const SizedBox(width: 10),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text(
              "${isCredit ? '+' : ''}${amount.toStringAsFixed(3)}",
              style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w900),
            ),
            Text("TND", style: TextStyle(color: color.withValues(alpha: 0.6), fontSize: 9, fontWeight: FontWeight.w700)),
          ]),
        ]),
      ).animate().fadeIn(delay: (index * 40).ms).slideY(begin: 0.04),
    );
  }

  void _showDetail(BuildContext ctx, Map<String, dynamic> t, Color fg, Color mt, Color cd, Color bd, bool dk, Color color, IconData icon) {
    final amount = t['amount'] as double;
    final isCredit = amount > 0;
    showModalBottomSheet(
      context: ctx,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => Container(
        decoration: BoxDecoration(color: cd, borderRadius: const BorderRadius.vertical(top: Radius.circular(32))),
        padding: EdgeInsets.fromLTRB(24, 12, 24, MediaQuery.of(ctx).padding.bottom + 32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 40, height: 4, margin: const EdgeInsets.only(bottom: 24),
            decoration: BoxDecoration(color: mt.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2))),
          Container(
            width: 64, height: 64,
            decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(20),
              border: Border.all(color: color.withValues(alpha: 0.3)),
              boxShadow: [BoxShadow(color: color.withValues(alpha: 0.2), blurRadius: 16, offset: const Offset(0, 6))]),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 16),
          Text(t['desc'] as String, style: TextStyle(color: fg, fontSize: 16, fontWeight: FontWeight.w800), textAlign: TextAlign.center),
          const SizedBox(height: 6),
          Text(t['cat'] as String, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w700)),
          const SizedBox(height: 20),
          Text("${isCredit ? '+' : ''}${amount.toStringAsFixed(3)} TND",
            style: TextStyle(color: color, fontSize: 34, fontWeight: FontWeight.w900, letterSpacing: -1)),
          const SizedBox(height: 24),
          _detailRow("Date Opération", t['dateOp'] as String, fg, mt),
          const SizedBox(height: 12),
          _detailRow("Date Valeur", t['dateVal'] as String, fg, mt),
          const SizedBox(height: 12),
          _detailRow("Type", isCredit ? "Crédit" : "Débit", color, mt),
          const SizedBox(height: 12),
          _detailRow("Statut", "✓ Exécuté", AppTheme.emerald, mt),
          const SizedBox(height: 28),
          Row(children: [
            Expanded(child: OutlinedButton.icon(
              onPressed: () { HapticFeedback.lightImpact(); },
              style: OutlinedButton.styleFrom(side: BorderSide(color: AppTheme.electricBlue.withValues(alpha: 0.4)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                padding: const EdgeInsets.symmetric(vertical: 14)),
              icon: const Icon(Icons.download_rounded, color: AppTheme.electricBlue, size: 18),
              label: const Text('Reçu', style: TextStyle(color: AppTheme.electricBlue, fontWeight: FontWeight.w700)),
            )),
            const SizedBox(width: 12),
            Expanded(child: ElevatedButton(
              onPressed: () => Navigator.pop(ctx),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)), padding: EdgeInsets.zero),
              child: Ink(
                decoration: BoxDecoration(gradient: AppTheme.primaryGradient, borderRadius: BorderRadius.circular(14)),
                child: const Padding(padding: EdgeInsets.symmetric(vertical: 14),
                  child: Center(child: Text('Fermer', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)))),
              ),
            )),
          ]),
        ]),
      ),
    );
  }

  Widget _detailRow(String label, String value, Color valColor, Color mt) => Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Text(label, style: TextStyle(color: mt, fontSize: 13, fontWeight: FontWeight.w500)),
      Text(value, style: TextStyle(color: valColor, fontSize: 13, fontWeight: FontWeight.w800)),
    ],
  );
}
