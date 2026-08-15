import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import '../../services/auth_api_service.dart';
import '../../theme/app_theme.dart';


class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> with TickerProviderStateMixin {
  List<DocumentItem> _documents = [];
  bool _isLoading = true;
  String _selectedFilter = 'ALL';
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  final Map<String, String> _documentIcons = {
    // Old types (uploaded documents)
    'PAYSLIP': '💰',
    'WORK_CERTIFICATE': '💼',
    'SALARY_CERTIFICATE': '💵',
    'TAX_DECLARATION': '📊',
    'CNSS_DECLARATION': '🏥',
    'CONTRACT': '📝',
    'ID_DOCUMENT': '🆔',
    'OTHER': '📄',
    // Auto-generated document types
    'CONTRAT_CDI': '📋',
    'CONTRAT_CDD': '📋',
    'ATTESTATION_EMBAUCHE': '🎓',
    'ATTESTATION_TRAVAIL': '💼',
    'ATTESTATION_SALAIRE': '💵',
    'FICHE_PAIE': '💰',
    'AUTORISATION_CONGE': '🏖️',
    'DECISION_PRIME': '💎',
    'CONTRAT_CREDIT': '🏦',
    'AVENANT_CONTRAT': '📝',
    'DECISION_PROMOTION': '📈',
    'DECISION_MUTATION': '🔄',
  };

  final Map<String, String> _documentLabels = {
    // Old types
    'PAYSLIP': 'Fiche de Paie',
    'WORK_CERTIFICATE': 'Attestation de Travail',
    'SALARY_CERTIFICATE': 'Attestation de Salaire',
    'TAX_DECLARATION': 'Déclaration Fiscale',
    'CNSS_DECLARATION': 'Déclaration CNSS',
    'CONTRACT': 'Contrat',
    'ID_DOCUMENT': 'Pièce d\'Identité',
    'OTHER': 'Autre',
    // Auto-generated types
    'CONTRAT_CDI': 'Contrat CDI',
    'CONTRAT_CDD': 'Contrat CDD',
    'ATTESTATION_EMBAUCHE': 'Attestation Embauche',
    'ATTESTATION_TRAVAIL': 'Attestation Travail',
    'ATTESTATION_SALAIRE': 'Attestation Salaire',
    'FICHE_PAIE': 'Fiche de Paie',
    'AUTORISATION_CONGE': 'Autorisation Congé',
    'DECISION_PRIME': 'Décision Prime',
    'CONTRAT_CREDIT': 'Contrat Crédit',
    'AVENANT_CONTRAT': 'Avenant Contrat',
    'DECISION_PROMOTION': 'Décision Promotion',
    'DECISION_MUTATION': 'Décision Mutation',
  };

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    );
    _loadDocuments();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  Future<void> _loadDocuments() async {
    setState(() => _isLoading = true);
    try {
      final result = await AuthApiService.fetchMyDocuments();
      if (result.isSuccess && result.data != null) {
        final docs = (result.data as List<dynamic>)
            .map((e) => DocumentItem.fromJson(e as Map<String, dynamic>))
            .toList();
        setState(() {
          _documents = docs;
          _isLoading = false;
        });
        _fadeController.forward();
      } else {
        setState(() => _isLoading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(result.error ?? 'Erreur inconnue'), backgroundColor: Colors.red),
          );
        }
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  List<DocumentItem> get _filteredDocuments {
    if (_selectedFilter == 'ALL') return _documents;
    return _documents.where((d) => d.type == _selectedFilter).toList();
  }

  Map<String, int> get _documentStats {
    final stats = <String, int>{};
    for (var doc in _documents) {
      stats[doc.type] = (stats[doc.type] ?? 0) + 1;
    }
    return stats;
  }

  Future<void> _downloadDocument(DocumentItem doc) async {
    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(color: AppTheme.electricBlue),
        ),
      );

      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/${doc.fileName}');

      if (doc.fileUrl.startsWith('http')) {
        // ✅ Download from Cloudinary URL using http package (follows redirects)
        final token = await AuthApiService.getAccessToken() ?? '';
        final response = await http.get(
          Uri.parse(doc.fileUrl),
          headers: {'Authorization': 'Bearer $token'},
        );
        if (response.statusCode == 200) {
          await file.writeAsBytes(response.bodyBytes);
        } else {
          throw Exception('Erreur HTTP: ${response.statusCode}');
        }
      } else if (doc.fileUrl.contains(',')) {
        // Legacy base64
        final bytes = base64Decode(doc.fileUrl.split(',').last);
        await file.writeAsBytes(bytes);
      } else {
        throw Exception('Format URL non supporté');
      }

      await AuthApiService.markDocumentAsRead(doc.id);
      if (mounted) Navigator.pop(context);
      await OpenFile.open(file.path);
      _loadDocuments();
    } catch (e) {
      if (mounted) Navigator.pop(context);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur de téléchargement: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }


  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.bgPrimaryDark : AppTheme.bgPrimaryLight,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(isDark),
            _buildFilterChips(isDark),
            Expanded(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: AppTheme.electricBlue,
                      ),
                    )
                  : _filteredDocuments.isEmpty
                      ? _buildEmptyState(isDark)
                      : _buildDocumentsList(isDark),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(bool isDark) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isDark
              ? [const Color(0xFF0A1628), const Color(0xFF0D1F40)]
              : [const Color(0xFF0D47A1), const Color(0xFF0A3D91)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white.withOpacity(0.2)),
                  ),
                  child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: _loadDocuments,
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white.withOpacity(0.2)),
                  ),
                  child: const Icon(Icons.refresh_rounded, color: Colors.white, size: 20),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Text(
            '📄',
            style: TextStyle(fontSize: 48),
          ),
          const SizedBox(height: 12),
          const Text(
            'Mes Documents',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '${_documents.length} document${_documents.length > 1 ? 's' : ''}',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChips(bool isDark) {
    final allTypes = ['ALL', ..._documentStats.keys.toList()];
    
    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(vertical: 10),
      color: isDark ? const Color(0xFF060D1A) : const Color(0xFFF0F4FB),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        physics: const BouncingScrollPhysics(),
        itemCount: allTypes.length,
        itemBuilder: (context, index) {
          final type = allTypes[index];
          final isSelected = _selectedFilter == type;
          final count = type == 'ALL' ? _documents.length : (_documentStats[type] ?? 0);
          
          return Padding(
            padding: const EdgeInsets.only(right: 10),
            child: GestureDetector(
              onTap: () => setState(() => _selectedFilter = type),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  gradient: isSelected
                      ? const LinearGradient(
                          colors: [AppTheme.electricBlue, AppTheme.royalBlue],
                        )
                      : null,
                  color: isSelected ? null : (isDark ? const Color(0xFF0E1827) : Colors.white),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: isSelected
                        ? Colors.transparent
                        : (isDark ? const Color(0xFF1C2D44) : const Color(0xFFE2E8F0)),
                  ),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: AppTheme.electricBlue.withOpacity(0.35),
                            blurRadius: 10,
                            offset: const Offset(0, 3),
                          )
                        ]
                      : [],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      type == 'ALL' ? '📂' : (_documentIcons[type] ?? '📄'),
                      style: const TextStyle(fontSize: 16),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      type == 'ALL' ? 'Tous' : (_documentLabels[type] ?? type),
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: isSelected
                            ? Colors.white
                            : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? Colors.white.withOpacity(0.25)
                            : (isDark ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.06)),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '$count',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: isSelected
                              ? Colors.white
                              : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDocumentsList(bool isDark) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: RefreshIndicator(
        onRefresh: _loadDocuments,
        color: AppTheme.electricBlue,
        child: ListView.builder(
          padding: const EdgeInsets.all(20),
          itemCount: _filteredDocuments.length,
          itemBuilder: (context, index) {
            final doc = _filteredDocuments[index];
            return _buildDocumentCard(doc, isDark);
          },
        ),
      ),
    );
  }

  Widget _buildDocumentCard(DocumentItem doc, bool isDark) {
    final icon = _documentIcons[doc.type] ?? '📄';
    final label = _documentLabels[doc.type] ?? doc.type;
    final cardColor = isDark ? const Color(0xFF0E1827) : Colors.white;
    final borderColor = isDark ? const Color(0xFF1C2D44) : const Color(0xFFE2E8F0);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black.withOpacity(0.2) : Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(22),
          onTap: () => _downloadDocument(doc),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Row(
              children: [
                // Icon container
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppTheme.electricBlue, AppTheme.royalBlue],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.electricBlue.withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      icon,
                      style: const TextStyle(fontSize: 30),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                // Content
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              doc.title,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: isDark ? Colors.white : const Color(0xFF0F172A),
                                letterSpacing: -0.2,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (!doc.isRead) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppTheme.coralRed,
                                borderRadius: BorderRadius.circular(8),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppTheme.coralRed.withOpacity(0.3),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: const Text(
                                'Nouveau',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        label,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Icon(
                            Icons.insert_drive_file_outlined,
                            size: 13,
                            color: isDark ? const Color(0xFF475569) : const Color(0xFF94A3B8),
                          ),
                          const SizedBox(width: 4),
                          Flexible(
                            child: Text(
                              doc.fileName,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                                color: isDark ? const Color(0xFF475569) : const Color(0xFF94A3B8),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Icon(
                            Icons.calendar_today_outlined,
                            size: 13,
                            color: isDark ? const Color(0xFF475569) : const Color(0xFF94A3B8),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            doc.month != null ? '${doc.month}/${doc.year}' : '${doc.year}',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: isDark ? const Color(0xFF475569) : const Color(0xFF94A3B8),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            '${(doc.fileSize / 1024).toStringAsFixed(1)} KB',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: isDark ? const Color(0xFF475569) : const Color(0xFF94A3B8),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                // Download button
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.electricBlue.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: AppTheme.electricBlue.withOpacity(0.2),
                    ),
                  ),
                  child: const Icon(
                    Icons.download_rounded,
                    color: AppTheme.electricBlue,
                    size: 22,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text(
            '📭',
            style: TextStyle(fontSize: 80),
          ),
          const SizedBox(height: 20),
          Text(
            'Aucun document',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : AppTheme.textPrimaryLight,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _selectedFilter == 'ALL'
                ? 'Vos documents apparaîtront ici'
                : 'Aucun document de ce type',
            style: TextStyle(
              fontSize: 14,
              color: isDark ? Colors.white60 : Colors.black54,
            ),
          ),
        ],
      ),
    );
  }
}

class DocumentItem {
  final String id;
  final String title;
  final String type;
  final String fileName;
  final int fileSize;
  final String fileUrl;
  final int year;
  final int? month;
  final bool isRead;
  final DateTime createdAt;

  DocumentItem({
    required this.id,
    required this.title,
    required this.type,
    required this.fileName,
    required this.fileSize,
    required this.fileUrl,
    required this.year,
    this.month,
    required this.isRead,
    required this.createdAt,
  });

  factory DocumentItem.fromJson(Map<String, dynamic> json) {
    return DocumentItem(
      id: (json['_id'] ?? '').toString(),
      title: (json['title'] ?? 'Document sans titre').toString(),
      type: (json['type'] ?? 'OTHER').toString(),
      fileName: (json['fileName'] ?? 'document.pdf').toString(),
      fileSize: (json['fileSize'] as num?)?.toInt() ?? 0,
      fileUrl: (json['fileUrl'] ?? '').toString(),
      year: (json['year'] as num?)?.toInt() ?? DateTime.now().year,
      month: (json['month'] as num?)?.toInt(),
      isRead: json['isRead'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'].toString())
          : DateTime.now(),
    );
  }
}
