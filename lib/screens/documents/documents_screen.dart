import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:convert';
import 'dart:io';
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
    'PAYSLIP': '💰',
    'WORK_CERTIFICATE': '💼',
    'SALARY_CERTIFICATE': '💵',
    'TAX_DECLARATION': '📊',
    'CNSS_DECLARATION': '🏥',
    'CONTRACT': '📝',
    'ID_DOCUMENT': '🆔',
    'OTHER': '📄',
  };

  final Map<String, String> _documentLabels = {
    'PAYSLIP': 'Fiche de Paie',
    'WORK_CERTIFICATE': 'Attestation de Travail',
    'SALARY_CERTIFICATE': 'Attestation de Salaire',
    'TAX_DECLARATION': 'Déclaration Fiscale',
    'CNSS_DECLARATION': 'Déclaration CNSS',
    'CONTRACT': 'Contrat',
    'ID_DOCUMENT': 'Pièce d\'Identité',
    'OTHER': 'Autre',
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
      // Show loading
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(color: AppTheme.electricBlue),
        ),
      );

      // Decode base64
      final bytes = base64Decode(doc.fileUrl.split(',').last);
      
      // Get directory
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/${doc.fileName}');
      
      // Write file
      await file.writeAsBytes(bytes);

      // Mark as read
      await AuthApiService.markDocumentAsRead(doc.id);
      
      // Close loading
      if (mounted) Navigator.pop(context);

      // Open file
      await OpenFile.open(file.path);

      // Refresh list
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
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isDark
              ? [AppTheme.bgSecondaryDark, AppTheme.bgPrimaryDark]
              : [Colors.white, AppTheme.bgPrimaryLight],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              IconButton(
                icon: Icon(
                  Icons.arrow_back_ios,
                  color: isDark ? Colors.white : AppTheme.textPrimaryLight,
                ),
                onPressed: () => Navigator.pop(context),
              ),
              const SizedBox(width: 8),
              const Text(
                '📄',
                style: TextStyle(fontSize: 32),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Mes Documents',
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : AppTheme.textPrimaryLight,
                      ),
                    ),
                    Text(
                      '${_documents.length} document(s)',
                      style: TextStyle(
                        fontSize: 14,
                        color: isDark ? Colors.white60 : Colors.black54,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: Icon(
                  Icons.refresh,
                  color: AppTheme.electricBlue,
                ),
                onPressed: _loadDocuments,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChips(bool isDark) {
    final allTypes = ['ALL', ..._documentStats.keys.toList()];
    
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: allTypes.length,
        itemBuilder: (context, index) {
          final type = allTypes[index];
          final isSelected = _selectedFilter == type;
          final count = type == 'ALL' ? _documents.length : (_documentStats[type] ?? 0);
          
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              selected: isSelected,
              label: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    type == 'ALL' ? '📂' : (_documentIcons[type] ?? '📄'),
                    style: const TextStyle(fontSize: 16),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    type == 'ALL' ? 'Tous' : (_documentLabels[type] ?? type),
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: isSelected ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? Colors.white.withOpacity(0.3)
                          : (isDark ? Colors.white12 : Colors.black12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      '$count',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: isSelected ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                      ),
                    ),
                  ),
                ],
              ),
              selectedColor: AppTheme.electricBlue,
              backgroundColor: isDark ? AppTheme.bgSecondaryDark : Colors.white,
              checkmarkColor: Colors.white,
              onSelected: (selected) {
                setState(() => _selectedFilter = type);
              },
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

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isDark
              ? [AppTheme.bgSecondaryDark, AppTheme.bgSecondaryDark.withValues(alpha: 0.8)]
              : [Colors.white, Colors.white.withOpacity(0.9)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black26 : Colors.black12,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () => _downloadDocument(doc),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppTheme.electricBlue, AppTheme.violet],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Center(
                    child: Text(
                      icon,
                      style: const TextStyle(fontSize: 28),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
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
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white : AppTheme.textPrimaryLight,
                              ),
                            ),
                          ),
                          if (!doc.isRead)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.red,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Text(
                                'Nouveau',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        label,
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark ? Colors.white60 : Colors.black54,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(
                            Icons.insert_drive_file_outlined,
                            size: 14,
                            color: isDark ? Colors.white38 : Colors.black38,
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              doc.fileName,
                              style: TextStyle(
                                fontSize: 11,
                                color: isDark ? Colors.white38 : Colors.black38,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Icon(
                            Icons.calendar_today_outlined,
                            size: 14,
                            color: isDark ? Colors.white38 : Colors.black38,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            doc.month != null
                                ? '${doc.month}/${doc.year}'
                                : '${doc.year}',
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? Colors.white38 : Colors.black38,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            '${(doc.fileSize / 1024).toStringAsFixed(1)} KB',
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? Colors.white38 : Colors.black38,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppTheme.electricBlue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.download_rounded,
                    color: AppTheme.electricBlue,
                    size: 24,
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
      id: json['_id'],
      title: json['title'],
      type: json['type'],
      fileName: json['fileName'],
      fileSize: json['fileSize'],
      fileUrl: json['fileUrl'],
      year: json['year'],
      month: json['month'],
      isRead: json['isRead'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
